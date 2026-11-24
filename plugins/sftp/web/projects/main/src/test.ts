import 'zone.js';
import 'zone.js/testing';
import { NgModule, provideZoneChangeDetection } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// The apps bootstrap with zone.js change detection; keep tests on the same model (TestBed defaults to zoneless since v21).
@NgModule({
  imports: [BrowserDynamicTestingModule],
  exports: [BrowserDynamicTestingModule],
  providers: [provideZoneChangeDetection()]
})
class ZoneChangeDetectionTestingModule {}

getTestBed().initTestEnvironment(
  ZoneChangeDetectionTestingModule,
  platformBrowserDynamicTesting()
);
