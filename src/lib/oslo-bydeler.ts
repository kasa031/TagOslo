import { formatBydelLabel } from "@/lib/utils";

export const SENTRUM_SERVICE_BYDEL = "ST_HANSHAUGEN" as const;

export const SENTRUM_PLACE_IDS = new Set([
  "seed-stortinget",
  "seed-slottet",
  "seed-radhuset",
  "seed-domkirke",
  "seed-nationaltheatret",
]);

export function formatPinBydelLabel(bydel: string, pinId?: string): string {
  if (pinId && SENTRUM_PLACE_IDS.has(pinId) && bydel === SENTRUM_SERVICE_BYDEL) {
    return "Sentrum";
  }
  return formatBydelLabel(bydel);
}
