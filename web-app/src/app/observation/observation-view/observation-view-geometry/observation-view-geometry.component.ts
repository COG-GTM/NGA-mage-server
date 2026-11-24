import { Component, OnChanges, SimpleChanges, input } from '@angular/core';
import { MapClipComponent } from '../../../map/clip/clip.component';
import { GeometryPipe } from '../../../geometry/geometry.pipe';

@Component({
    selector: 'observation-view-geometry',
    templateUrl: './observation-view-geometry.component.html',
    styleUrls: ['./observation-view-geometry.component.scss'],
    imports: [MapClipComponent, GeometryPipe]
})
export class ObservationViewGeometryComponent implements OnChanges {
  readonly field = input<any>(undefined);
  readonly featureStyle = input<any>(undefined);

  feature: any

  ngOnChanges(changes: SimpleChanges): void {
    const field = this.field();
    if (changes.field && field && field.value) {
      this.feature = {
        type: 'Feature',
        geometry: field.value,
        style: { ...this.featureStyle() }
      }
    }
  }
}
