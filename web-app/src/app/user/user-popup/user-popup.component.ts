import { Component, Input, inject } from '@angular/core';
import { SidebarService } from '../../sidebar/sidebar.service';
import { MapService } from '../../map/map.service';
import { UserWithLocation } from '../../entities/user/entities.user-location';
import { UserAvatarComponent } from '../user-avatar/user-avatar.component';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { GeometryPipe } from '../../geometry/geometry.pipe';
import { MomentPipe } from '../../moment/moment.pipe';

@Component({
    selector: 'user-popup',
    templateUrl: './user-popup.component.html',
    styleUrls: ['./user-popup.component.scss'],
    imports: [UserAvatarComponent, MatButton, MatIconButton, MatIcon, GeometryPipe, MomentPipe]
})
export class UserPopupComponent {
  private sidebarService = inject(SidebarService);
  private mapService = inject(MapService);

  @Input({ required: true }) userWithLocation: UserWithLocation;

  followingUser: MapService['followedFeature']

  constructor() {
    const mapService = this.mapService;

    this.followingUser = mapService.followedFeature
  }

  get user(): UserWithLocation['user'] {
    return this.userWithLocation.user
  }

  get location(): UserWithLocation['location'] {
    return this.userWithLocation.location
  }

  onInfo(): void {
    this.sidebarService.viewUser(this.userWithLocation)
  }

  onZoom(): void {
    this.mapService.zoomToFeatureInLayer(this.user, 'people');
  }

  onFollow(): void {
    this.mapService.followFeatureInLayer(this.user, 'people');
  }
}
