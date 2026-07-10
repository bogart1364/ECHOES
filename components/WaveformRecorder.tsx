"use client";

import { useEffect, useRef, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { buildStoryMintTransaction } from "@/lib/solana";
import { uploadAudio, uploadImage } from "@/lib/storage";
import { describeWalletError, FriendlyError } from "@/lib/walletErrors";
import { useToast } from "@/lib/ToastContext";

type Stage =
  | "idle"
  | "recording"
  | "review"
  | "cleaning"
  | "uploading-audio"
  | "uploading-image"
  | "minting"
  | "registering"
  | "done"
  | "error";

export default function WaveformRecorder() {
  const [stage, setStage] = useState<Stage>("idle");
  const [seconds, setSeconds] = useState(0);
  const [levels, setLevels] = useState<number[]>(Array(40).fill(6));
  const [title, setTitle] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [friendlyError, setFriendlyError] = useState<FriendlyError | null>(null);
  const [resultUri, setResultUri] = useState<string | null>(null);
  const [txSig, setTxSig] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordedBlobRef = useRef<Blob | null>(null);
  const mimeTypeRef = useRef<string>("audio/webm");

  function pickSupportedMimeType(): string {
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/mp4;codecs=mp4a.40.2",
      "audio/ogg;codecs=opus",
    ];
    for (const type of candidates) {
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported?.(type)) {
        return type;
      }
    }
    return ""; // let the browser pick its own default if none of the above match
  }

  const wallet = useWallet();
  const { connection } = useConnection();
  const { push } = useToast();

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  async function startRecording() {
    setFriendlyError(null);
    setResultUri(null);
    setTxSig(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // iOS WebKit (Safari and in-app browsers like Phantom's, which are
      // WebKit-based too) has a known bug where feeding the same live
      // MediaStream into both an AnalyserNode (for the waveform) and a
      // MediaRecorder at once can silently corrupt the recorded output.
      // Giving the analyser its own cloned track avoids that.
      const analyserStream = stream.clone();
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(analyserStream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(
        stream,
        pickSupportedMimeType() ? { mimeType: pickSupportedMimeType() } : undefined
      );
      mimeTypeRef.current = recorder.mimeType || "audio/webm";
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
        recordedBlobRef.current = blob;
        stream.getTracks().forEach((t) => t.stop());
        analyserStream.getTracks().forEach((t) => t.stop());

        if (blob.size < 800) {
          setFriendlyError({
            title: "That recording looks empty",
            steps: [
              "The audio file came out far too small to contain real sound.",
              "This can happen occasionally on some phone browsers — try recording again.",
            ],
            faucetHint: false,
          });
          setStage("idle");
          return;
        }

        setStage("review");
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setStage("recording");
      setSeconds(0);

      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      animateLevels();
    } catch (err) {
      setFriendlyError({
        title: "Couldn't access your microphone",
        steps: ["Check your browser's permission prompt (usually in the address bar) and allow microphone access, then try again."],
        faucetHint: false,
      });
      setStage("error");
    }
  }

  function animateLevels() {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteFrequencyData(data);
      const bucket = 40;
      const step = Math.floor(data.length / bucket);
      const next = Array.from({ length: bucket }, (_, i) => Math.max(6, data[i * step] / 3));
      setLevels(next);
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }

  async function cleanupWithElevenLabs() {
    if (!recordedBlobRef.current) return;
    setStage("cleaning");
    setFriendlyError(null);
    try {
      const form = new FormData();
      const ext = mimeTypeRef.current.includes("mp4") ? "mp4" : mimeTypeRef.current.includes("ogg") ? "ogg" : "webm";
      form.append("audio", recordedBlobRef.current, `recording.${ext}`);
      const res = await fetch("/api/elevenlabs/enhance", { method: "POST", body: form });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail.error || "AI cleanup failed");
      }
      const cleaned = await res.blob();
      recordedBlobRef.current = cleaned;
      push("Cleaned up with ElevenLabs.", "success");
      setStage("review");
    } catch (err) {
      setFriendlyError(describeWalletError((err as Error).message));
      setStage("review");
    }
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  async function publish() {
    if (!recordedBlobRef.current) return;
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.sendTransaction) {
      setFriendlyError({
        title: "Connect a wallet first",
        steps: ["Use the wallet button in the top right, then try publishing again."],
        faucetHint: false,
      });
      return;
    }
    if (!title.trim()) {
      setFriendlyError({ title: "Give your story a title", steps: ["Titles help listeners find it."], faucetHint: false });
      return;
    }

    setStage("uploading-audio");
    setFriendlyError(null);

    try {
      const arweaveUri = await uploadAudio(recordedBlobRef.current);
      setResultUri(arweaveUri);

      let imageUri: string | undefined;
      if (coverFile) {
        setStage("uploading-image");
        imageUri = await uploadImage(coverFile);
      }

      setStage("minting");
      const tx = await buildStoryMintTransaction(connection, wallet.publicKey, {
        type: "echoes.story.mint",
        title,
        arweaveUri,
        imageUri,
        durationSeconds: seconds,
        createdAt: new Date().toISOString(),
      });
      const signature = await wallet.sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, "confirmed");
      setTxSig(signature);

      setStage("registering");
      const registerRes = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          authorHandle: wallet.publicKey.toBase58().slice(0, 4) + ".sol",
          authorWallet: wallet.publicKey.toBase58(),
          arweaveUri,
          imageUri,
          mintTxSignature: signature,
          durationSeconds: seconds,
        }),
      });
      if (!registerRes.ok) {
        const detail = await registerRes.json().catch(() => ({}));
        throw new Error(detail.error || "Failed to register the story in the marketplace.");
      }

      push("Published! Your story is live.", "success");
      setStage("done");
    } catch (err) {
      console.error("[publish] failed:", err);
      setFriendlyError(describeWalletError((err as Error).message));
      setStage("review");
    }
  }

  return (
    <div className="glass rounded-[28px] p-6 sm:p-9 max-w-xl">
      {stage === "idle" && (
        <button
          onClick={startRecording}
          className="w-full bg-amber text-[#181310] font-semibold rounded-xl py-4 text-sm"
        >
          Start recording
        </button>
      )}

      {stage === "recording" && (
        <>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-3 h-3 rounded-full bg-[#E85D4D] shadow-[0_0_0_4px_rgba(232,93,77,0.15)]" />
            <span className="font-mono text-sm text-muted">
              {String(Math.floor(seconds / 60)).padStart(2, "0")}:
              {String(seconds % 60).padStart(2, "0")} — recording
            </span>
          </div>
          <div className="flex items-end gap-[3px] h-16 mb-6 overflow-hidden">
            {levels.map((h, i) => (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-amber to-violet rounded flex-shrink-0"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
          <button
            onClick={stopRecording}
            className="w-full bg-bone text-ink font-semibold rounded-xl py-4 text-sm"
          >
            Stop
          </button>
        </>
      )}

      {(stage === "review" ||
        stage === "cleaning" ||
        stage === "uploading-audio" ||
        stage === "uploading-image" ||
        stage === "minting" ||
        stage === "registering" ||
        stage === "done") && (
        <div className="space-y-5">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title your story"
            disabled={stage !== "review"}
            className="w-full bg-ink/50 border border-line rounded-lg px-4 py-3 text-sm text-bone placeholder:text-muted outline-none"
          />

          {stage === "review" && (
            <div className="flex items-center gap-4">
              <label className="w-16 h-16 rounded-xl border border-dashed border-line flex-shrink-0 flex items-center justify-center cursor-pointer overflow-hidden bg-ink/40">
                {coverPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-muted text-xs text-center px-1">+ Cover</span>
                )}
                <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
              </label>
              <p className="text-xs text-muted leading-relaxed">
                Optional cover art — shown on the story card and player, stored alongside the
                audio.
              </p>
            </div>
          )}

          {stage === "review" && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={cleanupWithElevenLabs}
                className="flex-1 border border-line rounded-xl py-3 text-sm text-bone hover:bg-cardHover/60 transition"
              >
                Clean up with AI (ElevenLabs)
              </button>
              <button
                onClick={publish}
                className="flex-1 bg-violet text-white font-semibold rounded-xl py-3 text-sm"
              >
                Tokenize &amp; publish
              </button>
            </div>
          )}

          {stage === "cleaning" && (
            <p className="text-sm text-muted font-mono">Removing background noise…</p>
          )}
          {stage === "uploading-audio" && (
            <p className="text-sm text-muted font-mono">Uploading audio…</p>
          )}
          {stage === "uploading-image" && (
            <p className="text-sm text-muted font-mono">Uploading cover image…</p>
          )}
          {stage === "minting" && (
            <p className="text-sm text-muted font-mono">
              Signing the on-chain mint transaction — approve it in your wallet…
            </p>
          )}
          {stage === "registering" && (
            <p className="text-sm text-muted font-mono">Adding your story to the marketplace…</p>
          )}
          {stage === "done" && (
            <div className="text-sm space-y-2">
              <p className="text-green font-mono">Published.</p>
              {resultUri && (
                <p className="text-muted break-all">
                  Stored:{" "}
                  <a className="underline" href={resultUri} target="_blank" rel="noreferrer">
                    {resultUri}
                  </a>
                </p>
              )}
              {txSig && (
                <p className="text-muted break-all">
                  Mint tx:{" "}
                  <a
                    className="underline"
                    href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {txSig}
                  </a>
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {friendlyError && (
        <div className="mt-5 bg-[#E85D4D]/10 border border-[#E85D4D]/30 rounded-xl p-4">
          <p className="text-sm text-[#E85D4D] font-medium mb-2">{friendlyError.title}</p>
          <ul className="space-y-1">
            {friendlyError.steps.map((s, i) => (
              <li key={i} className="text-xs text-muted leading-relaxed">
                {s}
              </li>
            ))}
          </ul>
          {friendlyError.faucetHint && (
            <a
              href="https://faucet.solana.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs underline text-bone mt-2 inline-block"
            >
              Get free devnet SOL →
            </a>
          )}
        </div>
      )}

      {stage === "error" && (
        <button onClick={() => setStage("idle")} className="text-sm underline text-muted mt-3">
          Try again
        </button>
      )}
    </div>
  );
}
