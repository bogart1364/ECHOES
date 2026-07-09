export function PlayIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M7 5.5c0-1.03 1.13-1.65 1.99-1.1l10.4 6.5a1.3 1.3 0 0 1 0 2.2l-10.4 6.5C8.13 20.15 7 19.53 7 18.5v-13Z" />
    </svg>
  );
}

export function PauseIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <rect x="6" y="5" width="4.5" height="14" rx="1.2" />
      <rect x="13.5" y="5" width="4.5" height="14" rx="1.2" />
    </svg>
  );
}

/* ---- Tech-stack marks (simple abstract glyphs, not literal brand logos) ---- */

export function SolanaMark({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 7.5h13.5L20 5.5H6.5L4 7.5Z" fill="currentColor" />
      <path d="M4 12.3h13.5l2.5-2h-13.5l-2.5 2Z" fill="currentColor" opacity="0.7" />
      <path d="M4 17.1h13.5l2.5-2h-13.5l-2.5 2Z" fill="currentColor" opacity="0.45" />
    </svg>
  );
}

export function VercelMark({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 3.5 21 19H3L12 3.5Z" />
    </svg>
  );
}

export function PrivyMark({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M12 3 5 6v5.5c0 4.2 2.9 7.4 7 8.5 4.1-1.1 7-4.3 7-8.5V6l-7-3Z" strokeLinejoin="round" />
      <path d="M9 12.2l2 2 4-4.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ElevenLabsMark({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <rect x="3.5" y="9" width="2.6" height="6" rx="1.3" />
      <rect x="8.2" y="5" width="2.6" height="14" rx="1.3" />
      <rect x="12.9" y="2" width="2.6" height="20" rx="1.3" />
      <rect x="17.6" y="6.5" width="2.6" height="11" rx="1.3" />
    </svg>
  );
}

export function NextMark({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 8.2v7.6M9 8.2l6 7.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
