#!/bin/sh
set -e
ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
mkdir -p "$ROOT/src" "$ROOT/dist"
cp "$ROOT/js/config.js" "$ROOT/src/config.js"
cp "$ROOT/js/global-presence.js" "$ROOT/src/global-presence.js"
cp "$ROOT/data/land-pixels.js" "$ROOT/src/land-pixels.js"

if command -v npx >/dev/null 2>&1; then
  npx --yes terser@5.31.0 "$ROOT/src/config.js" -c -m -o "$ROOT/dist/config.min.js"
  npx --yes terser@5.31.0 "$ROOT/src/global-presence.js" -c -m -o "$ROOT/dist/global-presence.min.js"
else
  cp "$ROOT/src/config.js" "$ROOT/dist/config.min.js"
  cp "$ROOT/src/global-presence.js" "$ROOT/dist/global-presence.min.js"
fi
cp "$ROOT/src/land-pixels.js" "$ROOT/dist/land-pixels.min.js"
echo "Wrote src/ and dist/"
