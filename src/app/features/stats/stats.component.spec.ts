import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { StatsComponent } from './stats.component';
import { CatalogService } from '../../core/services/catalog.service';
import type { Catalog } from '../../core/models/catalog.model';

const mockCatalog: Catalog = {
  meta: {
    generatedAt: '2026-01-01T00:00:00Z',
    totalMovies: 4,
    genres: ['Drama', 'Comedy', 'Horror', 'Thriller'],
    decades: [1930, 1940, 1950],
    languages: [],
    topDirectors: [],
  },
  movies: [
    {
      id: 'Q1', title: 'Alpha Film', year: 1935, posterUrl: null,
      tmdbId: '1', imdbId: 'tt001', internetArchiveId: 'alpha', youtubeId: null,
      voteAverage: 8.2, genres: ['Drama', 'Thriller'], directors: ['Dir A'],
      language: 'en', isStreamable: true,
    },
    {
      id: 'Q2', title: 'Beta', year: 1942, posterUrl: 'http://p.jpg',
      tmdbId: '2', imdbId: 'tt002', internetArchiveId: null, youtubeId: 'yt1',
      voteAverage: 6.5, genres: ['Comedy'], directors: ['Dir B'],
      language: 'fr', isStreamable: true,
    },
    {
      id: 'Q3', title: 'Gamma Film Extra Long Title', year: 1955, posterUrl: 'http://p2.jpg',
      tmdbId: '3', imdbId: null, internetArchiveId: null, youtubeId: null,
      voteAverage: 7.0, genres: ['Horror', 'Drama'], directors: ['Dir A', 'Dir C'],
      language: 'en', isStreamable: false,
    },
    {
      id: 'Q4', title: 'Delta', year: 1928, posterUrl: null,
      tmdbId: '4', imdbId: 'tt004', internetArchiveId: 'delta', youtubeId: null,
      voteAverage: 0, genres: ['Drama'], directors: ['Dir A'],
      language: 'de', isStreamable: true,
    },
  ],
};

describe('StatsComponent', () => {
  let fixture: ComponentFixture<StatsComponent>;
  let component: StatsComponent;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StatsComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpTesting.expectOne('assets/data/catalog.json').flush(mockCatalog);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return totalFilms as 4', () => {
    expect(component.totalFilms()).toBe(4);
  });

  it('should return streamableFilms as 3', () => {
    expect(component.streamableFilms()).toBe(3);
  });

  it('should return uniqueDirectors as 3', () => {
    expect(component.uniqueDirectors()).toBe(3);
  });

  it('should compute avgRating from rated films only', () => {
    // Rated films: 8.2 + 6.5 + 7.0 = 21.7, count = 3, avg = 7.2333...
    expect(component.avgRating()).toBe('7.2');
  });

  it('should return yearRange in min\u2013max format', () => {
    expect(component.yearRange()).toBe('1928\u20131955');
  });

  it('should compute correct decadeStats', () => {
    const decades = component.decadeStats();
    const decadeNames = decades.map((d) => d.name);
    expect(decadeNames).toContain('1920s');
    expect(decadeNames).toContain('1930s');
    expect(decadeNames).toContain('1940s');
    expect(decadeNames).toContain('1950s');
    const d1930 = decades.find((d) => d.name === '1930s');
    expect(d1930?.count).toBe(1);
  });

  it('should include Drama as top genre in genreStats', () => {
    const genres = component.genreStats();
    expect(genres.length).toBeGreaterThan(0);
    expect(genres[0].name).toBe('Drama');
    expect(genres[0].count).toBe(3);
  });

  it('should return silentFilmCount as 1 (year < 1930)', () => {
    expect(component.silentFilmCount()).toBe(1);
  });

  it('should render error message when catalog has error', () => {
    // Simulate error state via the catalog service signal
    const catalog = TestBed.inject(CatalogService);
    catalog.error.set('Failed to load film catalog. Please check your connection and try again.');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const alert = el.querySelector('[role="alert"]');
    expect(alert).toBeTruthy();
    expect(alert!.textContent).toContain('Failed to load film catalog');
  });
});
