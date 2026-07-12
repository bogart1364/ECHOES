"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Story } from "@/types/story";
import StoryCard from "@/components/StoryCard";
import FollowLists from "@/components/FollowLists";

export default function ProfilePage() {
  const { connected, publicKey } = useWallet();
  const [stories, setStories] = useState<Story[] | null>(null);

  useEffect(() => {
    fetch("/api/stories")
      .then((r) => r.json())
      .then(setStories)
      .catch(() => setStories([]));
  }, []);

  const mine =
    connected && publicKey && stories
      ? stories.filter((s) => s.authorWallet === publicKey.toBase58())
      : [];

  const totalHolders = mine.reduce((sum, s) => sum + s.holders, 0);
  const totalVolume = mine.reduce((sum, s) => sum + s.volume24hUsd, 0);

  return (
    <main className="px-4 sm:px-6 md:px-12 py-16 sm:py-20 max-w-5xl mx-auto">
      <div className="max-w-xl mb-9">
        <span className="font-mono text-xs uppercase tracking-wide text-amber block mb-3">
          Profile
        </span>
        <h1 className="font-display text-2xl sm:text-3xl mb-3">Your stories</h1>
        <p className="text-muted text-[15px] leading-relaxed">
          Everything you've published, tied to your connected wallet.
        </p>
      </div>

      {!connected ? (
        <div className="glass rounded-[18px] p-9 flex flex-col items-start gap-4 max-w-md">
          <p className="text-sm text-muted">Connect your wallet to see what you've published.</p>
          <WalletMultiButton
            style={{
              background: "rgba(30,26,22,0.6)",
              border: "1px solid rgba(242,236,221,0.1)",
              borderRadius: 100,
              fontSize: 13,
              height: 42,
            }}
          />
        </div>
      ) : (
        <>
          <FollowLists wallet={publicKey!.toBase58()} />

          {stories === null ? (
            <p className="text-muted text-sm font-mono">Loading…</p>
          ) : mine.length === 0 ? (
            <div className="glass rounded-[18px] p-9 max-w-md">
              <p className="text-sm text-muted mb-4">
                No stories yet from this wallet ({publicKey?.toBase58().slice(0, 4)}…
                {publicKey?.toBase58().slice(-4)}).
              </p>
              <a href="/record" className="text-sm text-amber underline">
                Record your first one →
              </a>
            </div>
          ) : (
            <>
              <div className="flex gap-6 mb-8 text-sm">
                <div>
                  <div className="font-mono text-xl">{mine.length}</div>
                  <div className="text-muted text-xs">stories</div>
                </div>
                <div>
                  <div className="font-mono text-xl">{totalHolders}</div>
                  <div className="text-muted text-xs">total holders</div>
                </div>
                <div>
                  <div className="font-mono text-xl">${totalVolume.toLocaleString()}</div>
                  <div className="text-muted text-xs">24h volume</div>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
                {mine.map((s) => (
                  <StoryCard key={s.id} story={s} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </main>
  );
}
