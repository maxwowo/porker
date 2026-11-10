import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { normalizeRoomCode } from "../../../shared/codes";
import type { RoomInfo } from "../../../shared/protocol";
import { normalizeDisplayName } from "../../../shared/validation";
import { Button } from "../../components/Button";
import { PigMark } from "../../components/Logo";
import { StatusPill } from "../../components/StatusPill";
import type { ConnectionStatus } from "../../components/StatusPill";
import { ApiError, getRoom } from "../../lib/api";
import { getOrCreateIdentity, loadName, peekIdentity, saveName } from "../../lib/identity";
import { JoinGate } from "./JoinGate";
import { RoomBoard } from "./RoomBoard";
import { RoomHeader } from "./RoomHeader";
import { useRoomSocket } from "./useRoomSocket";

type LoadState = "loading" | "ready" | "missing" | "invalid" | "error";

interface JoinedSession {
  participantId: string;
  name: string;
}

export function RoomPage() {
  const { code: rawCode = "" } = useParams();
  const code = normalizeRoomCode(rawCode);
  const navigate = useNavigate();

  const [info, setInfo] = useState<RoomInfo | null>(null);
  const [loadState, setLoadState] = useState<LoadState>(code ? "loading" : "invalid");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [identity] = useState(() => (code ? peekIdentity(code) : null));
  const [joined, setJoined] = useState<JoinedSession | null>(null);

  useEffect(() => {
    document.title = code ? `Room ${code} — Porker` : "Porker — Planning poker without the noise";
    return () => {
      document.title = "Porker — Planning poker without the noise";
    };
  }, [code]);

  const { status, snapshot, error, actions } = useRoomSocket({
    code: code ?? "",
    participantId: joined?.participantId ?? "",
    name: joined?.name ?? "",
    enabled: Boolean(code && joined),
  });

  useEffect(() => {
    if (!code) {
      setLoadState("invalid");
      return;
    }

    let cancelled = false;
    setLoadState("loading");

    getRoom(code)
      .then((room) => {
        if (cancelled) return;
        if (!room) {
          setLoadState("missing");
          return;
        }
        setInfo(room);
        setLoadState("ready");

        const storedIdentity = identity ?? peekIdentity(code);
        const storedName = normalizeDisplayName(loadName());
        if (storedIdentity && storedName) {
          setJoined({ participantId: storedIdentity.participantId, name: storedName });
        }
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setLoadError(
          cause instanceof ApiError ? cause.message : "The room could not be loaded right now.",
        );
        setLoadState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [code, identity]);

  function handleJoin(name: string) {
    if (!code) return;

    const nextIdentity = getOrCreateIdentity(code);
    saveName(name);
    setJoined({ participantId: nextIdentity.participantId, name });
  }

  const fatal = status === "closed" ? error : null;
  const participantCount = snapshot?.participants.length ?? info?.participantCount ?? 0;

  return (
    <div className="mx-auto min-h-dvh w-full max-w-6xl px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pt-5">
      <RoomHeader
        code={code ?? rawCode.toUpperCase()}
        status={joined ? status : null}
        participantCount={participantCount}
        onLeave={actions.leave}
      />

      <main className="mt-5">
        {loadState === "invalid" && (
          <RoomNotice
            title="That room code looks off."
            body="Room codes are six characters. Head back and try again."
            actionLabel="Back to the lobby"
            onAction={() => navigate("/")}
          />
        )}

        {loadState === "loading" && <RoomSkeleton />}

        {loadState === "missing" && (
          <RoomNotice
            title="This table has cleared out."
            body="The room may have expired. Rooms disappear 24 hours after the last activity."
            actionLabel="Start a new table"
            onAction={() => navigate("/")}
          />
        )}

        {loadState === "error" && (
          <RoomNotice
            title="We could not reach the table."
            body={loadError ?? "Check your connection and try again."}
            actionLabel="Try again"
            onAction={() => window.location.reload()}
            secondaryLabel="Back to the lobby"
            onSecondary={() => navigate("/")}
          />
        )}

        {loadState === "ready" && info && !joined && (
          <JoinGate code={info.code} info={info} onJoin={handleJoin} />
        )}

        {loadState === "ready" && joined && fatal && (
          <RoomNotice
            title="That table is unavailable."
            body={fatal.message}
            actionLabel="Start a new table"
            onAction={() => navigate("/")}
            secondaryLabel="Back to the lobby"
            onSecondary={() => navigate("/")}
          />
        )}

        {loadState === "ready" && joined && !fatal && snapshot && (
          <RoomBoard snapshot={snapshot} status={status} actions={actions} />
        )}

        {loadState === "ready" && joined && !fatal && !snapshot && (
          <ConnectingTable code={code ?? ""} status={status} />
        )}
      </main>
    </div>
  );
}

function ConnectingTable({ code, status }: { code: string; status: ConnectionStatus }) {
  return (
    <div className="flex min-h-[58vh] flex-col items-center justify-center text-center">
      <span className="grid size-16 place-items-center rounded-[1.5rem] bg-pink-soft text-pink-strong">
        <PigMark className="size-10 animate-pulse" />
      </span>
      <h1 className="mt-5 font-display text-3xl font-bold tracking-[-0.04em] text-ink">
        Taking your seat…
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Connecting to room{" "}
        <span className="font-display font-semibold tracking-[0.12em]">{code}</span>
      </p>
      <div className="mt-4">
        <StatusPill status={status} />
      </div>
    </div>
  );
}

function RoomSkeleton() {
  return (
    <div className="mt-2 animate-pulse rounded-[2rem] bg-felt/90 p-5 sm:p-6">
      <div className="h-4 w-52 rounded-full bg-white/10" />
      <div className="mt-10 flex justify-center gap-6">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="w-20">
            <div className="mx-auto size-10 rounded-full bg-white/10" />
            <div className="mx-auto mt-3 h-[4.35rem] w-[3.25rem] rounded-xl bg-white/10" />
            <div className="mx-auto mt-2 h-3 w-14 rounded-full bg-white/10" />
          </div>
        ))}
      </div>
      <div className="mx-auto mt-10 h-8 w-64 rounded-full bg-white/10" />
    </div>
  );
}

interface RoomNoticeProps {
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

function RoomNotice({
  title,
  body,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
}: RoomNoticeProps) {
  return (
    <div className="flex min-h-[58vh] items-center justify-center">
      <section className="w-full max-w-md rounded-[1.75rem] border border-line bg-surface p-7 text-center shadow-[0_28px_65px_-45px_rgba(60,30,26,0.45)] sm:p-9">
        <span className="mx-auto grid size-14 place-items-center rounded-[1.25rem] bg-pink-soft text-pink-strong">
          <PigMark className="size-9" />
        </span>
        <h1 className="mt-5 font-display text-3xl font-bold tracking-[-0.04em] text-ink">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-ink-muted">{body}</p>
        <div className="mt-6 flex flex-col gap-2">
          <Button size="lg" onClick={onAction}>
            {actionLabel}
            <ArrowRight className="size-4.5" />
          </Button>
          {secondaryLabel && onSecondary && (
            <Button variant="ghost" onClick={onSecondary}>
              <ArrowLeft className="size-4" />
              {secondaryLabel}
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
