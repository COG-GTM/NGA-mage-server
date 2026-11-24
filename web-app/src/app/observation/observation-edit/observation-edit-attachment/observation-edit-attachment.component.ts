import { ChangeDetectorRef, Component, Input, OnInit, inject, input } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { AttachmentAction } from './observation-edit-attachment-action';
import { AttachmentComponent } from '../../attachment/attachment.component';
import { AttachUploadComponent } from '../../attachment/attachment-upload/attachment-upload.component';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';

interface AttachmentField {
  title: string,
  name: string,
  value: any[],
  min: number,
  max: number
}

@Component({
    selector: 'observation-edit-attachment',
    templateUrl: './observation-edit-attachment.component.html',
    styleUrls: ['./observation-edit-attachment.component.scss'],
    imports: [AttachmentComponent, AttachUploadComponent, MatIcon, MatButton]
})
export class ObservationEditAttachmentComponent implements OnInit {
  private changeDetector = inject(ChangeDetectorRef);

  readonly formGroup = input<UntypedFormGroup>(undefined);
  readonly definition = input<AttachmentField>(undefined);
  readonly url = input<string>(undefined);
  @Input() attachments: any[]

  control: UntypedFormControl
  uploadId = 0
  uploadAttachments = false

  ngOnInit(): void {
    this.control = this.formGroup().get(this.definition().name) as UntypedFormControl
  }

  trackByAttachment(index: number, attachment: any): any {
    return attachment.id
  }

  allAttachments(): any[] {
    const observationFormId = this.formGroup().get('id')?.value
    const attachments = (this.attachments || []).filter(attachment => {
      return attachment.observationFormId === observationFormId &&
        attachment.fieldName === this.definition().name
    });

    return this.control.value ? attachments.concat(this.control.value) : attachments
  }

  onAttachmentFile(event): void {
    const attachments = this.control.value || []
    const files = Array.from(event.target.files)
    files.forEach((file: File) => {
      const id = this.uploadId++;
      attachments.push({
        id: id,
        formId: this.formGroup().get('formId').value,
        name: file.name,
        size: file.size,
        contentType: file.type,
        action: AttachmentAction.ADD,
        file: file
      })
    })

    this.control.setValue(attachments)

    this.changeDetector.detectChanges()
  }

  deleteAttachment(attachmentToDelete): void {
    this.attachments = this.attachments.filter(attachment => attachment.id !== attachmentToDelete.id)
    attachmentToDelete.action = AttachmentAction.DELETE

    const value = this.control.value || []
    value.push(attachmentToDelete)
    this.control.setValue(value)
  }

  removeAttachment($event): void {
    const attachments = this.control.value || []
    this.control.setValue(attachments.filter(attachment => attachment.id !== $event.id))
  }
}