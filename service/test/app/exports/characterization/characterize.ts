/**
 * Shared harness for the export characterization tests.  An export run is
 * reduced to its archive entries (name -> bytes) because the ZIP container
 * itself is not byte-stable: archiver stamps each entry with the current
 * time.  GeoPackage entries are SQLite files whose bytes vary run to run
 * (`gpkg_contents.last_change`, page allocation), so they are reduced to a
 * canonical JSON dump of every table's schema and rows.
 *
 * Snapshots live next to the tests in `snapshots/<format>/` along with a
 * `manifest.json` of SHA-256 hashes.  Set `MAGE_EXPORT_SNAPSHOT_UPDATE=1` to
 * (re)write them.
 */
import archiver, { Archiver } from 'archiver'
import { expect } from 'chai'
import crypto from 'crypto'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { Writable } from 'stream'
import JSZip from 'jszip'
import { BufferWriteable } from '../../../utils'

// better-sqlite3 ships without type declarations in this repo's dependency set
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Database = require('better-sqlite3')
import { ExportFormat, ExportSummary } from '../../../../lib/entities/exports/entities.exports'
import { MageEvent } from '../../../../lib/entities/events/entities.events'
import { ExportParams } from '../../../../lib/app.impl/exports/app.impl.exports'
import { fixtureEvent, fixtureExportParams, fixtureTransform } from './fixture'

export const SNAPSHOT_DIR = path.resolve(__dirname, '..', '..', '..', '..', 'test', 'app', 'exports', 'characterization', 'snapshots')
export const CHARACTERIZED_FORMATS: ExportFormat[] = [ 'csv', 'geojson', 'kml', 'geopackage' ]

/**
 * Produce the complete export archive for the given format and fixture into
 * the given writable, resolving to the export summary.  The in-process runner
 * reproduces what `CreateExport` does today; the remote runner (flag on) is
 * supplied by the export-service tests.
 */
export interface ExportRunner {
  (format: ExportFormat, event: MageEvent, params: ExportParams, out: Writable): Promise<ExportSummary>
}

export const inProcessRunner: ExportRunner = async (format, event, params, out) => {
  const archive: Archiver = archiver('zip')
  archive.pipe(out)
  const finished = new Promise<void>((resolve, reject) => {
    out.on('finish', resolve)
    out.on('error', reject)
  })
  const summary = await fixtureTransform(format).export(event, archive, params)
  await archive.finalize()
  await finished
  return summary
}

export interface CharacterizedEntry {
  name: string
  /** the bytes that are compared/snapshotted; for .gpkg entries this is the canonical dump, not the sqlite file */
  bytes: Buffer
  sha256: string
  canonicalized: boolean
}

export interface CharacterizedExport {
  format: ExportFormat
  summary: ExportSummary
  entries: CharacterizedEntry[]
}

export async function characterize(format: ExportFormat, runner: ExportRunner = inProcessRunner): Promise<CharacterizedExport> {
  const out = new BufferWriteable()
  const summary = await runner(format, fixtureEvent(), fixtureExportParams(), out)
  const zip = await JSZip.loadAsync(out.bytes)
  const names = Object.keys(zip.files).filter(name => !zip.files[name].dir).sort()
  const entries: CharacterizedEntry[] = []
  for (const name of names) {
    let bytes = await zip.files[name].async('nodebuffer')
    let canonicalized = false
    if (name.endsWith('.gpkg')) {
      bytes = Buffer.from(canonicalGeoPackageDump(bytes), 'utf-8')
      canonicalized = true
    }
    entries.push({ name, bytes, sha256: sha256(bytes), canonicalized })
  }
  return { format, summary, entries }
}

export function sha256(bytes: Buffer): string {
  return crypto.createHash('sha256').update(bytes).digest('hex')
}

const VOLATILE_COLUMNS = new Set([ 'last_change' ])

export function canonicalGeoPackageDump(gpkgBytes: Buffer): string {
  const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'mage-export-char-')), 'export.gpkg')
  fs.writeFileSync(tmp, gpkgBytes)
  const db = new Database(tmp, { readonly: true })
  try {
    const tables = db.prepare(`select name, type, sql from sqlite_master where type in ('table', 'view', 'index', 'trigger') and name not like 'sqlite_%' order by type, name`).all() as { name: string, type: string, sql: string }[]
    const dump: Record<string, unknown> = {}
    for (const t of tables) {
      if (t.type !== 'table') {
        dump[`${t.type}:${t.name}`] = t.sql
        continue
      }
      const columns = (db.prepare(`pragma table_info("${t.name}")`).all() as { name: string, type: string }[])
      const rows = (db.prepare(`select * from "${t.name}"`).all() as Record<string, unknown>[]).map(row => {
        const copy: Record<string, unknown> = {}
        for (const col of columns) {
          const v = row[col.name]
          copy[col.name] = VOLATILE_COLUMNS.has(col.name) ? '<volatile>' : Buffer.isBuffer(v) ? { blobSha256: sha256(v), length: v.length } : v
        }
        return copy
      })
      rows.sort((a, b) => JSON.stringify(a) < JSON.stringify(b) ? -1 : 1)
      dump[`table:${t.name}`] = { sql: t.sql, columns: columns.map(c => `${c.name} ${c.type}`), rows }
    }
    return JSON.stringify(dump, null, 2) + '\n'
  }
  finally {
    db.close()
    fs.rmSync(path.dirname(tmp), { recursive: true, force: true })
  }
}

export function snapshotFileName(entryName: string, canonicalized: boolean): string {
  return entryName.replace(/[\\/]/g, '__') + (canonicalized ? '.canonical.json' : '')
}

export interface SnapshotManifest {
  format: ExportFormat
  entries: { [entryName: string]: { sha256: string, snapshot: string, canonicalized: boolean } }
}

export function writeSnapshots(result: CharacterizedExport): void {
  const dir = path.join(SNAPSHOT_DIR, result.format)
  fs.rmSync(dir, { recursive: true, force: true })
  fs.mkdirSync(dir, { recursive: true })
  const manifest: SnapshotManifest = { format: result.format, entries: {} }
  for (const entry of result.entries) {
    const snapshot = snapshotFileName(entry.name, entry.canonicalized)
    fs.writeFileSync(path.join(dir, snapshot), entry.bytes)
    manifest.entries[entry.name] = { sha256: entry.sha256, snapshot, canonicalized: entry.canonicalized }
  }
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
}

export function readManifest(format: ExportFormat): SnapshotManifest {
  return JSON.parse(fs.readFileSync(path.join(SNAPSHOT_DIR, format, 'manifest.json'), 'utf-8'))
}

/**
 * Assert the characterized export matches the recorded snapshot, entry by
 * entry.  Text entries are compared as strings so a mismatch reports a
 * readable diff; every entry is also compared by hash.
 */
export function expectMatchesSnapshot(result: CharacterizedExport): void {
  if (process.env.MAGE_EXPORT_SNAPSHOT_UPDATE === '1') {
    writeSnapshots(result)
  }
  const manifest = readManifest(result.format)
  const dir = path.join(SNAPSHOT_DIR, result.format)
  expect(result.entries.map(x => x.name), `${result.format} archive entry names`).to.deep.equal(Object.keys(manifest.entries).sort())
  for (const entry of result.entries) {
    const expected = manifest.entries[entry.name]
    const expectedBytes = fs.readFileSync(path.join(dir, expected.snapshot))
    if (isText(entry.name) || entry.canonicalized) {
      expect(entry.bytes.toString('utf-8'), `${result.format}/${entry.name} content`).to.equal(expectedBytes.toString('utf-8'))
    }
    expect(entry.sha256, `${result.format}/${entry.name} sha256`).to.equal(expected.sha256)
    expect(entry.bytes.equals(expectedBytes), `${result.format}/${entry.name} bytes`).to.be.true
  }
}

function isText(name: string): boolean {
  return /\.(csv|geojson|json|kml|txt|xml)$/i.test(name)
}
