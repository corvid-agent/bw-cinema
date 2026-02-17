import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MovieComponent } from './movie.component';
import { CollectionService } from '../../core/services/collection.service';
import type { Catalog } from '../../core/models/catalog.model';

const mockCatalog: Catalog = {
  meta: {
    generatedAt: '2026-01-01T00:00:00Z',
    totalMovies: 3,
    genres: ['Drama', 'Comedy'],
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
      voteAverage: 6.0, genres: ['Comedy'], directors: ['Dir B'],
      language: 'en', isStreamable: false,
    },
    {
      id: 'Q3', title: 'Gamma Film', year: 1948, posterUrl: null,
      tmdbId: '3', imdbId: null, internetArchiveId: null, youtubeId: 'yt123',
      voteAverage: 7.5, genres: ['Drama', 'Comedy'], directors: ['Dir A'],
      language: 'fr', isStreamable: true,
    },
  ],
};

describe('MovieComponent', () => {
  let fixture: ComponentFixture<MovieComponent>;
  let httpTesting: HttpTestingController;
  let collection: CollectionService;

  beforeEach(async () => {
    try { localStorage.clear(); } catch { /* noop */ }
    await TestBed.configureTestingModule({
      imports: [MovieComponent],
      providers: [
        provideRouter([{ path: 'movie/:id', component: MovieComponent }]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieComponent);
    httpTesting = TestBed.inject(HttpTestingController);
    collection = TestBed.inject(CollectionService);
    fixture.componentRef.setInput('id', 'Q1');
    fixture.detectChanges();
    httpTesting.expectOne('assets/data/catalog.json').flush(mockCatalog);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show loading skeleton initially', () => {
    expect(fixture.componentInstance.loading()).toBe(true);
  });

  it('should compute similar films', () => {
    const similar = fixture.componentInstance.similarFilms();
    // Q3 shares Drama genre and Dir A director with Q1
    expect(similar.length).toBeGreaterThan(0);
  });

  it('should compute catalog rank', () => {
    const rank = fixture.componentInstance.catalogRank();
    // Q1 has 8.0 rating — should be rank 1 of 3
    expect(rank).toBeTruthy();
  });

  it('should track watchlist via collection service', () => {
    collection.addToWatchlist('Q1');
    expect(collection.isInWatchlist('Q1')).toBe(true);
  });

  it('should track watched via collection service', () => {
    collection.markWatched('Q1');
    expect(collection.isWatched('Q1')).toBe(true);
  });

  it('should track favorites via collection service', () => {
    collection.toggleFavorite('Q1');
    expect(collection.isFavorite('Q1')).toBe(true);
  });

  it('should set user rating via collection service', () => {
    collection.markWatched('Q1');
    collection.setRating('Q1', 9);
    expect(collection.getUserRating('Q1')).toBe(9);
  });
});
