import { Component, OnChanges, SimpleChanges, inject, input } from '@angular/core';
import { Feed, FeedService } from '@ngageoint/mage.web-core-lib/feed';
import { Feature } from 'geojson';
import { Subscription } from 'rxjs'
import { MatToolbar } from '@angular/material/toolbar';
import { FeedItemSummaryComponent } from '../feed-item/feed-item-summary/feed-item-summary.component';

@Component({
    selector: 'feed-list',
    templateUrl: './feed-list.component.html',
    styleUrls: ['./feed-list.component.scss'],
    imports: [MatToolbar, FeedItemSummaryComponent]
})
export class FeedListComponent implements OnChanges {
  private feedService = inject(FeedService);

  readonly feed = input<Feed>(undefined);

  items: Array<Feature> = []
  feedSubscription: Subscription | null = null

  ngOnChanges(changes: SimpleChanges): void {
    const feed: Feed = changes.feed.currentValue;
    this.feedSubscription?.unsubscribe()
    if (feed) {
      this.feedSubscription = this.feedService.feedItems(feed.id).subscribe(items => {
        this.items = items;
      });
    }
  }
}
