import WaveformRecorder from "@/components/WaveformRecorder";

export default function RecordPage() {
  return (
    <main className="px-4 sm:px-6 md:px-12 py-16 sm:py-20 max-w-5xl mx-auto">
      <div className="max-w-xl mb-9">
        <span className="font-mono text-xs uppercase tracking-wide text-amber block mb-3">
          Record → publish
        </span>
        <h1 className="font-display text-2xl sm:text-3xl mb-3">Tell your story</h1>
        <p className="text-muted text-[15px] leading-relaxed">
          Recorded locally in your browser. Cleaned up with ElevenLabs if you want. Stored
          reliably and anchored on Solana the moment you publish.
        </p>
      </div>
      <WaveformRecorder />
    </main>
  );
}
