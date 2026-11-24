import { Component, OnInit, inject } from '@angular/core';
import { MatSelectChange as MatSelectChange, MatSelect } from '@angular/material/select';
import { LocalStorageService } from 'src/app/http/local-storage.service';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatOption } from '@angular/material/autocomplete';

interface CoordinateSystemOption {
  title: string
  coordinateSystem: 'wgs84' | 'mgrs' | 'dms'
}

@Component({
    selector: 'coordinate-system',
    templateUrl: './coordinate-system.component.html',
    styleUrls: ['./coordinate-system.component.scss'],
    imports: [MatFormField, MatLabel, MatIcon, MatPrefix, MatSelect, MatOption]
})
export class CoordinateSystemComponent implements OnInit {
  private localStorageService = inject(LocalStorageService);


  coordinateSystemOptions: CoordinateSystemOption[] = [{
    title: 'Lat/Lng',
    coordinateSystem: 'wgs84'
  },{
    title: 'MGRS',
    coordinateSystem: 'mgrs'
  },{
    title: 'DMS',
    coordinateSystem: 'dms'
  }]
  coordinateSystemOption: CoordinateSystemOption

  ngOnInit(): void {
    const coordinateSystem = this.localStorageService.getCoordinateSystemView()
    this.coordinateSystemOption = this.coordinateSystemOptions.find((option: CoordinateSystemOption) => option.coordinateSystem === coordinateSystem)
  }

  updateCoordinateSystem(change: MatSelectChange) {
    this.localStorageService.setCoordinateSystemView(change.value.coordinateSystem);
  }

  public compareOption = function (option: CoordinateSystemOption, value: CoordinateSystemOption): boolean {
    return option.coordinateSystem === value.coordinateSystem
  }
}