import { Check } from "lucide-react";
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
  const hasVote = participant.hasVoted;
  const showFace = hasVote && (revealed || isSelf);
  const label = vote === null ? "" : voteLabel(deckId, vote);
  const status = participantStatus(participant, revealed);
  const showPickedBadge = hasVote && !revealed;
  const cardFace = showFace ? "front" : hasVote ? "back" : "empty";

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

      <div className="relative mt-4">
        <PlayingCard
          face={cardFace}
          label={showFace ? label : ""}
          size="sm"
          className={cn(
            isSelf && !revealed && "ring-2 ring-pink/80 ring-offset-2 ring-offset-felt",
            !isSelf && showPickedBadge && "ring-2 ring-gold/70 ring-offset-2 ring-offset-felt",
            revealed && hasVote && "card-reveal",
          )}
          style={revealed && hasVote ? { animationDelay: `${revealDelay}ms` } : undefined}
        />

        {showPickedBadge && (
          <span
            aria-hidden="true"
            className={cn(
              "absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full shadow-[0_2px_7px_rgba(7,40,33,0.5)] ring-2 ring-felt",
              isSelf ? "bg-pink text-on-pink" : "bg-gold text-felt-deep",
            )}
          >
            <Check className="size-3" strokeWidth={3.5} />
          </span>
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
      <span
        className={cn(
          "mt-1 inline-flex items-center gap-1.5 text-[0.65rem] font-medium",
          status.text,
        )}
      >
        <span className={cn("size-1.5 rounded-full", status.dot)} />
        {status.label}
      </span>
      {showFace && label && <span className="sr-only">Voted {label}</span>}
    </div>
  );
}

interface ParticipantStatus {
  label: string;
  dot: string;
  text: string;
}

function participantStatus(participant: PublicParticipant, revealed: boolean): ParticipantStatus {
  if (!participant.connected) {
    return { label: "Away", dot: "bg-on-felt/25", text: "text-on-felt/40" };
  }

  if (revealed) {
    return participant.hasVoted
      ? { label: "Revealed", dot: "bg-good", text: "text-on-felt/65" }
      : { label: "No card", dot: "bg-on-felt/25", text: "text-on-felt/45" };
  }

  return participant.hasVoted
    ? { label: "Card in", dot: "bg-good", text: "text-on-felt/80" }
    : { label: "Waiting", dot: "bg-gold", text: "text-on-felt/70" };
}
