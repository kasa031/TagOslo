import { cn } from "@/lib/utils";
import { ACCENT_PILLS } from "@/lib/summer-colors";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "hashtag" | "category" | "summer";
  colorIndex?: number;
  className?: string;
};

export function Badge({
  children,
  variant = "default",
  colorIndex = 0,
  className,
}: BadgeProps) {
  const summerClass = ACCENT_PILLS[colorIndex % ACCENT_PILLS.length];

  const variants = {
    default: "bg-oslo-blue text-white",
    hashtag: "bg-oslo-blue text-white",
    category: "bg-oslo-red text-white",
    summer: summerClass,
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
