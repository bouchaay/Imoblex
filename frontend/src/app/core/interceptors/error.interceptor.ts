import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Module-level flag: prevents multiple simultaneous 401s from triggering
// multiple redirects (e.g. when several HTTP calls fire at page load).
let redirectingToLogin = false;

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || (error.status === 403 && authService.isTokenExpired())) {
        // 401 = non authentifié, ou 403 avec token expiré → session expirée
        if (!redirectingToLogin) {
          redirectingToLogin = true;
          authService.clearSession();
          router.navigate(['/login'], { queryParams: { reason: 'session_expired' } })
            .finally(() => { redirectingToLogin = false; });
        }
      } else if (error.status === 403) {
        // 403 réel (token valide mais droits insuffisants) → dashboard
        router.navigate(['/dashboard']);
      } else if (error.status === 500) {
        console.error('Erreur serveur:', error.message);
      }
      return throwError(() => error);
    })
  );
};
