import type { Deck, DeckCard } from "./decks";

export interface RoundResults {
  voteCount: number;
  numericVoteCount: number;
  average: number | null;
  median: number | null;
  consensusValue: string | null;
}

export interface VoteBucket {
  card: DeckCard;
  count: number;
  percentage: number;
}

export function computeResults(deck: Deck, votes: string[]): RoundResults {
  const cards = knownCards(deck, votes);
  const numericVotes = cards.flatMap((card) => (card.numeric === undefined ? [] : [card.numeric]));

  return {
    voteCount: cards.length,
    numericVoteCount: numericVotes.length,
    average: numericVotes.length > 0 ? average(numericVotes) : null,
    median: numericVotes.length > 0 ? median(numericVotes) : null,
    consensusValue: consensusValue(cards),
  };
}

export function voteDistribution(deck: Deck, votes: string[]): VoteBucket[] {
  const cards = knownCards(deck, votes);
  const counts = countByValue(cards);

  return deck.cards
    .filter((card) => counts.has(card.value))
    .map((card) => {
      const count = counts.get(card.value) ?? 0;
      return {
        card,
        count,
        percentage: cards.length > 0 ? (count / cards.length) * 100 : 0,
      };
    });
}

function knownCards(deck: Deck, votes: string[]): DeckCard[] {
  const cardsByValue = new Map(deck.cards.map((card) => [card.value, card]));
  return votes.flatMap((vote) => {
    const card = cardsByValue.get(vote);
    return card ? [card] : [];
  });
}

function consensusValue(cards: DeckCard[]): string | null {
  const [first, ...rest] = cards;
  return first && rest.every((card) => card.value === first.value) ? first.value : null;
}

function countByValue(cards: DeckCard[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const card of cards) {
    counts.set(card.value, (counts.get(card.value) ?? 0) + 1);
  }
  return counts;
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}
