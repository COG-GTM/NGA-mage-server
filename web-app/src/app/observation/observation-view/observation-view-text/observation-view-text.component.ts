import { Component, input } from '@angular/core';

@Component({
    selector: 'observation-view-text',
    templateUrl: './observation-view-text.component.html',
    styleUrls: ['./observation-view-text.component.scss']
})
export class ObservationViewTextComponent {
  readonly field = input<any>(undefined);
}
