import type { Metadata } from "next";
import { getAllStories } from "@/lib/stories";
import StoryCard from "@/components/StoryCard";
import FollowButton from "@/components/FollowButton";
import FollowLists from "@/components/FollowLists";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { wallet: string } }): Promise<Metadata> {
  const stories = await getAllStories();
  const theirs = stories.filter((s) => s.authorWallet === params.wallet);
  const handle = theirs[0]?.authorHandle || `${params.wallet.slice(0, 4)}...${params.wallet.slice(-4)}`;

  return {
    title: handle,
    description: `${handle}'s stories on Echoes — the ownership layer for audio stories on Solana.`,
  };
}

export default async function CreatorPage({ params }: { params: { wallet: string } }) {
  const wallet = params.wallet;
  const stories = await getAllStories();
  const theirs = stories.filter((s) => s.authorWallet === wallet);
  const handle = theirs[0]?.authorHandle || `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;

  const totalHolders = theirs.reduce((sum, s) => sum + s.holders, 0);
  const totalVolume = theirs.reduce((sum, s) => sum + s.volume24hUsd, 0);

  return (
    <main className="px-4 sm:px-6 md:px-12 py-16 sm:py-20 max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
        <div>
          <span className="font-mono text-xs uppercase tracking-wide text-amber block mb-3">
            Creator
          </span>
          <h1 className="font-display text-2xl sm:text-3xl mb-1">{handle}</h1>
          <p className="text-xs text-muted font-mono">
            {wallet.slice(0, 4)}...{wallet.slice(-4)}
          </p>
        </div>
        <FollowButton creatorWallet={wallet} creatorHandle={handle} />
      </div>

      <FollowLists wallet={wallet} />

      {theirs.length === 0 ? (
        <p className="text-sm text-muted">No stories published yet.</p>
      ) : (
        <>
          <div className="flex gap-6 mb-8 text-sm">
            <div>
              <div className="font-mono text-xl">{theirs.length}</div>
              <div className="text-muted text-xs">stories</div>
            </div>
            <div>
              <div className="font-mono text-xl">{totalHolders}</div>
              <div className="text-muted text-xs">total holders</div>
            </div>
            <div>
              <div className="font-mono text-xl">${totalVolume.toLocaleString()}</div>
              <div className="text-muted text-xs">24h volume</div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {theirs.map((s) => (
              <StoryCard key={s.id} story={s} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
