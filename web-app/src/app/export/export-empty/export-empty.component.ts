import { Component, EventEmitter, Output } from "@angular/core"
import { MatIcon } from "@angular/material/icon";
import { MatButton } from "@angular/material/button";

@Component({
    selector: 'export-empty',
    templateUrl: 'export-empty.component.html',
    styleUrls: ['./export-empty.component.scss'],
    imports: [MatIcon, MatButton]
})
export class ExportEmptyComponent {

  @Output() open = new EventEmitter<void>()

  openExport(): void {
    this.open.emit()
  }
}
