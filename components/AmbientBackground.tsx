export default function AmbientBackground() {
  const bars = Array.from({ length: 60 });

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* soft color blobs */}
      <div className="ambient-blob absolute -top-40 -left-40 w-[36rem] h-[36rem] rounded-full bg-amber/10 blur-[120px]" />
      <div
        className="ambient-blob absolute top-1/3 -right-40 w-[32rem] h-[32rem] rounded-full bg-violet/10 blur-[120px]"
        style={{ animationDelay: "4s" }}
      />
      <div
        className="ambient-blob absolute bottom-0 left-1/4 w-[28rem] h-[28rem] rounded-full bg-green/5 blur-[120px]"
        style={{ animationDelay: "8s" }}
      />

      {/* faint waveform field along the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-40 flex items-end justify-center gap-[3px] opacity-[0.06]">
        {bars.map((_, i) => (
          <div
            key={i}
            className="ambient-bar w-1 bg-bone rounded-full"
            style={{
              height: `${20 + Math.abs(Math.sin(i * 0.4)) * 100}px`,
              animationDelay: `${(i % 12) * 0.18}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
