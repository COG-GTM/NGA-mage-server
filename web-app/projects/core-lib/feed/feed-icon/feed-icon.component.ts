import { Component, Input, OnChanges, OnDestroy, SimpleChanges, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { contentPathOfIcon, StaticIconService } from '@ngageoint/mage.web-core-lib/static-icon';
import { NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatBadge } from '@angular/material/badge';

export interface MaterialIconReference {
  name: string
  id?: never
  file?: never
  sourceUrl?: never
}

export interface RegisteredIconReference {
  id: string
  name?: never
  file?: never
  sourceUrl?: never
}

export interface SourceUrlIconReference {
  sourceUrl: string
  name?: string
  id?: never
  file?: never
}

export interface FileIconReference {
  file: File
  id?: never
  name?: never,
  sourceUrl?: never
}

export type IconReference = MaterialIconReference | SourceUrlIconReference | RegisteredIconReference | FileIconReference

@Component({
    selector: 'feed-icon',
    templateUrl: './feed-icon.component.html',
    styleUrls: ['./feed-icon.component.scss'],
    imports: [NgClass, MatIcon, MatBadge]
})
export class FeedIconComponent implements OnChanges, OnDestroy {
  private iconService = inject(StaticIconService);
  private httpClient = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);

  @Input() icon: IconReference
  @Input() active: Boolean = false
  @Input() size: number = 24
  @Input() badge: number = 0

  iconMaskImage: SafeStyle | null = null
  isImageIcon = false

  private blobUrl: string | null = null

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.icon?.currentValue) {
      this.disposeBlobUrl()
      this.iconMaskImage = null
      this.isImageIcon = Boolean(this.icon.id || this.icon.sourceUrl || this.icon.file)
      if (this.icon.id) {
        this.fetchAndMask(contentPathOfIcon(this.icon.id))
      } else if (this.icon.sourceUrl) {
        this.iconService.fetchIconByReference({ sourceUrl: this.icon.sourceUrl}).subscribe(x => {
          this.fetchAndMask(x.contentPath)
        })
      } else if (this.icon.file) {
        const reader = new FileReader()
        reader.onload = (): void => {
          this.iconMaskImage = this.sanitizer.bypassSecurityTrustStyle(`url(${reader.result})`)
        }

        reader.readAsDataURL(this.icon.file)
      }
    }
  }

  ngOnDestroy(): void {
    this.disposeBlobUrl()
  }

  private fetchAndMask(contentPath: string): void {
    this.httpClient.get(contentPath, { responseType: 'blob' }).subscribe(blob => {
      this.disposeBlobUrl()
      this.blobUrl = URL.createObjectURL(blob)
      this.iconMaskImage = this.sanitizer.bypassSecurityTrustStyle(`url(${this.blobUrl})`)
    })
  }

  private disposeBlobUrl(): void {
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl)
      this.blobUrl = null
    }
  }
}
