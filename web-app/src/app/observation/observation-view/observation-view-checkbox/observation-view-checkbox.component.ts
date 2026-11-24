import { Component, input } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
    selector: 'observation-view-checkbox',
    templateUrl: './observation-view-checkbox.component.html',
    styleUrls: ['./observation-view-checkbox.component.scss'],
    imports: [MatCheckbox]
})
export class ObservationViewCheckboxComponent {
  readonly field = input<any>(undefined);
}
