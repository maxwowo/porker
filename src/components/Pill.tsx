import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

type PillTone = "surface" | "felt" | "felt-strong" | "accent" | "success";
type PillSize = "sm" | "md";

const tones: Record<PillTone, string> = {
  surface: "border-line bg-surface text-ink-muted",
  felt: "border-white/10 bg-white/5 text-on-felt/70",
  "felt-strong": "border-white/10 bg-white/10 text-on-felt/85",
  accent: "border-pink/20 bg-pink-soft text-pink-strong",
  success: "border-good/30 bg-good/15 text-on-felt",
};

const sizes: Record<PillSize, string> = {
  sm: "h-6 gap-1 px-2 text-2xs",
  md: "h-8 gap-1.5 px-3 text-xs",
};

interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: PillTone;
  size?: PillSize;
}

export function Pill({ tone = "surface", size = "md", className, ...props }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border font-medium",
        tones[tone],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
