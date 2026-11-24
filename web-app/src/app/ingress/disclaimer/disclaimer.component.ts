import { Component, EventEmitter, Input, Output } from '@angular/core'
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
  @Input() title!: string
  @Input() text!: string
  @Input() compact = false

  @Output() close = new EventEmitter<DiscalimeCloseEvent>()

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
