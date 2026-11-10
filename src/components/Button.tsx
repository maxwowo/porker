import type { ButtonHTMLAttributes } from "react";
import { cn } from "../lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "felt";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-pink-strong text-on-pink shadow-[0_10px_24px_-12px_var(--pink-strong)] hover:brightness-[1.04]",
  secondary: "border border-line bg-surface text-ink hover:bg-muted",
  ghost: "text-ink-muted hover:bg-muted hover:text-ink",
  felt: "border border-white/15 bg-white/10 text-on-felt hover:bg-white/15",
};

const sizes: Record<Size, string> = {
  sm: "h-9 rounded-[0.65rem] px-3.5 text-sm",
  md: "h-11 rounded-control px-4.5 text-[0.95rem]",
  lg: "h-12 rounded-[0.85rem] px-6 text-base",
  icon: "size-11 rounded-control",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex select-none items-center justify-center gap-2 font-medium transition duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-45",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
