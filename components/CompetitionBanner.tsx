import { Competition } from "@/types/story";

export default function CompetitionBanner({ competition }: { competition: Competition }) {
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(competition.deadline).getTime() - Date.now()) / 86400000)
  );

  return (
    <div className="bg-card border border-line rounded-2xl p-8 flex justify-between items-center gap-8">
      <div>
        <div className="text-xs text-violet font-mono uppercase tracking-wide mb-2">
          Sponsored by {competition.sponsor}
        </div>
        <h3 className="font-display text-2xl mb-2">{competition.title}</h3>
        <p className="text-sm text-muted max-w-md">{competition.description}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="font-mono text-2xl text-amber">${competition.prizeUsd.toLocaleString()}</div>
        <div className="text-xs text-muted mt-1">{daysLeft} days left</div>
      </div>
    </div>
  );
}
