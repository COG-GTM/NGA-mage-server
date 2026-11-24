import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
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
  @Input() feed: Feed;
  @Input() item: StyledFeature;

  hasContent = false
  date: string
  primary: string
  secondary: string
  mapFeature: StyledFeature
  properties = []

  constructor(
    private sidebarService: SidebarService,
    private momentPipe: MomentPipe,
    private mapService: MapService,
    private sessionService: SessionService
    ) {}

  ngOnChanges(_changes: SimpleChanges): void {
    this.updateItem()
  }

  private updateItem(): void {
    if (!this.feed || !this.item) {
      return
    }

    const mapStyle = this.feed.mapStyle?.icon ? {
      iconUrl: `${contentPathOfIcon(this.feed.mapStyle.icon)}?access_token=${this.sessionService.getToken()}`
    } : null
    this.mapFeature = { style: mapStyle, ...this.item }

    if (!this.item.properties) {
      return
    }

    if (this.feed.itemTemporalProperty && this.item.properties[this.feed.itemTemporalProperty] != null) {
      this.date = this.momentPipe.transform(this.item.properties[this.feed.itemTemporalProperty]);
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

    if (this.item.properties) {
      const schemaProperties = this.feed?.itemPropertiesSchema?.properties

      this.properties = Object.keys(this.item.properties).map(key => {
        let value = this.item.properties[key]
        if (key === this.feed.itemTemporalProperty) {
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
    this.sidebarService.deselectFeedItem(this.feed, this.item);
  }

  onLocationClick(): void {
    this.mapService.zoomToFeatureInLayer(this.item, `feed-${this.feed.id}`);
  }
}
