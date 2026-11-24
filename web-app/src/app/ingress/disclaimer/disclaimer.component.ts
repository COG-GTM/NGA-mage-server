import { Component, input, output } from '@angular/core'
import { MatButton } from '@angular/material/button';

export enum DiscalimerCloseReason  {
  ACCEPT, REJECT
}

export interface DiscalimeCloseEvent {
  reason: DiscalimerCloseReason
}

@Component({
    selector: 'disclaimer',
    templateUrl: './disclaimer.component.html',
    styleUrls: ['./disclaimer.component.scss'],
    imports: [MatButton]
})
export class DisclaimerComponent {
  readonly title = input.required<string>();
  readonly text = input.required<string>();
  readonly compact = input(false);

  readonly close = output<DiscalimeCloseEvent>();

  onAccept(): void {
    this.close.emit({
      reason: DiscalimerCloseReason.ACCEPT
    })
  }

  onReject(): void {
    this.close.emit({
      reason: DiscalimerCloseReason.REJECT
    })
  }

}
