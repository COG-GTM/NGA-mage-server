# SOO 5.5 — measured local demonstration

isolated local public-code demonstration; NOT federal contract or production performance

Observation window: 2026-11-07T21:07:06.873Z → 2026-11-07T21:07:38.279Z (31.406 seconds).

| Metric | Measured value | Denominator / interpretation |
|---|---|---|
| deployment_frequency | 3.000 verified local release transitions per observation window | 31.405955215 |
| lead_time_for_changes | 184316.729 seconds | 1 |
| demo_mttr | 4.897 seconds | 1 |
| labor_hours_saved | not observed/not measurable | No measured manual baseline, comparable task cohort, human touch-time or quality-adjusted rework data |
| mission_efficiency_change | not observed/not measurable | No operational users, mission outcome baseline or comparable mission workload |
| production_deployments | not observed/not measurable | No production telemetry or deployments performed |
| production_mttr | not observed/not measurable | No production incidents observed |
| velocity | not observed/not measurable | No sprint cadence, estimates or historical accepted story points; demonstration backlog is not velocity |

## Definitions

- **deployment_frequency:** A running release transition counts only after four authenticated exports complete and download. Baseline, cutover and rollback count; bootstrap/health-only starts, commits, PRs and same-revision incident restarts do not. No per-day extrapolation.
- **lead_time_for_changes:** Mean Git committer timestamp to first verified LOCAL deployment in this window, once per unique runtime source revision. Includes idle time; not coding time, merge-to-production time or labor saved.
- **demo_mttr:** Mean first observed Failed authenticated export to all four fresh authenticated exports downloaded and matched baseline after an intentional exporter stop/restart. Includes the scripted 2-second isolation check. Not production MTTR.

## Limits

- One host, one seeded observation and one seeded location; not load, scalability, resilience or HA evidence.
- Exporter shares MongoDB, file stores and core MAGE adapters. Not independently owned data or a fully decoupled estate.
- Failed jobs remain Failed; recovery verifies newly submitted jobs, not automatic replay.
- No continuous government tool access, deployment history or production observability is established by a saved demo report.
- Short-window deployment counts and one intentional fault do not predict steady-state DORA performance.

Runtime revision: `a17c6feaeb709df03e75d1847f44a618995dcfc3`. Harness revision: `289b0aa6d947db4c4e4fc4c0c7b4b5aa11af169b`.
Raw-event SHA-256: `f03deea34d521039861617ea13171bc17ca50999e27268ff54cd114d3bd8b93a`.
