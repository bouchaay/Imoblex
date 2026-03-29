import { HttpInterceptorFn } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

const isDev = !window.location.hostname.includes('prod');

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isDev) return next(req);

  const start = performance.now();
  const method = req.method.padEnd(6);
  const url = req.url;

  console.groupCollapsed(
    `%c➡ ${method} %c${url}`,
    'color:#6366f1;font-weight:700',
    'color:#0ea5e9;font-weight:500'
  );
  if (req.body) console.log('%cBody:', 'color:#94a3b8', req.body);
  if (req.params.keys().length) console.log('%cParams:', 'color:#94a3b8', req.params.toString());
  console.groupEnd();

  return next(req).pipe(
    tap(event => {
      const ms = Math.round(performance.now() - start);
      // Only log HttpResponse (not HttpSentEvent, etc.)
      if ((event as any).status !== undefined) {
        const status = (event as any).status;
        const ok = status >= 200 && status < 300;
        console.groupCollapsed(
          `%c${ok ? '✅' : '⚠️'} ${method} %c${url} %c${status} %c${ms}ms`,
          ok ? 'color:#10b981;font-weight:700' : 'color:#f59e0b;font-weight:700',
          'color:#0ea5e9',
          ok ? 'color:#10b981;font-weight:700' : 'color:#f59e0b;font-weight:700',
          'color:#94a3b8'
        );
        if ((event as any).body) console.log('%cResponse:', 'color:#94a3b8', (event as any).body);
        console.groupEnd();
      }
    }),
    catchError(err => {
      const ms = Math.round(performance.now() - start);
      console.groupCollapsed(
        `%c❌ ${method} %c${url} %c${err.status ?? 0} %c${ms}ms`,
        'color:#ef4444;font-weight:700',
        'color:#0ea5e9',
        'color:#ef4444;font-weight:700',
        'color:#94a3b8'
      );
      console.error('Error:', err?.error || err.message);
      console.groupEnd();
      return throwError(() => err);
    })
  );
};
