/**
 * Builds a lightweight land-pixel dataset from Natural Earth country polygons.
 *
 * Usage:
 *   node scripts/preprocess-geography.mjs
 *
 * Downloads ne_50m_admin_0_countries.geojson (cached in /tmp), samples a
 * regular lat/lon grid, and writes data/land-pixels.json.
 */

import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT_PATH = resolve(ROOT, "data/land-pixels.json");

const GEOJSON_URLS = [
  "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_50m_admin_0_countries.geojson",
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson",
];

const GRID_SIZE = 1.2;

/**
 * Mainland / primary-territory clips so overseas departments do not
 * light up the wrong hemisphere (e.g. France → French Guiana).
 */
const COUNTRY_CLIPS = {
  FR: { minLon: -5.8, maxLon: 9.8, minLat: 41.2, maxLat: 51.3 },
  NL: { minLon: 3.1, maxLon: 7.4, minLat: 50.6, maxLat: 53.8 },
  GB: { minLon: -8.8, maxLon: 2.1, minLat: 49.8, maxLat: 61.0 },
  DK: { minLon: 7.8, maxLon: 15.2, minLat: 54.4, maxLat: 58.0 },
  NO: { minLon: 4.3, maxLon: 31.5, minLat: 57.8, maxLat: 71.4 },
  US: { minLon: -179.5, maxLon: -66.8, minLat: 18.8, maxLat: 71.6 },
  PT: { minLon: -9.6, maxLon: -6.1, minLat: 36.9, maxLat: 42.2 },
  EC: { minLon: -81.2, maxLon: -75.1, minLat: -5.1, maxLat: 1.6 },
};

/**
 * Guaranteed visible cells for countries smaller than the sample grid.
 * [iso, name, continent, lat, lon]
 */
const FORCE_PIXELS = [
  ["SG", "Singapore", "Asia", 1.35, 103.82],
  ["BH", "Bahrain", "Asia", 26.07, 50.55],
  ["QA", "Qatar", "Asia", 25.32, 51.19],
  ["KW", "Kuwait", "Asia", 29.31, 47.49],
  ["AE", "United Arab Emirates", "Asia", 24.45, 54.38],
  ["PR", "Puerto Rico", "North America", 18.22, -66.59],
  ["TT", "Trinidad and Tobago", "North America", 10.69, -61.22],
  ["PA", "Panama", "North America", 8.54, -80.78],
  ["MT", "Malta", "Europe", 35.94, 14.38],
  ["LU", "Luxembourg", "Europe", 49.82, 6.13],
  ["CY", "Cyprus", "Europe", 35.13, 33.43],
];

const ISO_A3_TO_A2 = {
  KAZ: "KZ",
  MNG: "MN",
  CHN: "CN",
  JPN: "JP",
  IND: "IN",
  THA: "TH",
  MYS: "MY",
  SGP: "SG",
  IDN: "ID",
  SAU: "SA",
  ARE: "AE",
  QAT: "QA",
  KWT: "KW",
  BHR: "BH",
  OMN: "OM",
  NOR: "NO",
  SWE: "SE",
  DNK: "DK",
  NLD: "NL",
  BEL: "BE",
  IRL: "IE",
  GBR: "GB",
  FRA: "FR",
  ESP: "ES",
  ITA: "IT",
  COD: "CD",
  UGA: "UG",
  TZA: "TZ",
  ZMB: "ZM",
  MDG: "MG",
  ZWE: "ZW",
  BWA: "BW",
  NAM: "NA",
  CAN: "CA",
  USA: "US",
  MEX: "MX",
  PAN: "PA",
  PRI: "PR",
  TTO: "TT",
  COL: "CO",
  ECU: "EC",
  PER: "PE",
  BRA: "BR",
  CHL: "CL",
  ARG: "AR",
  PNG: "PG",
  AUS: "AU",
  NZL: "NZ",
};

function pointInRing(lon, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const denom = yj - yi || 1e-12;
    const intersects = yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / denom + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function pointInPolygon(lon, lat, rings) {
  if (!rings.length || !pointInRing(lon, lat, rings[0])) return false;
  for (let i = 1; i < rings.length; i += 1) {
    if (pointInRing(lon, lat, rings[i])) return false;
  }
  return true;
}

function geometryContains(geometry, lon, lat) {
  if (!geometry) return false;
  if (geometry.type === "Polygon") {
    return (
      pointInPolygon(lon, lat, geometry.coordinates) ||
      pointInPolygon(lon + 360, lat, geometry.coordinates) ||
      pointInPolygon(lon - 360, lat, geometry.coordinates)
    );
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.some(
      (rings) =>
        pointInPolygon(lon, lat, rings) ||
        pointInPolygon(lon + 360, lat, rings) ||
        pointInPolygon(lon - 360, lat, rings)
    );
  }
  return false;
}

function ringBBox(ring, bbox) {
  for (const [lon, lat] of ring) {
    if (lon < bbox.minLon) bbox.minLon = lon;
    if (lon > bbox.maxLon) bbox.maxLon = lon;
    if (lat < bbox.minLat) bbox.minLat = lat;
    if (lat > bbox.maxLat) bbox.maxLat = lat;
  }
}

function geometryBBox(geometry) {
  const bbox = { minLon: Infinity, maxLon: -Infinity, minLat: Infinity, maxLat: -Infinity };
  if (geometry.type === "Polygon") {
    ringBBox(geometry.coordinates[0], bbox);
  } else if (geometry.type === "MultiPolygon") {
    for (const poly of geometry.coordinates) ringBBox(poly[0], bbox);
  }
  if (bbox.maxLon - bbox.minLon > 180) {
    bbox.crossesAntimeridian = true;
  }
  return bbox;
}

function inBBox(lon, lat, bbox) {
  if (lat < bbox.minLat - GRID_SIZE || lat > bbox.maxLat + GRID_SIZE) return false;
  if (bbox.crossesAntimeridian) return true;
  return lon >= bbox.minLon - GRID_SIZE && lon <= bbox.maxLon + GRID_SIZE;
}

function inClip(iso, lon, lat) {
  const clip = COUNTRY_CLIPS[iso];
  if (!clip) return true;
  return lon >= clip.minLon && lon <= clip.maxLon && lat >= clip.minLat && lat <= clip.maxLat;
}

const INVALID_CODES = new Set(["", "-99", "XX", "NONE", "NAN", "NULL"]);
const NAME_ISO = {
  france: "FR",
  norway: "NO",
  "united states of america": "US",
  "united kingdom": "GB",
};

function cleanCode(value) {
  const code = String(value || "").toUpperCase().trim();
  return INVALID_CODES.has(code) ? "" : code;
}

function readIso(props) {
  for (const key of ["ISO_A2_EH", "ISO_A2", "iso_a2"]) {
    const code = cleanCode(props[key]);
    if (code.length === 2) return code;
  }
  for (const key of ["ISO_A3_EH", "ADM0_A3", "ISO_A3", "iso_a3", "ADM0_A3_IS"]) {
    const code = cleanCode(props[key]);
    if (ISO_A3_TO_A2[code]) return ISO_A3_TO_A2[code];
  }
  const name = String(props.ADMIN || props.NAME || props.NAME_LONG || "").toLowerCase();
  return NAME_ISO[name] || "";
}

function readName(props) {
  return props.NAME_LONG || props.ADMIN || props.NAME || props.name || "Unknown";
}

function readContinent(props) {
  return props.CONTINENT || props.continent || "Unknown";
}

function centroidOf(geometry) {
  let sx = 0;
  let sy = 0;
  let n = 0;
  const useRing = (ring) => {
    for (const [lon, lat] of ring) {
      if (Math.abs(lon) > 179.9) continue;
      sx += lon;
      sy += lat;
      n += 1;
    }
  };
  if (geometry.type === "Polygon") useRing(geometry.coordinates[0]);
  if (geometry.type === "MultiPolygon") {
    let best = geometry.coordinates[0];
    let bestLen = 0;
    for (const poly of geometry.coordinates) {
      if (poly[0].length > bestLen) {
        best = poly;
        bestLen = poly[0].length;
      }
    }
    useRing(best[0]);
  }
  return n ? { lon: sx / n, lat: sy / n } : null;
}

async function loadGeoJSON() {
  let lastError;
  for (const url of GEOJSON_URLS) {
    try {
      console.log(`Downloading ${url}`);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (error) {
      lastError = error;
      console.warn(`Failed: ${error.message}`);
    }
  }
  throw lastError;
}

async function main() {
  const geojson = await loadGeoJSON();
  const features = geojson.features || [];
  console.log(`Loaded ${features.length} country features`);

  const prepared = features
    .map((feature) => {
      const iso = readIso(feature.properties || {});
      if (!iso) return null;
      return {
        iso,
        name: readName(feature.properties || {}),
        continent: readContinent(feature.properties || {}),
        geometry: feature.geometry,
        bbox: geometryBBox(feature.geometry),
      };
    })
    .filter(Boolean);

  const countries = new Map();
  const pixels = [];
  const seen = new Set();

  const addPixel = (lat, lon, iso, name, continent) => {
    const key = `${iso}:${lat.toFixed(3)}:${lon.toFixed(3)}`;
    if (seen.has(key)) return;
    seen.add(key);
    if (!countries.has(iso)) countries.set(iso, { name, continent });
    pixels.push([
      Math.round(lat * 100) / 100,
      Math.round(lon * 100) / 100,
      iso,
    ]);
  };

  for (let lat = -88.8; lat <= 88.8; lat += GRID_SIZE) {
    for (let lon = -180; lon < 180; lon += GRID_SIZE) {
      const sampleLat = lat + GRID_SIZE / 2;
      const sampleLon = lon + GRID_SIZE / 2;
      let match = null;
      for (const country of prepared) {
        if (!inBBox(sampleLon, sampleLat, country.bbox)) continue;
        if (!inClip(country.iso, sampleLon, sampleLat)) continue;
        if (geometryContains(country.geometry, sampleLon, sampleLat)) {
          match = country;
          break;
        }
      }
      if (match) addPixel(sampleLat, sampleLon, match.iso, match.name, match.continent);
    }
  }

  const counts = new Map();
  for (const [, , iso] of pixels) counts.set(iso, (counts.get(iso) || 0) + 1);

  for (const country of prepared) {
    if ((counts.get(country.iso) || 0) > 0) continue;
    const clip = COUNTRY_CLIPS[country.iso];
    let point = centroidOf(country.geometry);
    if (clip) {
      point = {
        lat: (clip.minLat + clip.maxLat) / 2,
        lon: (clip.minLon + clip.maxLon) / 2,
      };
    }
    if (!point) continue;
    addPixel(point.lat, point.lon, country.iso, country.name, country.continent);
    counts.set(country.iso, 1);
  }

  for (const [iso, name, continent, lat, lon] of FORCE_PIXELS) {
    if ((counts.get(iso) || 0) > 0) continue;
    addPixel(lat, lon, iso, name, continent);
  }

  const A2_TO_A3 = Object.fromEntries(
    Object.entries(ISO_A3_TO_A2).map(([iso3, iso2]) => [iso2, iso3])
  );
  const countryList = [...countries.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([iso, meta]) => [iso.length === 3 ? iso : A2_TO_A3[iso] || iso, meta.name, meta.continent, iso]);

  const indexByIso = new Map();
  countryList.forEach((row, i) => {
    indexByIso.set(row[0], i);
    if (row[3]) indexByIso.set(row[3], i);
  });
  const compactPixels = pixels.map(([lat, lon, iso]) => [lat, lon, indexByIso.get(iso)]);

  const output = {
    version: 2,
    gridSize: GRID_SIZE,
    countries: countryList,
    pixels: compactPixels,
  };

  await mkdir(dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(output));
  console.log(`Wrote ${pixels.length} land pixels, ${countryList.length} countries → ${OUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
