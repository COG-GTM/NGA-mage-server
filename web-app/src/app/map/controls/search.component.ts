import { Component, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, inject } from '@angular/core';
import { DomEvent } from 'leaflet';
import { MapSettingsService } from '../settings/map.settings.service';
import { MapSettings } from 'src/app/entities/map/entities.map';
import {
  PlacenameSearchResult,
  PlacenameSearchService
} from '../search/search.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIconButton, MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatCard } from '@angular/material/card';
import { MatList, MatListItem, MatListItemIcon, MatListItemTitle } from '@angular/material/list';
import { MatRipple } from '@angular/material/core';

export enum SearchState {
  ON,
  OFF
}

export interface SearchEvent {
  result: PlacenameSearchResult;
}

@Component({
    selector: 'map-control-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
    imports: [MatProgressSpinner, MatIconButton, MatIcon, MatMiniFabButton, MatTooltip, MatCard, MatList, MatListItem, MatRipple, MatListItemIcon, MatListItemTitle]
})
export class SearchComponent implements AfterViewInit {
  private mapSettingsService = inject(MapSettingsService);
  private searchService = inject(PlacenameSearchService);
  private snackBar = inject(MatSnackBar);

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('searchList') matList!: ElementRef<HTMLElement>;

  @Output() onSearch = new EventEmitter<SearchEvent>();
  @Output() onSearchClear = new EventEmitter<void>();

  mapSettings: MapSettings;

  SearchState = SearchState;
  searchState = SearchState.OFF;

  searchResults: any[] = [];
  searching = false;

  ngOnInit(): void {
    this.mapSettingsService
      .getMapSettings()
      .subscribe((settings: MapSettings) => {
        this.mapSettings = settings;
      });
  }

  ngAfterViewInit(): void {
    if (this.matList?.nativeElement) {
      DomEvent.disableClickPropagation(this.matList.nativeElement);
      DomEvent.disableScrollPropagation(this.matList.nativeElement);
    }
  }

  searchToggle(): void {
    this.searchState =
      this.searchState === SearchState.ON ? SearchState.OFF : SearchState.ON;

    if (this.searchState === SearchState.ON) {
      setTimeout(() => {
        this.searchInput?.nativeElement?.focus();
      });
    }
  }

  search(value: string): void {
    this.searching = true;
    this.searchService.search(this.mapSettings, value).subscribe({
      next: (results: PlacenameSearchResult[]) => {
        this.searching = false;
        this.searchResults = results;
      },
      error: () => {
        this.searching = false;
        this.snackBar.open('Error accessing place name server', undefined, {
          duration: 2000
        });
      }
    });
  }

  clear($event: MouseEvent, input: HTMLInputElement): void {
    $event.stopPropagation();
    $event.preventDefault();
    input.value = '';
    this.searchResults = [];
    this.searchState = SearchState.OFF;

    this.onSearchClear.emit();
  }

  searchResultClick(result: PlacenameSearchResult): void {
    this.onSearch.emit({ result });
  }
}
