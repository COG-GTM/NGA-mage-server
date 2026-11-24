import { Component, inject } from '@angular/core';
import { MatDialogRef as MatDialogRef, MatDialogContent, MatDialogTitle, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'password-reset-dialog',
    templateUrl: './password-reset-success-dialog.html',
    styleUrls: ['./password-reset-success-dialog.scss'],
    imports: [CdkScrollable, MatDialogContent, MatIcon, MatDialogTitle, MatDialogActions, MatButton, MatDialogClose]
})
export class PasswordResetSuccessDialog {
  dialogRef = inject<MatDialogRef<PasswordResetSuccessDialog>>(MatDialogRef);

}