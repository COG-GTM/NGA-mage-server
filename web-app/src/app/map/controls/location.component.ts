import {
  Component,
  AfterViewInit,
  ElementRef,
  Input,
  output,
  viewChild
} from '@angular/core';
import { DomEvent } from 'leaflet';
import { MatMiniFabButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

export enum LocationState {
  Off,
  Locate,
  Broadcast
}

export interface LocationEvent {
  state: LocationState;
}

@Component({
    selector: 'map-control-location',
    templateUrl: './location.component.html',
    styleUrls: ['./location.component.scss'],
    imports: [MatMiniFabButton, MatTooltip, NgClass, MatIcon]
})
export class LocationComponent implements AfterViewInit {
  readonly locateButton = viewChild.required<ElementRef<HTMLElement>>('locateButton');
  readonly broadcastButton = viewChild.required<ElementRef<HTMLElement>>('broadcastButton');

  @Input() state: LocationState;
  readonly stageChange = output<LocationEvent>();

  LocationState = LocationState;

  ngAfterViewInit(): void {
    const locateButton = this.locateButton();
    if (locateButton?.nativeElement) {
      DomEvent.disableClickPropagation(locateButton.nativeElement);
    }

    const broadcastButton = this.broadcastButton();
    if (broadcastButton?.nativeElement) {
      DomEvent.disableClickPropagation(broadcastButton.nativeElement);
    }
  }

  onLocate(): void {
    this.stageChange.emit({
      state:
        this.state === LocationState.Off
          ? LocationState.Locate
          : LocationState.Off
    });
  }

  onBroadcast(): void {
    this.stageChange.emit({
      state:
        this.state === LocationState.Broadcast
          ? LocationState.Locate
          : LocationState.Broadcast
    });
  }
}
