import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CatalogService } from './catalog.service';
import type { Catalog } from '../models/catalog.model';

const mockCatalog: Catalog = {
  meta: {
    generatedAt: '2026-01-01T00:00:00Z',
    totalMovies: 3,
    genres: ['Drama', 'Comedy', 'Horror'],
    decades: [1940, 1950, 1960],
    topDirectors: [{ name: 'Alfred Hitchcock', count: 2 }],
  },
  movies: [
    {
      id: 'Q1',
      title: 'Test Film A',
      year: 1941,
      posterUrl: null,
      tmdbId: '1',
      imdbId: 'tt001',
      internetArchiveId: 'test-a',
      youtubeId: null,
      voteAverage: 8.5,
      genres: ['Drama'],
      directors: ['Director A'],
      isStreamable: true,
    },
    {
      id: 'Q2',
      title: 'Test Film B',
      year: 1955,
      posterUrl: null,
      tmdbId: '2',
      imdbId: 'tt002',
      internetArchiveId: null,
      youtubeId: null,
      voteAverage: 6.0,
      genres: ['Comedy'],
      directors: ['Director B'],
      isStreamable: false,
    },
    {
      id: 'Q3',
      title: 'Test Film C',
      year: 1960,
      posterUrl: null,
      tmdbId: '3',
      imdbId: 'tt003',
      internetArchiveId: null,
      youtubeId: 'abc123',
      voteAverage: 7.5,
      genres: ['Horror'],
      directors: ['Director A'],
      isStreamable: true,
    },
  ],
};

describe('CatalogService', () => {
  let service: CatalogService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CatalogService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  it('should load catalog from JSON', async () => {
    const loadPromise = service.load();
    const req = httpTesting.expectOne('assets/data/catalog.json');
    req.flush(mockCatalog);
    await loadPromise;

    expect(service.movies().length).toBe(3);
    expect(service.meta()?.totalMovies).toBe(3);
    expect(service.loaded()).toBe(true);
  });

  it('should not reload if already loaded', async () => {
    const loadPromise = service.load();
    httpTesting.expectOne('assets/data/catalog.json').flush(mockCatalog);
    await loadPromise;

    await service.load();
    httpTesting.expectNone('assets/data/catalog.json');
  });

  it('should compute featured films', async () => {
    const loadPromise = service.load();
    httpTesting.expectOne('assets/data/catalog.json').flush(mockCatalog);
    await loadPromise;

    const featured = service.featured();
    expect(featured.length).toBe(2);
    expect(featured[0].id).toBe('Q1');
    expect(featured[1].id).toBe('Q3');
  });

  it('should search by query', async () => {
    const loadPromise = service.load();
    httpTesting.expectOne('assets/data/catalog.json').flush(mockCatalog);
    await loadPromise;

    const results = service.search({
      query: 'Film A',
      decades: [],
      genres: [],
      directors: [],
      streamableOnly: false,
      minRating: 0,
      sortBy: 'title',
      sortDirection: 'asc',
    });
    expect(results.length).toBe(1);
    expect(results[0].title).toBe('Test Film A');
  });

  it('should filter by decade', async () => {
    const loadPromise = service.load();
    httpTesting.expectOne('assets/data/catalog.json').flush(mockCatalog);
    await loadPromise;

    const results = service.search({
      query: '',
      decades: [1940],
      genres: [],
      directors: [],
      streamableOnly: false,
      minRating: 0,
      sortBy: 'title',
      sortDirection: 'asc',
    });
    expect(results.length).toBe(1);
    expect(results[0].year).toBe(1941);
  });

  it('should filter streamable only', async () => {
    const loadPromise = service.load();
    httpTesting.expectOne('assets/data/catalog.json').flush(mockCatalog);
    await loadPromise;

    const results = service.search({
      query: '',
      decades: [],
      genres: [],
      directors: [],
      streamableOnly: true,
      minRating: 0,
      sortBy: 'title',
      sortDirection: 'asc',
    });
    expect(results.length).toBe(2);
    expect(results.every((m) => m.isStreamable)).toBe(true);
  });

  it('should filter by minimum rating', async () => {
    const loadPromise = service.load();
    httpTesting.expectOne('assets/data/catalog.json').flush(mockCatalog);
    await loadPromise;

    const results = service.search({
      query: '',
      decades: [],
      genres: [],
      directors: [],
      streamableOnly: false,
      minRating: 7.0,
      sortBy: 'rating',
      sortDirection: 'desc',
    });
    expect(results.length).toBe(2);
    expect(results[0].voteAverage).toBe(8.5);
  });

  it('should sort by year ascending', async () => {
    const loadPromise = service.load();
    httpTesting.expectOne('assets/data/catalog.json').flush(mockCatalog);
    await loadPromise;

    const results = service.search({
      query: '',
      decades: [],
      genres: [],
      directors: [],
      streamableOnly: false,
      minRating: 0,
      sortBy: 'year',
      sortDirection: 'asc',
    });
    expect(results[0].year).toBe(1941);
    expect(results[2].year).toBe(1960);
  });
});
