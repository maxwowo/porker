import { cn } from "../lib/cn";
import { PigMark } from "./Logo";

type CardSize = "sm" | "md" | "lg";
type CardFace = "front" | "back" | "empty";

interface PlayingCardProps {
  label?: string;
  face?: CardFace;
  size?: CardSize;
  className?: string;
}

const sizes: Record<CardSize, string> = {
  sm: "h-[4.35rem] w-[3.25rem] rounded-[0.9rem] text-[1.6rem]",
  md: "h-[5.4rem] w-[4rem] rounded-[1.05rem] text-[2rem]",
  lg: "h-[6.1rem] w-[4.45rem] rounded-[1.15rem] text-[2.35rem]",
};

const markSizes: Record<CardSize, string> = {
  sm: "size-2",
  md: "size-2.5",
  lg: "size-3",
};

export function PlayingCard({
  label = "",
  face = "front",
  size = "md",
  className,
}: PlayingCardProps) {
  const compact = label.length <= 2;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden border",
        sizes[size],
        face === "front" &&
          "border-line bg-card text-card-ink shadow-[0_8px_18px_-12px_rgba(43,23,20,0.5),inset_0_0_0_1px_rgba(255,255,255,0.55)]",
        face === "back" && "card-back border-felt-deep/60 text-white/90",
        face === "empty" && "border-dashed border-white/25 bg-white/5 text-on-felt/35",
        className,
      )}
    >
      {face === "front" && (
        <>
          <PigMark className={cn("absolute left-1.5 top-1.5 opacity-25", markSizes[size])} />
          <PigMark
            className={cn("absolute bottom-1.5 right-1.5 rotate-180 opacity-25", markSizes[size])}
          />
          <span
            className={cn(
              "font-display font-bold leading-none tracking-[-0.06em]",
              compact ? "" : "text-[0.72em] tracking-[-0.08em]",
            )}
          >
            {label}
          </span>
        </>
      )}

      {face === "back" && (
        <>
          <span className="absolute inset-1.5 rounded-[inherit] border border-white/15" />
          <span className="absolute inset-0 card-back-pattern opacity-30" />
          <PigMark className={cn("relative text-white/85", markSizes[size])} />
        </>
      )}

      {face === "empty" && <span className="text-lg font-medium">·</span>}
    </div>
  );
}
