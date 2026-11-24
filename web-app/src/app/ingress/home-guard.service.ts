import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { UserService } from '../user/user.service';
import { User } from 'core-lib-src/user';

@Injectable({
  providedIn: 'root'
})
export class HomeGuard {
  private userService = inject(UserService);
  private router = inject(Router);


  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {

    return this.userService.getMyself({ suppressAuthDialog: true }).pipe(
      map((myself: User | null) => {
        return myself ? true : this.router.createUrlTree(['/landing']);
      }),
      catchError(() => of(this.router.createUrlTree(['/landing'])))
    );
  }
}
