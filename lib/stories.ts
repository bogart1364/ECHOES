import { get, put } from "@vercel/blob";
import { Story } from "@/types/story";
import seedStories from "@/data/stories.json";

// The marketplace "database" is a single JSON blob in Vercel Blob storage.
//
// We originally read/wrote data/stories.json directly on disk, which works
// in local dev but not in production: Vercel's serverless functions have a
// read-only filesystem (aside from /tmp), so every write silently failed
// there ("Failed to register the story in the marketplace"). Vercel Blob
// (already wired up for audio/image uploads) gives us a small persistent
// store without adding a new service.
const STORE_PATHNAME = "store/stories.json";

async function readStore(): Promise<Story[]> {
  const result = await get(STORE_PATHNAME, { access: "public", useCache: false });

  if (!result) {
    // First run — seed the store from the bundled sample data.
    const seeded = seedStories as Story[];
    await writeStore(seeded);
    return seeded;
  }

  const text = await new Response(result.stream).text();
  const stored = JSON.parse(text) as Story[];

  // Sync in any seed stories added to the codebase since this store was
  // first created (matched by id), so redeploying with new sample cards
  // actually shows them without needing to reset the whole store.
  const existingIds = new Set(stored.map((s) => s.id));
  const newSeeds = (seedStories as Story[]).filter((s) => !existingIds.has(s.id));

  if (newSeeds.length > 0) {
    const merged = [...stored, ...newSeeds];
    await writeStore(merged);
    return merged;
  }

  return stored;
}

async function writeStore(stories: Story[]): Promise<void> {
  await put(STORE_PATHNAME, JSON.stringify(stories, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function getAllStories(): Promise<Story[]> {
  return readStore();
}

export async function getStoryById(id: string): Promise<Story | undefined> {
  const stories = await readStore();
  return stories.find((s) => s.id === id);
}

export async function addStory(story: Story): Promise<void> {
  const stories = await readStore();
  stories.unshift(story);
  await writeStore(stories);
}

/**
 * Simulates a buy/sell against a story's bonding curve. This is a
 * front-end/demo-appropriate mock: real trading would settle against
 * an on-chain AMM or bonding-curve program maintained by the backend
 * team, which this front end would call the same way it calls this
 * function today.
 */
export async function simulateTrade(
  id: string,
  side: "buy" | "sell",
  usdcAmount: number
): Promise<Story> {
  const stories = await readStore();
  const story = stories.find((s) => s.id === id);
  if (!story) throw new Error("Story not found");

  const impact = Math.min(usdcAmount / story.marketCapUsd, 0.2);
  const direction = side === "buy" ? 1 : -1;

  story.priceUsd = +(story.priceUsd * (1 + direction * impact)).toFixed(6);
  story.change24h = +(story.change24h + direction * impact * 100).toFixed(2);
  story.volume24hUsd = +(story.volume24hUsd + usdcAmount).toFixed(2);
  story.marketCapUsd = +(story.marketCapUsd * (1 + direction * impact)).toFixed(2);
  if (side === "buy") story.holders += 1;

  story.priceHistory = [...(story.priceHistory || []), story.priceUsd].slice(-30);

  await writeStore(stories);
  return story;
}
