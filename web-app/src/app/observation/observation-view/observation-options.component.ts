import { Component, inject } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatActionList, MatListItem, MatListItemIcon, MatListItemTitle } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';

export enum ObservationOption {
  DOWNLOAD,
  DELETE
}

@Component({
    selector: 'observation-options',
    templateUrl: './observation-options.component.html',
    styleUrls: ['./observation-options.component.scss'],
    imports: [MatActionList, MatListItem, MatIcon, MatListItemIcon, MatListItemTitle]
})
export class ObservationOptionsComponent {
  private bottomSheetRef = inject<MatBottomSheetRef<ObservationOptionsComponent>>(MatBottomSheetRef);

  public options: typeof ObservationOption = ObservationOption;

  onOption(option: ObservationOption): void {
    this.bottomSheetRef.dismiss(option)
  }

}
