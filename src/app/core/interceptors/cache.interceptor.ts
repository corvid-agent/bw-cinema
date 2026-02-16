import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, tap } from 'rxjs';

const cache = new Map<string, HttpResponse<unknown>>();

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET') return next(req);

  const isExternal =
    req.url.includes('api.themoviedb.org') ||
    req.url.includes('omdbapi.com');

  if (!isExternal) return next(req);

  const cached = cache.get(req.urlWithParams);
  if (cached) return of(cached.clone());

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        cache.set(req.urlWithParams, event.clone());
      }
    })
  );
};
