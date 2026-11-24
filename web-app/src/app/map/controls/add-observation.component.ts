import { Component, AfterViewInit, ElementRef, output, viewChild } from '@angular/core';
import { DomEvent } from 'leaflet';
import { MatFabButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'map-control-add-observation',
    templateUrl: './add-observation.component.html',
    styleUrls: ['./add-observation.component.scss'],
    imports: [MatFabButton, MatTooltip, MatIcon]
})
export class AddObservationComponent implements AfterViewInit {
  readonly button = viewChild.required<ElementRef<HTMLElement>>('addObservationButton');

  readonly onAddObservation = output<void>();

  ngAfterViewInit(): void {
    const button = this.button();
    if (button?.nativeElement) {
      DomEvent.disableClickPropagation(button.nativeElement);
    }
  }

  addObservation($event: MouseEvent): void {
    $event.stopPropagation();
    this.onAddObservation.emit();
  }
}