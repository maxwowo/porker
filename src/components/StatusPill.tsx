import { cn } from "../lib/cn";

export type ConnectionStatus = "connecting" | "open" | "reconnecting" | "closed";

interface StatusStyle {
  label: string;
  dot: string;
  pulsing?: boolean;
}

const statuses: Record<ConnectionStatus, StatusStyle> = {
  connecting: { label: "Connecting", dot: "bg-gold", pulsing: true },
  open: { label: "Live", dot: "bg-good" },
  reconnecting: { label: "Reconnecting", dot: "bg-gold", pulsing: true },
  closed: { label: "Offline", dot: "bg-danger" },
};

export function StatusPill({
  status,
  className,
}: {
  status: ConnectionStatus;
  className?: string;
}) {
  const { label, dot, pulsing } = statuses[status];

  return (
    <span
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-full border border-line bg-surface px-3 text-xs font-medium text-ink-muted",
        className,
      )}
      aria-live="polite"
    >
      <span className={cn("size-2 rounded-full", dot, pulsing && "animate-pulse")} />
      {label}
    </span>
  );
}
