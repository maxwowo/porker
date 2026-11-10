import { env } from "cloudflare:workers";
import { runDurableObjectAlarm } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import type { ClientMessage, RoomSnapshot, ServerMessage } from "../../shared/protocol";
import type { Room } from "../../worker/src/room";

declare global {
  namespace Cloudflare {
    interface Env {
      ROOMS: DurableObjectNamespace<Room>;
    }
  }
}

const ALICE = "11111111-1111-4111-8111-111111111111";
const BOB = "22222222-2222-4222-8222-222222222222";

describe("Room Durable Object", () => {
  it("creates, joins, votes, and reveals over WebSockets", async () => {
    const stub = await createRoom("AAAAAA");
    const info = await getInfo(stub);
    expect(info).toMatchObject({ phase: "voting", deckId: "fibonacci", participantCount: 0 });

    const alice = await TestSocket.connect(stub);
    alice.join(ALICE, "Alice");

    const joined = await alice.state((snapshot) => snapshot.participants.length === 1);
    expect(joined.self.id).toBe(ALICE);
    expect(joined.participants[0]).toMatchObject({ name: "Alice", hasVoted: false, vote: null });

    alice.send({ type: "vote", card: "5" });
    const voted = await alice.state((snapshot) => snapshot.self.vote === "5");
    expect(voted.participants[0].hasVoted).toBe(true);

    alice.send({ type: "reveal" });
    const revealed = await alice.state((snapshot) => snapshot.phase === "revealed");
    expect(revealed.participants[0].vote).toBe("5");

    alice.close();
  });

  it("keeps votes private until reveal and resets cleanly", async () => {
    const stub = await createRoom("BBBBBB");
    const alice = await TestSocket.connect(stub);
    const bob = await TestSocket.connect(stub);

    alice.join(ALICE, "Alice");
    bob.join(BOB, "Bob");
    await alice.state((snapshot) => snapshot.participants.length === 2);
    await bob.state((snapshot) => snapshot.participants.length === 2);

    alice.send({ type: "vote", card: "3" });
    const bobSeesAlice = await bob.state((snapshot) =>
      snapshot.participants.some((participant) => participant.hasVoted),
    );
    const hiddenAlice = bobSeesAlice.participants.find((participant) => participant.id === ALICE);
    expect(hiddenAlice).toMatchObject({ hasVoted: true, vote: null });

    bob.send({ type: "vote", card: "8" });
    await alice.state(
      (snapshot) =>
        snapshot.participants.filter((participant) => participant.hasVoted).length === 2,
    );

    bob.send({ type: "reveal" });
    const revealed = await alice.state((snapshot) => snapshot.phase === "revealed");
    expect(revealed.participants.find((participant) => participant.id === ALICE)?.vote).toBe("3");
    expect(revealed.participants.find((participant) => participant.id === BOB)?.vote).toBe("8");

    alice.send({ type: "reset" });
    const reset = await bob.state(
      (snapshot) => snapshot.phase === "voting" && snapshot.round === 2,
    );
    expect(reset.participants.every((participant) => participant.vote === null)).toBe(true);

    alice.close();
    bob.close();
  });

  it("upserts a participant on repeated joins and keeps their vote", async () => {
    const stub = await createRoom("CCCCCC");
    const alice = await TestSocket.connect(stub);

    alice.join(ALICE, "Alice");
    await alice.state((snapshot) => snapshot.participants.length === 1);

    alice.send({ type: "vote", card: "13" });
    await alice.state((snapshot) => snapshot.self.vote === "13");

    alice.join(ALICE, "Alicia");
    const rejoined = await alice.state(
      (snapshot) => snapshot.participants[0]?.name === "Alicia" && snapshot.self.vote === "13",
    );

    expect(rejoined.participants).toHaveLength(1);
    expect(rejoined.participants[0]).toMatchObject({ id: ALICE, name: "Alicia", hasVoted: true });

    alice.close();
  });

  it("removes participants when they leave", async () => {
    const stub = await createRoom("DDDDDD");
    const alice = await TestSocket.connect(stub);
    const bob = await TestSocket.connect(stub);

    alice.join(ALICE, "Alice");
    bob.join(BOB, "Bob");
    await alice.state((snapshot) => snapshot.participants.length === 2);

    bob.send({ type: "leave" });
    const afterLeave = await alice.state((snapshot) => snapshot.participants.length === 1);
    expect(afterLeave.participants[0].id).toBe(ALICE);

    alice.close();
  });

  it("deletes the room when the expiry alarm runs", async () => {
    const stub = await createRoom("EEEEEE");

    expect(await runDurableObjectAlarm(stub)).toBe(true);
    expect((await stub.fetch("https://room.internal/info")).status).toBe(404);
  });
});

async function createRoom(code: string): Promise<DurableObjectStub> {
  const stub = env.ROOMS.getByName(code);
  const response = await stub.fetch("https://room.internal/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, deckId: "fibonacci" }),
  });
  expect(response.status).toBe(201);
  return stub;
}

async function getInfo(stub: DurableObjectStub): Promise<Record<string, unknown>> {
  const response = await stub.fetch("https://room.internal/info");
  expect(response.status).toBe(200);
  return (await response.json()) as Record<string, unknown>;
}

class TestSocket {
  private queue: ServerMessage[] = [];
  private waiters: Array<{
    predicate: (message: ServerMessage) => boolean;
    resolve: (message: ServerMessage) => void;
  }> = [];

  private constructor(private readonly socket: WebSocket) {
    socket.addEventListener("message", (event) => {
      if (typeof event.data !== "string") return;
      this.queue.push(JSON.parse(event.data) as ServerMessage);
      this.flush();
    });
  }

  static async connect(stub: DurableObjectStub): Promise<TestSocket> {
    const response = await stub.fetch(
      new Request("https://room.internal/ws", { headers: { Upgrade: "websocket" } }),
    );
    expect(response.status).toBe(101);

    const socket = response.webSocket;
    if (!socket) throw new Error("Expected a WebSocket response");
    socket.accept();

    return new TestSocket(socket);
  }

  join(participantId: string, name: string): void {
    this.send({ type: "join", participantId, name });
  }

  send(message: ClientMessage): void {
    this.socket.send(JSON.stringify(message));
  }

  async state(predicate: (snapshot: RoomSnapshot) => boolean = () => true): Promise<RoomSnapshot> {
    const message = await this.next(
      (candidate) => candidate.type === "state" && predicate(candidate.snapshot),
    );
    if (message.type !== "state") throw new Error("Expected a state message");
    return message.snapshot;
  }

  close(): void {
    this.socket.close(1000, "test complete");
  }

  private next(predicate: (message: ServerMessage) => boolean): Promise<ServerMessage> {
    const queuedIndex = this.queue.findIndex(predicate);
    if (queuedIndex !== -1) {
      const [message] = this.queue.splice(queuedIndex, 1);
      return Promise.resolve(message);
    }

    return new Promise((resolve) => {
      this.waiters.push({ predicate, resolve });
    });
  }

  private flush(): void {
    for (let index = 0; index < this.waiters.length; index += 1) {
      const waiter = this.waiters[index];
      const queuedIndex = this.queue.findIndex(waiter.predicate);
      if (queuedIndex === -1) continue;

      const [message] = this.queue.splice(queuedIndex, 1);
      this.waiters.splice(index, 1);
      index -= 1;
      waiter.resolve(message);
    }
  }
}
