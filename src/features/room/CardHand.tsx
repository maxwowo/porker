import { useEffect, useRef } from "react";
import type { Deck, DeckCard } from "../../../shared/decks";
import { PlayingCard } from "../../components/PlayingCard";
import { cn } from "../../lib/cn";

interface CardHandProps {
  deck: Deck;
  selected: string | null;
  disabled: boolean;
  onSelect: (card: string | null) => void;
}

export function CardHand({ deck, selected, disabled, onSelect }: CardHandProps) {
  const selectedCardRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const revealSelected = () => {
      selectedCardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    };

    revealSelected();
    window.addEventListener("resize", revealSelected);
    return () => window.removeEventListener("resize", revealSelected);
  }, [selected]);

  return (
    <div
      className="card-scroll -mx-2 overflow-x-auto px-2 pb-1.5 pt-4"
      role="group"
      aria-label="Your vote"
    >
      <div className="flex w-max gap-2 sm:gap-2.5">
        {deck.cards.map((card) => {
          const isSelected = selected === card.value;

          return (
            <button
              key={card.value}
              ref={isSelected ? selectedCardRef : undefined}
              type="button"
              disabled={disabled}
              aria-pressed={isSelected}
              aria-label={cardAriaLabel(card)}
              onClick={() => onSelect(isSelected ? null : card.value)}
              className={cn(
                "relative rounded-[1.05rem] transition duration-200 ease-out focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:opacity-55",
                isSelected
                  ? "-translate-y-1.5 shadow-[0_14px_24px_-14px_rgba(60,30,26,0.65)]"
                  : "hover:-translate-y-0.5",
              )}
            >
              <PlayingCard
                label={card.label}
                face="front"
                size="md"
                className={cn(
                  isSelected && "border-pink-strong ring-2 ring-inset ring-pink-strong/80",
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function cardAriaLabel(card: DeckCard): string {
  if (card.value === "?") return "Vote: no idea";
  if (card.value === "coffee") return "Vote: need a break";
  return `Vote ${card.label}`;
}
