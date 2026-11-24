import { Component, input } from '@angular/core';
import { UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

interface EmailField {
  title: string,
  name: string,
  value: string,
  required: boolean
}

@Component({
    selector: 'observation-edit-email',
    templateUrl: './observation-edit-email.component.html',
    styleUrls: ['./observation-edit-email.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatError]
})
export class ObservationEditEmailComponent {
  readonly formGroup = input<UntypedFormGroup>(undefined);
  readonly definition = input<EmailField>(undefined);
}
