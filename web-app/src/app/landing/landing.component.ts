import { Component } from '@angular/core';
import { Api } from '../api/api.entity';
import { ApiService } from 'mage-web-app/api/api.service';
import { Router } from '@angular/router';
import { InfoComponent } from './info.component';
import { IngressComponent } from '../ingress/ingress.component';

@Component({
    selector: 'landing',
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.scss'],
    imports: [InfoComponent, IngressComponent]
})
export class LandingComponent {
  api: Api

  constructor(
    apiService: ApiService,
    private router: Router
  ) {
    apiService.getApi().subscribe((api: Api) => {
      this.api = api
    })
  }

  onIngress(): void {
    this.router.navigate(['home'])
  }

}
