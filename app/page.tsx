import Link from "next/link";
import { getAllStories } from "@/lib/stories";
import StoryCard from "@/components/StoryCard";

export default async function HomePage() {
  const stories = await getAllStories();

  return (
    <main>
      <section className="px-12 pt-24 pb-16 max-w-5xl mx-auto">
        <span className="font-mono text-xs uppercase tracking-wider text-amber block mb-6">
          Ownership layer for audio stories · Solana + Arweave
        </span>
        <h1 className="font-display font-medium text-5xl md:text-7xl leading-[1.03] tracking-tight max-w-3xl mb-6">
          Say it once. <em className="text-amber font-light italic">Own it</em> forever.
        </h1>
        <p className="text-muted text-lg max-w-xl mb-10 leading-relaxed">
          Record a story, mint it on-chain, and earn every time it trades — permanently stored,
          permanently yours.
        </p>
        <div className="flex gap-4">
          <Link
            href="/record"
            className="bg-amber text-[#181310] font-semibold rounded-xl px-6 py-4 text-sm"
          >
            Record your story
          </Link>
          <a href="#stories" className="border border-line rounded-xl px-6 py-4 text-sm">
            Browse stories
          </a>
        </div>
      </section>

      <section id="stories" className="px-12 py-20 max-w-5xl mx-auto">
        <div className="max-w-xl mb-11">
          <span className="font-mono text-xs uppercase tracking-wide text-violet block mb-3">
            Listen
          </span>
          <h2 className="font-display text-3xl mb-3">Every story is a small market</h2>
          <p className="text-muted text-[15px] leading-relaxed">
            Listeners discover, play, and back the voices they believe in.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {stories.map((s) => (
            <StoryCard key={s.id} story={s} />
          ))}
        </div>
      </section>

      <footer className="px-12 py-14 border-t border-line text-center text-muted text-sm">
        Echoes — built for the Superteam front-end listing
      </footer>
    </main>
  );
}
