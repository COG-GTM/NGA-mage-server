import { Component, inject } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { EventService } from '../../event/event.service';
import { FilterService } from '../../filter/filter.service';
import { MatDivider, MatNavList, MatListItem, MatListItemIcon, MatListItemTitle, MatListItemLine } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-observation-edit-form-picker',
    templateUrl: './observation-edit-form-picker.component.html',
    styleUrls: ['./observation-edit-form-picker.component.scss'],
    imports: [MatDivider, MatNavList, MatListItem, MatIcon, MatListItemIcon, MatListItemTitle, MatListItemLine]
})
export class ObservationEditFormPickerComponent {
  private bottomSheetRef = inject<MatBottomSheetRef<ObservationEditFormPickerComponent>>(MatBottomSheetRef);

  forms: any[]

  constructor() {
    const filterService = inject(FilterService);
    const eventService = inject(EventService);


    const event = filterService.getEvent();
    this.forms = eventService.getFormsForEvent(event, { archived: false });
  }

  formPicked(form: any): void {
    this.bottomSheetRef.dismiss(form)
  }

}
