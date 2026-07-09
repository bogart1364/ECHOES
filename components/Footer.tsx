import Link from "next/link";

const techStack = [
  { name: "Solana", note: "on-chain anchor" },
  { name: "Vercel Blob", note: "storage" },
  { name: "Privy", note: "auth" },
  { name: "ElevenLabs", note: "AI audio" },
  { name: "Next.js", note: "frontend" },
];

const socials = [
  { label: "X", glyph: "𝕏" },
  { label: "Telegram", glyph: "✈" },
  { label: "LinkedIn", glyph: "in" },
];

export default function Footer() {
  return (
    <footer className="border-t border-line mt-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12 py-14 grid gap-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2 md:col-span-1">
          <div className="font-display font-semibold text-xl mb-3">
            echoes<span className="text-amber">.</span>
          </div>
          <p className="text-sm text-muted leading-relaxed mb-5 max-w-[220px]">
            The ownership layer for audio stories on Solana.
          </p>
          <div className="flex gap-2">
            {socials.map((s) => (
              <span
                key={s.label}
                title={`${s.label} — coming soon`}
                className="w-9 h-9 rounded-full glass flex items-center justify-center text-sm text-muted cursor-default select-none"
              >
                {s.glyph}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs text-muted uppercase tracking-wide mb-4">Product</div>
          <ul className="space-y-3 text-sm">
            <li><Link href="/record" className="text-muted hover:text-bone transition">Record a story</Link></li>
            <li><Link href="/#stories" className="text-muted hover:text-bone transition">Listen</Link></li>
            <li><Link href="/competitions" className="text-muted hover:text-bone transition">Competitions</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-xs text-muted uppercase tracking-wide mb-4">Resources</div>
          <ul className="space-y-3 text-sm">
            <li>
              <a
                href="https://github.com/bogart1364/ECHOES"
                target="_blank"
                rel="noreferrer"
                className="text-muted hover:text-bone transition"
              >
                Source on GitHub
              </a>
            </li>
            <li>
              <a
                href="https://faucet.solana.com"
                target="_blank"
                rel="noreferrer"
                className="text-muted hover:text-bone transition"
              >
                Devnet faucet
              </a>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-xs text-muted uppercase tracking-wide mb-4">Built with</div>
          <ul className="space-y-2.5">
            {techStack.map((t) => (
              <li key={t.name} className="flex items-center gap-2 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-amber to-violet flex-shrink-0" />
                <span className="text-bone">{t.name}</span>
                <span className="text-xs text-muted">— {t.note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line py-6 px-4 sm:px-6 md:px-12">
        <p className="text-xs text-muted text-center">
          © {new Date().getFullYear()} Echoes — built for the Superteam front-end listing. Devnet demo.
        </p>
      </div>
    </footer>
  );
}
