"use client";

import { RefreshCw, Sun } from "lucide-react";
import type { SunCondition } from "@/types/sol";
import { SunConditionBadge } from "@/components/map/SunConditionBadge";
import { StatPill } from "@/components/ui/StatPill";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type SolPanelProps = {
  oslo: SunCondition | null;
  sunnyCount: number;
  totalChecked: number;
  checkedAt: string | null;
  loading: boolean;
  solNowOnly: boolean;
  checkTime: string;
  onToggleSolNow: () => void;
  onRefresh: () => void;
  onCheckTimeChange: (value: string) => void;
};

export function SolPanel({
  oslo,
  sunnyCount,
  totalChecked,
  loading,
  solNowOnly,
  checkTime,
  onToggleSolNow,
  onRefresh,
  onCheckTimeChange,
}: SolPanelProps) {
  const temp =
    oslo?.temperature !== null && oslo?.temperature !== undefined
      ? `${Math.round(oslo.temperature)}°C`
      : "—";

  return (
    <Card className="overflow-hidden border-pool-sky bg-summer-sky p-0">
      <div className="border-b-2 border-pool-sky/50 bg-gradient-to-r from-pool-deep to-oslo-blue px-5 py-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-summer-sun" />
            <h2 className="font-display text-lg font-bold">Sol</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            aria-label="Oppdater"
            className="text-white hover:bg-white/15"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>

        {oslo && (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatPill label="Lufttemp" value={temp} className="bg-white/15" />
            <StatPill label="Skydekke" value={`${oslo.cloudPercent}%`} className="bg-white/15" />
            <StatPill
              label="Solhøyde"
              value={`${Math.round(oslo.sunElevation)}°`}
              className="bg-white/15"
            />
            <StatPill
              label="Status"
              value={oslo.label}
              className="bg-summer-sun text-oslo-ink"
              valueClassName="text-sm sm:text-base"
            />
          </div>
        )}
      </div>

      <div className="p-5">
        {oslo && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <SunConditionBadge level={oslo.level} label={oslo.label} />
            <span className="text-xs text-oslo-muted">
              {sunnyCount}/{totalChecked} med sol
            </span>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sol-check-time" className="text-sm font-medium text-oslo-ink">
              Tidspunkt
            </label>
            <input
              id="sol-check-time"
              type="datetime-local"
              value={checkTime}
              onChange={(e) => onCheckTimeChange(e.target.value)}
              className="rounded-xl border-2 border-oslo-border bg-white px-3 py-2.5 text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={onToggleSolNow}
              className={cn(
                "w-full rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition",
                solNowOnly
                  ? "border-summer-sun bg-summer-sun text-oslo-ink"
                  : "border-oslo-border bg-white text-oslo-ink hover:bg-pool-sky/20",
              )}
            >
              {solNowOnly ? "Kun sol" : "Alle steder"}
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
