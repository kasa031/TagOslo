import type { SunCondition } from "@/types/sol";
import { StatPill } from "@/components/ui/StatPill";

type LiveOsloStripProps = {
  oslo: SunCondition | null;
};

export function LiveOsloStrip({ oslo }: LiveOsloStripProps) {
  const temp =
    oslo?.temperature !== null && oslo?.temperature !== undefined
      ? `${Math.round(oslo.temperature)}°C`
      : "—";
  const clouds = oslo ? `${oslo.cloudPercent}%` : "—";
  const sun = oslo?.label ?? "—";
  const elevation = oslo ? `${Math.round(oslo.sunElevation)}°` : "—";

  return (
    <section
      aria-label="Vær og sol i Oslo"
      className="border-b-2 border-pool-deep/20 bg-gradient-to-r from-oslo-blue-dark via-oslo-blue to-pool-deep px-4 py-4 text-white sm:px-6"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        <StatPill label="Lufttemp" value={temp} className="bg-white/15 backdrop-blur-sm" />
        <StatPill label="Skydekke" value={clouds} className="bg-white/15 backdrop-blur-sm" />
        <StatPill
          label="Sol"
          value={sun}
          className="bg-oslo-cream text-oslo-ink"
          valueClassName="text-base sm:text-lg"
        />
        <StatPill label="Solhøyde" value={elevation} className="bg-white/15 backdrop-blur-sm" />
      </div>
    </section>
  );
}
