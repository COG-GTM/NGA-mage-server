import { ChangeDetectorRef, Component, Inject } from '@angular/core'
import { MatDialogRef as MatDialogRef, MAT_DIALOG_DATA as MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { UserService } from '../../user/user.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatList, MatListItem, MatListItemAvatar, MatListItemTitle, MatListItemLine } from '@angular/material/list';
import { UserAvatarComponent } from '../../user/user-avatar/user-avatar.component';
import { MatButton } from '@angular/material/button';

interface Data {
  userIds: string[]
}

@Component({
    selector: 'observation-favorites',
    templateUrl: './observation-favorites.component.html',
    styleUrls: ['./observation-favorites.component.scss'],
    imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatList, MatListItem, MatListItemAvatar, UserAvatarComponent, MatListItemTitle, MatListItemLine, MatDialogActions, MatButton]
})
export class ObservationFavoritesComponent {
  users: any[]

  constructor(
    public dialogRef: MatDialogRef<ObservationFavoritesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Data,
    userService: UserService,
    cdr: ChangeDetectorRef) {

    forkJoin(data.userIds.map((userId: string) => userService.getUser(userId))).subscribe((result: any[]) => {
      this.users = result
    })
  }

  close(): void {
    this.dialogRef.close()
  }

}
