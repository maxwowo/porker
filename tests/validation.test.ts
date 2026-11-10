import { describe, expect, it } from "vitest";
import { generateRoomCode, isRoomCode, normalizeRoomCode, ROOM_CODE_LENGTH } from "../shared/codes";
import { isDeckId } from "../shared/decks";
import {
  isValidParticipantId,
  normalizeDisplayName,
  parseClientMessage,
} from "../shared/validation";

describe("validation", () => {
  it("generates valid, unambiguous room codes", () => {
    const codes = new Set(Array.from({ length: 50 }, generateRoomCode));

    expect(codes.size).toBe(50);
    for (const code of codes) {
      expect(code).toHaveLength(ROOM_CODE_LENGTH);
      expect(isRoomCode(code)).toBe(true);
      expect(code).not.toMatch(/[01ILO]/);
    }
  });

  it("normalizes room codes", () => {
    expect(normalizeRoomCode(" abc-234 ")).toBe("ABC234");
    expect(normalizeRoomCode("abc234")).toBe("ABC234");
    expect(normalizeRoomCode("ABC23")).toBeNull();
    expect(normalizeRoomCode("ABC12O")).toBeNull();
  });

  it("normalizes display names", () => {
    expect(normalizeDisplayName("  Sam   Smith  ")).toBe("Sam Smith");
    expect(normalizeDisplayName("Sam\u0000")).toBe("Sam");
    expect(normalizeDisplayName("   ")).toBeNull();
    expect(normalizeDisplayName(123)).toBeNull();
    expect(normalizeDisplayName("🐷".repeat(32))).toHaveLength(64);
    expect(normalizeDisplayName("🐷".repeat(32))).not.toBeNull();
    expect(normalizeDisplayName("🐷".repeat(33))).toBeNull();
  });

  it("validates participant ids", () => {
    expect(isValidParticipantId(crypto.randomUUID())).toBe(true);
    expect(isValidParticipantId("abc_123-XYZ")).toBe(true);
    expect(isValidParticipantId("short")).toBe(false);
    expect(isValidParticipantId("has spaces")).toBe(false);
    expect(isValidParticipantId(null)).toBe(false);
  });

  it("parses client messages", () => {
    expect(parseClientMessage('{"type":"reveal"}')).toEqual({ type: "reveal" });
    expect(parseClientMessage('{"type":"vote","card":null}')).toEqual({
      type: "vote",
      card: null,
    });
    expect(parseClientMessage('{"type":"join","participantId":"abc12345","name":"Sam"}')).toEqual({
      type: "join",
      participantId: "abc12345",
      name: "Sam",
    });
    expect(parseClientMessage('{"type":"vote","card":5}')).toBeNull();
    expect(parseClientMessage('{"type":"unknown"}')).toBeNull();
    expect(parseClientMessage("not json")).toBeNull();
  });

  it("recognizes decks", () => {
    expect(isDeckId("fibonacci")).toBe(true);
    expect(isDeckId("tshirt")).toBe(true);
    expect(isDeckId("custom")).toBe(false);
  });
});
