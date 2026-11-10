import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { normalizeRoomCode, ROOM_CODE_LENGTH, sanitizeRoomCodeInput } from "../../../shared/codes";

export function JoinRoomForm() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeRoomCode(code);

    if (!normalized) {
      setError(`That code is not valid. Check the ${ROOM_CODE_LENGTH} characters and try again.`);
      return;
    }

    navigate(`/r/${normalized}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label htmlFor="room-code" className="text-xs font-medium text-ink-muted">
        Have a code?
      </label>
      <div className="flex gap-2">
        <input
          id="room-code"
          value={code}
          onChange={(event) => {
            setCode(sanitizeRoomCodeInput(event.target.value));
            setError(null);
          }}
          placeholder="K7M2QP"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={Boolean(error)}
          className="h-11 min-w-0 flex-1 rounded-control border border-line bg-surface px-3.5 font-display text-base font-semibold uppercase tracking-[0.22em] text-ink outline-none transition placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-ink-muted/50 focus:border-pink/60 focus:ring-2 focus:ring-pink/15"
        />
        <button
          type="submit"
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-control border border-line bg-surface px-4 text-sm font-medium text-ink transition hover:bg-muted active:translate-y-px"
        >
          Join
        </button>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </form>
  );
}
