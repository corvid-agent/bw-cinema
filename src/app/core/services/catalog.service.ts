import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { Catalog, CatalogFilter, CatalogMeta } from '../models/catalog.model';
import type { MovieSummary } from '../models/movie.model';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);

  readonly movies = signal<MovieSummary[]>([]);
  readonly meta = signal<CatalogMeta | null>(null);
  readonly loading = signal(false);
  readonly loaded = signal(false);

  readonly featured = computed(() => {
    const streamable = this.movies().filter((m) => m.isStreamable);
    // Prefer films with ratings, fall back to streamable films with genres
    const rated = streamable.filter((m) => m.voteAverage >= 7);
    if (rated.length >= 12) {
      return rated.sort((a, b) => b.voteAverage - a.voteAverage).slice(0, 12);
    }
    // Without TMDb ratings, feature streamable films that have genre info
    return streamable
      .filter((m) => m.genres.length > 0)
      .slice(0, 12);
  });

  readonly filmOfTheDay = computed(() => {
    const candidates = this.movies().filter(
      (m) => m.isStreamable && m.voteAverage >= 6 && m.genres.length > 0
    );
    if (candidates.length === 0) return null;
    const today = new Date();
    const seed = today.getFullYear() * 366 + (today.getMonth() + 1) * 31 + today.getDate();
    return candidates[seed % candidates.length];
  });

  async load(): Promise<void> {
    if (this.loaded()) return;
    this.loading.set(true);
    try {
      const catalog = await firstValueFrom(
        this.http.get<Catalog>('assets/data/catalog.json')
      );
      this.movies.set(catalog.movies);
      this.meta.set(catalog.meta);
      this.loaded.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  search(filter: CatalogFilter): MovieSummary[] {
    let results = this.movies();

    if (filter.query) {
      const q = filter.query.toLowerCase();
      results = results.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.directors.some((d) => d.toLowerCase().includes(q))
      );
    }

    if (filter.decades.length > 0) {
      results = results.filter((m) =>
        filter.decades.includes(Math.floor(m.year / 10) * 10)
      );
    }

    if (filter.genres.length > 0) {
      results = results.filter((m) =>
        m.genres.some((g) => filter.genres.includes(g))
      );
    }

    if (filter.directors.length > 0) {
      const dirLower = filter.directors.map((d) => d.toLowerCase());
      results = results.filter((m) =>
        m.directors.some((d) => dirLower.includes(d.toLowerCase()))
      );
    }

    if (filter.streamableOnly) {
      results = results.filter((m) => m.isStreamable);
    }

    if (filter.minRating > 0) {
      results = results.filter((m) => m.voteAverage >= filter.minRating);
    }

    const dir = filter.sortDirection === 'asc' ? 1 : -1;
    results = [...results].sort((a, b) => {
      switch (filter.sortBy) {
        case 'title':
          return dir * a.title.localeCompare(b.title);
        case 'year':
          return dir * (a.year - b.year);
        case 'rating':
          return dir * (a.voteAverage - b.voteAverage);
      }
    });

    return results;
  }

  getSimilar(movie: MovieSummary, limit = 8): MovieSummary[] {
    const decade = Math.floor(movie.year / 10) * 10;
    const genreSet = new Set(movie.genres);

    return this.movies()
      .filter((m) => m.id !== movie.id)
      .map((m) => {
        let score = 0;
        const sharedGenres = m.genres.filter((g) => genreSet.has(g)).length;
        score += sharedGenres * 3;
        if (Math.floor(m.year / 10) * 10 === decade) score += 2;
        if (m.directors.some((d) => movie.directors.includes(d))) score += 4;
        if (m.voteAverage >= 7) score += 1;
        return { movie: m, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score || b.movie.voteAverage - a.movie.voteAverage)
      .slice(0, limit)
      .map((r) => r.movie);
  }
}
