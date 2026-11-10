import { EyeOff, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { SubmitEvent } from "react";
import { getDeck } from "../../../shared/decks";
import {
  MAX_NAME_LENGTH,
  NAME_REQUIREMENT,
  normalizeDisplayName,
} from "../../../shared/validation";
import type { RoomInfo } from "../../../shared/protocol";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { PigMark } from "../../components/Logo";
import { PigMascot } from "../../components/PigMascot";
import { loadName } from "../../lib/identity";

interface JoinGateProps {
  code: string;
  info: RoomInfo;
  onJoin: (name: string) => void;
}

export function JoinGate({ code, info, onJoin }: JoinGateProps) {
  const [name, setName] = useState(loadName);
  const [error, setError] = useState<string | null>(null);
  const deck = getDeck(info.deckId);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeDisplayName(name);

    if (!normalized) {
      setError(NAME_REQUIREMENT);
      return;
    }

    onJoin(normalized);
  }

  const people = info.participantCount === 1 ? "1 person" : `${info.participantCount} people`;

  return (
    <div className="mx-auto grid max-w-4xl items-stretch gap-4 py-6 lg:grid-cols-[0.9fr_1.1fr]">
      <aside className="relative overflow-hidden rounded-[1.75rem] bg-felt p-6 text-on-felt shadow-[0_28px_60px_-38px_rgba(12,50,42,0.8)] sm:p-8">
        <div aria-hidden="true" className="felt-texture absolute inset-0 opacity-40" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-on-felt/75">
            <PigMark className="size-3.5" />
            Room {code}
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.02] tracking-[-0.04em]">
            Pull up
            <br />a chair.
          </h1>
          <p className="mt-3 max-w-xs text-sm leading-6 text-on-felt/65">
            The table is set. Pick a name and join the round.
          </p>

          <div className="mt-5 flex flex-wrap gap-2 text-xs text-on-felt/70">
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
              {deck.name}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
              {people}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
              {info.phase === "voting" ? `Round ${info.round}` : "Revealed"}
            </span>
          </div>

          <PigMascot className="mt-8 w-44 sm:w-52" />
        </div>
      </aside>

      <section className="flex flex-col justify-center rounded-[1.75rem] border border-line bg-surface p-6 shadow-[0_30px_70px_-48px_rgba(60,30,26,0.45)] sm:p-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-pink-strong">
          <ShieldCheck className="size-4" />
          No account needed
        </div>
        <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.035em] text-ink">
          What should we call you?
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          Your name is only visible to people in this room. Nothing is stored after it expires.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <label htmlFor="join-name" className="text-xs font-medium text-ink-muted">
            Display name
          </label>
          <Input
            id="join-name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError(null);
            }}
            placeholder="e.g. Sam"
            autoComplete="nickname"
            maxLength={MAX_NAME_LENGTH}
            autoFocus
            required
            aria-invalid={Boolean(error)}
          />
          {error && (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full">
            Join the table
          </Button>
        </form>

        <p className="mt-5 flex items-start gap-2 rounded-control bg-pink-soft/55 px-3.5 py-3 text-xs leading-5 text-ink-muted">
          <EyeOff className="mt-0.5 size-4 shrink-0 text-pink-strong" />
          Votes stay hidden until someone at the table reveals them.
        </p>
      </section>
    </div>
  );
}
