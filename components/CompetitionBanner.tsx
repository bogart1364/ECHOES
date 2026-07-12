import { Competition } from "@/types/story";

export default function CompetitionBanner({ competition }: { competition: Competition }) {
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(competition.deadline).getTime() - Date.now()) / 86400000)
  );

  return (
    <div className="glass rounded-[18px] p-6 sm:p-8 flex flex-col sm:flex-row justify-between sm:items-center gap-5 sm:gap-8">
      <div>
        <div className="text-xs text-violet font-mono uppercase tracking-wide mb-2">
          Sponsored by {competition.sponsor}
        </div>
        <h3 className="font-display text-xl sm:text-2xl mb-2">{competition.title}</h3>
        <p className="text-sm text-muted max-w-md">{competition.description}</p>
      </div>
      <div className="sm:text-right flex-shrink-0">
        <div className="font-mono text-2xl text-amber">${competition.prizeUsd.toLocaleString()}</div>
        <div className="text-xs text-muted mt-1">{daysLeft} days left</div>
      </div>
    </div>
  );
}
