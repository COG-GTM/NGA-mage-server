import { Component, Input } from '@angular/core';
import { UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

interface TextareaField {
  title: string,
  name: string,
  required: boolean
}

@Component({
    selector: 'observation-edit-textarea',
    templateUrl: './observation-edit-textarea.component.html',
    styleUrls: ['./observation-edit-textarea.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatError]
})
export class ObservationEditTextareaComponent {
  @Input() formGroup: UntypedFormGroup
  @Input() definition: TextareaField
}
