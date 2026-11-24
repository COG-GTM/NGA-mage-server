import { Component, OnChanges, SimpleChanges, inject, input } from '@angular/core';
import { Feed, StyledFeature } from '@ngageoint/mage.web-core-lib/feed';
import { SidebarService } from 'src/app/sidebar/sidebar.service';
import { contentPathOfIcon } from '@ngageoint/mage.web-core-lib/static-icon';
import { SessionService } from 'mage-web-app/http/session.service';
import { MapService } from '../../map/map.service';
import { MomentPipe } from '../../moment/moment.pipe';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { FeedIconModule } from '@ngageoint/mage.web-core-lib/feed/feed-icon';
import { MapClipComponent } from '../../map/clip/clip.component';
import { MatList, MatListItem, MatListItemTitle, MatListItemLine } from '@angular/material/list';
import { GeometryPipe } from '../../geometry/geometry.pipe';

@Component({
    selector: 'feed-item',
    templateUrl: './feed-item.component.html',
    styleUrls: ['./feed-item.component.scss'],
    imports: [MatToolbar, MatIconButton, MatIcon, MatCard, FeedIconModule, MapClipComponent, MatButton, MatCardHeader, MatCardTitle, MatList, MatListItem, MatListItemTitle, MatListItemLine, GeometryPipe]
})
export class FeedItemComponent implements OnChanges {
  private sidebarService = inject(SidebarService);
  private momentPipe = inject(MomentPipe);
  private mapService = inject(MapService);
  private sessionService = inject(SessionService);

  readonly feed = input<Feed>(undefined);
  readonly item = input<StyledFeature>(undefined);

  hasContent = false
  date: string
  primary: string
  secondary: string
  mapFeature: StyledFeature
  properties = []

  ngOnChanges(_changes: SimpleChanges): void {
    this.updateItem()
  }

  private updateItem(): void {
    const feed = this.feed();
    const item = this.item();
    if (!feed || !item) {
      return
    }

    const mapStyle = feed.mapStyle?.icon ? {
      iconUrl: `${contentPathOfIcon(feed.mapStyle.icon)}?access_token=${this.sessionService.getToken()}`
    } : null
    this.mapFeature = { style: mapStyle, ...item }

    if (!item.properties) {
      return
    }

    if (feed.itemTemporalProperty && item.properties[feed.itemTemporalProperty] != null) {
      this.date = this.momentPipe.transform(item.properties[feed.itemTemporalProperty]);
      this.hasContent = true;
    }

    if (feed.itemPrimaryProperty && item.properties[feed.itemPrimaryProperty] != null) {
      this.primary = item.properties[feed.itemPrimaryProperty];
      this.hasContent = true;
    }

    if (feed.itemSecondaryProperty && item.properties[feed.itemSecondaryProperty] != null) {
      this.secondary = item.properties[feed.itemSecondaryProperty];
      this.hasContent = true;
    }

    if (item.properties) {
      const schemaProperties = feed?.itemPropertiesSchema?.properties

      this.properties = Object.keys(item.properties).map(key => {
        let value = this.item().properties[key]
        if (key === this.feed().itemTemporalProperty) {
          value = this.momentPipe.transform(value)
        }

        return {
          key: schemaProperties[key]?.title || key,
          value: value
        }
      }).filter(property => property.value != null && property.value !== '');
    }
  }

  close(): void {
    this.sidebarService.deselectFeedItem(this.feed(), this.item());
  }

  onLocationClick(): void {
    this.mapService.zoomToFeatureInLayer(this.item(), `feed-${this.feed().id}`);
  }
}
