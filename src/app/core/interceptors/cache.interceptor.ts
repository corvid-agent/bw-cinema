import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, tap } from 'rxjs';

/** Max cache entries before eviction */
const MAX_CACHE_SIZE = 500;
/** Cache entry time-to-live in ms (5 minutes) */
const CACHE_TTL_MS = 5 * 60 * 1000;

interface CacheEntry {
  response: HttpResponse<unknown>;
  expiry: number;
}

const cache = new Map<string, CacheEntry>();

function evictExpired(): void {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (entry.expiry < now) cache.delete(key);
  }
}

function evictOldest(count: number): void {
  const iter = cache.keys();
  for (let i = 0; i < count; i++) {
    const { value, done } = iter.next();
    if (done) break;
    cache.delete(value);
  }
}

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET') return next(req);

  const isExternal =
    req.url.includes('api.themoviedb.org') ||
    req.url.includes('omdbapi.com');

  if (!isExternal) return next(req);

  const cached = cache.get(req.urlWithParams);
  if (cached) {
    if (cached.expiry > Date.now()) {
      return of(cached.response.clone());
    }
    cache.delete(req.urlWithParams);
  }

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        // Evict expired entries periodically
        if (cache.size > MAX_CACHE_SIZE) {
          evictExpired();
        }
        // If still over limit, evict oldest entries
        if (cache.size >= MAX_CACHE_SIZE) {
          evictOldest(Math.max(50, cache.size - MAX_CACHE_SIZE + 1));
        }
        cache.set(req.urlWithParams, {
          response: event.clone(),
          expiry: Date.now() + CACHE_TTL_MS,
        });
      }
    })
  );
};
