"use client";

import { useEffect, useRef, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { buildStoryMintTransaction } from "@/lib/solana";
import { uploadAudio, uploadImage } from "@/lib/storage";
import { describeWalletError, FriendlyError } from "@/lib/walletErrors";
import { useToast } from "@/lib/ToastContext";

type Stage =
  | "writing"
  | "generating"
  | "review"
  | "uploading-audio"
  | "uploading-image"
  | "minting"
  | "registering"
  | "done";

interface Voice {
  id: string;
  name: string;
}

function getAudioDuration(blob: Blob): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio(URL.createObjectURL(blob));
    audio.addEventListener("loadedmetadata", () => resolve(Math.round(audio.duration) || 0));
    audio.addEventListener("error", () => resolve(0));
  });
}

export default function NarrateWithAI() {
  const [stage, setStage] = useState<Stage>("writing");
  const [script, setScript] = useState("");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [voiceId, setVoiceId] = useState("");
  const [voicesError, setVoicesError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [friendlyError, setFriendlyError] = useState<FriendlyError | null>(null);
  const [resultUri, setResultUri] = useState<string | null>(null);
  const [txSig, setTxSig] = useState<string | null>(null);

  const audioBlobRef = useRef<Blob | null>(null);
  const durationRef = useRef(0);

  const wallet = useWallet();
  const { connection } = useConnection();
  const { push } = useToast();

  useEffect(() => {
    fetch("/api/elevenlabs/voices")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setVoices(data.voices || []);
        if (data.voices?.[0]) setVoiceId(data.voices[0].id);
      })
      .catch((err) => setVoicesError(err.message));
  }, []);

  async function generate() {
    if (!script.trim()) return;
    if (!voiceId) {
      setFriendlyError({ title: "Pick a voice first", steps: ["Choose one from the list above."], faucetHint: false });
      return;
    }
    setStage("generating");
    setFriendlyError(null);
    try {
      const res = await fetch("/api/elevenlabs/narrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: script, voiceId }),
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail.error || "Narration failed");
      }
      const blob = await res.blob();
      audioBlobRef.current = blob;
      durationRef.current = await getAudioDuration(blob);
      setPreviewUrl(URL.createObjectURL(blob));
      setStage("review");
    } catch (err) {
      setFriendlyError(describeWalletError((err as Error).message));
      setStage("writing");
    }
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  async function publish() {
    if (!audioBlobRef.current) return;
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
      const arweaveUri = await uploadAudio(audioBlobRef.current);
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
        durationSeconds: durationRef.current,
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
          durationSeconds: durationRef.current,
        }),
      });
      if (!registerRes.ok) {
        const detail = await registerRes.json().catch(() => ({}));
        throw new Error(detail.error || "Failed to register the story in the marketplace.");
      }

      push("Published! Your AI-narrated story is live.", "success");
      setStage("done");
    } catch (err) {
      console.error("[narrate-publish] failed:", err);
      setFriendlyError(describeWalletError((err as Error).message));
      setStage("review");
    }
  }

  return (
    <div className="glass rounded-[18px] p-6 sm:p-9 max-w-xl">
      {stage === "writing" && (
        <div className="space-y-4">
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Write the story you want narrated…"
            rows={6}
            maxLength={2500}
            className="w-full bg-ink/50 border border-line rounded-lg px-4 py-3 text-sm text-bone placeholder:text-muted outline-none resize-none"
          />
          <p className="text-xs text-muted text-right">{script.length}/2500</p>

          {voicesError ? (
            <p className="text-xs text-[#E85D4D]">{voicesError}</p>
          ) : (
            <select
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
              className="w-full bg-ink/50 border border-line rounded-lg px-4 py-3 text-sm text-bone outline-none"
            >
              {voices.length === 0 && <option>Loading voices…</option>}
              {voices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={generate}
            disabled={!script.trim() || !voiceId}
            className="w-full bg-amber text-[#181310] font-semibold rounded-xl py-4 text-sm disabled:opacity-50"
          >
            Generate narration
          </button>
        </div>
      )}

      {stage === "generating" && (
        <p className="text-sm text-muted font-mono">Generating narration with ElevenLabs…</p>
      )}

      {(stage === "review" ||
        stage === "uploading-audio" ||
        stage === "uploading-image" ||
        stage === "minting" ||
        stage === "registering" ||
        stage === "done") && (
        <div className="space-y-5">
          {previewUrl && stage === "review" && (
            <audio controls src={previewUrl} className="w-full" />
          )}

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title your story"
            disabled={stage !== "review"}
            className="w-full bg-ink/50 border border-line rounded-lg px-4 py-3 text-sm text-bone placeholder:text-muted outline-none"
          />

          {stage === "review" && (
            <>
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
                  Optional cover art — shown on the story card and player.
                </p>
              </div>
              <button
                onClick={publish}
                className="w-full bg-violet text-white font-semibold rounded-xl py-3 text-sm"
              >
                Tokenize &amp; publish
              </button>
            </>
          )}

          {stage === "uploading-audio" && <p className="text-sm text-muted font-mono">Uploading audio…</p>}
          {stage === "uploading-image" && <p className="text-sm text-muted font-mono">Uploading cover image…</p>}
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
        </div>
      )}
    </div>
  );
}
