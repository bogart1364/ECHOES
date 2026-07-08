"use client";

import { useState } from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Nav() {
  const { authenticated, login, logout, user } = usePrivyMaybe();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNetworkInfo, setShowNetworkInfo] = useState(false);

  return (
    <nav className="glass sticky top-0 z-30 px-4 sm:px-6 md:px-12 py-4">
      <div className="flex items-center justify-between">
        <Link href="/" className="font-display font-semibold text-xl tracking-tight flex-shrink-0">
          echoes<span className="text-amber">.</span>
        </Link>

        {/* Network chip */}
        <div className="relative hidden sm:block ml-4">
          <button
            onClick={() => setShowNetworkInfo((s) => !s)}
            className="flex items-center gap-1.5 text-[11px] font-mono border border-line rounded-full px-2.5 py-1 text-muted hover:text-bone transition"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green" />
            devnet
          </button>
          {showNetworkInfo && (
            <div className="glass-strong absolute top-full mt-2 left-0 w-72 rounded-xl p-4 text-xs text-muted leading-relaxed">
              This app runs on Solana <span className="text-bone">Devnet</span> — free to test,
              no real value. Make sure your wallet's network is set to Devnet before publishing
              or trading (Solflare: settings → Network. Phantom: Developer Settings → Testnet
              Mode).
            </div>
          )}
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-3 ml-auto">
          <Link href="/competitions" className="text-sm text-muted hover:text-bone transition">
            Competitions
          </Link>
          <Link href="/record" className="text-sm text-muted hover:text-bone transition">
            Record
          </Link>

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

          <WalletMultiButton
            style={{
              background: "rgba(30,26,22,0.6)",
              border: "1px solid rgba(242,236,221,0.1)",
              borderRadius: 100,
              fontSize: 13,
              height: 38,
            }}
          />
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden ml-auto w-9 h-9 flex flex-col items-center justify-center gap-1.5"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Menu"
        >
          <span className={`block w-5 h-[1.5px] bg-bone transition ${menuOpen ? "rotate-45 translate-y-[3px]" : ""}`} />
          <span className={`block w-5 h-[1.5px] bg-bone transition ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-[1.5px] bg-bone transition ${menuOpen ? "-rotate-45 -translate-y-[3px]" : ""}`} />
        </button>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-line flex flex-col gap-4">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-green" /> devnet — free to test
          </div>
          <Link href="/competitions" className="text-sm text-muted" onClick={() => setMenuOpen(false)}>
            Competitions
          </Link>
          <Link href="/record" className="text-sm text-muted" onClick={() => setMenuOpen(false)}>
            Record
          </Link>
          {authenticated ? (
            <button onClick={logout} className="text-sm text-left text-muted">
              {user?.email?.address ?? "Signed in"} · Sign out
            </button>
          ) : (
            <button onClick={login} className="text-sm text-left text-muted">
              Sign in
            </button>
          )}
          <WalletMultiButton
            style={{
              background: "rgba(30,26,22,0.6)",
              border: "1px solid rgba(242,236,221,0.1)",
              borderRadius: 100,
              fontSize: 13,
              height: 38,
              width: "100%",
            }}
          />
        </div>
      )}
    </nav>
  );
}

function usePrivyMaybe() {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return usePrivy();
  } catch {
    return { authenticated: false, login: () => {}, logout: () => {}, user: null } as any;
  }
}
