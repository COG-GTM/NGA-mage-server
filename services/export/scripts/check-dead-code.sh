#!/usr/bin/env bash
# Dead-code check for the export extraction.  Lists every source file outside
# the in-process export module itself that still imports it.  After the move
# the only permitted importer is service/src/app.ts (the feature-flag wiring),
# so that removing the module after the dormant period is a two-file change.
# Run from the repository root.  Exit code 0 means no unexpected importers.
set -u
cd "$(dirname "$0")/../../.."
pattern="app\.impl/exports/app\.impl\.exports|app\.impl\.exports"
allow='^service/src/app\.ts$|^service/src/app\.impl/exports/'
echo "== importers of service/src/app.impl/exports (excluding the module itself)"
importers=$(grep -rlE "$pattern" service/src plugins --include='*.ts' --include='*.js' 2>/dev/null | grep -v node_modules | grep -vE '^service/src/app\.impl/exports/' | sort)
echo "${importers:-<none>}"
echo "== importers outside the allow list ($allow)"
unexpected=$(echo "$importers" | grep -vE "$allow" | grep -v '^$')
echo "${unexpected:-<none>}"
echo "== tests exercising the module (informational)"
grep -rlE "$pattern" service/test --include='*.ts' | sort
if [ -n "$unexpected" ]; then
  echo "FAILED: unexpected importers of the in-process export module"; exit 1
fi
echo "OK: only the feature-flag wiring in service/src/app.ts imports the in-process export module"
