import { NextRequest, NextResponse } from "next/server";
import { getAllStories, addStory } from "@/lib/stories";
import { Story } from "@/types/story";

export async function GET() {
  const stories = await getAllStories();
  return NextResponse.json(stories);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const required = ["title", "authorHandle", "authorWallet", "arweaveUri", "mintTxSignature"];
  for (const field of required) {
    if (!body[field]) {
      return NextResponse.json({ error: `Missing field: ${field}` }, { status: 400 });
    }
  }

  const story: Story = {
    id: `${body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`,
    title: body.title,
    authorHandle: body.authorHandle,
    authorWallet: body.authorWallet,
    arweaveUri: body.arweaveUri,
    mintTxSignature: body.mintTxSignature,
    durationSeconds: body.durationSeconds ?? 0,
    createdAt: new Date().toISOString(),
    priceUsd: 0.01,
    change24h: 0,
    holders: 1,
    volume24hUsd: 0,
    marketCapUsd: 100,
  };

  await addStory(story);
  return NextResponse.json(story, { status: 201 });
}
