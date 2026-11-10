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
import { IconBadge } from "../../components/IconBadge";
import { TextField } from "../../components/TextField";
import { ApiError, createRoom } from "../../lib/api";
import { getOrCreateIdentity, loadName, saveName } from "../../lib/identity";
import { DeckPicker } from "./DeckPicker";
import { JoinRoomForm } from "./JoinRoomForm";

export function CreateRoomForm() {
  const navigate = useNavigate();
  const [name, setName] = useState(loadName);
  const [deckId, setDeckId] = useState<DeckId>(DEFAULT_DECK_ID);
  const [pending, setPending] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = normalizeDisplayName(name);

    if (!normalizedName) {
      setNameError(NAME_REQUIREMENT);
      return;
    }

    setPending(true);
    setNameError(null);
    setSubmitError(null);

    try {
      const { code } = await createRoom(deckId);
      getOrCreateIdentity(code);
      saveName(normalizedName);
      navigate(`/r/${code}`);
    } catch (cause) {
      setSubmitError(
        cause instanceof ApiError ? cause.message : "The table could not be created. Try again.",
      );
      setPending(false);
    }
  }

  function handleNameChange(value: string) {
    setName(value);
    setNameError(null);
    setSubmitError(null);
  }

  return (
    <section className="relative rounded-panel border border-line bg-surface p-5 shadow-panel-lg sm:p-6">
      <div className="flex items-start gap-3">
        <IconBadge>
          <Sparkles className="size-5" />
        </IconBadge>
        <div>
          <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ink">
            Start a table
          </h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            Name yourself, pick a deck, and share the link.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-5" aria-busy={pending}>
        <TextField
          label="Your name"
          value={name}
          onChange={(event) => handleNameChange(event.target.value)}
          placeholder="e.g. Sam"
          autoComplete="nickname"
          maxLength={MAX_NAME_LENGTH}
          required
          error={nameError}
        />

        <DeckPicker value={deckId} onChange={setDeckId} />

        {submitError && (
          <p className="rounded-control bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
            {submitError}
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

      <div className="my-5 flex items-center gap-3 text-2xs font-medium uppercase tracking-[0.14em] text-ink-muted/70">
        <span className="h-px flex-1 bg-line" />
        or join a table
        <span className="h-px flex-1 bg-line" />
      </div>

      <JoinRoomForm />
    </section>
  );
}
