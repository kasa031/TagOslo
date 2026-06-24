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
  return [...new Set((matches ?? []).map((tag) => tag.toLowerCase()))];
}

export function isWithinOslo(lat: number, lng: number): boolean {
  return lat >= 59.8 && lat <= 60.05 && lng >= 10.6 && lng <= 10.95;
}

/** Verdi for `<input type="datetime-local">` i brukerens tidssone. */
export function toLocalDatetimeInput(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Normaliser hashtag fra URL eller brukerinput til `#tag`-format. */
export function normalizeHashtag(raw: string): string {
  const tag = raw.trim().replace(/^#/, "").toLowerCase();
  return tag ? `#${tag}` : "";
}
