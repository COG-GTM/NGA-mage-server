# Parity report

Baseline (`develop`, :4000) vs upgraded (this branch, :4200). Same specs, both projects.

| Project | Passed | Failed |
|---|---|---|
| baseline | 19 | 0 |
| upgraded | 19 | 0 |

## Specs

| Spec | Baseline | Upgraded |
|---|---|---|
| 01-ingress.spec.ts › ingress › sign-in page renders and rejects a bad password | passed | passed |
| 01-ingress.spec.ts › ingress › sign-up form validates required fields | passed | passed |
| 01-ingress.spec.ts › ingress › sign-in + access code lands on home, sign-out returns to landing | passed | passed |
| 02-home.spec.ts › home, profile, about › home shows map and observation feed | passed | passed |
| 02-home.spec.ts › home, profile, about › profile shows account info and password form | passed | passed |
| 02-home.spec.ts › home, profile, about › about page | passed | passed |
| 03-admin-nav.spec.ts › admin › dashboard and navigation | passed | passed |
| 03-admin-nav.spec.ts › admin › admin users page | passed | passed |
| 03-admin-nav.spec.ts › admin › admin teams page | passed | passed |
| 03-admin-nav.spec.ts › admin › admin devices page | passed | passed |
| 03-admin-nav.spec.ts › admin › admin events page | passed | passed |
| 03-admin-nav.spec.ts › admin › admin layers page | passed | passed |
| 03-admin-nav.spec.ts › admin › admin feeds page | passed | passed |
| 03-admin-nav.spec.ts › admin › admin security page | passed | passed |
| 03-admin-nav.spec.ts › admin › admin banner page | passed | passed |
| 03-admin-nav.spec.ts › admin › plugin pages (SFTP, ArcGIS) load from the plugin bundles | passed | passed |
| 04-admin-crud.spec.ts › admin create/edit/delete › users: validate, create, search, delete | passed | passed |
| 04-admin-crud.spec.ts › admin create/edit/delete › teams: validate, create, edit, delete | passed | passed |
| 04-admin-crud.spec.ts › admin create/edit/delete › events: validate, create, filter, delete | passed | passed |

## Screenshots (left: baseline, right: upgraded)

| Page | Pixel diff | Size (baseline / upgraded) |
|---|---|---|
| [01-sign-in.png](side-by-side/01-sign-in.png) | 1.94% | 1440x900 / 1440x900 |
| [02-sign-up.png](side-by-side/02-sign-up.png) | 0.00% | 1440x900 / 1440x900 |
| [03-access-code.png](side-by-side/03-access-code.png) | 1.94% | 1440x900 / 1440x900 |
| [10-home.png](side-by-side/10-home.png) | 0.00% | 1440x900 / 1440x900 |
| [11-profile.png](side-by-side/11-profile.png) | 0.00% | 1440x900 / 1440x900 |
| [12-about.png](side-by-side/12-about.png) | 0.00% | 1440x900 / 1440x900 |
| [20-admin-dashboard.png](side-by-side/20-admin-dashboard.png) | 0.00% | 1440x900 / 1440x900 |
| [21-admin-banner.png](side-by-side/21-admin-banner.png) | 0.00% | 1440x900 / 1440x900 |
| [21-admin-devices.png](side-by-side/21-admin-devices.png) | 0.00% | 1440x900 / 1440x900 |
| [21-admin-events.png](side-by-side/21-admin-events.png) | 0.00% | 1440x900 / 1440x900 |
| [21-admin-feeds.png](side-by-side/21-admin-feeds.png) | 0.00% | 1440x900 / 1440x900 |
| [21-admin-layers.png](side-by-side/21-admin-layers.png) | 0.00% | 1440x900 / 1440x900 |
| [21-admin-security.png](side-by-side/21-admin-security.png) | 0.00% | 1440x900 / 1440x900 |
| [21-admin-teams.png](side-by-side/21-admin-teams.png) | 0.00% | 1440x900 / 1440x900 |
| [21-admin-users.png](side-by-side/21-admin-users.png) | 0.00% | 1440x900 / 1440x900 |
| [22-plugin-arcgis.png](side-by-side/22-plugin-arcgis.png) | 0.00% | 1440x900 / 1440x900 |
| [22-plugin-sftp.png](side-by-side/22-plugin-sftp.png) | 0.00% | 1440x900 / 1440x900 |
| [30-user-create-validation.png](side-by-side/30-user-create-validation.png) | 0.00% | 1440x900 / 1440x900 |
| [31-team-details.png](side-by-side/31-team-details.png) | 0.02% | 1440x900 / 1440x900 |
| [32-event-details.png](side-by-side/32-event-details.png) | 0.02% | 1440x900 / 1440x900 |
