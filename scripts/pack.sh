#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/dist"
mkdir -p "$OUT"
ZIP="$OUT/kouqiang-tujian.zip"
rm -f "$ZIP"
# Exclude preview PNGs and the zip output itself
(
  cd "$ROOT"
  zip -r "$ZIP" . \
    -x "./dist/*" \
    -x "./preview/*" \
    -x "./.git/*" \
    -x "./**/.DS_Store"
)
echo "Wrote $ZIP ($(du -h "$ZIP" | awk '{print $1}'))"
