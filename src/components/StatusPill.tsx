import { cn } from "../lib/cn";
import { Pill } from "./Pill";

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
    <Pill aria-live="polite" className={className}>
      <span className={cn("size-2 rounded-full", dot, pulsing && "animate-pulse")} />
      {label}
    </Pill>
  );
}
