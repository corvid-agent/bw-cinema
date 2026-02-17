import { Component, ChangeDetectionStrategy, output, signal, inject, OnDestroy, ElementRef, HostListener } from '@angular/core';
import { CatalogService } from '../../core/services/catalog.service';
import type { MovieSummary } from '../../core/models/movie.model';

@Component({
  selector: 'app-search-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="search" role="combobox" [attr.aria-expanded]="showSuggestions() && suggestions().length > 0" aria-haspopup="listbox">
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
        (focus)="onFocus()"
        (keydown)="onKeydown($event)"
        aria-label="Search films"
        aria-autocomplete="list"
        [attr.aria-activedescendant]="activeIndex() >= 0 ? 'suggestion-' + activeIndex() : null"
        aria-controls="search-suggestions"
        autocomplete="off"
      />
      @if (speechSupported) {
        <button
          class="search__mic"
          [class.search__mic--recording]="isListening()"
          (click)="toggleVoice()"
          [attr.aria-label]="isListening() ? 'Stop voice search' : 'Voice search'"
          type="button"
        >
          @if (isListening()) {
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
          } @else {
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          }
        </button>
      }
      @if (!showSuggestions() && showHistory() && searchHistory().length > 0) {
        <div class="search__history">
          <div class="search__history-header">
            <span class="search__history-label">Recent Searches</span>
            <button class="search__history-clear" (mousedown)="clearHistory()" type="button">Clear</button>
          </div>
          @for (term of searchHistory(); track term) {
            <button class="search__history-item" (mousedown)="selectHistory(term)" type="button">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {{ term }}
            </button>
          }
        </div>
      }
      <div class="sr-only" aria-live="polite" aria-atomic="true">
        @if (showSuggestions() && suggestions().length > 0) {
          {{ suggestions().length }} suggestion{{ suggestions().length !== 1 ? 's' : '' }} available
        }
      </div>
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
          @if (totalMatches() > suggestions().length) {
            <li class="search__match-count" role="presentation">
              Showing {{ suggestions().length }} of {{ totalMatches() }} matches
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
      padding: var(--space-md) 52px var(--space-md) 42px;
      background-color: var(--bg-surface);
      color: var(--text-primary);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
    }
    .search__input:focus {
      border-color: var(--accent-gold);
      background-color: var(--bg-input);
    }
    .search__mic {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-tertiary);
      cursor: pointer;
      padding: 6px;
      min-width: 36px;
      min-height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: color 0.2s, background-color 0.2s;
    }
    .search__mic:hover {
      color: var(--accent-gold);
      background-color: var(--accent-gold-dim);
    }
    .search__mic--recording {
      color: #e53e3e;
      animation: pulse-mic 1.2s infinite;
    }
    @keyframes pulse-mic {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
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
      z-index: 110;
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
    .search__match-count {
      padding: 6px var(--space-md);
      font-size: 0.75rem;
      color: var(--text-tertiary);
      text-align: center;
      border-top: 1px solid var(--border);
    }
    .search__history {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      margin: 4px 0 0;
      padding: var(--space-xs);
      background-color: var(--bg-surface);
      border: 1px solid var(--border-bright);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      z-index: 110;
    }
    .search__history-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-xs) var(--space-sm);
    }
    .search__history-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-tertiary);
      font-weight: 600;
    }
    .search__history-clear {
      background: none;
      border: none;
      color: var(--text-tertiary);
      font-size: 0.75rem;
      cursor: pointer;
      padding: 2px 6px;
      min-height: auto;
      min-width: auto;
    }
    .search__history-clear:hover { color: var(--accent-gold); }
    .search__history-item {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      width: 100%;
      padding: 8px var(--space-sm);
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 0.9rem;
      cursor: pointer;
      text-align: left;
      border-radius: var(--radius);
      min-height: auto;
      min-width: auto;
    }
    .search__history-item:hover {
      background-color: var(--bg-hover);
      color: var(--text-primary);
    }
    .search__history-item svg {
      color: var(--text-tertiary);
      flex-shrink: 0;
    }
    @media (max-width: 480px) {
      .search__suggestions,
      .search__history {
        max-height: 50vh;
        overflow-y: auto;
      }
    }
  `],
})
export class SearchBarComponent implements OnDestroy {
  readonly searched = output<string>();
  readonly query = signal('');
  readonly suggestions = signal<MovieSummary[]>([]);
  readonly totalMatches = signal(0);
  readonly showSuggestions = signal(false);
  readonly showHistory = signal(false);
  readonly activeIndex = signal(-1);
  readonly isListening = signal(false);
  readonly searchHistory = signal<string[]>(this.loadHistory());

  readonly speechSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  private static readonly HISTORY_KEY = 'bw-cinema-search-history';
  private static readonly MAX_HISTORY = 10;

  private readonly catalog = inject(CatalogService);
  private readonly elRef = inject(ElementRef);
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private recognition: any = null;

  @HostListener('document:click', ['$event'])
  onDocClick(event: Event): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.showSuggestions.set(false);
      this.showHistory.set(false);
    }
  }

  ngOnDestroy(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.stopVoice();
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
    this.activeIndex.set(-1);

    this.showHistory.set(false);
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.searched.emit(value);
      this.updateSuggestions(value);
      this.addToHistory(value);
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

  onFocus(): void {
    if (this.suggestions().length > 0) {
      this.showSuggestions.set(true);
    } else if (this.query().length === 0) {
      this.showHistory.set(true);
    }
  }

  selectSuggestion(movie: MovieSummary): void {
    this.showSuggestions.set(false);
    this.showHistory.set(false);
    this.query.set(movie.title);
    this.addToHistory(movie.title);
    this.searched.emit(movie.title);
  }

  selectHistory(term: string): void {
    this.showHistory.set(false);
    this.query.set(term);
    this.searched.emit(term);
    this.updateSuggestions(term);
  }

  clearHistory(): void {
    this.searchHistory.set([]);
    this.showHistory.set(false);
    try { localStorage.removeItem(SearchBarComponent.HISTORY_KEY); } catch { /* noop */ }
  }

  private addToHistory(term: string): void {
    const trimmed = term.trim();
    if (trimmed.length < 2) return;
    const current = this.searchHistory().filter((t) => t !== trimmed);
    const updated = [trimmed, ...current].slice(0, SearchBarComponent.MAX_HISTORY);
    this.searchHistory.set(updated);
    try { localStorage.setItem(SearchBarComponent.HISTORY_KEY, JSON.stringify(updated)); } catch { /* noop */ }
  }

  private loadHistory(): string[] {
    try {
      const raw = localStorage.getItem('bw-cinema-search-history');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  toggleVoice(): void {
    if (this.isListening()) {
      this.stopVoice();
    } else {
      this.startVoice();
    }
  }

  private startVoice(): void {
    const SpeechRecognition = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'en-US';
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      this.query.set(transcript);
      this.searched.emit(transcript);
      this.updateSuggestions(transcript);
      this.isListening.set(false);
    };

    this.recognition.onerror = () => {
      this.isListening.set(false);
    };

    this.recognition.onend = () => {
      this.isListening.set(false);
    };

    this.recognition.start();
    this.isListening.set(true);
  }

  private stopVoice(): void {
    if (this.recognition) {
      this.recognition.abort();
      this.recognition = null;
    }
    this.isListening.set(false);
  }

  private updateSuggestions(query: string): void {
    if (query.length < 2) {
      this.suggestions.set([]);
      this.totalMatches.set(0);
      this.showSuggestions.set(false);
      return;
    }
    const q = query.toLowerCase();
    const allMatches = this.catalog.movies()
      .filter((m) =>
        m.title.toLowerCase().includes(q) ||
        m.directors.some((d) => d.toLowerCase().includes(q))
      );
    this.totalMatches.set(allMatches.length);
    const matches = allMatches.slice(0, 8);
    this.suggestions.set(matches);
    this.showSuggestions.set(matches.length > 0);
  }
}
