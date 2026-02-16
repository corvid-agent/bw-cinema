import { describe, it, expect } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MovieCardComponent } from './movie-card.component';
import type { MovieSummary } from '../../core/models/movie.model';

const mockMovie: MovieSummary = {
  id: 'Q100',
  title: 'Test Classic',
  year: 1945,
  posterUrl: 'https://example.com/poster.jpg',
  tmdbId: '100',
  imdbId: 'tt100',
  internetArchiveId: 'test-classic',
  youtubeId: null,
  voteAverage: 8.0,
  genres: ['Drama'],
  directors: ['John Director'],
  isStreamable: true,
};

describe('MovieCardComponent', () => {
  let fixture: ComponentFixture<MovieCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieCardComponent);
    fixture.componentRef.setInput('movie', mockMovie);
    fixture.detectChanges();
  });

  it('should render movie title', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Test Classic');
  });

  it('should render year', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('1945');
  });

  it('should show streamable badge', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Watch Free');
  });

  it('should render poster image', () => {
    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.src).toContain('poster.jpg');
  });

  it('should link to movie detail', () => {
    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/movie/Q100');
  });

  it('should show placeholder with title when no poster', () => {
    const noPosterMovie = { ...mockMovie, posterUrl: null };
    fixture.componentRef.setInput('movie', noPosterMovie);
    fixture.detectChanges();
    const placeholder = fixture.nativeElement.querySelector('.card__poster-placeholder');
    expect(placeholder).toBeTruthy();
    expect(placeholder.textContent).toContain('Test Classic');
    expect(placeholder.textContent).toContain('1945');
  });

  it('should hide badge when not streamable', () => {
    const nonStreamable = { ...mockMovie, isStreamable: false };
    fixture.componentRef.setInput('movie', nonStreamable);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('Watch Free');
  });
});
