"use client";

import { Story } from "@/types/story";
import { useAudioPlayer } from "@/lib/AudioPlayerContext";
import { PlayIcon, PauseIcon } from "./Icons";
import ShareMenu from "./ShareMenu";

export default function StoryPlayer({ story }: { story: Story }) {
  const { current, isPlaying, toggle } = useAudioPlayer();
  const isThisPlaying = current?.id === story.id && isPlaying;

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
      <ShareMenu
        url={typeof window !== "undefined" ? window.location.href : ""}
        title={story.title}
      />
      </div>
    </div>
  );
}
