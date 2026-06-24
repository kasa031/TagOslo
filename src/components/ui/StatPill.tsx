import { cn } from "@/lib/utils";

type StatPillProps = {
  label: string;
  value: string;
  className?: string;
  valueClassName?: string;
};

export function StatPill({ label, value, className, valueClassName }: StatPillProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center rounded-2xl px-3 py-3 text-center sm:px-4",
        className,
      )}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider opacity-90 sm:text-xs">
        {label}
      </span>
      <span className={cn("mt-1 text-lg font-extrabold tabular-nums sm:text-xl", valueClassName)}>
        {value}
      </span>
    </div>
  );
}
