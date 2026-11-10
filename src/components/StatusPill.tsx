import { cn } from "../lib/cn";

export type ConnectionStatus = "connecting" | "open" | "reconnecting" | "closed";

const labels: Record<ConnectionStatus, string> = {
  connecting: "Connecting",
  open: "Live",
  reconnecting: "Reconnecting",
  closed: "Offline",
};

const dots: Record<ConnectionStatus, string> = {
  connecting: "bg-gold",
  open: "bg-good",
  reconnecting: "bg-gold",
  closed: "bg-danger",
};

export function StatusPill({
  status,
  className,
}: {
  status: ConnectionStatus;
  className?: string;
}) {
  const active = status === "connecting" || status === "reconnecting";

  return (
    <span
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-full border border-line bg-surface px-3 text-xs font-medium text-ink-muted",
        className,
      )}
      aria-live="polite"
    >
      <span className={cn("size-2 rounded-full", dots[status], active && "animate-pulse")} />
      {labels[status]}
    </span>
  );
}
