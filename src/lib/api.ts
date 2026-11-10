import type { DeckId } from "../../shared/decks";
import type { RoomInfo } from "../../shared/protocol";

interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
  };
}

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

async function readError(response: Response): Promise<ApiError> {
  const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
  return new ApiError(
    body?.error?.message ?? "Something went wrong. Try again.",
    body?.error?.code ?? "UNKNOWN",
    response.status,
  );
}

export async function createRoom(deckId: DeckId): Promise<{ code: string }> {
  const response = await fetch("/api/rooms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deckId }),
  });

  if (!response.ok) throw await readError(response);
  return (await response.json()) as { code: string };
}

export async function getRoom(code: string): Promise<RoomInfo | null> {
  const response = await fetch(`/api/rooms/${encodeURIComponent(code)}`);

  if (response.status === 404) return null;
  if (!response.ok) throw await readError(response);

  return (await response.json()) as RoomInfo;
}
