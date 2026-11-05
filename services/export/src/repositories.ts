/**
 * Build the read-only data access the export transforms need from
 * configuration alone: a MongoDB connection plus the attachment, observation
 * icon and user icon directories.  All adapters are the MAGE service's own
 * Mongoose/filesystem adapters so query semantics are identical to the
 * in-process export path.
 */
import path from 'path'
import { EventEmitter } from 'events'
import { waitForDefaultMongooseConnection } from '@ngageoint/mage.service/lib/adapters/adapters.db.mongoose'
import { MongooseMageEventRepository } from '@ngageoint/mage.service/lib/adapters/events/adapters.events.db.mongoose'
import { MongooseUserRepository } from '@ngageoint/mage.service/lib/adapters/users/adapters.users.db.mongoose'
import { DeviceModel, MongooseDeviceRepository } from '@ngageoint/mage.service/lib/adapters/devices/adapters.devices.db.mongoose'
import { MongooseUserLocationRepository, UserLocationModel } from '@ngageoint/mage.service/lib/adapters/locations/adapters.locations.db.mongoose'
import { MongooseObservationIconRepository, ObservationIconModel } from '@ngageoint/mage.service/lib/adapters/observations/adapters.observations.icons.db.mongoose'
import { MongooseObservationSearchRepository, ObservationSearchModel } from '@ngageoint/mage.service/lib/adapters/observations/adapters.observations.search.db.mongoose'
import { createObservationRepositoryFactory } from '@ngageoint/mage.service/lib/adapters/observations/adapters.observations.db.mongoose'
import { FileSystemAttachmentStoreInitError, initializeAttachmentStore } from '@ngageoint/mage.service/lib/adapters/observations/adapters.observations.attachment_store.file_system'
import { FileSystemObservationIconContentStore } from '@ngageoint/mage.service/lib/adapters/observations/adapters.observations.icon.file_system'
import { FileSystemUserIconContentStore } from '@ngageoint/mage.service/lib/adapters/users/adapters.users.icons.file_system'
import { MageEventRepository } from '@ngageoint/mage.service/lib/entities/events/entities.events'
import { AttachmentStore } from '@ngageoint/mage.service/lib/entities/observations/entities.observations'
import { ObservationIconContentStore, ObservationIconRepository } from '@ngageoint/mage.service/lib/entities/observations/entities.observations.icons'
import { UserLocationRepository } from '@ngageoint/mage.service/lib/entities/locations/entities.locations'
import { UserIconContentStore, UserRepository } from '@ngageoint/mage.service/lib/entities/users/entities.users'
import { DevicesRepository } from '@ngageoint/mage.service/lib/entities/devices/entities.devices'
import { ExportFormat } from '@ngageoint/mage.service/lib/entities/exports/entities.exports'
import { ExportTransform, IterateObservations } from './transforms'
import { CsvExportTransform } from './transforms/csv'
import { GeoJsonExportTransform } from './transforms/geojson'
import { KmlExportTransform } from './transforms/kml'
import { GeoPackageExportTransform } from './transforms/geopackage'
import { Logger } from '@ngageoint/mage.service/lib/entities/entities.logging'

/**
 * The MAGE service's legacy models register on the default connection of the
 * mongoose instance the service package itself resolves, so this service must
 * connect that same instance rather than a second copy of mongoose.
 */
function serviceMongoose(): typeof import('mongoose') {
  const servicePackageDir = path.dirname(require.resolve('@ngageoint/mage.service/package.json'))
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require(require.resolve('mongoose', { paths: [ servicePackageDir ] }))
}

export interface ExportServiceConfig {
  mongoUrl: string
  mongoConnectTimeout: number
  mongoConnectRetryDelay: number
  attachmentBaseDirectory: string
  iconBaseDirectory: string
  userBaseDirectory: string
}

export interface ExportRepositories {
  eventRepo: MageEventRepository
  userRepo: UserRepository
  deviceRepo: DevicesRepository
  locationRepo: UserLocationRepository
  iconRepo: ObservationIconRepository
  iconStore: ObservationIconContentStore
  userIconStore: UserIconContentStore
  attachmentStore: AttachmentStore
  iterateObservations: IterateObservations
}

export async function connectRepositories(config: ExportServiceConfig): Promise<ExportRepositories> {
  const mongoose = serviceMongoose()
  await waitForDefaultMongooseConnection(mongoose, config.mongoUrl, config.mongoConnectTimeout, config.mongoConnectRetryDelay, {})
  const conn = mongoose.connection
  // the legacy models register on the default mongoose connection
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@ngageoint/mage.service/lib/models').initializeModels()
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const eventModel = require('@ngageoint/mage.service/lib/models/event').Model
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const userModel = require('@ngageoint/mage.service/lib/models/user').Model

  const eventRepo = new MongooseMageEventRepository(eventModel)
  const attachmentStore = await initializeAttachmentStore(config.attachmentBaseDirectory)
  if (attachmentStore instanceof FileSystemAttachmentStoreInitError) {
    throw attachmentStore
  }
  const obsRepoFactory = createObservationRepositoryFactory(eventRepo, new EventEmitter())
  const searchRepo = new MongooseObservationSearchRepository(ObservationSearchModel(conn))
  return {
    eventRepo,
    userRepo: new MongooseUserRepository(userModel),
    deviceRepo: new MongooseDeviceRepository(DeviceModel(conn)),
    locationRepo: new MongooseUserLocationRepository(UserLocationModel(conn)),
    iconRepo: new MongooseObservationIconRepository(ObservationIconModel(conn)),
    iconStore: new FileSystemObservationIconContentStore(config.iconBaseDirectory),
    userIconStore: new FileSystemUserIconContentStore(config.userBaseDirectory),
    attachmentStore,
    iterateObservations: IterateObservations(obsRepoFactory, searchRepo)
  }
}

/**
 * Same transform wiring as `initExportsAppLayer` in the MAGE service.
 */
export function transformFactory(repos: ExportRepositories, log: Logger): (format: ExportFormat) => ExportTransform | null {
  const { locationRepo, iterateObservations, attachmentStore, deviceRepo, userRepo, iconRepo, iconStore, userIconStore } = repos
  const transforms: { [format in ExportFormat]: ExportTransform } = {
    csv: new CsvExportTransform(locationRepo, iterateObservations, attachmentStore, deviceRepo, userRepo),
    kml: new KmlExportTransform(locationRepo, iterateObservations, iconRepo, iconStore, attachmentStore, userRepo, userIconStore),
    geojson: new GeoJsonExportTransform(locationRepo, iterateObservations, attachmentStore, deviceRepo, userRepo),
    geopackage: new GeoPackageExportTransform(locationRepo, iterateObservations, iconStore, attachmentStore, iconRepo, userRepo, userIconStore, log),
  }
  return (format: ExportFormat) => transforms[format] || null
}
