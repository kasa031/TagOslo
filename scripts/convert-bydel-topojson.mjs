/**
 * Konverterer Oslo kommune TopoJSON (Bydeler_u_marka) til GeoJSON for punkt-i-polygon.
 * Kilde: https://github.com/AnalyseABO/Kart-fylker-og-kommuner-json (Oslo kommune)
 * Kjør: node scripts/convert-bydel-topojson.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
/** Med Marka — dekker f.eks. Sognsvann og Holmenkollen (Oslo kommune). */
const IN = join(__dirname, "../src/data/oslo-bydeler-raw-marka.json");
const OUT = join(__dirname, "../src/data/oslo-bydeler.json");

/** Offisiell bydel → Prisma enum. Sentrum (16) lagres som St. Hanshaugen i DB. */
const BYDELSNAVN_TO_ID = {
  "Gamle Oslo": "GAMLE_OSLO",
  "Grünerløkka": "GRUNERLOKKA",
  Sagene: "SAGENE",
  "St. Hanshaugen": "ST_HANSHAUGEN",
  Frogner: "FROGNER",
  Ullern: "ULLERN",
  "Vestre Aker": "VESTRE_AKER",
  "Nordre Aker": "NORDRE_AKER",
  Bjerke: "BJERKE",
  Grorud: "GRORUD",
  Stovner: "STOVNER",
  Alna: "ALNA",
  Østensjø: "OSTENSJO",
  Nordstrand: "NORDSTRAND",
  "Søndre Nordstrand": "SONDRE_NORDSTRAND",
  Sentrum: "ST_HANSHAUGEN",
  /** Marka tilhører Oslo kommune; vis nærmeste bydel for turmål i skogen. */
  "Marka Nord": "MARKA_NORD",
  "Marka Øst": "MARKA_OST",
};

function decodeArc(arcIndex, arcs, transform) {
  const arc = arcs[arcIndex < 0 ? ~arcIndex : arcIndex];
  let x = 0;
  let y = 0;
  const coords = [];
  for (const [dx, dy] of arc) {
    x += dx;
    y += dy;
    coords.push([
      x * transform.scale[0] + transform.translate[0],
      y * transform.scale[1] + transform.translate[1],
    ]);
  }
  if (arcIndex < 0) coords.reverse();
  return coords;
}

function ringFromArcs(arcList, arcs, transform) {
  const coords = [];
  for (const arcIndex of arcList) {
    const segment = decodeArc(arcIndex, arcs, transform);
    if (coords.length) segment.shift();
    coords.push(...segment);
  }
  return coords;
}

function geometryFromTopo(geom, arcs, transform) {
  if (geom.type === "Polygon") {
    return {
      type: "Polygon",
      coordinates: geom.arcs.map((ring) => ringFromArcs(ring, arcs, transform)),
    };
  }
  if (geom.type === "MultiPolygon") {
    return {
      type: "MultiPolygon",
      coordinates: geom.arcs.map((polygon) =>
        polygon.map((ring) => ringFromArcs(ring, arcs, transform)),
      ),
    };
  }
  throw new Error(`Ustøttet geometri: ${geom.type}`);
}

const topo = JSON.parse(readFileSync(IN, "utf8"));
const collection = topo.objects.Bydeler;
const features = [];

for (const geom of collection.geometries) {
  const { BYDELSNAVN, BYDEL } = geom.properties;
  const bydelId = BYDELSNAVN_TO_ID[BYDELSNAVN];
  if (!bydelId) {
    console.warn("Hopper over ukjent:", BYDELSNAVN);
    continue;
  }

  features.push({
    type: "Feature",
    properties: {
      bydelId,
      name: BYDELSNAVN,
      number: Number(BYDEL),
      isSentrum: BYDELSNAVN === "Sentrum",
    },
    geometry: geometryFromTopo(geom, topo.arcs, topo.transform),
  });
  console.log(`✓ ${BYDEL}. ${BYDELSNAVN} → ${bydelId}`);
}

features.sort((a, b) => a.properties.number - b.properties.number);

const geojson = { type: "FeatureCollection", features };
writeFileSync(OUT, JSON.stringify(geojson));
console.log(`\nLagret ${features.length} bydeler → ${OUT}`);
