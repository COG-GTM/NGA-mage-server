#!/usr/bin/env bash
# Confirms the extracted export transforms in services/export/src/transforms are
# identical to the in-process copies in service/src/app.impl/exports apart from
# their import paths.  Run from the repository root.  Exit code 0 means parity.
set -u
cd "$(dirname "$0")/../../.."
status=0
normalize() {
  sed -e "s#'\.\./\.\./entities/#'@ngageoint/mage.service/lib/entities/#g" \
      -e "s#'\.\./\.\./models/icon'#'@ngageoint/mage.service/lib/models/icon'#g" \
      -e "s#'\./app\.impl\.exports'#'./index'#g" "$1"
}
for f in csv geojson kml geopackage; do
  if diff -u <(normalize service/src/app.impl/exports/app.impl.exports.$f.ts) services/export/src/transforms/$f.ts > /tmp/export-parity-$f.diff; then
    echo "parity OK: app.impl.exports.$f.ts == services/export/src/transforms/$f.ts"
  else
    echo "parity FAILED: app.impl.exports.$f.ts != services/export/src/transforms/$f.ts"; cat /tmp/export-parity-$f.diff; status=1
  fi
done
exit $status
