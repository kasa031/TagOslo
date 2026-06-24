export const BYDELER = [
  { id: "GAMLE_OSLO", label: "Gamle Oslo", number: 1 },
  { id: "GRUNERLOKKA", label: "Grünerløkka", number: 2 },
  { id: "SAGENE", label: "Sagene", number: 3 },
  { id: "ST_HANSHAUGEN", label: "St. Hanshaugen", number: 4 },
  { id: "FROGNER", label: "Frogner", number: 5 },
  { id: "ULLERN", label: "Ullern", number: 6 },
  { id: "VESTRE_AKER", label: "Vestre Aker", number: 7 },
  { id: "NORDRE_AKER", label: "Nordre Aker", number: 8 },
  { id: "BJERKE", label: "Bjerke", number: 9 },
  { id: "GRORUD", label: "Grorud", number: 10 },
  { id: "STOVNER", label: "Stovner", number: 11 },
  { id: "ALNA", label: "Alna", number: 12 },
  { id: "OSTENSJO", label: "Østensjø", number: 13 },
  { id: "NORDSTRAND", label: "Nordstrand", number: 14 },
  { id: "SONDRE_NORDSTRAND", label: "Søndre Nordstrand", number: 15 },
] as const;

export type BydelId = (typeof BYDELER)[number]["id"];

/** Bydel for polls og tilbakemeldinger — inkluderer «Hele Oslo». */
export type PollBydelId = BydelId | "HELE_OSLO";

export const POPULAR_HASHTAGS = [
  "#solservering",
  "#uteservering",
  "#lokalhistorie",
  "#skjultperle",
  "#tursti",
  "#kafe",
  "#utsikt",
  "#familievennlig",
] as const;

export const PLACE_CATEGORIES = [
  { id: "UTESTED", label: "Utested" },
  { id: "SPISESTED", label: "Spisested" },
  { id: "BYGNING", label: "Bygning / historie" },
  { id: "PARK", label: "Park / uteområde" },
  { id: "ANNET", label: "Annet" },
] as const;

export const OSLO_CENTER = {
  latitude: 59.9139,
  longitude: 10.7522,
  zoom: 12,
} as const;

export const OSLO_BOUNDS = {
  minLat: 59.80,
  maxLat: 60.05,
  minLng: 10.60,
  maxLng: 10.95,
} as const;

export const APP_NAME = "TagOslo";
export const APP_TAGLINE = "Tag steder. Del Oslo. Si din mening.";
export const APP_DOMAIN = "tagoslo.no";
export { CONTACT_EMAIL } from "@/lib/contact";
export const APP_DESCRIPTION =
  "Tag steder på kartet, del lokalhistorie, finn solservering og si din mening til politikere i Oslo.";

export const TERRACE_FACING = [
  { id: "", label: "Ukjent / ikke relevant" },
  { id: "N", label: "Nord" },
  { id: "NO", label: "Nordøst" },
  { id: "O", label: "Øst" },
  { id: "SO", label: "Sørøst" },
  { id: "S", label: "Sør" },
  { id: "SV", label: "Sørvest" },
  { id: "V", label: "Vest" },
  { id: "NV", label: "Nordvest" },
] as const;
