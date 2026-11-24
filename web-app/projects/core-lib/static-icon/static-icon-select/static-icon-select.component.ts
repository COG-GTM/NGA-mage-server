import { Component, OnInit } from '@angular/core'
import { PagingParameters, PagingDataSource } from '@ngageoint/mage.web-core-lib/paging'
import { StaticIcon } from '../static-icon.model'
import { StaticIconService } from '../static-icon.service'
import { CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf } from '@angular/cdk/scrolling';
import { MatCard, MatCardHeader, MatCardTitle } from '@angular/material/card';

export interface StaticIconSelectItem {
  id: string
  path: string
  title: string
  fileName: string
}

@Component({
    selector: 'static-icon-select',
    templateUrl: './static-icon-select.component.html',
    styleUrls: ['./static-icon-select.component.scss'],
    imports: [CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf, MatCard, MatCardHeader, MatCardTitle]
})
export class StaticIconSelectComponent implements OnInit {

  icons: StaticIcon[] | null = null
  dataSource: PagingDataSource<StaticIcon>

  constructor(
    private iconService: StaticIconService
  ) {
    this.dataSource = new PagingDataSource<StaticIcon>(250, (paging: PagingParameters) => {
      return this.iconService.fetchIcons(paging)
    })
  }

  ngOnInit() {
    this.iconService.fetchIcons().subscribe(x => {
      this.icons = x.items
    })
  }

  onBrowseForUploadIcon() {
    throw new Error('unimplemented')
  }
}

