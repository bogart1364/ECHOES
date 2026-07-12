"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/ToastContext";

export default function UnfollowAction({
  listOwnerWallet,
  creatorWallet,
}: {
  listOwnerWallet: string;
  creatorWallet: string;
}) {
  const { publicKey } = useWallet();
  const { push } = useToast();
  const router = useRouter();

  if (publicKey?.toBase58() !== listOwnerWallet) return null;

  async function unfollow() {
    try {
      const res = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ follower: listOwnerWallet, creator: creatorWallet, follow: false }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      push("Unfollowed.", "success");
      router.refresh();
    } catch (err) {
      push((err as Error).message, "error");
    }
  }

  return (
    <button
      onClick={unfollow}
      className="text-xs text-muted hover:text-bone border border-line rounded-full px-3 py-1.5 flex-shrink-0 transition"
    >
      Unfollow
    </button>
  );
}
