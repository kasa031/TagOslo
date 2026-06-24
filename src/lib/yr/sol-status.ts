import { fetchWeatherAt } from "@/lib/yr/met-forecast";
import { getSolarPosition, isSunUp } from "@/lib/yr/solar";
import type { SolLevel, SunCondition, SunCheckLocation } from "@/types/sol";

const SOL_CLOUD_MAX = 35;
const PARTLY_CLOUD_MAX = 65;
const MIN_SUN_ELEVATION = 8;

function levelLabel(level: SolLevel): string {
  switch (level) {
    case "sol":
      return "Sol nå";
    case "delvis":
      return "Delvis sol";
    case "skyet":
      return "Overskyet";
    case "natt":
      return "Mørk tid";
    case "regn":
      return "Nedbør";
  }
}

function classifySun(
  sunElevation: number,
  cloudPercent: number,
  precipitation: number,
): SolLevel {
  if (!isSunUp(sunElevation)) return "natt";
  if (precipitation > 0.1) return "regn";
  if (cloudPercent <= SOL_CLOUD_MAX && sunElevation >= MIN_SUN_ELEVATION) return "sol";
  if (cloudPercent <= PARTLY_CLOUD_MAX && sunElevation >= MIN_SUN_ELEVATION) return "delvis";
  return "skyet";
}

function buildCondition(
  pinId: string,
  sunElevation: number,
  cloudPercent: number,
  temperature: number | null,
  precipitation: number,
  checkedAt: Date,
  forecastTime: string,
  source: "yr" | "estimate",
): SunCondition {
  const level = classifySun(sunElevation, cloudPercent, precipitation);

  return {
    pinId,
    level,
    label: levelLabel(level),
    cloudPercent,
    sunElevation,
    temperature,
    precipitation,
    isSunnyNow: level === "sol",
    checkedAt: checkedAt.toISOString(),
    forecastTime,
    source,
  };
}

function estimateCloudFromElevation(sunElevation: number): number {
  if (sunElevation <= 0) return 100;
  if (sunElevation < 10) return 55;
  if (sunElevation < 25) return 40;
  return 30;
}

export async function getSunConditionForLocation(
  location: SunCheckLocation,
  at: Date = new Date(),
): Promise<SunCondition> {
  const { elevation } = getSolarPosition(location.latitude, location.longitude, at);
  const weather = await fetchWeatherAt(location.latitude, location.longitude, at);

  if (weather) {
    return buildCondition(
      location.id,
      elevation,
      weather.cloudPercent,
      weather.temperature,
      weather.precipitation,
      at,
      weather.forecastTime,
      "yr",
    );
  }

  const estimatedCloud = estimateCloudFromElevation(elevation);
  return buildCondition(
    location.id,
    elevation,
    estimatedCloud,
    null,
    0,
    at,
    at.toISOString(),
    "estimate",
  );
}

export async function getSunConditionsForLocations(
  locations: SunCheckLocation[],
  at: Date = new Date(),
): Promise<SunCondition[]> {
  const uniqueCoords = new Map<string, SunCheckLocation[]>();

  for (const loc of locations) {
    const key = `${loc.latitude.toFixed(3)}:${loc.longitude.toFixed(3)}`;
    const group = uniqueCoords.get(key) ?? [];
    group.push(loc);
    uniqueCoords.set(key, group);
  }

  const conditionByCoord = new Map<string, SunCondition>();

  await Promise.all(
    [...uniqueCoords.entries()].map(async ([key, group]) => {
      const representative = group[0];
      const condition = await getSunConditionForLocation(representative, at);
      conditionByCoord.set(key, condition);
    }),
  );

  return locations.map((loc) => {
    const key = `${loc.latitude.toFixed(3)}:${loc.longitude.toFixed(3)}`;
    const base = conditionByCoord.get(key)!;
    return { ...base, pinId: loc.id };
  });
}

export async function getOsloCenterSun(at: Date = new Date()): Promise<SunCondition> {
  return getSunConditionForLocation(
    { id: "oslo-center", latitude: 59.9139, longitude: 10.7522 },
    at,
  );
}
