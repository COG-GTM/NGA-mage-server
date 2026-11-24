import { Component, Input, OnInit, inject } from '@angular/core';
import { Feature } from 'geojson';
import { SidebarService } from 'src/app/sidebar/sidebar.service';
import { Feed } from '@ngageoint/mage.web-core-lib/feed';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MomentPipe } from '../../../moment/moment.pipe';

@Component({
    selector: 'feed-item-map-popup',
    templateUrl: './feed-item-map-popup.component.html',
    styleUrls: ['./feed-item-map-popup.component.scss'],
    imports: [MatIconButton, MatIcon, MomentPipe]
})
export class FeedItemMapPopupComponent implements OnInit {
  private sidebarService = inject(SidebarService);

  @Input() feed: Feed;
  @Input() item: Feature;

  hasContent = false;
  timestamp: number;
  primary: string;
  secondary: string;

  ngOnInit(): void {
    if (!this.item || !this.item.properties) return;

    if (this.feed.itemTemporalProperty && this.item.properties[this.feed.itemTemporalProperty] != null) {
      this.timestamp = this.item.properties[this.feed.itemTemporalProperty];
      this.hasContent = true;
    }

    if (this.feed.itemPrimaryProperty && this.item.properties[this.feed.itemPrimaryProperty] != null) {
      this.primary = this.item.properties[this.feed.itemPrimaryProperty];
      this.hasContent = true;
    }

    if (this.feed.itemSecondaryProperty && this.item.properties[this.feed.itemSecondaryProperty] != null) {
      this.secondary = this.item.properties[this.feed.itemSecondaryProperty];
      this.hasContent = true;
    }
  }

  onInfo(): void {
    this.sidebarService.selectFeedItem(this.feed, this.item);
  }

}
