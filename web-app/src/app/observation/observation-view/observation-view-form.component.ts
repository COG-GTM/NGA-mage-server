import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnChanges, OnInit, SimpleChanges, input } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { ObservationViewAttachmentComponent } from './observation-view-attachment/observation-view-attachment.component';
import { ObservationViewGeometryComponent } from './observation-view-geometry/observation-view-geometry.component';
import { ObservationViewDateComponent } from './observation-view-date/observation-view-date.component';
import { ObservationViewCheckboxComponent } from './observation-view-checkbox/observation-view-checkbox.component';
import { ObservationViewTextComponent } from './observation-view-text/observation-view-text.component';
import { ObservationViewTextareaComponent } from './observation-view-textarea/observation-view-textarea.component';
import { ObservationViewPasswordComponent } from './observation-view-password/observation-view-password.component';
import { ObservationViewMultiselectdropdownComponent } from './observation-view-multiselectdropdown/observation-view-multiselectdropdown.component';
import { GeometryPipe } from '../../geometry/geometry.pipe';

@Component({
    selector: 'observation-view-form',
    templateUrl: './observation-view-form.component.html',
    styleUrls: ['./observation-view-form.component.scss'],
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
    imports: [MatCard, MatCardContent, MatIcon, MatIconButton, ObservationViewAttachmentComponent, ObservationViewGeometryComponent, ObservationViewDateComponent, ObservationViewCheckboxComponent, ObservationViewTextComponent, ObservationViewTextareaComponent, ObservationViewPasswordComponent, ObservationViewMultiselectdropdownComponent, GeometryPipe]
})
export class ObservationViewFormComponent implements OnInit, OnChanges {
  readonly form = input<any>(undefined);
  readonly attachments = input<any[]>(undefined);
  @Input() expand: boolean
  readonly geometryStyle = input<any>(undefined);

  primaryField: any = {}
  secondaryField: any = {}

  ngOnInit(): void {
    this.updateView()
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateView()
  }

  nonArchivedFields(fields: any[]): any[] {
    return fields
      .filter(field => !field.archived)
      .sort((a: { id: number }, b: { id: number }) => a.id - b.id);
  }

  hasContent(): boolean {
    const fields: any[] = this.form().fields
    return fields
      .filter(field => !field.archived)
      .some(field => {
        if (field.type === 'attachment') {
          return this.attachments().filter(attachment => attachment.observationFormId === this.form().remoteId).length
        } else {
          return field.value
        }
      })
  }

  private updateView(): void {
    const form = this.form();
    if (form.primaryFeedField) {
      this.primaryField = form.fields.find(field => field.name === this.form().primaryFeedField)
    }

    if (form.secondaryFeedField) {
      this.secondaryField = form.fields.find(field => field.name === this.form().secondaryFeedField)
    }
  }
}
