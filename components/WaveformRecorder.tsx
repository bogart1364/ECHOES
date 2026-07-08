"use client";

import { useEffect, useRef, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { buildStoryMintTransaction } from "@/lib/solana";
import { uploadAudioToArweave } from "@/lib/irys";

type Stage = "idle" | "recording" | "review" | "cleaning" | "publishing" | "done" | "error";

export default function WaveformRecorder() {
  const [stage, setStage] = useState<Stage>("idle");
  const [seconds, setSeconds] = useState(0);
  const [levels, setLevels] = useState<number[]>(Array(40).fill(6));
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resultUri, setResultUri] = useState<string | null>(null);
  const [txSig, setTxSig] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordedBlobRef = useRef<Blob | null>(null);

  const wallet = useWallet();
  const { connection } = useConnection();

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  async function startRecording() {
    setError(null);
    setResultUri(null);
    setTxSig(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        recordedBlobRef.current = new Blob(chunksRef.current, { type: "audio/webm" });
        setStage("review");
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setStage("recording");
      setSeconds(0);

      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      animateLevels();
    } catch (err) {
      setError(
        "Couldn't access the microphone. Check your browser's permission prompt and try again."
      );
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
    setError(null);
    try {
      const form = new FormData();
      form.append("audio", recordedBlobRef.current, "recording.webm");
      const res = await fetch("/api/elevenlabs/enhance", { method: "POST", body: form });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail.error || "AI cleanup failed");
      }
      const cleaned = await res.blob();
      recordedBlobRef.current = cleaned;
      setStage("review");
    } catch (err) {
      setError((err as Error).message);
      setStage("review");
    }
  }

  async function publish() {
    if (!recordedBlobRef.current) return;
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.sendTransaction) {
      setError("Connect a Solana wallet first — top right.");
      return;
    }
    if (!title.trim()) {
      setError("Give your story a title first.");
      return;
    }

    setStage("publishing");
    setError(null);

    try {
      // 1. Permanent storage — Arweave via Irys, funded/signed by the listener's wallet.
      const arweaveUri = await uploadAudioToArweave(recordedBlobRef.current, wallet);
      setResultUri(arweaveUri);

      // 2. Anchor it on-chain — a Memo transaction the wallet signs itself.
      const tx = await buildStoryMintTransaction(connection, wallet.publicKey, {
        type: "echoes.story.mint",
        title,
        arweaveUri,
        durationSeconds: seconds,
        createdAt: new Date().toISOString(),
      });
      const signature = await wallet.sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, "confirmed");
      setTxSig(signature);

      // 3. Register it in the marketplace.
      await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          authorHandle: wallet.publicKey.toBase58().slice(0, 4) + ".sol",
          authorWallet: wallet.publicKey.toBase58(),
          arweaveUri,
          mintTxSignature: signature,
          durationSeconds: seconds,
        }),
      });

      setStage("done");
    } catch (err) {
      setError((err as Error).message);
      setStage("review");
    }
  }

  return (
    <div className="bg-card border border-line rounded-2xl p-9 max-w-xl">
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
          <div className="flex items-end gap-[3px] h-16 mb-6">
            {levels.map((h, i) => (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-amber to-violet rounded"
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

      {(stage === "review" || stage === "cleaning" || stage === "publishing" || stage === "done") && (
        <div className="space-y-5">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title your story"
            disabled={stage !== "review"}
            className="w-full bg-ink border border-line rounded-lg px-4 py-3 text-sm text-bone placeholder:text-muted outline-none"
          />

          {stage === "review" && (
            <div className="flex gap-3">
              <button
                onClick={cleanupWithElevenLabs}
                className="flex-1 border border-line rounded-xl py-3 text-sm text-bone hover:bg-cardHover transition"
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
          {stage === "publishing" && (
            <p className="text-sm text-muted font-mono">
              Uploading to Arweave and signing the mint transaction — approve it in your wallet…
            </p>
          )}
          {stage === "done" && (
            <div className="text-sm space-y-2">
              <p className="text-green font-mono">Published.</p>
              {resultUri && (
                <p className="text-muted break-all">
                  Stored forever:{" "}
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

      {error && <p className="text-sm text-[#E85D4D] mt-4">{error}</p>}
      {stage === "error" && (
        <button onClick={() => setStage("idle")} className="text-sm underline text-muted mt-3">
          Try again
        </button>
      )}
    </div>
  );
}
