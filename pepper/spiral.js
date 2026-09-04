(function () {
  "use strict";

  /* ─── Spiral + YOU scene (mounts on .u-image-svgcircle) ─── */
  var RING_STROKE = "#FFFDFA";
  var DESIGN_R_MAX = 780;
  var BASE_RINGS = [36, 54, 70, 90, 110, 130, 154, 178, 202, 230, 262, 304, 368, 452, 542, 646, 780];
  var SHAPES = [
    { r: 230, theta: 0.259395, size: 25.2248, rx: 3, rot: -72.0747, fill: "#DEDDD3" },
    { r: 304, theta: 2.965794, size: 26.1283, rx: 4.1255, rot: -15.0021, fill: "#DEDDD3" },
    { r: 262, theta: 1.572708, size: 16, rx: 3.5556, rot: 0, fill: "#DEDDD3" },
    { r: 646, theta: -0.611191, size: 64, rx: 8.7273, rot: 5.0028, fill: "#D1B5FF" },
    { r: 646, theta: 2.561445, size: 43.7565, rx: 4.6882, rot: 46.961, fill: "#EAE5A4" },
    { r: 452, theta: 2.947032, size: 32, rx: 3.6923, rot: 33.942, fill: "#DEDDD3" },
    { r: 452, theta: -0.073406, size: 34.4664, rx: 3.9769, rot: -3.1247, fill: "#EAE5A4" },
    { r: 154, theta: 2.265535, size: 16, rx: 3.5556, rot: 0, fill: "#DEDDD3" },
    { r: 154, theta: -0.026995, size: 16, rx: 3.5556, rot: 26.6868, fill: "#DEDDD3" },
    { r: 542, theta: -3.02419, size: 29.494, rx: 4.657, rot: 19.0466, fill: "#D1B5FF" },
    { r: 542, theta: -2.243748, size: 54.5027, rx: 4.657, rot: 52.5409, fill: "#FFDCCB" },
    { r: 646, theta: 0.341188, size: 54.5027, rx: 4.657, rot: 56.0634, fill: "#DEDDD3" },
    { r: 452, theta: -1.577173, size: 29.494, rx: 4.657, rot: 60, fill: "#DEDDD3" },
    { r: 780, theta: -2.664885, size: 54.1114, rx: 4.0584, rot: 26.5651, fill: "#DEDDD3" },
    { r: 452, theta: 1.203555, size: 24, rx: 3, rot: -18.4349, fill: "#FFDCCB" },
    { r: 304, theta: -1.588623, size: 24, rx: 4.8, rot: 0, fill: "#D8E5C6" },
    { r: 36, theta: 2.440442, size: 16, rx: 3.5556, rot: 39.5265, fill: "#DEDDD3" },
    { r: 90, theta: 1.360127, size: 16, rx: 3.5556, rot: -45.7538, fill: "#DEDDD3" },
    { r: 780, theta: 1.596867, size: 64, rx: 8.7273, rot: 5.0028, fill: "#DEDDD3" },
    { r: 178, theta: -1.576946, size: 13, rx: 3, rot: -30.4755, fill: "#DEDDD3" },
    { r: 368, theta: 1.772106, size: 26.1283, rx: 4.1255, rot: 19.0466, fill: "#DEDDD3" },
    { r: 542, theta: 1.076926, size: 40.4093, rx: 4.0409, rot: -33.1354, fill: "#D8E5C6" }
  ];

  var ORANGE = [255, 74, 26];
  var YOU_PILL_BG = [45, 28, 22];
  var YOU_R = 304;
  var YOU_THETA = -0.85;
  var YOU_DOT = 18;
  var YOU_ELBOW_UP = 56;
  var YOU_ELBOW_RIGHT = 72;
  var YOU_PILL_W = 64;
  var YOU_PILL_H = 28;
  var YOU_BORDERS = [28, 42, 56];

  var CHARGE_TIME = 2.4;
  var HOLD_ZOOM_MIN = 0.58;
  var RIPPLE_DURATION = 1.8;
  var RIPPLE_WIDTH = 0.85;
  var RIPPLE_PUSH = 28;
  var RIPPLE_SCALE = 0.35;
  var EXTRA_SPACING = 95;
  var LOOP_RIPPLE_EVERY = 2.0;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smoothstep(e0, e1, x) {
    if (e0 === e1) return x < e0 ? 0 : 1;
    var t = clamp((x - e0) / (e1 - e0), 0, 1);
    return t * t * (3 - 2 * t);
  }
  function hexRgb(hex) {
    var n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function lum(c) {
    var y = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    return [y, y, y];
  }
  function mix3(a, b, t) {
    return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  }
  function rgba(c, a) {
    return "rgba(" + Math.round(c[0]) + "," + Math.round(c[1]) + "," + Math.round(c[2]) + "," + a + ")";
  }
  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w * 0.5, h * 0.5);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  SHAPES.forEach(function (s) {
    s.rgb = hexRgb(s.fill);
  });

  function createScene(host, imgEl) {
    var cs = getComputedStyle(host);
    if (cs.position === "static") host.style.position = "relative";
    if (imgEl) {
      imgEl.style.opacity = "0";
      imgEl.style.pointerEvents = "none";
    }

    var canvas = document.createElement("canvas");
    Object.assign(canvas.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      display: "block",
      zIndex: "1",
      cursor: "pointer",
      pointerEvents: "auto"
    });
    host.appendChild(canvas);
    var ctx = canvas.getContext("2d", { alpha: true });

    var dpr = 1, W = 1, H = 1, cx = 0, cy = 0, baseScale = 1, coverR = DESIGN_R_MAX;
    var reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    var visible = true, inView = true, motion = !reduceMq.matches;
    var time = 0, last = performance.now(), raf = 0;

    var holding = false, charged = false;
    var charge = 0;
    var zoomSmooth = 0;
    var ripples = [];
    var pings = [];
    var loopRipple = false;
    var nextLoopAt = 0;

    var rings = [];
    var ringSpeed = [];
    var ringSpin = [];
    var ringSpinT = [];

    var linesAmt = 1;
    var shapesAmt = 1;
    var greyAmt = 0;
    var orangeWash = 0;
    var youForm = 0;
    var youBorders = 0;
    var youGrey = 0;
    var youOrange = 1;
    var seekR = DESIGN_R_MAX;
    var interactive = false;
    var scriptHold = false;
    var tweens = [];

    function rebuildRings(zoom) {
      var currentScale = baseScale * lerp(1, HOLD_ZOOM_MIN, zoom);
      var needR = coverR / currentScale + EXTRA_SPACING;
      var list = BASE_RINGS.slice();
      var lastR = list[list.length - 1];
      var i = 0;
      while (lastR < needR) {
        lastR += EXTRA_SPACING * (1 + (i % 3) * 0.15);
        list.push(lastR);
        i++;
      }
      var prevN = rings.length;
      rings = list;
      var n = rings.length;
      var ns = new Array(n);
      var sp = new Float32Array(n);
      var spt = new Float32Array(n);
      for (var k = 0; k < n; k++) {
        var t = Math.min(1, rings[k] / Math.max(needR, DESIGN_R_MAX));
        ns[k] = (k % 2 === 0 ? 1 : -1) * (0.006 + (1 - t) * 0.018);
        if (k < prevN) {
          sp[k] = ringSpin[k] || 0;
          spt[k] = ringSpinT[k] || 0;
        }
      }
      ringSpeed = ns;
      ringSpin = sp;
      ringSpinT = spt;
    }

    function resize() {
      var r = host.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, r.width);
      H = Math.max(1, r.height);
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W * 0.5;
      cy = H * 0.5;
      coverR = Math.hypot(W * 0.5, H * 0.5);
      baseScale = coverR / DESIGN_R_MAX;
      rebuildRings(zoomSmooth);
    }

    function currentScale() {
      return baseScale * lerp(1, HOLD_ZOOM_MIN, zoomSmooth);
    }

    function ringIndexFor(radius) {
      var best = 0, d = 1e9;
      for (var i = 0; i < rings.length; i++) {
        var dd = Math.abs(rings[i] - radius);
        if (dd < d) { d = dd; best = i; }
      }
      return best;
    }

    function youDesignPos() {
      return { x: Math.cos(YOU_THETA) * YOU_R, y: Math.sin(YOU_THETA) * YOU_R };
    }

    function addRipple(strength, atYou) {
      ripples.push({ start: time, strength: strength || 0.85 });
      if (ripples.length > 16) ripples.shift();
      var p = atYou ? youDesignPos() : { x: 0, y: 0 };
      pings.push({ born: time, x: p.x, y: p.y, life: 1.6 });
      if (pings.length > 4) pings.shift();
    }

    function rippleAt(radius) {
      var max = 0;
      for (var i = 0; i < ripples.length; i++) {
        var rp = ripples[i];
        var elapsed = time - rp.start;
        if (elapsed < 0 || elapsed >= RIPPLE_DURATION) continue;
        var t = elapsed / RIPPLE_DURATION;
        var wave = smoothstep(0, 1, t) * DESIGN_R_MAX;
        var bell = 1 - smoothstep(0, RIPPLE_WIDTH * DESIGN_R_MAX * 0.5, Math.abs(radius - wave));
        var life = smoothstep(0, 0.22, t) * (1 - smoothstep(0.78, 1, t));
        max = Math.max(max, bell * life * rp.strength);
      }
      return max;
    }

    function animateValue(fn, from, to, dur, onDone) {
      tweens.push({ fn: fn, from: from, to: to, dur: dur, t0: time, done: onDone });
    }

    function drawPing(p) {
      var t = (time - p.born) / p.life;
      if (t >= 1) return false;
      var s = currentScale();
      var fade = t < 0.15 ? t / 0.15 : 1 - Math.max(0, (t - 0.55) / 0.45);
      var x = cx + p.x * s;
      var y = cy + p.y * s;
      var bloom = Math.max(14, (10 + t * 34) * s);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      var g = ctx.createRadialGradient(x, y, 0, x, y, bloom);
      g.addColorStop(0, rgba(ORANGE, 0.95 * fade));
      g.addColorStop(0.35, rgba(ORANGE, 0.32 * fade));
      g.addColorStop(1, rgba(ORANGE, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, bloom, 0, Math.PI * 2);
      ctx.fill();
      for (var i = 1; i <= 3; i++) {
        ctx.strokeStyle = rgba(ORANGE, 0.55 * fade * (1 - i / 4));
        ctx.lineWidth = Math.max(1, 1.2 * s);
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(x, y, (12 + t * (18 + i * 16)) * s, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
      return true;
    }

    function drawYou(s) {
      if (youForm < 0.01) return;
      var p = youDesignPos();
      var x = cx + p.x * s;
      var y = cy + p.y * s;
      var a = youForm;
      var strokeCol = mix3(lum(ORANGE), ORANGE, youOrange);
      strokeCol = mix3(strokeCol, lum(strokeCol), youGrey * 0.85);
      var fillDot = mix3(lum(ORANGE), ORANGE, youOrange);
      fillDot = mix3(fillDot, lum(fillDot), youGrey * 0.85);
      var pillBg = mix3(YOU_PILL_BG, lum(YOU_PILL_BG), youGrey * 0.5);
      var textCol = mix3(lum(ORANGE), ORANGE, youOrange);
      textCol = mix3(textCol, lum(textCol), youGrey * 0.85);

      var elbowUp = YOU_ELBOW_UP * s;
      var elbowRight = YOU_ELBOW_RIGHT * s;
      var pathTotal = elbowUp + elbowRight;
      var drawn = pathTotal * a;

      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = rgba(strokeCol, 1);
      ctx.lineWidth = Math.max(1.5, 2 * s);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.setLineDash([4 * s, 6 * s]);
      ctx.beginPath();
      ctx.moveTo(x, y - YOU_DOT * s * 0.55);
      if (drawn <= elbowUp) {
        ctx.lineTo(x, y - YOU_DOT * s * 0.55 - drawn);
      } else {
        ctx.lineTo(x, y - YOU_DOT * s * 0.55 - elbowUp);
        ctx.lineTo(x + (drawn - elbowUp), y - YOU_DOT * s * 0.55 - elbowUp);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      var pillX = x + elbowRight;
      var pillY = y - YOU_DOT * s * 0.55 - elbowUp;
      var pw = YOU_PILL_W * s;
      var ph = YOU_PILL_H * s;
      ctx.globalAlpha = a * smoothstep(0.55, 1, a);
      ctx.fillStyle = rgba(pillBg, 1);
      roundRect(ctx, pillX, pillY - ph * 0.5, pw, ph, ph * 0.5);
      ctx.fill();
      ctx.fillStyle = rgba(textCol, 1);
      ctx.font = "600 " + Math.max(10, 12 * s) + "px ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("YOU", pillX + pw * 0.5, pillY + 0.5);

      ctx.globalAlpha = a;
      ctx.fillStyle = rgba(fillDot, 1);
      ctx.beginPath();
      ctx.arc(x, y, YOU_DOT * s * 0.5, 0, Math.PI * 2);
      ctx.fill();

      if (youBorders > 0.01) {
        for (var b = 0; b < YOU_BORDERS.length; b++) {
          var bt = clamp((youBorders - b * 0.22) / 0.55, 0, 1);
          if (bt <= 0) continue;
          ctx.globalAlpha = a * bt;
          ctx.strokeStyle = rgba(strokeCol, 1);
          ctx.lineWidth = Math.max(1, 1.5 * s);
          ctx.beginPath();
          ctx.arc(x, y, YOU_BORDERS[b] * s * bt, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    function frame(now) {
      var dt = Math.min(0.05, (now - last) * 0.001);
      last = now;
      if (motion) time += dt;

      for (var ti = tweens.length - 1; ti >= 0; ti--) {
        var tw = tweens[ti];
        var u = clamp((time - tw.t0) / tw.dur, 0, 1);
        var e = u * u * (3 - 2 * u);
        tw.fn(lerp(tw.from, tw.to, e));
        if (u >= 1) {
          if (tw.done) tw.done();
          tweens.splice(ti, 1);
        }
      }

      while (ripples.length && time - ripples[0].start >= RIPPLE_DURATION) ripples.shift();

      var wantHold = holding || scriptHold;
      if (wantHold) {
        charge = Math.min(1, charge + dt / CHARGE_TIME);
        if (!charged && charge >= 1) charged = true;
      } else {
        charge *= Math.exp(-10 * dt);
      }

      var zoomTarget = smoothstep(0, 1, charge);
      var kZoom = 1 - Math.exp(-((wantHold ? 1.6 : 5) * dt));
      zoomSmooth += (zoomTarget - zoomSmooth) * kZoom;
      if (!wantHold && zoomSmooth < 0.002) zoomSmooth = 0;
      rebuildRings(zoomSmooth);

      if (loopRipple && time >= nextLoopAt) {
        addRipple(0.7, true);
        nextLoopAt = time + LOOP_RIPPLE_EVERY;
      }

      var scale = currentScale();
      var N = rings.length;
      var strokeW = Math.max(1, 1.5 * scale);
      var dash = 3 * scale;
      var gap = 7 * scale;

      ctx.clearRect(0, 0, W, H);

      if (linesAmt > 0.01) {
        for (var d = 0; d < N; d++) {
          var ripR = rippleAt(rings[d]);
          var rad = (rings[d] + ripR * RIPPLE_PUSH) * scale;
          if (rad < 0.5) continue;
          var isExtra = rings[d] > DESIGN_R_MAX;
          var extraFade = isExtra ? clamp((zoomSmooth - 0.08) / 0.4, 0, 1) : 1;
          var spin = time * ringSpeed[d] + ringSpinT[d];
          var seekBoost = 0;
          if (youForm > 0 && youForm < 1) {
            seekBoost = (1 - smoothstep(0, 40, Math.abs(rings[d] - seekR))) * 0.55;
          }
          ctx.save();
          ctx.globalAlpha = linesAmt * extraFade * (0.85 + seekBoost);
          ctx.strokeStyle = RING_STROKE;
          ctx.lineWidth = strokeW;
          ctx.lineCap = "round";
          ctx.setLineDash([dash, gap]);
          ctx.lineDashOffset = -spin * 40;
          ctx.beginPath();
          ctx.arc(cx, cy, rad, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }

      if (shapesAmt > 0.01) {
        for (var s = 0; s < SHAPES.length; s++) {
          var sh = SHAPES[s];
          var ri = ringIndexFor(sh.r);
          var rip = rippleAt(sh.r);
          var radius = sh.r + rip * RIPPLE_PUSH;
          var theta = sh.theta + (time * (ringSpeed[ri] || 0.01) + (ringSpinT[ri] || 0));
          var size = sh.size * (1 + rip * RIPPLE_SCALE) * scale;
          var x = cx + Math.cos(theta) * radius * scale;
          var y = cy + Math.sin(theta) * radius * scale;
          var col = mix3(sh.rgb, lum(sh.rgb), greyAmt);
          if (orangeWash > 0.01) {
            col = mix3(col, ORANGE, orangeWash * (0.35 + 0.65 * (1 - sh.r / DESIGN_R_MAX)));
          }
          if (rip > 0.35) col = mix3(col, ORANGE, clamp((rip - 0.35) / 0.65, 0, 1));
          ctx.save();
          ctx.globalAlpha = shapesAmt;
          ctx.fillStyle = rgba(col, 1);
          ctx.translate(x, y);
          ctx.rotate((sh.rot * Math.PI) / 180);
          roundRect(ctx, -size * 0.5, -size * 0.5, size, size, sh.rx * scale);
          ctx.fill();
          ctx.restore();
        }
      }

      drawYou(scale);
      pings = pings.filter(drawPing);

      var kSpin = 1 - Math.exp(-3 * dt);
      for (var r = 0; r < N; r++) {
        var kick = 0;
        for (var v = 0; v < ripples.length; v++) {
          var rp = ripples[v];
          var elp = time - rp.start;
          if (elp < 0 || elp >= RIPPLE_DURATION) continue;
          var tt = elp / RIPPLE_DURATION;
          var wr = DESIGN_R_MAX * smoothstep(0, 1, tt);
          var o = (1 - smoothstep(0, 80, Math.abs(rings[r] - wr))) *
            (smoothstep(0, 0.22, tt) * (1 - smoothstep(0.78, 1, tt))) * rp.strength;
          if (o > kick) kick = o;
        }
        var dir = Math.sign(ringSpeed[r]) || 1;
        ringSpin[r] += 0.55 * kick * dir * dt;
        ringSpinT[r] += (ringSpin[r] - ringSpinT[r]) * kSpin;
      }

      if (visible && inView && motion) raf = requestAnimationFrame(frame);
      else raf = 0;
    }

    function renderOnce() { last = performance.now(); frame(last); }
    function stopLoop() { if (raf) cancelAnimationFrame(raf); raf = 0; }
    function kickLoop() {
      if (visible && inView && motion) {
        if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
      } else { stopLoop(); renderOnce(); }
    }

    var ac = new AbortController();
    var signal = ac.signal;
    var ro = new ResizeObserver(function () { resize(); if (!raf) renderOnce(); });
    ro.observe(host);
    var io = new IntersectionObserver(function (entries) {
      inView = !!(entries[0] && entries[0].isIntersecting);
      kickLoop();
    }, { threshold: 0 });
    io.observe(host);
    document.addEventListener("visibilitychange", function () {
      visible = !document.hidden; kickLoop();
    }, { signal: signal });

    function beginHold() {
      if (!interactive) return;
      holding = true;
      charged = false;
      greyAmt = 1;
      youGrey = 1;
      youOrange = 0;
      orangeWash = 0;
      loopRipple = false;
    }
    function endHold() {
      if (!holding) return;
      holding = false;
      if (!interactive) { charged = false; return; }
      var strength = charged ? 0.95 : 0.55;
      addRipple(strength, true);
      animateValue(function (t) { orangeWash = t; }, 0, 1, 0.9);
      animateValue(function (t) {
        youGrey = 1 - t;
        youOrange = t;
        greyAmt = 1 - t;
      }, 0, 1, 1.1);
      window.setTimeout(function () {
        loopRipple = true;
        nextLoopAt = time + 0.05;
      }, 2000);
      charged = false;
    }

    canvas.addEventListener("pointerdown", beginHold, { signal: signal });
    window.addEventListener("pointerup", endHold, { signal: signal });
    window.addEventListener("pointercancel", endHold, { signal: signal });

    resize();
    renderOnce();
    kickLoop();

    return {
      canvas: canvas,
      setLines: function (v) { linesAmt = v; },
      setShapes: function (v) { shapesAmt = v; },
      setGrey: function (v) { greyAmt = v; },
      setScriptHold: function (on) {
        scriptHold = !!on;
        if (on) charged = false;
      },
      releaseScript: function () {
        var strength = charged ? 0.9 : 0.55;
        scriptHold = false;
        holding = false;
        addRipple(strength, false);
        charged = false;
      },
      formYou: function (onComplete) {
        seekR = DESIGN_R_MAX;
        animateValue(function (t) {
          youForm = t;
          seekR = lerp(DESIGN_R_MAX, YOU_R, t);
        }, 0, 1, 1.4, function () {
          window.setTimeout(function () {
            animateValue(function (t) { youBorders = t; }, 0, 1, 0.9, onComplete);
          }, 2000);
        });
      },
      enableInteractive: function () { interactive = true; },
      bindSubHold: function (subEl) {
        if (!subEl) return;
        subEl.style.cursor = "pointer";
        subEl.addEventListener("pointerdown", function (e) {
          e.preventDefault();
          beginHold();
        }, { signal: signal });
      },
      jumpToReady: function () {
        linesAmt = 1;
        shapesAmt = 1;
        youForm = 1;
        youBorders = 1;
        youOrange = 1;
        youGrey = 0;
        greyAmt = 0;
        interactive = true;
        loopRipple = true;
        nextLoopAt = time + LOOP_RIPPLE_EVERY;
      },
      destroy: function () {
        stopLoop(); ac.abort(); io.disconnect(); ro.disconnect();
        try { host.removeChild(canvas); } catch (err) {}
        if (imgEl) imgEl.style.opacity = "";
      }
    };
  }

  /* ─── Home intro + scene sync ─── */
  var KEY = "pepperHomeIntro";
  var html = document.documentElement;
  var pending = html.classList.contains("home-intro-pending");

  function block(e) { e.preventDefault(); }
  function blockKeys(e) {
    if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].indexOf(e.key) !== -1) {
      e.preventDefault();
    }
  }
  function lockScroll() {
    if (window.lenis && typeof window.lenis.stop === "function") window.lenis.stop();
    window.addEventListener("wheel", block, { passive: false, capture: true });
    window.addEventListener("touchmove", block, { passive: false, capture: true });
    window.addEventListener("keydown", blockKeys, { capture: true });
  }
  function unlockScroll() {
    html.classList.remove("home-intro-pending", "home-intro-logo-center", "home-intro-nav-hide");
    window.removeEventListener("wheel", block, { capture: true });
    window.removeEventListener("touchmove", block, { capture: true });
    window.removeEventListener("keydown", blockKeys, { capture: true });
    if (window.lenis && typeof window.lenis.start === "function") window.lenis.start();
  }
  function finish() {
    try { localStorage.setItem(KEY, "1"); } catch (e) {}
    unlockScroll();
  }

  window.Webflow = window.Webflow || [];
  window.Webflow.push(function () {
    var hero = document.querySelector(".u-section.u-min-height-screen");
    if (!hero) return;

    var circleImg = hero.querySelector(".u-image-svgcircle");
    var circleHost = circleImg
      ? (circleImg.closest(".u-content-wrapper") || circleImg.parentElement)
      : null;
    var scene = circleHost ? createScene(circleHost, circleImg) : null;
    var sub = hero.querySelector(".u-heading sub, h1 sub");
    if (scene && sub) scene.bindSubHold(sub);

    if (!pending) {
      if (scene) scene.jumpToReady();
      return;
    }

    if (typeof gsap === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (scene) scene.jumpToReady();
      finish();
      return;
    }

    var logos = document.querySelectorAll(".nav_desktop_logo, .nav_mobile_logo");
    var logo = null;
    logos.forEach(function (el) {
      if (!logo && el.offsetWidth > 0) logo = el;
    });
    if (!logo) {
      if (scene) scene.jumpToReady();
      finish();
      return;
    }

    var texts = hero.querySelectorAll(".u-text");
    var eyebrow = texts[0];
    var para = texts[1];
    var heading = hero.querySelector(".u-heading");
    var btn = hero.querySelector(".u-container .button_main_wrap");
    var trophy = hero.querySelector(".u-image-hero");
    var navRest = document.querySelectorAll(".nav_links_component, .nav_button_wrap");
    var copy = [eyebrow, heading, para, btn].filter(Boolean);

    lockScroll();
    gsap.set(copy, { opacity: 0 });
    gsap.set(navRest, { autoAlpha: 0 });
    if (para) gsap.set(para, { y: 40 });
    if (btn) gsap.set(btn, { y: 40 });
    if (trophy) gsap.set(trophy, { yPercent: 110, visibility: "hidden" });
    if (scene) {
      scene.setLines(0);
      scene.setShapes(0);
    }

    var eybCenter = 0;
    if (eyebrow) {
      var r = eyebrow.getBoundingClientRect();
      eybCenter = window.innerHeight / 2 - (r.top + r.height / 2);
      gsap.set(eyebrow, { y: eybCenter + 28 });
    }
    if (heading) gsap.set(heading, { y: eybCenter });

    function clearIntroProps() {
      gsap.set(copy.concat([logo]), { clearProps: "transform,opacity,pointerEvents,zIndex" });
      if (trophy) gsap.set(trophy, { clearProps: "transform,visibility" });
    }

    requestAnimationFrame(function () {
      var from = logo.getBoundingClientRect();
      html.classList.remove("home-intro-logo-center");
      var to = logo.getBoundingClientRect();
      gsap.set(logo, { x: from.left - to.left, zIndex: 1001, pointerEvents: "none" });

      var failSafe = window.setTimeout(function () {
        clearIntroProps();
        if (scene) scene.jumpToReady();
        finish();
      }, 16000);

      var tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        onComplete: function () {
          window.clearTimeout(failSafe);
          clearIntroProps();
          finish();
        }
      });

      if (eyebrow) tl.to(eyebrow, { opacity: 1, y: eybCenter, duration: 0.7 }, 0.15);
      tl.add(function () {
        if (!scene) return;
        scene.setLines(1);
        scene.setShapes(1);
        scene.setGrey(0);
        scene.setScriptHold(true);
      }, 0.2);

      if (eyebrow) tl.to(eyebrow, { y: 0, duration: 0.9, ease: "power3.inOut" }, "+=0.2");
      if (heading) tl.to(heading, { y: 0, opacity: 1, duration: 0.9, ease: "power3.inOut" }, "<");

      if (para) {
        tl.to(para, {
          y: 0,
          opacity: 1,
          duration: 0.7,
          onStart: function () { if (scene) scene.releaseScript(); }
        }, "+=0.08");
      } else {
        tl.add(function () { if (scene) scene.releaseScript(); }, "+=0.08");
      }
      if (btn) tl.to(btn, { y: 0, opacity: 1, duration: 0.7 }, "<0.08");

      tl.add(function () {
        if (scene) {
          scene.formYou(function () { scene.enableInteractive(); });
        }
      }, "+=0.15");

      tl.to(logo, {
        x: 0,
        duration: 0.9,
        ease: "power3.inOut",
        onComplete: function () {
          gsap.set(navRest, { autoAlpha: 0, x: 0, y: 0 });
          html.classList.remove("home-intro-nav-hide");
        }
      }, "<");
      tl.to(navRest, { autoAlpha: 1, duration: 0.45 });
      if (trophy) {
        tl.to(trophy, {
          yPercent: 0,
          duration: 1,
          ease: "power3.out",
          onStart: function () { gsap.set(trophy, { visibility: "visible" }); }
        });
      }
    });
  });
})();
