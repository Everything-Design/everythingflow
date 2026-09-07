/**
 * Pixel-map globe for Webflow.
 * CMS data attributes decide WHAT is highlighted.
 * Static land-pixels decide WHERE countries are.
 * Three.js decides HOW the globe is rendered.
 */
(function (global) {
  "use strict";

  var DEG = Math.PI / 180;
  var RAD = 180 / Math.PI;
  var SVG_NS = "http://www.w3.org/2000/svg";

  var state = {
    initialized: false,
    visible: true,
    reduceMotion: false,
    raf: 0,
    lastTime: 0,
    activeRegion: null,
    transitioning: false,
    regionConfig: {},
    startRegion: null,
    iso3Set: null,
  };

  var refs = {
    section: null,
    container: null,
    canvas: null,
    svg: null,
    renderer: null,
    scene: null,
    camera: null,
    pivot: null,
    globe: null,
    mesh: null,
    resizeObserver: null,
    intersectionObserver: null,
    motionQuery: null,
  };

  var geo = {
    pixels: [],
    countries: [],
    regionIso: {},
    presenceIso: null,
    regionDirs: {},
    highlights: null,
    targets: null,
    presence: null,
  };

  var scratch = {
    dir: null,
    cameraDir: null,
    xAxis: null,
    yAxis: null,
    colorA: null,
    colorB: null,
    mixed: null,
    active: null,
  };

  function settings() {
    return global.GLOBAL_PRESENCE_SETTINGS || {};
  }

  function normalizeKey(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");
  }

  function normalizeIso3(value) {
    return String(value || "")
      .trim()
      .toUpperCase();
  }

  function parseNumber(value) {
    if (value == null || value === "") return NaN;
    return Number(String(value).replace(",", "."));
  }

  function parseBoolean(value) {
    var raw = String(value == null ? "" : value).trim().toLowerCase();
    return raw === "true" || raw === "1" || raw === "yes" || raw === "on";
  }

  function getCmsGlobeData(root) {
    var scope = root || document;
    var regions = {};
    var nodes = scope.querySelectorAll("[data-globe-region]");

    for (var i = 0; i < nodes.length; i += 1) {
      var el = nodes[i];
      var key = normalizeKey(el.getAttribute("data-globe-region"));
      if (!key) continue;
      if (regions[key]) {
        console.warn('[GlobalPresence] Duplicate Region Key "' + key + '".');
      }
      regions[key] = {
        key: key,
        name: (el.getAttribute("data-region-name") || key).trim(),
        center: {
          lat: parseNumber(el.getAttribute("data-center-lat")),
          lon: parseNumber(el.getAttribute("data-center-lon")),
        },
        sort: parseNumber(el.getAttribute("data-sort")),
        startRegion: parseBoolean(el.getAttribute("data-start-region")),
        highlightColor: (el.getAttribute("data-highlight-color") || "").trim(),
        countries: [],
      };
    }

    var countryNodes = scope.querySelectorAll("[data-globe-country]");
    for (var c = 0; c < countryNodes.length; c += 1) {
      var node = countryNodes[c];
      var iso3 = normalizeIso3(node.getAttribute("data-globe-country"));
      var regionKey = normalizeKey(node.getAttribute("data-region"));
      if (!regions[regionKey]) {
        regions[regionKey] = {
          key: regionKey,
          name: regionKey,
          center: { lat: NaN, lon: NaN },
          sort: Infinity,
          startRegion: false,
          highlightColor: "",
          countries: [],
          _unknownRegion: true,
        };
      }
      regions[regionKey].countries.push({
        iso3: iso3,
        name: (node.getAttribute("data-country-name") || iso3).trim(),
        sort: parseNumber(node.getAttribute("data-sort")),
      });
    }

    Object.keys(regions).forEach(function (key) {
      regions[key].countries.sort(function (a, b) {
        var as = isFinite(a.sort) ? a.sort : 0;
        var bs = isFinite(b.sort) ? b.sort : 0;
        return as - bs;
      });
    });

    return regions;
  }

  function collectIso3Set(data) {
    var set = new Set();
    var rows = (data && data.countries) || [];
    for (var i = 0; i < rows.length; i += 1) {
      var code = normalizeIso3(rows[i][0]);
      if (code) set.add(code);
    }
    return set;
  }

  function validateCmsData(regions, iso3Set) {
    var keys = Object.keys(regions);
    var seenIso = new Set();
    var startKeys = [];

    if (!keys.length) {
      console.warn("[GlobalPresence] No CMS regions found. Add .globe-region-data items.");
    }

    keys.forEach(function (key) {
      var region = regions[key];
      if (!key) {
        console.warn("[GlobalPresence] Missing Region Key on a continent item.");
      }
      if (region._unknownRegion) {
        console.warn('[GlobalPresence] Country references unknown region "' + key + '".');
      }
      if (!isFinite(region.center.lat) || region.center.lat < -90 || region.center.lat > 90) {
        console.warn('[GlobalPresence] Invalid latitude for region "' + key + '".');
      }
      if (!isFinite(region.center.lon) || region.center.lon < -180 || region.center.lon > 180) {
        console.warn('[GlobalPresence] Invalid longitude for region "' + key + '".');
      }
      if (!region.countries.length) {
        console.warn('[GlobalPresence] Region "' + key + '" contains zero countries.');
      }
      if (region.startRegion) startKeys.push(key);

      region.countries.forEach(function (country) {
        if (!country.iso3) {
          console.warn("[GlobalPresence] Missing ISO code for", country.name);
          return;
        }
        if (!/^[A-Z]{3}$/.test(country.iso3)) {
          console.warn(
            '[GlobalPresence] Unknown ISO code "' +
              country.iso3 +
              '". Expected ISO Alpha-3 such as "IND".'
          );
        }
        if (seenIso.has(country.iso3)) {
          console.warn('[GlobalPresence] Duplicate country ISO "' + country.iso3 + '".');
        }
        seenIso.add(country.iso3);
        if (iso3Set && iso3Set.size && !iso3Set.has(country.iso3)) {
          console.warn(
            '[GlobalPresence] ISO "' +
              country.iso3 +
              '" does not exist in land-pixels.js. It will not highlight.'
          );
        }
      });
    });

    if (startKeys.length > 1) {
      console.warn(
        "[GlobalPresence] Multiple Start Globe Here values:",
        startKeys.join(", "),
        ". Using the lowest Sort Order."
      );
    }
  }

  function findStartRegion(regions) {
    var keys = Object.keys(regions).filter(function (key) {
      return !regions[key]._unknownRegion;
    });
    keys.sort(function (a, b) {
      var as = isFinite(regions[a].sort) ? regions[a].sort : 9999;
      var bs = isFinite(regions[b].sort) ? regions[b].sort : 9999;
      return as - bs;
    });
    var flagged = keys.filter(function (key) {
      return regions[key].startRegion;
    });
    return flagged[0] || keys[0] || null;
  }

  function updateCounters(regions) {
    var regionCount = Object.keys(regions).filter(function (key) {
      return !regions[key]._unknownRegion;
    }).length;
    var iso = new Set();
    Object.keys(regions).forEach(function (key) {
      regions[key].countries.forEach(function (country) {
        if (/^[A-Z]{3}$/.test(country.iso3)) iso.add(country.iso3);
      });
    });
    var suffix = settings().countryCountSuffix == null ? "+" : settings().countryCountSuffix;
    var regionNodes = document.querySelectorAll("[data-region-count]");
    for (var i = 0; i < regionNodes.length; i += 1) regionNodes[i].textContent = String(regionCount);
    var countryNodes = document.querySelectorAll("[data-country-count]");
    for (var n = 0; n < countryNodes.length; n += 1) {
      countryNodes[n].textContent = iso.size ? iso.size + suffix : "0";
    }
  }

  function lonLatToVector(lat, lon, radius, target) {
    var phi = lat * DEG;
    var lam = lon * DEG;
    var clat = Math.cos(phi);
    target.set(radius * clat * Math.sin(lam), radius * Math.sin(phi), radius * clat * Math.cos(lam));
    return target;
  }

  function setupRegionData(regions) {
    var regionIso = {};
    var presenceIso = new Set();
    Object.keys(regions).forEach(function (id) {
      var isos = new Set();
      regions[id].countries.forEach(function (country) {
        if (/^[A-Z]{3}$/.test(country.iso3)) {
          isos.add(country.iso3);
          presenceIso.add(country.iso3);
        }
      });
      regionIso[id] = isos;
    });
    geo.regionIso = regionIso;
    geo.presenceIso = presenceIso;
  }

  function calculateRegionCenters(regions) {
    var dirs = {};
    Object.keys(regions).forEach(function (id) {
      var center = regions[id].center;
      if (!isFinite(center.lat) || !isFinite(center.lon)) return;
      dirs[id] = lonLatToVector(center.lat, center.lon, 1, new THREE.Vector3()).normalize();
    });
    geo.regionDirs = dirs;
  }

  function initialRotationY(regionId) {
    var region = state.regionConfig[regionId];
    var lon = region && isFinite(region.center.lon) ? region.center.lon : 79;
    return -lon * DEG;
  }

  function setInitialRegion(regionId, instant) {
    if (!regionId || !refs.globe) return;
    refs.globe.rotation.y = initialRotationY(regionId);
    setActiveRegion(regionId, instant !== false);
  }

  function scoreRegion(regionId) {
    var local = geo.regionDirs[regionId];
    if (!local) return -1;
    var dir = scratch.dir.copy(local);
    dir.applyAxisAngle(scratch.yAxis, refs.globe.rotation.y);
    dir.applyAxisAngle(scratch.xAxis, settings().tilt || 0);
    return dir.dot(scratch.cameraDir);
  }

  function detectCenteredRegion() {
    var threshold = settings().activeThreshold;
    var hysteresis = settings().hysteresis;
    var ids = Object.keys(geo.regionDirs);
    var bestId = null;
    var bestScore = -Infinity;

    for (var i = 0; i < ids.length; i += 1) {
      var score = scoreRegion(ids[i]);
      if (score > bestScore) {
        bestScore = score;
        bestId = ids[i];
      }
    }

    if (!bestId || bestScore < threshold) return;
    if (bestId === state.activeRegion) return;

    var currentScore = state.activeRegion ? scoreRegion(state.activeRegion) : -1;
    if (bestScore > currentScore + hysteresis || currentScore < threshold) {
      setActiveRegion(bestId, false);
    }
  }

  function setActiveRegion(regionId, instant) {
    if (!geo.regionIso[regionId]) return;
    var activeIsos = geo.regionIso[regionId];
    var targets = geo.targets;
    for (var i = 0; i < geo.pixels.length; i += 1) {
      targets[i] = activeIsos.has(geo.pixels[i].iso3) ? 1 : 0;
      if (instant) geo.highlights[i] = targets[i];
    }
    state.activeRegion = regionId;
    state.transitioning = !instant;
    writeInstanceColors();

    if (refs.container) {
      refs.container.dataset.activeRegion = regionId;
      refs.container.dispatchEvent(
        new CustomEvent("globalpresence:region", {
          detail: {
            id: regionId,
            label: state.regionConfig[regionId] ? state.regionConfig[regionId].name : regionId,
          },
        })
      );
    }
  }

  function activeColorForRegion(regionId) {
    var region = state.regionConfig[regionId];
    var fallback = (settings().colors && settings().colors.active) || "#A000A0";
    return region && region.highlightColor ? region.highlightColor : fallback;
  }

  function writeInstanceColors() {
    if (!refs.mesh || !geo.highlights) return;
    var colors = settings().colors || {};
    var inactive = scratch.colorA.set(colors.inactive || "#E4E4E4");
    var secondary = scratch.colorB.set(colors.secondary || "#B0B0B0");
    var active = scratch.active.set(activeColorForRegion(state.activeRegion));
    var mixed = scratch.mixed;
    var highlights = geo.highlights;
    var presence = geo.presence;
    for (var i = 0; i < highlights.length; i += 1) {
      mixed.copy(presence[i] > 0.5 ? secondary : inactive);
      mixed.lerp(active, highlights[i]);
      refs.mesh.setColorAt(i, mixed);
    }
    if (refs.mesh.instanceColor) refs.mesh.instanceColor.needsUpdate = true;
  }

  function updateHighlights(dt) {
    if (!state.transitioning || !geo.highlights) return;
    var step = dt / Math.max(0.05, settings().transitionDuration || 0.72);
    var dirty = false;
    var done = true;
    for (var i = 0; i < geo.highlights.length; i += 1) {
      var current = geo.highlights[i];
      var target = geo.targets[i];
      if (current === target) continue;
      dirty = true;
      var next = current < target ? Math.min(target, current + step) : Math.max(target, current - step);
      geo.highlights[i] = next;
      if (next !== target) done = false;
    }
    if (dirty) writeInstanceColors();
    if (done) state.transitioning = false;
  }

  function createTickRing(svg) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var count = settings().tickCount || 144;
    var cx = 50;
    var cy = 50;
    var inner = 46.15;
    var outer = 48.2;
    var majorOuter = 49.55;

    for (var i = 0; i < count; i += 1) {
      var isMajor = i === 0;
      var angle = -Math.PI / 2 + (i / count) * Math.PI * 2;
      var r1 = isMajor ? majorOuter : outer;
      var line = document.createElementNS(SVG_NS, "line");
      line.setAttribute("x1", (cx + inner * Math.cos(angle)).toFixed(3));
      line.setAttribute("y1", (cy + inner * Math.sin(angle)).toFixed(3));
      line.setAttribute("x2", (cx + r1 * Math.cos(angle)).toFixed(3));
      line.setAttribute("y2", (cy + r1 * Math.sin(angle)).toFixed(3));
      line.setAttribute("stroke", isMajor ? "#111111" : "#2c2c2c");
      line.setAttribute("stroke-width", isMajor ? "0.36" : "0.145");
      line.setAttribute("stroke-linecap", "round");
      svg.appendChild(line);
    }
  }

  function createMapMaterial() {
    return new THREE.MeshBasicMaterial({
      color: 0xffffff,
      toneMapped: false,
      side: THREE.FrontSide,
      depthTest: true,
      depthWrite: true,
    });
  }

  function createMapInstances(data) {
    var c = settings();
    var countries = data.countries;
    var rawPixels = data.pixels;
    var count = rawPixels.length;
    var radius = c.globeRadius;
    var pixelSize = c.pixelSize || radius * ((data.gridSize || c.geoGridSize) * DEG) * 0.68;

    geo.countries = countries;
    geo.pixels = new Array(count);
    geo.highlights = new Float32Array(count);
    geo.targets = new Float32Array(count);
    geo.presence = new Float32Array(count);

    var geometry = new THREE.PlaneGeometry(1, 1);
    var material = createMapMaterial();
    var mesh = new THREE.InstancedMesh(geometry, material, count);
    mesh.frustumCulled = false;
    mesh.matrixAutoUpdate = false;

    var pos = new THREE.Vector3();
    var normal = new THREE.Vector3();
    var east = new THREE.Vector3();
    var north = new THREE.Vector3();
    var scale = new THREE.Vector3();
    var matrix = new THREE.Matrix4();

    for (var i = 0; i < count; i += 1) {
      var lat = rawPixels[i][0];
      var lon = rawPixels[i][1];
      var country = countries[rawPixels[i][2]];
      var iso3 = normalizeIso3(country[0]);
      geo.pixels[i] = {
        lat: lat,
        lon: lon,
        iso3: iso3,
        name: country[1],
        continent: country[2],
      };
      geo.presence[i] = geo.presenceIso.has(iso3) ? 1 : 0;

      var phi = lat * DEG;
      var lam = lon * DEG;
      var clat = Math.cos(phi);
      var slat = Math.sin(phi);
      lonLatToVector(lat, lon, radius, pos);
      normal.copy(pos).normalize();
      east.set(Math.cos(lam), 0, -Math.sin(lam));
      north.set(-slat * Math.sin(lam), clat, -slat * Math.cos(lam));
      if (east.lengthSq() < 1e-8 || north.lengthSq() < 1e-8) {
        east.set(1, 0, 0);
        north.crossVectors(normal, east).normalize();
        east.crossVectors(north, normal);
      }
      east.normalize();
      north.normalize();
      matrix.makeBasis(east, north, normal);
      matrix.scale(scale.set(pixelSize * Math.max(0.28, Math.abs(clat)), pixelSize, 1));
      matrix.setPosition(pos);
      mesh.setMatrixAt(i, matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
    refs.mesh = mesh;
    refs.globe.add(mesh);
  }

  function buildPixelMap(data, regions) {
    setupRegionData(regions);
    calculateRegionCenters(regions);
    createMapInstances(data);
  }

  async function loadGeography() {
    if (global.GLOBAL_PRESENCE_PIXELS && global.GLOBAL_PRESENCE_PIXELS.pixels) {
      return global.GLOBAL_PRESENCE_PIXELS;
    }
    if (global.GLOBAL_LAND_PIXELS && global.GLOBAL_LAND_PIXELS.pixels) {
      return global.GLOBAL_LAND_PIXELS;
    }
    throw new Error("Missing land-pixels.js. Host GLOBAL_PRESENCE_PIXELS before init().");
  }

  function resize() {
    if (!refs.renderer || !refs.container) return;
    var rect = refs.container.getBoundingClientRect();
    var width = Math.max(1, Math.round(rect.width));
    var height = Math.max(1, Math.round(rect.height));
    refs.renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, settings().maxPixelRatio || 2));
    refs.renderer.setSize(width, height, false);

    var view = settings().cameraZoom;
    var aspect = width / height;
    refs.camera.left = (-view * aspect) / 2;
    refs.camera.right = (view * aspect) / 2;
    refs.camera.top = view / 2;
    refs.camera.bottom = -view / 2;
    refs.camera.updateProjectionMatrix();

    if (!state.visible || state.reduceMotion) renderFrame();
  }

  function renderFrame() {
    if (!refs.renderer) return;
    refs.renderer.render(refs.scene, refs.camera);
  }

  function animate(time) {
    state.raf = 0;
    if (!state.visible || !refs.renderer) return;

    var now = time * 0.001;
    var dt = state.lastTime ? Math.min(0.05, now - state.lastTime) : 0;
    state.lastTime = now;

    if (!state.reduceMotion && refs.globe) {
      refs.globe.rotation.y += Math.abs(settings().rotationSpeed) * dt;
      detectCenteredRegion();
    }

    updateHighlights(dt);
    renderFrame();

    if (state.visible && !state.reduceMotion) {
      state.raf = requestAnimationFrame(animate);
    }
  }

  function startLoop() {
    if (state.raf) return;
    state.lastTime = 0;
    if (state.reduceMotion) {
      renderFrame();
      return;
    }
    state.raf = requestAnimationFrame(animate);
  }

  function stopLoop() {
    if (state.raf) cancelAnimationFrame(state.raf);
    state.raf = 0;
    state.lastTime = 0;
  }

  function onVisibility(entries) {
    var entry = entries[0];
    state.visible = !!(entry && entry.isIntersecting);
    if (state.visible) startLoop();
    else stopLoop();
  }

  function onMotionChange(event) {
    state.reduceMotion = event.matches;
    if (state.reduceMotion) {
      setInitialRegion(state.startRegion, true);
      stopLoop();
      renderFrame();
    } else if (state.visible) {
      startLoop();
    }
  }

  function initScene() {
    var c = settings();
    refs.scene = new THREE.Scene();
    refs.scene.background = null;

    var view = c.cameraZoom;
    refs.camera = new THREE.OrthographicCamera(-view / 2, view / 2, view / 2, -view / 2, 0.1, 20);
    refs.camera.position.set(0, 0, 8);
    refs.camera.lookAt(0, 0, 0);

    refs.renderer = new THREE.WebGLRenderer({
      canvas: refs.canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    refs.renderer.setClearColor(0x000000, 0);
    refs.renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, c.maxPixelRatio || 2));
    if (THREE.SRGBColorSpace) refs.renderer.outputColorSpace = THREE.SRGBColorSpace;

    refs.pivot = new THREE.Group();
    refs.pivot.rotation.x = c.tilt || 0;
    refs.globe = new THREE.Group();
    refs.pivot.add(refs.globe);
    refs.scene.add(refs.pivot);

    scratch.dir = new THREE.Vector3();
    scratch.cameraDir = new THREE.Vector3(0, 0, 1);
    scratch.xAxis = new THREE.Vector3(1, 0, 0);
    scratch.yAxis = new THREE.Vector3(0, 1, 0);
    scratch.colorA = new THREE.Color();
    scratch.colorB = new THREE.Color();
    scratch.mixed = new THREE.Color();
    scratch.active = new THREE.Color();
  }

  function bindObservers() {
    refs.resizeObserver = new ResizeObserver(resize);
    refs.resizeObserver.observe(refs.container);

    refs.intersectionObserver = new IntersectionObserver(onVisibility, {
      root: null,
      threshold: 0.05,
    });
    refs.intersectionObserver.observe(refs.section || refs.container);

    refs.motionQuery = global.matchMedia("(prefers-reduced-motion: reduce)");
    state.reduceMotion = refs.motionQuery.matches;
    if (refs.motionQuery.addEventListener) {
      refs.motionQuery.addEventListener("change", onMotionChange);
    } else if (refs.motionQuery.addListener) {
      refs.motionQuery.addListener(onMotionChange);
    }

    global.addEventListener("orientationchange", resize);
    global.addEventListener("resize", resize);
    if (global.visualViewport) global.visualViewport.addEventListener("resize", resize);
  }

  async function initGlobe(options) {
    try {
      if (!global.THREE) {
        throw new Error("THREE is not available. Load three.min.js first.");
      }
      if (state.initialized) destroy();

      options = options || {};
      refs.section = document.querySelector(options.section || ".global-presence");
      refs.container = document.querySelector(options.container || "#global-globe");
      if (!refs.container) throw new Error("#global-globe was not found.");

      refs.canvas = refs.container.querySelector(".global-globe_canvas") || document.createElement("canvas");
      refs.canvas.classList.add("global-globe_canvas");
      if (!refs.canvas.parentNode) refs.container.appendChild(refs.canvas);

      refs.svg = refs.container.querySelector(".global-globe_ring") || document.createElementNS(SVG_NS, "svg");
      refs.svg.classList.add("global-globe_ring");
      refs.svg.setAttribute("viewBox", "0 0 100 100");
      refs.svg.setAttribute("aria-hidden", "true");
      if (!refs.svg.parentNode) refs.container.appendChild(refs.svg);

      var data = await loadGeography();
      state.iso3Set = collectIso3Set(data);
      state.regionConfig = getCmsGlobeData(refs.section || document);
      validateCmsData(state.regionConfig, state.iso3Set);
      state.startRegion = findStartRegion(state.regionConfig);
      updateCounters(state.regionConfig);

      initScene();
      createTickRing(refs.svg);
      buildPixelMap(data, state.regionConfig);
      setInitialRegion(state.startRegion, true);
      bindObservers();
      resize();
      renderFrame();

      state.initialized = true;
      state.visible = true;
      refs.container.classList.add("is-ready");
      startLoop();

      return {
        destroy: destroy,
        setActiveRegion: function (id) {
          setActiveRegion(normalizeKey(id), false);
        },
        getActiveRegion: function () {
          return state.activeRegion;
        },
        getRegionConfig: function () {
          return state.regionConfig;
        },
      };
    } catch (error) {
      console.error("[GlobalPresence]", error);
      var status = document.querySelector(".global-globe_status");
      if (status) {
        status.hidden = false;
        status.textContent = "The globe could not start. Check the browser console.";
      }
      throw error;
    }
  }

  function destroy() {
    stopLoop();
    if (refs.resizeObserver) refs.resizeObserver.disconnect();
    if (refs.intersectionObserver) refs.intersectionObserver.disconnect();
    if (refs.motionQuery) {
      if (refs.motionQuery.removeEventListener) refs.motionQuery.removeEventListener("change", onMotionChange);
      else if (refs.motionQuery.removeListener) refs.motionQuery.removeListener(onMotionChange);
    }
    global.removeEventListener("orientationchange", resize);
    global.removeEventListener("resize", resize);
    if (global.visualViewport) global.visualViewport.removeEventListener("resize", resize);
    if (refs.mesh) {
      refs.mesh.geometry.dispose();
      refs.mesh.material.dispose();
    }
    if (refs.renderer) refs.renderer.dispose();
    if (refs.container) refs.container.classList.remove("is-ready");
    state.initialized = false;
    refs.renderer = null;
    refs.scene = null;
    refs.mesh = null;
    refs.globe = null;
  }

  global.GlobalPresence = {
    init: initGlobe,
    destroy: destroy,
    getCmsGlobeData: getCmsGlobeData,
    validateCmsData: validateCmsData,
  };
})(window);
