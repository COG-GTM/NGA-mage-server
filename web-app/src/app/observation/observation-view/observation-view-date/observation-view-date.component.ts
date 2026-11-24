import { Component, input } from '@angular/core';
import { MomentPipe } from '../../../moment/moment.pipe';

@Component({
    selector: 'observation-view-date',
    templateUrl: './observation-view-date.component.html',
    styleUrls: ['./observation-view-date.component.scss'],
    imports: [MomentPipe]
})
export class ObservationViewDateComponent {
  readonly field = input<any>(undefined);
}
