import { Component, Input } from '@angular/core';
import { UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { MatError } from '@angular/material/form-field';

/**
 * TODO: move to forms model module (which doesn't exist yet)
 */
interface RadioField {
  title: string,
  name: string,
  required: boolean,
  choices: { title: string }[]
}

@Component({
    selector: 'observation-edit-radio',
    templateUrl: './observation-edit-radio.component.html',
    styleUrls: ['./observation-edit-radio.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, MatRadioGroup, MatRadioButton, MatError]
})
export class ObservationEditRadioComponent {
  @Input() formGroup: UntypedFormGroup
  @Input() definition: RadioField
}
