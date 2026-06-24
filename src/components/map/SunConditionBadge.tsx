import { cn } from "@/lib/utils";
import type { SolLevel } from "@/types/sol";

const levelStyles: Record<SolLevel, string> = {
  sol: "bg-oslo-cream text-oslo-ink border-oslo-blue",
  delvis: "bg-oslo-blue-light text-oslo-blue border-oslo-blue",
  skyet: "bg-oslo-silver text-oslo-ink border-oslo-muted",
  natt: "bg-oslo-blue-dark text-white border-oslo-blue-dark",
  regn: "bg-pool-sky text-oslo-blue-dark border-pool-deep",
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
