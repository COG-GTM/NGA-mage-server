import { Component, output } from '@angular/core';
import { MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

export enum ZoomDirection {
  IN,
  OUT
}

export interface ZoomEvent {
  direction: ZoomDirection;
}

@Component({
    selector: 'map-control-zoom',
    templateUrl: './zoom.component.html',
    styleUrls: ['./zoom.component.scss'],
    imports: [MatMiniFabButton, MatIcon]
})
export class ZoomComponent {
  readonly onZoom = output<ZoomEvent>();

  onZoomIn($event: MouseEvent): void {
    $event.stopPropagation();
    this.onZoom.emit({ direction: ZoomDirection.IN });
  }

  onZoomOut($event: MouseEvent): void {
    $event.stopPropagation();
    this.onZoom.emit({ direction: ZoomDirection.OUT });
  }
}
