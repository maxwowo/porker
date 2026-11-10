import { DurableObject } from "cloudflare:workers";
import { DEFAULT_DECK_ID, isDeckId } from "../../shared/decks";
import { normalizeRoomCode } from "../../shared/codes";
import type { ClientMessage, RoomRecord } from "../../shared/protocol";
import {
  CLOSE_NORMAL,
  CLOSE_PROTOCOL_ERROR,
  CLOSE_ROOM_FULL,
  CLOSE_ROOM_GONE,
} from "../../shared/protocol";
import {
  castVote,
  createRoom,
  isRoomFull,
  joinRoom,
  removeParticipant,
  renameParticipant,
  resetRoom,
  revealRoom,
  toSnapshot,
} from "../../shared/room";
import {
  isValidParticipantId,
  MAX_MESSAGE_LENGTH,
  normalizeDisplayName,
  parseClientMessage,
  ROOM_TTL_MS,
} from "../../shared/validation";
import type { Env } from "./env";

const ROOM_STORAGE_KEY = "room";

interface SocketAttachment {
  participantId: string | null;
}

export class Room extends DurableObject<Env> {
  private room: RoomRecord | null = null;
  private readonly loaded: Promise<void>;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair("ping", "pong"));
    this.loaded = ctx.blockConcurrencyWhile(async () => {
      this.room = (await ctx.storage.get<RoomRecord>(ROOM_STORAGE_KEY)) ?? null;
    });
  }

  async fetch(request: Request): Promise<Response> {
    await this.loaded;

    const url = new URL(request.url);
    if (request.method === "POST" && url.pathname.endsWith("/create")) {
      return this.createRoom(request);
    }
    if (request.method === "GET" && url.pathname.endsWith("/info")) {
      return this.roomInfo();
    }
    if (request.method === "GET" && url.pathname.endsWith("/ws")) {
      return this.openSocket(request);
    }

    return json({ error: { code: "NOT_FOUND", message: "Not found." } }, 404);
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    await this.loaded;

    if (!this.room) {
      safeClose(ws, CLOSE_ROOM_GONE, "Room expired");
      return;
    }
    if (typeof message !== "string" || message.length > MAX_MESSAGE_LENGTH) {
      this.rejectSocket(ws, "INVALID_MESSAGE", "That message was not valid.");
      return;
    }

    const parsed = parseClientMessage(message);
    if (!parsed) {
      this.rejectSocket(ws, "INVALID_MESSAGE", "That message was not valid.");
      return;
    }

    const attachment = socketAttachment(ws);
    if (!attachment.participantId) {
      if (parsed.type !== "join") {
        this.rejectSocket(ws, "NOT_JOINED", "Join a room before playing.");
        return;
      }
      await this.handleJoin(ws, parsed);
      return;
    }

    if (parsed.type === "join") {
      if (parsed.participantId !== attachment.participantId) {
        this.rejectSocket(ws, "INVALID_PARTICIPANT", "That seat belongs to someone else.");
        return;
      }
      await this.handleJoin(ws, parsed);
      return;
    }

    await this.handleAction(ws, attachment.participantId, parsed);
  }

  async webSocketClose(
    _ws: WebSocket,
    _code: number,
    _reason: string,
    _wasClean: boolean,
  ): Promise<void> {
    await this.loaded;
    this.broadcast();
  }

  async webSocketError(_ws: WebSocket, _error: unknown): Promise<void> {
    await this.loaded;
    this.broadcast();
  }

  async alarm(): Promise<void> {
    for (const ws of this.ctx.getWebSockets()) {
      safeClose(ws, CLOSE_ROOM_GONE, "Room expired");
    }
    this.room = null;
    await this.ctx.storage.deleteAll();
  }

  private async createRoom(request: Request): Promise<Response> {
    const body: unknown = await request.json().catch(() => null);
    const record = body && typeof body === "object" ? (body as Record<string, unknown>) : null;

    const code = typeof record?.code === "string" ? normalizeRoomCode(record.code) : null;
    if (!code) {
      return json({ error: { code: "INVALID_CODE", message: "Invalid room code." } }, 400);
    }
    if (this.room) {
      return json({ error: { code: "ROOM_EXISTS", message: "That room already exists." } }, 409);
    }

    const deckId = isDeckId(record?.deckId) ? record.deckId : DEFAULT_DECK_ID;
    const room = createRoom(code, deckId, Date.now());
    this.room = room;
    await this.persist(room);

    return json({ code, deckId }, 201);
  }

  private roomInfo(): Response {
    if (!this.room) {
      return json({ error: { code: "ROOM_NOT_FOUND", message: "Room not found." } }, 404);
    }

    return json({
      code: this.room.code,
      deckId: this.room.deckId,
      phase: this.room.phase,
      round: this.room.round,
      participantCount: Object.keys(this.room.participants).length,
    });
  }

  private openSocket(request: Request): Response {
    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
      return json(
        { error: { code: "EXPECTED_WEBSOCKET", message: "Expected a WebSocket upgrade." } },
        426,
      );
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({ participantId: null } satisfies SocketAttachment);

    if (!this.room) {
      safeClose(server, CLOSE_ROOM_GONE, "Room not found");
    }

    return new Response(null, { status: 101, webSocket: client });
  }

  private async handleJoin(
    ws: WebSocket,
    message: Extract<ClientMessage, { type: "join" }>,
  ): Promise<void> {
    if (!this.room) {
      safeClose(ws, CLOSE_ROOM_GONE, "Room expired");
      return;
    }
    if (!isValidParticipantId(message.participantId)) {
      this.rejectSocket(ws, "INVALID_PARTICIPANT", "That participant ID is not valid.");
      return;
    }

    const name = normalizeDisplayName(message.name);
    if (!name) {
      this.rejectSocket(ws, "INVALID_NAME", "Use a name between 1 and 32 characters.");
      return;
    }

    const isNewParticipant = !this.room.participants[message.participantId];
    if (isNewParticipant && isRoomFull(this.room)) {
      send(ws, {
        type: "error",
        code: "ROOM_FULL",
        message: "This room is full.",
      });
      safeClose(ws, CLOSE_ROOM_FULL, "Room full");
      return;
    }

    ws.serializeAttachment({
      participantId: message.participantId,
    } satisfies SocketAttachment);

    const next = joinRoom(this.room, message.participantId, name, Date.now());
    await this.commit(next);
  }

  private async handleAction(
    ws: WebSocket,
    participantId: string,
    message: Exclude<ClientMessage, { type: "join" }>,
  ): Promise<void> {
    if (!this.room) {
      safeClose(ws, CLOSE_ROOM_GONE, "Room expired");
      return;
    }
    if (!this.room.participants[participantId]) {
      this.rejectSocket(ws, "NOT_JOINED", "Join a room before playing.");
      return;
    }

    const now = Date.now();

    switch (message.type) {
      case "vote": {
        await this.commit(castVote(this.room, participantId, message.card, now));
        return;
      }
      case "reveal": {
        await this.commit(revealRoom(this.room, now));
        return;
      }
      case "reset": {
        await this.commit(resetRoom(this.room, now));
        return;
      }
      case "rename": {
        const name = normalizeDisplayName(message.name);
        if (!name) {
          send(ws, {
            type: "error",
            code: "INVALID_NAME",
            message: "Use a name between 1 and 32 characters.",
          });
          return;
        }
        await this.commit(renameParticipant(this.room, participantId, name, now));
        return;
      }
      case "leave": {
        if (!this.room.participants[participantId]) return;
        const next = removeParticipant(this.room, participantId, now);
        await this.commit(next);
        for (const socket of this.ctx.getWebSockets()) {
          if (socketAttachment(socket).participantId === participantId) {
            safeClose(socket, CLOSE_NORMAL, "Left room");
          }
        }
        return;
      }
    }
  }

  private async commit(next: RoomRecord): Promise<void> {
    if (next === this.room) return;
    this.room = next;
    await this.persist(next);
    this.broadcast();
  }

  private async persist(room: RoomRecord): Promise<void> {
    await this.ctx.storage.put(ROOM_STORAGE_KEY, room);
    await this.ctx.storage.setAlarm(room.updatedAt + ROOM_TTL_MS);
  }

  private broadcast(): void {
    const room = this.room;
    if (!room) return;

    const sockets = this.ctx.getWebSockets();
    const connectedIds = new Set<string>();

    for (const ws of sockets) {
      const participantId = socketAttachment(ws).participantId;
      if (participantId && room.participants[participantId]) {
        connectedIds.add(participantId);
      }
    }

    for (const ws of sockets) {
      const participantId = socketAttachment(ws).participantId;
      if (!participantId || !room.participants[participantId]) continue;

      send(ws, {
        type: "state",
        snapshot: toSnapshot(room, participantId, connectedIds),
      });
    }
  }

  private rejectSocket(ws: WebSocket, code: string, message: string): void {
    send(ws, { type: "error", code, message });
    safeClose(ws, CLOSE_PROTOCOL_ERROR, message);
  }
}

function socketAttachment(ws: WebSocket): SocketAttachment {
  return (ws.deserializeAttachment() as SocketAttachment | null) ?? { participantId: null };
}

function send(ws: WebSocket, message: unknown): void {
  try {
    ws.send(JSON.stringify(message));
  } catch {
    // The socket is already closing; there is nothing else to do.
  }
}

function safeClose(ws: WebSocket, code: number, reason: string): void {
  try {
    ws.close(code, reason);
  } catch {
    // The socket is already closed.
  }
}

function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
