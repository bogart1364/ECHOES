"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Story } from "@/types/story";

export default function StoryCard({ story }: { story: Story }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  function togglePlay(e: React.MouseEvent) {
    e.preventDefault();
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setPlaying(!playing);
  }

  const up = story.change24h >= 0;

  return (
    <Link
      href={`/story/${story.id}`}
      className="block bg-card border border-line rounded-2xl p-6 hover:bg-cardHover hover:-translate-y-1 transition"
    >
      <div className="flex justify-between items-start mb-5">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber to-violet" />
        <button
          onClick={togglePlay}
          className="w-9 h-9 rounded-full bg-ink border border-line flex items-center justify-center flex-shrink-0"
        >
          {playing ? "❚❚" : "▶"}
        </button>
        <audio ref={audioRef} src={story.arweaveUri} onEnded={() => setPlaying(false)} />
      </div>
      <h3 className="font-display text-lg mb-1">{story.title}</h3>
      <p className="text-xs text-muted mb-4">by {story.authorHandle}</p>
      <div className="flex justify-between items-center pt-3 border-t border-line">
        <span className={`font-mono text-sm ${up ? "text-green" : "text-[#E85D4D]"}`}>
          ${story.priceUsd.toFixed(3)} {up ? "↑" : "↓"}
          {Math.abs(story.change24h).toFixed(1)}%
        </span>
        <span className="text-xs text-muted">{story.holders} holders</span>
      </div>
    </Link>
  );
}
