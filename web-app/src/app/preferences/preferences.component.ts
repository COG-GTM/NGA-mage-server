import { Component } from '@angular/core';
import { PollingIntervalComponent } from './polling-interval/polling-interval.component';
import { TimeFormatComponent } from './time-format/time-format.component';
import { TimeZoneComponent } from './time-zone/time-zone.component';
import { CoordinateSystemComponent } from './coordinate-system/coordinate-system.component';

@Component({
    selector: 'preferences',
    templateUrl: './preferences.component.html',
    styleUrls: ['./preferences.component.scss'],
    imports: [PollingIntervalComponent, TimeFormatComponent, TimeZoneComponent, CoordinateSystemComponent]
})
export class PreferencesComponent  {}