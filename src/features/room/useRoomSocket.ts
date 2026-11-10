import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CLOSE_NORMAL,
  CLOSE_ROOM_FULL,
  CLOSE_ROOM_GONE,
  FATAL_CLOSE_CODES,
} from "../../../shared/protocol";
import type { ClientMessage, RoomSnapshot, ServerMessage } from "../../../shared/protocol";
import type { ConnectionStatus } from "../../components/StatusPill";

const HEARTBEAT_MS = 25_000;
const RECONNECT_CAP_MS = 10_000;

const CLOSE_ERRORS: Partial<Record<number, RoomSocketError>> = {
  [CLOSE_ROOM_GONE]: { code: "ROOM_GONE", message: "That room expired or no longer exists." },
  [CLOSE_ROOM_FULL]: { code: "ROOM_FULL", message: "That room is full." },
};

export interface RoomSocketError {
  code: string;
  message: string;
}

export interface RoomSocketActions {
  vote: (card: string | null) => void;
  reveal: () => void;
  reset: () => void;
  rename: (name: string) => void;
  leave: () => void;
}

interface UseRoomSocketOptions {
  code: string;
  participantId: string;
  name: string;
  enabled: boolean;
}

export function useRoomSocket({ code, participantId, name, enabled }: UseRoomSocketOptions) {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [snapshot, setSnapshot] = useState<RoomSnapshot | null>(null);
  const [error, setError] = useState<RoomSocketError | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const versionRef = useRef(-1);
  const nameRef = useRef(name);

  nameRef.current = name;

  useEffect(() => {
    if (!enabled) return;

    let disposed = false;
    let fatal = false;
    let attempts = 0;
    let awaitingPong = false;
    let retryTimer: number | undefined;
    let heartbeatTimer: number | undefined;

    versionRef.current = -1;
    setSnapshot(null);
    setError(null);
    setStatus("connecting");

    const clearHeartbeat = () => {
      if (heartbeatTimer !== undefined) {
        window.clearInterval(heartbeatTimer);
        heartbeatTimer = undefined;
      }
    };

    const clearRetry = () => {
      if (retryTimer !== undefined) {
        window.clearTimeout(retryTimer);
        retryTimer = undefined;
      }
    };

    const scheduleReconnect = () => {
      if (disposed || fatal) return;

      setStatus("reconnecting");
      attempts += 1;
      const base = Math.min(1000 * 2 ** (attempts - 1), RECONNECT_CAP_MS);
      const delay = base + Math.random() * 400;
      retryTimer = window.setTimeout(() => {
        retryTimer = undefined;
        connect();
      }, delay);
    };

    const startHeartbeat = (socket: WebSocket) => {
      clearHeartbeat();
      heartbeatTimer = window.setInterval(() => {
        if (socket.readyState !== WebSocket.OPEN) return;

        if (awaitingPong) {
          socket.close(4000, "Heartbeat timeout");
          return;
        }

        awaitingPong = true;
        socket.send("ping");
      }, HEARTBEAT_MS);
    };

    const connect = () => {
      if (disposed || fatal || isSocketActive(socketRef.current)) return;

      clearRetry();
      setStatus(attempts === 0 ? "connecting" : "reconnecting");

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const socket = new WebSocket(
        `${protocol}//${window.location.host}/api/rooms/${encodeURIComponent(code)}/ws`,
      );
      socketRef.current = socket;

      socket.onopen = () => {
        if (socketRef.current !== socket || disposed) return;

        attempts = 0;
        awaitingPong = false;
        setStatus("open");
        socket.send(
          JSON.stringify({
            type: "join",
            participantId,
            name: nameRef.current,
          } satisfies ClientMessage),
        );
        startHeartbeat(socket);
      };

      socket.onmessage = (event) => {
        if (typeof event.data !== "string") return;

        awaitingPong = false;
        if (event.data === "pong") return;

        const message = parseServerMessage(event.data);
        if (!message) return;

        if (message.type === "state") {
          if (message.snapshot.version < versionRef.current) return;
          versionRef.current = message.snapshot.version;
          setSnapshot(message.snapshot);
          setError(null);
          return;
        }

        setError({ code: message.code, message: message.message });
      };

      socket.onclose = (event) => {
        clearHeartbeat();
        if (socketRef.current === socket) socketRef.current = null;
        if (disposed) return;

        if (event.code === CLOSE_NORMAL || FATAL_CLOSE_CODES.has(event.code)) {
          fatal = true;
          setStatus("closed");
          if (event.code !== CLOSE_NORMAL) {
            setError((current) => current ?? closeError(event.code));
          }
          return;
        }

        scheduleReconnect();
      };

      socket.onerror = () => {
        if (socket.readyState === WebSocket.OPEN) socket.close();
      };
    };

    const reconnectNow = () => {
      if (disposed || fatal || document.visibilityState === "hidden") return;
      if (isSocketActive(socketRef.current)) return;

      attempts = 0;
      clearRetry();
      connect();
    };

    connect();
    window.addEventListener("online", reconnectNow);
    document.addEventListener("visibilitychange", reconnectNow);

    return () => {
      disposed = true;
      window.removeEventListener("online", reconnectNow);
      document.removeEventListener("visibilitychange", reconnectNow);
      clearRetry();
      clearHeartbeat();

      const socket = socketRef.current;
      socketRef.current = null;
      socket?.close(CLOSE_NORMAL, "Leaving room");
    };
  }, [code, enabled, participantId]);

  const send = useCallback((message: ClientMessage) => {
    const socket = socketRef.current;
    if (socket?.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(message));
  }, []);

  const actions = useMemo<RoomSocketActions>(
    () => ({
      vote: (card) => send({ type: "vote", card }),
      reveal: () => send({ type: "reveal" }),
      reset: () => send({ type: "reset" }),
      rename: (nextName) => send({ type: "rename", name: nextName }),
      leave: () => {
        send({ type: "leave" });
        window.setTimeout(() => socketRef.current?.close(CLOSE_NORMAL, "Left room"), 100);
      },
    }),
    [send],
  );

  return { status, snapshot, error, actions };
}

function isSocketActive(socket: WebSocket | null): boolean {
  return (
    socket !== null &&
    (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)
  );
}

function parseServerMessage(raw: string): ServerMessage | null {
  try {
    const value = JSON.parse(raw) as ServerMessage;
    if (value && typeof value === "object" && (value.type === "state" || value.type === "error")) {
      return value;
    }
    return null;
  } catch {
    return null;
  }
}

function closeError(code: number): RoomSocketError {
  return (
    CLOSE_ERRORS[code] ?? {
      code: "CONNECTION_REJECTED",
      message: "The table rejected the connection.",
    }
  );
}
