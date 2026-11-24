import { Component, Input, OnChanges, SimpleChanges, inject, input, viewChild } from '@angular/core';
import { MatRipple } from '@angular/material/core';
import { Feed } from '@ngageoint/mage.web-core-lib/feed';
import { Feature } from 'geojson';
import { SidebarService } from '../../../sidebar/sidebar.service';
import { MapService } from '../../../map/map.service';
import { SessionService } from 'mage-web-app/http/session.service';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { StaticIconModule } from '@ngageoint/mage.web-core-lib/static-icon';
import { MomentPipe } from '../../../moment/moment.pipe';

@Component({
    selector: 'feed-item-summary',
    templateUrl: './feed-item-summary.component.html',
    styleUrls: ['./feed-item-summary.component.scss'],
    imports: [MatCard, MatRipple, MatCardContent, MatIcon, StaticIconModule, MomentPipe]
})
export class FeedItemSummaryComponent implements OnChanges {
  private sidebarService = inject(SidebarService);
  private mapService = inject(MapService);
  private sessionService = inject(SessionService);

  @Input() feed: Feed;
  readonly item = input<Feature>(undefined);

  readonly ripple = viewChild(MatRipple);

  hasContent = false;
  timestamp: number;
  primary: string;
  secondary: string;

  get accessToken(): string | null {
    return this.sessionService.getToken();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    const item = this.item();
    if (!this.feed || !item.properties) return;

    if (this.feed.itemTemporalProperty && item.properties[this.feed.itemTemporalProperty] != null) {
      this.timestamp = item.properties[this.feed.itemTemporalProperty];
      this.hasContent = true;
    }

    if (this.feed.itemPrimaryProperty && item.properties[this.feed.itemPrimaryProperty] != null) {
      this.primary = item.properties[this.feed.itemPrimaryProperty];
      this.hasContent = true;
    }

    if (this.feed.itemSecondaryProperty && item.properties[this.feed.itemSecondaryProperty] != null) {
      this.secondary = item.properties[this.feed.itemSecondaryProperty];
      this.hasContent = true;
    }
  }

  onItemSelect(): void {
    const item = this.item();
    this.sidebarService.selectFeedItem(this.feed, item);
    this.mapService.zoomToFeatureInLayer(item, `feed-${this.feed.id}`);
  }

  onRipple(): void {
    this.ripple().launch({
      centered: true
    })
  }
}
