import { findCard, getDeck, isCardValue } from "./decks";
import type { DeckId } from "./decks";
import type { RoomRecord, RoomSnapshot } from "./protocol";
import { MAX_PARTICIPANTS } from "./validation";

export function createRoom(code: string, deckId: DeckId, now: number): RoomRecord {
  return {
    code,
    deckId,
    phase: "voting",
    round: 1,
    participants: {},
    version: 1,
    createdAt: now,
    updatedAt: now,
  };
}

export function joinRoom(
  room: RoomRecord,
  participantId: string,
  name: string,
  now: number,
): RoomRecord {
  const existing = room.participants[participantId];

  return advance(room, now, {
    participants: {
      ...room.participants,
      [participantId]: {
        id: participantId,
        name,
        joinedAt: existing?.joinedAt ?? now,
        vote: existing?.vote ?? null,
      },
    },
  });
}

export function castVote(
  room: RoomRecord,
  participantId: string,
  card: string | null,
  now: number,
): RoomRecord {
  const participant = room.participants[participantId];
  if (!participant || room.phase !== "voting") return room;
  if (card !== null && !isCardValue(getDeck(room.deckId), card)) return room;
  if (participant.vote === card) return room;

  return advance(room, now, {
    participants: {
      ...room.participants,
      [participantId]: { ...participant, vote: card },
    },
  });
}

export function revealRoom(room: RoomRecord, now: number): RoomRecord {
  if (room.phase !== "voting") return room;
  return advance(room, now, { phase: "revealed" });
}

export function resetRoom(room: RoomRecord, now: number): RoomRecord {
  if (room.phase !== "revealed") return room;

  const participants = Object.fromEntries(
    Object.entries(room.participants).map(([id, participant]) => [
      id,
      { ...participant, vote: null },
    ]),
  );

  return advance(room, now, {
    phase: "voting",
    round: room.round + 1,
    participants,
  });
}

export function renameParticipant(
  room: RoomRecord,
  participantId: string,
  name: string,
  now: number,
): RoomRecord {
  const participant = room.participants[participantId];
  if (!participant || participant.name === name) return room;

  return advance(room, now, {
    participants: {
      ...room.participants,
      [participantId]: { ...participant, name },
    },
  });
}

export function removeParticipant(
  room: RoomRecord,
  participantId: string,
  now: number,
): RoomRecord {
  if (!room.participants[participantId]) return room;

  const participants = { ...room.participants };
  delete participants[participantId];
  return advance(room, now, { participants });
}

export function isRoomFull(room: RoomRecord): boolean {
  return Object.keys(room.participants).length >= MAX_PARTICIPANTS;
}

export function toSnapshot(
  room: RoomRecord,
  viewerId: string,
  connectedIds: ReadonlySet<string>,
): RoomSnapshot {
  const deck = getDeck(room.deckId);
  const participants = Object.values(room.participants)
    .sort((a, b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id))
    .map((participant) => ({
      id: participant.id,
      name: participant.name,
      connected: connectedIds.has(participant.id),
      hasVoted: participant.vote !== null,
      vote: room.phase === "revealed" || participant.id === viewerId ? participant.vote : null,
    }));

  return {
    code: room.code,
    deck,
    phase: room.phase,
    round: room.round,
    participants,
    self: {
      id: viewerId,
      vote: room.participants[viewerId]?.vote ?? null,
    },
    version: room.version,
  };
}

export function voteLabel(deckId: DeckId, value: string): string {
  const deck = getDeck(deckId);
  return findCard(deck, value)?.label ?? value;
}

function advance(
  room: RoomRecord,
  now: number,
  changes: Partial<Omit<RoomRecord, "version" | "updatedAt">>,
): RoomRecord {
  return {
    ...room,
    ...changes,
    version: room.version + 1,
    updatedAt: now,
  };
}
