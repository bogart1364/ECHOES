"use client";

import { useState } from "react";
import { Story } from "@/types/story";
import { useAudioPlayer } from "@/lib/AudioPlayerContext";
import { useToast } from "@/lib/ToastContext";
import { PlayIcon, PauseIcon } from "./Icons";

export default function StoryPlayer({ story }: { story: Story }) {
  const { current, isPlaying, toggle } = useAudioPlayer();
  const { push } = useToast();
  const isThisPlaying = current?.id === story.id && isPlaying;

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => push("Link copied.", "success"));
  }

  return (
    <div className="flex items-center gap-4">
      {story.imageUri && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={story.imageUri}
          alt=""
          className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
        />
      )}
      <div className="flex items-center gap-3">
      <button
        onClick={() =>
          toggle({ id: story.id, title: story.title, authorHandle: story.authorHandle, src: story.arweaveUri })
        }
        className="w-14 h-14 rounded-full bg-amber text-[#181310] flex items-center justify-center flex-shrink-0 font-semibold text-lg"
      >
        {isThisPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5 ml-0.5" />}
      </button>
      <button
        onClick={copyLink}
        className="text-sm border border-line rounded-full px-4 py-2.5 text-muted hover:text-bone transition"
      >
        Share
      </button>
      </div>
    </div>
  );
}
