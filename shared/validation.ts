import type { ClientMessage } from "./protocol";

export const MAX_PARTICIPANTS = 50;
export const MAX_NAME_LENGTH = 32;
export const MAX_MESSAGE_LENGTH = 4096;
export const ROOM_TTL_MS = 24 * 60 * 60 * 1000;

const PARTICIPANT_ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;
const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/g;

export function normalizeDisplayName(input: unknown): string | null {
  if (typeof input !== "string") return null;

  const name = input.normalize("NFKC").replace(CONTROL_CHARACTERS, "").replace(/\s+/g, " ").trim();

  const length = Array.from(name).length;
  return length >= 1 && length <= MAX_NAME_LENGTH ? name : null;
}

export function isValidParticipantId(input: unknown): input is string {
  return typeof input === "string" && PARTICIPANT_ID_PATTERN.test(input);
}

export function parseClientMessage(raw: string): ClientMessage | null {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!value || typeof value !== "object") return null;
  const message = value as Record<string, unknown>;

  switch (message.type) {
    case "join":
      return typeof message.participantId === "string" && typeof message.name === "string"
        ? { type: "join", participantId: message.participantId, name: message.name }
        : null;
    case "vote":
      return message.card === null || typeof message.card === "string"
        ? { type: "vote", card: message.card }
        : null;
    case "rename":
      return typeof message.name === "string" ? { type: "rename", name: message.name } : null;
    case "reveal":
    case "reset":
    case "leave":
      return { type: message.type };
    default:
      return null;
  }
}
