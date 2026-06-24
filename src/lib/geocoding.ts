import { OSLO_BOUNDS, OSLO_CENTER } from "@/lib/constants";
import { getAppUrl } from "@/lib/app-config";
import { isWithinOslo } from "@/lib/utils";import {
  getCachedGeocode,
  getCachedReverse,
  setCachedGeocode,
  setCachedReverse,
} from "@/lib/geocoding-cache";

export type GeocodeResult = {
  latitude: number;
  longitude: number;
  address: string;
  placeName: string;
};

type MapboxFeature = {
  place_name: string;
  center: [number, number];
  text: string;
  address?: string;
  place_type?: string[];
};

function formatShortAddress(feature: MapboxFeature): string {
  const street = feature.text?.trim() ?? "";
  const number = feature.address?.trim();
  if (street && number) return `${street} ${number}`;
  return street || feature.place_name.split(",")[0]?.trim() || feature.place_name;
}

function mapboxFetch(url: string, init?: RequestInit) {
  const referer = `${getAppUrl()}/`;
  return fetch(url, {
    ...init,
    headers: {
      ...init?.headers,
      Referer: referer,
    },
  });
}

export async function geocodeAddress(query: string): Promise<GeocodeResult[]> {
  const normalized = query.trim();
  if (normalized.length < 2) return [];

  const cacheKey = normalized.toLowerCase();
  const cached = getCachedGeocode(cacheKey);
  if (cached) return cached;

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) return [];

  const encoded = encodeURIComponent(normalized);
  const bbox = `${OSLO_BOUNDS.minLng},${OSLO_BOUNDS.minLat},${OSLO_BOUNDS.maxLng},${OSLO_BOUNDS.maxLat}`;
  const proximity = `${OSLO_CENTER.longitude},${OSLO_CENTER.latitude}`;

  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json` +
    `?access_token=${token}` +
    `&country=no` +
    `&bbox=${bbox}` +
    `&proximity=${proximity}` +
    `&limit=10` +
    `&language=nb` +
    `&autocomplete=true` +
    `&types=address,street,place,poi,locality,neighborhood`;

  const response = await mapboxFetch(url, { next: { revalidate: 86400 } });  if (!response.ok) return [];

  const data = (await response.json()) as { features: MapboxFeature[] };

  const seen = new Set<string>();
  const results = data.features
    .map((feature) => ({
      latitude: feature.center[1],
      longitude: feature.center[0],
      address: formatShortAddress(feature),
      placeName: feature.place_name,
    }))
    .filter((item) => isWithinOslo(item.latitude, item.longitude))
    .filter((item) => {
      const key = `${item.latitude.toFixed(5)}:${item.longitude.toFixed(5)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  if (results.length > 0) {
    setCachedGeocode(cacheKey, results);
  }

  return results;
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  const cached = getCachedReverse(latitude, longitude);
  if (cached) return cached;

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) return null;

  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json` +
    `?access_token=${token}&language=nb&limit=1&types=address,street,place`;

  const response = await mapboxFetch(url, { next: { revalidate: 86400 } });  if (!response.ok) return null;

  const data = (await response.json()) as { features: MapboxFeature[] };
  const feature = data.features[0];
  if (!feature) return null;

  const placeName = formatShortAddress(feature);
  setCachedReverse(latitude, longitude, placeName);
  return placeName;
}
