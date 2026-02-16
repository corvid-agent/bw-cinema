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

  readonly availableLanguages = computed(() => {
    const counts = new Map<string, number>();
    for (const m of this.movies()) {
      if (m.language) counts.set(m.language, (counts.get(m.language) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([lang]) => lang);
  });

  async load(): Promise<void> {
    if (this.loaded()) return;
    this.loading.set(true);
    try {
      const catalog = await firstValueFrom(
        this.http.get<Catalog>('assets/data/catalog.json')
      );
      // Backfill language field for catalogs generated before language support
      const movies = catalog.movies.map((m) => ({ ...m, language: m.language ?? null }));
      this.movies.set(movies);
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

    if (filter.languages.length > 0) {
      const langSet = new Set(filter.languages);
      results = results.filter((m) => m.language && langSet.has(m.language));
    }

    if (filter.yearRange) {
      const [minYear, maxYear] = filter.yearRange;
      results = results.filter((m) => m.year >= minYear && m.year <= maxYear);
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

  readonly curatedCollections = computed(() => {
    const movies = this.movies();
    if (movies.length === 0) return [];

    const collections: { name: string; description: string; movies: MovieSummary[] }[] = [];

    // Film Noir
    const noir = movies.filter((m) =>
      m.genres.some((g) => g.toLowerCase().includes('noir') || g.toLowerCase() === 'crime' || g.toLowerCase() === 'mystery') &&
      m.year >= 1940 && m.year <= 1959
    ).sort((a, b) => b.voteAverage - a.voteAverage).slice(0, 12);
    if (noir.length >= 4) {
      collections.push({ name: 'Film Noir Essentials', description: 'Dark crime and mystery from the golden age of noir', movies: noir });
    }

    // Silent Era
    const silent = movies.filter((m) => m.year < 1930)
      .sort((a, b) => b.voteAverage - a.voteAverage).slice(0, 12);
    if (silent.length >= 4) {
      collections.push({ name: 'Silent Cinema Treasures', description: 'Pioneering films from the silent era', movies: silent });
    }

    // Horror Classics
    const horror = movies.filter((m) => m.genres.some((g) => g.toLowerCase() === 'horror'))
      .sort((a, b) => b.voteAverage - a.voteAverage).slice(0, 12);
    if (horror.length >= 4) {
      collections.push({ name: 'Classic Horror', description: 'Iconic horror films that defined the genre', movies: horror });
    }

    // Top Rated Streamable
    const topStreamable = movies.filter((m) => m.isStreamable && m.voteAverage >= 6)
      .sort((a, b) => b.voteAverage - a.voteAverage).slice(0, 12);
    if (topStreamable.length >= 4) {
      collections.push({ name: 'Best Free Films', description: 'Top-rated films you can stream right now', movies: topStreamable });
    }

    // Comedy
    const comedy = movies.filter((m) => m.genres.some((g) => g.toLowerCase() === 'comedy'))
      .sort((a, b) => b.voteAverage - a.voteAverage).slice(0, 12);
    if (comedy.length >= 4) {
      collections.push({ name: 'Classic Comedies', description: 'Timeless humor from cinema\'s greatest comedians', movies: comedy });
    }

    return collections;
  });

  getRecommendations(watchedIds: Set<string>, limit = 12): MovieSummary[] {
    const watched = this.movies().filter((m) => watchedIds.has(m.id));
    if (watched.length < 3) return [];

    const genreCounts = new Map<string, number>();
    const directorCounts = new Map<string, number>();
    const decadeCounts = new Map<number, number>();

    for (const m of watched) {
      for (const g of m.genres) genreCounts.set(g, (genreCounts.get(g) ?? 0) + 1);
      for (const d of m.directors) directorCounts.set(d, (directorCounts.get(d) ?? 0) + 1);
      const decade = Math.floor(m.year / 10) * 10;
      decadeCounts.set(decade, (decadeCounts.get(decade) ?? 0) + 1);
    }

    return this.movies()
      .filter((m) => !watchedIds.has(m.id))
      .map((m) => {
        let score = 0;
        for (const g of m.genres) score += (genreCounts.get(g) ?? 0) * 2;
        for (const d of m.directors) score += (directorCounts.get(d) ?? 0) * 3;
        const decade = Math.floor(m.year / 10) * 10;
        score += (decadeCounts.get(decade) ?? 0);
        if (m.voteAverage >= 7) score += 2;
        if (m.isStreamable) score += 1;
        return { movie: m, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score || b.movie.voteAverage - a.movie.voteAverage)
      .slice(0, limit)
      .map((r) => r.movie);
  }
}
