import { DurableObject } from "cloudflare:workers";
import { DEFAULT_DECK_ID, isDeckId } from "../../shared/decks";
import { normalizeRoomCode } from "../../shared/codes";
import { errorJson, isWebSocketUpgrade, json, readJsonObject } from "../../shared/http";
import type { ClientMessage, RoomInfo, RoomRecord } from "../../shared/protocol";
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
  NAME_REQUIREMENT,
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

    return errorJson(404, "NOT_FOUND", "Not found.");
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    await this.loaded;

    if (!this.room) {
      tryClose(ws, CLOSE_ROOM_GONE, "Room expired");
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

    const { participantId } = socketAttachment(ws);

    if (!participantId) {
      if (parsed.type !== "join") {
        this.rejectSocket(ws, "NOT_JOINED", "Join a room before playing.");
        return;
      }
      await this.handleJoin(ws, parsed);
      return;
    }

    if (parsed.type === "join") {
      if (parsed.participantId !== participantId) {
        this.rejectSocket(ws, "INVALID_PARTICIPANT", "That seat belongs to someone else.");
        return;
      }
      await this.handleJoin(ws, parsed);
      return;
    }

    await this.handleAction(ws, participantId, parsed);
  }

  async webSocketClose(): Promise<void> {
    await this.loaded;
    this.broadcast();
  }

  async webSocketError(): Promise<void> {
    await this.loaded;
    this.broadcast();
  }

  async alarm(): Promise<void> {
    for (const ws of this.ctx.getWebSockets()) {
      tryClose(ws, CLOSE_ROOM_GONE, "Room expired");
    }
    this.room = null;
    await this.ctx.storage.deleteAll();
  }

  private async createRoom(request: Request): Promise<Response> {
    const body = await readJsonObject(request);
    const code = typeof body?.code === "string" ? normalizeRoomCode(body.code) : null;

    if (!code) {
      return errorJson(400, "INVALID_CODE", "Invalid room code.");
    }
    if (this.room) {
      return errorJson(409, "ROOM_EXISTS", "That room already exists.");
    }

    const deckId = isDeckId(body?.deckId) ? body.deckId : DEFAULT_DECK_ID;
    const room = createRoom(code, deckId, Date.now());
    this.room = room;
    await this.persist(room);

    return json({ code, deckId }, 201);
  }

  private roomInfo(): Response {
    if (!this.room) {
      return errorJson(404, "ROOM_NOT_FOUND", "Room not found.");
    }

    return json({
      code: this.room.code,
      deckId: this.room.deckId,
      phase: this.room.phase,
      round: this.room.round,
      participantCount: Object.keys(this.room.participants).length,
    } satisfies RoomInfo);
  }

  private openSocket(request: Request): Response {
    if (!isWebSocketUpgrade(request)) {
      return errorJson(426, "EXPECTED_WEBSOCKET", "Expected a WebSocket upgrade.");
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({ participantId: null } satisfies SocketAttachment);

    if (!this.room) {
      tryClose(server, CLOSE_ROOM_GONE, "Room not found");
    }

    return new Response(null, { status: 101, webSocket: client });
  }

  private async handleJoin(
    ws: WebSocket,
    message: Extract<ClientMessage, { type: "join" }>,
  ): Promise<void> {
    if (!this.room) {
      tryClose(ws, CLOSE_ROOM_GONE, "Room expired");
      return;
    }
    if (!isValidParticipantId(message.participantId)) {
      this.rejectSocket(ws, "INVALID_PARTICIPANT", "That participant ID is not valid.");
      return;
    }

    const name = normalizeDisplayName(message.name);
    if (!name) {
      this.rejectSocket(ws, "INVALID_NAME", NAME_REQUIREMENT);
      return;
    }

    const isNewParticipant = !this.room.participants[message.participantId];
    if (isNewParticipant && isRoomFull(this.room)) {
      trySend(ws, { type: "error", code: "ROOM_FULL", message: "This room is full." });
      tryClose(ws, CLOSE_ROOM_FULL, "Room full");
      return;
    }

    ws.serializeAttachment({ participantId: message.participantId } satisfies SocketAttachment);

    const next = joinRoom(this.room, message.participantId, name, Date.now());
    await this.commit(next);
  }

  private async handleAction(
    ws: WebSocket,
    participantId: string,
    message: Exclude<ClientMessage, { type: "join" }>,
  ): Promise<void> {
    if (!this.room) {
      tryClose(ws, CLOSE_ROOM_GONE, "Room expired");
      return;
    }
    if (!this.room.participants[participantId]) {
      this.rejectSocket(ws, "NOT_JOINED", "Join a room before playing.");
      return;
    }

    const now = Date.now();

    switch (message.type) {
      case "vote":
        await this.commit(castVote(this.room, participantId, message.card, now));
        return;
      case "reveal":
        await this.commit(revealRoom(this.room, now));
        return;
      case "reset":
        await this.commit(resetRoom(this.room, now));
        return;
      case "rename": {
        const name = normalizeDisplayName(message.name);
        if (!name) {
          trySend(ws, { type: "error", code: "INVALID_NAME", message: NAME_REQUIREMENT });
          return;
        }
        await this.commit(renameParticipant(this.room, participantId, name, now));
        return;
      }
      case "leave":
        await this.commit(removeParticipant(this.room, participantId, now));
        this.closeSocketsFor(participantId);
        return;
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

    const recipients = this.ctx.getWebSockets().flatMap((socket) => {
      const { participantId } = socketAttachment(socket);
      return participantId && room.participants[participantId] ? [{ socket, participantId }] : [];
    });
    const connectedIds = new Set(recipients.map(({ participantId }) => participantId));

    for (const { socket, participantId } of recipients) {
      trySend(socket, {
        type: "state",
        snapshot: toSnapshot(room, participantId, connectedIds),
      });
    }
  }

  private closeSocketsFor(participantId: string): void {
    for (const socket of this.ctx.getWebSockets()) {
      if (socketAttachment(socket).participantId === participantId) {
        tryClose(socket, CLOSE_NORMAL, "Left room");
      }
    }
  }

  private rejectSocket(ws: WebSocket, code: string, message: string): void {
    trySend(ws, { type: "error", code, message });
    tryClose(ws, CLOSE_PROTOCOL_ERROR, message);
  }
}

function socketAttachment(ws: WebSocket): SocketAttachment {
  return (ws.deserializeAttachment() as SocketAttachment | null) ?? { participantId: null };
}

function trySend(ws: WebSocket, message: unknown): void {
  try {
    ws.send(JSON.stringify(message));
  } catch {
    return;
  }
}

function tryClose(ws: WebSocket, code: number, reason: string): void {
  try {
    ws.close(code, reason);
  } catch {
    return;
  }
}
