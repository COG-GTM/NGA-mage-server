# Export decomposition proof

This is an **isolated local public-code demonstration**, not APEX source code,
federal contract performance, a production retirement, cATO, or a classified
deployment. It extends [extraction PR #1](https://github.com/COG-GTM/NGA-mage-server/pull/1)
rather than implementing a second extraction. The runtime scripts adapt the
previous PR's attached REST harness into a portable, unattended, event-producing
exercise. There is no new UI.

## Reproduce (Linux, Node 24, npm 10+, Python 3, Docker)

From the repository root, install/build the real service and exporter:

```sh
(cd service && npm ci && npm run build)
(cd services/export && npm ci && npm link ../../service && npm run build)
(cd service && npm run ci:test)
python3 -m unittest discover -s services/export/proof -p 'test_*.py' -v
bash services/export/scripts/check-parity.sh
```

Optional container build (the private Iron Bank base requires credentials; this
public distroless substitution is a demo choice, **not** an approved government
base or authorization evidence):

```sh
docker build -f services/export/Dockerfile \
  --build-arg DIST_IMAGE=gcr.io/distroless/nodejs24-debian12:nonroot \
  -t mage-export-proof:local .
```

Run with **unused ports 4242 and 4243**. Do not point this harness at a real
database or data directory. It creates a fresh MongoDB process using
`mongodb-memory-server` (real MongoDB, not a mock), API-created synthetic data,
random transient credentials, and local directories. Both service listeners
bind to loopback. Docker uses Linux host networking to reach the loopback MongoDB
and mounts the exercise data read-only. Nothing is published to the internet.

```sh
export MAGE_E2E_OUT="$PWD/services/export/proof/runs/$(date -u +%Y%m%dT%H%M%SZ)"
# Omit MAGE_PROOF_IMAGE for a host-process-only run.
MAGE_PROOF_IMAGE=mage-export-proof:local node services/export/proof/harness.cjs
python3 services/export/proof/report.py "$MAGE_E2E_OUT/events.ndjson" --output "$MAGE_E2E_OUT"
```

The output directory must be new: the event file is opened exclusively, never
overwritten or appended to a previous run. Processes and the temporary database
are stopped after the run. Output includes UTC/monotonic raw events, REST
assertions, application logs, downloaded ZIPs, entry hashes, canonical GeoPackage
rows, a retirement gate log, and derived JSON/Markdown KPI reports. Credentials
are never written intentionally; inspect logs before sharing.

## Acceptance path

1. Seed one observation and one location through the real API; authenticate an
   administrator and a non-participant.
2. Flag off: start the original in-process path; download all four export formats.
3. Flag on: run the extracted exporter (container when selected); restart the API
   with `MAGE_EXPORT_SERVICE_URL`; require content and summary parity for all four
   formats. Permissions remain in the API. Check non-participant 403, wrong/missing
   internal token 401, malformed event 400, and missing-token startup failure.
4. Stop exporter intentionally. Observe a `Failed` export, no orphan archive/file
   descriptor, and an otherwise healthy API. Restart exporter and require all four
   newly submitted exports to match. Failed jobs are not automatically replayed.
5. Stop exporter, unset flag/token and restart API. Require all four exports to
   match again against the same persisted data. This is an executed rollback,
   **not removal of the legacy module**.
6. Run the importer/dead-code gate and record the decision to retain legacy code.

ZIP headers carry timestamps, so compare entry contents, not whole ZIP bytes.
GeoPackage comparison normalizes only `gpkg_contents.last_change` and stable row
ordering; schema, rows and binary columns are otherwise compared. The separate
characterization suite has richer field/attachment fixtures; this live exercise
has no attachments and is not a load test.

## SOO 5.5 interpretation

`report.py` counts **observed successful local release transitions**, not commits
or PRs. Baseline, cutover and rollback count; health-only/bootstrap starts and
same-revision incident restarts do not. The denominator is the complete exercise
window (including setup/cleanup); no rate is extrapolated to a production day.

Lead time is Git committer timestamp → first observed local acceptance for each
runtime revision, not human work time. The runtime revision excludes proof-only
changes. The container image ID and harness revision are recorded separately;
image builds must use the same runtime source as the checkout. Worktree state is
recorded, not hidden.

Demo MTTR is first observed failed authenticated export → four verified fresh
exports after restart, including a deliberate 2-second API isolation check.
One artificial incident is not production MTTR. Missing labor, mission, sprint
velocity and production data are represented by JSON `null` with reasons, never
invented zeroes. Synthetic generator tests are not empirical metric data.

## Bounded deprecation decision and release gates

**Current decision: retain both paths.** This demo's importer check is only a text
search; it does not prove dynamic/plugin references are absent. Shared MongoDB,
filesystem stores, MAGE adapter imports and duplicated transforms remain coupled.
`/health` is liveness, not ongoing database readiness. No graceful draining,
in-flight crash recovery, large attachment streaming, TLS/replica-set operation,
multi-instance cutover or production load validation is claimed.

| Gate | Evidence / condition | Authority |
|---|---|---|
| Characterize | Both suites and four-format REST parity | Reviewer |
| Trial cutover | Flag-on exports and permission boundaries | Local exercise only |
| Roll back | Exporter stopped, flag off, same data and parity | Local exercise only |
| Stabilize | Representative traffic, errors, job backlog, disk/FDs and plugin consumers over an agreed observation period | Future program/operator decision |
| Deprecate | Communicate contract/version sunset, inventory consumers, record approval and rollback retention | Future government go/no-go |
| Retire | Only after prior gates; remove duplicated transforms and unused dependencies, re-run integration tests and vulnerability review | Not executed; no production retirement claim |

The existing README's 90-day suggestion is not an observed stabilization period
or contractual requirement. A bounded extraction does not demonstrate retirement
of an entire operational monolith.

## Demonstration backlog and release plan (not sprint velocity)

| Work item | Acceptance evidence | Release gate |
|---|---|---|
| Export extraction | Existing PR #1; characterized transforms and remote adapter | Unmerged review |
| Portable proof/KPI capture | This follow-up; reproducible events and report | Runtime exercise and review |
| Independent data ownership | Explicitly deferred; shared schema/adapters remain | Architecture decision |
| Production hardening | Token lifecycle, TLS, readiness, drain, scale, crash consistency, monitoring | Operator/security validation |
| Legacy retirement | Approval + consumer inventory + stabilization evidence | Government decision; not scheduled |

These are transparent demonstration work items and dependency gates, not a live
government agile board. Historical sprints, estimates, velocity charts, committed
release dates and real-time government tool access are **unavailable**. The proof
demonstrates an automated reporting mechanism, not complete fulfillment of 5.5.

## Discovery services

- [DeepWiki](https://devin-gtm.devinenterprise.com/wiki/COG-GTM/NGA-mage-server)
- [Actual migration-docs scan](https://devin-gtm.devinenterprise.com/code-scan/297683f5856041e28b46cf6ff133ab19/summary)

These are authenticated Devin artifacts, not guaranteed public links. The final
evidence package exports their content for review. Discovery is not a migration
plan or a guaranteed complete inventory. Native tool responses do not expose the
indexed source SHA; distinguish the observed default-branch revision from an
attested indexing revision. Runtime source and test revisions are recorded in the
local proof events. Stale discovery statements must be checked against source.
