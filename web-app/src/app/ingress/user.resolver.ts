import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { Observable, catchError, of } from "rxjs";
import { Api } from "../api/api.entity";
import { UserService } from "../user/user.service";

export const userResolver: ResolveFn<Api> = (): Observable<Api> =>
  inject(UserService).getMyself({ suppressAuthDialog: true }).pipe(
    catchError(() => {
      return of(null)
    })
  )
