/**
 * Export engine that delegates archive generation to the standalone export
 * service (`services/export`) over its internal HTTP interface.  Selected by
 * `initExportsAppLayer` only when `MAGE_EXPORT_SERVICE_URL` is set; otherwise
 * the in-process engine runs as before.
 *
 * Wire contract (mirror of `services/export/src/protocol.ts`; keep in sync):
 *   POST {url}/exports  JSON { format, event: MageEventAttrs, params: ExportParams }
 *     200 application/zip, header x-mage-export-summary: JSON ExportSummary
 *     4xx/5xx application/json { error }
 */
import http from 'http'
import https from 'https'
import { once } from 'stream'
import { URL } from 'url'
import { copyMageEventAttrs, MageEvent } from '../../entities/events/entities.events'
import { EXPORT_FORMATS, ExportFormat, ExportSummary } from '../../entities/exports/entities.exports'
import { Logger, NoopLogger } from '../../entities/entities.logging'
import { ExportContentStream, ExportEngine, ExportParams } from './app.impl.exports'

export const EXPORT_TOKEN_HEADER = 'x-mage-export-token'
export const EXPORT_SUMMARY_HEADER = 'x-mage-export-summary'
export const EXPORTS_PATH = '/exports'

export interface RemoteExportEngineOptions {
  /** base URL of the export service, e.g. http://mage-export:4243 */
  url: string
  /** shared secret sent as x-mage-export-token */
  token?: string
  /** milliseconds to wait for the export service to begin responding; default 1 hour */
  timeout?: number
  log?: Logger
}

export class RemoteExportError extends Error {
  constructor(readonly statusCode: number | undefined, message: string) {
    super(message)
    this.name = 'RemoteExportError'
  }
}

/**
 * The summary crosses the wire as JSON, so restore its Date members to match
 * what the in-process transforms return.
 */
function reviveSummary(json: any): ExportSummary {
  const reviveItem = (item: any): any => {
    if (!item) return item
    const revived = { ...item }
    for (const key of [ 'startTimestamp', 'endTimestamp' ]) {
      if (typeof revived[key] === 'string') revived[key] = new Date(revived[key])
    }
    return revived
  }
  return { ...json, observations: reviveItem(json.observations), locations: reviveItem(json.locations) }
}

export function RemoteExportEngine(opts: RemoteExportEngineOptions): ExportEngine {
  const base = new URL(opts.url)
  const log = opts.log || NoopLogger
  const timeout = opts.timeout ?? 60 * 60 * 1000
  return {
    canExport(format: ExportFormat): boolean {
      return EXPORT_FORMATS.includes(format)
    },
    export(format: ExportFormat, event: MageEvent, params: ExportParams, content: ExportContentStream): Promise<ExportSummary> {
      const body = JSON.stringify({ format, event: copyMageEventAttrs(event), params })
      const target = new URL(EXPORTS_PATH.replace(/^\//, ''), base.href.endsWith('/') ? base.href : base.href + '/')
      const client = target.protocol === 'https:' ? https : http
      return new Promise<ExportSummary>((resolve, reject) => {
        /*
        The export store opened the content stream before this request; on any
        failure destroy it so the descriptor is released and CreateExport can
        delete the file.
        */
        let settled = false
        const fail = (err: Error): void => {
          if (settled) return
          settled = true
          content.on('error', () => { /* tearing down */ })
          content.destroy?.(err)
          reject(err)
        }
        const headers: http.OutgoingHttpHeaders = {
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(body)
        }
        if (opts.token) {
          headers[EXPORT_TOKEN_HEADER] = opts.token
        }
        const req = client.request(target, { method: 'POST', headers, timeout }, res => {
          res.on('error', fail)
          res.on('aborted', () => fail(new RemoteExportError(res.statusCode, 'export service response aborted')))
          if (res.statusCode !== 200) {
            let text = ''
            res.setEncoding('utf-8')
            res.on('data', chunk => text += chunk)
            res.on('end', () => fail(new RemoteExportError(res.statusCode, `export service responded ${res.statusCode}: ${text}`)))
            return
          }
          const summaryHeader = res.headers[EXPORT_SUMMARY_HEADER]
          let summary: ExportSummary
          try {
            summary = reviveSummary(JSON.parse(String(summaryHeader)))
          }
          catch (err) {
            res.resume()
            fail(new RemoteExportError(res.statusCode, `export service response missing ${EXPORT_SUMMARY_HEADER} header`))
            return
          }
          const streamClosed = once(content, 'close')
          content.on('error', fail)
          res.pipe(content)
          streamClosed.then(() => { settled = true; resolve(summary) }, fail)
        })
        req.on('timeout', () => req.destroy(new RemoteExportError(undefined, `export service did not respond within ${timeout}ms`)))
        req.on('error', err => {
          log.error('export service request failed', err)
          fail(err)
        })
        req.end(body)
      })
    }
  }
}
