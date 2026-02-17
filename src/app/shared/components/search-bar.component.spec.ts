import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { SearchBarComponent } from './search-bar.component';

describe('SearchBarComponent', () => {
  let fixture: ComponentFixture<SearchBarComponent>;
  let component: SearchBarComponent;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBarComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should render search input', () => {
    const input = el.querySelector('input[type="search"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.placeholder).toContain('Search');
  });

  it('should have combobox role with aria-expanded', () => {
    const combobox = el.querySelector('[role="combobox"]') as HTMLElement;
    expect(combobox).toBeTruthy();
    expect(combobox.getAttribute('aria-expanded')).toBe('false');
  });

  it('should have aria-controls on input', () => {
    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-controls')).toBe('search-suggestions');
  });

  it('should have aria-autocomplete on input', () => {
    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-autocomplete')).toBe('list');
  });

  it('should not show suggestions initially', () => {
    const suggestions = el.querySelector('.search__suggestions');
    expect(suggestions).toBeFalsy();
  });

  it('should not show history when input is not focused', () => {
    const history = el.querySelector('.search__history');
    expect(history).toBeFalsy();
  });

  it('should update query signal on input', () => {
    const input = el.querySelector('input') as HTMLInputElement;
    input.value = 'test';
    input.dispatchEvent(new Event('input'));
    expect(component.query()).toBe('test');
  });

  it('should emit searched event on input after debounce', async () => {
    let emitted = '';
    component.searched.subscribe((v: string) => emitted = v);

    const input = el.querySelector('input') as HTMLInputElement;
    input.value = 'hello';
    input.dispatchEvent(new Event('input'));

    // Wait for debounce
    await new Promise((r) => setTimeout(r, 350));
    expect(emitted).toBe('hello');
  });

  it('should handle keyboard navigation in suggestions', () => {
    // Set up suggestions
    component.suggestions.set([
      { id: 'Q1', title: 'Film A', year: 1940, posterUrl: null, tmdbId: '1', imdbId: null, internetArchiveId: null, youtubeId: null, voteAverage: 7, genres: [], directors: [], language: null, isStreamable: true },
      { id: 'Q2', title: 'Film B', year: 1950, posterUrl: null, tmdbId: '2', imdbId: null, internetArchiveId: null, youtubeId: null, voteAverage: 6, genres: [], directors: [], language: null, isStreamable: true },
    ]);
    component.showSuggestions.set(true);
    fixture.detectChanges();

    const input = el.querySelector('input') as HTMLInputElement;

    // ArrowDown should move active index
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(component.activeIndex()).toBe(0);

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(component.activeIndex()).toBe(1);

    // ArrowUp should go back
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    expect(component.activeIndex()).toBe(0);

    // Escape should close suggestions
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(component.showSuggestions()).toBe(false);
  });

  it('should have aria-live region for suggestion announcements', () => {
    component.suggestions.set([
      { id: 'Q1', title: 'Film A', year: 1940, posterUrl: null, tmdbId: '1', imdbId: null, internetArchiveId: null, youtubeId: null, voteAverage: 7, genres: [], directors: [], language: null, isStreamable: true },
      { id: 'Q2', title: 'Film B', year: 1950, posterUrl: null, tmdbId: '2', imdbId: null, internetArchiveId: null, youtubeId: null, voteAverage: 6, genres: [], directors: [], language: null, isStreamable: true },
    ]);
    component.showSuggestions.set(true);
    fixture.detectChanges();

    const liveRegion = el.querySelector('[aria-live="polite"]') as HTMLElement;
    expect(liveRegion).toBeTruthy();
    expect(liveRegion.textContent).toContain('2 suggestions available');
  });

  it('should render suggestions when showSuggestions is true', () => {
    component.suggestions.set([
      { id: 'Q1', title: 'Film A', year: 1940, posterUrl: null, tmdbId: '1', imdbId: null, internetArchiveId: null, youtubeId: null, voteAverage: 7, genres: [], directors: ['Dir A'], language: null, isStreamable: true },
    ]);
    component.showSuggestions.set(true);
    fixture.detectChanges();

    const suggestions = el.querySelector('.search__suggestions');
    expect(suggestions).toBeTruthy();
    const items = el.querySelectorAll('.search__suggestion');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('Film A');
  });
});
