// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/dist/zone-testing';
import { NgModule, provideZoneChangeDetection } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

declare const require: {
  context(path: string, deep?: boolean, filter?: RegExp): {
    keys(): string[];
    <T>(id: string): T;
  };
};

// First, initialize the Angular testing environment.
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
// Then we find all the tests.
const context = require.context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys().map(context);
