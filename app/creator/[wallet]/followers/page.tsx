import Link from "next/link";
import { getFollowerList } from "@/lib/follows";
import { getAllStories } from "@/lib/stories";
import { resolveWallet } from "@/lib/resolveCreator";

export const dynamic = "force-dynamic";

export default async function FollowersPage({ params }: { params: { wallet: string } }) {
  const [wallets, stories] = await Promise.all([getFollowerList(params.wallet), getAllStories()]);
  const list = wallets.map((w) => resolveWallet(w, stories));
  const owner = resolveWallet(params.wallet, stories);

  return (
    <main className="px-4 sm:px-6 md:px-12 py-16 sm:py-20 max-w-2xl mx-auto">
      <Link href={`/creator/${params.wallet}`} className="text-sm text-muted hover:text-bone transition mb-6 inline-block">
        ← Back to {owner.handle}
      </Link>
      <h1 className="font-display text-2xl sm:text-3xl mb-8">Followers ({list.length})</h1>

      {list.length === 0 ? (
        <p className="text-sm text-muted">No followers yet.</p>
      ) : (
        <ul>
          {list.map((entry) => (
            <li key={entry.wallet} className="py-3.5 border-b border-line">
              <Link href={`/creator/${entry.wallet}`} className="text-sm hover:text-amber transition">
                {entry.handle}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
