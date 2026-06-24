import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBydelLabel(bydel: string): string {
  if (bydel === "HELE_OSLO") return "Hele Oslo";
  return bydel
    .replace(/_/g, " ")
    .replace("GRUNERLOKKA", "Grünerløkka")
    .replace("SONDRE NORDSTRAND", "Søndre Nordstrand")
    .replace("OSTENSJO", "Østensjø")
    .replace("ST HANSHAUGEN", "St. Hanshaugen")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
    .replace("Grünerløkka", "Grünerløkka")
    .replace("Østensjø", "Østensjø");
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function parseHashtags(input: string): string[] {
  const matches = input.match(/#[\p{L}\p{N}_]+/gu);
  return [...new Set((matches ?? []).map((tag) => normalizeHashtag(tag)))];
}

export function isWithinOslo(lat: number, lng: number): boolean {
  return lat >= 59.8 && lat <= 60.05 && lng >= 10.6 && lng <= 10.95;
}

/** Verdi for `<input type="datetime-local">` i brukerens tidssone. */
export function toLocalDatetimeInput(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Fjern diakritikk for sammenligning av hashtags (#kafé = #kafe). */
function stripDiacritics(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "");
}

export function normalizeHashtag(raw: string): string {
  const tag = stripDiacritics(raw.trim().replace(/^#/, "").toLowerCase());
  return tag ? `#${tag}` : "";
}

export function hashtagsMatch(a: string, b: string): boolean {
  return normalizeHashtag(a) === normalizeHashtag(b);
}

export function formatCheckTimeLabel(checkTime: string): string {
  const at = new Date(checkTime);
  const now = new Date();
  if (Math.abs(at.getTime() - now.getTime()) < 2 * 60 * 1000) return "nå";
  return new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(at);
}
