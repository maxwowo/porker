export const ROOM_CODE_LENGTH = 6;
export const ROOM_CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

const ROOM_CODE_PATTERN = new RegExp(`^[${ROOM_CODE_ALPHABET}]{${ROOM_CODE_LENGTH}}$`);

export function generateRoomCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(ROOM_CODE_LENGTH));
  return Array.from(bytes, (byte) => ROOM_CODE_ALPHABET[byte % ROOM_CODE_ALPHABET.length]).join("");
}

export function normalizeRoomCode(input: string): string | null {
  const code = input.replace(/[\s-]/g, "").toUpperCase();
  return ROOM_CODE_PATTERN.test(code) ? code : null;
}

export function sanitizeRoomCodeInput(input: string): string {
  return input
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, ROOM_CODE_LENGTH);
}

export function isRoomCode(input: string): boolean {
  return ROOM_CODE_PATTERN.test(input);
}
