import { Component, Input } from '@angular/core';
import { MomentPipe } from '../../../moment/moment.pipe';

@Component({
    selector: 'observation-view-date',
    templateUrl: './observation-view-date.component.html',
    styleUrls: ['./observation-view-date.component.scss'],
    imports: [MomentPipe]
})
export class ObservationViewDateComponent {
  @Input() field: any
}
