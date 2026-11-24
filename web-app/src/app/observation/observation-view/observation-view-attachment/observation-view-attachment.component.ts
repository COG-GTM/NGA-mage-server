import { Component, Input, input } from '@angular/core';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { AttachmentComponent } from '../../attachment/attachment.component';

@Component({
    selector: 'observation-view-attachment',
    templateUrl: './observation-view-attachment.component.html',
    styleUrls: ['./observation-view-attachment.component.scss'],
    imports: [MatGridList, MatGridTile, AttachmentComponent]
})
export class ObservationViewAttachmentComponent {
  private _attachments: any[];

  readonly form = input<any>(undefined);
  readonly field = input<any>(undefined);
  @Input()
  set attachments(attachments: any[]) {
    this._attachments = attachments.filter(attachment => {
      return attachment.observationFormId === this.form().remoteId &&
        attachment.fieldName === this.field().name
    })
  }
  get attachments(): any[] {
    return this._attachments;
  }
}
