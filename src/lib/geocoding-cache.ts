import { MemoryCache } from "@/lib/cache/memory";
import type { GeocodeResult } from "@/lib/geocoding";

const GEOCODE_TTL_MS = 24 * 60 * 60 * 1000;
const REVERSE_TTL_MS = 24 * 60 * 60 * 1000;

const geocodeCache = new MemoryCache<GeocodeResult[]>(GEOCODE_TTL_MS);
const reverseCache = new MemoryCache<string>(REVERSE_TTL_MS);

export function getCachedGeocode(query: string): GeocodeResult[] | undefined {
  return geocodeCache.get(query.toLowerCase().trim());
}

export function setCachedGeocode(query: string, results: GeocodeResult[]): void {
  geocodeCache.set(query.toLowerCase().trim(), results);
}

export function getCachedReverse(lat: number, lng: number): string | undefined {
  const key = `${lat.toFixed(4)}:${lng.toFixed(4)}`;
  return reverseCache.get(key);
}

export function setCachedReverse(lat: number, lng: number, address: string): void {
  const key = `${lat.toFixed(4)}:${lng.toFixed(4)}`;
  reverseCache.set(key, address);
}
