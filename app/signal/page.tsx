import Link from "next/link";
import { getAllStories } from "@/lib/stories";
import { getRecentActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const activityCopy: Record<string, (a: { usdcAmount?: number }) => string> = {
  publish: () => "published",
  buy: (a) => `bought $${a.usdcAmount?.toFixed(2)} of`,
  sell: (a) => `sold $${a.usdcAmount?.toFixed(2)} of`,
};

export default async function SignalPage() {
  const [stories, activity] = await Promise.all([getAllStories(), getRecentActivity(20)]);

  const trending = [...stories].sort((a, b) => b.change24h - a.change24h).slice(0, 10);

  return (
    <main className="px-4 sm:px-6 md:px-12 py-16 sm:py-20 max-w-5xl mx-auto">
      <div className="max-w-xl mb-11">
        <span className="font-mono text-xs uppercase tracking-wide text-amber block mb-3">
          Signal
        </span>
        <h1 className="font-display text-2xl sm:text-3xl mb-3">What's moving right now</h1>
        <p className="text-muted text-[15px] leading-relaxed">
          Trending stories and live marketplace activity.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-[18px] p-6 sm:p-7">
          <h2 className="text-xs text-muted uppercase tracking-wide mb-5">Trending stories</h2>
          <ul className="space-y-1">
            {trending.map((s, i) => {
              const up = s.change24h >= 0;
              return (
                <li key={s.id} className="flex items-center gap-3 py-2.5 border-b border-line last:border-0">
                  <span className="font-mono text-xs text-muted w-4 flex-shrink-0">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">{s.title}</p>
                    <Link
                      href={`/creator/${s.authorWallet}`}
                      className="text-xs text-muted hover:text-amber transition truncate block w-fit"
                    >
                      {s.authorHandle}
                    </Link>
                  </div>
                  <span className={`font-mono text-sm flex-shrink-0 ${up ? "text-green" : "text-[#E85D4D]"}`}>
                    {up ? "+" : ""}
                    {s.change24h.toFixed(1)}%
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="glass rounded-[18px] p-6 sm:p-7">
          <h2 className="text-xs text-muted uppercase tracking-wide mb-5">Recent activity</h2>
          {activity.length === 0 ? (
            <p className="text-sm text-muted">Nothing yet — be the first to publish or trade.</p>
          ) : (
            <ul className="space-y-1">
              {activity.map((a, i) => (
                <li key={i} className="py-2.5 border-b border-line last:border-0 text-sm">
                  <span className="text-muted">{activityCopy[a.side]?.(a) ?? a.side}</span>{" "}
                  <span>{a.storyTitle}</span>
                  <span className="text-muted"> · {timeAgo(a.timestamp)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
