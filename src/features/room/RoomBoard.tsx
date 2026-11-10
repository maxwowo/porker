import { Eye, EyeOff, RotateCcw } from "lucide-react";
import type { RoomSnapshot } from "../../../shared/protocol";
import { Button } from "../../components/Button";
import type { ConnectionStatus } from "../../components/StatusPill";
import { cn } from "../../lib/cn";
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
  const votedCount = snapshot.participants.filter((participant) => participant.hasVoted).length;

  return (
    <div className="space-y-4">
      <h1 className="sr-only">
        Planning poker room {snapshot.code}, round {snapshot.round}
      </h1>
      <section className="poker-table relative overflow-hidden rounded-[2rem] border border-white/10 px-4 pb-6 pt-5 text-on-felt shadow-[0_32px_70px_-40px_rgba(7,40,33,0.9)] sm:px-6 sm:pb-8 sm:pt-6">
        <div aria-hidden="true" className="felt-texture pointer-events-none absolute inset-0" />

        <div className="relative flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4 text-[0.7rem] text-on-felt/55">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/10 px-2.5 py-1 font-semibold text-on-felt/85">
              Round {snapshot.round}
            </span>
            <span>{snapshot.deck.name}</span>
            <span aria-hidden="true">·</span>
            <span>
              {snapshot.participants.length}{" "}
              {snapshot.participants.length === 1 ? "person" : "people"}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5">
            {voting ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            {voting ? "Votes hidden" : "Cards revealed"}
          </span>
        </div>

        <div className="relative py-7 sm:py-9">
          <ParticipantGrid snapshot={snapshot} />
        </div>

        <div className="relative border-t border-white/10 pt-6" aria-live="polite">
          {voting ? (
            <div className="mx-auto max-w-lg text-center">
              <p className="font-display text-2xl font-semibold tracking-[-0.03em] text-on-felt sm:text-[1.7rem]">
                {votedCount === 0
                  ? "Who is feeling brave?"
                  : `${votedCount} of ${snapshot.participants.length} cards are in`}
              </p>
              <p className="mt-1.5 text-sm text-on-felt/55">
                {votedCount === 0
                  ? "Pick a card from the tray below to start the round."
                  : "Votes stay secret until someone reveals the cards."}
              </p>
            </div>
          ) : (
            <ResultsBar snapshot={snapshot} />
          )}
        </div>
      </section>

      <section className="sticky bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-20 rounded-[1.5rem] border border-line bg-surface/95 p-3 shadow-[0_22px_55px_-30px_rgba(45,24,21,0.55)] backdrop-blur-xl sm:p-4">
        {voting ? (
          <>
            <div className="mb-2 flex items-center justify-between gap-2 px-1">
              <span className="text-xs font-medium text-ink-muted">Your vote</span>
              <span className="text-[0.68rem] text-ink-muted/65">
                Tap your card again to clear it
              </span>
            </div>

            <CardHand
              deck={snapshot.deck}
              selected={snapshot.self.vote}
              disabled={!connected}
              onSelect={(card) => actions.vote(card)}
            />

            <div className="mt-3 flex flex-col gap-2 border-t border-line/70 pt-3 sm:flex-row sm:items-center sm:justify-between">
              <p
                className={cn(
                  "text-center text-[0.7rem] text-ink-muted sm:text-left",
                  !connected && "text-gold",
                )}
              >
                {!connected
                  ? "Reconnecting to the table…"
                  : votedCount === 0
                    ? "Pick a card to reveal"
                    : `${votedCount} ${votedCount === 1 ? "card" : "cards"} ready · everyone can reveal`}
              </p>

              <Button
                size="lg"
                className="w-full sm:w-auto sm:min-w-48"
                disabled={!connected || votedCount === 0}
                onClick={actions.reveal}
              >
                <Eye className="size-4.5" />
                {votedCount === 0
                  ? "Reveal cards"
                  : `Reveal ${votedCount} ${votedCount === 1 ? "card" : "cards"}`}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-3 p-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-center sm:text-left">
              <div className="text-xs font-medium text-ink-muted">
                Round {snapshot.round} revealed
              </div>
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
              <span
                className={cn(
                  "text-center text-[0.68rem] text-ink-muted",
                  !connected && "text-gold",
                )}
              >
                {connected ? "Everyone can start a new round" : "Reconnecting to the table…"}
              </span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
