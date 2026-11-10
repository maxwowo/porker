import { EyeOff, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { SubmitEvent } from "react";
import { getDeck } from "../../../shared/decks";
import type { RoomInfo } from "../../../shared/protocol";
import {
  MAX_NAME_LENGTH,
  NAME_REQUIREMENT,
  normalizeDisplayName,
} from "../../../shared/validation";
import { Button } from "../../components/Button";
import { PigMark } from "../../components/Logo";
import { PigMascot } from "../../components/PigMascot";
import { Pill } from "../../components/Pill";
import { TextField } from "../../components/TextField";
import { pluralize } from "../../lib/format";
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

  const facts = [
    deck.name,
    pluralize(info.participantCount, "person", "people"),
    info.phase === "voting" ? `Round ${info.round}` : "Revealed",
  ];

  return (
    <div className="mx-auto grid max-w-4xl items-stretch gap-4 py-6 lg:grid-cols-[0.9fr_1.1fr]">
      <aside className="relative overflow-hidden rounded-panel bg-felt p-6 text-on-felt shadow-felt sm:p-8">
        <div aria-hidden="true" className="felt-texture absolute inset-0 opacity-40" />
        <div className="relative">
          <Pill tone="felt" size="sm" className="uppercase tracking-[0.14em]">
            <PigMark className="size-3.5" />
            Room {code}
          </Pill>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.02] tracking-[-0.04em]">
            Pull up
            <br />a chair.
          </h1>
          <p className="mt-3 max-w-xs text-sm leading-6 text-on-felt/65">
            The table is set. Pick a name and join the round.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {facts.map((fact) => (
              <Pill key={fact} tone="felt" size="sm">
                {fact}
              </Pill>
            ))}
          </div>

          <PigMascot className="mt-8 w-44 sm:w-52" />
        </div>
      </aside>

      <section className="flex flex-col justify-center rounded-panel border border-line bg-surface p-6 shadow-panel-lg sm:p-8">
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
          <TextField
            label="Display name"
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
            error={error}
          />
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
