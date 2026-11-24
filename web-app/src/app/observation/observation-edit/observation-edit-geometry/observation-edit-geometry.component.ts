import { Component, ElementRef, OnChanges, SimpleChanges, inject, input, output, viewChild } from '@angular/core'
import { UntypedFormGroup } from '@angular/forms'
import { Feature, Geometry } from 'geojson'
import { LocalStorageService } from '../../../http/local-storage.service'
import { NgClass } from '@angular/common';
import { ObservationEditGeometryMapComponent } from './observation-edit-geometry-map.component';
import { ObservationEditGeometryFormComponent } from './observation-edit-geometry-form.component';
import { GeometryPipe } from '../../../geometry/geometry.pipe';

@Component({
    selector: 'observation-edit-geometry',
    templateUrl: './observation-edit-geometry.component.html',
    styleUrls: ['./observation-edit-geometry.component.scss'],
    imports: [NgClass, ObservationEditGeometryMapComponent, ObservationEditGeometryFormComponent, GeometryPipe]
})
export class ObservationEditGeometryComponent implements OnChanges {
  private localStorageService = inject(LocalStorageService);

  readonly formGroup = input<UntypedFormGroup>(undefined);
  readonly definition = input<any>(undefined);

  readonly featureId = input<string>(undefined);
  readonly featureStyle = input<any>(undefined);

  readonly onFeatureEdit = output<any>();

  readonly geometryElement = viewChild<ElementRef>('geometry');

  edit = false
  mapFeature: any
  editFeature: any

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.formGroup && changes.formGroup.currentValue) {
      this.mapFeature = {
        id: this.featureId(),
        type: 'Feature',
        geometry: changes.formGroup.currentValue.get(this.definition().name).value
      }
    }

    if (changes.featureStyle && changes.featureStyle.currentValue) {
      const featureStyle = this.featureStyle();
      this.mapFeature = {
        id: this.featureId(),
        type: 'Feature',
        geometry: this.formGroup().get(this.definition().name).value,
        style: featureStyle ? JSON.parse(JSON.stringify(featureStyle)) : null
      }
    }
  }

  startGeometryEdit(): void {
    this.edit = true;

    const value = this.formGroup().get(this.definition().name).value
    if (value) {
      const featureStyle = this.featureStyle();
      this.editFeature = {
        id: this.featureId(),
        type: 'Feature',
        geometry: value,
        style: featureStyle ? JSON.parse(JSON.stringify(featureStyle)) : null
      }
    } else {
      const mapPosition = this.localStorageService.getMapPosition();
      const featureStyle = this.featureStyle();
      this.editFeature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [mapPosition.center.lng, mapPosition.center.lat]
        },
        style: featureStyle ? JSON.parse(JSON.stringify(featureStyle)) : null
      }
    }

    this.onFeatureEdit.emit({
      action: 'edit',
      source: this.geometryElement()
    })
  }

  saveGeometryEdit(event: any): void {
    this.edit = false
    this.mapFeature = event.feature

    // TODO normalize geometry
    this.formGroup().get(this.definition().name).setValue(this.normalizeGeometry(event.feature))

    this.onFeatureEdit.emit({
      action: 'none',
      source: this.geometryElement()
    })
  }

  cancelGeometryEdit(): void {
    this.edit = false;

    this.onFeatureEdit.emit({
      action: 'none'
    })
  }

  private normalizeGeometry(feature: Feature<Geometry>): Geometry {
    const geometry = feature ? feature.geometry : null
    if (!geometry) return geometry

    switch (geometry.type) {
      case 'Point':
        if (geometry.coordinates[0] < -180) geometry.coordinates[0] = geometry.coordinates[0] + 360
        else if (geometry.coordinates[0] > 180) geometry.coordinates[0] = geometry.coordinates[0] - 360
        break;
      case 'LineString':
        for (let i = 0; i < geometry.coordinates.length; i++) {
          const coord = geometry.coordinates[i];
          while (coord[0] < -180) coord[0] = coord[0] + 360
          while (coord[0] > 180) coord[0] = coord[0] - 360
        }
        break;
      case 'Polygon':
        for (let p = 0; p < geometry.coordinates.length; p++) {
          const poly = geometry.coordinates[p];
          for (let i = 0; i < poly.length; i++) {
            const coord = poly[i];
            while (coord[0] < -180) coord[0] = coord[0] + 360
            while (coord[0] > 180) coord[0] = coord[0] - 360
          }
        }
        break;
    }

    return geometry
  }

}
