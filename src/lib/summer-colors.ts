/** Oslo-farger fra våpenet og offisiell profil — ingen knæsj rosa/turkis. */
export const OSLO_PALETTE = {
  osloBlue: "#103d91",
  osloBlueDark: "#0a2d6b",
  osloBlueLight: "#e8f0fa",
  osloRed: "#c82521",
  osloRedLight: "#fce8e8",
  osloSilver: "#d1d3d4",
  osloCream: "#fff1bd",
  osloInk: "#0f172a",
} as const;

export const POLL_BAR_COLORS = [
  "bg-oslo-blue",
  "bg-oslo-red",
  "bg-oslo-blue-dark",
  "bg-pool-deep",
  "bg-oslo-blue-light",
  "bg-oslo-red-light",
  "bg-pool-sky",
  "bg-oslo-silver",
] as const;

export const POLL_BORDER_COLORS = [
  "border-l-oslo-blue",
  "border-l-oslo-red",
  "border-l-oslo-blue-dark",
  "border-l-pool-deep",
  "border-l-oslo-blue-light",
  "border-l-oslo-red-light",
  "border-l-pool-sky",
  "border-l-oslo-silver",
] as const;

export const POLL_TOP_ACCENTS = [
  "border-t-oslo-blue",
  "border-t-oslo-red",
  "border-t-oslo-blue-dark",
  "border-t-pool-deep",
  "border-t-oslo-blue-light",
  "border-t-oslo-red-light",
  "border-t-pool-sky",
  "border-t-oslo-silver",
] as const;

export const ACCENT_PILLS = [
  "bg-oslo-blue text-white",
  "bg-oslo-red text-white",
  "bg-oslo-blue-dark text-white",
  "bg-pool-deep text-white",
  "bg-oslo-blue-light text-oslo-ink",
  "bg-oslo-red-light text-oslo-red",
  "bg-pool-sky text-oslo-blue-dark",
  "bg-oslo-silver text-oslo-ink",
] as const;

export const ICON_SQUARES = [
  "bg-oslo-blue text-white",
  "bg-oslo-red text-white",
  "bg-oslo-blue-dark text-white",
  "bg-pool-deep text-white",
  "bg-oslo-blue-light text-oslo-ink",
  "bg-oslo-red-light text-oslo-red",
  "bg-pool-sky text-oslo-blue-dark",
  "bg-oslo-silver text-oslo-ink",
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

/** @deprecated Bruk OSLO_PALETTE — beholdt for sol-paneler som trenger varme solfarger. */
export const SUMMER_OSLO = {
  osloBlue: OSLO_PALETTE.osloBlue,
  osloRed: OSLO_PALETTE.osloRed,
  sun: "#ffd500",
  sky: OSLO_PALETTE.osloBlueLight,
  cream: OSLO_PALETTE.osloCream,
} as const;
