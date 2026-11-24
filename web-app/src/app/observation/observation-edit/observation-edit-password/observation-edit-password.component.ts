import { Component, Input } from '@angular/core';
import { UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

interface PasswordField {
  title: string,
  name: string,
  required: boolean
}

@Component({
    selector: 'observation-edit-password',
    templateUrl: './observation-edit-password.component.html',
    styleUrls: ['./observation-edit-password.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatError]
})
export class ObservationEditPasswordComponent {
  @Input() formGroup: UntypedFormGroup
  @Input() definition: PasswordField
}
