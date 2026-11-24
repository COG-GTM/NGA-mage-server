import { HttpClient } from '@angular/common/http'
import { Component, OnChanges, SimpleChanges, signal, inject, input } from '@angular/core'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'user-avatar',
    templateUrl: './user-avatar.component.html',
    styleUrls: ['./user-avatar.component.scss'],
    imports: [MatIcon]
})
export class UserAvatarComponent implements OnChanges {
  private httpClient = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);

  readonly user = input<any>(undefined);
  readonly file = input<File | null>(null);
  readonly avatarWidth = input(40);
  readonly avatarHeight = input(40);

  data = signal<string | ArrayBuffer | null>(null)
  url = signal<SafeUrl | null>(null)

  ngOnChanges(changes: SimpleChanges): void {
    const file = this.file();
    const user = this.user();
    if (changes['file'] && file) {
      if (window.FileReader) {
        const reader = new FileReader()
        reader.onload = (e) => { this.data.set((e.target as FileReader).result) }
        reader.readAsDataURL(file)
      }
    } else if (changes['user'] && user) {
      if (!user.avatarUrl) {
        this.url.set(null)
        return
      }
      this.fetchAvatar()
    }
  }

  fetchAvatar(): void {
    this.httpClient.get(`/api/users/${this.user().id}/avatar`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        this.url.set(this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob)))
      },
      error: () => {
        this.url.set(null)
      }
    })
  }
}
