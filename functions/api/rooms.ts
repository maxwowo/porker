import { DEFAULT_DECK_ID, isDeckId } from "../../shared/decks";
import { generateRoomCode } from "../../shared/codes";
import type { Env } from "../_lib/env";
import { errorJson, isTrustedOrigin, json } from "../_lib/http";
import { roomStub } from "../_lib/room";

const CREATE_ATTEMPTS = 5;

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!isTrustedOrigin(request)) {
    return errorJson(403, "ORIGIN_NOT_ALLOWED", "This request came from an untrusted origin.");
  }

  const body: unknown = await request.json().catch(() => null);
  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  const requestedDeck = record?.deckId;

  if (requestedDeck !== undefined && !isDeckId(requestedDeck)) {
    return errorJson(400, "INVALID_DECK", "Choose one of the available decks.");
  }

  const deckId = isDeckId(requestedDeck) ? requestedDeck : DEFAULT_DECK_ID;

  for (let attempt = 0; attempt < CREATE_ATTEMPTS; attempt += 1) {
    try {
      const code = generateRoomCode();
      const response = await roomStub(env, code).fetch(
        new Request("https://room.internal/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, deckId }),
        }),
      );

      if (response.status === 201) {
        return json({ code, deckId }, 201);
      }
      if (response.status !== 409) {
        return errorJson(502, "ROOM_CREATE_FAILED", "The room could not be created.");
      }
    } catch {
      return errorJson(502, "ROOM_CREATE_FAILED", "The room could not be created.");
    }
  }

  return errorJson(503, "ROOM_CODE_UNAVAILABLE", "No room code was available. Try again.");
};
