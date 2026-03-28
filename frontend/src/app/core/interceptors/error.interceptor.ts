import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          authService.logout();
          router.navigate(['/login'], { queryParams: { reason: 'session_expired' } });
          break;
        case 403:
          router.navigate(['/dashboard']);
          break;
        case 500:
          console.error('Erreur serveur:', error.message);
          break;
        default:
          console.error('Erreur HTTP:', error.status, error.message);
      }
      return throwError(() => error);
    })
  );
};
