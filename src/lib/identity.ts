import { isValidParticipantId } from "../../shared/validation";
import { readJson, removeKey, writeJson } from "./storage";

const NAME_KEY = "porker:name";

interface StoredIdentity {
  participantId: string;
}

function identityKey(code: string): string {
  return `porker:identity:${code.toUpperCase()}`;
}

export function loadName(): string {
  const value = readJson<unknown>(NAME_KEY);
  return typeof value === "string" ? value : "";
}

export function saveName(name: string): void {
  writeJson(NAME_KEY, name);
}

export function forgetName(): void {
  removeKey(NAME_KEY);
}

export function peekIdentity(code: string): StoredIdentity | null {
  const identity = readJson<StoredIdentity>(identityKey(code));
  return identity && isValidParticipantId(identity.participantId) ? identity : null;
}

export function getOrCreateIdentity(code: string): StoredIdentity {
  const existing = peekIdentity(code);
  if (existing) return existing;

  const identity = { participantId: crypto.randomUUID() };
  writeJson(identityKey(code), identity);
  return identity;
}
