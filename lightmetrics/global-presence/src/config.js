/**
 * Technical / visual settings only.
 * Regions and countries come from Webflow CMS data attributes.
 */
(function (global) {
  "use strict";

  var ROTATION_PERIOD = 52;

  global.GLOBAL_PRESENCE_SETTINGS = {
    globeRadius: 1,
    pixelSize: 0.0146,
    geoGridSize: 1.2,
    rotationPeriod: ROTATION_PERIOD,
    rotationSpeed: (Math.PI * 2) / ROTATION_PERIOD,
    colors: {
      inactive: "#E4E4E4",
      secondary: "#B0B0B0",
      active: "#A000A0",
      background: "#FFFFFF",
    },
    transitionDuration: 0.72,
    activeThreshold: 0.72,
    hysteresis: 0.055,
    cameraZoom: 2.26,
    tilt: -0.1,
    tickCount: 144,
    maxPixelRatio: 2,
    countryCountSuffix: "+",
  };
})(window);
