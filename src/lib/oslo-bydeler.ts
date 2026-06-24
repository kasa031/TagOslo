import { formatBydelLabel } from "@/lib/utils";

export const SENTRUM_SERVICE_BYDEL = "ST_HANSHAUGEN" as const;

/** Steder i Sentrum som vises med det navnet (administrativt St. Hanshaugen i DB). */
export const SENTRUM_PLACE_IDS = new Set([
  "seed-stortinget",
  "seed-slottet",
  "seed-radhuset",
  "seed-domkirke",
  "seed-nationaltheatret",
  "seed-oslo-s",
  "seed-deichman",
  "seed-akershus",
]);

/** Grorud (10) og Alna (12) er egne bydeler siden 2004 – naboer i Groruddalen, ikke del/hel. */
export const BYDEL_OFFICIAL_NOTES: Record<string, string | undefined> = {
  GRORUD: "Bydel 10 – nabo til Alna",
  ALNA: "Bydel 12 – nabo til Grorud",
};

export function formatPinBydelLabel(bydel: string, pinId?: string): string {
  if (pinId && SENTRUM_PLACE_IDS.has(pinId) && bydel === SENTRUM_SERVICE_BYDEL) {
    return "Sentrum";
  }
  return formatBydelLabel(bydel);
}
