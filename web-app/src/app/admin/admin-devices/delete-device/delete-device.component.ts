import { Component, inject } from '@angular/core';
import { MatDialogRef as MatDialogRef, MAT_DIALOG_DATA as MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Device } from '../../../entities/device/device';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
    selector: 'mage-delete-device',
    templateUrl: './delete-device.component.html',
    styleUrls: ['./delete-device.component.scss'],
    standalone: true,
    imports: [
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        A11yModule
    ]
})
export class DeleteDeviceComponent {
    dialogRef = inject<MatDialogRef<DeleteDeviceComponent>>(MatDialogRef);
    data = inject<{
    device: Device;
}>(MAT_DIALOG_DATA);


    cancel(): void {
        this.dialogRef.close();
    }

    confirmDelete(): void {
        this.dialogRef.close({ confirmed: true });
    }
}
