# MAGE modernization proof dossier

**Public, synthetic-data, isolated local demonstration — 7 November 2026.**
Prepared for the Koniag Air Force team: Koniag as proposed prime; Cognition as
engineering enablement. This is neither APEX source code nor federal contract
performance, agency endorsement, production deployment, cATO, classified
authorization or whole-monolith retirement evidence.

## Artifact index

- [Measured SOO 5.5 KPI report](evidence/KPI-REPORT.md)
- [Machine-readable KPI data](evidence/kpi.json) and [raw events](evidence/events.ndjson)
- [108 REST assertions](evidence/assertions.json) and [test/build output excerpts](evidence/test-output.txt)
- [Public DeepWiki export](evidence/deepwiki-export.md), [generation result](evidence/deepwiki-generation.json)
- [Public migration-docs export — all 157 findings](evidence/migration-docs-export.md)
- [Executed retirement importer gate](evidence/retirement-gate.log)
- [Reproduction commands and release/deprecation gates](../../services/export/proof/README.md)
- [Extraction PR #1](https://github.com/COG-GTM/NGA-mage-server/pull/1)
- [Focused proof follow-up PR #2](https://github.com/COG-GTM/NGA-mage-server/pull/2)
- [Evidence checksums](evidence/SHA256SUMS)

The native discovery links below require Devin access. The exported evidence and
source links in this dossier are in the public repository and do not require a
Devin account. Exports are point-in-time discovery output, not guaranteed complete
inventories or migration plans. Generated source links may be incomplete; use the
engineer-checked source map below for the demonstrated slice.

## Source and discovery provenance

| Item | Recorded value / qualification |
|---|---|
| Public codebase | [COG-GTM/NGA-mage-server](https://github.com/COG-GTM/NGA-mage-server), public fork of [ngageoint/mage-server](https://github.com/ngageoint/mage-server) |
| Stack | TypeScript/Node.js, Express, MongoDB/Mongoose, Angular; containerized service packaging. N-tier/monolithic backend, not a mainframe or APEX application. |
| Default branch observed during discovery | `develop`, [b3c7cb5bdb0bd4552a0e80844d73d9ec56c84a01](https://github.com/COG-GTM/NGA-mage-server/commit/b3c7cb5bdb0bd4552a0e80844d73d9ec56c84a01) |
| Actual DeepWiki | [Native wiki](https://devin-gtm.devinenterprise.com/wiki/COG-GTM/NGA-mage-server); regeneration completed in this session, native result reports 196 seconds. Exported content is available above. |
| Actual migration-docs | [Native scan](https://devin-gtm.devinenterprise.com/code-scan/297683f5856041e28b46cf6ff133ab19/summary), `scan-297683f5856041e28b46cf6ff133ab19`; existing completed run reused, 157 findings dated 5 November. Refresh requested this session returned “No new commits since scan … last ran; nothing to scan.” |
| Scan configuration | `migration-docs`, Normal effort; verified existing profile `csprof-ca2a17582b03420cbcdc7ac6ccf55de2`; `service/src`; excludes `service/test/**`, `web-app/**`, `**/*.spec.ts`, `**/node_modules/**`, `**/dist/**`, `**/*.min.js`. |
| Native index SHA limitation | Native DeepWiki/scan responses did not expose an attested indexed source SHA. The observed default-branch SHA is **not** an assertion of exact index revision. Do not describe either service as attesting the extraction branch. |
| Runtime source | [a17c6feaeb709df03e75d1847f44a618995dcfc3](https://github.com/COG-GTM/NGA-mage-server/commit/a17c6feaeb709df03e75d1847f44a618995dcfc3), the existing extraction, unchanged by this proof work. |
| Primary harness | [289b0aa6d947db4c4e4fc4c0c7b4b5aa11af169b](https://github.com/COG-GTM/NGA-mage-server/commit/289b0aa6d947db4c4e4fc4c0c7b4b5aa11af169b); clean worktree; Node v24.19.0. |
| Exporter container | `mage-export-proof:a17c6fe`, image ID `sha256:33695febd96e7d168c9158aefd21ce11998cdfaf8c7e9feac840d7017fb469b9`; locally built/run, not published. |

**Engineer validation matters.** The scan profile contained stale `service/src/export`
path guidance. The actual module is `service/src/app.impl/exports/`; the public
routes are in `service/src/adapters/exports/adapters.exports.controllers.web.ts`.
A DeepWiki answer also generalized the route/module layout incorrectly. We used
actual source, not those generated descriptions, to define the boundary and tests.
Scan severity labels describe generated findings; this was not a security scan,
vulnerability attestation or authorization review.

## Bounded extraction and source map

The API retains authentication, event permissions, export descriptors and user-facing
URLs. `MAGE_EXPORT_SERVICE_URL` chooses an HTTP-backed engine; without it the
in-process path remains. A required internal shared token protects the exporter.
The service is separately containerized but shares MongoDB, filesystem stores and
MAGE adapters; it is **not independent data ownership or a fully decoupled estate**.

| Claim | Stable source evidence |
|---|---|
| MAGE public purpose and components | [Repository README](https://github.com/COG-GTM/NGA-mage-server/blob/b3c7cb5bdb0bd4552a0e80844d73d9ec56c84a01/README.md), [service package](https://github.com/COG-GTM/NGA-mage-server/blob/b3c7cb5bdb0bd4552a0e80844d73d9ec56c84a01/service/package.json) |
| Feature-flag seam and retained legacy factory | [service/src/app.ts, initExportsAppLayer](https://github.com/COG-GTM/NGA-mage-server/blob/a17c6feaeb709df03e75d1847f44a618995dcfc3/service/src/app.ts#L898-L992) |
| Public event/export routes and per-user retrieval/deletion | [Controller](https://github.com/COG-GTM/NGA-mage-server/blob/a17c6feaeb709df03e75d1847f44a618995dcfc3/service/src/adapters/exports/adapters.exports.controllers.web.ts), [mounts](https://github.com/COG-GTM/NGA-mage-server/blob/a17c6feaeb709df03e75d1847f44a618995dcfc3/service/src/app.ts#L1398-L1406) |
| Remote engine and shared-token protocol | [Remote adapter](https://github.com/COG-GTM/NGA-mage-server/blob/a17c6feaeb709df03e75d1847f44a618995dcfc3/service/src/app.impl/exports/app.impl.exports.remote.ts), [protocol](https://github.com/COG-GTM/NGA-mage-server/blob/a17c6feaeb709df03e75d1847f44a618995dcfc3/services/export/src/protocol.ts), [server](https://github.com/COG-GTM/NGA-mage-server/blob/a17c6feaeb709df03e75d1847f44a618995dcfc3/services/export/src/server.ts) |
| Container and remaining data coupling | [Dockerfile](https://github.com/COG-GTM/NGA-mage-server/blob/a17c6feaeb709df03e75d1847f44a618995dcfc3/services/export/Dockerfile), [repositories](https://github.com/COG-GTM/NGA-mage-server/blob/a17c6feaeb709df03e75d1847f44a618995dcfc3/services/export/src/repositories.ts) |
| Richer characterization fixtures and both engines | [Characterization directory](https://github.com/COG-GTM/NGA-mage-server/tree/a17c6feaeb709df03e75d1847f44a618995dcfc3/service/test/app/exports/characterization) |
| Executed off/on, recovery and rollback | [Runtime exercise](https://github.com/COG-GTM/NGA-mage-server/blob/289b0aa6d947db4c4e4fc4c0c7b4b5aa11af169b/services/export/proof/execute.cjs), [process/event harness](https://github.com/COG-GTM/NGA-mage-server/blob/289b0aa6d947db4c4e4fc4c0c7b4b5aa11af169b/services/export/proof/harness.cjs) |
| Metric definitions, rejection rules and null unknowns | [Generator](https://github.com/COG-GTM/NGA-mage-server/blob/289b0aa6d947db4c4e4fc4c0c7b4b5aa11af169b/services/export/proof/report.py#L22-L118), [10 generator tests](https://github.com/COG-GTM/NGA-mage-server/blob/289b0aa6d947db4c4e4fc4c0c7b4b5aa11af169b/services/export/proof/test_report.py) |

## Executed acceptance and deprecation decision

The primary run used a real temporary MongoDB process and authenticated API-created
synthetic data: one observation and one location. Four formats—CSV, GeoJSON, KML,
GeoPackage—completed in the flag-off, delegated, recovered and rollback states.
All **108 assertions passed**. ZIP entry contents were compared rather than archive
container timestamps; GeoPackage schema/rows/binary data were compared after
normalizing only export-time `gpkg_contents.last_change` and row ordering.

Permission/token failures, malformed requests, missing-token startup, a deliberate
exporter outage, archive cleanup and API isolation were exercised. Recovery used
new jobs; failed jobs stayed Failed. Rollback stopped the exporter, cleared its
flag/token, restarted the API, and reproduced the same four formats from persisted
data. This is an executed **local rollback**, not a production cutover.

**Retirement decision: retain the legacy module and both paths.** The static
importer gate found only the allowed composition import in `service/src/app.ts`.
That does not inventory dynamic/plugin consumers. No module was removed, no
90-day stability period occurred, and no operational monolith was retired.

Future gates: representative traffic/attachment testing; readiness/draining and
crash consistency; TLS and token lifecycle; multi-instance/data ownership decisions;
consumer inventory; contract/version sunset communications; an agreed stability
window; and government/operator go/no-go with rollback retention. The
[release/deprecation gate table](../../services/export/proof/README.md#bounded-deprecation-decision-and-release-gates)
assigns those future decisions explicitly.

Other results: service suite **1,351 passing, 55 pending**; **10 KPI-generator tests**;
transform parity passed; Docker image built. The 55 pending tests are not passes.
No browser/UI verification was performed: this follow-up is backend-only and uses
authenticated REST, real MongoDB and container processes.

A review-found provenance edge case was fixed in
[21d58c495e731e6740ca9bc06030b184cf01c881](https://github.com/COG-GTM/NGA-mage-server/commit/21d58c495e731e6740ca9bc06030b184cf01c881):
capture checkout cleanliness before creating evidence files. A separate full
container replay with an unignored in-checkout output directory passed 108 checks
and recorded the correct clean starting state. The primary run used an external
directory and was unaffected; **do not pool the replay with the primary KPIs**.

## SOO 5.5 — measured, missing, and proposed

Primary observation: **2026-11-07T21:07:06.873Z–21:07:38.279Z**, **31.406 seconds**.

| Metric | Observed result and denominator |
|---|---|
| Local release transitions | **3 in this one window**: baseline, cutover, rollback, each accepted by four completed/downloaded authenticated exports. Not production deployments; no daily extrapolation. |
| Local change lead time | **184,316.729 seconds**, one unique runtime revision, commit timestamp to first verified local deployment. Includes about two days of idle time; not coding speed or labor savings. |
| Controlled demo MTTR | **4.897 seconds**, one intentional incident, first observed Failed authenticated export to all four fresh exports downloaded and reconciled after restart. Includes a scripted two-second isolation check. Not production MTTR. |
| Manual labor saved / mission efficiency | **not observed/not measurable**; no matched manual baseline, touch-time, rework or operational mission outcomes. |
| Production deployments / production MTTR / sprint velocity | **not observed/not measurable**; no production or sprint telemetry. |

The raw-event SHA-256 is
`f03deea34d521039861617ea13171bc17ca50999e27268ff54cd114d3bd8b93a`.
The generator verifies complete event boundaries and assertions, derives its
counts/durations from events, and preserves unavailable measurements as JSON
`null` with reasons. It does not infer deployments from PRs or commits.

The [demonstration backlog/release gates](../../services/export/proof/README.md#demonstration-backlog-and-release-plan-not-sprint-velocity)
show actual proof work and deferred dependencies. They are **not** a government
agile board, committed sprint/release schedule or velocity chart. Real-time
government access, continuous product-health telemetry, longitudinal automated
reports and historical velocity are unavailable. This demonstrates a reporting
mechanism and bounded evidence, **not full SOO 5.5 fulfillment**.

For an actual program, Koniag and the Government would agree operational baselines,
task cohorts, quality/rework measures, deployment boundaries and incident clocks;
Cognition would instrument those agreed sources. Those are proposed next steps,
not results from this demonstration.

## Suggested short inserts — public proof, not past performance

**S8 — decomposition.** “As a public-code engineering demonstration, Cognition
used DeepWiki and the migration-docs scan, checked the outputs against source,
and reused a bounded export-service extraction from the public NGA MAGE fork.
The containerized path passed characterization and authenticated four-format
equivalence checks behind a reversible feature flag. It retains shared database,
storage and adapter dependencies; it is not APEX code, independent data ownership
or evidence of a completed federal modernization contract.”

**S9 — graceful deprecation.** “The MAGE demonstration executed flag-on cutover,
a controlled outage/recovery and flag-off rollback against the same synthetic
data, with four-format reconciliation. The retirement decision is to retain both
paths pending consumer inventory, operational stabilization and government/operator
approval. It demonstrates rollback discipline, not production legacy retirement.”

**S7 / SOO 5.5 — measurement.** “The proof includes a reproducible KPI generator,
timestamped raw events and explicit denominators. Its three local release
transitions, idle-inclusive commit-to-local-deployment lead time and one deliberate
recovery sample demonstrate instrumentation—not production delivery performance.
Labor savings, mission efficiency, production MTTR and velocity remain ‘not
observed/not measurable.’ Under Koniag's prime delivery governance, Cognition would
instrument Government-agreed baselines and operational sources before claiming
improvement.”

## Recompute the published report

```sh
python3 services/export/proof/report.py docs/proof/evidence/events.ndjson --output /path/to/new-output
python3 -m unittest discover -s services/export/proof -p 'test_*.py' -v
(cd docs/proof/evidence && sha256sum -c SHA256SUMS)
```

The [full reproduction guide](../../services/export/proof/README.md) contains
install/build/container/execution commands. The public distroless build-argument
substitution is a local demo choice, not an approved government image. No merge
or public deployment was performed. Only code and selected public/synthetic
evidence are published in this repository.
