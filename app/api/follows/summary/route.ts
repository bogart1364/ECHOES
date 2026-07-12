import { NextRequest, NextResponse } from "next/server";
import { getFollowingList, getFollowerList } from "@/lib/follows";
import { getAllStories } from "@/lib/stories";
import { resolveWallet } from "@/lib/resolveCreator";

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
      following: followingWallets.map((w) => resolveWallet(w, stories)),
      followers: followerWallets.map((w) => resolveWallet(w, stories)),
    });
  } catch (err) {
    console.error("[api/follows/summary] failed:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
