import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { BrowseComponent } from './browse.component';
import type { Catalog } from '../../core/models/catalog.model';

const mockCatalog: Catalog = {
  meta: {
    generatedAt: '2026-01-01T00:00:00Z',
    totalMovies: 2,
    genres: ['Drama', 'Comedy'],
    decades: [1940, 1950],
    topDirectors: [],
  },
  movies: [
    {
      id: 'Q1',
      title: 'Alpha Film',
      year: 1941,
      posterUrl: null,
      tmdbId: '1',
      imdbId: 'tt001',
      internetArchiveId: 'alpha',
      youtubeId: null,
      voteAverage: 8.0,
      genres: ['Drama'],
      directors: ['Dir A'],
      isStreamable: true,
    },
    {
      id: 'Q2',
      title: 'Beta Film',
      year: 1955,
      posterUrl: null,
      tmdbId: '2',
      imdbId: 'tt002',
      internetArchiveId: null,
      youtubeId: null,
      voteAverage: 6.0,
      genres: ['Comedy'],
      directors: ['Dir B'],
      isStreamable: false,
    },
  ],
};

describe('BrowseComponent', () => {
  let fixture: ComponentFixture<BrowseComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowseComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BrowseComponent);
    httpTesting = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpTesting.expectOne('assets/data/catalog.json').flush(mockCatalog);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should render browse title', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Browse Films');
  });

  it('should display film count', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('2 films found');
  });

  it('should filter via search', () => {
    fixture.componentInstance.onSearch('Alpha');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('1 films found');
  });

  it('should paginate results', () => {
    expect(fixture.componentInstance.paginatedMovies().length).toBe(2);
  });
});
