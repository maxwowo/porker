import { describe, expect, it } from "vitest";
import { DECKS } from "../shared/decks";
import { computeResults, voteDistribution } from "../shared/results";

describe("results", () => {
  const fibonacci = DECKS.fibonacci;

  it("computes average, median, and agreement for numeric votes", () => {
    expect(computeResults(fibonacci, ["1", "2", "3", "5"])).toMatchObject({
      voteCount: 4,
      numericVoteCount: 4,
      average: 2.75,
      median: 2.5,
      consensusValue: null,
    });
  });

  it("handles an even number of votes", () => {
    expect(computeResults(fibonacci, ["0.5", "1"]).median).toBe(0.75);
    expect(computeResults(fibonacci, ["5", "5"]).consensusValue).toBe("5");
  });

  it("ignores non-numeric cards for average and median", () => {
    const results = computeResults(fibonacci, ["1", "3", "?", "coffee"]);

    expect(results.voteCount).toBe(4);
    expect(results.numericVoteCount).toBe(2);
    expect(results.average).toBe(2);
    expect(results.median).toBe(2);
  });

  it("requires every vote to match for consensus", () => {
    expect(computeResults(fibonacci, ["?", "?"]).consensusValue).toBe("?");
    expect(computeResults(fibonacci, ["?", "coffee"]).consensusValue).toBeNull();
    expect(computeResults(fibonacci, []).consensusValue).toBeNull();
  });

  it("returns no numbers for t-shirt sizes", () => {
    const results = computeResults(DECKS.tshirt, ["S", "M", "M"]);

    expect(results.voteCount).toBe(3);
    expect(results.numericVoteCount).toBe(0);
    expect(results.average).toBeNull();
    expect(results.median).toBeNull();
    expect(results.consensusValue).toBeNull();
  });

  it("builds a distribution in deck order", () => {
    const buckets = voteDistribution(fibonacci, ["8", "3", "8", "5"]);

    expect(buckets.map((bucket) => bucket.card.value)).toEqual(["3", "5", "8"]);
    expect(buckets.map((bucket) => bucket.count)).toEqual([1, 1, 2]);
    expect(buckets[2].percentage).toBe(50);
  });
});
