import { Component } from '@angular/core';
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
  forms: any[]

  constructor(
    filterService: FilterService,
    eventService: EventService,
    private bottomSheetRef: MatBottomSheetRef<ObservationEditFormPickerComponent>) {

    const event = filterService.getEvent();
    this.forms = eventService.getFormsForEvent(event, { archived: false });
  }

  formPicked(form: any): void {
    this.bottomSheetRef.dismiss(form)
  }

}
