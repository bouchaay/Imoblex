import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

let redirectingToLogin = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.token;

  if (token) {
    // Token présent mais expiré → logout immédiat avant même d'envoyer la requête
    if (authService.isTokenExpired()) {
      if (!redirectingToLogin) {
        redirectingToLogin = true;
        authService.clearSession();
        router.navigate(['/login'], { queryParams: { reason: 'session_expired' } })
          .finally(() => { redirectingToLogin = false; });
      }
      return throwError(() => new Error('Token expiré'));
    }

    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(authReq);
  }

  return next(req);
};
