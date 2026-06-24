type MetInstantDetails = {
  air_temperature?: number;
  cloud_area_fraction?: number;
  relative_humidity?: number;
};

type MetTimeseriesEntry = {
  time: string;
  data: {
    instant: { details: MetInstantDetails };
    next_1_hours?: { details: { precipitation_amount?: number } };
  };
};

type MetForecastResponse = {
  properties: {
    meta: { updated_at: string };
    timeseries: MetTimeseriesEntry[];
  };
};

export type MetWeatherSnapshot = {
  cloudPercent: number;
  temperature: number | null;
  precipitation: number;
  forecastTime: string;
  updatedAt: string;
};

const cache = new Map<string, { expires: number; data: MetForecastResponse }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

function cacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(3)}:${lon.toFixed(3)}`;
}

import { getMetUserAgent } from "@/lib/app-config";

function getUserAgent(): string {
  return getMetUserAgent();
}

export async function fetchMetForecast(
  latitude: number,
  longitude: number,
): Promise<MetForecastResponse | null> {
  const key = cacheKey(latitude, longitude);
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  const url = new URL("https://api.met.no/weatherapi/locationforecast/2.0/compact");
  url.searchParams.set("lat", latitude.toFixed(4));
  url.searchParams.set("lon", longitude.toFixed(4));

  try {
    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": getUserAgent(),
        Accept: "application/json",
      },
      next: { revalidate: 600 },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as MetForecastResponse;
    cache.set(key, { data, expires: Date.now() + CACHE_TTL_MS });
    return data;
  } catch {
    return null;
  }
}

export function pickWeatherAtTime(
  forecast: MetForecastResponse,
  at: Date,
): MetWeatherSnapshot | null {
  const entries = forecast.properties.timeseries;
  if (!entries.length) return null;

  const targetMs = at.getTime();
  let closest = entries[0];
  let closestDiff = Math.abs(new Date(entries[0].time).getTime() - targetMs);

  for (const entry of entries) {
    const diff = Math.abs(new Date(entry.time).getTime() - targetMs);
    if (diff < closestDiff) {
      closest = entry;
      closestDiff = diff;
    }
  }

  const details = closest.data.instant.details;
  const precip = closest.data.next_1_hours?.details.precipitation_amount ?? 0;

  return {
    cloudPercent: Math.round(details.cloud_area_fraction ?? 50),
    temperature:
      details.air_temperature !== undefined
        ? Math.round(details.air_temperature * 10) / 10
        : null,
    precipitation: precip,
    forecastTime: closest.time,
    updatedAt: forecast.properties.meta.updated_at,
  };
}

export async function fetchWeatherAt(
  latitude: number,
  longitude: number,
  at: Date,
): Promise<MetWeatherSnapshot | null> {
  const forecast = await fetchMetForecast(latitude, longitude);
  if (!forecast) return null;
  return pickWeatherAtTime(forecast, at);
}
