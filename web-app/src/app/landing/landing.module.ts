import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingComponent } from './landing.component';
import { InfoComponent } from './info.component';
import { RouterModule, Routes } from '@angular/router';
import { ApiResolver } from '../api/api.resolver';

import { NoSessionGuard } from '../ingress/no-session-guard.service';

const routes: Routes = [{
  path: '',
  component: LandingComponent,
  canActivate: [NoSessionGuard],
  resolve: {
    api: ApiResolver
  }
}];

@NgModule({
    imports: [
    CommonModule,
    RouterModule.forChild(routes),
    LandingComponent,
    InfoComponent
],
    exports: [RouterModule]
})
export class LandingModule { }