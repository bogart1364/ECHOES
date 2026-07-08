import fs from "fs/promises";
import path from "path";
import { Story } from "@/types/story";

const DATA_PATH = path.join(process.cwd(), "data", "stories.json");

export async function getAllStories(): Promise<Story[]> {
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw) as Story[];
}

export async function getStoryById(id: string): Promise<Story | undefined> {
  const stories = await getAllStories();
  return stories.find((s) => s.id === id);
}

export async function addStory(story: Story): Promise<void> {
  const stories = await getAllStories();
  stories.unshift(story);
  await fs.writeFile(DATA_PATH, JSON.stringify(stories, null, 2), "utf-8");
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
  const stories = await getAllStories();
  const story = stories.find((s) => s.id === id);
  if (!story) throw new Error("Story not found");

  const impact = Math.min(usdcAmount / story.marketCapUsd, 0.2);
  const direction = side === "buy" ? 1 : -1;

  story.priceUsd = +(story.priceUsd * (1 + direction * impact)).toFixed(6);
  story.change24h = +(story.change24h + direction * impact * 100).toFixed(2);
  story.volume24hUsd = +(story.volume24hUsd + usdcAmount).toFixed(2);
  story.marketCapUsd = +(story.marketCapUsd * (1 + direction * impact)).toFixed(2);
  if (side === "buy") story.holders += 1;

  await fs.writeFile(DATA_PATH, JSON.stringify(stories, null, 2), "utf-8");
  return story;
}
