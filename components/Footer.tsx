import Link from "next/link";
import { SolanaMark, VercelMark, PrivyMark, ElevenLabsMark, NextMark } from "./Icons";

const techStack = [
  { name: "Solana", Icon: SolanaMark },
  { name: "Vercel Blob", Icon: VercelMark },
  { name: "Privy", Icon: PrivyMark },
  { name: "ElevenLabs", Icon: ElevenLabsMark },
  { name: "Next.js", Icon: NextMark },
];

const socials = [
  { label: "X", glyph: "𝕏", href: "https://x.com/orinbase" },
  { label: "Telegram", glyph: "✈", href: null },
  { label: "LinkedIn", glyph: "in", href: "https://www.linkedin.com/in/ali-peirovi" },
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
            {socials.map((s) =>
              s.href ? (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  title={s.label}
                  className="w-9 h-9 rounded-full glass flex items-center justify-center text-sm text-muted hover:text-bone transition"
                >
                  {s.glyph}
                </a>
              ) : (
                <span
                  key={s.label}
                  title={`${s.label} — coming soon`}
                  className="w-9 h-9 rounded-full glass flex items-center justify-center text-sm text-muted cursor-default select-none"
                >
                  {s.glyph}
                </span>
              )
            )}
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
          <div className="flex flex-wrap gap-3">
            {techStack.map((t) => (
              <span
                key={t.name}
                title={t.name}
                className="w-10 h-10 rounded-xl glass flex items-center justify-center text-muted"
              >
                <t.Icon className="w-5 h-5" />
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-line py-6 px-4 sm:px-6 md:px-12">
        <p className="text-xs text-muted text-center">
          © {new Date().getFullYear()} Echoes — built for the Superteam front-end listing. Devnet demo.
        </p>
        <p className="text-[11px] text-muted/60 text-center mt-2">
          Demo audio courtesy of SoundHelix.
        </p>
      </div>
    </footer>
  );
}
