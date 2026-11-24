import { Component, Input } from '@angular/core';
import { IconReference, FeedIconModule } from '@ngageoint/mage.web-core-lib/feed/feed-icon';
import { MatTooltip } from '@angular/material/tooltip';

export interface FeedTab {
  id: string,
  title: string;
  icon?: IconReference;
  count?: number;
  feed?: any;
}

@Component({
    selector: 'sidebar-tab',
    templateUrl: './sidebar-tab.component.html',
    styleUrls: ['./sidebar-tab.component.scss'],
    imports: [FeedIconModule, MatTooltip]
})
export class SidebarTabComponent {
  @Input() tab: FeedTab;
  @Input() active: boolean;
}
