import { describe, expect, it } from "vitest";
import {
  castVote,
  createRoom,
  joinRoom,
  removeParticipant,
  renameParticipant,
  resetRoom,
  revealRoom,
  toSnapshot,
} from "../shared/room";
import { DECKS } from "../shared/decks";

const NOW = 1_700_000_000_000;
const ALICE = "alice-participant";
const BOB = "bob-participant";

function readyRoom() {
  const room = createRoom("ABC123", "fibonacci", NOW);
  return joinRoom(joinRoom(room, ALICE, "Alice", NOW + 1), BOB, "Bob", NOW + 2);
}

describe("room model", () => {
  it("creates a room in the first voting round", () => {
    const room = createRoom("ABC123", "fibonacci", NOW);

    expect(room.code).toBe("ABC123");
    expect(room.deckId).toBe("fibonacci");
    expect(room.phase).toBe("voting");
    expect(room.round).toBe(1);
    expect(room.participants).toEqual({});
    expect(room.version).toBe(1);
  });

  it("upserts participants by id and keeps their vote", () => {
    let room = createRoom("ABC123", "fibonacci", NOW);
    room = joinRoom(room, ALICE, "Alice", NOW + 1);
    room = castVote(room, ALICE, "5", NOW + 2);
    room = joinRoom(room, ALICE, "Alice Cooper", NOW + 3);

    expect(Object.keys(room.participants)).toEqual([ALICE]);
    expect(room.participants[ALICE]).toMatchObject({
      id: ALICE,
      name: "Alice Cooper",
      vote: "5",
      joinedAt: NOW + 1,
    });
  });

  it("keeps other votes private while voting", () => {
    let room = readyRoom();
    room = castVote(room, ALICE, "3", NOW + 3);
    room = castVote(room, BOB, "8", NOW + 4);

    const aliceView = toSnapshot(room, ALICE, new Set([ALICE, BOB]));
    const bobView = toSnapshot(room, BOB, new Set([ALICE, BOB]));

    expect(aliceView.self.vote).toBe("3");
    expect(bobView.self.vote).toBe("8");
    expect(aliceView.participants.find((p) => p.id === BOB)?.vote).toBeNull();
    expect(aliceView.participants.find((p) => p.id === BOB)?.hasVoted).toBe(true);
    expect(bobView.participants.find((p) => p.id === ALICE)?.vote).toBeNull();
    expect(aliceView.participants.find((p) => p.id === ALICE)?.connected).toBe(true);
  });

  it("reveals every vote", () => {
    let room = readyRoom();
    room = castVote(room, ALICE, "3", NOW + 3);
    room = castVote(room, BOB, "8", NOW + 4);
    room = revealRoom(room, NOW + 5);

    const snapshot = toSnapshot(room, ALICE, new Set([ALICE]));

    expect(snapshot.phase).toBe("revealed");
    expect(snapshot.participants.find((p) => p.id === BOB)?.vote).toBe("8");
    expect(snapshot.participants.find((p) => p.id === BOB)?.connected).toBe(false);
  });

  it("starts a clean new round", () => {
    let room = readyRoom();
    room = castVote(room, ALICE, "3", NOW + 3);
    room = castVote(room, BOB, "8", NOW + 4);
    room = revealRoom(room, NOW + 5);
    room = resetRoom(room, NOW + 6);

    expect(room.phase).toBe("voting");
    expect(room.round).toBe(2);
    expect(room.participants[ALICE].vote).toBeNull();
    expect(room.participants[BOB].vote).toBeNull();
  });

  it("ignores repeated reveals and resets", () => {
    const revealed = revealRoom(readyRoom(), NOW + 5);
    expect(revealRoom(revealed, NOW + 6)).toBe(revealed);

    const voting = resetRoom(revealed, NOW + 6);
    expect(resetRoom(voting, NOW + 7)).toBe(voting);
  });

  it("ignores votes from unknown participants, invalid cards, and revealed rounds", () => {
    let room = readyRoom();
    expect(castVote(room, "nobody", "3", NOW + 3)).toBe(room);
    expect(castVote(room, ALICE, "not-a-card", NOW + 3)).toBe(room);
    expect(castVote(room, ALICE, "coffee", NOW + 3)).not.toBe(room);

    room = revealRoom(room, NOW + 4);
    expect(castVote(room, BOB, "5", NOW + 5)).toBe(room);
  });

  it("renames and removes participants", () => {
    let room = readyRoom();
    room = renameParticipant(room, ALICE, "Alicia", NOW + 3);
    expect(room.participants[ALICE].name).toBe("Alicia");
    expect(renameParticipant(room, ALICE, "Alicia", NOW + 4)).toBe(room);

    room = removeParticipant(room, BOB, NOW + 5);
    expect(room.participants[BOB]).toBeUndefined();
    expect(removeParticipant(room, BOB, NOW + 6)).toBe(room);
    expect(DECKS.fibonacci.cards.some((card) => card.value === "coffee")).toBe(true);
  });
});
