export const SUMMER_OSLO = {
  osloBlue: "#004f9f",
  osloRed: "#c8102e",
  coral: "#ff5c7a",
  turquoise: "#00c9c8",
  sun: "#ffd500",
  lime: "#9ae600",
  orange: "#ff8c00",
  magenta: "#ff3d9a",
  sky: "#e8f4ff",
  cream: "#fffbeb",
} as const;

export const POLL_BAR_COLORS = [
  "bg-oslo-blue",
  "bg-oslo-red",
  "bg-summer-coral",
  "bg-summer-turquoise",
  "bg-summer-sun",
  "bg-summer-lime",
  "bg-summer-orange",
  "bg-summer-magenta",
] as const;

export const POLL_BORDER_COLORS = [
  "border-l-oslo-blue",
  "border-l-oslo-red",
  "border-l-summer-coral",
  "border-l-summer-turquoise",
  "border-l-summer-sun",
  "border-l-summer-lime",
  "border-l-summer-orange",
  "border-l-summer-magenta",
] as const;

export const POLL_TOP_ACCENTS = [
  "border-t-oslo-blue",
  "border-t-oslo-red",
  "border-t-summer-coral",
  "border-t-summer-turquoise",
  "border-t-summer-sun",
  "border-t-summer-lime",
  "border-t-summer-orange",
  "border-t-summer-magenta",
] as const;

export const ACCENT_PILLS = [
  "bg-oslo-blue text-white",
  "bg-oslo-red text-white",
  "bg-summer-coral text-white",
  "bg-summer-turquoise text-white",
  "bg-summer-sun text-oslo-ink",
  "bg-summer-lime text-oslo-ink",
  "bg-summer-orange text-white",
  "bg-summer-magenta text-white",
] as const;

export const ICON_SQUARES = [
  "bg-oslo-blue text-white",
  "bg-summer-coral text-white",
  "bg-summer-turquoise text-white",
  "bg-summer-sun text-oslo-ink",
  "bg-oslo-red text-white",
  "bg-summer-lime text-oslo-ink",
  "bg-summer-orange text-white",
  "bg-summer-magenta text-white",
] as const;

export function pickColor<T extends readonly string[]>(palette: T, index: number): T[number] {
  return palette[index % palette.length];
}

export function hashIndex(seed: string, modulo: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % modulo;
  }
  return hash;
}
