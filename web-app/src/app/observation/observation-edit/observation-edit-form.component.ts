import { animate, state, style, transition, trigger } from '@angular/animations'
import { Component, EventEmitter, Input, Output } from '@angular/core'
import { UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { FormPreference } from 'core-lib-src/user'
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton, MatButton } from '@angular/material/button';
import { ObservationEditAttachmentComponent } from './observation-edit-attachment/observation-edit-attachment.component';
import { ObservationEditCheckboxComponent } from './observation-edit-checkbox/observation-edit-checkbox.component';
import { ObservationEditDateComponent } from './observation-edit-date/observation-edit-date.component';
import { ObservationEditSelectComponent } from './observation-edit-select/observation-edit-select.component';
import { ObservationEditMultiselectComponent } from './observation-edit-multiselect/observation-edit-multiselect.component';
import { ObservationEditEmailComponent } from './observation-edit-email/observation-edit-email.component';
import { ObservationEditNumberComponent } from './observation-edit-number/observation-edit-number.component';
import { ObservationEditRadioComponent } from './observation-edit-radio/observation-edit-radio.component';
import { ObservationEditTextComponent } from './observation-edit-text/observation-edit-text.component';
import { ObservationEditTextareaComponent } from './observation-edit-textarea/observation-edit-textarea.component';
import { ObservationEditPasswordComponent } from './observation-edit-password/observation-edit-password.component';
import { ObservationEditGeometryComponent } from './observation-edit-geometry/observation-edit-geometry.component';
import { MatDivider } from '@angular/material/list';
import { GeometryPipe } from '../../geometry/geometry.pipe';

@Component({
    selector: 'observation-edit-form',
    templateUrl: './observation-edit-form.component.html',
    styleUrls: ['./observation-edit-form.component.scss'],
    animations: [
        trigger('expand', [
            transition(':enter', [
                style({ height: 0, opacity: 0 }),
                animate('300ms', style({ height: '*', opacity: 1 })),
            ]),
            transition(':leave', [
                animate('300ms', style({ height: 0, opacity: 0 }))
            ])
        ]),
        trigger('rotate', [
            state('true', style({ transform: 'rotate(180deg)' })),
            state('false', style({ transform: 'rotate(0)' })),
            transition('* <=> *', animate('300ms ease-out'))
        ])
    ],
    imports: [MatCard, MatCardContent, MatIcon, MatIconButton, ObservationEditAttachmentComponent, FormsModule, ReactiveFormsModule, ObservationEditCheckboxComponent, ObservationEditDateComponent, ObservationEditSelectComponent, ObservationEditMultiselectComponent, ObservationEditEmailComponent, ObservationEditNumberComponent, ObservationEditRadioComponent, ObservationEditTextComponent, ObservationEditTextareaComponent, ObservationEditPasswordComponent, ObservationEditGeometryComponent, MatDivider, MatButton, GeometryPipe]
})
export class ObservationEditFormComponent {
  @Input() formGroup: UntypedFormGroup
  @Input() formPreferences: FormPreference
  @Input() definition: any
  @Input() geometryStyle: any
  @Input() attachmentUrl: string
  @Input() observation: any
  @Input() deletable = true
  @Input() options: { expand: boolean, deletable: boolean }

  @Output() remove = new EventEmitter<UntypedFormGroup>()
  @Output() featureEdit = new EventEmitter<any>()

  fieldNames: string[]
  fieldDefinitions: {}
  primaryField: any = {}
  primaryFieldValue: any
  secondaryField: any = {}
  secondaryFieldValue: any

  expand: boolean

  ngOnInit(): void {
    this.expand = this.options.expand;

    this.fieldDefinitions = this.definition.fields.reduce((map, field) => {
      map[field.name] = field
      return map
    }, {})

    const controlNames = Object.keys(this.formGroup.controls)
    this.fieldNames = this.definition.fields
      .filter(field => !field.archived)
      .filter(field => controlNames.includes(field.name))
      .sort((a, b) => a.id - b.id)
      .map(field => field.name)

    this.updateView()
  }
  
  nonArchivedFields(fields: any[]): any[] {
    return fields.filter(field => !field.archived).sort((a: any, b: any) => a.id - b.id );
  }

  onGeometryEdit(event): void {
    this.featureEdit.emit(event)
  }

  removeForm(): void {
    this.remove.emit(this.formGroup)
  }

  private updateView(): void {
    if (this.definition.primaryFeedField) {
      this.primaryField = this.definition.fields.find(field => field.name === this.definition.primaryFeedField)
      this.primaryFieldValue = this.getValue(this.definition.primaryFeedField)
    }

    if (this.definition.secondaryFeedField) {
      this.secondaryField = this.definition.fields.find(field => field.name === this.definition.secondaryFeedField)
      this.secondaryFieldValue = this.getValue(this.definition.secondaryFeedField)
    }
  }

  private getValue(fieldName: string): any {
    return this.formGroup.get(fieldName).value
  }
}
