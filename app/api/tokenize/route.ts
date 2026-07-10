import { NextRequest, NextResponse } from "next/server";
import { simulateTrade } from "@/lib/stories";
import { logActivity } from "@/lib/activity";

// Despite the file name matching the mint flow conceptually, this route
// handles post-mint trading (buy/sell), kept separate from /api/stories
// (which handles publishing) for clarity. See lib/stories.ts for the
// mock bonding-curve logic.
export async function POST(req: NextRequest) {
  const { id, side, usdcAmount } = await req.json();

  if (!id || !["buy", "sell"].includes(side) || typeof usdcAmount !== "number") {
    return NextResponse.json({ error: "Expected { id, side: 'buy'|'sell', usdcAmount }" }, { status: 400 });
  }

  try {
    const updated = await simulateTrade(id, side, usdcAmount);
    await logActivity({ storyId: updated.id, storyTitle: updated.title, side, usdcAmount });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 404 });
  }
}
