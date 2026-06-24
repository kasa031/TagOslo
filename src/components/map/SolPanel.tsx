"use client";

import { RefreshCw, Sun } from "lucide-react";
import type { SunCondition } from "@/types/sol";
import { SunConditionBadge } from "@/components/map/SunConditionBadge";
import { StatPill } from "@/components/ui/StatPill";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn, formatDate, toLocalDatetimeInput } from "@/lib/utils";

type SolPanelProps = {
  oslo: SunCondition | null;
  sunnyCount: number;
  totalChecked: number;
  checkedAt: string | null;
  loading: boolean;
  error: string | null;
  solNowOnly: boolean;
  checkTime: string;
  onToggleSolNow: () => void;
  onRefresh: () => void;
  onCheckTimeChange: (value: string) => void;
  onClearError?: () => void;
};

export function SolPanel({
  oslo,
  sunnyCount,
  totalChecked,
  checkedAt,
  loading,
  error,
  solNowOnly,
  checkTime,
  onToggleSolNow,
  onRefresh,
  onCheckTimeChange,
  onClearError,
}: SolPanelProps) {
  const temp =
    oslo?.temperature !== null && oslo?.temperature !== undefined
      ? `${Math.round(oslo.temperature)}°C`
      : "—";

  return (
    <Card className="overflow-hidden border-pool-sky bg-oslo-blue-light p-0">
      <div className="border-b-2 border-pool-sky/50 bg-gradient-to-r from-pool-deep to-oslo-blue px-5 py-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-oslo-blue" />
            <h2 className="font-display text-lg font-bold">Sol</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            aria-label="Oppdater sol"
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
              className="bg-oslo-cream text-oslo-ink"
              valueClassName="text-sm sm:text-base"
            />
          </div>
        )}
      </div>

      <div className="p-5">
        {error && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-oslo-red/30 bg-oslo-red-light px-3 py-2 text-sm text-oslo-red">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => {
                onClearError?.();
                onRefresh();
              }}
              className="font-bold underline"
            >
              Prøv igjen
            </button>
          </div>
        )}

        {oslo && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <SunConditionBadge level={oslo.level} label={oslo.label} />
            <span className="text-xs text-oslo-muted">
              {sunnyCount}/{totalChecked} med sol nå
            </span>
            {checkedAt && (
              <span className="text-xs text-oslo-muted">
                · Oppdatert {formatDate(checkedAt)}
              </span>
            )}
          </div>
        )}

        {!oslo && !loading && !error && totalChecked === 0 && (
          <p className="mb-4 text-sm text-oslo-muted">
            Ingen steder å sjekke sol for — juster filtre eller legg til steder.
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sol-check-time" className="text-sm font-medium text-oslo-ink">
              Tidspunkt
            </label>
            <div className="flex gap-2">
              <input
                id="sol-check-time"
                type="datetime-local"
                value={checkTime}
                onChange={(e) => onCheckTimeChange(e.target.value)}
                className="min-w-0 flex-1 rounded-xl border-2 border-oslo-border bg-white px-3 py-2.5 text-sm"
              />
              <button
                type="button"
                onClick={() => onCheckTimeChange(toLocalDatetimeInput(new Date()))}
                className="shrink-0 rounded-xl border-2 border-oslo-border bg-white px-3 py-2.5 text-sm font-medium text-oslo-ink hover:bg-oslo-blue-light"
              >
                Nå
              </button>
            </div>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={onToggleSolNow}
              className={cn(
                "w-full rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition",
                solNowOnly
                  ? "border-oslo-blue bg-oslo-blue text-white"
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
