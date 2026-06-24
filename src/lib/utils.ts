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
