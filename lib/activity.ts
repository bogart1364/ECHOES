import { get, put } from "@vercel/blob";

export interface ActivityEvent {
  storyId: string;
  storyTitle: string;
  side: "buy" | "sell" | "publish";
  usdcAmount?: number;
  timestamp: string;
}

const ACTIVITY_PATHNAME = "store/activity.json";
const MAX_EVENTS = 50;

async function readActivity(): Promise<ActivityEvent[]> {
  const result = await get(ACTIVITY_PATHNAME, { access: "public", useCache: false });
  if (!result) return [];
  const text = await new Response(result.stream).text();
  try {
    return JSON.parse(text) as ActivityEvent[];
  } catch {
    return [];
  }
}

async function writeActivity(events: ActivityEvent[]): Promise<void> {
  await put(ACTIVITY_PATHNAME, JSON.stringify(events, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function logActivity(event: Omit<ActivityEvent, "timestamp">): Promise<void> {
  const events = await readActivity();
  events.unshift({ ...event, timestamp: new Date().toISOString() });
  await writeActivity(events.slice(0, MAX_EVENTS));
}

export async function getRecentActivity(limit = 20): Promise<ActivityEvent[]> {
  const events = await readActivity();
  return events.slice(0, limit);
}
