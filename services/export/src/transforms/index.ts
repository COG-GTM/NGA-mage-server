/**
 * Export transform contract and shared helpers.  Extracted verbatim from the
 * MAGE service module `service/src/app.impl/exports/app.impl.exports.ts`; the
 * four format transforms in this directory are the extracted copies of
 * `app.impl.exports.{csv,geojson,kml,geopackage}.ts`.
 */
import { Archiver } from 'archiver'
import { ExportFormat, ExportProjection, ExportSummary } from '@ngageoint/mage.service/lib/entities/exports/entities.exports'
import { FindObservationsStreamSpec, FormEntry, ObservationAttrs, ObservationId, ObservationRepositoryForEvent, ObservationSearchRepository } from '@ngageoint/mage.service/lib/entities/observations/entities.observations'
import { FindUserLocationsStreamSpec } from '@ngageoint/mage.service/lib/entities/locations/entities.locations'
import { FormId } from '@ngageoint/mage.service/lib/entities/events/entities.events.forms'
import { MageEvent } from '@ngageoint/mage.service/lib/entities/events/entities.events'

export interface ExportFactory {
  (format: ExportFormat): ExportTransform | null
}

export interface ObservationExportParams {
  findSpec: FindObservationsStreamSpec
  projection?: ExportProjection
}

export interface LocationExportParams {
  findSpec: FindUserLocationsStreamSpec
}

export interface ExportParams {
  observationParams?: ObservationExportParams
  locationParams?: LocationExportParams
}

export interface ExportTransform {
  export(event: MageEvent, archive: Archiver, params: ExportParams): Promise<ExportSummary>
}

export interface IterateObservations {
  (event: MageEvent, spec: FindObservationsStreamSpec): Promise<AsyncIterable<ObservationAttrs> & { close?: () => void }>
}

export function IterateObservations(
  obsRepoFactory: ObservationRepositoryForEvent,
  searchRepo: ObservationSearchRepository
): IterateObservations {
  return async function findStream(event: MageEvent, findSpec: FindObservationsStreamSpec): Promise<AsyncIterable<ObservationAttrs> & { close?: () => void }> {
    let ids: ObservationId[] | undefined = undefined
    if (findSpec.where?.fieldFilter) {
      ids = await searchRepo.findIdsByFilter(findSpec.where?.fieldFilter, event)
    }

    const observationRepository = await obsRepoFactory(event.id)
    return observationRepository.iterate({ ...findSpec, where: { ...findSpec.where, ids } })
  }
}

function projectionForForm(formId: FormId, projection: ExportProjection) {
  return projection.find(formProjection => formProjection.formId === formId)
}

export function projectionIncludesForm(formId: FormId, projection?: ExportProjection): boolean {
  if (!projection) return true
  return projectionForForm(formId, projection) !== undefined
}

export function projectionIncludesField(formId: FormId, fieldName: string, projection?: ExportProjection): boolean {
  if (!projection) return true
  const formProjection = projectionForForm(formId, projection)
  return formProjection?.fields.some(fieldProjection => fieldProjection === fieldName) ?? false
}

export function projectedObservationFormFields(observation: ObservationAttrs, projection?: ExportProjection): FormEntry[] {
  if (!projection) {
    return Array.from(observation.properties.forms)
  }

  return observation.properties.forms.filter(formEntry => {
    return projectionForForm(formEntry.formId, projection) !== undefined
  }).map(formEntry => {
    const formProjection = projectionForForm(formEntry.formId, projection)
    const projectedProperties: any = Object.fromEntries(
      Object.entries(formEntry).filter(([key]) => formProjection?.fields.includes(key))
    )

    return {
      ...projectedProperties,
      id: formEntry.id,
      formId: formEntry.formId,
    } as FormEntry
  })
}
