import { ArrowRight, LoaderCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import type { SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { DEFAULT_DECK_ID } from "../../../shared/decks";
import type { DeckId } from "../../../shared/decks";
import {
  MAX_NAME_LENGTH,
  NAME_REQUIREMENT,
  normalizeDisplayName,
} from "../../../shared/validation";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { ApiError, createRoom } from "../../lib/api";
import { getOrCreateIdentity, loadName, saveName } from "../../lib/identity";
import { DeckPicker } from "./DeckPicker";
import { JoinRoomForm } from "./JoinRoomForm";

export function CreateRoomForm() {
  const navigate = useNavigate();
  const [name, setName] = useState(loadName);
  const [deckId, setDeckId] = useState<DeckId>(DEFAULT_DECK_ID);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = normalizeDisplayName(name);

    if (!normalizedName) {
      setError(NAME_REQUIREMENT);
      return;
    }

    setPending(true);
    setError(null);

    try {
      const { code } = await createRoom(deckId);
      getOrCreateIdentity(code);
      saveName(normalizedName);
      navigate(`/r/${code}`);
    } catch (cause) {
      setError(
        cause instanceof ApiError ? cause.message : "The table could not be created. Try again.",
      );
      setPending(false);
    }
  }

  return (
    <section className="relative rounded-[1.6rem] border border-line bg-surface p-5 shadow-[0_30px_70px_-42px_rgba(60,30,26,0.5)] sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-pink-soft text-pink-strong">
          <Sparkles className="size-5" />
        </span>
        <div>
          <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ink">
            Start a table
          </h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            Name yourself, pick a deck, and share the link.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        <div className="space-y-2">
          <label htmlFor="display-name" className="text-xs font-medium text-ink-muted">
            Your name
          </label>
          <Input
            id="display-name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError(null);
            }}
            placeholder="e.g. Sam"
            autoComplete="nickname"
            maxLength={MAX_NAME_LENGTH}
            required
            aria-invalid={Boolean(error)}
          />
        </div>

        <DeckPicker value={deckId} onChange={setDeckId} />

        {error && (
          <p className="rounded-control bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? (
            <>
              <LoaderCircle className="size-4.5 animate-spin" />
              Setting the table…
            </>
          ) : (
            <>
              Deal me in
              <ArrowRight className="size-4.5" />
            </>
          )}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-ink-muted/70">
        <span className="h-px flex-1 bg-line" />
        or join a table
        <span className="h-px flex-1 bg-line" />
      </div>

      <JoinRoomForm />
    </section>
  );
}
