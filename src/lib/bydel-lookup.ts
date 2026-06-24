import type { BydelId } from "@/lib/constants";
import { OSLO_BOUNDS } from "@/lib/constants";
import bydelGeoJson from "@/data/oslo-bydeler.json";

type GeoFeature = {
  properties: {
    bydelId: string;
    name: string;
    number: number;
    isSentrum?: boolean;
  };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
};

const features = (bydelGeoJson as { features: GeoFeature[] }).features;

const URBAN_FEATURES = features.filter(
  (f) => !f.properties.bydelId.startsWith("MARKA"),
);

/** Bjørvika – landfyll utenfor eldre kartdata, administrativt Gamle Oslo. */
const BJORVIKA_ZONE = {
  minLat: 59.899,
  maxLat: 59.912,
  minLng: 10.746,
  maxLng: 10.766,
};

/** Vestbanen / Nasjonalmuseet – hull i kartdata, administrativt Frogner. */
const VESTBANEN_ZONE = {
  minLat: 59.905,
  maxLat: 59.909,
  minLng: 10.727,
  maxLng: 10.734,
};

function pointInRing(lng: number, lat: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersects =
      yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function pointInPolygonCoords(
  lng: number,
  lat: number,
  coordinates: number[][][] | number[][][][],
): boolean {
  if (!coordinates.length) return false;

  if (Array.isArray(coordinates[0][0][0])) {
    return (coordinates as number[][][][]).some((polygon) =>
      pointInPolygonCoords(lng, lat, polygon),
    );
  }

  const rings = coordinates as number[][][];
  if (!pointInRing(lng, lat, rings[0])) return false;
  for (let i = 1; i < rings.length; i++) {
    if (pointInRing(lng, lat, rings[i])) return false;
  }
  return true;
}

function featureCentroid(feature: GeoFeature): { lat: number; lng: number } {
  const ring =
    feature.geometry.type === "Polygon"
      ? (feature.geometry.coordinates[0] as number[][])
      : (feature.geometry.coordinates[0][0] as number[][]);
  let lat = 0;
  let lng = 0;
  for (const [x, y] of ring) {
    lng += x;
    lat += y;
  }
  return { lat: lat / ring.length, lng: lng / ring.length };
}

const urbanCentroids = URBAN_FEATURES.map((f) => ({
  feature: f,
  ...featureCentroid(f),
}));

function nearestUrbanBydel(
  latitude: number,
  longitude: number,
): GeoFeature | null {
  let best: GeoFeature | null = null;
  let bestDist = Infinity;
  for (const c of urbanCentroids) {
    const d = (c.lat - latitude) ** 2 + (c.lng - longitude) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = c.feature;
    }
  }
  return best;
}

function inOsloBounds(latitude: number, longitude: number): boolean {
  return (
    latitude >= OSLO_BOUNDS.minLat &&
    latitude <= OSLO_BOUNDS.maxLat &&
    longitude >= OSLO_BOUNDS.minLng &&
    longitude <= OSLO_BOUNDS.maxLng
  );
}

function inBjorvika(latitude: number, longitude: number): boolean {
  return (
    latitude >= BJORVIKA_ZONE.minLat &&
    latitude <= BJORVIKA_ZONE.maxLat &&
    longitude >= BJORVIKA_ZONE.minLng &&
    longitude <= BJORVIKA_ZONE.maxLng
  );
}

function inVestbanen(latitude: number, longitude: number): boolean {
  return (
    latitude >= VESTBANEN_ZONE.minLat &&
    latitude <= VESTBANEN_ZONE.maxLat &&
    longitude >= VESTBANEN_ZONE.minLng &&
    longitude <= VESTBANEN_ZONE.maxLng
  );
}

function toResult(feature: GeoFeature): BydelLookupResult {
  return {
    bydelId: feature.properties.bydelId as BydelId,
    displayName: feature.properties.name,
    number: feature.properties.number,
  };
}

export type BydelLookupResult = {
  bydelId: BydelId;
  /** Offisiell bydelsbetegnelse (f.eks. «Sentrum») */
  displayName: string;
  number: number;
};

/** Slå opp administrativ bydel fra koordinater (WGS84). Returnerer null utenfor Oslo. */
export function lookupBydelFromCoordinates(
  latitude: number,
  longitude: number,
): BydelLookupResult | null {
  if (!inOsloBounds(latitude, longitude)) return null;

  for (const feature of features) {
    if (
      pointInPolygonCoords(longitude, latitude, feature.geometry.coordinates)
    ) {
      if (feature.properties.bydelId.startsWith("MARKA")) {
        const nearest = nearestUrbanBydel(latitude, longitude);
        return nearest ? toResult(nearest) : null;
      }
      return toResult(feature);
    }
  }

  if (inBjorvika(latitude, longitude)) {
    return {
      bydelId: "GAMLE_OSLO",
      displayName: "Gamle Oslo",
      number: 1,
    };
  }

  if (inVestbanen(latitude, longitude)) {
    return {
      bydelId: "FROGNER",
      displayName: "Frogner",
      number: 5,
    };
  }

  const nearest = nearestUrbanBydel(latitude, longitude);
  return nearest ? toResult(nearest) : null;
}
