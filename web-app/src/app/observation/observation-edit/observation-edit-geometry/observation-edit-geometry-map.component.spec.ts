import { MapClipComponent } from '../../../map/clip/clip.component';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ObservationEditGeometryMapComponent } from './observation-edit-geometry-map.component';
import { MatIconModule } from '@angular/material/icon';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ObservationEditGeometryMapComponent', () => {
  let component: ObservationEditGeometryMapComponent;
  let fixture: ComponentFixture<ObservationEditGeometryMapComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [MatIconModule, ObservationEditGeometryMapComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
    // Map clip has its own spec; keep it out of this shallow render.
    .overrideComponent(ObservationEditGeometryMapComponent, { remove: { imports: [MapClipComponent] }, add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] } })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObservationEditGeometryMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
