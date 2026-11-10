import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import { PigMark } from "./Logo";

type CardSize = "sm" | "md" | "lg";
type CardFace = "front" | "back" | "empty";

interface CardStyle {
  dimensions: string;
  mark: string;
  backMark: string;
}

interface PlayingCardProps {
  label?: string;
  face?: CardFace;
  size?: CardSize;
  className?: string;
  style?: CSSProperties;
}

const sizes: Record<CardSize, CardStyle> = {
  sm: {
    dimensions: "h-[70px] w-[52px] rounded-[14px] text-[1.6rem]",
    mark: "size-2",
    backMark: "size-5",
  },
  md: {
    dimensions: "h-[86px] w-[64px] rounded-[17px] text-[2rem]",
    mark: "size-2.5",
    backMark: "size-6",
  },
  lg: {
    dimensions: "h-[98px] w-[71px] rounded-[18px] text-[2.35rem]",
    mark: "size-3",
    backMark: "size-7",
  },
};

const faces: Record<CardFace, string> = {
  front:
    "border-line bg-card text-card-ink shadow-[0_8px_18px_-12px_rgba(43,23,20,0.5),inset_0_0_0_1px_rgba(255,255,255,0.55)]",
  back: "card-back border-felt-deep/60 text-white/90",
  empty: "border-dashed border-white/15 bg-white/[0.025] text-on-felt/25",
};

export function PlayingCard({
  label = "",
  face = "front",
  size = "md",
  className,
  style,
}: PlayingCardProps) {
  const { dimensions, mark, backMark } = sizes[size];
  const compact = label.length <= 2;

  return (
    <div
      aria-hidden="true"
      style={style}
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden border",
        dimensions,
        faces[face],
        className,
      )}
    >
      {face === "front" && (
        <>
          <PigMark className={cn("absolute left-1.5 top-1.5 opacity-25", mark)} />
          <PigMark className={cn("absolute bottom-1.5 right-1.5 rotate-180 opacity-25", mark)} />
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
          <PigMark className={cn("relative text-white/85", backMark)} />
        </>
      )}

      {face === "empty" && <span className="text-lg font-medium">·</span>}
    </div>
  );
}
