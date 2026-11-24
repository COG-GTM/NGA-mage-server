import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { LatLng } from 'leaflet';
import { PointAccuracy, MapClipComponent } from '../../map/clip/clip.component';
import moment from 'moment';
import { MapService } from '../../map/map.service';
import { LocationService } from '../location/location.service';
import { UserLocation } from '../../entities/user/entities.user-location';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardContent } from '@angular/material/card';
import { UserAvatarComponent } from '../user-avatar/user-avatar.component';
import { MatDivider, MatActionList, MatListItem, MatListItemIcon, MatListItemTitle, MatListItemMeta } from '@angular/material/list';
import { DecimalPipe } from '@angular/common';
import { GeometryPipe } from '../../geometry/geometry.pipe';

@Component({
    selector: 'user-view',
    templateUrl: './user-view.component.html',
    styleUrls: ['./user-view.component.scss'],
    imports: [MatToolbar, MatToolbarRow, MatIconButton, MatIcon, MatCard, MatCardContent, MapClipComponent, UserAvatarComponent, MatDivider, MatActionList, MatListItem, MatListItemIcon, MatListItemTitle, MatListItemMeta, DecimalPipe, GeometryPipe]
})
export class UserViewComponent implements OnChanges {
  @Input() user: any

  @Output() close = new EventEmitter<void>()

  accuracy: PointAccuracy

  constructor(
    private mapService: MapService,
    private locationService: LocationService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.user && changes.user.currentValue && changes.user.currentValue.location) {
      this.setAccuracy(changes.user.currentValue.location)
    }
  }

  setAccuracy(location: UserLocation): void {
    const age = Date.now() - moment(location.properties.timestamp).valueOf();
    const bucket = this.locationService.colorBuckets.find(bucket => age > bucket.min && age <= bucket.max)

    this.accuracy = {
      latlng: new LatLng(location.geometry.coordinates[1], location.geometry.coordinates[0]),
      color: bucket?.color,
      radius: location.properties.accuracy || 0,
      zoomTo: true
    }
  }

  onClose(): void {
    this.close.emit(this.user)
  }

  onUserLocationClick(): void {
    this.mapService.zoomToFeatureInLayer(this.user, 'people');
  }
}
