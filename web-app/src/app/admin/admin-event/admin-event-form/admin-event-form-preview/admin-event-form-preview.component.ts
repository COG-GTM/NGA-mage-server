import { Component, OnChanges, inject, input, output } from '@angular/core';
import { MatDialog as MatDialog } from '@angular/material/dialog';
import { AdminEventFormPreviewDialogComponent } from './form-preview-dialog/admin-event-form-preview-dialog.component';

@Component({
    selector: 'admin-event-form-preview',
    templateUrl: './admin-event-form-preview.component.html',
    styleUrls: ['./admin-event-form-preview.component.scss'],
    standalone: true,
    // empty - template has no directives
    imports: [

    ]
})
export class AdminEventFormPreviewComponent implements OnChanges {
  dialog = inject(MatDialog);

  readonly formDefinition = input<any[]>(undefined);
  readonly onClose = output<void>();

  ngOnChanges(): void {
    if (this.formDefinition()) {
      this.openDialog()
    }
  }

  openDialog(): void {
    const dialog = this.dialog.open(AdminEventFormPreviewDialogComponent, {
      data: this.formDefinition(),
      width: '600px',
      maxWidth: '90vw'
    })

    dialog.afterClosed().subscribe(() => {
      this.onClose.emit();
    });
  }
}