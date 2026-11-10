import { voteLabel } from "../../../shared/room";
import type { DeckId } from "../../../shared/decks";
import type { PublicParticipant } from "../../../shared/protocol";
import { Avatar } from "../../components/Avatar";
import { PlayingCard } from "../../components/PlayingCard";
import { cn } from "../../lib/cn";

interface ParticipantTileProps {
  participant: PublicParticipant;
  deckId: DeckId;
  revealed: boolean;
  isSelf: boolean;
  selfVote: string | null;
  revealDelay: number;
}

export function ParticipantTile({
  participant,
  deckId,
  revealed,
  isSelf,
  selfVote,
  revealDelay,
}: ParticipantTileProps) {
  const vote = isSelf ? (selfVote ?? participant.vote) : participant.vote;
  const showFace = vote !== null && (revealed || isSelf);
  const label = vote ? voteLabel(deckId, vote) : "";

  return (
    <div
      className={cn(
        "flex w-[4.6rem] flex-col items-center text-center sm:w-20",
        !participant.connected && "opacity-45",
      )}
    >
      <div className="relative">
        <Avatar name={participant.name} participantId={participant.id} size="md" />
        <span
          role="img"
          className={cn(
            "absolute bottom-0 right-0 size-3 rounded-full border-2 border-felt",
            participant.connected ? "bg-good" : "bg-on-felt/30",
          )}
          aria-label={participant.connected ? "Connected" : "Away"}
        />
      </div>

      <div className="mt-2.5">
        {vote === null ? (
          <PlayingCard face="empty" size="sm" />
        ) : (
          <div className="h-[4.35rem] w-[3.25rem] [perspective:600px]">
            <div
              className={cn(
                "relative h-full w-full transition-transform duration-500 ease-out [transform-style:preserve-3d]",
                showFace && "[transform:rotateY(180deg)]",
              )}
              style={{ transitionDelay: `${revealDelay}ms` }}
            >
              <div className="absolute inset-0 [backface-visibility:hidden]">
                <PlayingCard face="back" size="sm" />
              </div>
              <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden]">
                <PlayingCard face="front" label={label} size="sm" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 flex max-w-full items-center gap-1">
        <span className="truncate text-xs font-medium text-on-felt">{participant.name}</span>
        {isSelf && (
          <span className="shrink-0 rounded-full bg-white/10 px-1.5 py-0.5 text-[0.58rem] font-semibold uppercase tracking-wide text-on-felt/65">
            you
          </span>
        )}
      </div>
      <span className="mt-0.5 text-[0.65rem] text-on-felt/60">
        {statusLabel(participant, revealed)}
      </span>
      {showFace && label && <span className="sr-only">Voted {label}</span>}
    </div>
  );
}

function statusLabel(participant: PublicParticipant, revealed: boolean): string {
  if (!participant.connected) return "Away";
  if (revealed) return participant.hasVoted ? "Revealed" : "No card";
  return participant.hasVoted ? "Card in" : "Thinking";
}
