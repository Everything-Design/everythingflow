#!/usr/bin/env python3
"""Parse the local CMS stand-in and confirm ISO-3 coverage."""

from __future__ import annotations

import json
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class CmsParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.regions: dict[str, dict] = {}
        self.countries: list[dict] = []

    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if "data-globe-region" in data:
            key = data["data-globe-region"].strip().lower()
            self.regions[key] = data
        if "data-globe-country" in data:
            self.countries.append(data)


def main() -> None:
    html = (ROOT / "index.html").read_text()
    parser = CmsParser()
    parser.feed(html)

    js = (ROOT / "data" / "land-pixels.js").read_text()
    match = re.search(r"GLOBAL_PRESENCE_PIXELS = (\{.*\});", js)
    if not match:
        raise SystemExit("land-pixels.js does not export GLOBAL_PRESENCE_PIXELS")
    geo = json.loads(match.group(1))
    iso3 = {row[0] for row in geo["countries"]}

    assert parser.regions, "No CMS regions found"
    assert parser.countries, "No CMS countries found"
    starts = [k for k, row in parser.regions.items() if row.get("data-start-region") == "true"]
    assert starts == ["asia"], starts

    missing = []
    for country in parser.countries:
        code = country["data-globe-country"].upper()
        if code not in iso3:
            missing.append(code)
    if missing:
        raise SystemExit(f"ISO codes missing from land-pixels: {missing}")

    print(
        f"OK {len(parser.regions)} regions, {len(parser.countries)} countries, "
        f"start={starts[0]}, land-pixels={len(geo['pixels'])}"
    )


if __name__ == "__main__":
    main()
