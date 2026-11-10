import type { Env } from "../../../_lib/env";
import { errorJson, isTrustedOrigin } from "../../../_lib/http";
import { readRoomCode, roomStub } from "../../../_lib/room";

export const onRequestGet: PagesFunction<Env, "code"> = async ({ request, params, env }) => {
  if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
    return errorJson(426, "EXPECTED_WEBSOCKET", "Expected a WebSocket upgrade.");
  }
  if (!isTrustedOrigin(request)) {
    return errorJson(403, "ORIGIN_NOT_ALLOWED", "This connection came from an untrusted origin.");
  }

  const code = readRoomCode(params.code);
  if (!code) {
    return errorJson(404, "ROOM_NOT_FOUND", "That room does not exist.");
  }

  return roomStub(env, code).fetch(request);
};
