/**
 * Wire contract of the internal export HTTP interface.
 *
 * The MAGE service (`service/src/app.impl/exports/app.impl.exports.remote.ts`)
 * holds a mirror of these definitions; keep the two in sync.
 *
 *   POST {MAGE_EXPORT_SERVICE_URL}/exports
 *     headers: content-type: application/json
 *              x-mage-export-token: <MAGE_EXPORT_SERVICE_TOKEN>   (when configured)
 *     body:    ExportRequestBody (JSON; Date values as ISO-8601 strings)
 *     200:     content-type: application/zip
 *              x-mage-export-summary: JSON ExportSummary
 *              body: the export ZIP archive, byte-identical to the in-process archive entries
 *     400/401/500: application/json { error: string }
 *
 *   GET {MAGE_EXPORT_SERVICE_URL}/health -> 200 { status: 'ok' }
 */
import { MageEventAttrs } from '@ngageoint/mage.service/lib/entities/events/entities.events'
import { ExportFormat } from '@ngageoint/mage.service/lib/entities/exports/entities.exports'
import { ExportParams } from './transforms'

export const EXPORT_TOKEN_HEADER = 'x-mage-export-token'
export const EXPORT_SUMMARY_HEADER = 'x-mage-export-summary'
export const EXPORTS_PATH = '/exports'
export const HEALTH_PATH = '/health'

export interface ExportRequestBody {
  format: ExportFormat
  event: MageEventAttrs
  params: ExportParams
}

const DATE_KEYS = new Set([ 'timestampAfter', 'timestampBefore', 'lastModifiedAfter', 'lastModifiedBefore' ])

/**
 * JSON has no Date type, so the find-spec date bounds arrive as ISO strings;
 * restore them to Date instances the repositories expect.
 */
export function reviveExportParams(params: ExportParams): ExportParams {
  const revive = (where: Record<string, unknown> | undefined): void => {
    if (!where) return
    for (const key of DATE_KEYS) {
      const v = where[key]
      if (typeof v === 'string') where[key] = new Date(v)
    }
  }
  revive(params.observationParams?.findSpec?.where as Record<string, unknown> | undefined)
  revive(params.locationParams?.findSpec?.where as Record<string, unknown> | undefined)
  return params
}
