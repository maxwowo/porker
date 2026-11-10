import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

type IconBadgeSize = "sm" | "md" | "lg" | "xl";

const sizes: Record<IconBadgeSize, string> = {
  sm: "size-9 rounded-xl",
  md: "size-10 rounded-xl",
  lg: "size-14 rounded-[1.25rem]",
  xl: "size-16 rounded-[1.5rem]",
};

interface IconBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  size?: IconBadgeSize;
}

export function IconBadge({ size = "md", className, ...props }: IconBadgeProps) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center bg-pink-soft text-pink-strong",
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
