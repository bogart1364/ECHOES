"use client";

import { useState } from "react";
import { Story } from "@/types/story";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/lib/ToastContext";

export default function TradeTicket({ initial }: { initial: Story }) {
  const [story, setStory] = useState(initial);
  const [amount, setAmount] = useState(2);
  const [loading, setLoading] = useState<"buy" | "sell" | null>(null);
  const { connected } = useWallet();
  const { push } = useToast();

  async function trade(side: "buy" | "sell") {
    if (!connected) {
      push("Connect a wallet to trade.", "error");
      return;
    }
    setLoading(side);
    try {
      const res = await fetch("/api/tokenize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: story.id, side, usdcAmount: amount }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const updated = await res.json();
      setStory(updated);
      push(side === "buy" ? `Bought ~${(amount / story.priceUsd).toFixed(2)} tokens` : "Sold", "success");
    } catch (err) {
      push((err as Error).message, "error");
    } finally {
      setLoading(null);
    }
  }

  const receiveEstimate = (amount / story.priceUsd).toFixed(2);
  const up = story.change24h >= 0;

  return (
    <div className="glass rounded-[28px] p-6 sm:p-9 grid md:grid-cols-[1.3fr_1fr] gap-7 md:gap-9">
      <div>
        <div className="text-xs text-muted uppercase tracking-wide mb-1">{story.title}</div>
        <div className={`font-mono text-2xl sm:text-3xl mb-1 ${up ? "text-green" : "text-[#E85D4D]"}`}>
          {up ? "+" : ""}
          {story.change24h.toFixed(1)}%
        </div>
        <PriceChart history={story.priceHistory || []} up={up} />
        <Row label="Price" value={`$${story.priceUsd.toFixed(4)}`} />
        <Row label="24h volume" value={`$${story.volume24hUsd.toLocaleString()}`} />
        <Row label="Market cap" value={`$${story.marketCapUsd.toLocaleString()}`} />
        <Row label="Holders" value={String(story.holders)} />
      </div>

      <div>
        <h4 className="text-xs text-muted uppercase tracking-wide mb-4">Swap</h4>
        <div className="bg-ink/50 border border-line rounded-xl p-4 space-y-3">
          <label className="flex justify-between font-mono text-xs text-muted">
            <span>You pay</span>
            <input
              type="number"
              min={0.5}
              step={0.5}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="bg-transparent text-right w-20 outline-none text-bone"
            />
          </label>
          <div className="flex justify-between font-mono text-xs text-muted">
            <span>You receive</span>
            <span>~{receiveEstimate} tokens</span>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => trade("buy")}
              disabled={loading !== null}
              className="flex-1 bg-violet text-white font-semibold rounded-lg py-3 text-sm disabled:opacity-50"
            >
              {loading === "buy" ? "Buying…" : "Buy"}
            </button>
            <button
              onClick={() => trade("sell")}
              disabled={loading !== null}
              className="flex-1 border border-line rounded-lg py-3 text-sm disabled:opacity-50"
            >
              {loading === "sell" ? "Selling…" : "Sell"}
            </button>
          </div>
        </div>
        <p className="text-[11px] text-muted mt-3 leading-relaxed">
          Simulated market for demo purposes — production trading settles against the team's
          on-chain bonding-curve program.
        </p>
      </div>
    </div>
  );
}

function PriceChart({ history, up }: { history: number[]; up: boolean }) {
  if (history.length < 2) {
    return <p className="text-xs text-muted font-mono py-6">Not enough trades yet for a chart.</p>;
  }

  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || max * 0.1 || 1;
  const w = 400;
  const h = 70;
  const pad = 4;

  const points = history
    .map((v, i) => {
      const x = (i / (history.length - 1)) * w;
      const y = pad + (1 - (v - min) / range) * (h - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const color = up ? "#6FCF97" : "#E85D4D";

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-[70px] my-5">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-line text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}
