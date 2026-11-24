import { AfterViewInit, Component, ElementRef, inject } from '@angular/core';
import { SessionService } from '../http/session.service';
import SwaggerUI from 'swagger-ui';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

const DisableAuthorizePlugin = function () {
  return {
    wrapComponents: {
      AuthorizeBtnContainer: () => () => null,
      ServersContainer: () => () => null,
      authorizeOperationBtn: () => () => null
    }
  };
};

@Component({
    selector: 'swagger',
    templateUrl: './swagger.component.html',
    styleUrls: ['./swagger.component.scss'],
    imports: [MatToolbar, MatIconButton, MatIcon]
})
export class SwaggerComponent implements AfterViewInit {
  private el = inject(ElementRef);
  private location = inject(Location);
  private router = inject(Router);
  private sessionService = inject(SessionService);


  ngAfterViewInit() {
    SwaggerUI({
      url: '/api/docs/openapi.yaml',
      domNode: this.el.nativeElement.querySelector('.swagger-container'),
      deepLinking: false,
      plugins: [DisableAuthorizePlugin],
      requestInterceptor: (request) => {
        request.headers['Authorization'] = `Bearer ${this.sessionService.getToken()}`
        return request
      },
    });
  }

  onBack() : void {
    if (window.history.state?.navigationId > 1) {
      this.location.back();
    } else {
      this.router.navigate(['home']);
    }
  }
}