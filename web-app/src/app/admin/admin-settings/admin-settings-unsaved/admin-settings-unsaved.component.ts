import { Component, NgZone, inject } from '@angular/core'
import { MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { A11yModule } from '@angular/cdk/a11y'

@Component({
    selector: 'admin-settings-unsaved',
    templateUrl: './admin-settings-unsaved.component.html',
    styleUrls: ['./admin-settings-unsaved.component.scss'],
    standalone: true,
    imports: [
        MatDialogModule,
        MatButtonModule,
        A11yModule
    ]
})
export class AdminSettingsUnsavedComponent {
    private readonly dialogRef = inject<MatDialogRef<AdminSettingsUnsavedComponent>>(MatDialogRef);
    private readonly ngZone = inject(NgZone);


    stay(): void {
        this.ngZone.run(() => {
            this.dialogRef.close({ discard: false });
        });
    }

    discard(): void {
        this.ngZone.run(() => {
            this.dialogRef.close({ discard: true });
        });
    }
}