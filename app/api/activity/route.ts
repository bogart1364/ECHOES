import { NextResponse } from "next/server";
import { getRecentActivity } from "@/lib/activity";

export async function GET() {
  try {
    const events = await getRecentActivity(20);
    return NextResponse.json(events);
  } catch (err) {
    console.error("[api/activity] failed:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
