import { Component } from '@angular/core';
import { MatDialogRef as MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'observation-edit-discard',
    templateUrl: './observation-edit-discard.component.html',
    styleUrls: ['./observation-edit-discard.component.scss'],
    imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatButton]
})
export class ObservationEditDiscardComponent {

  constructor(public dialogRef: MatDialogRef<ObservationEditDiscardComponent>) {
  }

  close(): void {
    this.dialogRef.close();
  }

  discard(): void {
    this.dialogRef.close('discard');
  }

}
