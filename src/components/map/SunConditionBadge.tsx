import { cn } from "@/lib/utils";
import type { SolLevel } from "@/types/sol";

const levelStyles: Record<SolLevel, string> = {
  sol: "bg-summer-sun text-oslo-ink border-summer-orange",
  delvis: "bg-summer-lime text-oslo-ink border-summer-lime",
  skyet: "bg-summer-sky text-oslo-blue border-oslo-blue",
  natt: "bg-oslo-blue text-white border-oslo-blue",
  regn: "bg-summer-turquoise text-white border-summer-turquoise",
};

const levelIcons: Record<SolLevel, string> = {
  sol: "☀️",
  delvis: "⛅",
  skyet: "☁️",
  natt: "🌙",
  regn: "🌧️",
};

type SunConditionBadgeProps = {
  level: SolLevel;
  label: string;
  compact?: boolean;
  className?: string;
};

export function SunConditionBadge({
  level,
  label,
  compact = false,
  className,
}: SunConditionBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border-2 px-2.5 py-0.5 text-xs font-bold",
        levelStyles[level],
        className,
      )}
    >
      <span aria-hidden>{levelIcons[level]}</span>
      {compact ? label.split(" ")[0] : label}
    </span>
  );
}
