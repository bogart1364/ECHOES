import { notFound } from "next/navigation";
import { getStoryById } from "@/lib/stories";
import TradeTicket from "@/components/TradeTicket";
import StoryPlayer from "@/components/StoryPlayer";

export const dynamic = "force-dynamic";

export default async function StoryPage({ params }: { params: { id: string } }) {
  const story = await getStoryById(params.id);
  if (!story) return notFound();

  return (
    <main className="px-4 sm:px-6 md:px-12 py-16 sm:py-20 max-w-5xl mx-auto space-y-8 sm:space-y-10">
      <div>
        <span className="font-mono text-xs uppercase tracking-wide text-muted block mb-3">
          by {story.authorHandle}
        </span>
        <h1 className="font-display text-3xl sm:text-4xl mb-6">{story.title}</h1>
        <StoryPlayer story={story} />
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
