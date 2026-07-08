"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

interface NowPlaying {
  id: string;
  title: string;
  authorHandle: string;
  src: string;
}

interface AudioPlayerContextValue {
  current: NowPlaying | null;
  isPlaying: boolean;
  progress: number; // 0..1
  play: (story: NowPlaying) => void;
  toggle: (story: NowPlaying) => void;
  pause: () => void;
  seek: (fraction: number) => void;
  close: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [current, setCurrent] = useState<NowPlaying | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const ensureAudio = useCallback(() => {
    if (!audioRef.current && typeof window !== "undefined") {
      const audio = new Audio();
      audio.addEventListener("timeupdate", () => {
        if (audio.duration) setProgress(audio.currentTime / audio.duration);
      });
      audio.addEventListener("ended", () => setIsPlaying(false));
      audioRef.current = audio;
    }
    return audioRef.current!;
  }, []);

  const play = useCallback(
    (story: NowPlaying) => {
      const audio = ensureAudio();
      if (current?.id !== story.id) {
        audio.src = story.src;
        setCurrent(story);
      }
      audio.play().catch(() => {});
      setIsPlaying(true);
    },
    [current, ensureAudio]
  );

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(
    (story: NowPlaying) => {
      if (current?.id === story.id && isPlaying) {
        pause();
      } else {
        play(story);
      }
    },
    [current, isPlaying, pause, play]
  );

  const seek = useCallback((fraction: number) => {
    const audio = audioRef.current;
    if (audio && audio.duration) {
      audio.currentTime = fraction * audio.duration;
    }
  }, []);

  const close = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.removeAttribute("src");
      audio.load();
    }
    setIsPlaying(false);
    setProgress(0);
    setCurrent(null);
  }, []);

  const value = useMemo(
    () => ({ current, isPlaying, progress, play, toggle, pause, seek, close }),
    [current, isPlaying, progress, play, toggle, pause, seek, close]
  );

  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
}

export function useAudioPlayer() {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  return ctx;
}
