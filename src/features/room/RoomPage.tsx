import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { normalizeRoomCode, ROOM_CODE_LENGTH } from "../../../shared/codes";
import type { RoomInfo } from "../../../shared/protocol";
import { normalizeDisplayName } from "../../../shared/validation";
import { Button } from "../../components/Button";
import { IconBadge } from "../../components/IconBadge";
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

interface RoomNoticeAction {
  label: string;
  onClick: () => void;
}

export function RoomPage() {
  const { code: rawCode = "" } = useParams();
  const code = normalizeRoomCode(rawCode);
  const navigate = useNavigate();

  const [info, setInfo] = useState<RoomInfo | null>(null);
  const [loadState, setLoadState] = useState<LoadState>(code ? "loading" : "invalid");
  const [loadError, setLoadError] = useState<string | null>(null);
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

        const identity = peekIdentity(code);
        const storedName = normalizeDisplayName(loadName());
        if (identity && storedName) {
          setJoined({ participantId: identity.participantId, name: storedName });
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
  }, [code]);

  function handleJoin(name: string) {
    if (!code) return;

    const identity = getOrCreateIdentity(code);
    saveName(name);
    setJoined({ participantId: identity.participantId, name });
  }

  const goToLobby = () => navigate("/");
  const fatal = status === "closed" ? error : null;
  const participantCount = snapshot?.participants.length ?? info?.participantCount ?? 0;

  function renderContent() {
    switch (loadState) {
      case "invalid":
        return (
          <RoomNotice
            title="That room code looks off."
            body={`Room codes are ${ROOM_CODE_LENGTH} characters. Head back and try again.`}
            action={{ label: "Back to the lobby", onClick: goToLobby }}
          />
        );
      case "loading":
        return <RoomSkeleton />;
      case "missing":
        return (
          <RoomNotice
            title="This table has cleared out."
            body="The room may have expired. Rooms disappear 24 hours after the last activity."
            action={{ label: "Start a new table", onClick: goToLobby }}
          />
        );
      case "error":
        return (
          <RoomNotice
            title="We could not reach the table."
            body={loadError ?? "Check your connection and try again."}
            action={{ label: "Try again", onClick: () => window.location.reload() }}
            secondaryAction={{ label: "Back to the lobby", onClick: goToLobby }}
          />
        );
      case "ready":
        if (!info) return null;
        if (!joined) return <JoinGate code={info.code} info={info} onJoin={handleJoin} />;
        if (fatal) {
          return (
            <RoomNotice
              title="That table is unavailable."
              body={fatal.message}
              action={{ label: "Start a new table", onClick: goToLobby }}
            />
          );
        }

        return snapshot ? (
          <RoomBoard snapshot={snapshot} status={status} actions={actions} />
        ) : (
          <ConnectingTable code={code ?? ""} status={status} />
        );
    }
  }

  return (
    <div className="mx-auto min-h-dvh w-full max-w-6xl px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pt-5">
      <RoomHeader
        code={code ?? rawCode.toUpperCase()}
        status={joined ? status : null}
        participantCount={participantCount}
        onLeave={actions.leave}
      />

      <main className="mt-5">{renderContent()}</main>
    </div>
  );
}

function ConnectingTable({ code, status }: { code: string; status: ConnectionStatus }) {
  return (
    <div className="flex min-h-[58vh] flex-col items-center justify-center text-center">
      <IconBadge size="xl">
        <PigMark className="size-10 animate-pulse" />
      </IconBadge>
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
    <div className="mt-2 animate-pulse rounded-table bg-felt/90 p-5 sm:p-6">
      <div className="h-4 w-52 rounded-full bg-white/10" />
      <div className="mt-10 flex justify-center gap-6">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="w-20">
            <div className="mx-auto size-10 rounded-full bg-white/10" />
            <div className="mx-auto mt-3 h-[70px] w-[52px] rounded-xl bg-white/10" />
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
  action: RoomNoticeAction;
  secondaryAction?: RoomNoticeAction;
}

function RoomNotice({ title, body, action, secondaryAction }: RoomNoticeProps) {
  return (
    <div className="flex min-h-[58vh] items-center justify-center">
      <section className="w-full max-w-md rounded-panel border border-line bg-surface p-7 text-center shadow-panel-lg sm:p-9">
        <IconBadge size="lg" className="mx-auto">
          <PigMark className="size-9" />
        </IconBadge>
        <h1 className="mt-5 font-display text-3xl font-bold tracking-[-0.04em] text-ink">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-ink-muted">{body}</p>
        <div className="mt-6 flex flex-col gap-2">
          <Button size="lg" onClick={action.onClick}>
            {action.label}
            <ArrowRight className="size-4.5" />
          </Button>
          {secondaryAction && (
            <Button variant="ghost" onClick={secondaryAction.onClick}>
              <ArrowLeft className="size-4" />
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
