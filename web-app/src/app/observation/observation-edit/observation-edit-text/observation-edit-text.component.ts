import { Component, input } from '@angular/core';
import { UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

interface TextField {
  title: string,
  name: string,
  required: boolean
}

@Component({
    selector: 'observation-edit-text',
    templateUrl: './observation-edit-text.component.html',
    styleUrls: ['./observation-edit-text.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatError]
})
export class ObservationEditTextComponent {
  readonly formGroup = input<UntypedFormGroup>(undefined);
  readonly definition = input<TextField>(undefined);
}
