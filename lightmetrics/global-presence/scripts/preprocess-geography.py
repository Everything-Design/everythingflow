#!/usr/bin/env python3
"""
Builds a lightweight land-pixel dataset from Natural Earth country polygons.

Usage:
  python3 scripts/preprocess-geography.py
"""

from __future__ import annotations

import json
import math
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_PATH = ROOT / "data" / "land-pixels.json"
CACHE_PATH = ROOT / "data" / "cache" / "ne_50m_admin_0_countries.geojson"

GEOJSON_URLS = [
    "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_50m_admin_0_countries.geojson",
    "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson",
]

GRID_SIZE = 1.2

COUNTRY_CLIPS = {
    "FR": {"minLon": -5.8, "maxLon": 9.8, "minLat": 41.2, "maxLat": 51.3},
    "NL": {"minLon": 3.1, "maxLon": 7.4, "minLat": 50.6, "maxLat": 53.8},
    "GB": {"minLon": -8.8, "maxLon": 2.1, "minLat": 49.8, "maxLat": 61.0},
    "DK": {"minLon": 7.8, "maxLon": 15.2, "minLat": 54.4, "maxLat": 58.0},
    "NO": {"minLon": 4.3, "maxLon": 31.5, "minLat": 57.8, "maxLat": 71.4},
    "US": {"minLon": -179.5, "maxLon": -66.8, "minLat": 18.8, "maxLat": 71.6},
    "PT": {"minLon": -9.6, "maxLon": -6.1, "minLat": 36.9, "maxLat": 42.2},
    "EC": {"minLon": -81.2, "maxLon": -75.1, "minLat": -5.1, "maxLat": 1.6},
}

FORCE_PIXELS = [
    ("SG", "Singapore", "Asia", 1.35, 103.82),
    ("BH", "Bahrain", "Asia", 26.07, 50.55),
    ("QA", "Qatar", "Asia", 25.32, 51.19),
    ("KW", "Kuwait", "Asia", 29.31, 47.49),
    ("AE", "United Arab Emirates", "Asia", 24.45, 54.38),
    ("PR", "Puerto Rico", "North America", 18.22, -66.59),
    ("TT", "Trinidad and Tobago", "North America", 10.69, -61.22),
    ("PA", "Panama", "North America", 8.54, -80.78),
    ("MT", "Malta", "Europe", 35.94, 14.38),
    ("LU", "Luxembourg", "Europe", 49.82, 6.13),
    ("CY", "Cyprus", "Europe", 35.13, 33.43),
]

ISO_A3_TO_A2 = {
    "KAZ": "KZ",
    "MNG": "MN",
    "CHN": "CN",
    "JPN": "JP",
    "IND": "IN",
    "THA": "TH",
    "MYS": "MY",
    "SGP": "SG",
    "IDN": "ID",
    "SAU": "SA",
    "ARE": "AE",
    "QAT": "QA",
    "KWT": "KW",
    "BHR": "BH",
    "OMN": "OM",
    "NOR": "NO",
    "SWE": "SE",
    "DNK": "DK",
    "NLD": "NL",
    "BEL": "BE",
    "IRL": "IE",
    "GBR": "GB",
    "FRA": "FR",
    "ESP": "ES",
    "ITA": "IT",
    "COD": "CD",
    "UGA": "UG",
    "TZA": "TZ",
    "ZMB": "ZM",
    "MDG": "MG",
    "ZWE": "ZW",
    "BWA": "BW",
    "NAM": "NA",
    "CAN": "CA",
    "USA": "US",
    "MEX": "MX",
    "PAN": "PA",
    "PRI": "PR",
    "TTO": "TT",
    "COL": "CO",
    "ECU": "EC",
    "PER": "PE",
    "BRA": "BR",
    "CHL": "CL",
    "ARG": "AR",
    "PNG": "PG",
    "AUS": "AU",
    "NZL": "NZ",
}


def point_in_ring(lon: float, lat: float, ring: list) -> bool:
    inside = False
    j = len(ring) - 1
    for i, (xi, yi, *_) in enumerate(ring):
        xj, yj = ring[j][0], ring[j][1]
        denom = (yj - yi) or 1e-12
        intersects = (yi > lat) != (yj > lat) and lon < ((xj - xi) * (lat - yi)) / denom + xi
        if intersects:
            inside = not inside
        j = i
    return inside


def point_in_polygon(lon: float, lat: float, rings: list) -> bool:
    if not rings or not point_in_ring(lon, lat, rings[0]):
        return False
    for hole in rings[1:]:
        if point_in_ring(lon, lat, hole):
            return False
    return True


def geometry_contains(geometry: dict, lon: float, lat: float) -> bool:
    gtype = geometry.get("type")
    if gtype == "Polygon":
        rings = geometry["coordinates"]
        return (
            point_in_polygon(lon, lat, rings)
            or point_in_polygon(lon + 360, lat, rings)
            or point_in_polygon(lon - 360, lat, rings)
        )
    if gtype == "MultiPolygon":
        for rings in geometry["coordinates"]:
            if (
                point_in_polygon(lon, lat, rings)
                or point_in_polygon(lon + 360, lat, rings)
                or point_in_polygon(lon - 360, lat, rings)
            ):
                return True
    return False


def ring_bbox(ring: list, bbox: dict) -> None:
    for lon, lat, *_ in ring:
        if lon < bbox["minLon"]:
            bbox["minLon"] = lon
        if lon > bbox["maxLon"]:
            bbox["maxLon"] = lon
        if lat < bbox["minLat"]:
            bbox["minLat"] = lat
        if lat > bbox["maxLat"]:
            bbox["maxLat"] = lat


def geometry_bbox(geometry: dict) -> dict:
    bbox = {"minLon": math.inf, "maxLon": -math.inf, "minLat": math.inf, "maxLat": -math.inf, "crossesAntimeridian": False}
    gtype = geometry.get("type")
    if gtype == "Polygon":
        ring_bbox(geometry["coordinates"][0], bbox)
    elif gtype == "MultiPolygon":
        for poly in geometry["coordinates"]:
            ring_bbox(poly[0], bbox)
    if bbox["maxLon"] - bbox["minLon"] > 180:
        bbox["crossesAntimeridian"] = True
    return bbox


def in_bbox(lon: float, lat: float, bbox: dict) -> bool:
    if lat < bbox["minLat"] - GRID_SIZE or lat > bbox["maxLat"] + GRID_SIZE:
        return False
    if bbox["crossesAntimeridian"]:
        return True
    return bbox["minLon"] - GRID_SIZE <= lon <= bbox["maxLon"] + GRID_SIZE


def in_clip(iso: str, lon: float, lat: float) -> bool:
    clip = COUNTRY_CLIPS.get(iso)
    if not clip:
        return True
    return clip["minLon"] <= lon <= clip["maxLon"] and clip["minLat"] <= lat <= clip["maxLat"]


INVALID_CODES = {"", "-99", "XX", "NONE", "NAN", "NULL"}

NAME_ISO = {
    "france": "FR",
    "norway": "NO",
    "united states of america": "US",
    "united kingdom": "GB",
    "denmark": "DK",
    "netherlands": "NL",
}


def clean_code(value) -> str:
    code = str(value or "").upper().strip()
    return "" if code in INVALID_CODES else code


def read_iso(props: dict) -> str:
    for key in ("ISO_A2_EH", "ISO_A2", "iso_a2"):
        code = clean_code(props.get(key))
        if len(code) == 2:
            return code
    for key in ("ISO_A3_EH", "ADM0_A3", "ISO_A3", "iso_a3", "ADM0_A3_IS"):
        code = clean_code(props.get(key))
        if code in ISO_A3_TO_A2:
            return ISO_A3_TO_A2[code]
        if len(code) == 3 and code.isalpha():
            guessed = code[:2]
            if guessed.isalpha():
                return guessed
    name = str(props.get("ADMIN") or props.get("NAME") or props.get("NAME_LONG") or "").lower()
    return NAME_ISO.get(name, "")


def read_name(props: dict) -> str:
    return props.get("NAME_LONG") or props.get("ADMIN") or props.get("NAME") or props.get("name") or "Unknown"


def read_continent(props: dict) -> str:
    return props.get("CONTINENT") or props.get("continent") or "Unknown"


def centroid_of(geometry: dict):
    sx = sy = n = 0
    rings = []
    if geometry.get("type") == "Polygon":
        rings = [geometry["coordinates"][0]]
    elif geometry.get("type") == "MultiPolygon":
        rings = [max(geometry["coordinates"], key=lambda poly: len(poly[0]))[0]]
    for ring in rings:
        for lon, lat, *_ in ring:
            if abs(lon) > 179.9:
                continue
            sx += lon
            sy += lat
            n += 1
    if not n:
        return None
    return {"lon": sx / n, "lat": sy / n}


def load_geojson() -> dict:
    if CACHE_PATH.exists():
        print(f"Using cached {CACHE_PATH}")
        return json.loads(CACHE_PATH.read_text())
    last_error = None
    for url in GEOJSON_URLS:
        try:
            print(f"Downloading {url}")
            with urllib.request.urlopen(url, timeout=90) as res:
                payload = res.read()
            CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
            CACHE_PATH.write_bytes(payload)
            return json.loads(payload.decode("utf-8"))
        except Exception as error:  # noqa: BLE001
            last_error = error
            print(f"Failed: {error}")
    raise last_error


def main() -> None:
    geojson = load_geojson()
    features = geojson.get("features") or []
    print(f"Loaded {len(features)} country features")

    prepared = []
    for feature in features:
        props = feature.get("properties") or {}
        iso = read_iso(props)
        if not iso:
            continue
        geometry = feature.get("geometry")
        if not geometry:
            continue
        prepared.append(
            {
                "iso": iso,
                "name": read_name(props),
                "continent": read_continent(props),
                "geometry": geometry,
                "bbox": geometry_bbox(geometry),
            }
        )

    countries = {}
    pixels = []
    seen = set()
    counts = {}

    def add_pixel(lat: float, lon: float, iso: str, name: str, continent: str) -> None:
        key = f"{iso}:{lat:.3f}:{lon:.3f}"
        if key in seen:
            return
        seen.add(key)
        countries.setdefault(iso, {"name": name, "continent": continent})
        pixels.append([round(lat, 2), round(lon, 2), iso])
        counts[iso] = counts.get(iso, 0) + 1

    lat = -88.8
    while lat <= 88.8:
        lon = -180.0
        while lon < 180.0:
            sample_lat = lat + GRID_SIZE / 2
            sample_lon = lon + GRID_SIZE / 2
            match = None
            for country in prepared:
                if not in_bbox(sample_lon, sample_lat, country["bbox"]):
                    continue
                if not in_clip(country["iso"], sample_lon, sample_lat):
                    continue
                if geometry_contains(country["geometry"], sample_lon, sample_lat):
                    match = country
                    break
            if match:
                add_pixel(sample_lat, sample_lon, match["iso"], match["name"], match["continent"])
            lon += GRID_SIZE
        lat += GRID_SIZE

    for country in prepared:
        if counts.get(country["iso"], 0) > 0:
            continue
        clip = COUNTRY_CLIPS.get(country["iso"])
        point = centroid_of(country["geometry"])
        if clip:
            point = {
                "lat": (clip["minLat"] + clip["maxLat"]) / 2,
                "lon": (clip["minLon"] + clip["maxLon"]) / 2,
            }
        if not point:
            continue
        add_pixel(point["lat"], point["lon"], country["iso"], country["name"], country["continent"])

    for iso, name, continent, lat0, lon0 in FORCE_PIXELS:
        if counts.get(iso, 0) > 0:
            continue
        add_pixel(lat0, lon0, iso, name, continent)

    A2_TO_A3 = {v: k for k, v in ISO_A3_TO_A2.items()}
    country_list = []
    for iso, meta in sorted(countries.items()):
        iso3 = iso if len(iso) == 3 else A2_TO_A3.get(iso, iso)
        country_list.append([iso3, meta["name"], meta["continent"], iso])
    index_by_iso = {}
    for i, row in enumerate(country_list):
        index_by_iso[row[0]] = i
        if len(row) > 3:
            index_by_iso[row[3]] = i
    compact_pixels = [[lat, lon, index_by_iso[iso]] for lat, lon, iso in pixels]

    payload = json.dumps(
        {
            "version": 2,
            "gridSize": GRID_SIZE,
            "countries": country_list,
            "pixels": compact_pixels,
        },
        separators=(",", ":"),
    )
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(payload)
    js_path = OUT_PATH.with_suffix(".js")
    js_path.write_text(
        "window.GLOBAL_PRESENCE_PIXELS = "
        + payload
        + ";\nwindow.GLOBAL_LAND_PIXELS = window.GLOBAL_PRESENCE_PIXELS;\n"
    )
    print(f"Wrote {len(pixels)} land pixels, {len(country_list)} countries → {OUT_PATH}")
    print(f"Wrote inline dataset → {js_path}")


if __name__ == "__main__":
    main()
