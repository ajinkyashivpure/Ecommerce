import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import {inject, PLATFORM_ID} from '@angular/core';
import { Router } from '@angular/router';
import {isPlatformBrowser } from '@angular/common';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);
  const authService = inject(AuthService);

  // Skip interceptor for refresh token and login requests
  if (req.url.includes('/refresh-token') || req.url.includes('/login')) {
    return next(req);
  }

  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('token');

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/refresh-token')) {
        return authService.refreshToken().pipe(
          switchMap(response => {
            // Clone the original request with new token
            const newReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${response.token}`
              }
            });
            return next(newReq);
          }),
          catchError((refreshError) => {
            // If refresh fails, logout and redirect to login
            if (isPlatformBrowser(platformId)) {
              localStorage.removeItem('token');
              localStorage.removeItem('currentUser');
            }
            router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
