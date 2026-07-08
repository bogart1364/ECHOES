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
