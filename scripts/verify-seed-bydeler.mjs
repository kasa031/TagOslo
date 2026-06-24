/**
 * Verifiserer seed-pins mot samme oppslagslogikk som appen (offisiell kartdata + Bjørvika).
 * Kjør: node scripts/verify-seed-bydeler.mjs
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const geojson = JSON.parse(
  readFileSync(join(__dirname, "../src/data/oslo-bydeler.json"), "utf8"),
);

const OSLO_BOUNDS = { minLat: 59.8, maxLat: 60.05, minLng: 10.6, maxLng: 10.95 };
const BJORVIKA_ZONE = {
  minLat: 59.899,
  maxLat: 59.912,
  minLng: 10.746,
  maxLng: 10.766,
};
const VESTBANEN_ZONE = {
  minLat: 59.905,
  maxLat: 59.909,
  minLng: 10.727,
  maxLng: 10.734,
};

const urban = geojson.features.filter((f) => !f.properties.bydelId.startsWith("MARKA"));

function pointInRing(lng, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function pointInCoords(lng, lat, coordinates) {
  if (!coordinates.length) return false;
  if (Array.isArray(coordinates[0][0][0])) {
    return coordinates.some((poly) => pointInCoords(lng, lat, poly));
  }
  const rings = coordinates;
  if (!pointInRing(lng, lat, rings[0])) return false;
  for (let i = 1; i < rings.length; i++) {
    if (pointInRing(lng, lat, rings[i])) return false;
  }
  return true;
}

function centroid(feature) {
  const ring =
    feature.geometry.type === "Polygon"
      ? feature.geometry.coordinates[0]
      : feature.geometry.coordinates[0][0];
  let lat = 0;
  let lng = 0;
  for (const [x, y] of ring) {
    lng += x;
    lat += y;
  }
  return { lat: lat / ring.length, lng: lng / ring.length };
}

const urbanCentroids = urban.map((f) => ({ feature: f, ...centroid(f) }));

function nearestUrban(lat, lng) {
  let best = null;
  let bestDist = Infinity;
  for (const c of urbanCentroids) {
    const d = (c.lat - lat) ** 2 + (c.lng - lng) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = c.feature;
    }
  }
  return best?.properties ?? null;
}

function lookup(lat, lng) {
  if (
    lat < OSLO_BOUNDS.minLat ||
    lat > OSLO_BOUNDS.maxLat ||
    lng < OSLO_BOUNDS.minLng ||
    lng > OSLO_BOUNDS.maxLng
  ) {
    return null;
  }

  for (const f of geojson.features) {
    if (pointInCoords(lng, lat, f.geometry.coordinates)) {
      if (f.properties.bydelId.startsWith("MARKA")) {
        return nearestUrban(lat, lng);
      }
      return f.properties;
    }
  }

  if (
    lat >= BJORVIKA_ZONE.minLat &&
    lat <= BJORVIKA_ZONE.maxLat &&
    lng >= BJORVIKA_ZONE.minLng &&
    lng <= BJORVIKA_ZONE.maxLng
  ) {
    return { bydelId: "GAMLE_OSLO", name: "Gamle Oslo", number: 1 };
  }

  if (
    lat >= VESTBANEN_ZONE.minLat &&
    lat <= VESTBANEN_ZONE.maxLat &&
    lng >= VESTBANEN_ZONE.minLng &&
    lng <= VESTBANEN_ZONE.maxLng
  ) {
    return { bydelId: "FROGNER", name: "Frogner", number: 5 };
  }

  return nearestUrban(lat, lng);
}

const pins = [
  ["seed-vulkan", "Vulkan", 59.9223, 10.751, "GRUNERLOKKA"],
  ["seed-operaen", "Operahuset", 59.9075, 10.7528, "GAMLE_OSLO"],
  ["seed-munchmuseet", "Munchmuseet", 59.9052, 10.7565, "GAMLE_OSLO"],
  ["seed-deichman", "Deichman", 59.9086, 10.752, "ST_HANSHAUGEN"],
  ["seed-akershus", "Akershus", 59.9076, 10.7371, "ST_HANSHAUGEN"],
  ["seed-oslo-s", "Oslo S", 59.9111, 10.7522, "ST_HANSHAUGEN"],
  ["seed-sognsvann", "Sognsvann", 59.987, 10.735, "NORDRE_AKER"],
  ["seed-ekeberg", "Ekeberg", 59.898, 10.759, "GAMLE_OSLO"],
  ["seed-aker-brygge", "Aker Brygge", 59.909, 10.726, "FROGNER"],
  ["seed-vigelandsparken", "Vigeland", 59.924, 10.7, "FROGNER"],
  ["seed-nasjonalmuseet", "Nasjonalmuseet", 59.9069, 10.7307, "FROGNER"],
  ["seed-holmenkollen", "Holmenkollen", 59.9618, 10.668, "VESTRE_AKER"],
  ["seed-st-hanshaugen-park", "St. Hanshaugen park", 59.9268, 10.7395, "ST_HANSHAUGEN"],
  ["seed-stortinget", "Stortinget", 59.9139, 10.7394, "ST_HANSHAUGEN"],
  ["seed-slottet", "Slottet", 59.917, 10.7276, "ST_HANSHAUGEN"],
  ["seed-radhuset", "Rådhus", 59.9115, 10.7339, "ST_HANSHAUGEN"],
  ["seed-domkirke", "Domkirke", 59.9125, 10.7469, "ST_HANSHAUGEN"],
  ["seed-nationaltheatret", "Nationaltheatret", 59.9142, 10.7342, "ST_HANSHAUGEN"],
];

let errors = 0;
for (const [, name, lat, lng, expected] of pins) {
  const found = lookup(lat, lng);
  const ok = found?.bydelId === expected;
  if (!ok) errors++;
  console.log(
    ok ? "✓" : "✗",
    name,
    "| seed:",
    expected,
    "| kart:",
    found ? `${found.bydelId} (${found.name})` : "utenfor Oslo",
  );
}

console.log("\nGrorud og Alna (egne bydeler):");
for (const [name, lat, lng, expected] of [
  ["Grorud stasjon", 59.9481, 10.878, "GRORUD"],
  ["Furuset", 59.928, 10.89, "ALNA"],
]) {
  const found = lookup(lat, lng);
  const ok = found?.bydelId === expected;
  if (!ok) errors++;
  console.log(ok ? "✓" : "✗", name, "→", found?.bydelId, `(forventet ${expected})`);
}

if (errors) {
  console.error(`\n${errors} avvik`);
  process.exit(1);
}
console.log("\nAlle bydeler stemmer.");
