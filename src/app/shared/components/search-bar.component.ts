import { Component, ChangeDetectionStrategy, output, signal, inject, OnDestroy, ElementRef, HostListener } from '@angular/core';
import { CatalogService } from '../../core/services/catalog.service';
import type { MovieSummary } from '../../core/models/movie.model';

@Component({
  selector: 'app-search-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="search" role="combobox" aria-expanded="false" aria-haspopup="listbox">
      <label for="search-input" class="sr-only">Search films</label>
      <svg class="search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        id="search-input"
        type="search"
        class="search__input"
        placeholder="Search by title, director, or year..."
        [value]="query()"
        (input)="onInput($event)"
        (focus)="showSuggestions.set(suggestions().length > 0)"
        (keydown)="onKeydown($event)"
        aria-label="Search films"
        aria-autocomplete="list"
        [attr.aria-activedescendant]="activeIndex() >= 0 ? 'suggestion-' + activeIndex() : null"
        autocomplete="off"
      />
      @if (showSuggestions() && suggestions().length > 0) {
        <ul class="search__suggestions" role="listbox" id="search-suggestions">
          @for (s of suggestions(); track s.id; let i = $index) {
            <li
              [id]="'suggestion-' + i"
              role="option"
              class="search__suggestion"
              [class.search__suggestion--active]="i === activeIndex()"
              [attr.aria-selected]="i === activeIndex()"
              (mousedown)="selectSuggestion(s)"
            >
              <span class="search__suggestion-title">{{ s.title }}</span>
              <span class="search__suggestion-meta">{{ s.year }}@if (s.directors.length > 0) { &middot; {{ s.directors[0] }}}</span>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: [`
    .search {
      position: relative;
      width: 100%;
    }
    .search__icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      width: 18px;
      height: 18px;
      color: var(--text-tertiary);
      pointer-events: none;
      z-index: 1;
    }
    .search__input {
      width: 100%;
      font-size: 1rem;
      padding: var(--space-md) var(--space-md) var(--space-md) 42px;
      background-color: var(--bg-surface);
      color: var(--text-primary);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
    }
    .search__input:focus {
      border-color: var(--accent-gold);
      background-color: var(--bg-input);
    }
    .search__suggestions {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      margin: 4px 0 0;
      padding: var(--space-xs) 0;
      list-style: none;
      background-color: var(--bg-surface);
      border: 1px solid var(--border-bright);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      z-index: 50;
      max-height: 320px;
      overflow-y: auto;
    }
    .search__suggestion {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px var(--space-md);
      cursor: pointer;
      transition: background-color 0.1s;
    }
    .search__suggestion:hover,
    .search__suggestion--active {
      background-color: var(--bg-hover);
    }
    .search__suggestion--active {
      outline: 2px solid var(--accent-gold);
      outline-offset: -2px;
    }
    .search__suggestion-title {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.95rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-right: var(--space-sm);
    }
    .search__suggestion-meta {
      font-size: 0.8rem;
      color: var(--text-tertiary);
      white-space: nowrap;
      flex-shrink: 0;
    }
  `],
})
export class SearchBarComponent implements OnDestroy {
  readonly searched = output<string>();
  readonly query = signal('');
  readonly suggestions = signal<MovieSummary[]>([]);
  readonly showSuggestions = signal(false);
  readonly activeIndex = signal(-1);

  private readonly catalog = inject(CatalogService);
  private readonly elRef = inject(ElementRef);
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  @HostListener('document:click', ['$event'])
  onDocClick(event: Event): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.showSuggestions.set(false);
    }
  }

  ngOnDestroy(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
    this.activeIndex.set(-1);

    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.searched.emit(value);
      this.updateSuggestions(value);
    }, 300);
  }

  onKeydown(event: KeyboardEvent): void {
    const list = this.suggestions();
    if (!this.showSuggestions() || list.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex.update((i) => (i + 1) % list.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.update((i) => (i - 1 + list.length) % list.length);
        break;
      case 'Enter':
        if (this.activeIndex() >= 0) {
          event.preventDefault();
          this.selectSuggestion(list[this.activeIndex()]);
        }
        break;
      case 'Escape':
        this.showSuggestions.set(false);
        break;
    }
  }

  selectSuggestion(movie: MovieSummary): void {
    this.showSuggestions.set(false);
    this.query.set(movie.title);
    this.searched.emit(movie.title);
  }

  private updateSuggestions(query: string): void {
    if (query.length < 2) {
      this.suggestions.set([]);
      this.showSuggestions.set(false);
      return;
    }
    const q = query.toLowerCase();
    const matches = this.catalog.movies()
      .filter((m) =>
        m.title.toLowerCase().includes(q) ||
        m.directors.some((d) => d.toLowerCase().includes(q))
      )
      .slice(0, 8);
    this.suggestions.set(matches);
    this.showSuggestions.set(matches.length > 0);
  }
}
