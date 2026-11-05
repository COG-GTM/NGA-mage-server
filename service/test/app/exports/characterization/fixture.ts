/**
 * Deterministic fixture set for the export characterization tests.  Every
 * value here is fixed so the four export formats (CSV, GeoJSON, KML and
 * GeoPackage) produce byte-identical archive entries on every run.  The
 * fixture covers:
 *  - one form with a field of every common form field type
 *  - two observations (point with an attachment reference, polygon without)
 *  - one user location
 *  - users with and without icons, one device
 *  - observation icons for the default/primary/variant lookups
 */
import { Readable } from 'stream'
import { MageEvent, MageEventAttrs } from '../../../../lib/entities/events/entities.events'
import { Form, FormFieldType } from '../../../../lib/entities/events/entities.events.forms'
import { AttachmentStore, FindObservationsStreamSpec, ObservationAttrs } from '../../../../lib/entities/observations/entities.observations'
import { ObservationIcon, ObservationIconContentStore, ObservationIconRepository } from '../../../../lib/entities/observations/entities.observations.icons'
import { FindUserLocationsStreamSpec, UserLocation, UserLocationRepository } from '../../../../lib/entities/locations/entities.locations'
import { User, UserIconContentStore, UserIconType, UserRepository } from '../../../../lib/entities/users/entities.users'
import { Device, DevicesRepository } from '../../../../lib/entities/devices/entities.devices'
import { ExportParams, ExportTransform, IterateObservations } from '../../../../lib/app.impl/exports/app.impl.exports'
import { CsvExportTransform } from '../../../../lib/app.impl/exports/app.impl.exports.csv'
import { GeoJsonExportTransform } from '../../../../lib/app.impl/exports/app.impl.exports.geojson'
import { KmlExportTransform } from '../../../../lib/app.impl/exports/app.impl.exports.kml'
import { GeoPackageExportTransform } from '../../../../lib/app.impl/exports/app.impl.exports.geopackage'
import { ExportFormat } from '../../../../lib/entities/exports/entities.exports'

export const FIXTURE_EVENT_ID = 7

/** 1x1 transparent PNG */
export const PNG_BYTES = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')
export const ATTACHMENT_BYTES = Buffer.from('characterization-attachment-content:photo.jpg\n', 'utf-8')

export const fixtureForm: Form = {
  id: 10,
  archived: false,
  name: 'Characterization Form',
  description: 'Form with a field of every common type',
  color: '#AA00FF',
  userFields: [],
  primaryField: 'dropdownField',
  variantField: 'radioField',
  fields: [
    { id: 1, name: 'textField', title: 'Text Field', type: FormFieldType.Text, required: false },
    { id: 2, name: 'textareaField', title: 'Text Area Field', type: FormFieldType.TextArea, required: false },
    { id: 3, name: 'numberField', title: 'Number Field', type: FormFieldType.Numeric, required: false },
    { id: 4, name: 'dateField', title: 'Date Field', type: FormFieldType.DateTime, required: false },
    { id: 5, name: 'dropdownField', title: 'Dropdown Field', type: FormFieldType.Dropdown, required: false, choices: [
      { id: 0, title: 'Alpha', value: 0 },
      { id: 1, title: 'Bravo', value: 1 }
    ] },
    { id: 6, name: 'multiselectField', title: 'Multi Select Field', type: FormFieldType.MultiSelectDropdown, required: false, choices: [
      { id: 0, title: 'Red', value: 0 },
      { id: 1, title: 'Green', value: 1 },
      { id: 2, title: 'Blue', value: 2 }
    ] },
    { id: 7, name: 'checkboxField', title: 'Checkbox Field', type: FormFieldType.CheckBox, required: false },
    { id: 8, name: 'radioField', title: 'Radio Field', type: FormFieldType.Radio, required: false, choices: [
      { id: 0, title: 'One', value: 0 },
      { id: 1, title: 'Two', value: 1 }
    ] },
    { id: 9, name: 'emailField', title: 'Email Field', type: FormFieldType.Email, required: false },
    { id: 10, name: 'geometryField', title: 'Geometry Field', type: FormFieldType.Geometry, required: false },
    { id: 11, name: 'attachmentField', title: 'Attachment Field', type: FormFieldType.Attachment, required: false },
    { id: 12, name: 'hiddenField', title: 'Hidden Field', type: FormFieldType.Hidden, required: false },
    { id: 13, name: 'passwordField', title: 'Password Field', type: FormFieldType.Password, required: false },
  ]
}

export function fixtureEventAttrs(): MageEventAttrs {
  return {
    id: FIXTURE_EVENT_ID,
    name: 'Characterization Event',
    description: 'Pins export output bytes',
    layerIds: [],
    feedIds: [],
    forms: [ JSON.parse(JSON.stringify(fixtureForm)) ],
    style: { fill: '#00FF00', stroke: '#FF0000', fillOpacity: 0.2, strokeOpacity: 1, strokeWidth: 2 },
    acl: {}
  }
}

export function fixtureEvent(): MageEvent {
  return new MageEvent(fixtureEventAttrs())
}

export const users: { [id: string]: User } = {
  user1: {
    id: 'user1',
    username: 'alice',
    displayName: 'Alice Anders',
    active: true,
    enabled: true,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    lastUpdated: new Date('2024-01-02T00:00:00.000Z'),
    email: 'alice@example.test',
    phones: [],
    roleId: 'role1',
    authenticationId: 'auth1',
    icon: { type: UserIconType.Create, text: 'AA', color: '#FF0000', contentType: 'image/png', size: PNG_BYTES.length, relativePath: 'users/user1/icon.png' }
  },
  user2: {
    id: 'user2',
    username: 'bob',
    displayName: 'Bob Brown',
    active: true,
    enabled: true,
    createdAt: new Date('2024-01-03T00:00:00.000Z'),
    lastUpdated: new Date('2024-01-04T00:00:00.000Z'),
    phones: [],
    roleId: 'role1',
    authenticationId: 'auth2'
  }
}

export const devices: { [id: string]: Device } = {
  device1: {
    id: 'device1',
    uid: 'device-uid-0001',
    description: 'Characterization device',
    registered: true,
    user: 'user1',
    userAgent: 'MAGE Characterization/1.0',
    appVersion: '1.0.0'
  }
}

export function fixtureObservations(): ObservationAttrs[] {
  return [
    {
      id: 'obs1',
      eventId: FIXTURE_EVENT_ID,
      userId: 'user1',
      deviceId: 'device1',
      createdAt: new Date('2024-02-01T10:00:00.000Z'),
      lastModified: new Date('2024-02-01T10:05:00.000Z'),
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [ -104.9903, 39.7392 ] },
      properties: {
        timestamp: new Date('2024-02-01T09:58:30.000Z'),
        provider: 'gps',
        accuracy: 5,
        forms: [
          {
            id: 'entry1',
            formId: 10,
            textField: 'hello text',
            textareaField: 'line one\nline two',
            numberField: 42.5,
            dateField: new Date('2024-01-15T12:34:56.000Z'),
            dropdownField: 'Alpha',
            multiselectField: [ 'Red', 'Blue' ],
            checkboxField: true,
            radioField: 'Two',
            emailField: 'alice@example.test',
            geometryField: { type: 'Point', coordinates: [ -105.0, 39.75 ] },
            hiddenField: 'hidden value',
            passwordField: 'secret'
          }
        ]
      },
      attachments: [
        {
          id: 'att1',
          observationFormId: 'entry1',
          fieldName: 'attachmentField',
          lastModified: new Date('2024-02-01T10:01:00.000Z'),
          contentType: 'image/jpeg',
          size: ATTACHMENT_BYTES.length,
          name: 'photo.jpg',
          width: 640,
          height: 480,
          contentLocator: 'event7/obs1/att1.jpg',
          oriented: false,
          thumbnails: []
        }
      ],
      important: { userId: 'user2', timestamp: new Date('2024-02-01T10:02:00.000Z'), description: 'Look at this' },
      favoriteUserIds: [ 'user1', 'user2' ],
      states: [ { id: 'state1', name: 'active', userId: 'user1' } ]
    },
    {
      id: 'obs2',
      eventId: FIXTURE_EVENT_ID,
      userId: 'user2',
      createdAt: new Date('2024-02-02T11:00:00.000Z'),
      lastModified: new Date('2024-02-02T11:00:00.000Z'),
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [ [ [ -105.0, 39.7 ], [ -104.9, 39.7 ], [ -104.9, 39.8 ], [ -105.0, 39.8 ], [ -105.0, 39.7 ] ] ] },
      properties: {
        timestamp: new Date('2024-02-02T10:59:00.000Z'),
        provider: 'manual',
        forms: [
          {
            id: 'entry2',
            formId: 10,
            textField: 'polygon obs',
            numberField: 7,
            dropdownField: 'Bravo',
            multiselectField: [ 'Green' ],
            checkboxField: false
          }
        ]
      },
      attachments: [],
      favoriteUserIds: [],
      states: [ { id: 'state2', name: 'active', userId: 'user2' } ]
    }
  ]
}

export function fixtureLocations(): UserLocation[] {
  return [
    {
      id: 'loc1',
      userId: 'user1',
      eventId: FIXTURE_EVENT_ID,
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [ -104.95, 39.74 ] },
      properties: {
        timestamp: new Date('2024-02-01T09:50:00.000Z'),
        deviceId: 'device1',
        provider: 'gps',
        altitude: 1609.3,
        accuracy: 12.5,
        speed: 1.25,
        bearing: 90,
        battery_level: 81
      }
    } as unknown as UserLocation
  ]
}

export const icons: ObservationIcon[] = [
  { eventId: FIXTURE_EVENT_ID, formId: 10, contentLocator: 'icons/7/10/default.png' },
  { eventId: FIXTURE_EVENT_ID, formId: 10, primary: 'Alpha', contentLocator: 'icons/7/10/Alpha/default.png' },
  { eventId: FIXTURE_EVENT_ID, formId: 10, primary: 'Alpha', variant: 'Two', contentLocator: 'icons/7/10/Alpha/Two/default.png' },
  { eventId: FIXTURE_EVENT_ID, formId: 10, primary: 'Bravo', contentLocator: 'icons/7/10/Bravo/default.png' },
]

export interface FixtureRepositories {
  locationRepo: UserLocationRepository
  iterateObservations: IterateObservations
  attachmentStore: AttachmentStore
  deviceRepo: DevicesRepository
  userRepo: UserRepository
  iconRepo: ObservationIconRepository
  iconStore: ObservationIconContentStore
  userIconStore: UserIconContentStore
}

/**
 * In-memory stand-ins for the Mongoose/filesystem adapters.  Only the
 * methods the export transforms call are implemented; anything else throws
 * so an unexpected dependency shows up as a test failure.
 */
export function fixtureRepositories(): FixtureRepositories {
  const notImplemented = (name: string) => (): never => { throw new Error(`fixture does not implement ${name}`) }
  const locationRepo = {
    iterate(_spec: FindUserLocationsStreamSpec) { return Readable.from(fixtureLocations()) },
  } as unknown as UserLocationRepository
  const iterateObservations: IterateObservations = async (_event: MageEvent, _spec: FindObservationsStreamSpec) => {
    return Readable.from(fixtureObservations()) as AsyncIterable<ObservationAttrs>
  }
  const attachmentStore = {
    async readContent() { return Readable.from([ Buffer.from(ATTACHMENT_BYTES) ]) },
    readThumbnailContent: notImplemented('attachmentStore.readThumbnailContent'),
  } as unknown as AttachmentStore
  const deviceRepo = {
    async getDeviceById(id: string) { return devices[id] || null },
  } as unknown as DevicesRepository
  const userRepo = {
    async findById(id: string) { return users[id] || null },
  } as unknown as UserRepository
  const iconRepo: ObservationIconRepository = {
    async getIcon(eventId, formId, primary, variant) {
      const candidates = icons.filter(x => x.eventId === eventId)
      const match = (f?: number | null, p?: string | null, v?: string | null): ObservationIcon | undefined =>
        candidates.find(x => (x.formId ?? null) === (f ?? null) && (x.primary ?? null) === (p ?? null) && (x.variant ?? null) === (v ?? null))
      return match(formId, primary, variant) || match(formId, primary) || match(formId) || candidates[0] || null
    },
    async getIcons(eventId) { return icons.filter(x => x.eventId === eventId) }
  }
  const iconStore: ObservationIconContentStore = {
    async readContent() { return Readable.from([ Buffer.from(PNG_BYTES) ]) }
  }
  const userIconStore: UserIconContentStore = {
    async readContent(user: User) { return user.icon ? Readable.from([ Buffer.from(PNG_BYTES) ]) : null }
  }
  return { locationRepo, iterateObservations, attachmentStore, deviceRepo, userRepo, iconRepo, iconStore, userIconStore }
}

export function fixtureTransform(format: ExportFormat, repos: FixtureRepositories = fixtureRepositories()): ExportTransform {
  switch (format) {
    case 'csv':
      return new CsvExportTransform(repos.locationRepo, repos.iterateObservations, repos.attachmentStore, repos.deviceRepo, repos.userRepo)
    case 'geojson':
      return new GeoJsonExportTransform(repos.locationRepo, repos.iterateObservations, repos.attachmentStore, repos.deviceRepo, repos.userRepo)
    case 'kml':
      return new KmlExportTransform(repos.locationRepo, repos.iterateObservations, repos.iconRepo, repos.iconStore, repos.attachmentStore, repos.userRepo, repos.userIconStore)
    case 'geopackage':
      return new GeoPackageExportTransform(repos.locationRepo, repos.iterateObservations, repos.iconStore, repos.attachmentStore, repos.iconRepo, repos.userRepo, repos.userIconStore)
  }
  throw new Error(`unknown format ${format}`)
}

export function fixtureExportParams(): ExportParams {
  return {
    observationParams: {
      findSpec: {
        where: {
          stateIsAnyOf: [ 'active' ],
          timestampAfter: new Date('2024-01-01T00:00:00.000Z'),
          timestampBefore: new Date('2024-03-01T00:00:00.000Z')
        },
        includeAttachments: true
      }
    },
    locationParams: {
      findSpec: {
        where: {
          eventId: FIXTURE_EVENT_ID,
          timestampAfter: new Date('2024-01-01T00:00:00.000Z'),
          timestampBefore: new Date('2024-03-01T00:00:00.000Z')
        }
      }
    }
  }
}
