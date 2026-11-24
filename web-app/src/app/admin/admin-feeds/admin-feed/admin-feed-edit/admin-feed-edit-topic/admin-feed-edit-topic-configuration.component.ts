import {
  Component,
  DestroyRef,
  Input,
  ViewEncapsulation,
  inject,
  input,
  output
} from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatButtonModule } from '@angular/material/button'
import { Subject } from 'rxjs'
import { debounceTime } from 'rxjs/operators'
import { JsonSchemaFormWithServiceComponent } from '../../../../json-schema/json-schema.component'

@Component({
    selector: 'app-topic-configuration',
    templateUrl: './admin-feed-edit-topic-configuration.component.html',
    styleUrls: ['./admin-feed-edit-topic-configuration.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [MatExpansionModule, MatButtonModule, JsonSchemaFormWithServiceComponent]
})
export class AdminFeedEditTopicConfigurationComponent {
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  @Input() fetchParametersSchema: any
  readonly initialFetchParameters = input<any>(undefined);
  readonly expanded = input<boolean>(undefined);
  readonly showPrevious = input<boolean>(undefined);
  readonly fetchParametersChanged = output<any>();
  readonly fetchParametersAccepted = output<any>();
  readonly cancelled = output();
  readonly opened = output();

  readonly changeDebounceInterval = 500

  private fetchParametersMod: any = {}
  private debounceChange = new Subject<any>()

  formOptions = {
    addSubmit: false
  }

  constructor() {
    this.debounceChange.pipe(
      debounceTime(this.changeDebounceInterval),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(x => { this.fetchParametersChanged.emit(x) })
  }

  onFetchParametersChanged($event: any): void {
    this.fetchParametersMod = $event
    this.debounceChange.next(this.fetchParametersMod)
  }

  finish(): void {
    this.fetchParametersAccepted.emit(this.fetchParametersMod)
  }

  cancel(): void {
    this.cancelled.emit()
  }
}
