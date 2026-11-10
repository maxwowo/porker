import { cn } from "../lib/cn";

const avatarTones = [
  "avatar-rose",
  "avatar-amber",
  "avatar-mint",
  "avatar-indigo",
  "avatar-clay",
  "avatar-violet",
] as const;

const sizes = {
  sm: "size-8 text-2xs",
  md: "size-10 text-xs",
  lg: "size-12 text-sm",
};

interface AvatarProps {
  name: string;
  participantId: string;
  size?: keyof typeof sizes;
  className?: string;
}

export function Avatar({ name, participantId, size = "md", className }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-semibold uppercase tracking-wide ring-2 ring-white/70",
        avatarTones[hash(participantId) % avatarTones.length],
        sizes[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";

  const first = Array.from(words[0])[0] ?? "";
  const last = words.length > 1 ? (Array.from(words.at(-1) ?? "")[0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}

function hash(value: string): number {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) >>> 0;
  }
  return result;
}
