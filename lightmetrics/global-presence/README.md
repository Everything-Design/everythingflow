# Global Presence Globe

A production pixel-map globe for Webflow. Land is rendered as tiny square WebGL cells. Webflow CMS decides which regions and countries highlight. Static geography decides where every country sits. Three.js only renders.

```
WEBFLOW CMS  →  hidden Collection Lists  →  data-* attributes
     →  JavaScript builds REGION_CONFIG
     →  Three.js highlights those ISO Alpha-3 pixels
```

- **CMS** = what should be highlighted
- **land-pixels.js** = where every country exists
- **Three.js** = how the globe is rendered

Do not hard-code country lists or continent counts in JavaScript. Adding a country or region in CMS is enough.

## 1. Current architecture

1. Hidden `.globe-cms-data` lists expose Continents and Countries as `data-*` attributes.
2. `getCmsGlobeData()` reads those attributes and builds a dynamic region map.
3. `validateCmsData()` warns on bad CMS rows without crashing the globe.
4. `data/land-pixels.js` stores the entire world as compact cells: `[iso3, name, continent, iso2]` plus `[lat, lon, countryIndex]`.
5. `js/config.js` holds visual/technical settings only.
6. `js/global-presence.js` creates one `InstancedMesh`, rotates the globe, picks the single closest CMS region, and interpolates pixel colours.

Matching is ISO-3166 Alpha-3 only (`IND`, `USA`, `GBR`). Country names are display labels.

## 2. What changed

The localhost globe look is preserved: pixel land, slow clockwise rotation, light grey default, purple selected countries, stationary SVG tick ring, responsive sizing, backside cull, viewport pause, reduced motion.

The content layer changed:

- Region and country arrays were removed from `config.js`
- Europe/Africa and Americas pairing was removed — only one region is active
- `data-active-region` is now a single Region Key
- Counters are written from CMS
- The initial facing region comes from **Start Globe Here**
- Geography is keyed by ISO-3 so a new CMS country such as `KOR` highlights without a JS edit

## 3. Webflow CMS schema

### Collection: Continents

| Field | Type | Example | Notes |
| --- | --- | --- | --- |
| Name | Default Name | Asia | Visible label |
| Region Key | Plain text | `asia` | Machine id. Use this in JS and country references |
| Center Latitude | Number | `21` | Approximate region centre |
| Center Longitude | Number | `79` | Approximate region centre |
| Sort Order | Number | `1` | Lower first |
| Enable on Globe | Switch | on | Collection List filter |
| Start Globe Here | Switch | on for one region | Initial camera-facing region |
| Highlight Color | Color or plain text | `#A000A0` | Optional. Empty uses the global purple |

Region Key examples: `asia`, `europe`, `africa`, `north-america`, `south-america`, `oceania`.

### Collection: Countries

| Field | Type | Example |
| --- | --- | --- |
| Name | Default Name | India |
| ISO Alpha-3 | Plain text | `IND` |
| Continent | Reference → Continents | Asia |
| Enable on Globe | Switch | on |
| Sort Order | Number | `1` |

Do not add GCC or EU as countries. Add `SAU`, `ARE`, `QAT`, `KWT`, `BHR`, `OMN` individually. A later **Country Groups** collection can cover GCC / EU / ASEAN if needed.

## 4. Webflow Designer hierarchy

```
Section.global-presence
  Div.global-presence_layout
    Div.global-presence_stat
      Div.global-presence_number  [data-region-count]
      Div.global-presence_label   “CONTINENTS”
    Div#global-globe.global-globe
      Canvas.global-globe_canvas
      HTML Embed → SVG.global-globe_ring  viewBox="0 0 100 100"
      Div.global-globe_status  (hidden)
    Div.global-presence_stat
      Div.global-presence_number  [data-country-count]
      Div.global-presence_label   “COUNTRIES”
  Div.globe-cms-data
    Collection List  (Continents, Enable on Globe = true)
      Collection Item
        Div.globe-region-data  + attributes
    Collection List  (Countries, Enable on Globe = true)
      Collection Item
        Div.globe-country-data  + attributes
```

Do not put `<html>`, `<head>`, or `<body>` inside a Webflow Embed.

Ready-to-paste markup: `webflow/section.html`.

## 5. Custom attributes

### Continents item (`.globe-region-data`)

| Attribute | Bind to |
| --- | --- |
| `data-globe-region` | Region Key |
| `data-region-name` | Name |
| `data-center-lat` | Center Latitude |
| `data-center-lon` | Center Longitude |
| `data-sort` | Sort Order |
| `data-start-region` | Start Globe Here |
| `data-highlight-color` | Highlight Color |

### Countries item (`.globe-country-data`)

| Attribute | Bind to |
| --- | --- |
| `data-globe-country` | ISO Alpha-3 |
| `data-country-name` | Name |
| `data-region` | Continent → Region Key |
| `data-sort` | Sort Order |

`data-region` must be the referenced continent’s **Region Key**, not its Name.

## 6–8. Source files

| File | Role |
| --- | --- |
| `js/config.js` | Visual settings only (`GLOBAL_PRESENCE_SETTINGS`) |
| `js/global-presence.js` | CMS bridge + Three.js renderer |
| `data/land-pixels.js` | Entire-world pixels, ISO-3 |
| `css/global-presence.css` | Layout, ring, counters, hidden CMS |
| `webflow/` | Production snippets |

`config.js` must not contain country arrays, continent arrays, or region centres.

## 9. Local CMS test

`index.html` simulates published Webflow Collection Lists with the seed continents and countries.

```bash
python3 -m http.server 4173
```

Open [http://localhost:4173](http://localhost:4173) and hard-refresh after JS/CSS changes.

The hidden `.globe-cms-data` block is the only place those lists live locally. Edit or remove a `data-globe-country` node to test CMS add/disable without touching JavaScript.

## 10. Production markup

See `webflow/section.html`. Counters start as fallbacks (`6`, `45+`) and are overwritten on init.

## 11. Production CSS

Paste `css/global-presence.css` into **Site settings → Custom code → Head**, a site-wide stylesheet, or the page custom code. If the site already sets `html`/`body` fonts, keep only the `.global-presence*` rules.

Required rules:

```css
.globe-cms-data { display: none; }

.global-globe { position: relative; aspect-ratio: 1; }

.global-globe_canvas,
.global-globe_ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.global-globe_canvas { z-index: 1; }
.global-globe_ring { z-index: 2; pointer-events: none; }
```

Give parent wrappers a white background and do not clip overflow on ancestors of `#global-globe`.

## 12. Production scripts

Page Settings → Custom Code → Before `</body>` (or Site Footer if site-wide):

```html
<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/YOUR-USER/YOUR-REPO@main/dist/config.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/YOUR-USER/YOUR-REPO@main/dist/land-pixels.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/YOUR-USER/YOUR-REPO@main/dist/global-presence.min.js"></script>
<script>
  window.GlobalPresence.init().catch(function (error) {
    console.error("[GlobalPresence]", error);
  });
</script>
```

Use Three r160 UMD. Later Three builds removed `three.min.js`.

## 13. GitHub + jsDelivr

1. Push this repo to GitHub.
2. Replace `YOUR-USER/YOUR-REPO` in the script URLs.
3. jsDelivr serves:

```
https://cdn.jsdelivr.net/gh/USER/REPO@version/dist/config.min.js
https://cdn.jsdelivr.net/gh/USER/REPO@version/dist/land-pixels.min.js
https://cdn.jsdelivr.net/gh/USER/REPO@version/dist/global-presence.min.js
```

Pin a tag (`@v1.0.0`) after the first release so Webflow does not pick up half-finished commits.

Recommended layout for hosting:

```
src/config.js
src/global-presence.js
data/land-pixels.js
dist/config.min.js
dist/global-presence.min.js
dist/land-pixels.min.js
```

Build minified copies:

```bash
npm run dist
```

## 14. Exact Webflow setup

1. Create the Continents and Countries collections from the schema above.
2. Enter the seed rows (section 35 / below). One continent has **Start Globe Here** on.
3. Build the Designer hierarchy. Hide `.globe-cms-data` with CSS, not by deleting it.
4. Bind Collection List attributes exactly as in section 5.
5. Filter both lists: Enable on Globe = true.
6. Add the canvas and SVG ring inside `#global-globe`. Ticks are generated by JS.
7. Paste CSS in Head.
8. Paste scripts before `</body>`.
9. Publish and confirm `#global-globe` receives `is-ready` and `data-active-region="asia"`.

## 15. Add a continent

1. CMS → Continents → New
2. Name, Region Key (`middle-east`), Center Lat/Lon (`27`, `45`), Sort Order, Enable on Globe = on
3. Add or retarget countries to that continent
4. Publish

No JavaScript change. The new key joins centre-detection automatically. `[data-region-count]` increments.

## 16. Add a country

1. CMS → Countries → New
2. Name: South Korea
3. ISO Alpha-3: `KOR`
4. Continent: Asia
5. Enable on Globe: on
6. Publish

`KOR` already exists in `land-pixels.js`. Asia’s highlight set includes it the next time Asia is active.

## 17. Disable a country

Turn **Enable on Globe** off (or delete the item) and publish. The Collection List no longer outputs that ISO, so the country stays grey.

## 18. Change the initial region

Turn **Start Globe Here** on for one continent and off for the others. If several are on, the lowest Sort Order wins and the console warns.

## 19. Debugging checklist

| Symptom | Check |
| --- | --- |
| Globe missing | Three r160 loaded first; console for `[GlobalPresence]` |
| Always grey | ISO is exactly 3 letters (`IND` not `IN` or `India`) |
| Wrong countries | `data-region` is Region Key, not “Asia” |
| Never becomes ready | CMS lists inside `.global-presence`; `land-pixels.js` loaded |
| Two regions in `data-active-region` | Old JS still cached — hard refresh |
| Starts on the wrong continent | Only one Start Globe Here; Sort Order is numeric |
| Country never highlights | ISO exists in land-pixels; Enable on Globe is on |
| Invalid CMS row | Console warning; globe should still run |
| Empty region | Warning: region contains zero countries |
| Status message shown | Init threw; `.global-globe_status` is populated |

Useful console:

```js
GlobalPresence.getCmsGlobeData()
document.querySelector("#global-globe").dataset.activeRegion
```

## 20. Performance checklist

- One `InstancedMesh` for all land cells — never one mesh per pixel
- No GeoJSON or point-in-polygon during animation
- Pixel positions computed once at init
- Region change only updates `instanceColor`
- `ResizeObserver` on `#global-globe`
- `IntersectionObserver` pauses the RAF loop off-screen
- Pixel ratio capped at 2
- Back faces culled (`FrontSide`)
- Reduced motion disables continuous rotation
- After resume, delta time is clamped so the globe does not jump

## Seed CMS data

Use these as the first CMS rows only. They are not hard-coded in the renderer.

| Continent | Region Key | Lat | Lon | Sort | Start |
| --- | --- | --- | --- | --- | --- |
| Asia | `asia` | 21 | 79 | 1 | yes |
| Europe | `europe` | 48 | 8 | 2 | |
| Africa | `africa` | 1 | 24 | 3 | |
| North America | `north-america` | 39 | -96 | 4 | |
| South America | `south-america` | -18 | -60 | 5 | |
| Oceania | `oceania` | -24 | 138 | 6 | |

Countries (ISO-3):

- Asia: KAZ MNG CHN JPN IND THA MYS SGP IDN SAU ARE QAT KWT BHR OMN
- Europe: NOR SWE DNK NLD BEL IRL GBR FRA ESP ITA
- Africa: COD UGA TZA ZMB MDG ZWE BWA NAM
- North America: CAN USA MEX PAN PRI TTO
- South America: COL ECU PER BRA CHL ARG
- Oceania: PNG AUS NZL

## Visual settings

All of these live in `js/config.js` / `GLOBAL_PRESENCE_SETTINGS`.

| What | Key |
| --- | --- |
| Rotation speed | `rotationPeriod` / `rotationSpeed` (~52s/turn) |
| Purple | `colors.active` |
| Default land grey | `colors.inactive` |
| Presence grey | `colors.secondary` |
| Globe size in frame | `cameraZoom` |
| Cell size | `pixelSize` |
| Active-region cutoff | `activeThreshold` |
| Flicker control | `hysteresis` |
| Highlight fade | `transitionDuration` |
| Max pixel ratio | `maxPixelRatio` |

## Regenerating geography

Only needed if you change grid density. Do not rebuild to add a CMS country.

```bash
python3 scripts/preprocess-geography.py
```

`GRID_SIZE` (default `1.2`) controls density. Tiny states are force-inserted. France, Norway, the UK, the US, and a few others are clipped to primary territory.

## Runtime API

```js
const globe = await window.GlobalPresence.init();

globe.getActiveRegion();
globe.getRegionConfig();
globe.setActiveRegion("europe");
globe.destroy();
```

```js
document.getElementById("global-globe").addEventListener("globalpresence:region", (event) => {
  console.log(event.detail.id, event.detail.label);
});
```

## Tests

1. Asia Start Globe Here → globe opens facing Asia.
2. India enabled → India purple when Asia is active.
3. Remove/disable India in the CMS block → India stays grey.
4. Add `KOR` / South Korea in the CMS block → highlights with Asia.
5. Remove `KOR` → stops highlighting.
6. Add a `.globe-region-data` region → it joins centre detection.
7. Change a region `data-center-lon` → activation position moves.
8. Add `data-globe-country="INDIA"` → console warning, globe still works.
9. Resize desktop → tablet → mobile → 1:1 globe.
10. Scroll the section away → animation pauses.
11. Return → animation resumes without a jump.
12. `prefers-reduced-motion: reduce` → static starting region.
13. Region with zero countries → warning, no crash.
14. Two `data-start-region="true"` → lowest Sort Order, warning.
