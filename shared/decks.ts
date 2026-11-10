export type DeckId = "fibonacci" | "tshirt" | "powers-of-two";

export interface DeckCard {
  value: string;
  label: string;
  numeric?: number;
}

export interface Deck {
  id: DeckId;
  name: string;
  description: string;
  cards: DeckCard[];
}

const fibonacci: Deck = {
  id: "fibonacci",
  name: "Fibonacci",
  description: "The classic scrum sequence",
  cards: [
    { value: "0", label: "0", numeric: 0 },
    { value: "0.5", label: "½", numeric: 0.5 },
    { value: "1", label: "1", numeric: 1 },
    { value: "2", label: "2", numeric: 2 },
    { value: "3", label: "3", numeric: 3 },
    { value: "5", label: "5", numeric: 5 },
    { value: "8", label: "8", numeric: 8 },
    { value: "13", label: "13", numeric: 13 },
    { value: "21", label: "21", numeric: 21 },
    { value: "34", label: "34", numeric: 34 },
    { value: "55", label: "55", numeric: 55 },
    { value: "89", label: "89", numeric: 89 },
    { value: "?", label: "?" },
    { value: "coffee", label: "☕" },
  ],
};

const tshirt: Deck = {
  id: "tshirt",
  name: "T-shirt",
  description: "Sizes for high-level shaping",
  cards: [
    { value: "XS", label: "XS" },
    { value: "S", label: "S" },
    { value: "M", label: "M" },
    { value: "L", label: "L" },
    { value: "XL", label: "XL" },
    { value: "XXL", label: "XXL" },
    { value: "?", label: "?" },
    { value: "coffee", label: "☕" },
  ],
};

const powersOfTwo: Deck = {
  id: "powers-of-two",
  name: "Powers of two",
  description: "Doubling without the drama",
  cards: [
    { value: "0", label: "0", numeric: 0 },
    { value: "1", label: "1", numeric: 1 },
    { value: "2", label: "2", numeric: 2 },
    { value: "4", label: "4", numeric: 4 },
    { value: "8", label: "8", numeric: 8 },
    { value: "16", label: "16", numeric: 16 },
    { value: "32", label: "32", numeric: 32 },
    { value: "64", label: "64", numeric: 64 },
    { value: "?", label: "?" },
    { value: "coffee", label: "☕" },
  ],
};

export const DECKS: Record<DeckId, Deck> = {
  fibonacci,
  tshirt,
  "powers-of-two": powersOfTwo,
};

export const DECK_LIST = Object.values(DECKS);
export const DEFAULT_DECK_ID: DeckId = "fibonacci";

export function isDeckId(value: unknown): value is DeckId {
  return typeof value === "string" && value in DECKS;
}

export function getDeck(id: DeckId): Deck {
  return DECKS[id];
}

export function findCard(deck: Deck, value: string): DeckCard | undefined {
  return deck.cards.find((card) => card.value === value);
}

export function isCardValue(deck: Deck, value: unknown): value is string {
  return typeof value === "string" && findCard(deck, value) !== undefined;
}
