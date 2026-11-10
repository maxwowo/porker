import { cn } from "../lib/cn";

const avatarStyles = [
  "bg-[#FBE0E6] text-[#8F2943]",
  "bg-[#FCEFD2] text-[#7A5110]",
  "bg-[#DCEFE7] text-[#1E5A46]",
  "bg-[#E4E7FA] text-[#3C438C]",
  "bg-[#F1E4D7] text-[#6E4628]",
  "bg-[#E8E2F6] text-[#55378A]",
];

interface AvatarProps {
  name: string;
  participantId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "size-8 text-[0.7rem]",
  md: "size-10 text-xs",
  lg: "size-12 text-sm",
};

export function Avatar({ name, participantId, size = "md", className }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-semibold uppercase tracking-wide ring-2 ring-white/70",
        avatarStyles[hash(participantId) % avatarStyles.length],
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
