"use client";

import { useState } from "react";
import WaveformRecorder from "@/components/WaveformRecorder";
import NarrateWithAI from "@/components/NarrateWithAI";

export default function RecordPage() {
  const [mode, setMode] = useState<"record" | "narrate">("record");

  return (
    <main className="px-4 sm:px-6 md:px-12 py-16 sm:py-20 max-w-5xl mx-auto">
      <div className="max-w-xl mb-7">
        <span className="font-mono text-xs uppercase tracking-wide text-amber block mb-3">
          Record → publish
        </span>
        <h1 className="font-display text-2xl sm:text-3xl mb-3">Tell your story</h1>
        <p className="text-muted text-[15px] leading-relaxed">
          Recorded locally in your browser. Cleaned up with ElevenLabs if you want. Stored
          reliably and anchored on Solana the moment you publish.
        </p>
      </div>

      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setMode("record")}
          className={`text-sm px-4 py-2.5 rounded-full border transition ${
            mode === "record" ? "bg-amber text-[#181310] border-amber" : "border-line text-muted hover:text-bone"
          }`}
        >
          Record your voice
        </button>
        <button
          onClick={() => setMode("narrate")}
          className={`text-sm px-4 py-2.5 rounded-full border transition ${
            mode === "narrate" ? "bg-amber text-[#181310] border-amber" : "border-line text-muted hover:text-bone"
          }`}
        >
          Narrate with AI
        </button>
      </div>

      {mode === "record" ? <WaveformRecorder /> : <NarrateWithAI />}
    </main>
  );
}
