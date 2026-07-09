"use client";

import Link from "next/link";
import { Story } from "@/types/story";
import { useAudioPlayer } from "@/lib/AudioPlayerContext";
import { PlayIcon, PauseIcon } from "./Icons";

export default function StoryCard({ story }: { story: Story }) {
  const { current, isPlaying, toggle } = useAudioPlayer();
  const isThisPlaying = current?.id === story.id && isPlaying;

  function handlePlay(e: React.MouseEvent) {
    e.preventDefault();
    toggle({ id: story.id, title: story.title, authorHandle: story.authorHandle, src: story.arweaveUri });
  }

  const up = story.change24h >= 0;

  return (
    <Link
      href={`/story/${story.id}`}
      className="glass rounded-[28px] p-5 sm:p-6 hover:bg-cardHover/60 hover:-translate-y-1 transition block"
    >
      <div className="flex justify-between items-start mb-5">
        {story.imageUri ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={story.imageUri}
            alt=""
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber to-violet flex-shrink-0" />
        )}
        <button
          onClick={handlePlay}
          className="w-9 h-9 rounded-full bg-ink/70 border border-line flex items-center justify-center flex-shrink-0"
          aria-label={isThisPlaying ? "Pause" : "Play"}
        >
          {isThisPlaying ? (
            <div className="flex items-end gap-[2px] h-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="eq-bar w-[2.5px] bg-amber rounded-full" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          ) : (
            <PlayIcon className="w-3.5 h-3.5 ml-0.5" />
          )}
        </button>
      </div>
      <h3 className="font-display text-lg mb-1 truncate">{story.title}</h3>
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
