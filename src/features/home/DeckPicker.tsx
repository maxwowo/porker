import { Check } from "lucide-react";
import { DECK_LIST } from "../../../shared/decks";
import type { Deck, DeckId } from "../../../shared/decks";
import { cn } from "../../lib/cn";

const deckGlyphs: Record<DeckId, string> = {
  fibonacci: "5",
  tshirt: "M",
  "powers-of-two": "2",
};

interface DeckPickerProps {
  value: DeckId;
  onChange: (deckId: DeckId) => void;
}

export function DeckPicker({ value, onChange }: DeckPickerProps) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-medium text-ink-muted">Deck</legend>
      <div className="space-y-2">
        {DECK_LIST.map((deck) => (
          <DeckOption
            key={deck.id}
            deck={deck}
            selected={deck.id === value}
            onSelect={() => onChange(deck.id)}
          />
        ))}
      </div>
    </fieldset>
  );
}

interface DeckOptionProps {
  deck: Deck;
  selected: boolean;
  onSelect: () => void;
}

function DeckOption({ deck, selected, onSelect }: DeckOptionProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-control border p-3 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-pink-strong/50 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface",
        selected ? "border-pink/60 bg-pink-soft/55" : "border-line bg-surface hover:bg-muted/55",
      )}
    >
      <input
        type="radio"
        name="deck"
        value={deck.id}
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-lg border text-xs font-semibold",
          selected
            ? "border-pink/30 bg-surface text-pink-strong"
            : "border-line bg-muted/60 text-ink-muted",
        )}
      >
        {deckGlyphs[deck.id]}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-ink">{deck.name}</span>
        <span className="block truncate text-xs text-ink-muted">{deck.description}</span>
      </span>
      <span
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-full border transition",
          selected
            ? "border-pink-strong bg-pink-strong text-on-pink"
            : "border-line text-transparent",
        )}
      >
        <Check className="size-3" strokeWidth={3} />
      </span>
    </label>
  );
}
