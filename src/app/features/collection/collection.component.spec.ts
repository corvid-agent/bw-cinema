import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CollectionComponent } from './collection.component';
import { CollectionService } from '../../core/services/collection.service';
import type { Catalog } from '../../core/models/catalog.model';

const mockCatalog: Catalog = {
  meta: {
    generatedAt: '2026-01-01T00:00:00Z',
    totalMovies: 3,
    genres: ['Drama', 'Comedy', 'Horror'],
    decades: [1940, 1950],
    languages: [],
    topDirectors: [],
  },
  movies: [
    {
      id: 'Q1', title: 'Alpha Film', year: 1941, posterUrl: null,
      tmdbId: '1', imdbId: 'tt001', internetArchiveId: 'alpha', youtubeId: null,
      voteAverage: 8.0, genres: ['Drama'], directors: ['Dir A'],
      language: 'en', isStreamable: true,
    },
    {
      id: 'Q2', title: 'Beta Film', year: 1955, posterUrl: null,
      tmdbId: '2', imdbId: 'tt002', internetArchiveId: null, youtubeId: null,
      voteAverage: 6.5, genres: ['Comedy', 'Drama'], directors: ['Dir B'],
      language: 'fr', isStreamable: false,
    },
    {
      id: 'Q3', title: 'Gamma Film', year: 1948, posterUrl: 'http://poster.jpg',
      tmdbId: '3', imdbId: null, internetArchiveId: null, youtubeId: 'yt123',
      voteAverage: 7.5, genres: ['Horror'], directors: ['Dir A', 'Dir C'],
      language: 'en', isStreamable: true,
    },
  ],
};

describe('CollectionComponent', () => {
  let fixture: ComponentFixture<CollectionComponent>;
  let httpTesting: HttpTestingController;
  let collectionService: CollectionService;
  let mockStore: Record<string, string>;

  beforeEach(async () => {
    mockStore = {};
    const mockStorage: Storage = {
      length: 0,
      clear: () => { mockStore = {}; },
      getItem: (key: string) => mockStore[key] ?? null,
      setItem: (key: string, value: string) => { mockStore[key] = value; },
      removeItem: (key: string) => { delete mockStore[key]; },
      key: () => null,
    };
    Object.defineProperty(globalThis, 'localStorage', { value: mockStorage, writable: true, configurable: true });

    await TestBed.configureTestingModule({
      imports: [CollectionComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    collectionService = TestBed.inject(CollectionService);
    fixture = TestBed.createComponent(CollectionComponent);
    httpTesting = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpTesting.expectOne('assets/data/catalog.json').flush(mockCatalog);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should default to watchlist tab', () => {
    expect(fixture.componentInstance.activeTab()).toBe('watchlist');
  });

  it('should return correct watchlist movies', () => {
    collectionService.addToWatchlist('Q1');
    collectionService.addToWatchlist('Q3');
    fixture.detectChanges();

    const movies = fixture.componentInstance.watchlistMovies();
    expect(movies.length).toBe(2);
    expect(movies.map((m) => m.id)).toContain('Q1');
    expect(movies.map((m) => m.id)).toContain('Q3');
  });

  it('should return correct watched movies', () => {
    collectionService.markWatched('Q2');
    fixture.detectChanges();

    const movies = fixture.componentInstance.watchedMovies();
    expect(movies.length).toBe(1);
    expect(movies[0].id).toBe('Q2');
  });

  it('should return correct favorite movies', () => {
    collectionService.toggleFavorite('Q1');
    collectionService.toggleFavorite('Q3');
    fixture.detectChanges();

    const movies = fixture.componentInstance.favoriteMovies();
    expect(movies.length).toBe(2);
    expect(movies.map((m) => m.id)).toContain('Q1');
    expect(movies.map((m) => m.id)).toContain('Q3');
  });

  it('should show empty state when no collection data', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('No films in your watchlist');
  });

  it('should sort watchlist by title ascending', () => {
    collectionService.addToWatchlist('Q3');
    collectionService.addToWatchlist('Q1');
    collectionService.addToWatchlist('Q2');
    fixture.componentInstance.sortBy.set('title-asc');
    fixture.detectChanges();

    const sorted = fixture.componentInstance.sortedWatchlist();
    expect(sorted.length).toBe(3);
    expect(sorted[0].title).toBe('Alpha Film');
    expect(sorted[1].title).toBe('Beta Film');
    expect(sorted[2].title).toBe('Gamma Film');
  });

  it('should switch tabs', () => {
    fixture.componentInstance.activeTab.set('watched');
    fixture.detectChanges();
    expect(fixture.componentInstance.activeTab()).toBe('watched');

    const el = fixture.nativeElement as HTMLElement;
    const watchedTab = el.querySelector('[aria-selected="true"]');
    expect(watchedTab?.textContent).toContain('Watched');

    fixture.componentInstance.activeTab.set('favorites');
    fixture.detectChanges();
    expect(fixture.componentInstance.activeTab()).toBe('favorites');
  });
});
