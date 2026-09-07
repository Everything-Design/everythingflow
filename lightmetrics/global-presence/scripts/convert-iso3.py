#!/usr/bin/env python3
"""Upgrade land-pixels.json / .js so countries are keyed by ISO Alpha-3."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "data" / "land-pixels.json"

A2_TO_A3 = {
    "AF": "AFG", "AO": "AGO", "AL": "ALB", "AE": "ARE", "AR": "ARG", "AM": "ARM",
    "AU": "AUS", "AT": "AUT", "AZ": "AZE", "BE": "BEL", "BJ": "BEN", "BF": "BFA",
    "BD": "BGD", "BG": "BGR", "BH": "BHR", "BA": "BIH", "BY": "BLR", "BZ": "BLZ",
    "BO": "BOL", "BR": "BRA", "BN": "BRN", "BT": "BTN", "BW": "BWA", "CF": "CAF",
    "CA": "CAN", "CH": "CHE", "CL": "CHL", "CN": "CHN", "CI": "CIV", "CM": "CMR",
    "CD": "COD", "CG": "COG", "CO": "COL", "CR": "CRI", "CU": "CUB", "CY": "CYP",
    "CZ": "CZE", "DE": "DEU", "DJ": "DJI", "DK": "DNK", "DO": "DOM", "DZ": "DZA",
    "EC": "ECU", "EG": "EGY", "ER": "ERI", "ES": "ESP", "EE": "EST", "ET": "ETH",
    "FI": "FIN", "FJ": "FJI", "FR": "FRA", "GA": "GAB", "GB": "GBR", "GE": "GEO",
    "GH": "GHA", "GN": "GIN", "GM": "GMB", "GW": "GNB", "GQ": "GNQ", "GR": "GRC",
    "GT": "GTM", "GY": "GUY", "HN": "HND", "HR": "HRV", "HT": "HTI", "HU": "HUN",
    "ID": "IDN", "IN": "IND", "IE": "IRL", "IR": "IRN", "IQ": "IRQ", "IS": "ISL",
    "IL": "ISR", "IT": "ITA", "JM": "JAM", "JO": "JOR", "JP": "JPN", "KZ": "KAZ",
    "KE": "KEN", "KG": "KGZ", "KH": "KHM", "KR": "KOR", "KW": "KWT", "LA": "LAO",
    "LB": "LBN", "LR": "LBR", "LY": "LBY", "LK": "LKA", "LS": "LSO", "LT": "LTU",
    "LU": "LUX", "LV": "LVA", "MA": "MAR", "MD": "MDA", "MG": "MDG", "MX": "MEX",
    "MK": "MKD", "ML": "MLI", "MT": "MLT", "MM": "MMR", "ME": "MNE", "MN": "MNG",
    "MZ": "MOZ", "MR": "MRT", "MW": "MWI", "MY": "MYS", "NA": "NAM", "NE": "NER",
    "NG": "NGA", "NI": "NIC", "NL": "NLD", "NO": "NOR", "NP": "NPL", "NZ": "NZL",
    "OM": "OMN", "PK": "PAK", "PA": "PAN", "PE": "PER", "PH": "PHL", "PG": "PNG",
    "PL": "POL", "PR": "PRI", "PT": "PRT", "PY": "PRY", "QA": "QAT", "RO": "ROU",
    "RU": "RUS", "RW": "RWA", "SA": "SAU", "SD": "SDN", "SN": "SEN", "SG": "SGP",
    "SV": "SLV", "SO": "SOM", "RS": "SRB", "SS": "SSD", "SK": "SVK", "SI": "SVN",
    "SE": "SWE", "SZ": "SWZ", "SY": "SYR", "TD": "TCD", "TG": "TGO", "TH": "THA",
    "TJ": "TJK", "TM": "TKM", "TL": "TLS", "TT": "TTO", "TN": "TUN", "TR": "TUR",
    "TW": "TWN", "TZ": "TZA", "UG": "UGA", "UA": "UKR", "UY": "URY", "US": "USA",
    "UZ": "UZB", "VE": "VEN", "VN": "VNM", "YE": "YEM", "ZA": "ZAF", "ZM": "ZMB",
    "ZW": "ZWE", "AD": "AND", "AW": "ABW", "HM": "HMD", "LI": "LIE", "MC": "MCO",
    "NF": "NFK", "PN": "PCN", "SL": "SLE", "SM": "SMR", "VA": "VAT", "KA": "KAS",
    "GL": "GRL", "XK": "XKX", "EH": "ESH", "PS": "PSE", "TW": "TWN",
    "HK": "HKG", "MO": "MAC", "NC": "NCL", "PF": "PYF", "TF": "ATF", "AQ": "ATA",
    "AX": "ALA", "FO": "FRO", "GI": "GIB", "GG": "GGY", "IM": "IMN", "JE": "JEY",
    "XK": "XKX", "SS": "SSD", "SX": "SXM", "CW": "CUW", "BQ": "BES", "MF": "MAF",
    "BL": "BLM", "PM": "SPM", "WF": "WLF", "VU": "VUT", "SB": "SLB", "TO": "TON",
    "WS": "WSM", "KI": "KIR", "TV": "TUV", "NR": "NRU", "PW": "PLW", "MH": "MHL",
    "FM": "FSM", "CK": "COK", "NU": "NIU", "TK": "TKL", "AS": "ASM", "GU": "GUM",
    "MP": "MNP", "VI": "VIR", "KY": "CYM", "BM": "BMU", "TC": "TCA", "VG": "VGB",
    "AI": "AIA", "MS": "MSR", "KN": "KNA", "AG": "ATG", "DM": "DMA", "LC": "LCA",
    "VC": "VCT", "BB": "BRB", "GD": "GRD", "BS": "BHS", "HT": "HTI", "SR": "SUR",
    "GF": "GUF", "FK": "FLK", "GS": "SGS", "SH": "SHN", "CV": "CPV", "ST": "STP",
    "GQ": "GNQ", "GA": "GAB", "CG": "COG", "CD": "COD", "BI": "BDI", "RW": "RWA",
    "UG": "UGA", "KE": "KEN", "TZ": "TZA", "MZ": "MOZ", "MW": "MWI", "ZM": "ZMB",
    "ZW": "ZWE", "BW": "BWA", "NA": "NAM", "SZ": "SWZ", "LS": "LSO", "ZA": "ZAF",
    "MG": "MDG", "MU": "MUS", "SC": "SYC", "KM": "COM", "YT": "MYT", "RE": "REU",
    "IO": "IOT", "MV": "MDV", "LK": "LKA", "NP": "NPL", "BT": "BTN", "BD": "BGD",
    "MM": "MMR", "TH": "THA", "LA": "LAO", "KH": "KHM", "VN": "VNM", "MY": "MYS",
    "SG": "SGP", "BN": "BRN", "ID": "IDN", "TL": "TLS", "PH": "PHL", "TW": "TWN",
    "KR": "KOR", "KP": "PRK", "MN": "MNG", "KZ": "KAZ", "UZ": "UZB", "TM": "TKM",
    "KG": "KGZ", "TJ": "TJK", "AF": "AFG", "PK": "PAK", "IR": "IRN", "IQ": "IRQ",
    "SY": "SYR", "LB": "LBN", "JO": "JOR", "IL": "ISR", "PS": "PSE", "SA": "SAU",
    "YE": "YEM", "OM": "OMN", "AE": "ARE", "QA": "QAT", "BH": "BHR", "KW": "KWT",
    "TR": "TUR", "CY": "CYP", "GE": "GEO", "AM": "ARM", "AZ": "AZE", "RU": "RUS",
}


def to_iso3(code: str) -> str:
    code = str(code or "").upper().strip()
    if len(code) == 3 and code.isalpha():
        return code
    return A2_TO_A3.get(code, "")


def main() -> None:
    data = json.loads(SRC.read_text())
    countries = []
    missing = []
    for row in data["countries"]:
        iso2, name, continent = row[0], row[1], row[2]
        iso3 = to_iso3(iso2)
        if not iso3:
            missing.append(iso2)
            iso3 = (iso2 + "X")[:3]
        countries.append([iso3, name, continent, iso2])
    data["version"] = 2
    data["countries"] = countries
    payload = json.dumps(data, separators=(",", ":"))
    SRC.write_text(payload)
    js_path = SRC.with_suffix(".js")
    js_path.write_text(
        "window.GLOBAL_PRESENCE_PIXELS = "
        + payload
        + ";\n"
        + "window.GLOBAL_LAND_PIXELS = window.GLOBAL_PRESENCE_PIXELS;\n"
    )
    print(f"Updated {len(countries)} countries, {len(data['pixels'])} pixels")
    if missing:
        print("Unmapped ISO-2:", ", ".join(sorted(set(missing))))


if __name__ == "__main__":
    main()
