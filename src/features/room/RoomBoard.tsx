import { Check, Eye, EyeOff, RotateCcw } from "lucide-react";
import { voteLabel } from "../../../shared/room";
import type { PublicParticipant, RoomSnapshot } from "../../../shared/protocol";
import { Button } from "../../components/Button";
import { Pill } from "../../components/Pill";
import type { ConnectionStatus } from "../../components/StatusPill";
import { cn } from "../../lib/cn";
import { pluralize } from "../../lib/format";
import { CardHand } from "./CardHand";
import { ParticipantGrid } from "./ParticipantGrid";
import { ResultsBar } from "./ResultsBar";
import type { RoomSocketActions } from "./useRoomSocket";

interface RoomBoardProps {
  snapshot: RoomSnapshot;
  status: ConnectionStatus;
  actions: RoomSocketActions;
}

export function RoomBoard({ snapshot, status, actions }: RoomBoardProps) {
  const connected = status === "open";
  const voting = snapshot.phase === "voting";
  const total = snapshot.participants.length;
  const votedCount = snapshot.participants.filter((participant) => participant.hasVoted).length;
  const waiting = snapshot.participants.filter((participant) => !participant.hasVoted);
  const selfWaiting = waiting.some((participant) => participant.id === snapshot.self.id);

  return (
    <div className="space-y-4">
      <h1 className="sr-only">
        Planning poker room {snapshot.code}, round {snapshot.round}
      </h1>

      <section className="poker-table relative overflow-hidden rounded-table border border-white/10 px-4 pb-6 pt-5 text-on-felt shadow-table sm:px-6 sm:pb-8 sm:pt-6">
        <div aria-hidden="true" className="felt-texture pointer-events-none absolute inset-0" />

        <TableSummary
          round={snapshot.round}
          deckName={snapshot.deck.name}
          total={total}
          voting={voting}
        />

        <div className="relative py-7 sm:py-9">
          <ParticipantGrid snapshot={snapshot} />
        </div>

        <div className="relative border-t border-white/10 pt-6" aria-live="polite">
          {voting ? (
            <VotingProgress
              votedCount={votedCount}
              total={total}
              waiting={waiting}
              selfId={snapshot.self.id}
            />
          ) : (
            <ResultsBar snapshot={snapshot} />
          )}
        </div>
      </section>

      <section className="sticky bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-20 rounded-tray border border-line bg-surface/95 p-3 shadow-tray backdrop-blur-xl sm:p-4">
        {voting ? (
          <VotingTray
            snapshot={snapshot}
            connected={connected}
            votedCount={votedCount}
            waitingCount={waiting.length}
            selfWaiting={selfWaiting}
            actions={actions}
          />
        ) : (
          <RevealedTray snapshot={snapshot} connected={connected} actions={actions} />
        )}
      </section>
    </div>
  );
}

interface TableSummaryProps {
  round: number;
  deckName: string;
  total: number;
  voting: boolean;
}

function TableSummary({ round, deckName, total, voting }: TableSummaryProps) {
  const VisibilityIcon = voting ? EyeOff : Eye;

  return (
    <div className="relative flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4 text-2xs text-on-felt/55">
      <div className="flex flex-wrap items-center gap-2">
        <Pill tone="felt-strong" size="sm">
          Round {round}
        </Pill>
        <span>{deckName}</span>
        <span aria-hidden="true">·</span>
        <span>{pluralize(total, "person", "people")}</span>
      </div>
      <span className="inline-flex items-center gap-1.5">
        <VisibilityIcon className="size-3.5" />
        {voting ? "Votes hidden" : "Cards revealed"}
      </span>
    </div>
  );
}

interface VotingProgressProps {
  votedCount: number;
  total: number;
  waiting: PublicParticipant[];
  selfId: string;
}

function VotingProgress({ votedCount, total, waiting, selfId }: VotingProgressProps) {
  const progress = total === 0 ? 0 : (votedCount / total) * 100;

  return (
    <div className="mx-auto max-w-lg text-center">
      <p className="font-display text-2xl font-semibold tracking-[-0.03em] text-on-felt sm:text-[1.7rem]">
        {votingHeadline(votedCount, total)}
      </p>
      <p className="mt-1.5 text-sm text-on-felt/55">{votingDetail(waiting, selfId)}</p>
      <div className="mx-auto mt-4 flex max-w-xs items-center gap-2.5">
        <span
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={votedCount}
          aria-label="Cards in"
        >
          <span
            className="block h-full rounded-full bg-gradient-to-r from-pink to-gold transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </span>
        <span className="text-2xs font-semibold tabular-nums text-on-felt/60">
          {votedCount}/{total}
        </span>
      </div>
    </div>
  );
}

interface VotingTrayProps {
  snapshot: RoomSnapshot;
  connected: boolean;
  votedCount: number;
  waitingCount: number;
  selfWaiting: boolean;
  actions: RoomSocketActions;
}

function VotingTray({
  snapshot,
  connected,
  votedCount,
  waitingCount,
  selfWaiting,
  actions,
}: VotingTrayProps) {
  return (
    <>
      <div className="mb-2 flex min-h-5 flex-wrap items-center justify-between gap-x-2 gap-y-1 px-1">
        <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-ink-muted">
          Your vote
          {snapshot.self.vote && (
            <Pill tone="accent" size="sm">
              <Check className="size-3" strokeWidth={3} />
              {voteLabel(snapshot.deck.id, snapshot.self.vote)}
            </Pill>
          )}
        </span>
        <span className="shrink-0 text-2xs text-ink-muted/65">
          {snapshot.self.vote ? "Tap it again to clear" : "Tap a card to pick"}
        </span>
      </div>

      <CardHand
        deck={snapshot.deck}
        selected={snapshot.self.vote}
        disabled={!connected}
        onSelect={actions.vote}
      />

      <div className="mt-3 flex flex-col gap-2 border-t border-line/70 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <p
          className={cn(
            "text-center text-2xs text-ink-muted sm:text-left",
            !connected && "text-gold",
            connected && selfWaiting && "text-pink-strong",
          )}
        >
          {trayMessage(connected, votedCount, waitingCount, selfWaiting)}
        </p>

        <Button
          size="lg"
          className="w-full sm:w-auto sm:min-w-48"
          disabled={!connected || votedCount === 0}
          onClick={actions.reveal}
        >
          <Eye className="size-4.5" />
          {votedCount === 0 ? "Reveal cards" : `Reveal ${pluralize(votedCount, "card")}`}
        </Button>
      </div>
    </>
  );
}

interface RevealedTrayProps {
  snapshot: RoomSnapshot;
  connected: boolean;
  actions: RoomSocketActions;
}

function RevealedTray({ snapshot, connected, actions }: RevealedTrayProps) {
  return (
    <div className="flex flex-col gap-3 p-1 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-center sm:text-left">
        <div className="text-xs font-medium text-ink-muted">Round {snapshot.round} revealed</div>
        <p className="mt-1 font-display text-lg font-semibold tracking-[-0.02em] text-ink">
          The cards are on the table.
        </p>
      </div>

      <div className="flex flex-col gap-1.5 sm:items-end">
        <Button
          size="lg"
          className="w-full sm:w-auto sm:min-w-48"
          disabled={!connected}
          onClick={actions.reset}
        >
          <RotateCcw className="size-4.5" />
          New round
        </Button>
        <span className={cn("text-center text-2xs text-ink-muted", !connected && "text-gold")}>
          {connected ? "Everyone can start a new round" : "Reconnecting to the table…"}
        </span>
      </div>
    </div>
  );
}

function votingHeadline(votedCount: number, total: number): string {
  if (votedCount === 0) return "Who is feeling brave?";
  if (votedCount === total) return "Everyone is in.";
  return `${votedCount} of ${total} cards are in`;
}

function votingDetail(waiting: PublicParticipant[], selfId: string): string {
  if (waiting.length === 0) {
    return "The table is ready. Reveal whenever you are.";
  }
  if (waiting.length === 1 && waiting[0].id === selfId) {
    return "Waiting on you. Pick a card from the tray below.";
  }
  return `Waiting on ${formatNames(waiting)}. Votes stay secret until the reveal.`;
}

function trayMessage(
  connected: boolean,
  votedCount: number,
  waitingCount: number,
  selfWaiting: boolean,
): string {
  if (!connected) return "Reconnecting to the table…";
  if (waitingCount === 0) return "Everyone is in · reveal when ready";
  if (selfWaiting) return "Your card is still open · pick one below";
  return `${pluralize(votedCount, "card")} in · ${waitingCount} still deciding`;
}

function formatNames(participants: PublicParticipant[]): string {
  const names = participants.map((participant) => participant.name);

  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  if (names.length === 3) return `${names[0]}, ${names[1]} and ${names[2]}`;
  return `${names[0]}, ${names[1]} and ${names.length - 2} more`;
}
