import Link from "next/link";
import { getAllStories } from "@/lib/stories";
import StoryGrid from "@/components/StoryGrid";
import Footer from "@/components/Footer";

export default async function HomePage() {
  const stories = await getAllStories();

  return (
    <main>
      <section className="px-4 sm:px-6 md:px-12 pt-16 sm:pt-24 pb-16 max-w-5xl mx-auto">
        <span className="font-mono text-xs uppercase tracking-wider text-amber block mb-6">
          Ownership layer for audio stories · Solana + Arweave
        </span>
        <h1 className="font-display font-medium text-4xl sm:text-5xl md:text-7xl leading-[1.05] tracking-tight max-w-3xl mb-6">
          Say it once. <em className="text-amber font-light italic">Own it</em> forever.
        </h1>
        <p className="text-muted text-base sm:text-lg max-w-xl mb-10 leading-relaxed">
          Record a story, mint it on-chain, and earn every time it trades — permanently stored,
          permanently yours.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/record"
            className="bg-amber text-[#181310] font-semibold rounded-xl px-6 py-4 text-sm text-center"
          >
            Record your story
          </Link>
          <a href="#stories" className="glass rounded-xl px-6 py-4 text-sm text-center">
            Browse stories
          </a>
        </div>
      </section>

      <section id="stories" className="px-4 sm:px-6 md:px-12 py-16 sm:py-20 max-w-5xl mx-auto">
        <div className="max-w-xl mb-9">
          <span className="font-mono text-xs uppercase tracking-wide text-violet block mb-3">
            Listen
          </span>
          <h2 className="font-display text-2xl sm:text-3xl mb-3">Every story is a small market</h2>
          <p className="text-muted text-[15px] leading-relaxed">
            Listeners discover, play, and back the voices they believe in.
          </p>
        </div>
        <StoryGrid stories={stories} />
      </section>

      <Footer />
    </main>
  );
}
