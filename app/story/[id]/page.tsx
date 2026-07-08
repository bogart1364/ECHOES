import { notFound } from "next/navigation";
import { getStoryById } from "@/lib/stories";
import TradeTicket from "@/components/TradeTicket";

export default async function StoryPage({ params }: { params: { id: string } }) {
  const story = await getStoryById(params.id);
  if (!story) return notFound();

  return (
    <main className="px-12 py-20 max-w-5xl mx-auto space-y-10">
      <div>
        <span className="font-mono text-xs uppercase tracking-wide text-muted block mb-3">
          by {story.authorHandle}
        </span>
        <h1 className="font-display text-4xl mb-6">{story.title}</h1>
        <audio controls src={story.arweaveUri} className="w-full max-w-md" />
      </div>

      <TradeTicket initial={story} />

      <div className="text-xs text-muted font-mono space-y-1">
        <p>
          Stored forever:{" "}
          <a className="underline" href={story.arweaveUri} target="_blank" rel="noreferrer">
            {story.arweaveUri}
          </a>
        </p>
        <p>Mint tx: {story.mintTxSignature}</p>
      </div>
    </main>
  );
}
