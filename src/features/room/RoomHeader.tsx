import { Check, Copy, LogOut, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";
import { Logo } from "../../components/Logo";
import { Pill } from "../../components/Pill";
import { StatusPill } from "../../components/StatusPill";
import type { ConnectionStatus } from "../../components/StatusPill";
import { ThemeToggle } from "../../components/ThemeToggle";
import { copyText } from "../../lib/clipboard";

interface RoomHeaderProps {
  code: string;
  status: ConnectionStatus | null;
  participantCount: number;
  onLeave: () => void;
}

export function RoomHeader({ code, status, participantCount, onLeave }: RoomHeaderProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copyLink() {
    const copiedOk = await copyText(`${window.location.origin}/r/${code}`);
    if (copiedOk) setCopied(true);
  }

  return (
    <header className="flex flex-wrap items-center gap-x-2 gap-y-2">
      <Logo className="mr-auto" />

      <div className="order-3 flex w-full flex-wrap items-center gap-2 sm:order-1 sm:w-auto">
        <Button
          variant="secondary"
          size="sm"
          shape="pill"
          onClick={copyLink}
          aria-label="Copy room link"
        >
          <span className="font-display font-semibold tracking-[0.18em]">{code}</span>
          {copied ? (
            <Check className="size-3.5 text-good" strokeWidth={3} />
          ) : (
            <Copy className="size-3.5 text-ink-muted" />
          )}
          <span className="sr-only" aria-live="polite">
            {copied ? "Room link copied" : ""}
          </span>
        </Button>

        {status && <StatusPill status={status} />}

        <Pill>
          <Users className="size-3.5" />
          {participantCount}
          <span className="sr-only">people at the table</span>
        </Pill>
      </div>

      <div className="order-2 flex items-center gap-1">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onLeave();
            navigate("/");
          }}
        >
          <LogOut className="size-4" />
          <span className="hidden sm:inline">Leave</span>
          <span className="sr-only sm:hidden">Leave room</span>
        </Button>
      </div>
    </header>
  );
}
