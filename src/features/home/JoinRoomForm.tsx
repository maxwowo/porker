import { useState } from "react";
import type { SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { normalizeRoomCode, ROOM_CODE_LENGTH, sanitizeRoomCodeInput } from "../../../shared/codes";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";

const roomCodeInputStyles =
  "min-w-0 flex-1 font-display text-base font-semibold uppercase tracking-[0.22em] placeholder:font-sans placeholder:font-normal placeholder:tracking-normal";

export function JoinRoomForm() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
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
      <label htmlFor="room-code" className="block text-xs font-medium text-ink-muted">
        Have a code?
      </label>
      <div className="flex gap-2">
        <Input
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
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "room-code-error" : undefined}
          className={roomCodeInputStyles}
        />
        <Button type="submit" variant="secondary" className="shrink-0">
          Join
        </Button>
      </div>
      {error && (
        <p id="room-code-error" className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
