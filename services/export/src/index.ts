#!/usr/bin/env node
/**
 * MAGE export service entry point.  Configuration is environment only, and
 * the MongoDB and data directory variables are parsed by the MAGE service's
 * own environment module so authentication (MAGE_MONGO_USER/PASSWORD or
 * X.509 via MAGE_MONGO_X509_*), TLS, pool and replica set settings behave
 * exactly as they do for mage-server:
 *
 *   MAGE_MONGO_URL (+ MAGE_MONGO_USER, MAGE_MONGO_PASSWORD, MAGE_MONGO_SSL, MAGE_MONGO_X509_*, MAGE_MONGO_REPLICA_SET, ...)
 *   MAGE_MONGO_CONN_TIMEOUT / MAGE_MONGO_CONN_RETRY_DELAY   seconds (default 300 / 5)
 *   MAGE_ATTACHMENT_DIR           attachment store base directory (default /var/lib/mage/attachments)
 *   MAGE_ICON_DIR                 observation icon store base directory (default /var/lib/mage/icons)
 *   MAGE_USER_DIR                 user icon store base directory (default /var/lib/mage/users)
 *   MAGE_EXPORT_SERVICE_PORT      listen port (default 4243)
 *   MAGE_EXPORT_SERVICE_HOST      listen address (default 0.0.0.0)
 *   MAGE_EXPORT_SERVICE_TOKEN     shared secret the MAGE service sends in x-mage-export-token (REQUIRED)
 */
import { connectRepositories, transformFactory } from './repositories'
import { createExportServer } from './server'
import { Logger } from '@ngageoint/mage.service/lib/entities/entities.logging'

const log: Logger = {
  debug: (...args: unknown[]) => console.debug('[export-service]', ...args),
  info: (...args: unknown[]) => console.info('[export-service]', ...args),
  warn: (...args: unknown[]) => console.warn('[export-service]', ...args),
  error: (...args: unknown[]) => console.error('[export-service]', ...args),
} as Logger

async function main(): Promise<void> {
  const env = process.env
  const token = env.MAGE_EXPORT_SERVICE_TOKEN
  if (!token) {
    throw new Error('MAGE_EXPORT_SERVICE_TOKEN is required; the export service performs no end-user authorization and must only accept requests from mage-server')
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const environment = require('@ngageoint/mage.service/lib/environment/env')
  const repos = await connectRepositories({
    mongoUrl: environment.mongo.uri,
    mongoConnectTimeout: environment.mongo.connectTimeout,
    mongoConnectRetryDelay: environment.mongo.connectRetryDelay,
    mongoOptions: environment.mongo.options,
    attachmentBaseDirectory: environment.attachmentBaseDirectory,
    iconBaseDirectory: environment.iconBaseDirectory,
    userBaseDirectory: environment.userBaseDirectory,
  })
  const app = createExportServer({ transformForFormat: transformFactory(repos, log), token, log })
  const port = parseInt(env.MAGE_EXPORT_SERVICE_PORT || '4243', 10)
  const host = env.MAGE_EXPORT_SERVICE_HOST || '0.0.0.0'
  app.listen(port, host, () => log.info(`listening on ${host}:${port}`))
}

main().catch(err => {
  log.error('failed to start', err)
  process.exit(1)
})
