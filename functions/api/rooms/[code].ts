import type { Env } from "../../_lib/env";
import { errorJson, json } from "../../_lib/http";
import { readRoomCode, roomStub } from "../../_lib/room";

export const onRequestGet: PagesFunction<Env, "code"> = async ({ params, env }) => {
  const code = readRoomCode(params.code);
  if (!code) {
    return errorJson(404, "ROOM_NOT_FOUND", "That room does not exist.");
  }

  const response = await roomStub(env, code).fetch("https://room.internal/info");
  const body: unknown = await response.json().catch(() => null);

  if (response.status === 404) {
    return errorJson(404, "ROOM_NOT_FOUND", "That room does not exist.");
  }
  if (!response.ok) {
    return errorJson(502, "ROOM_LOOKUP_FAILED", "The room could not be loaded.");
  }

  return json(body, 200);
};
