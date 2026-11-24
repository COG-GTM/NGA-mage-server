import { Component, Input, input, output } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'admin-navigation',
  templateUrl: './admin-navigation.component.html',
  styleUrls: ['./admin-navigation.component.scss'],
  standalone: true,
  imports: [
    MatIconModule,
    MatBadgeModule,
    RouterLink,
    RouterLinkActive
  ]
})
export class AdminNavigationComponent {
  readonly stateName = input('');
  readonly inactiveUsers = input<any[]>([]);
  readonly unregisteredDevices = input<any[]>([]);
  @Input() pluginTabs: any[] = [];
  readonly pluginActiveChange = output<any>();

  identitiesExpanded = true;
  environmentExpanded = true;
  searchExpanded = true;
  securityExpanded = true;
  settingsExpanded = true;
  pluginsExpanded = true;
}
