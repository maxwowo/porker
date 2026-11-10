import { normalizeRoomCode } from "../../shared/codes";
import type { Env, RoomStub } from "./env";

export function readRoomCode(input: string | string[] | undefined): string | null {
  const value = Array.isArray(input) ? input[0] : input;
  return value ? normalizeRoomCode(value) : null;
}

export function roomStub(env: Env, code: string): RoomStub {
  return env.ROOMS.getByName(code);
}
