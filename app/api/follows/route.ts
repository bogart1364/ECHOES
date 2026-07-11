import { NextRequest, NextResponse } from "next/server";
import { getFollowState, setFollow } from "@/lib/follows";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const creator = searchParams.get("creator");
  const follower = searchParams.get("follower");

  if (!creator) {
    return NextResponse.json({ error: "Missing creator" }, { status: 400 });
  }

  try {
    const state = await getFollowState(follower, creator);
    return NextResponse.json(state);
  } catch (err) {
    console.error("[api/follows] GET failed:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { follower, creator, follow } = await req.json();

  if (!follower || !creator || typeof follow !== "boolean") {
    return NextResponse.json({ error: "Expected { follower, creator, follow }" }, { status: 400 });
  }

  try {
    const state = await setFollow(follower, creator, follow);
    return NextResponse.json(state);
  } catch (err) {
    console.error("[api/follows] POST failed:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
