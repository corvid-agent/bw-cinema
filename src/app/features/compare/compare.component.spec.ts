import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CompareComponent } from './compare.component';
import type { MovieSummary } from '../../core/models/movie.model';

const filmA: MovieSummary = {
  id: 'Q1', title: 'Casablanca', year: 1942, posterUrl: 'poster-a.jpg',
  tmdbId: '1', imdbId: 'tt001', internetArchiveId: 'casa', youtubeId: null,
  voteAverage: 8.5, genres: ['Drama', 'Romance'], directors: ['Michael Curtiz'],
  language: 'en', isStreamable: true,
};

const filmB: MovieSummary = {
  id: 'Q2', title: 'Nosferatu', year: 1922, posterUrl: 'poster-b.jpg',
  tmdbId: '2', imdbId: 'tt002', internetArchiveId: null, youtubeId: 'yt1',
  voteAverage: 7.9, genres: ['Horror'], directors: ['F.W. Murnau'],
  language: 'de', isStreamable: true,
};

const filmC: MovieSummary = {
  id: 'Q3', title: 'Metropolis', year: 1927, posterUrl: null,
  tmdbId: '3', imdbId: 'tt003', internetArchiveId: null, youtubeId: null,
  voteAverage: 8.3, genres: ['Drama', 'Sci-Fi'], directors: ['Fritz Lang'],
  language: 'de', isStreamable: false,
};

describe('CompareComponent', () => {
  let fixture: ComponentFixture<CompareComponent>;
  let component: CompareComponent;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompareComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CompareComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should render title and subtitle', () => {
    expect(el.querySelector('h1')?.textContent).toContain('Compare Films');
    expect(el.querySelector('.compare__subtitle')?.textContent).toContain('Select two films');
  });

  it('should render search inputs for film A and film B', () => {
    const inputs = el.querySelectorAll('input[type="search"]');
    expect(inputs.length).toBe(2);
  });

  it('should not render comparison table without selections', () => {
    expect(el.querySelector('.compare__table')).toBeFalsy();
  });

  it('should show same-film warning when both selections match', () => {
    component.filmA.set(filmA);
    component.filmB.set(filmA);
    fixture.detectChanges();

    const warning = el.querySelector('.compare__same-warning');
    expect(warning).toBeTruthy();
    expect(warning?.textContent).toContain('same film');
    expect(el.querySelector('.compare__table')).toBeFalsy();
  });

  it('should render comparison table when two different films selected', () => {
    component.filmA.set(filmA);
    component.filmB.set(filmB);
    fixture.detectChanges();

    expect(el.querySelector('.compare__table')).toBeTruthy();
    expect(el.querySelector('.compare__same-warning')).toBeFalsy();
  });

  it('should display poster images with loading="lazy"', () => {
    component.filmA.set(filmA);
    component.filmB.set(filmB);
    fixture.detectChanges();

    const posters = el.querySelectorAll('.compare__poster') as NodeListOf<HTMLImageElement>;
    expect(posters.length).toBe(2);
    expect(posters[0].getAttribute('loading')).toBe('lazy');
    expect(posters[1].getAttribute('loading')).toBe('lazy');
  });

  it('should compute shared genres', () => {
    component.filmA.set(filmA);
    component.filmB.set({ ...filmB, genres: ['Drama', 'Horror'] });
    expect(component.sharedGenres()).toEqual(['Drama']);
  });

  it('should compute similarity score > 0', () => {
    component.filmA.set(filmA);
    component.filmB.set(filmB);
    expect(component.similarityScore()).toBeGreaterThan(0);
  });

  it('should compute higher similarity for same-genre films', () => {
    component.filmA.set(filmA);
    component.filmB.set(filmB);
    const scoreB = component.similarityScore();

    component.filmB.set(filmC); // filmC shares Drama genre with filmA
    const scoreC = component.similarityScore();

    expect(scoreC).toBeGreaterThan(scoreB);
  });

  it('should compute verdict text', () => {
    component.filmA.set(filmA);
    component.filmB.set(filmB);
    expect(component.verdict()).toContain('Casablanca');
    expect(component.verdict()).toContain('Nosferatu');
  });

  it('should compute year gap', () => {
    component.filmA.set(filmA);
    component.filmB.set(filmB);
    expect(component.yearGap()).toContain('20 years apart');
  });

  it('should compute combined average rating', () => {
    component.filmA.set(filmA);
    component.filmB.set(filmB);
    expect(component.combinedAvgRating()).toBe('8.2');
  });

  it('should compute genre overlap percentage', () => {
    component.filmA.set(filmA);
    component.filmB.set({ ...filmB, genres: ['Drama', 'Horror'] });
    // Shared: Drama (1), Total: Drama, Romance, Horror (3) → 33%
    expect(component.genreOverlapPct()).toBe(33);
  });

  it('should swap films', () => {
    component.filmA.set(filmA);
    component.filmB.set(filmB);
    component.queryA.set('Casablanca');
    component.queryB.set('Nosferatu');

    component.swap();

    expect(component.filmA()?.id).toBe('Q2');
    expect(component.filmB()?.id).toBe('Q1');
    expect(component.queryA()).toBe('Nosferatu');
    expect(component.queryB()).toBe('Casablanca');
  });

  it('should get stream source correctly', () => {
    expect(component.getStreamSource(filmA)).toBe('Internet Archive');
    expect(component.getStreamSource(filmB)).toBe('YouTube');
    expect(component.getStreamSource(filmC)).toBe('IMDb (info only)');
    expect(component.getStreamSource({ ...filmC, imdbId: null })).toBe('Not available');
  });

  it('should compute comparison notes', () => {
    component.filmA.set(filmA);
    component.filmB.set(filmB);
    const notes = component.comparisonNotes();
    expect(notes.some((n) => n.includes('20 years apart'))).toBe(true);
    expect(notes.some((n) => n.includes('Both free to watch'))).toBe(true);
  });

  it('should compute double feature note for high similarity', () => {
    component.filmA.set(filmA);
    // Create a very similar film
    component.filmB.set({
      ...filmB, year: 1943, genres: ['Drama', 'Romance'],
      directors: ['Michael Curtiz'], language: 'en', voteAverage: 8.4,
    });
    expect(component.similarityScore()).toBeGreaterThanOrEqual(70);
    expect(component.doubleFeatureNote()).toBe('Perfect double feature!');
  });
});
