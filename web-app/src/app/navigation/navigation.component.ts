import {
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';
import { FilterService } from '../filter/filter.service';
import { MapService } from '../map/map.service';
import { UserService } from '../user/user.service';
import { EventService } from '../event/event.service';
import { MageEvent } from '../entities/event/entities.event';
import { Router, RouterLink } from '@angular/router';
import { SessionService } from 'mage-web-app/http/session.service';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { CdkMenuTrigger, CdkMenu, CdkMenuItem } from '@angular/cdk/menu';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { MatFormField, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'navigation',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.scss'],
    imports: [MatToolbar, MatIconButton, MatIcon, CdkMenuTrigger, MatMenuTrigger, MatMenu, MatMenuItem, RouterLink, MatTooltip, CdkMenu, MatFormField, MatPrefix, MatInput, FormsModule, ReactiveFormsModule, CdkMenuItem, AsyncPipe]
})
export class NavigationComponent implements OnInit, OnDestroy {
  @Output() onFeedToggle = new EventEmitter<void>();
  @Output() onPreferencesToggle = new EventEmitter<void>();
  @ViewChild('eventSearchInput') eventSearchInput: ElementRef<HTMLInputElement>;

  events: any[] = [];
  eventSearchControl = new FormControl('');
  filteredEvents: Observable<any[]>;

  eventMenuPosition: ConnectedPosition[] = [
    { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top' }
  ];

  state = 'map';
  filteredEvent: any = {};
  eventsLoaded = false;
  isAdmin: boolean = false;

  constructor(
    private router: Router,
    private mapService: MapService,
    private sessionService: SessionService,
    private userService: UserService,
    private eventService: EventService,
    private filterService: FilterService,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.filterService.event$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => this.onEventSelected(event));

    this.filteredEvents = this.eventSearchControl.valueChanges.pipe(
      startWith(''),
      map((value) => this.filterEvents(value ?? ''))
    );

    this.eventService.query().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((events: MageEvent[]) => {
      this.events = [...events].sort((a, b) => a.name.localeCompare(b.name));
      this.eventSearchControl.setValue('', { emitEvent: true });

      const savedId = this.filterService.getSavedEventId();
      const event = (savedId != null ? events.find((e) => e.id === savedId) : null) ?? events[0];
      if (event) {
        this.filterService.setEvent(event);
      }
      this.eventsLoaded = true;
    });

    this.mapService.init();
    this.eventService.init();
    this.isAdmin = this.sessionService.amAdmin;
  }

  ngOnDestroy(): void {
    this.mapService.destroy();
    this.eventService.destroy();
    this.filterService.destroy();
  }

  toggleFeed(): void {
    this.onFeedToggle.emit();
  }

  togglePreferences(): void {
    this.onPreferencesToggle.emit();
  }

  onLogout() {
    this.userService.logout().subscribe(() => {
      this.router.navigate(['landing']);
    });
  }

  onEventMenuOpened(): void {
    this.eventSearchControl.setValue('');
    setTimeout(() => this.eventSearchInput?.nativeElement.focus(), 0);
  }

  onSelectEvent(event: any): void {
    this.filterService.setEvent(event);
  }

  private filterEvents(name: string): any[] {
    if (!name) return this.events.slice();
    const lower = name.toLowerCase();
    return this.events.filter((e) => e.name.toLowerCase().includes(lower));
  }

  private onEventSelected(event: any) {
    if (event) {
      this.filteredEvent = event;

      // Stop broadcasting location if the event switches
      this.mapService.onLocationStop();
    }
  }
}
