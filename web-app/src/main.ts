import { enableProdMode, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';

import { environment } from './environments/environment';
import { provideAnimations } from '@angular/platform-browser/animations';
import { LocalStorageService } from './app/http/local-storage.service';
import { TokenInterceptorService } from './app/http/token.interceptor';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { RouteReuseStrategy } from '@angular/router';
import { RouteReuseByComponentStrategy } from './app/route-reuse.strategy';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AppRoutingModule } from './app/routing.module';
import { bootstrapApplication } from '@angular/platform-browser';
import { MatDialogModule } from '@angular/material/dialog';
import { AppComponent } from './app/app.component';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        provideZoneChangeDetection(),
        importProvidersFrom(AppRoutingModule, MatDialogModule),
        provideAnimations(),
        LocalStorageService,
        TokenInterceptorService,
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        { provide: RouteReuseStrategy, useClass: RouteReuseByComponentStrategy },
        { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptorService, multi: true },
        provideHttpClient(withInterceptorsFromDi())
    ]
})
  .catch(err => console.error(err));
