import { NextRequest, NextResponse } from "next/server";
import { getFollowingList, getFollowerList } from "@/lib/follows";
import { getAllStories } from "@/lib/stories";
import { Story } from "@/types/story";

interface ResolvedWallet {
  wallet: string;
  handle: string;
  storyId: string | null;
}

function resolve(wallet: string, stories: Story[]): ResolvedWallet {
  const story = stories.find((s) => s.authorWallet === wallet);
  return {
    wallet,
    handle: story?.authorHandle || `${wallet.slice(0, 4)}...${wallet.slice(-4)}`,
    storyId: story?.id || null,
  };
}

export async function GET(req: NextRequest) {
  const wallet = new URL(req.url).searchParams.get("wallet");
  if (!wallet) {
    return NextResponse.json({ error: "Missing wallet" }, { status: 400 });
  }

  try {
    const [followingWallets, followerWallets, stories] = await Promise.all([
      getFollowingList(wallet),
      getFollowerList(wallet),
      getAllStories(),
    ]);

    return NextResponse.json({
      followingCount: followingWallets.length,
      followerCount: followerWallets.length,
      following: followingWallets.map((w) => resolve(w, stories)),
      followers: followerWallets.map((w) => resolve(w, stories)),
    });
  } catch (err) {
    console.error("[api/follows/summary] failed:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
