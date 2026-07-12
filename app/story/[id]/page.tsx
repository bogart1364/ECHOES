import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getStoryById } from "@/lib/stories";
import TradeTicket from "@/components/TradeTicket";
import StoryPlayer from "@/components/StoryPlayer";
import FollowButton from "@/components/FollowButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const story = await getStoryById(params.id);
  if (!story) return { title: "Story not found" };

  const description = `A story by ${story.authorHandle} on Echoes — the ownership layer for audio stories on Solana.`;

  return {
    title: story.title,
    description,
    openGraph: {
      title: story.title,
      description,
      images: story.imageUri ? [{ url: story.imageUri }] : undefined,
      type: "music.song",
    },
    twitter: {
      card: "summary_large_image",
      title: story.title,
      description,
      images: story.imageUri ? [story.imageUri] : undefined,
    },
  };
}

export default async function StoryPage({ params }: { params: { id: string } }) {
  const story = await getStoryById(params.id);
  if (!story) return notFound();

  return (
    <main className="px-4 sm:px-6 md:px-12 py-16 sm:py-20 max-w-5xl mx-auto space-y-8 sm:space-y-10">
      <div>
        <Link
          href={`/creator/${story.authorWallet}`}
          className="font-mono text-xs uppercase tracking-wide text-muted hover:text-amber transition block mb-3 w-fit"
        >
          by {story.authorHandle}
        </Link>
        <h1 className="font-display text-3xl sm:text-4xl mb-6">{story.title}</h1>
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <StoryPlayer story={story} />
          <FollowButton creatorWallet={story.authorWallet} creatorHandle={story.authorHandle} />
        </div>
      </div>

      <TradeTicket initial={story} />

      <div className="text-xs text-muted font-mono space-y-1 break-all">
        <p>
          Stored:{" "}
          <a className="underline" href={story.arweaveUri} target="_blank" rel="noreferrer">
            {story.arweaveUri}
          </a>
        </p>
        <p>Mint tx: {story.mintTxSignature}</p>
      </div>
    </main>
  );
}
