import { Link } from "react-router-dom";
import { cn } from "../lib/cn";

export function PigMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <path d="M17.2 24.2C12.6 16.4 12.9 12 15.8 11.6c2.9-.4 7 2.8 9.8 6.6" fill="currentColor" />
      <path d="M46.8 24.2C51.4 16.4 51.1 12 48.2 11.6c-2.9-.4-7 2.8-9.8 6.6" fill="currentColor" />
      <ellipse cx="32" cy="35" rx="21" ry="18.5" fill="currentColor" />
      <ellipse cx="32" cy="42" rx="9.2" ry="6.8" fill="#FFF8F2" opacity="0.42" />
      <circle cx="28.7" cy="41.5" r="1.4" fill="#3B2026" opacity="0.78" />
      <circle cx="35.3" cy="41.5" r="1.4" fill="#3B2026" opacity="0.78" />
      <circle cx="25.4" cy="31.3" r="1.8" fill="#3B2026" />
      <circle cx="38.6" cy="31.3" r="1.8" fill="#3B2026" />
      <circle cx="26" cy="30.8" r="0.55" fill="white" opacity="0.9" />
      <circle cx="39.2" cy="30.8" r="0.55" fill="white" opacity="0.9" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn(
        "inline-flex items-center gap-2.5 rounded-control focus-visible:outline-offset-4",
        className,
      )}
      aria-label="Porker home"
    >
      <span className="grid size-9 place-items-center rounded-[0.9rem] bg-pink-soft text-pink-strong ring-1 ring-pink/20">
        <PigMark className="size-6" />
      </span>
      <span className="font-display text-[1.35rem] font-bold tracking-[-0.03em] text-ink">
        Porker
      </span>
    </Link>
  );
}
