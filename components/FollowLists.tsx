"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  const [summary, setSummary] = useState<Summary | null>(null);
  const [tab, setTab] = useState<"following" | "followers">("following");
  const { push } = useToast();

  async function load() {
    const res = await fetch(`/api/follows/summary?wallet=${wallet}`);
    if (res.ok) setSummary(await res.json());
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet]);

  async function unfollow(creator: string) {
    try {
      const res = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ follower: wallet, creator, follow: false }),
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
    <div className="glass rounded-[28px] p-6 sm:p-7 mb-8 max-w-md">
      <div className="flex gap-6 mb-5">
        <button onClick={() => setTab("following")} className="text-left">
          <div className={`font-mono text-xl ${tab === "following" ? "text-bone" : "text-muted"}`}>
            {summary.followingCount}
          </div>
          <div className={`text-xs ${tab === "following" ? "text-bone" : "text-muted"}`}>Following</div>
        </button>
        <button onClick={() => setTab("followers")} className="text-left">
          <div className={`font-mono text-xl ${tab === "followers" ? "text-bone" : "text-muted"}`}>
            {summary.followerCount}
          </div>
          <div className={`text-xs ${tab === "followers" ? "text-bone" : "text-muted"}`}>Followers</div>
        </button>
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-muted">
          {tab === "following" ? "You're not following anyone yet." : "No one's following you yet."}
        </p>
      ) : (
        <ul className="space-y-1">
          {list.map((entry) => (
            <li
              key={entry.wallet}
              className="flex items-center justify-between py-2.5 border-b border-line last:border-0"
            >
              {entry.storyId ? (
                <Link href={`/story/${entry.storyId}`} className="text-sm hover:text-amber transition truncate">
                  {entry.handle}
                </Link>
              ) : (
                <span className="text-sm truncate">{entry.handle}</span>
              )}
              {tab === "following" && (
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
