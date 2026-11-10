import { CheckCircle2 } from "lucide-react";
import { computeResults, voteDistribution } from "../../../shared/results";
import type { RoomSnapshot } from "../../../shared/protocol";
import { voteLabel } from "../../../shared/room";
import { Pill } from "../../components/Pill";
import { formatNumber } from "../../lib/format";

const MIN_BAR_PERCENTAGE = 3;

export function ResultsBar({ snapshot }: { snapshot: RoomSnapshot }) {
  const votes = snapshot.participants.flatMap((participant) =>
    participant.vote === null ? [] : [participant.vote],
  );
  const results = computeResults(snapshot.deck, votes);
  const buckets = voteDistribution(snapshot.deck, votes);

  if (results.voteCount === 0) {
    return (
      <p className="rounded-control border border-white/10 bg-white/5 px-4 py-3 text-sm text-on-felt/60">
        Nobody put a card down. Start a new round when the team is ready.
      </p>
    );
  }

  const metrics = [
    results.average === null ? null : { label: "Average", value: formatNumber(results.average) },
    results.median === null ? null : { label: "Median", value: formatNumber(results.median) },
    { label: results.voteCount === 1 ? "Card" : "Cards", value: String(results.voteCount) },
  ].flatMap((metric) => (metric ? [metric] : []));

  return (
    <div className="mx-auto w-full max-w-lg" aria-live="polite">
      <div className="flex flex-wrap items-end justify-center gap-x-6 gap-y-3">
        {metrics.map((metric) => (
          <Metric key={metric.label} label={metric.label} value={metric.value} />
        ))}
        {results.consensusValue && (
          <Pill tone="success">
            <CheckCircle2 className="size-3.5 text-good" />
            Consensus: {voteLabel(snapshot.deck.id, results.consensusValue)}
          </Pill>
        )}
      </div>

      <div className="mt-5 space-y-2">
        {buckets.map((bucket) => (
          <div key={bucket.card.value} className="flex items-center gap-2.5">
            <span className="w-7 text-right font-display text-sm font-semibold text-on-felt/80">
              {bucket.card.label}
            </span>
            <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <span
                className="block h-full rounded-full bg-pink transition-[width] duration-500 ease-out"
                style={{ width: `${Math.max(bucket.percentage, MIN_BAR_PERCENTAGE)}%` }}
              />
            </span>
            <span className="w-4 text-right text-xs tabular-nums text-on-felt/55">
              {bucket.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-3xl font-bold tracking-[-0.04em] text-on-felt">{value}</div>
      <div className="mt-0.5 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-on-felt/45">
        {label}
      </div>
    </div>
  );
}
