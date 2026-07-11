"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/lib/ToastContext";

export default function FollowButton({
  creatorWallet,
  creatorHandle,
}: {
  creatorWallet: string;
  creatorHandle: string;
}) {
  const { publicKey } = useWallet();
  const { push } = useToast();
  const [following, setFollowing] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const isSelf = publicKey?.toBase58() === creatorWallet;

  useEffect(() => {
    const params = new URLSearchParams({ creator: creatorWallet });
    if (publicKey) params.set("follower", publicKey.toBase58());

    fetch(`/api/follows?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setCount(data.count ?? 0);
        setFollowing(!!data.following);
      })
      .catch(() => {});
  }, [creatorWallet, publicKey]);

  async function toggle() {
    if (!publicKey) {
      push("Connect a wallet to follow creators.", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          follower: publicKey.toBase58(),
          creator: creatorWallet,
          follow: !following,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const data = await res.json();
      setFollowing(data.following);
      setCount(data.count);
    } catch (err) {
      push((err as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }

  if (isSelf) return null;

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-sm rounded-full px-4 py-2.5 transition disabled:opacity-50 ${
        following ? "border border-line text-muted hover:text-bone" : "bg-amber text-[#181310] font-semibold"
      }`}
    >
      {following ? "Following" : `Follow ${creatorHandle}`}
      {count !== null && <span className="text-xs opacity-70"> · {count}</span>}
    </button>
  );
}
