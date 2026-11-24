import { Component, OnInit, inject } from '@angular/core';
import { MatSelectChange as MatSelectChange, MatSelect } from '@angular/material/select';
import { LocalStorageService } from 'src/app/http/local-storage.service';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatOption } from '@angular/material/autocomplete';

interface TimeZoneOption {
  title: string
  timezone: 'local' | 'gmt'
}

@Component({
    selector: 'time-zone',
    templateUrl: './time-zone.component.html',
    styleUrls: ['./time-zone.component.scss'],
    imports: [MatFormField, MatLabel, MatIcon, MatPrefix, MatSelect, MatOption]
})
export class TimeZoneComponent implements OnInit {
  private localStorageService = inject(LocalStorageService);


  timezoneOptions: TimeZoneOption[] = [{
    title: 'Local',
    timezone: 'local'
  }, {
    title: 'GMT',
    timezone: 'gmt'
  }]
  timezoneOption: TimeZoneOption

  ngOnInit(): void {
    const timezone = this.localStorageService.getTimeZoneView()
    this.timezoneOption = this.timezoneOptions.find((option: TimeZoneOption) => option.timezone === timezone)
  }

  updateTimeZone(change: MatSelectChange) {
    this.localStorageService.setTimeZoneView(change.value.timezone);
  }

  public compareOption = function (option: TimeZoneOption, value: TimeZoneOption): boolean {
    return option.timezone === value.timezone
  }
}