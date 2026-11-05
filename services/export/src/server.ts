import express from 'express'
import archiver from 'archiver'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { pipeline } from 'stream/promises'
import { MageEvent } from '@ngageoint/mage.service/lib/entities/events/entities.events'
import { EXPORT_FORMATS, ExportFormat } from '@ngageoint/mage.service/lib/entities/exports/entities.exports'
import { Logger } from '@ngageoint/mage.service/lib/entities/entities.logging'
import { ExportTransform } from './transforms'
import { EXPORT_SUMMARY_HEADER, EXPORT_TOKEN_HEADER, EXPORTS_PATH, ExportRequestBody, HEALTH_PATH, reviveExportParams } from './protocol'

export interface ExportServerOptions {
  transformForFormat: (format: ExportFormat) => ExportTransform | null
  /** shared secret the MAGE service must present in the x-mage-export-token header; required */
  token: string
  log: Logger
}

/**
 * Internal HTTP interface.  There is deliberately no authentication of end
 * users here: the MAGE service enforces export permissions before it
 * delegates, and this service must only be reachable from it (private
 * network plus the optional shared token).
 */
/**
 * Release the staging archive and file handle after a failed export so
 * repeated failures cannot exhaust file descriptors.
 */
async function closeStaging(archive: archiver.Archiver | undefined, content: fs.WriteStream | undefined): Promise<void> {
  if (archive) {
    archive.on('error', () => { /* aborted archives emit errors that are irrelevant here */ })
    archive.abort()
  }
  if (content && !content.closed) {
    const closed = new Promise<void>(resolve => content.once('close', () => resolve()))
    content.on('error', () => { /* already failing */ })
    content.destroy()
    await closed
  }
}

export function createExportServer(opts: ExportServerOptions): express.Express {
  const app = express()
  app.disable('x-powered-by')
  app.get(HEALTH_PATH, (_req, res) => { res.json({ status: 'ok' }) })

  app.use((req, res, next) => {
    if (req.header(EXPORT_TOKEN_HEADER) !== opts.token) {
      res.status(401).json({ error: 'unauthorized' })
      return
    }
    next()
  })

  app.post(EXPORTS_PATH, express.json({ limit: '10mb' }), async (req, res) => {
    let tmpDir: string | undefined
    let archive: archiver.Archiver | undefined
    let content: fs.WriteStream | undefined
    try {
      const body = req.body as Partial<ExportRequestBody>
      if (!body || !body.event || typeof body.event !== 'object' || !body.format || !EXPORT_FORMATS.includes(body.format)) {
        res.status(400).json({ error: `invalid export request` })
        return
      }
      const transform = opts.transformForFormat(body.format)
      if (!transform) {
        res.status(400).json({ error: `invalid export type: ${body.format}` })
        return
      }
      let event: MageEvent
      try {
        event = new MageEvent(body.event)
      }
      catch (err) {
        res.status(400).json({ error: `invalid event: ${(err as Error).message}` })
        return
      }
      const params = reviveExportParams(body.params || {})
      /*
      The summary is only known once the transform finishes, and the caller
      needs it alongside the bytes, so the archive is staged to a temp file and
      then streamed back with the summary in a response header.
      */
      tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'mage-export-'))
      const tmpFile = path.join(tmpDir, 'export.zip')
      content = fs.createWriteStream(tmpFile)
      const closed = new Promise<void>((resolve, reject) => { content!.on('close', resolve); content!.on('error', reject) })
      archive = archiver('zip')
      archive.pipe(content)
      const summary = await transform.export(event, archive, params)
      await archive.finalize()
      await closed
      archive = undefined
      content = undefined
      const stats = await fs.promises.stat(tmpFile)
      res.status(200)
      res.setHeader('content-type', 'application/zip')
      res.setHeader('content-length', String(stats.size))
      res.setHeader(EXPORT_SUMMARY_HEADER, JSON.stringify(summary))
      await pipeline(fs.createReadStream(tmpFile), res)
      opts.log.info(`exported ${body.format} for event ${event.id}`, { observations: summary.observations?.count ?? 0, locations: summary.locations?.count ?? 0 })
    }
    catch (err) {
      opts.log.error('export error', err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'export failed' })
      }
      else {
        res.destroy()
      }
    }
    finally {
      await closeStaging(archive, content)
      if (tmpDir) {
        await fs.promises.rm(tmpDir, { recursive: true, force: true }).catch(err => opts.log.warn(`failed to remove export staging directory ${tmpDir}`, err))
      }
    }
  })

  return app
}
