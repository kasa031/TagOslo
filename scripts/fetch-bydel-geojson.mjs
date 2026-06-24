/**
 * Henter Oslo bydelsgrenser fra Overpass (OSM) og lagrer som GeoJSON.
 * Kjør: node scripts/fetch-bydel-geojson.mjs
 */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../src/data/oslo-bydeler.geojson");

const QUERY = `
[out:json][timeout:120];
area["name"="Oslo"]["admin_level"="4"]->.oslo;
(
  relation(area.oslo)["boundary"="administrative"]["admin_level"="10"]["name"];
);
out geom;
`;

const OSM_TO_BYDEL = {
  "Gamle Oslo": "GAMLE_OSLO",
  "Grünerløkka": "GRUNERLOKKA",
  "Sagene": "SAGENE",
  "St. Hanshaugen": "ST_HANSHAUGEN",
  "Frogner": "FROGNER",
  "Ullern": "ULLERN",
  "Vestre Aker": "VESTRE_AKER",
  "Nordre Aker": "NORDRE_AKER",
  "Bjerke": "BJERKE",
  Grorud: "GRORUD",
  Stovner: "STOVNER",
  Alna: "ALNA",
  Østensjø: "OSTENSJO",
  Nordstrand: "NORDSTRAND",
  "Søndre Nordstrand": "SONDRE_NORDSTRAND",
};

function ringFromWay(way, nodes) {
  const coords = way.nodes.map((id) => {
    const n = nodes.get(id);
    return [n.lon, n.lat];
  });
  if (coords.length > 1) {
    const [a0, a1] = coords[0];
    const [b0, b1] = coords[coords.length - 1];
    if (a0 !== b0 || a1 !== b1) coords.push(coords[0]);
  }
  return coords;
}

function relationToPolygons(relation, elements) {
  const nodes = new Map();
  const ways = new Map();
  for (const el of elements) {
    if (el.type === "node") nodes.set(el.id, el);
    if (el.type === "way") ways.set(el.id, el);
  }

  const outers = relation.members.filter((m) => m.role === "outer" && m.type === "way");
  const polygons = [];

  for (const member of outers) {
    const way = ways.get(member.ref);
    if (!way?.nodes?.length) continue;
    const ring = ringFromWay(way, nodes);
    if (ring.length >= 4) polygons.push([ring]);
  }

  return polygons;
}

async function main() {
  const res = await fetch("https://overpass.kumi.systems/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ data: QUERY }),
  });

  if (!res.ok) throw new Error(`Overpass ${res.status}`);
  const data = await res.json();

  const features = [];
  for (const el of data.elements) {
    if (el.type !== "relation") continue;
    const name = el.tags?.name;
    const bydelId = OSM_TO_BYDEL[name];
    if (!bydelId) {
      console.warn("Ukjent bydel:", name);
      continue;
    }

    const polygons = relationToPolygons(el, data.elements);
    if (!polygons.length) {
      console.warn("Ingen polygon for", name);
      continue;
    }

    features.push({
      type: "Feature",
      properties: { name, bydelId },
      geometry:
        polygons.length === 1
          ? { type: "Polygon", coordinates: polygons[0] }
          : { type: "MultiPolygon", coordinates: polygons },
    });
    console.log("✓", name, "→", bydelId);
  }

  const geojson = { type: "FeatureCollection", features };
  writeFileSync(OUT, JSON.stringify(geojson));
  console.log(`Lagret ${features.length} bydeler → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
