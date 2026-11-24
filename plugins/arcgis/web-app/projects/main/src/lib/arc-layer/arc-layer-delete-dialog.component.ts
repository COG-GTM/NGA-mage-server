import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'arc-layer-delete-dialog',
    templateUrl: 'arc-layer-delete-dialog.component.html',
    styleUrls: ['./arc-layer-delete-dialog.component.scss'],
    imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatButton, MatDialogClose, MatIcon]
})
export class ArcLayerDeleteDialogComponent {

	url: string

	constructor(
		public dialogRef: MatDialogRef<ArcLayerDeleteDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: string
	) {
		this.url = data
	}
}
