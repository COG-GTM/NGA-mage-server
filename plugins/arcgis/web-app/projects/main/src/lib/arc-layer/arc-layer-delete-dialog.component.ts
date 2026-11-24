import { Component, inject } from '@angular/core';
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
	dialogRef = inject<MatDialogRef<ArcLayerDeleteDialogComponent>>(MatDialogRef);
	data = inject(MAT_DIALOG_DATA);


	url: string

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {
		const data = this.data;

		this.url = data
	}
}
