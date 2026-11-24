import { Component, Input, input } from '@angular/core';
import { AdminBreadcrumb } from './admin-breadcrumb.model';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { NgClass, SlicePipe } from '@angular/common';

@Component({
    selector: 'admin-breadcrumb',
    templateUrl: './admin-breadcrumb.component.html',
    styleUrls: ['./admin-breadcrumb.component.scss'],
    standalone: true,
    imports: [
      MatIconModule,
      MatToolbarModule,
      RouterLink,
      NgClass,
      SlicePipe
    ]
})
export class AdminBreadcrumbComponent {
  readonly icon = input<string>();
  readonly iconClass = input<string>();
  readonly route = input<string[]>();
  @Input() breadcrumbs!: AdminBreadcrumb[];
}
