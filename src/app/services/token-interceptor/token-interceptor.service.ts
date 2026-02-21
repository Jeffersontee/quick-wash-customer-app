import { GlobalService } from './../global/global.service';
import { switchMap, take, catchError } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth/auth.service';
import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { inject } from '@angular/core';

let refreshing_in_progress: boolean;
let _accessToken$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

export const TokenInterceptor = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  // throw new Error('Method not implemented.');
  const auth = inject(AuthService);
  return auth.token.pipe(
    take(1),
    switchMap(token => {
      console.log('token: ', token);
      return next(addAuthHeader(req, token)).pipe(
        catchError(err => {
          console.log('catcherror err: ', err);
          if(err instanceof HttpErrorResponse && err.status === 401) {
            // get refresh token value
            return auth.refreshToken.pipe(
              take(1),
              switchMap(refreshToken => {
                console.log('refreshToken: ', refreshToken);
                // If there are tokens then send refresh token request
                if(refreshToken && token) {
                  // Call refresh_token api using auth service
                  return callRefreshTokenApi(auth, req, next);
                } else {
                  // logout
                  console.log('refreshToken err call logout: ', err);
                  return logout(auth, err);
                }
              })
            )
          }

          // In case of 403 http error (refresh token failed)
          if(err instanceof HttpErrorResponse && err.status === 403) {
            // logout
            return logout(auth, err);
          }

          // if error has status neither 401 nor 403 then just return this error
          // return throwError(err);
          return throwError(() => err);
        })
      );
    })
  );
}

const addAuthHeader = (req: HttpRequest<any>, token: string): HttpRequest<any> => {
  const isApiUrl = req.url.startsWith(environment.serverBaseUrl);
  if(token && isApiUrl) {
    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  return req;
}

const callRefreshTokenApi = (auth, req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  if(!refreshing_in_progress) {
    console.log('refreshing_in_progress if', refreshing_in_progress);
    refreshing_in_progress = true;
    _accessToken$.next(null);

    return auth.getNewTokens().pipe(
      switchMap((response: any) => {
        refreshing_in_progress = false;
        _accessToken$.next(response.accessToken);
        console.log('refreshing_in_progress switchMap', refreshing_in_progress);
        // repeat failed request with new token
        return next(addAuthHeader(req, response.accessToken));
      }),
      catchError(e => {
        console.log(e);
        refreshing_in_progress = false;
        // return throwError(e);
        return throwError(() => e);
      })
    );
  } else {
    console.log('refreshing_in_progress else', refreshing_in_progress);
    // Wait while we get new token
    return _accessToken$.pipe(
      // filter(token => token !== null),
      take(1),
      switchMap(token => {
        // repeat failed request with new token
        return next(addAuthHeader(req, token));
      })
    );
  }
  
}

const logout = (auth, error): Observable<HttpEvent<any>> => {
  console.log('error forbidden: ', error?.error?.message);
  auth.logoutUser();
  const global = inject(GlobalService);
  // show alert
  global.stopToast();
  global.showAlert(error?.error?.message);
  // return throwError(error);
  return throwError(() => error);
}


