import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MapClipComponent } from '../../../map/clip/clip.component';
import { MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'observation-edit-geometry-map',
    templateUrl: './observation-edit-geometry-map.component.html',
    styleUrls: ['./observation-edit-geometry-map.component.scss'],
    imports: [MapClipComponent, MatMiniFabButton, MatIcon]
})
export class ObservationEditGeometryMapComponent {
  @Input() feature: any
  @Output() onEdit = new EventEmitter<void>();

  edit(): void {
    this.onEdit.emit();
  }

}
