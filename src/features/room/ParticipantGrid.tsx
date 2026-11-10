import type { RoomSnapshot } from "../../../shared/protocol";
import { ParticipantTile } from "./ParticipantTile";

interface ParticipantGridProps {
  snapshot: RoomSnapshot;
}

export function ParticipantGrid({ snapshot }: ParticipantGridProps) {
  return (
    <div className="flex flex-wrap items-start justify-center gap-x-3 gap-y-5 px-1 sm:gap-x-5">
      {snapshot.participants.map((participant, index) => (
        <ParticipantTile
          key={participant.id}
          participant={participant}
          deckId={snapshot.deck.id}
          revealed={snapshot.phase === "revealed"}
          isSelf={participant.id === snapshot.self.id}
          selfVote={snapshot.self.vote}
          revealDelay={snapshot.phase === "revealed" ? index * 40 : 0}
        />
      ))}
    </div>
  );
}
