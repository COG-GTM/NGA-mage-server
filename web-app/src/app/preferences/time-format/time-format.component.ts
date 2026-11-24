import { Component, OnInit } from '@angular/core';
import { MatSelectChange as MatSelectChange, MatSelect } from '@angular/material/select';
import { LocalStorageService } from 'src/app/http/local-storage.service';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatOption } from '@angular/material/autocomplete';

interface TimeFormatOption {
  title: string
  format: 'absolute' | 'relative'
}

@Component({
    selector: 'time-format',
    templateUrl: './time-format.component.html',
    styleUrls: ['./time-format.component.scss'],
    imports: [MatFormField, MatLabel, MatIcon, MatPrefix, MatSelect, MatOption]
})
export class TimeFormatComponent implements OnInit {

  formatOptions: TimeFormatOption[] = [{
    title: 'Absolute',
    format: 'absolute'
  }, {
    title: 'Relative',
    format: 'relative'
  }]
  formatOption: TimeFormatOption

  constructor(
    private localStorageService: LocalStorageService
  ) {}

  ngOnInit(): void {
    const format = this.localStorageService.getTimeFormat()
    this.formatOption = this.formatOptions.find((option: TimeFormatOption) => option.format === format)
  }

  updateTimeFormat(change: MatSelectChange) {
    this.localStorageService.setTimeFormat(change.value.format);
  }

  public compareFormat = function (option: TimeFormatOption, value: TimeFormatOption): boolean {
    return option.format === value.format
  }
}