(() => {
  if (window.pepperHomepageExternalReady) return;
  window.pepperHomepageExternalReady = true;

/* Pepper homepage. Keep original block order. */

/* START HOME-JS-010 | original SHA-256 05c1e9c416691a9310312e5c5541e59600d408ee8847613818c9f34360a030f9 */

try {


(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches || window.pepperHeroParticles) return;
  window.pepperHeroParticles = true;
  root.classList.add('hero-particles-ready');

  // Always restore the image if loading or initialization fails.
  const watchdog = setTimeout(() => {
    root.classList.remove('hero-particles-ready');
  }, 12000);

  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    });
  }

  async function init(stage) {
    const final = stage.querySelector('[data-hero-particle-image]');
    if (!final || stage.dataset.heroParticleStarted) return;
    stage.dataset.heroParticleStarted = 'true';
    let canvas;
    let observer;
    let frame;
    let finished = false;
    let timeout;
    const cleanup = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      cancelAnimationFrame(frame);
      observer?.disconnect();
      reduced.removeEventListener('change', cleanup);
      stage.classList.add('is-particle-revealed');
      setTimeout(() => canvas?.remove(), 750);
    };
    timeout = setTimeout(cleanup, 11000);
    reduced.addEventListener('change', cleanup);

    try {
      final.loading = 'eager';
      const url = stage.getAttribute('data-hero-particles') ||
        final.currentSrc || final.src;
      const source = await loadImage(url);
      await final.decode();
      if (window.pepperFontsReady) {
        await Promise.race([
          window.pepperFontsReady,
          new Promise(resolve => setTimeout(resolve, 1500))
        ]);
      }
      if (finished) return;

      const sample = document.createElement('canvas');
      sample.width = Math.min(source.naturalWidth, 1577);
      sample.height = Math.round(sample.width *
        source.naturalHeight / source.naturalWidth);
      const sc = sample.getContext('2d', {
        willReadFrequently: true
      });
      sc.drawImage(source, 0, 0, sample.width, sample.height);
      const pixels = sc.getImageData(
        0, 0, sample.width, sample.height
      ).data;
      const points = [];
      const step = 3;
      for (let y = 0; y < sample.height; y += step) {
        for (let x = 0; x < sample.width; x += step) {
          const i = (y * sample.width + x) * 4;
          if (pixels[i + 3] < 18) continue;
          points.push({
            x: x / sample.width,
            y: y / sample.height,
            sx: Math.random(),
            sy: Math.random(),
            delay: Math.random() * 0.22,
            bend: (Math.random() - 0.5) * 0.3,
            color: `rgba(${pixels[i]},${pixels[i + 1]},` +
              `${pixels[i + 2]},${pixels[i + 3] / 255})`
          });
        }
      }
      if (!points.length) throw new Error('Empty particle source');
      // Shuffle before limiting so every area remains represented.
      for (let i = points.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [points[i], points[j]] = [points[j], points[i]];
      }
      points.length = Math.min(points.length,
        innerWidth < 768 ? 3200 : 6500);

      canvas = document.createElement('canvas');
      canvas.className = 'hero-particle-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      stage.appendChild(canvas);
      const ctx = canvas.getContext('2d');
      let width = 0;
      let height = 0;
      let scale = 1;
      let left = 0;
      let top = 0;
      function resize() {
        width = stage.clientWidth;
        height = stage.clientHeight;
        const dpr = Math.min(devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        scale = Math.min(width / sample.width,
          height / sample.height);
        left = (width - sample.width * scale) / 2;
        top = (height - sample.height * scale) / 2;
      }
      observer = new ResizeObserver(resize);
      observer.observe(stage);
      resize();

      // Scatter 0.35s, gather 2.6s, exact SVG hold, image reveal.
      let start;
      function draw(now) {
        if (finished) return;
        if (document.hidden || !width || !height) {
          start = undefined;
          frame = requestAnimationFrame(draw);
          return;
        }
        start ??= now;
        const seconds = (now - start) / 1000;
        const progress = Math.max(0, (seconds - 0.35) / 2.6);
        const exact = Math.min(1,
          Math.max(0, (seconds - 2.95) / 0.3));
        ctx.clearRect(0, 0, width, height);
        ctx.globalAlpha = (1 - exact) *
          Math.min(1, seconds / 0.2);
        for (const p of points) {
          const t = Math.min(1, Math.max(0,
            (progress - p.delay) / (1 - p.delay)));
          const ease = t * t * t * (t * (t * 6 - 15) + 10);
          const tx = left + p.x * sample.width * scale;
          const ty = top + p.y * sample.height * scale;
          const x = p.sx * width * (1 - ease) + tx * ease;
          const y = p.sy * height * (1 - ease) + ty * ease +
            Math.sin(Math.PI * ease) * p.bend * height;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(x, y, Math.max(0.65, step * scale * 0.5),
            0, Math.PI * 2);
          ctx.fill();
        }
        if (exact > 0) {
          ctx.globalAlpha = exact;
          ctx.drawImage(source, left, top,
            sample.width * scale, sample.height * scale);
        }
        ctx.globalAlpha = 1;
        if (seconds >= 3.8) cleanup();
        else frame = requestAnimationFrame(draw);
      }
      frame = requestAnimationFrame(draw);
    } catch (error) {
      cleanup();
      console.warn('Hero particles: showing static image.', error);
    }
  }

  function boot() {
    const stages = [...document.querySelectorAll(
      '[data-hero-particles]'
    )];
    if (!stages.length) {
      clearTimeout(watchdog);
      root.classList.remove('hero-particles-ready');
      return;
    }
    stages.forEach(init);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else boot();
})();


;

} catch (error) {

  console.error('[Pepper HOME-JS-010]', error);

}

/* END HOME-JS-010 */

/* START HOME-JS-012 | original SHA-256 2b7e11adb0acf4b16fc846a2b1bd52a44836ae5ccfaa74e3f996b6b775c4e4af */

try {


document.addEventListener("DOMContentLoaded", () => {
  const media = gsap.matchMedia();

  media.add("(min-width: 992px)", () => {
    const cleanups = [];

    document.querySelectorAll(".u-grid-item").forEach((item) => {
      const link = item.querySelector(".u-link-abs");
      const arrowWrap = item.querySelector(".u-arrow-wrap");
      const textBlock = item.querySelector(".u-text-block");

      if (!link || !arrowWrap || !textBlock) return;

      gsap.set(arrowWrap, { xPercent: -120 });

      const hoverTimeline = gsap.timeline({
        paused: true,
        defaults: {
          duration: 0.4,
          ease: "power2.out"
        }
      });

      hoverTimeline
        .to(arrowWrap, { xPercent: 0 }, 0)
        .to([arrowWrap, textBlock], {
          backgroundColor: "var(--swatch--dark-orange)",
          outlineColor: "var(--swatch--dark-orange)",
          borderColor: "var(--swatch--dark-orange)",
          color: "var(--swatch--orange-tint)"
        }, 0);

      const enter = () => hoverTimeline.play();
      const leave = () => hoverTimeline.reverse();

      link.addEventListener("mouseenter", enter);
      link.addEventListener("mouseleave", leave);

      cleanups.push(() => {
        link.removeEventListener("mouseenter", enter);
        link.removeEventListener("mouseleave", leave);
      });
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  });
});


;

} catch (error) {

  console.error('[Pepper HOME-JS-012]', error);

}

/* END HOME-JS-012 */

/* START HOME-JS-013 | original SHA-256 f8fbccabf32e34020913512a40689f755835e0bef31e563e03fed4aea4080655 */

try {


  (function () {
    const template = document.querySelector('[data-pepper-anchor="HOME-JS-013"]').previousElementSibling
      .querySelector(".secondary_highlight_box");

    window.Webflow = window.Webflow || [];
    window.Webflow.push(function () {
      const desktop = window.matchMedia("(min-width: 992px)");
      // Support the published class and the corrected spelling.
      const selector = ".u-secondary-navlinks, .u-seondary-navlinks";

      document.querySelectorAll(".u-secondary-mainnav").forEach(
        function (nav) {
          const menu = nav.querySelector(".u-secondary-menu");
          if (!menu || menu.dataset.secondaryHighlightReady) return;

          const links = Array.from(menu.querySelectorAll(selector));
          if (!links.length) return;

          menu.dataset.secondaryHighlightReady = "true";
          menu.classList.add("secondary_highlight_wrap");
          const box = template.cloneNode(true);
          menu.appendChild(box);
          let frame = 0;
          let hovered = null;
          let focused = null;

          function isCurrent(link) {
            const current = link.getAttribute("aria-current");
            return link.classList.contains("w--current") ||
              Boolean(current && current !== "false");
          }

          function update() {
            frame = 0;
            const target = desktop.matches
              ? hovered || focused || links.find(isCurrent)
              : null;

            links.forEach(function (link) {
              link.toggleAttribute(
                "data-secondary-highlight", link === target
              );
            });

            if (!target || !target.getClientRects().length) {
              box.classList.remove("is-active");
              return;
            }

            // One measured box; CSS handles the actual animation.
            const linkRect = target.getBoundingClientRect();
            const menuRect = menu.getBoundingClientRect();
            const x = linkRect.left - menuRect.left +
              menu.scrollLeft - menu.clientLeft;
            const y = linkRect.top - menuRect.top +
              menu.scrollTop - menu.clientTop;
            const entering = !box.classList.contains("is-active");

            if (entering) box.style.transition = "none";
            box.style.width = linkRect.width + "px";
            box.style.height = linkRect.height + "px";
            box.style.transform =
              "translate3d(" + x + "px," + y + "px,0)";

            if (entering) {
              // First appearance fades in at the target itself.
              box.getBoundingClientRect();
              box.style.removeProperty("transition");
            }
            box.classList.add("is-active");
          }

          function schedule() {
            if (!frame) frame = requestAnimationFrame(update);
          }

          menu.addEventListener("scroll", schedule, { passive: true });
          window.addEventListener("resize", schedule);
          desktop.addEventListener("change", function () {
            hovered = null;
            focused = null;
            schedule();
          });

          // Variable link sizes need JS measurement; CSS animates.
          // Hover previews the pill without changing the active link.
          links.forEach(function (link) {
            link.addEventListener("pointerenter", function (event) {
              if (!desktop.matches || event.pointerType === "touch") {
                return;
              }
              hovered = link;
              schedule();
            });
          });
          menu.addEventListener("pointerleave", function () {
            hovered = null;
            schedule();
          });
          menu.addEventListener("focusin", function (event) {
            focused = links.find(link =>
              link.contains(event.target) &&
              link.matches(":focus-visible")
            ) || null;
            schedule();
          });
          menu.addEventListener("focusout", function () {
            focused = null;
            schedule();
          });

          const currentObserver = new MutationObserver(schedule);
          links.forEach(function (link) {
            currentObserver.observe(link, {
              attributes: true,
              attributeFilter: ["class", "aria-current"]
            });
          });

          const sizeObserver = new ResizeObserver(schedule);
          sizeObserver.observe(menu);
          links.forEach(link => sizeObserver.observe(link));
          document.fonts?.ready.then(schedule);
          update();
        }
      );
    });
  })();


;

} catch (error) {

  console.error('[Pepper HOME-JS-013]', error);

}

/* END HOME-JS-013 */

/* START HOME-JS-014 | original SHA-256 82e82d081b8859d5cf1cf203e241f48f7d867f6f511f8c430accd1ef0b071fc5 */

try {


  window.Webflow = window.Webflow || [];

  window.Webflow.push(function () {
    // Replace the old dropdown-sync Embed with this entire block.
    const mobile = window.matchMedia("(max-width: 991px)");
    const linkSelector =
      ".u-seondary-navlinks.w--current, " +
      ".u-secondary-navlinks.w--current";

    document.querySelectorAll(".u-secondary-nav").forEach(
      function (dropdown) {
        if (dropdown.dataset.currentButtonSync === "true") return;

        const toggle = dropdown.querySelector(".u-secondary-block");
        const list = dropdown.querySelector(".u-secondary-list");
        if (!toggle || !list) return;

        const targetText = toggle.querySelector("p");
        // Use the content Embed, leaving the dropdown arrow alone.
        const targetIcon = toggle.querySelector(".u-real-svg .w-embed")
          || Array.from(toggle.querySelectorAll(".w-embed")).find(
            embed => !embed.closest(".u-nav-icon")
          );
        if (!targetText || !targetIcon) return;

        dropdown.dataset.currentButtonSync = "true";

        // Capture the Designer defaults before the first selection.
        const defaultText = Array.from(targetText.childNodes).map(
          node => node.cloneNode(true)
        );
        const defaultLabel = toggle.getAttribute("aria-label");
        const originalSvg = targetIcon.querySelector("svg");
        const defaultSvg = originalSvg?.cloneNode(true) || null;
        const iconSlot = document.createComment("secondary icon");

        if (originalSvg) {
          originalSvg.after(iconSlot);
        } else {
          targetIcon.appendChild(iconSlot);
        }

        let frame = 0;
        let previousText = null;
        let previousSvg = null;

        function updateButton() {
          const currentLink = mobile.matches
            ? list.querySelector(linkSelector)
            : null;
          const sourceText = currentLink?.querySelector(".u-text, p");
          const useDefault = !currentLink || !sourceText;
          const text = sourceText?.textContent.trim() || "";
          const textKey = useDefault ? "default" : "current:" + text;

          if (textKey !== previousText) {
            if (useDefault) {
              targetText.replaceChildren(
                ...defaultText.map(node => node.cloneNode(true))
              );
              if (defaultLabel == null) {
                toggle.removeAttribute("aria-label");
              } else {
                toggle.setAttribute("aria-label", defaultLabel);
              }
            } else {
              targetText.textContent = text;
              toggle.setAttribute("aria-label", text);
            }
            previousText = textKey;
          }

          const sourceSvg = useDefault
            ? defaultSvg
            : currentLink.querySelector("svg");
          const svgKey = (useDefault ? "default:" : "current:") +
            (sourceSvg?.outerHTML || "");

          if (svgKey !== previousSvg) {
            targetIcon.querySelector("svg")?.remove();
            if (sourceSvg) {
              const copy = sourceSvg.cloneNode(true);
              if (!useDefault) {
                copy.setAttribute("aria-hidden", "true");
                copy.setAttribute("focusable", "false");
              }
              iconSlot.before(copy);
            }
            previousSvg = svgKey;
          }
        }

        function scheduleUpdate() {
          if (frame) return;
          frame = requestAnimationFrame(function () {
            frame = 0;
            updateButton();
          });
        }

        const observer = new MutationObserver(scheduleUpdate);
        observer.observe(list, {
          subtree: true,
          attributes: true,
          attributeFilter: ["class", "aria-current"],
          childList: true,
          characterData: true
        });

        mobile.addEventListener("change", scheduleUpdate);
        updateButton();
      }
    );

    // Set the FAQ section's Webflow ID to faq (without the #).
    const faq = document.getElementById("faq");
    if (!faq) return;

    document.querySelectorAll(".u-secondary-mainnav").forEach(
      function (nav) {
        if (nav.hasAttribute("data-secondary-faq")) return;

        const defaultInert = nav.inert;
        let hidden = null;
        let frame = 0;

        function updateVisibility() {
          frame = 0;
          // Hide when FAQ enters the screen, at every screen size.
          // Stay hidden below FAQ; restore above it on the way back.
          const viewport = window.visualViewport;
          const edge = viewport
            ? viewport.offsetTop + viewport.height
            : window.innerHeight;
          const shouldHide = faq.getBoundingClientRect().top < edge;
          if (shouldHide === hidden) return;

          hidden = shouldHide;
          nav.inert = hidden || defaultInert;
          nav.setAttribute(
            "data-secondary-faq", hidden ? "hidden" : "visible"
          );
        }

        function scheduleVisibility() {
          if (frame) return;
          frame = requestAnimationFrame(updateVisibility);
        }

        window.addEventListener("scroll", scheduleVisibility, {
          passive: true
        });
        window.addEventListener("resize", scheduleVisibility);
        window.addEventListener("pageshow", scheduleVisibility);
        window.addEventListener("load", scheduleVisibility);
        window.visualViewport?.addEventListener(
          "resize", scheduleVisibility
        );
        window.visualViewport?.addEventListener(
          "scroll", scheduleVisibility
        );

        const observer = new ResizeObserver(scheduleVisibility);
        observer.observe(nav);
        observer.observe(faq);
        observer.observe(document.body);
        document.fonts?.ready.then(scheduleVisibility);

        updateVisibility();
      }
    );
  });


;

} catch (error) {

  console.error('[Pepper HOME-JS-014]', error);

}

/* END HOME-JS-014 */

/* START HOME-JS-016 | original SHA-256 aba8801d999a0051b6112ab5a00d77fa03747d0f9c0265ccec5e3bf660b65822 */

try {


(() => {
  const video = document.querySelector('#two-section video');
  if (!video) return;
  const section = video.closest('#two-section');
  if (!section || video.dataset.sectionPlayback) return;
  video.dataset.sectionPlayback = 'true';
  video.muted = true;
  let inView = false;

  function sync() {
    if (!inView || document.hidden) {
      video.pause();
      return;
    }
    const playback = video.play();
    if (playback) playback.catch(() => {});
  }

  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting && entry.intersectionRatio > 0;
    sync();
  }, { threshold: 0 });

  observer.observe(section);
  document.addEventListener('visibilitychange', sync);
})();


;

} catch (error) {

  console.error('[Pepper HOME-JS-016]', error);

}

/* END HOME-JS-016 */

/* START HOME-JS-019 | original SHA-256 8fe61fa1eee95dcf6b8aa8002ebc64c83c6cd3da56b5a87d9bb8a345dbaa6577 */

try {


(() => {
    "use strict";

    function initTangoTabs() {
      const root = document.getElementById("tango");

      if (!root || root.dataset.tangoTabsReady === "true") return;

      if (typeof window.Swiper !== "function") {
        console.warn("[Tango] Load Swiper 11 before this code.");
        return;
      }

      const links = root.querySelector(".u-swiper-linkwrap");
      const tabList = root.querySelector(".u-swiper-desktoplist");
      const viewport = root.querySelector(".u-swiper-contentwrap");
      const track = root.querySelector(".u-swiper-contentlist");
      const bullets = root.querySelector(".u-home-swiperbullets");

      if (!links || !tabList || !viewport || !track || !bullets) return;

      if (viewport.swiper || links.swiper) {
        console.warn(
          "[Tango] Remove the previous Tango initialization and reload."
        );
        return;
      }

      const tabs = Array.from(
        tabList.querySelectorAll(".u-desktop-content")
      );

      const slides = Array.from(
        track.querySelectorAll(".u-swiper-slide")
      );

      if (!slides.length || tabs.length !== slides.length) {
        console.warn(
          "[Tango] Each desktop tab needs one matching content card."
        );
        return;
      }

      /*
       * Unwrap only the intermediate Lumos slots required by Swiper.
       * Keep wrappers inside cards and desktop tabs unchanged.
       */
      function unwrapSlots(parent) {
        Array.from(parent.children).forEach(child => {
          if (!child.classList.contains("u-display-contents")) return;

          unwrapSlots(child);
          child.replaceWith(...Array.from(child.childNodes));
        });
      }

      unwrapSlots(viewport);
      unwrapSlots(track);

      if (
        track.parentElement !== viewport ||
        slides.some(slide => slide.parentElement !== track)
      ) {
        console.warn("[Tango] Unexpected wrapper structure.");
        return;
      }

      root.dataset.tangoTabsReady = "true";

      const originalStyles = new Map(
        [viewport, track, ...slides].map(element => [
          element,
          element.getAttribute("style")
        ])
      );

      const desktopQuery = window.matchMedia("(min-width: 992px)");

      const motionQuery = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

      const fills = tabs.map(tab =>
        tab.querySelector(".div-team-homeline .u-progress-inner")
      );

      const captions = Array.from(
        track.querySelectorAll(".u-tango-contenttab")
      );

      let swiper = null;
      let desktop = desktopQuery.matches;
      let selected = 0;
      let activeFill = null;
      let inView = false;

      function mobileGap() {
        const rem = parseFloat(
          getComputedStyle(document.documentElement).fontSize
        );

        return 1.5 * (Number.isFinite(rem) ? rem : 16);
      }

      /*
       * Desktop autoplay is controlled by section visibility.
       * Mobile selection is controlled by page scroll.
       */
      function syncDesktopAutoplay() {
        if (!desktop || !swiper || swiper.destroyed) return;

        const shouldPlay =
          inView &&
          !document.hidden &&
          !motionQuery.matches;

        if (shouldPlay) {
          if (!swiper.autoplay.running) {
            swiper.autoplay.start();
          }
        } else {
          if (swiper.autoplay.running) {
            swiper.autoplay.stop();
          }

          if (activeFill) {
            activeFill.style.transform = "scaleX(0)";
          }
        }
      }

      viewport.classList.add("tango_swiper_wrap");
      track.classList.add("tango_swiper_track");

      slides.forEach((slide, index) => {
        slide.classList.add("tango_swiper_slide");

        if (!slide.id) {
          slide.id = "tango-panel-" + (index + 1);
        }
      });

      fills.forEach(fill => {
        if (!fill) return;

        fill.classList.add("tango_progress_fill");
        fill.setAttribute("aria-hidden", "true");
      });

      function updateActive(instance) {
        selected = instance.realIndex;
        activeFill = desktop ? fills[selected] : null;

        tabs.forEach((tab, index) => {
          const active = index === selected;

          tab.classList.toggle("is-active", active);
          tab.setAttribute("aria-selected", String(active));
          tab.tabIndex = desktop && active ? 0 : -1;

          tab.style.setProperty(
            "--tango-tab-opacity",
            !desktop || active || tab.matches(":hover") ? "1" : "0.5"
          );

          tab.style.setProperty(
            "--tango-detail-color",
            !desktop || active
              ? "var(--swatch--grey-tint)"
              : "#595959"
          );

          if (fills[index]) {
            fills[index].style.transform = "scaleX(0)";
          }

          {
            slides[index].setAttribute(
              "aria-hidden",
              String(!active)
            );

            slides[index].toggleAttribute("inert", !active);
            slides[index].style.pointerEvents =
              active ? "auto" : "none";
          }
        });
      }

      function selectTab(index) {
        if (!desktop || !swiper || swiper.destroyed) return;

        if (index !== swiper.realIndex) {
          swiper.slideTo(index);
        }
      }

      tabs.forEach((tab, index) => {
        tab.classList.add("tango_tab");

        tab.querySelectorAll(".u-heading").forEach(heading => {
          heading.classList.add("tango_tab_heading");
        });

        const details = tab.querySelectorAll(".u-desktop-slidecontent");
        details.forEach(detail => {
          detail.classList.add("tango_tab_detail");

          const texts = detail.querySelectorAll(".u-text, .w-richtext");
          texts.forEach(text => {
            text.classList.add("tango_tab_detail");
          });
        });

        if (!tab.id) {
          tab.id = "tango-tab-" + (index + 1);
        }

        tab.setAttribute("role", "tab");
        tab.setAttribute("aria-controls", slides[index].id);

        tab.addEventListener("mouseenter", () => {
          if (!desktop) return;

          tab.style.setProperty("--tango-tab-opacity", "1");
        });

        tab.addEventListener("mouseleave", () => {
          tab.style.setProperty(
            "--tango-tab-opacity",
            !desktop || tab.classList.contains("is-active")
              ? "1" : "0.5"
          );
        });

        tab.addEventListener("click", event => {
          if (!desktop) return;

          event.preventDefault();
          selectTab(index);
        });

        tab.addEventListener("keydown", event => {
          if (!desktop) return;

          let next = index;

          switch (event.key) {
            case "ArrowDown":
            case "ArrowRight":
              next = (index + 1) % tabs.length;
              break;

            case "ArrowUp":
            case "ArrowLeft":
              next = (index - 1 + tabs.length) % tabs.length;
              break;

            case "Home":
              next = 0;
              break;

            case "End":
              next = tabs.length - 1;
              break;

            case "Enter":
            case " ":
              break;

            default:
              return;
          }

          event.preventDefault();
          tabs[next].focus({ preventScroll: true });
          selectTab(next);
        });
      });

      // Keep the section introduction outside the sticky stage.
      const stage = viewport.closest('[data-slide-up]');
      if (!stage) return;
      const runway = document.createElement('div');
      runway.className = 'tango_scroll_runway';
      stage.before(runway);
      runway.append(stage);
      stage.classList.add('tango_scroll_stage');
      const sizeProbe = document.createElement('div');
      sizeProbe.className = 'tango_viewport_probe';
      sizeProbe.setAttribute('aria-hidden', 'true');
      runway.append(sizeProbe);
      let stableHeight = 0;
      let measuredWidth = innerWidth;
      let resizeTimer = 0;
      const mainNav = document.querySelector('.nav_temporary') ||
        document.querySelector('.nav_component');
      const navs = [
        mainNav,
        ...document.querySelectorAll('.u-secondary-mainnav')
      ].filter(Boolean);
      let scrollFrame = 0;
      let step = 1;
      let topOffset = 0;
      let needsMeasure = true;
      let navEdge = 0;
      let stageHeight = 0;

      function centerMobile() {
        if (desktop || !stageHeight) return;
        const visual = window.visualViewport;
        if (visual && Math.abs(visual.scale - 1) > 0.01) return;
        const height = visual?.height || innerHeight;
        const viewTop = visual?.offsetTop || 0;
        const upper = Math.max(navEdge, viewTop);
        const lower = viewTop + height;
        const centered = upper + Math.max(
          12, (lower - upper - stageHeight) / 2
        );
        // Match natural entry/exit to the visible sticky position.
        // Do not add a second movement after the stage has pinned.
        const rect = runway.getBoundingClientRect();
        const end = rect.bottom - stageHeight;
        const natural = Math.min(Math.max(rect.top, topOffset), end);
        const desired = Math.min(Math.max(rect.top, centered), end);
        const pinned = rect.top < Math.min(topOffset, centered) &&
          end > Math.max(topOffset, centered);
        stage.classList.toggle('is-centering-pinned', pinned);
        const shift = desired - natural;
        runway.style.setProperty('--tango-shift', shift + 'px');
      }

      function measureMobile() {
        needsMeasure = false;
        if (desktop) {
          runway.removeAttribute('style');
          stage.classList.remove('is-centering-pinned');
          root.style.removeProperty('--tango-image');
          root.style.removeProperty('--tango-caption');
          root.classList.remove('tango_short_viewport');
          return;
        }
        if (!stableHeight) {
          stableHeight = sizeProbe.offsetHeight || innerHeight;
        }
        const height = stableHeight;
        root.classList.toggle(
          'tango_short_viewport', height <= 500 && innerWidth >= 600
        );
        // Use each bar's sticky/fixed resting edge, not its
        // current position while the section is still far away.
        navEdge = navs.reduce((edge, nav) => {
          const css = getComputedStyle(nav);
          if (css.display === 'none') return edge;
          const top = parseFloat(css.top) || 0;
          return Math.max(edge, top + nav.offsetHeight);
        }, 0);
        topOffset = navEdge + 12;
        root.style.setProperty('--tango-caption', '0px');
        const captionHeight = Math.max(...captions.map(
          caption => caption.getBoundingClientRect().height
        ));
        root.style.setProperty(
          '--tango-caption', Math.ceil(captionHeight) + 'px'
        );
        const available = height - navEdge - 24;
        root.style.setProperty('--tango-image', '0px');
        const rest = stage.getBoundingClientRect().height;
        const imageHeight = Math.max(
          100, Math.min(viewport.clientWidth, height * 0.46,
            available - rest)
        );
        root.style.setProperty(
          '--tango-image', Math.floor(imageHeight) + 'px'
        );
        step = Math.max(240, available * 0.75);
        stageHeight = stage.getBoundingClientRect().height;
        // Share unused viewport height above and below the whole row.
        topOffset += Math.max(0, (available - stageHeight) / 2);
        runway.style.setProperty('--tango-top', topOffset + 'px');
        runway.style.setProperty(
          '--tango-runway',
          (stageHeight + step * slides.length) + 'px'
        );
        centerMobile();
        swiper?.update();
      }

      function updateScroll() {
        scrollFrame = 0;
        if (needsMeasure) measureMobile();
        if (desktop || !swiper || swiper.destroyed) return;
        centerMobile();
        const distance = topOffset -
          runway.getBoundingClientRect().top;
        const index = Math.max(0, Math.min(
          slides.length - 1, Math.floor(distance / step)
        ));
        if (swiper.realIndex !== index) {
          swiper.slideTo(index, motionQuery.matches ? 0 : 450);
        }
      }

      function scheduleScroll() {
        if (!scrollFrame) {
          scrollFrame = requestAnimationFrame(updateScroll);
        }
      }

      function resizeScroll() {
        needsMeasure = true;
        scheduleScroll();
      }

      window.addEventListener('scroll', scheduleScroll, {
        passive: true
      });
      function onViewportResize() {
        // Recenter for browser chrome without resizing the runway.
        if (!desktop && Math.abs(innerWidth - measuredWidth) < 2) {
          scheduleScroll();
          return;
        }
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          measuredWidth = innerWidth;
          stableHeight = 0;
          resizeScroll();
        }, 200);
      }

      function onOrientationChange() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          measuredWidth = innerWidth;
          stableHeight = 0;
          resizeScroll();
        }, 300);
      }

      window.visualViewport?.addEventListener(
        'resize', scheduleScroll, { passive: true }
      );
      window.visualViewport?.addEventListener(
        'scroll', scheduleScroll, { passive: true }
      );
      window.addEventListener('resize', onViewportResize);
      window.addEventListener('orientationchange', onOrientationChange);
      window.addEventListener('pageshow', resizeScroll);
      window.addEventListener('load', resizeScroll);
      const navObserver = new ResizeObserver(() => {
        // Mobile browser chrome can resize navigation during a swipe.
        // Do not rebuild the runway or slide sizes in that gesture.
        if (desktop || !stageHeight) resizeScroll();
        else scheduleScroll();
      });
      navs.forEach(nav => navObserver.observe(nav));
      document.fonts?.ready.then(resizeScroll);

      bullets.addEventListener('click', event => {
        if (desktop) return;
        const bullet = event.target.closest(
          '.swiper-pagination-bullet'
        );
        if (!bullet) return;
        const index = Array.from(bullets.children).indexOf(bullet);
        if (index < 0) return;
        const target = scrollY + runway.getBoundingClientRect().top
          - topOffset + step * (index + 0.05);
        if (window.lenis?.scrollTo) {
          window.lenis.scrollTo(target, { immediate: true });
        } else {
          window.scrollTo({ top: target, behavior: 'instant' });
        }
        scheduleScroll();
      });

      function build() {
        if (swiper) {
          selected = swiper.realIndex;
          swiper.destroy(true, true);
          swiper = null;
        }

        originalStyles.forEach((style, element) => {
          if (style === null) {
            element.removeAttribute("style");
          } else {
            element.setAttribute("style", style);
          }
        });

        desktop = desktopQuery.matches;
        activeFill = null;

        // Desktop uses tabs; mobile keeps the caption in each card.
        captions.forEach(caption => {
          caption.classList.toggle("tango_caption_hidden", desktop);
        });

        tabList.setAttribute("role", "tablist");
        tabList.setAttribute("aria-orientation", "vertical");

        slides.forEach((slide, index) => {
          slide.removeAttribute("inert");
          slide.removeAttribute("aria-hidden");
          slide.removeAttribute("aria-label");
          slide.removeAttribute("aria-roledescription");

          if (desktop) {
            slide.setAttribute("role", "tabpanel");
            slide.setAttribute("aria-labelledby", tabs[index].id);
          } else {
            slide.removeAttribute("role");
            slide.removeAttribute("aria-labelledby");
          }
        });

        swiper = new window.Swiper(viewport, {
          wrapperClass: "tango_swiper_track",
          slideClass: "tango_swiper_slide",

          initialSlide: selected,
          speed: motionQuery.matches ? 0 : 600,

          effect: "fade",
          fadeEffect: {
            crossFade: true
          },

          // One complete card at every breakpoint.
          slidesPerView: 1,
          slidesPerGroup: 1,

          // Fade requires a single card without a track gap.
          spaceBetween: 0,

          loop: false,
          rewind: desktop,
          allowTouchMove: false,
          autoHeight: desktop,
          watchOverflow: true,
          updateOnWindowResize: desktop,
          resizeObserver: desktop,

          a11y: {
            enabled: !desktop,
            scrollOnFocus: false,
            notificationClass: "u-sr-only"
          },

          pagination: desktop
            ? false
            : {
                el: bullets,
                type: "bullets",
                clickable: false
              },

          autoplay: {
            // Desktop starts only through syncDesktopAutoplay().
            enabled: false,
            delay: 8000,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
            waitForTransition: false
          },

          on: {
            init: updateActive,
            realIndexChange: updateActive,

            beforeResize(instance) {
              const gap = 0;

              instance.params.spaceBetween = gap;
              instance.originalParams.spaceBetween = gap;
            },

            autoplayTimeLeft(instance, timeLeft, remaining) {
              if (!desktop || !activeFill) return;

              const progress = Math.max(
                0,
                Math.min(1, 1 - remaining)
              );

              activeFill.style.transform =
                "scaleX(" + progress.toFixed(4) + ")";
            }
          }
        });

        syncDesktopAutoplay();
        resizeScroll();
      }

      function onMediaChange(query, callback) {
        if (query.addEventListener) {
          query.addEventListener("change", callback);
        } else {
          query.addListener(callback);
        }
      }

      onMediaChange(desktopQuery, build);
      onMediaChange(motionQuery, build);

      build();

      // Observe the section, including an initial deep link.
      const sectionObserver = new IntersectionObserver(entries => {
        const entry = entries[entries.length - 1];

        if (!entry) return;

        inView = entry.isIntersecting;
        syncDesktopAutoplay();
      }, {
        threshold: 0
      });

      sectionObserver.observe(root);

      document.addEventListener(
        "visibilitychange",
        syncDesktopAutoplay
      );
    }

    window.Webflow = window.Webflow || [];
    window.Webflow.push(initTangoTabs);
  })();


;

} catch (error) {

  console.error('[Pepper HOME-JS-019]', error);

}

/* END HOME-JS-019 */

/* START HOME-JS-023 | original SHA-256 e640a907e38b7542af10b153d0b6de1503964536675835a0536043527c3a16b7 */

try {


(function () {
  var mq = window.matchMedia('(max-width: 479px)');
  var timer;
  function split() {
    document.querySelectorAll('.u-sub-purple sub').forEach(function (sub) {
      if (sub.dataset.uSubOrig == null) sub.dataset.uSubOrig = sub.innerHTML;
      else sub.innerHTML = sub.dataset.uSubOrig;
      if (!mq.matches) return;
      var text = (sub.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text) return;
      var words = text.split(' ');
      sub.innerHTML = '';
      var line = document.createElement('span');
      line.className = 'u-sub-line';
      sub.appendChild(line);
      words.forEach(function (word) {
        var prev = line.textContent;
        line.textContent = prev ? prev + ' ' + word : word;
        if (prev && line.getClientRects().length > 1) {
          line.textContent = prev;
          sub.appendChild(document.createElement('br'));
          line = document.createElement('span');
          line.className = 'u-sub-line';
          line.textContent = word;
          sub.appendChild(line);
        }
      });
    });
  }
  function run() {
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(split);
    else split();
  }
  function onResize() {
    clearTimeout(timer);
    timer = setTimeout(split, 50);
  }
  run();
  mq.addEventListener('change', split);
  window.addEventListener('resize', onResize);
})();


;

} catch (error) {

  console.error('[Pepper HOME-JS-023]', error);

}

/* END HOME-JS-023 */

/* START HOME-JS-024 | original SHA-256 21735cdeb07c82c7a0236e4b61ac3c129805c6a7ef97e59c0a7354fffc3dc98a */

try {


(function () {
  function drawDotGrid(root) {
    var canvas = root.querySelector("canvas");
    if (!canvas) return;

    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var rect = root.getBoundingClientRect();
    var width = Math.max(1, Math.floor(rect.width));
    var height = Math.max(1, Math.floor(rect.height));

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    var gap = parseFloat(root.getAttribute("data-gap")) || 24;
    var size = parseFloat(root.getAttribute("data-dot-size")) || 1.5;
    var color = root.getAttribute("data-color") || "#A39893";
    var opacity = parseFloat(root.getAttribute("data-opacity"));
    if (isNaN(opacity)) opacity = 0.4;

    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;

    // Match Figma: start near 0,0 and step by gap across the full area
    for (var y = 0; y <= height; y += gap) {
      for (var x = 0; x <= width; x += gap) {
        ctx.fillRect(x, y, size, size);
      }
    }

    ctx.globalAlpha = 1;
  }

  function initAll() {
    document.querySelectorAll(".pepper-table-grid").forEach(drawDotGrid);
  }

  var resizeTimer;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initAll, 50);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }

  window.addEventListener("resize", onResize);

  // Re-draw if Webflow Designer / interactions change layout
  if (typeof ResizeObserver !== "undefined") {
    document.querySelectorAll(".pepper-table-grid").forEach(function (el) {
      new ResizeObserver(initAll).observe(el);
    });
  }
})();


;

} catch (error) {

  console.error('[Pepper HOME-JS-024]', error);

}

/* END HOME-JS-024 */

/* START HOME-JS-025 | original SHA-256 698e6c0fca7d22c3347fb24233235a4df0ee26afd33c5393cd699f092fe5cc5b */

try {


(() => {
  function initSixSkew() {
    const section = document.querySelector('#sixth-section');
    if (!section || section.hasAttribute('data-six-skew')) return;
    if (!window.gsap) return;
    const stages = section.querySelectorAll('.u-aspect-width-tall');
    if (!stages.length) return;
    section.setAttribute('data-six-skew', '');

    const originals = new WeakMap();
    const media = gsap.matchMedia();
    const query = '(min-width: 992px) and (hover: hover)'
      + ' and (pointer: fine)'
      + ' and (prefers-reduced-motion: no-preference)';

    media.add(query, () => {
      const cleanups = [];
      const settings = [
        { selector: '.u-image-person', move: 3,
          time: 0.8 },
        { selector: '.u-image-calender', move: 5,
          time: 0.65 },
        { selector: '.u-image-dashboard', move: 7,
          time: 0.5 }
      ];

      stages.forEach((stage) => {
        const layers = settings.flatMap((setting) => {
          const image = stage.querySelector(setting.selector);
          if (!image) return [];
          if (!originals.has(image)) {
            const properties = ['transform', 'translate',
              'rotate', 'scale'];
            originals.set(image, properties.map((property) => ({
              property,
              value: image.style.getPropertyValue(property),
              priority: image.style.getPropertyPriority(property)
            })));
          }
          const base = {};
          const setters = {};
          ['x', 'y'].forEach((property) => {
            base[property] = +gsap.getProperty(image, property) || 0;
            setters[property] = gsap.quickTo(image, property, {
              duration: setting.time,
              ease: 'power3.out'
            });
          });
          return [{ ...setting, image, base, setters }];
        });
        if (!layers.length) return;

        const clamp = gsap.utils.clamp(-1, 1);
        const reset = () => {
          layers.forEach(({ base, setters }) => {
            Object.keys(setters).forEach((property) => {
              setters[property](base[property]);
            });
          });
        };

        const move = (event) => {
          if (event.pointerType === 'touch') return;
          const rect = stage.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          const x = clamp((event.clientX - rect.left)
            / rect.width * 2 - 1);
          const y = clamp((event.clientY - rect.top)
            / rect.height * 2 - 1);
          layers.forEach(({ base, setters, move }) => {
            setters.x(base.x + x * move);
            setters.y(base.y + y * move * 0.6);
          });
        };

        const visibility = () => {
          if (document.hidden) reset();
        };
        const observer = new IntersectionObserver(([entry]) => {
          if (!entry.isIntersecting) reset();
        });
        observer.observe(stage);
        stage.addEventListener('pointermove', move);
        stage.addEventListener('pointerleave', reset);
        stage.addEventListener('pointercancel', reset);
        window.addEventListener('blur', reset);
        document.addEventListener('visibilitychange', visibility);

        cleanups.push(() => {
          observer.disconnect();
          layers.forEach(({ image, setters }) => {
            Object.values(setters).forEach((set) => set.tween.kill());
            originals.get(image).forEach(({ property, value,
              priority }) => {
              if (value) image.style.setProperty(property,
                value, priority);
              else image.style.removeProperty(property);
            });
          });
          stage.removeEventListener('pointermove', move);
          stage.removeEventListener('pointerleave', reset);
          stage.removeEventListener('pointercancel', reset);
          window.removeEventListener('blur', reset);
          document.removeEventListener('visibilitychange', visibility);
        });
      });

      // GSAP also reverts its transforms when the query stops matching.
      return () => cleanups.forEach((cleanup) => cleanup());
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSixSkew);
  } else {
    initSixSkew();
  }
})();


;

} catch (error) {

  console.error('[Pepper HOME-JS-025]', error);

}

/* END HOME-JS-025 */

/* START HOME-JS-028 | original SHA-256 9e1a2e7edf3ddaec0f2eb3cad8b2a9f11e0da211adf8fc6d2d41b807839dc034 */

try {


(function () {
  function initPlatformTree() {
    const stage = document.querySelector(".platform_tree_wrap");
    if (!stage || stage.dataset.treeReady) return;

    const section = stage.closest("#info-section");
    const image = stage.querySelector(".platform_tree_img");
    const canvas = stage.querySelector(".platform_tree_canvas");
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!section || !image || !canvas || !gsap ||
        !ScrollTrigger || reduced) return;

    stage.dataset.treeReady = "true";
    gsap.registerPlugin(ScrollTrigger);

    const width = 1218;
    const height = 525;
    const context = canvas.getContext("2d");
    if (!context) return;

    const source = new Image();
    source.crossOrigin = "anonymous";
    source.onload = function () {
      const sample = document.createElement("canvas");
      sample.width = width;
      sample.height = height;
      const sampleContext = sample.getContext("2d", {
        willReadFrequently: true
      });
      if (!sampleContext) return;

      let pixels;
      try {
        sampleContext.drawImage(source, 0, 0, width, height);
        pixels = sampleContext.getImageData(
          0, 0, width, height
        ).data;
      } catch (error) {
        return;
      }

      const candidates = [];
      for (let y = 1; y < height; y += 2) {
        for (let x = 1; x < width; x += 2) {
          const index = (y * width + x) * 4;
          const red = pixels[index];
          const green = pixels[index + 1];
          const blue = pixels[index + 2];
          const alpha = pixels[index + 3];
          const brightness = Math.max(red, green, blue);
          const trunk = x > 575 && x < 685 && y > 335;
          if (alpha < 100 || brightness < (trunk ? 40 : 65)) {
            continue;
          }

          candidates.push({
            x: x,
            y: y,
            color: "rgb(" + red + "," + green + "," +
              blue + ")"
          });
        }
      }

      const limit = window.matchMedia("(max-width: 767px)")
        .matches ? 2200 : 5200;
      for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [
          candidates[j], candidates[i]
        ];
      }

      const particles = candidates.slice(0, limit).map(
        (point, index) => {
          const startX = Math.random() * width * 1.3 -
            width * 0.15;
          const startY = Math.random() * height * 1.35 -
            height * 0.22;
          const side = point.x < width / 2 ? -1 : 1;
          return {
            x: point.x,
            y: point.y,
            color: point.color,
            startX: startX,
            startY: startY,
            curveX: (startX + point.x) / 2 +
              side * (60 + Math.random() * 170),
            curveY: (startY + point.y) / 2 -
              60 - Math.random() * 130,
            delay: 0.04 + (1 - point.y / height) * 0.3 +
              Math.random() * 0.08,
            phase: Math.random() * Math.PI * 2,
            radius: 1.2 + Math.random() * 1.1,
            trail: index % 7 === 0,
            glow: index % 13 === 0
          };
        }
      );
      if (particles.length < 100) return;

      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const detailCanvas = document.createElement("canvas");
      detailCanvas.width = canvas.width;
      detailCanvas.height = canvas.height;
      const detailContext = detailCanvas.getContext("2d");
      if (!detailContext) return;
      detailContext.setTransform(ratio, 0, 0, ratio, 0, 0);
      for (const point of candidates.slice(limit)) {
        detailContext.fillStyle = point.color;
        detailContext.beginPath();
        detailContext.arc(
          point.x, point.y, 1.15, 0, Math.PI * 2
        );
        detailContext.fill();
      }
      const state = { progress: 0, charge: 0, hold: 0 };

      function draw() {
        context.clearRect(0, 0, width, height);
        if (state.progress > 0.82) {
          context.globalAlpha = Math.min(
            1, (state.progress - 0.82) / 0.18
          );
          context.drawImage(
            detailCanvas, 0, 0, width, height
          );
        }
        for (const particle of particles) {
          const raw = (state.progress - particle.delay) /
            (1 - particle.delay);
          const clamped = Math.max(0, Math.min(1, raw));
          const eased = clamped * clamped * clamped *
            (clamped * (clamped * 6 - 15) + 10);
          const inverse = 1 - eased;
          let x = inverse * inverse * particle.startX +
            2 * inverse * eased * particle.curveX +
            eased * eased * particle.x;
          let y = inverse * inverse * particle.startY +
            2 * inverse * eased * particle.curveY +
            eased * eased * particle.y;
          const drift = (1 - eased) * state.charge;
          x += Math.cos(particle.phase) * drift * 12;
          y += Math.sin(particle.phase) * drift * 8;

          if (particle.trail && eased > 0.06 &&
              eased < 0.98) {
            const back = Math.max(0, eased - 0.045);
            const backInverse = 1 - back;
            const backX = backInverse * backInverse *
              particle.startX +
              2 * backInverse * back * particle.curveX +
              back * back * particle.x;
            const backY = backInverse * backInverse *
              particle.startY +
              2 * backInverse * back * particle.curveY +
              back * back * particle.y;
            context.globalAlpha = 0.2 * (1 - eased);
            context.strokeStyle = particle.color;
            context.lineWidth = particle.radius * 0.7;
            context.beginPath();
            context.moveTo(backX, backY);
            context.lineTo(x, y);
            context.stroke();
          }

          if (particle.glow && eased > 0.35 &&
              eased < 0.94) {
            context.globalAlpha = Math.sin(eased * Math.PI) *
              0.12;
            context.fillStyle = particle.color;
            context.beginPath();
            context.arc(
              x, y, particle.radius * 3.2,
              0, Math.PI * 2
            );
            context.fill();
          }

          context.globalAlpha = 0.22 + eased * 0.78 +
            state.charge * 0.08 * (1 - eased);
          context.fillStyle = particle.color;
          context.beginPath();
          const radius = particle.radius *
            (1 + Math.sin(eased * Math.PI) * 0.38);
          context.arc(x, y, radius, 0, Math.PI * 2);
          context.fill();
        }
        context.globalAlpha = 1;
      }

      draw();
      gsap.set(image, {
        opacity: 0,
        scale: 1.018,
        transformOrigin: "50% 58%"
      });
      gsap.set(canvas, { opacity: 1 });

      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 78%",
          once: true
        }
      })
        .to(state, {
          charge: 1,
          duration: 0.42,
          ease: "sine.inOut",
          onUpdate: draw
        })
        .to(state, {
          progress: 1,
          charge: 0,
          duration: 2.8,
          ease: "none",
          onUpdate: draw
        }, "-=0.06")
        .to(state, {
          hold: 1,
          duration: 0.65,
          ease: "none"
        })
        .to(image, {
          opacity: 1,
          scale: 1,
          duration: 0.82,
          ease: "power2.out"
        })
        .to(canvas, {
          opacity: 0,
          duration: 0.82,
          ease: "power2.out"
        }, "<");
    };

    source.src = image.currentSrc || image.src;
  }

  if (document.readyState === "complete") {
    initPlatformTree();
  } else {
    window.addEventListener("load", initPlatformTree, {
      once: true
    });
  }
})();


;

} catch (error) {

  console.error('[Pepper HOME-JS-028]', error);

}

/* END HOME-JS-028 */

/* START HOME-JS-048 | original SHA-256 dfca26a736e7afb944c2839ba9f0141c49663d6295ab6acd4f7c8514d69d857d */

try {


(function () {
  var el = document.getElementById("u-mouse-move");
  if (!el) return;

  var mq = window.matchMedia("(min-width: 992px)");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var hover = window.matchMedia("(hover: hover)");

  var rot = 3.2;
  var skew = 0.7;
  var move = 6;
  var ease = 0.05;
  var tx = 0;
  var ty = 0;
  var cx = 0;
  var cy = 0;
  var raf = 0;
  var listening = false;

  function canRun() {
    return mq.matches && !reduce.matches && hover.matches;
  }

  function reset() {
    tx = ty = cx = cy = 0;
    el.style.transform = "";
    el.style.willChange = "";
    el.style.transformOrigin = "";
  }

  function onMove(e) {
    tx = (e.clientX / window.innerWidth) * 2 - 1;
    ty = (e.clientY / window.innerHeight) * 2 - 1;
  }

  function frame() {
    if (!canRun()) {
      raf = 0;
      reset();
      return;
    }

    cx += (tx - cx) * ease;
    cy += (ty - cy) * ease;
    el.style.transform =
      "perspective(1800px) translate3d(" +
      (cx * move).toFixed(2) + "px," +
      (cy * move * 0.55).toFixed(2) + "px,0) rotateX(" +
      (-cy * rot).toFixed(3) + "deg) rotateY(" +
      (cx * rot).toFixed(3) + "deg) skew(" +
      (cx * skew).toFixed(3) + "deg," +
      (cy * skew * 0.4).toFixed(3) + "deg)";
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (listening || !canRun()) return;
    listening = true;
    el.style.willChange = "transform";
    el.style.transformOrigin = "50% 38%";
    window.addEventListener("mousemove", onMove, { passive: true });
    if (!raf) raf = requestAnimationFrame(frame);
  }

  function stop() {
    if (!listening) return;
    listening = false;
    window.removeEventListener("mousemove", onMove);
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    reset();
  }

  function sync() {
    if (canRun()) start();
    else stop();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", sync);
  } else {
    sync();
  }

  mq.addEventListener("change", sync);
  reduce.addEventListener("change", sync);
})();


;

} catch (error) {

  console.error('[Pepper HOME-JS-048]', error);

}

/* END HOME-JS-048 */

/* START HOME-JS-050 | original SHA-256 f7b4da7a2ad2dd41582053dbf16cdd4c7101702f63a0421e12a0f3b7f5274486 */

try {


(() => {
  function initCircleLoop() {
    const section = document.querySelector('#one-section');
    if (!section) return;
    const names = [
      'one', 'four', 'two', 'three',
      'five', 'eight', 'six', 'seven'
    ];
    const found = [...section.querySelectorAll('[class]')]
      .filter((element) => [...element.classList].some((name) => {
        return name.startsWith('u-contentcircle-');
      }));
    const circles = names.map((name) => {
      return found.find((element) => {
        return element.classList.contains('u-contentcircle-' + name);
      });
    }).filter(Boolean);
    found.forEach((circle) => {
      if (!circles.includes(circle)) circles.push(circle);
    });
    if (!circles.length) return;
    const stage = circles[0].closest('.u-position-relative');
    if (!stage || stage.hasAttribute('data-circle-stage')) return;

    const desktop = matchMedia('(min-width: 992px)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const hold = 2400;
    const gap = 300;
    let index = 0;
    let phase = 'enter';
    let visible = false;
    let entered = false;
    let timer = 0;
    let deadline = 0;
    let remaining = 0;
    let scrollFrame = 0;
    let scrollListening = false;
    let travel = [];
    let motionReady = false;
    let settleTimer = 0;
    let hovered = null;

    // Mobile positions: left, top, width, height (% of circle).
    // Each row follows the existing logo DOM order.
    const mobileLogos = {
      one: [
        [52, 12, 20, 20], [18, 16, 20, 20],
        [18, 64, 20, 20], [62, 68, 20, 20]
      ],
      four: [
        [15, 15, 38, 16], [55, 25, 30, 14],
        [30, 73, 38, 16]
      ],
      two: [
        [25, 12, 20, 20], [65, 18, 20, 20],
        [28, 68, 20, 20]
      ],
      three: [
        [18, 12, 20, 20], [66, 16, 20, 20],
        [28, 71, 38, 16]
      ],
      five: [[27, 8, 20, 20], [60, 68, 20, 20]],
      eight: [[56, 68, 20, 20], [23, 12, 20, 20]],
      six: [
        [62, 64, 20, 20], [18, 64, 20, 20],
        [52, 10, 20, 20], [18, 16, 20, 20]
      ],
      seven: [
        [20, 16, 20, 20], [64, 60, 20, 20],
        [18, 64, 22, 22]
      ]
    };

    stage.setAttribute('data-circle-stage', '');
    circles.forEach((circle, i) => {
      const logos = [...circle.querySelectorAll('.u-logo-svg')];
      const wideLogos = logos.map((logo) => {
        return logo.offsetWidth / circle.clientWidth > 0.3;
      });
      circle.setAttribute('data-loop-circle', '');
      const slot = i % 4;
      circle.style.setProperty('--tablet-top',
        slot < 2 ? '4%' : '53%');
      circle.style.setProperty('--tablet-left',
        slot % 2 ? 'auto' : '5%');
      circle.style.setProperty('--tablet-right',
        slot % 2 ? '5%' : 'auto');
      const tops = i < 4 ? [11, 5, 63, 56] : [4, 10, 60, 57];
      circle.style.setProperty('--mobile-top', tops[slot] + '%');
      circle.style.setProperty('--mobile-left',
        slot % 2 ? 'auto' : '2%');
      circle.style.setProperty('--mobile-right',
        slot % 2 ? '2%' : 'auto');
      logos.forEach((logo, j) => {
        const wide = wideLogos[j];
        const key = names.find((name) => {
          return circle.classList.contains('u-contentcircle-' + name);
        });
        const fallback = [
          [18, 12, 20, 20], [62, 12, 20, 20],
          [18, 68, 20, 20], [62, 68, 20, 20]
        ];
        const layout = mobileLogos[key] || fallback;
        const [left, top, width, height] = layout[j]
          || fallback[j % fallback.length];
        logo.toggleAttribute('data-logo-wide', wide);
        logo.style.setProperty('--mobile-logo-width', width + '%');
        logo.style.setProperty('--mobile-logo-height', height + '%');
        logo.style.setProperty('--mobile-logo-left', left + '%');
        logo.style.setProperty('--mobile-logo-top', top + '%');
        logo.style.setProperty('--logo-delay', j * 60 + 'ms');
      });
    });

    // Both sticky navigation bars occupy the tablet viewport.
    const navigation = [...document.querySelectorAll(
      '.nav_component, .u-secondary-mainnav'
    )];
    let navHeight = -1;

    function measure() {
      const height = Math.ceil(navigation.reduce((total, element) => {
        return total + element.getBoundingClientRect().height;
      }, 0));
      if (height !== navHeight) {
        navHeight = height;
        stage.style.setProperty('--circle-nav-height', height + 'px');
      }
      travel = circles.map((circle, i) => {
        const x = circle.offsetLeft + circle.offsetWidth / 2
          - stage.clientWidth / 2;
        const y = circle.offsetTop + circle.offsetHeight / 2
          - stage.clientHeight / 2;
        const angle = x || y ? Math.atan2(y, x) : i * 2.4;
        const distance = Math.max(stage.clientWidth * 0.55,
          stage.clientHeight * 0.7);
        return {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance
        };
      });
      circles.forEach((circle) => {
        circle.querySelectorAll('.u-logo-svg').forEach((logo) => {
          const lx = circle.clientWidth / 2 - logo.offsetLeft
            - logo.offsetWidth / 2;
          const ly = circle.clientHeight / 2 - logo.offsetTop
            - logo.offsetHeight / 2;
          logo.style.setProperty('--logo-x', lx + 'px');
          logo.style.setProperty('--logo-y', ly + 'px');
        });
      });
      queueScroll();
    }

    function drawScroll() {
      scrollFrame = 0;
      const enabled = desktop.matches && !reduced.matches;
      const rect = stage.getBoundingClientRect();
      const progress = (innerHeight - rect.top)
        / (innerHeight + rect.height);
      const clamp = (value) => Math.max(0, Math.min(1, value));
      const entry = clamp(progress / 0.42);
      const exit = clamp((progress - 0.64) / 0.34);
      const amount = enabled ? 1 - entry + exit : 0;
      syncSettled(amount === 0, enabled);
      circles.forEach((circle, i) => {
        const offset = travel[i] || { x: 0, y: 0 };
        circle.style.setProperty('--scroll-x',
          (offset.x * amount).toFixed(2) + 'px');
        circle.style.setProperty('--scroll-y',
          (offset.y * amount).toFixed(2) + 'px');
      });
    }

    function syncSettled(atRest, animated) {
      if (!atRest) {
        clearTimeout(settleTimer);
        settleTimer = 0;
        motionReady = false;
        stage.removeAttribute('data-settled');
        pause();
        circles.forEach((circle) => {
          circle.removeAttribute('data-active');
        });
        return;
      }
      if (motionReady || settleTimer) return;
      const finish = () => {
        settleTimer = 0;
        motionReady = true;
        stage.setAttribute('data-settled', '');
        renderActive();
        resume();
      };
      if (animated) settleTimer = setTimeout(finish, 160);
      else finish();
    }

    function queueScroll() {
      if (!scrollFrame) {
        scrollFrame = requestAnimationFrame(drawScroll);
      }
    }

    function syncScroll() {
      const enabled = desktop.matches && !reduced.matches;
      if (enabled && !scrollListening) {
        window.addEventListener('scroll', queueScroll,
          { passive: true });
      } else if (!enabled && scrollListening) {
        window.removeEventListener('scroll', queueScroll);
      }
      scrollListening = enabled;
      queueScroll();
    }

    function showSet() {
      circles.forEach((circle, i) => {
        const shown = desktop.matches
          || (phase !== 'set-out'
            && Math.floor(i / 4) === Math.floor(index / 4));
        circle.toggleAttribute('data-in-set', shown);
        if (shown) circle.removeAttribute('aria-hidden');
        else circle.setAttribute('aria-hidden', 'true');
      });
    }

    // Share the existing CSS reveal with desktop hover.
    function renderActive() {
      const active = hovered || (phase === 'hold'
        ? circles[index] : null);
      circles.forEach((circle) => {
        circle.toggleAttribute('data-active',
          motionReady && circle === active);
      });
    }

    function clearHover() {
      if (!hovered) return;
      hovered = null;
      renderActive();
      resume();
    }

    circles.forEach((circle) => {
      circle.addEventListener('pointerenter', (event) => {
        if (!desktop.matches || event.pointerType === 'touch') {
          return;
        }
        pause();
        hovered = circle;
        renderActive();
      });
      const leave = () => {
        if (hovered === circle) clearHover();
      };
      circle.addEventListener('pointerleave', leave);
      circle.addEventListener('pointercancel', leave);
    });

    function activate() {
      circles[index].setAttribute('data-active', '');
      phase = 'hold';
      remaining = hold;
    }

    function tick() {
      timer = 0;
      if (phase === 'enter' || phase === 'gap'
        || phase === 'set-in') {
        activate();
      } else if (phase === 'hold') {
        circles[index].removeAttribute('data-active');
        phase = 'exit';
        remaining = gap;
      } else if (phase === 'set-out') {
        index = (index + 1) % circles.length;
        phase = 'set-in';
        showSet();
        remaining = desktop.matches ? gap
          : reduced.matches ? 0 : 560;
      } else {
        const next = (index + 1) % circles.length;
        const changingSet = !desktop.matches
          && Math.floor(next / 4) !== Math.floor(index / 4);
        if (changingSet) {
          circles.forEach((circle) => {
            circle.removeAttribute('data-in-set');
            circle.setAttribute('aria-hidden', 'true');
          });
          phase = 'set-out';
          remaining = reduced.matches ? 0 : 440;
        } else {
          index = next;
          showSet();
          phase = 'gap';
          remaining = gap;
        }
      }
      resume();
    }

    function resume() {
      if (timer || hovered || !visible
        || document.hidden || !motionReady) {
        return;
      }
      deadline = performance.now() + remaining;
      timer = setTimeout(tick, remaining);
    }

    function pause() {
      if (!timer) return;
      clearTimeout(timer);
      timer = 0;
      remaining = Math.max(0, deadline - performance.now());
    }

    function enter() {
      if (entered) return;
      entered = true;
      measure();
      remaining = 0;
    }

    showSet();
    measure();
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
        && entry.intersectionRatio >= 0.15;
      if (visible) {
        enter();
        resume();
      } else {
        pause();
      }
    }, { threshold: 0.15 });
    observer.observe(stage);
    const sizeObserver = new ResizeObserver(measure);
    sizeObserver.observe(stage);
    navigation.forEach((element) => sizeObserver.observe(element));
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) pause();
      else resume();
    });
    desktop.addEventListener('change', () => {
      clearHover();
      showSet();
      measure();
      syncScroll();
    });
    window.addEventListener('resize', measure, { passive: true });
    reduced.addEventListener('change', syncScroll);
    syncScroll();
    if (document.fonts) document.fonts.ready.then(measure);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCircleLoop);
  } else {
    initCircleLoop();
  }
})();


;

} catch (error) {

  console.error('[Pepper HOME-JS-050]', error);

}

/* END HOME-JS-050 */

/* START HOME-JS-052 | original SHA-256 8466982c78ba8cc3066f8f5c56c4ba9d7fb0556dc9da09371a5919da00002ab3 */

try {


  window.Webflow ||= [];

  window.Webflow.push(() => {
    document.querySelectorAll(".u-tab-swiper-block").forEach((component) => {
      if (component.dataset.scriptInitialized) return;

      const slider = component.querySelector(".u-tab-swiper");
      const wrapper = component.querySelector(".u-tab-swiper-wrapper");
      const pagination = component.querySelector(".u-swiper-bullets");

      if (!slider || !wrapper || !pagination || typeof Swiper === "undefined") {
        return;
      }

      component.dataset.scriptInitialized = "true";

      /*
       * Lumos Content Wrapper components insert .u-display-contents.
       * Swiper requires the wrapper and slides to be direct children.
       */
      if (wrapper.parentElement !== slider) {
        slider.appendChild(wrapper);
      }

      wrapper
        .querySelectorAll(".u-tab-swiperslide.swiper-slide")
        .forEach((slide) => {
          if (slide.parentElement !== wrapper) {
            wrapper.appendChild(slide);
          }
        });

      // Remove manually created bullets. Swiper generates these automatically.
      pagination.replaceChildren();

      new Swiper(slider, {
        slidesPerView: 1.15,
        spaceBetween: 16,
        speed: 600,
        grabCursor: true,
        watchOverflow: true,
        observer: true,
        observeParents: true,

        pagination: {
          el: pagination,
          clickable: true,
        },

        breakpoints: {
          0: {
            enabled: true,
          },
          992: {
            enabled: false,
          },
        },
      });
    });
  });
  

;

} catch (error) {

  console.error('[Pepper HOME-JS-052]', error);

}

/* END HOME-JS-052 */

/* START HOME-JS-053 | original SHA-256 7450afa929948591ee916667da85a1fa3442e81d2ef3f4808abf03e37356720c */

try {


  window.Webflow ||= [];

  window.Webflow.push(() => {
    const tabComponents = Array.from(
      document.querySelectorAll(".u-tab-home")
    );

    const visibilityBlocks = Array.from(
      document.querySelectorAll(".u-tab-swiper-block")
    );

    tabComponents.forEach((component, componentIndex) => {
      if (component.dataset.autoTabsInitialized) return;

      const links = Array.from(
        component.querySelectorAll(".u-tab-link.w-tab-link")
      );

      if (links.length < 2) return;

      component.dataset.autoTabsInitialized = "true";

      /*
       * Uses the corresponding swiper block as the visibility trigger.
       * Falls back to the Webflow Tabs component if no block is found.
       */
      const visibilityTarget =
        component.closest(".u-tab-swiper-block") ||
        visibilityBlocks[componentIndex] ||
        component;

      const duration = 8000;

      let activeIndex = links.findIndex((link) =>
        link.classList.contains("w--current")
      );

      if (activeIndex < 0) {
        activeIndex = 0;
      }

      let isInView = false;
      let startedAt = 0;
      let elapsedBeforePause = 0;
      let frameId;

      const getActiveIndex = () =>
        links.findIndex((link) =>
          link.classList.contains("w--current")
        );

      const resetProgress = () => {
        links.forEach((link) => {
          const progress = link.querySelector(".u-progress-inner");

          if (progress) {
            progress.style.width = "0%";
          }
        });
      };

      const restartCycle = (index) => {
        if (index === activeIndex) return;

        activeIndex = index;
        elapsedBeforePause = 0;
        startedAt = performance.now();
        resetProgress();
      };

      const activateNextTab = (time) => {
        const nextIndex = (activeIndex + 1) % links.length;
        const nextLink = links[nextIndex];

        activeIndex = nextIndex;
        elapsedBeforePause = 0;
        startedAt = time;
        resetProgress();

        /*
         * Non-bubbling activation keeps document-level
         * dropdown behavior unaffected.
         */
        nextLink.dispatchEvent(
          new MouseEvent("click", {
            bubbles: false,
            cancelable: true,
            view: window,
          })
        );
      };

      const update = (time) => {
        if (!isInView) return;

        const detectedIndex = getActiveIndex();

        /*
         * A different tab resets the timer.
         * Selecting the active tab produces no index change,
         * so its existing timer continues.
         */
        if (
          detectedIndex >= 0 &&
          detectedIndex !== activeIndex
        ) {
          restartCycle(detectedIndex);
        }

        const elapsed = Math.min(
          time - startedAt,
          duration
        );

        const percentage = elapsed / duration;
        const activeLink = links[activeIndex];
        const progress = activeLink?.querySelector(
          ".u-progress-inner"
        );

        if (progress) {
          progress.style.width = `${percentage * 100}%`;
        }

        if (elapsed >= duration) {
          activateNextTab(time);
        }

        frameId = requestAnimationFrame(update);
      };

      const play = () => {
        if (isInView) return;

        isInView = true;
        startedAt =
          performance.now() - elapsedBeforePause;

        frameId = requestAnimationFrame(update);
      };

      const pause = () => {
        if (!isInView) return;

        elapsedBeforePause = Math.min(
          performance.now() - startedAt,
          duration
        );

        isInView = false;
        cancelAnimationFrame(frameId);
      };

      /*
       * Watches Webflow's active-tab class instead of clicks.
       */
      const tabObserver = new MutationObserver(() => {
        const detectedIndex = getActiveIndex();

        if (
          detectedIndex >= 0 &&
          detectedIndex !== activeIndex
        ) {
          restartCycle(detectedIndex);
        }
      });

      links.forEach((link) => {
        tabObserver.observe(link, {
          attributes: true,
          attributeFilter: ["class"],
        });
      });

      /*
       * Autoplay runs only while the target section is visible.
       * Change 0.2 to adjust how much must be visible.
       */
      const visibilityObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            play();
          } else {
            pause();
          }
        },
        {
          threshold: 0.2,
        }
      );

      resetProgress();
      visibilityObserver.observe(visibilityTarget);
    });
  });
  

;

} catch (error) {

  console.error('[Pepper HOME-JS-053]', error);

}

/* END HOME-JS-053 */

/* START HOME-JS-055 | original SHA-256 a292e1daaee9fb67c7dcbf94704e079cacf4b690855dfbe9c93c8a325806bcb0 */

try {


  window.Webflow ||= [];

  window.Webflow.push(function () {
    if (typeof gsap === "undefined") {
      console.warn("Info animation: GSAP is not loaded.");
      return;
    }

    if (!window.matchMedia("(min-width: 62em)").matches) return;

    /*
     * On the published Pepper page,
     * info-section is an ID.
     */
    const section = document.querySelector("#info-section");

    if (!section) {
      console.warn("Info animation: #info-section was not found.");
      return;
    }

    const previewFunctions = [];

    document.querySelectorAll(".u-info-wrap").forEach(function (component) {
      if (component.dataset.infoGsapInitialized === "true") return;

      const trigger = component.querySelector(".u-link-info");
      const scaleContent = component.querySelector(".u-div_blockwrap");
      const opaqueContent = component.querySelector(".u-opaque-content");

      if (!trigger || !scaleContent || !opaqueContent) {
        console.warn(
          "Info animation: a required element is missing.",
          component
        );
        return;
      }

      component.dataset.infoGsapInitialized = "true";

      const triggerStyles = getComputedStyle(trigger);

      /*
       * Save the original Webflow colors.
       */
      const originalBackground = triggerStyles.backgroundColor;
      const originalColor = triggerStyles.color;

      const activeBackground = triggerStyles
        .getPropertyValue("--swatch--purple")
        .trim();

      const activeColor = triggerStyles
        .getPropertyValue("--swatch--purple-tint")
        .trim();

      let automaticPreviewActive = false;
      let previewTimer = null;

      /*
       * Inline original colors prevent the existing
       * Webflow :hover styling from conflicting with GSAP.
       */
      gsap.set(trigger, {
        backgroundColor: originalBackground,
        color: originalColor
      });

      gsap.set(scaleContent, {
        scale: 0,
        transformOrigin: "0% 0%",
        force3D: true
      });

      gsap.set(opaqueContent, {
        autoAlpha: 0
      });

      const timeline = gsap.timeline({
        paused: true
      });

      timeline
        /*
         * First, scale the wrapper from 0 to 1.
         */
        .to(scaleContent, {
          scale: 1,
          duration: 0.45,
          ease: "power2.out",
          force3D: true
        })

        /*
         * Only after scale reaches 1,
         * show the inside content.
         */
        .to(opaqueContent, {
          autoAlpha: 1,
          duration: 0.15,
          ease: "power1.out"
        })

        /*
         * Change the link colors together
         * with the inner content.
         */
        .to(
          trigger,
          {
            backgroundColor: activeBackground,
            color: activeColor,
            duration: 0.15,
            ease: "power1.out"
          },
          "<"
        );

      function openContent() {
        timeline.timeScale(1).play();
      }

      function closeContent() {
        if (automaticPreviewActive) return;

        timeline.timeScale(1.25).reverse();
      }

      function startAutomaticPreview() {
        automaticPreviewActive = true;

        if (previewTimer) {
          previewTimer.kill();
        }

        /*
         * Start the hover state from the beginning.
         */
        timeline.timeScale(1).restart();

        /*
         * Wait until it is completely open,
         * keep it open for 5 seconds,
         * and then always reverse.
         */
        previewTimer = gsap.delayedCall(
          timeline.duration() + 2,
          function () {
            automaticPreviewActive = false;
            timeline.timeScale(1.25).reverse();
          }
        );
      }

      /*
       * No click listener is added.
       */
      trigger.addEventListener("mouseenter", openContent);

      /*
       * It reverses only after leaving
       * the complete u-info-wrap.
       */
      component.addEventListener("mouseleave", closeContent);

      previewFunctions.push(startAutomaticPreview);
    });

    if (!previewFunctions.length) return;

    let automaticPreviewHasPlayed = false;

    const sectionObserver = new IntersectionObserver(
      function (entries) {
        const sectionIsVisible = entries.some(function (entry) {
          return entry.isIntersecting;
        });

        if (
          !sectionIsVisible ||
          automaticPreviewHasPlayed
        ) {
          return;
        }

        /*
         * Run the automatic preview only once.
         */
        automaticPreviewHasPlayed = true;
        sectionObserver.disconnect();

        previewFunctions.forEach(function (startPreview) {
          startPreview();
        });
      },
      {
        threshold: 0.1
      }
    );

    sectionObserver.observe(section);
  });
  

;

} catch (error) {

  console.error('[Pepper HOME-JS-055]', error);

}

/* END HOME-JS-055 */

/* START HOME-JS-056 | original SHA-256 7bd24bfad803b4f3841005ddf785b327546a878065df43c3d29afff9d87caeb7 */

try {


(function () {
  "use strict";

  window.Webflow ||= [];
  window.Webflow.push(function () {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const footer = document.querySelector(".footer_wrap");
    const bg = document.querySelector("#u-footer-bg");
    const absImage = document.querySelector(".u-footer-absimage");
    const trophies = gsap.utils.toArray(".u-image-trophy");

    if (!footer) return;

    const ease = "power1.out";
    const duration = 0.8;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (bg) gsap.set(bg, { clearProps: "all" });
      if (absImage) gsap.set(absImage, { clearProps: "all" });
      if (trophies.length) gsap.set(trophies, { clearProps: "all" });
      return;
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: footer,
        start: "top 95%",
        once: true
      }
    });

    if (bg) {
      tl.to(bg, {
        clipPath: "inset(0% 0% 0% 0%)",
        opacity: 1,
        duration,
        ease
      });
    }

    if (absImage) {
      tl.to(absImage, {
        width: "100%",
        opacity: 1,
        duration,
        ease
      });
    }

    if (trophies.length) {
      tl.to(trophies, {
        scale: 1,
        opacity: 1,
        duration,
        ease
      });
    }
  });
})();


;

} catch (error) {

  console.error('[Pepper HOME-JS-056]', error);

}

/* END HOME-JS-056 */

/* START HOME-JS-057 | original SHA-256 3d5d460f535cc6ac4e094664b904618fa230d7270a9eb6d9bd0f92241528a26e */

try {


(function () {
  "use strict";

  window.Webflow = window.Webflow || [];
  window.Webflow.push(function () {
    if (typeof gsap === "undefined") return;
    if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll(
        "#stagger-tag .u-tag-one, #stagger-tag .u-tag-two, #stagger-tag .u-tag-three, #stagger-tag .u-tag-four, #stagger-tag .u-tag-five, #stagger-tag .u-tag-six, #stagger-tag .u-tag-seven"
      ).forEach(function (el) {
        el.style.opacity = "1";
      });
      return;
    }

    /*
     * Matches CURRENT published markup:
     * - Tags keep data-reveal-tags on themselves (inside #stagger-tag)
     * - Nearby line has data-text-reveal or data-pop-up
     * Script finds the previous reveal/pop host for each tag, then
     * pops that tag when that host finishes.
     */

    var tags = Array.prototype.slice.call(
      document.querySelectorAll("#stagger-tag [data-reveal-tags]")
    );
    if (!tags.length) return;

    function findHost(tag) {
      var el = tag;
      while (el && el.id !== "stagger-tag") {
        var prev = el.previousElementSibling;
        while (prev) {
          if (prev.matches("[data-text-reveal], [data-pop-up]")) return prev;
          var nested = prev.querySelector("[data-text-reveal], [data-pop-up]");
          if (nested) return nested;
          prev = prev.previousElementSibling;
        }
        el = el.parentElement;
      }
      return null;
    }

    /* host element → tags that wait on it */
    var groups = [];
    var byHost = {};

    tags.forEach(function (tag) {
      var host = findHost(tag);
      if (!host) return;
      var key = groups.indexOf(host);
      if (key === -1) {
        key = groups.length;
        groups.push(host);
        byHost[key] = [];
      }
      byHost[key].push(tag);
    });

    tags.forEach(function (tag) {
      gsap.set(tag, {
        opacity: 0,
        scale: 0,
        transformOrigin: "center center"
      });
    });

    groups.forEach(function (host, key) {
      var groupTags = byHost[key];
      if (!groupTags || !groupTags.length) return;

      var played = false;

      function playTags() {
        if (played) return;
        played = true;
        gsap.to(groupTags, {
          opacity: 1,
          scale: 1,
          duration: 0.7,
          ease: "power2.out",
          stagger: 0.15,
          onComplete: function () {
            gsap.set(groupTags, { clearProps: "transform" });
          }
        });
      }

      function isReady() {
        var opacity = parseFloat(window.getComputedStyle(host).opacity);
        if (opacity >= 0.95) return true;

        /* data-pop-up uses scale — check matrix scale ≈ 1 */
        var t = window.getComputedStyle(host).transform;
        if (t && t !== "none" && opacity > 0.2) {
          var m = t.match(/matrix\(([^)]+)\)/);
          if (m) {
            var a = parseFloat(m[1].split(",")[0]);
            if (a >= 0.95) return true;
          }
        }
        return false;
      }

      function check() {
        if (played) return;
        if (isReady()) {
          playTags();
          return;
        }
        requestAnimationFrame(check);
      }

      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.create({
          trigger: host,
          start: "top 95%",
          once: true,
          onEnter: function () {
            requestAnimationFrame(check);
          }
        });
      } else {
        requestAnimationFrame(check);
      }
    });
  });
})();


;

} catch (error) {

  console.error('[Pepper HOME-JS-057]', error);

}

/* END HOME-JS-057 */

/* START HOME-JS-058 | original SHA-256 23598b65e2b003ac2c7cf5d58bcc9cda63d19b7b390b29e70185fbaf8f778d28 */

try {


(function () {
  "use strict";
  function wrapPhrase(el, phrase) {
    if (!el || el.closest(".u-highlight-text")) return false;
    if (el.querySelector(".u-rich-font")) return true;
    const needle = phrase.toLowerCase();
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement && node.parentElement.closest(".u-rich-font, .u-highlight-text")) continue;
      nodes.push(node);
    }
    return nodes.some(function (textNode) {
      const text = textNode.textContent;
      const index = text.toLowerCase().indexOf(needle);
      if (index === -1) return false;
      const matched = text.slice(index, index + phrase.length);
      const before = text.slice(0, index);
      const after = text.slice(index + phrase.length);
      const span = document.createElement("span");
      span.className = "u-rich-font";
      span.textContent = matched;
      const frag = document.createDocumentFragment();
      if (before) frag.appendChild(document.createTextNode(before));
      frag.appendChild(span);
      if (after) frag.appendChild(document.createTextNode(after));
      textNode.parentNode.replaceChild(frag, textNode);
      return true;
    });
  }
  function findTargets(hidden) {
    const item =
      hidden.closest(".u-resource-item") ||
      hidden.closest(".w-dyn-item") ||
      hidden.parentElement;
    if (!item) return [];
    const headings = Array.from(item.querySelectorAll("h2, h3"));
    if (headings.length) return headings;
    return Array.from(item.querySelectorAll("h2, h3, p, .u-text")).filter(
      function (el) {
        return !el.classList.contains("u-highlight-text") && !el.closest(".u-highlight-text");
      }
    );
  }
  function init() {
    const section = document.querySelector("#resource-home");
    if (!section) return;
    section.querySelectorAll(".u-highlight-text").forEach(function (hidden) {
      const phrase = hidden.textContent.replace(/\s+/g, " ").trim();
      if (!phrase) return;
      findTargets(hidden).some(function (el) {
        return wrapPhrase(el, phrase);
      });
    });
  }
  window.Webflow = window.Webflow || [];
  window.Webflow.push(init);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();


;

} catch (error) {

  console.error('[Pepper HOME-JS-058]', error);

}

/* END HOME-JS-058 */

/* START HOME-JS-059 | original SHA-256 c71ee4c5eb95f1e0a9bef249dac588e16009df66aa90d7e102d45f00278afced */

try {


(function () {
  "use strict";

  function syncResourceHomeNav(swiper, bullet) {
    if (!bullet) return;
    bullet.style.display = swiper.isLocked ? "none" : "";
  }

  function initResourceHomeSwiper() {
    const section = document.querySelector("#resource-home");
    if (!section || typeof Swiper === "undefined") return;

    section.querySelectorAll(".u-reource-wrap").forEach(function (component) {
      if (component.dataset.resourceHomeSwiperInit === "true") return;

      const slider = component.querySelector(".u-resource-collection");
      const wrapper = component.querySelector(".u-resource-list");
      const prev = component.querySelector(".u-resource-prev");
      const next = component.querySelector(".u-resource-next");
      const bullet = component.querySelector(".u-resource-bullet");

      if (!slider || !wrapper) return;

      component.dataset.resourceHomeSwiperInit = "true";

      if (wrapper.parentElement !== slider) {
        slider.appendChild(wrapper);
      }

      wrapper.querySelectorAll(".u-resource-item.swiper-slide").forEach(function (slide) {
        if (slide.parentElement !== wrapper) {
          wrapper.appendChild(slide);
        }
      });

      new Swiper(slider, {
        slidesPerView: 1.25,
        spaceBetween: 16,
        speed: 600,
        grabCursor: true,
        watchOverflow: true,
        observer: true,
        observeParents: true,
        navigation: {
          prevEl: prev,
          nextEl: next
        },
        breakpoints: {
          480: {
            slidesPerView: 1.5
          },
          768: {
            slidesPerView: 2.5
          },
          992: {
            slidesPerView: 3
          }
        },
        on: {
          init: function (swiper) {
            syncResourceHomeNav(swiper, bullet);
          },
          resize: function (swiper) {
            syncResourceHomeNav(swiper, bullet);
          },
          breakpoint: function (swiper) {
            syncResourceHomeNav(swiper, bullet);
          },
          lock: function (swiper) {
            syncResourceHomeNav(swiper, bullet);
          },
          unlock: function (swiper) {
            syncResourceHomeNav(swiper, bullet);
          }
        }
      });
    });
  }

  window.Webflow = window.Webflow || [];
  window.Webflow.push(initResourceHomeSwiper);
})();


;

} catch (error) {

  console.error('[Pepper HOME-JS-059]', error);

}

/* END HOME-JS-059 */

/* START HOME-JS-060 | original SHA-256 629a39f4307c4199639952b45f68eb340898355d60b2a47cfac801b9f78446f7 */

try {


  window.Webflow = window.Webflow || [];

  window.Webflow.push(function () {
    const root = document.getElementById("tango");

    if (!root || root.dataset.tangoSwiperV3 === "true") return;
    if (typeof Swiper === "undefined") return;

    const links = root.querySelector(".u-swiper-linkwrap");
    const cards = root.querySelector(".u-swiper-contentwrap");
    const linkTrack = links?.querySelector(".u-swiper-desktoplist");
    const cardTrack = cards?.querySelector(".u-swiper-contentlist");
    const pagination = root.querySelector(".u-home-swiperbullets");

    if (!links || !cards || !linkTrack || !cardTrack) return;

    if (links.swiper || cards.swiper) {
      console.warn("Tango: remove the old Tango script and reload the page.");
      return;
    }

    /*
     * Fix the Lumos slot nesting:
     *
     * container > track > individual slides
     *
     * Wrappers INSIDE individual slides remain untouched.
     */
    function unwrapSlots(parent) {
      Array.from(parent.children).forEach(function (child) {
        if (!child.classList.contains("u-display-contents")) return;

        unwrapSlots(child);
        child.replaceWith(...Array.from(child.childNodes));
      });
    }

    [links, cards, linkTrack, cardTrack].forEach(unwrapSlots);

    const tabs = Array.from(linkTrack.children).filter(function (element) {
      return element.classList.contains("u-desktop-content");
    });

    const slides = Array.from(cardTrack.children).filter(function (element) {
      return element.classList.contains("u-swiper-slide");
    });

    if (!slides.length || tabs.length !== slides.length) {
      console.error("Tango: expected matching text and image slides.");
      return;
    }

    [linkTrack, cardTrack].forEach(function (track) {
      track.classList.add("swiper-wrapper");
    });

    [...tabs, ...slides].forEach(function (slide) {
      slide.classList.add("swiper-slide");
    });

    const captions = Array.from(
      root.querySelectorAll(".u-tango-contenttab")
    );

    const fills = tabs.map(function (tab) {
      return tab.querySelector(".u-progress-inner");
    });

    /*
     * Save inline Webflow styles so breakpoint changes can restore them.
     */
    const originalStyles = new Map();

    [
      links,
      cards,
      linkTrack,
      cardTrack,
      ...tabs,
      ...slides,
      ...captions
    ].forEach(function (element) {
      originalStyles.set(element, element.getAttribute("style"));
    });

    const desktop = window.matchMedia("(min-width: 992px)");

    let textSwiper = null;
    let imageSwiper = null;
    let selected = 0;

    function progress(index, fraction) {
      const percent = Math.max(0, Math.min(1, fraction)) * 100;

      fills.forEach(function (fill, i) {
        if (!fill) return;

        fill.style.setProperty("transition", "none", "important");
        fill.style.setProperty(
          "width",
          (i === index ? percent : 0) + "%",
          "important"
        );
      });
    }

    function sync(swiper) {
      selected = swiper.realIndex;

      if (textSwiper && textSwiper.activeIndex !== selected) {
        textSwiper.slideTo(selected, swiper.params.speed);
      }

      tabs.forEach(function (tab, i) {
        tab.classList.toggle("is-active", i === selected);
        tab.inert = desktop.matches && i !== selected;
      });

      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === selected);
        slide.inert = desktop.matches && i !== selected;
      });

      progress(selected, 0);
    }

    function build() {
      if (imageSwiper) {
        selected = imageSwiper.realIndex;
        imageSwiper.destroy(true, true);
        imageSwiper = null;
      }

      if (textSwiper) {
        textSwiper.destroy(true, true);
        textSwiper = null;
      }

      originalStyles.forEach(function (style, element) {
        if (style === null) {
          element.removeAttribute("style");
        } else {
          element.setAttribute("style", style);
        }
      });

      const isDesktop = desktop.matches;

      // Use your existing Webflow spacing for the mobile cards.
      const gap =
        parseFloat(getComputedStyle(cardTrack).columnGap) || 0;

      // Required Swiper layout mechanics.
      [links, cards].forEach(function (container) {
        container.style.minWidth = "0";
        container.style.overflow = "clip";
        container.style.position = "relative";
      });

      [linkTrack, cardTrack].forEach(function (track) {
        track.style.setProperty("display", "flex", "important");
        track.style.setProperty("flex-flow", "row nowrap", "important");
        track.style.setProperty("gap", "0", "important");
        track.style.width = "100%";
      });

      [...tabs, ...slides].forEach(function (slide) {
        slide.style.flexShrink = "0";
        slide.style.minWidth = "0";
      });

      if (isDesktop) {
        // Hide the duplicate captions below desktop images.
        captions.forEach(function (caption) {
          caption.style.setProperty("display", "none", "important");
        });

        textSwiper = new Swiper(links, {
          initialSlide: selected,
          slidesPerView: 1,
          effect: "fade",
          fadeEffect: {
            crossFade: true
          },
          speed: 600,
          allowTouchMove: false,
          autoHeight: true
        });
      } else {
        links.style.setProperty("display", "none", "important");
      }

      /*
       * One autoplay timer controls both desktop Swipers.
       * On mobile, only the image/card Swiper is initialized.
       */
      imageSwiper = new Swiper(cards, {
        init: false,
        initialSlide: selected,
        speed: 600,

        effect: isDesktop ? "fade" : "slide",
        fadeEffect: {
          crossFade: true
        },

        slidesPerView: isDesktop ? 1 : 1.25,
        slidesPerGroup: 1,
        spaceBetween: isDesktop ? 0 : gap,

        breakpoints: isDesktop
          ? {}
          : {
              768: {
                slidesPerView: 1.5
              }
            },

        loop: !isDesktop && slides.length >= 3,
        rewind: isDesktop || slides.length < 3,

        allowTouchMove: !isDesktop,
        grabCursor: !isDesktop,
        watchSlidesProgress: true,

        autoplay: {
          delay: 8000,
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
          waitForTransition: false
        },

        pagination: pagination
          ? {
              el: pagination,
              clickable: true
            }
          : false,

        on: {
          init: sync,
          realIndexChange: sync,

          autoplayTimeLeft: function (swiper, milliseconds, remaining) {
            if (desktop.matches) {
              progress(swiper.realIndex, 1 - remaining);
            }
          }
        }
      });

      imageSwiper.init();
    }

    build();

    // Rebuild when switching between desktop fade and mobile slide.
    desktop.addEventListener("change", build);

    root.dataset.tangoSwiperV3 = "true";
  });
  

;

} catch (error) {

  console.error('[Pepper HOME-JS-060]', error);

}

/* END HOME-JS-060 */
})();
