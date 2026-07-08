"use client";

import { useMemo, useState } from "react";
import { Story } from "@/types/story";
import StoryCard from "./StoryCard";

type Sort = "trending" | "newest" | "holders";

export default function StoryGrid({ stories }: { stories: Story[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("trending");

  const filtered = useMemo(() => {
    let list = stories.filter(
      (s) =>
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.authorHandle.toLowerCase().includes(query.toLowerCase())
    );
    if (sort === "trending") list = [...list].sort((a, b) => b.change24h - a.change24h);
    if (sort === "newest") list = [...list].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    if (sort === "holders") list = [...list].sort((a, b) => b.holders - a.holders);
    return list;
  }, [stories, query, sort]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stories or creators…"
          className="flex-1 glass rounded-xl px-4 py-3 text-sm placeholder:text-muted outline-none"
        />
        <div className="flex gap-2">
          {(["trending", "newest", "holders"] as Sort[]).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`text-xs px-3 py-2 rounded-full border transition capitalize ${
                sort === s ? "bg-amber text-[#181310] border-amber" : "border-line text-muted hover:text-bone"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted text-sm">No stories match "{query}".</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filtered.map((s) => (
            <StoryCard key={s.id} story={s} />
          ))}
        </div>
      )}
    </div>
  );
}
