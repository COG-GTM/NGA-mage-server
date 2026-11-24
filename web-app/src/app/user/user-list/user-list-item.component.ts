import { Component, Input, OnChanges, output, viewChild } from '@angular/core';
import { MatRipple } from '@angular/material/core';
import { MapService } from '../../map/map.service';
import { SessionService } from '../../http/session.service';
import { SidebarService } from '../../sidebar/sidebar.service';
import { UserLocation, UserWithLocation } from '../../entities/user/entities.user-location';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { UserAvatarComponent } from '../user-avatar/user-avatar.component';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { GeometryPipe } from '../../geometry/geometry.pipe';
import { MomentPipe } from '../../moment/moment.pipe';

@Component({
    selector: 'user-list-item',
    templateUrl: './user-list-item.component.html',
    styleUrls: ['./user-list-item.component.scss'],
    imports: [MatCard, MatRipple, MatCardContent, UserAvatarComponent, MatCardActions, MatButton, MatIconButton, MatIcon, GeometryPipe, MomentPipe]
})
export class UserListItemComponent implements OnChanges {
  @Input() userWithLocation: UserWithLocation

  readonly click = output<any>();

  readonly ripple = viewChild(MatRipple);

  token: string | null
  followingUser: any

  user: UserWithLocation['user']
  location: UserLocation

  constructor(
    private sidebarService: SidebarService,
    private mapService: MapService,
    sessionService: SessionService) {
    this.followingUser = mapService.followedFeature
    this.token = sessionService.getToken()
  }

  ngOnChanges(): void {
    if (!this.userWithLocation) return
    this.user = this.userWithLocation.user
    this.location = this.userWithLocation.location
  }

  followUser(event: MouseEvent): void {
    event.stopPropagation();
    this.mapService.followFeatureInLayer(this.userWithLocation, 'people')
  }

  onUserLocation(): void {
    this.mapService.zoomToFeatureInLayer(this.userWithLocation, 'people')
  }

  viewUser(): void {
    this.onUserLocation()
    this.sidebarService.viewUser(this.userWithLocation)
  }

  onRipple(): void {
    this.ripple().launch({
      centered: true
    })
  }

}
