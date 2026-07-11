"use client";

import { useState } from "react";
import { useToast } from "@/lib/ToastContext";

export default function ShareMenu({ url, title }: { url: string; title: string }) {
  const [open, setOpen] = useState(false);
  const { push } = useToast();

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`${title} — on Echoes`);

  const platforms = [
    { label: "X", href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}` },
    { label: "Telegram", href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
  ];

  function copyForDiscord() {
    navigator.clipboard
      .writeText(`${title} — ${url}`)
      .then(() => push("Copied — paste it into Discord.", "success"));
    setOpen(false);
  }

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => push("Link copied.", "success"));
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-sm border border-line rounded-full px-4 py-2.5 text-muted hover:text-bone transition"
      >
        Share
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="glass-strong absolute top-full mt-2 right-0 w-52 rounded-xl p-2 z-20">
            {platforms.map((p) => (
              <a
                key={p.label}
                href={p.href}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 text-sm text-bone hover:bg-ink/40 rounded-lg transition"
              >
                Share on {p.label}
              </a>
            ))}
            <button
              onClick={copyForDiscord}
              className="block w-full text-left px-3 py-2.5 text-sm text-bone hover:bg-ink/40 rounded-lg transition"
            >
              Copy for Discord
            </button>
            <div className="border-t border-line my-1" />
            <button
              onClick={copyLink}
              className="block w-full text-left px-3 py-2.5 text-sm text-muted hover:bg-ink/40 rounded-lg transition"
            >
              Copy link
            </button>
          </div>
        </>
      )}
    </div>
  );
}
