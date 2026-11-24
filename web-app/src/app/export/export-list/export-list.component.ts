import { Component, EventEmitter, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { ExportService } from '../export.service';
import { Subscription } from 'rxjs';
import { SidebarService } from 'src/app/sidebar/sidebar.service';
import { Export, ExportStatus } from '../entities.export';
import { MatToolbar } from '@angular/material/toolbar';
import { MatRipple } from '@angular/material/core';
import { ExportListItemComponent } from './export-list-item.component';
import { MatDivider } from '@angular/material/list';
import { MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'export-list',
    templateUrl: 'export-list.component.html',
    styleUrls: ['./export-list.component.scss'],
    imports: [MatToolbar, MatRipple, ExportListItemComponent, MatDivider, MatMiniFabButton, MatIcon]
})
export class ExportListComponent implements OnInit, OnDestroy {
  exportService = inject<ExportService>(ExportService);
  private sidebarService = inject(SidebarService);

  @Output() create = new EventEmitter<void>()

  exportStatus = ExportStatus
  exports: Export[] = []
  exportsSubscription: Subscription

  ngOnInit(): void {
    this.exportsSubscription = this.exportService.exports$.subscribe({
      next: (exports => {
        this.exports = exports
      })
    })
  }

  ngOnDestroy(): void {
    this.exportsSubscription?.unsubscribe()
  }

  trackExport(_index: number, exp: Export) {
    return exp.id
  }

  onCreate(): void {
    this.create.emit()
  }

  onClick(e: Export): void {
    this.sidebarService.viewExport(e)
  }
}
