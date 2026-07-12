"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function FollowLists({ wallet }: { wallet: string }) {
  const [counts, setCounts] = useState<{ followingCount: number; followerCount: number } | null>(null);

  useEffect(() => {
    fetch(`/api/follows/summary?wallet=${wallet}`)
      .then((r) => r.json())
      .then((data) => setCounts({ followingCount: data.followingCount, followerCount: data.followerCount }))
      .catch(() => {});
  }, [wallet]);

  if (!counts) return null;

  return (
    <div className="flex gap-6 mb-9 text-sm">
      <Link href={`/creator/${wallet}/following`} className="hover:text-amber transition">
        <span className="font-mono">{counts.followingCount}</span>{" "}
        <span className="text-muted">Following</span>
      </Link>
      <Link href={`/creator/${wallet}/followers`} className="hover:text-amber transition">
        <span className="font-mono">{counts.followerCount}</span>{" "}
        <span className="text-muted">Followers</span>
      </Link>
    </div>
  );
}
