#!/usr/bin/env node
/**
 * MAGE export service entry point.  Configuration is environment only:
 *
 *   MAGE_MONGO_URL                MongoDB connection string (default mongodb://127.0.0.1:27017/magedb)
 *   MAGE_MONGO_CONN_TIMEOUT       seconds to keep retrying the initial connection (default 300)
 *   MAGE_MONGO_CONN_RETRY_DELAY   seconds between connection attempts (default 5)
 *   MAGE_ATTACHMENT_DIR           attachment store base directory (default /var/lib/mage/attachments)
 *   MAGE_ICON_DIR                 observation icon store base directory (default /var/lib/mage/icons)
 *   MAGE_USER_DIR                 user icon store base directory (default /var/lib/mage/users)
 *   MAGE_EXPORT_SERVICE_PORT      listen port (default 4243)
 *   MAGE_EXPORT_SERVICE_HOST      listen address (default 0.0.0.0)
 *   MAGE_EXPORT_SERVICE_TOKEN     shared secret the MAGE service sends in x-mage-export-token (optional)
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
  const repos = await connectRepositories({
    mongoUrl: env.MAGE_MONGO_URL || 'mongodb://127.0.0.1:27017/magedb',
    mongoConnectTimeout: parseInt(env.MAGE_MONGO_CONN_TIMEOUT || '300', 10) * 1000,
    mongoConnectRetryDelay: parseInt(env.MAGE_MONGO_CONN_RETRY_DELAY || '5', 10) * 1000,
    attachmentBaseDirectory: env.MAGE_ATTACHMENT_DIR || '/var/lib/mage/attachments',
    iconBaseDirectory: env.MAGE_ICON_DIR || '/var/lib/mage/icons',
    userBaseDirectory: env.MAGE_USER_DIR || '/var/lib/mage/users',
  })
  const app = createExportServer({ transformForFormat: transformFactory(repos, log), token: env.MAGE_EXPORT_SERVICE_TOKEN, log })
  const port = parseInt(env.MAGE_EXPORT_SERVICE_PORT || '4243', 10)
  const host = env.MAGE_EXPORT_SERVICE_HOST || '0.0.0.0'
  app.listen(port, host, () => log.info(`listening on ${host}:${port}`))
}

main().catch(err => {
  log.error('failed to start', err)
  process.exit(1)
})
