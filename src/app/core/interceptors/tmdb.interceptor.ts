import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const tmdbInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('api.themoviedb.org')) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${environment.tmdbReadToken}`,
      },
    });
    return next(cloned);
  }
  return next(req);
};
