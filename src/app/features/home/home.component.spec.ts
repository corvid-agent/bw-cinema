import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { HomeComponent } from './home.component';
import { CatalogService } from '../../core/services/catalog.service';
import type { Catalog } from '../../core/models/catalog.model';

const mockCatalog: Catalog = {
  meta: {
    generatedAt: '2026-01-01T00:00:00Z',
    totalMovies: 4,
    genres: ['Drama', 'Comedy', 'Horror'],
    decades: [1930, 1940, 1950],
    languages: [],
    topDirectors: [],
  },
  movies: [
    {
      id: 'Q1', title: 'Alpha Film', year: 1935, posterUrl: null,
      tmdbId: '1', imdbId: 'tt001', internetArchiveId: 'alpha', youtubeId: null,
      voteAverage: 8.5, genres: ['Drama'], directors: ['Dir A'],
      language: 'en', isStreamable: true,
    },
    {
      id: 'Q2', title: 'Beta Film', year: 1942, posterUrl: 'http://poster.jpg',
      tmdbId: '2', imdbId: 'tt002', internetArchiveId: null, youtubeId: 'yt1',
      voteAverage: 7.0, genres: ['Comedy', 'Drama'], directors: ['Dir B'],
      language: 'fr', isStreamable: true,
    },
    {
      id: 'Q3', title: 'Gamma Film', year: 1955, posterUrl: null,
      tmdbId: '3', imdbId: null, internetArchiveId: null, youtubeId: null,
      voteAverage: 6.0, genres: ['Horror'], directors: ['Dir C'],
      language: 'de', isStreamable: false,
    },
    {
      id: 'Q4', title: 'Delta Film', year: 1948, posterUrl: 'http://poster2.jpg',
      tmdbId: '4', imdbId: 'tt004', internetArchiveId: 'delta', youtubeId: null,
      voteAverage: 9.0, genres: ['Drama'], directors: ['Dir A'],
      language: 'en', isStreamable: true,
    },
  ],
};

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    try { localStorage.clear(); } catch { /* noop */ }
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    httpTesting = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpTesting.expectOne('assets/data/catalog.json').flush(mockCatalog);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render hero section title', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Classic Black');
  });

  it('should display correct film count', () => {
    const comp = fixture.componentInstance;
    expect(comp.filmCount()).toBe('4');
  });

  it('should display correct streamable count', () => {
    const comp = fixture.componentInstance;
    expect(comp.streamableCount()).toBe('3');
  });

  it('should compute language count', () => {
    const comp = fixture.componentInstance;
    expect(comp.languageCount()).toBe(3);
  });

  it('should compute director count', () => {
    const comp = fixture.componentInstance;
    expect(comp.directorCount()).toBe('3');
  });

  it('should compute genre count', () => {
    const comp = fixture.componentInstance;
    expect(comp.genreCount()).toBe(3);
  });

  it('should have film of the day', () => {
    const catalog = TestBed.inject(CatalogService);
    expect(catalog.filmOfTheDay()).toBeTruthy();
  });

  it('should compute decades from meta', () => {
    const comp = fixture.componentInstance;
    expect(comp.decades()).toEqual([1930, 1940, 1950]);
  });

  it('should compute genres from meta', () => {
    const comp = fixture.componentInstance;
    expect(comp.genres()).toEqual(['Drama', 'Comedy', 'Horror']);
  });
});
