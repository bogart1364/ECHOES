"use client";

import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Nav() {
  const { authenticated, login, logout, user } = usePrivyMaybe();
  const { connected, publicKey } = useWallet();

  return (
    <nav className="flex items-center justify-between px-12 py-5 border-b border-line sticky top-0 bg-ink/85 backdrop-blur-md z-10">
      <Link href="/" className="font-display font-semibold text-xl tracking-tight">
        echoes<span className="text-amber">.</span>
      </Link>

      <div className="flex items-center gap-3">
        <Link href="/competitions" className="text-sm text-muted hover:text-bone transition">
          Competitions
        </Link>
        <Link href="/record" className="text-sm text-muted hover:text-bone transition">
          Record
        </Link>

        {/* Privy: covers email/SMS listeners with no wallet yet */}
        {authenticated ? (
          <button
            onClick={logout}
            className="text-xs text-muted border border-line rounded-full px-3 py-2 hover:text-bone transition"
          >
            {user?.email?.address ?? "Signed in"} · Sign out
          </button>
        ) : (
          <button
            onClick={login}
            className="text-xs border border-line rounded-full px-3 py-2 hover:text-bone transition"
          >
            Sign in
          </button>
        )}

        {/* Solana wallet: the path creators use to sign mint/trade txs */}
        <WalletMultiButton style={{ background: "#1E1A16", border: "1px solid rgba(242,236,221,0.09)", borderRadius: 100, fontSize: 13, height: 38 }} />
      </div>
    </nav>
  );
}

// usePrivy() throws if called outside a PrivyProvider (i.e. when
// NEXT_PUBLIC_PRIVY_APP_ID isn't set yet in local dev). This guards that
// so the rest of the UI still renders with wallet-only auth.
function usePrivyMaybe() {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return usePrivy();
  } catch {
    return { authenticated: false, login: () => {}, logout: () => {}, user: null } as any;
  }
}
