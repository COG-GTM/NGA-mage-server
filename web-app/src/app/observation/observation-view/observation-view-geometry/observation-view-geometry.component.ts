import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MapClipComponent } from '../../../map/clip/clip.component';
import { GeometryPipe } from '../../../geometry/geometry.pipe';

@Component({
    selector: 'observation-view-geometry',
    templateUrl: './observation-view-geometry.component.html',
    styleUrls: ['./observation-view-geometry.component.scss'],
    imports: [MapClipComponent, GeometryPipe]
})
export class ObservationViewGeometryComponent implements OnChanges {
  @Input() field: any
  @Input() featureStyle: any

  feature: any

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.field && this.field && this.field.value) {
      this.feature = {
        type: 'Feature',
        geometry: this.field.value,
        style: { ...this.featureStyle }
      }
    }
  }
}
