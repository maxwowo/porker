import type { InputHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-control border border-line bg-surface px-3.5 text-[0.95rem] text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] outline-none transition placeholder:text-ink-muted/55 focus:border-pink/60 focus:ring-3 focus:ring-pink/15",
        className,
      )}
      {...props}
    />
  );
}
