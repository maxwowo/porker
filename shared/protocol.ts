import type { Deck, DeckId } from "./decks";

export type RoomPhase = "voting" | "revealed";

export interface ParticipantRecord {
  id: string;
  name: string;
  joinedAt: number;
  vote: string | null;
}

export interface RoomRecord {
  code: string;
  deckId: DeckId;
  phase: RoomPhase;
  round: number;
  participants: Record<string, ParticipantRecord>;
  version: number;
  createdAt: number;
  updatedAt: number;
}

export interface PublicParticipant {
  id: string;
  name: string;
  connected: boolean;
  hasVoted: boolean;
  vote: string | null;
}

export interface RoomSnapshot {
  code: string;
  deck: Deck;
  phase: RoomPhase;
  round: number;
  participants: PublicParticipant[];
  self: {
    id: string;
    vote: string | null;
  };
  version: number;
}

export interface RoomInfo {
  code: string;
  deckId: DeckId;
  phase: RoomPhase;
  round: number;
  participantCount: number;
}

export type ClientMessage =
  | { type: "join"; participantId: string; name: string }
  | { type: "vote"; card: string | null }
  | { type: "reveal" }
  | { type: "reset" }
  | { type: "rename"; name: string }
  | { type: "leave" };

export type ServerMessage =
  { type: "state"; snapshot: RoomSnapshot } | { type: "error"; code: string; message: string };

export const CLOSE_NORMAL = 1000;
export const CLOSE_ROOM_GONE = 4001;
export const CLOSE_ROOM_FULL = 4002;
export const CLOSE_PROTOCOL_ERROR = 4003;

export const FATAL_CLOSE_CODES = new Set([CLOSE_ROOM_GONE, CLOSE_ROOM_FULL, CLOSE_PROTOCOL_ERROR]);
