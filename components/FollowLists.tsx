"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/lib/ToastContext";

interface ResolvedWallet {
  wallet: string;
  handle: string;
  storyId: string | null;
}

interface Summary {
  followingCount: number;
  followerCount: number;
  following: ResolvedWallet[];
  followers: ResolvedWallet[];
}

export default function FollowLists({ wallet }: { wallet: string }) {
  const { publicKey } = useWallet();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [tab, setTab] = useState<"following" | "followers">("following");
  const { push } = useToast();

  const isOwn = publicKey?.toBase58() === wallet;

  async function load() {
    const res = await fetch(`/api/follows/summary?wallet=${wallet}`);
    if (res.ok) setSummary(await res.json());
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet]);

  async function unfollow(creator: string) {
    if (!publicKey) return;
    try {
      const res = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ follower: publicKey.toBase58(), creator, follow: false }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      push("Unfollowed.", "success");
      load();
    } catch (err) {
      push((err as Error).message, "error");
    }
  }

  if (!summary) return null;

  const list = tab === "following" ? summary.following : summary.followers;

  return (
    <div className="mb-9">
      <div className="flex gap-6 mb-4">
        <button onClick={() => setTab("following")} className="text-left">
          <span className={`font-mono text-sm ${tab === "following" ? "text-bone" : "text-muted"}`}>
            {summary.followingCount}
          </span>{" "}
          <span className={`text-sm ${tab === "following" ? "text-bone" : "text-muted"}`}>Following</span>
        </button>
        <button onClick={() => setTab("followers")} className="text-left">
          <span className={`font-mono text-sm ${tab === "followers" ? "text-bone" : "text-muted"}`}>
            {summary.followerCount}
          </span>{" "}
          <span className={`text-sm ${tab === "followers" ? "text-bone" : "text-muted"}`}>Followers</span>
        </button>
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-muted">
          {tab === "following" ? "Not following anyone yet." : "No followers yet."}
        </p>
      ) : (
        <ul className="max-w-md">
          {list.map((entry) => (
            <li
              key={entry.wallet}
              className="flex items-center justify-between py-2.5 border-b border-line last:border-0"
            >
              <Link href={`/creator/${entry.wallet}`} className="text-sm hover:text-amber transition truncate">
                {entry.handle}
              </Link>
              {tab === "following" && isOwn && (
                <button
                  onClick={() => unfollow(entry.wallet)}
                  className="text-xs text-muted hover:text-bone border border-line rounded-full px-3 py-1.5 flex-shrink-0 transition"
                >
                  Unfollow
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
