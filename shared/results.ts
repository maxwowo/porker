import { findCard } from "./decks";
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
  const knownVotes = votes.filter((vote) => findCard(deck, vote) !== undefined);
  const numericVotes = knownVotes
    .map((vote) => findCard(deck, vote)?.numeric)
    .filter((value): value is number => value !== undefined);

  return {
    voteCount: knownVotes.length,
    numericVoteCount: numericVotes.length,
    average: numericVotes.length > 0 ? average(numericVotes) : null,
    median: numericVotes.length > 0 ? median(numericVotes) : null,
    consensusValue:
      knownVotes.length > 0 && knownVotes.every((vote) => vote === knownVotes[0])
        ? knownVotes[0]
        : null,
  };
}

export function voteDistribution(deck: Deck, votes: string[]): VoteBucket[] {
  const counts = new Map<string, number>();
  for (const vote of votes) {
    if (findCard(deck, vote)) counts.set(vote, (counts.get(vote) ?? 0) + 1);
  }

  const total = votes.length;
  return deck.cards
    .filter((card) => counts.has(card.value))
    .map((card) => {
      const count = counts.get(card.value) ?? 0;
      return { card, count, percentage: total > 0 ? (count / total) * 100 : 0 };
    });
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}
