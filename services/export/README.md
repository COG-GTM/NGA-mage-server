# MAGE export service

Separately deployable service that produces the MAGE observation/location export
archives (CSV, GeoJSON, KML, GeoPackage). It is the extracted home of the export
transforms that live in the MAGE service at
`service/src/app.impl/exports/app.impl.exports.{csv,geojson,kml,geopackage}.ts`
(this repository has no `service/src/export/` directory; that module is the
equivalent). The transforms in `src/transforms/` are identical to the in-process
copies apart from import paths; `scripts/check-parity.sh` proves it.

The public API contract is unchanged: clients still call
`POST /api/events/:eventId/exports`, `GET /api/exports/mine`,
`GET /api/exports/mine/:exportId` and `DELETE /api/exports/mine/:exportId` on the
MAGE service. Only where the archive bytes are generated changes.

## The flag

| Variable | Set on | Default | Effect |
| --- | --- | --- | --- |
| `MAGE_EXPORT_SERVICE_URL` | mage-server | unset | **Unset: exports run in-process exactly as before (default).** Set to the export service base URL (e.g. `http://mage-export:4243`) to delegate archive generation. |
| `MAGE_EXPORT_SERVICE_TOKEN` | mage-server and mage-export | unset on mage-server; **required** on mage-export | Shared secret; mage-server sends it as `x-mage-export-token`, mage-export refuses to start without one and rejects requests that do not present it (401). |

In both modes the MAGE service still creates the export record, enforces the
export permission (`RoleBasedExportsPermissionService.ensureCreateExportPermission`,
event read access, before anything is delegated), stores the archive in
`MAGE_EXPORT_DIR`, and serves it from `/api/exports/mine/:id`. The export
service has no end-user authentication and must only be reachable from the MAGE
service: the compose service publishes no ports (`expose` only, on `mage.net`),
and the mandatory shared token guards against anything else on that network.

Selection happens once at startup in `initExportsAppLayer` (`service/src/app.ts`):
`InProcessExportEngine` or `RemoteExportEngine`
(`service/src/app.impl/exports/app.impl.exports.remote.ts`). The log line
`exports run in-process (MAGE_EXPORT_SERVICE_URL not set)` or
`exports delegated to export service at ...` states which path is active.

## Export service configuration

| Variable | Default |
| --- | --- |
| `MAGE_MONGO_URL`, `MAGE_MONGO_USER`, `MAGE_MONGO_PASSWORD`, `MAGE_MONGO_SSL`, `MAGE_MONGO_X509_*`, `MAGE_MONGO_REPLICA_SET`, pool size | same meaning and defaults as mage-server (parsed by the MAGE service's own `environment/env` module) |
| `MAGE_ATTACHMENT_DIR` | `/var/lib/mage/attachments` |
| `MAGE_ICON_DIR` | `/var/lib/mage/icons` |
| `MAGE_USER_DIR` | `/var/lib/mage/users` (user avatar icons for KML/GeoPackage) |
| `MAGE_EXPORT_SERVICE_PORT` / `MAGE_EXPORT_SERVICE_HOST` | `4243` / `0.0.0.0` |
| `MAGE_EXPORT_SERVICE_TOKEN` | **required** |
| `MAGE_MONGO_CONN_TIMEOUT` / `MAGE_MONGO_CONN_RETRY_DELAY` | `300` / `5` seconds |

It reads observations, events/forms, users, devices, locations and icons through
the MAGE service's own Mongoose adapters (`@ngageoint/mage.service/lib/adapters/...`)
and the attachment/icon stores through its filesystem adapters, so query
semantics are the in-process ones. It must mount the same data directory as
mage-server.

Internal interface (`src/protocol.ts`, mirrored in `app.impl.exports.remote.ts`):

```
POST /exports            x-mage-export-token: <token>
  { format, event: MageEventAttrs, params: ExportParams }
  -> 200 application/zip, x-mage-export-summary: {"observations":{...},"locations":{...}}
GET  /health             -> 200 {"status":"ok"}
```

## Build and run

```sh
# library the service links against
cd service && npm ci && npm run build
# export service
cd ../services/export && npm install && npm link ../../service && npm run build
MAGE_EXPORT_SERVICE_TOKEN=<secret> MAGE_MONGO_URL=mongodb://127.0.0.1:27017/magedb MAGE_ATTACHMENT_DIR=... MAGE_ICON_DIR=... MAGE_USER_DIR=... npm start

# containers (from the repository root)
docker compose build mage-export
docker compose up mage-db mage-server mage-export
```

## Characterization tests

`service/test/app/exports/characterization/` pins the archive entries for a fixed
fixture (one form with a field of every common type, a point observation with an
attachment reference, a polygon observation, one user location, users with and
without icons, observation icons). Snapshots and SHA-256 manifests are in
`snapshots/<format>/`. ZIP container bytes are not compared because `archiver`
stamps entries with the current time; GeoPackage entries are compared as a
canonical SQLite dump because `gpkg_contents.last_change` is set at export time.

```sh
cd service
npm run test:compile                                               # once, compiles test-lib
npm run test:run -- --grep "characterization \(in-process"         # flag off: in-process engine (default path)
npm run test:run -- --grep "characterization \(remote"             # flag on: RemoteExportEngine -> locally started export service
MAGE_EXPORT_SNAPSHOT_UPDATE=1 npm run test:run -- --grep "characterization \(in-process"   # regenerate after a reviewed output change
```

The flag-on suite starts the export service's HTTP server in the test process
with the same fixture repositories and asserts the entries match the snapshots
and the in-process engine byte for byte. It is reported pending if
`services/export/lib` has not been built.

## Retirement controls

1. **Shadow mode (both paths, compare output).** Deploy `mage-export` next to
   `mage-server` with the flag unset. For a sample of events, create the same
   export twice: once through the API (in-process) and once by POSTing the same
   request to `mage-export` from inside the network, e.g.
   `curl -H "x-mage-export-token: $TOKEN" -d @request.json http://mage-export:4243/exports -o shadow.zip`.
   Compare entry by entry (`unzip -l`, `sha256sum` of extracted entries; for
   `.gpkg` compare a `sqlite3 .dump` with `last_change` stripped). The
   characterization harness (`characterize.ts`) is the reference for the
   comparison rules. Any difference is a stop: fix or document it before moving on.
2. **Shift traffic.** Set `MAGE_EXPORT_SERVICE_URL` (and the token) on one
   mage-server instance, confirm the startup log line, run the shadow comparison
   again against real exports, then roll the flag out to the remaining instances.
   Rollback is unsetting the variable and restarting; no data migration is involved.
3. **Dormant period.** Keep the in-process code for at least one full release
   cycle (recommended: 90 days) with the flag on everywhere. During this period
   `scripts/check-parity.sh` must stay green so the two copies cannot drift, and
   any export bug fix lands in both.
4. **Remove the in-process path.** Delete
   `service/src/app.impl/exports/app.impl.exports.{csv,geojson,kml,geopackage}.ts`,
   `InProcessExportEngine`, and the engine selection in `initExportsAppLayer`
   (make `MAGE_EXPORT_SERVICE_URL` required), then drop the transform-only
   dependencies from `service/package.json`. The flag-off characterization suite
   is deleted with the code; the flag-on suite remains.

### Dead-code check

`scripts/check-dead-code.sh` greps `service/src` and `plugins/` for importers of
the in-process export module and fails if anything other than the feature-flag
wiring in `service/src/app.ts` imports it. Run it before step 4 above; its output
at the time of this change is in the pull request description.

```sh
services/export/scripts/check-dead-code.sh
services/export/scripts/check-parity.sh
```
