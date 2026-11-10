import type { RoomSnapshot } from "../../../shared/protocol";
import { ParticipantTile } from "./ParticipantTile";

interface ParticipantGridProps {
  snapshot: RoomSnapshot;
}

export function ParticipantGrid({ snapshot }: ParticipantGridProps) {
  const revealed = snapshot.phase === "revealed";

  return (
    <ul
      className="flex flex-wrap items-start justify-center gap-x-3 gap-y-5 px-1 sm:gap-x-5"
      aria-label="People at the table"
    >
      {snapshot.participants.map((participant, index) => (
        <li key={participant.id}>
          <ParticipantTile
            participant={participant}
            deckId={snapshot.deck.id}
            revealed={revealed}
            isSelf={participant.id === snapshot.self.id}
            revealDelay={revealed ? index * 40 : 0}
          />
        </li>
      ))}
    </ul>
  );
}
