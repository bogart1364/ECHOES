"use client";

import { useAudioPlayer } from "@/lib/AudioPlayerContext";
import { PlayIcon, PauseIcon } from "./Icons";

export default function MiniPlayer() {
  const { current, isPlaying, progress, toggle, seek, close } = useAudioPlayer();

  if (!current) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 sm:px-6 sm:pb-6">
      <div className="glass-strong max-w-2xl mx-auto rounded-2xl px-4 py-3 sm:px-5 sm:py-4 flex items-center gap-4 shadow-2xl">
        <button
          onClick={() => toggle(current)}
          className="w-10 h-10 rounded-full bg-amber text-[#181310] flex items-center justify-center flex-shrink-0 font-semibold"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4 ml-0.5" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{current.title}</p>
            {isPlaying && (
              <div className="flex items-end gap-[2px] h-3 flex-shrink-0">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="eq-bar w-[3px] bg-amber rounded-full"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-muted truncate">{current.authorHandle}</p>
          <div
            className="mt-2 h-1 bg-line rounded-full cursor-pointer overflow-hidden"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              seek((e.clientX - rect.left) / rect.width);
            }}
          >
            <div className="h-full bg-amber rounded-full" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>

        <button
          onClick={close}
          aria-label="Close player"
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-muted hover:text-bone hover:bg-ink/40 transition"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
