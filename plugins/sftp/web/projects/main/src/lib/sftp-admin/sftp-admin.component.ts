import { Component } from '@angular/core';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { ConfigurationComponent } from '../configuration/configuration.component';
import { ObservationStatusComponent } from '../observation-status/observation-status.component';

@Component({
    selector: 'sftp-admin',
    template: `
    <mat-tab-group>
      <mat-tab label="Configuration">
        <sftp-configuration></sftp-configuration>
      </mat-tab>
      <mat-tab label="Sync Status">
        <sftp-observation-status></sftp-observation-status>
      </mat-tab>
    </mat-tab-group>
  `,
    imports: [MatTabGroup, MatTab, ConfigurationComponent, ObservationStatusComponent]
})
export class SftpAdminComponent {}
