export const BYDELER = [
  { id: "ALNA", label: "Alna" },
  { id: "BJERKE", label: "Bjerke" },
  { id: "FROGNER", label: "Frogner" },
  { id: "GAMLE_OSLO", label: "Gamle Oslo" },
  { id: "GRORUD", label: "Grorud" },
  { id: "GRUNERLOKKA", label: "Grünerløkka" },
  { id: "NORDRE_AKER", label: "Nordre Aker" },
  { id: "NORDSTRAND", label: "Nordstrand" },
  { id: "SAGENE", label: "Sagene" },
  { id: "ST_HANSHAUGEN", label: "St. Hanshaugen" },
  { id: "STOVNER", label: "Stovner" },
  { id: "SONDRE_NORDSTRAND", label: "Søndre Nordstrand" },
  { id: "ULLERN", label: "Ullern" },
  { id: "VESTRE_AKER", label: "Vestre Aker" },
  { id: "OSTENSJO", label: "Østensjø" },
] as const;

export type BydelId = (typeof BYDELER)[number]["id"];

export const POPULAR_HASHTAGS = [
  "#solservering",
  "#uteservering",
  "#lokalhistorie",
  "#skjultperle",
  "#tursti",
  "#kafé",
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
