import CompetitionBanner from "@/components/CompetitionBanner";
import { Competition } from "@/types/story";

const competitions: Competition[] = [
  {
    id: "night-voices",
    title: "Night Voices: best story recorded after midnight",
    sponsor: "Superteam",
    prizeUsd: 5000,
    deadline: "2026-07-19T00:00:00.000Z",
    description:
      "Record something true about the hours nobody talks about. Judged on craft and originality.",
  },
  {
    id: "hometown-echoes",
    title: "Hometown Echoes",
    sponsor: "Echoes Fans",
    prizeUsd: 1500,
    deadline: "2026-08-01T00:00:00.000Z",
    description: "Stories about the place you're from — the top 5 by trading volume win.",
  },
];

export default function CompetitionsPage() {
  return (
    <main className="px-12 py-20 max-w-5xl mx-auto">
      <div className="max-w-xl mb-11">
        <span className="font-mono text-xs uppercase tracking-wide text-amber block mb-3">
          Competitions
        </span>
        <h1 className="font-display text-3xl mb-3">Sponsored storytelling</h1>
        <p className="text-muted text-[15px] leading-relaxed">
          Brands and communities fund prizes for stories in a theme. Publish yours, tag the
          competition, and the leaderboard tracks itself.
        </p>
      </div>
      <div className="space-y-5">
        {competitions.map((c) => (
          <CompetitionBanner key={c.id} competition={c} />
        ))}
      </div>
    </main>
  );
}
