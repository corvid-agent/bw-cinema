import { Component, ChangeDetectionStrategy, input, output, signal, computed } from '@angular/core';
import type { DirectorCount } from '../../core/models/catalog.model';

@Component({
  selector: 'app-filter-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="filters" aria-label="Filter options">
      <div class="filters__header">
        <h3 class="filters__title">Filters</h3>
        <button class="filters__clear-btn" (click)="clearFilters()">Reset</button>
      </div>

      <div class="filters__group">
        <button class="filters__toggle" (click)="decadesOpen.set(!decadesOpen())">
          <span>Decades</span>
          <span class="filters__chevron" [class.open]="decadesOpen()">&#9662;</span>
        </button>
        @if (decadesOpen()) {
          <div class="filters__options">
            @for (decade of availableDecades(); track decade) {
              <label class="filters__checkbox">
                <input
                  type="checkbox"
                  [checked]="selectedDecades().has(decade)"
                  (change)="toggleDecade(decade)"
                />
                <span>{{ decade }}s</span>
              </label>
            }
          </div>
        }
      </div>

      <div class="filters__group">
        <button class="filters__toggle" (click)="genresOpen.set(!genresOpen())">
          <span>Genres</span>
          <span class="filters__chevron" [class.open]="genresOpen()">&#9662;</span>
        </button>
        @if (genresOpen()) {
          <div class="filters__options">
            @for (genre of availableGenres(); track genre) {
              <label class="filters__checkbox">
                <input
                  type="checkbox"
                  [checked]="selectedGenres().has(genre)"
                  (change)="toggleGenre(genre)"
                />
                <span>{{ genre }}</span>
              </label>
            }
          </div>
        }
      </div>

      <div class="filters__group">
        <button class="filters__toggle" (click)="directorsOpen.set(!directorsOpen())">
          <span>Directors</span>
          <span class="filters__chevron" [class.open]="directorsOpen()">&#9662;</span>
        </button>
        @if (directorsOpen()) {
          <div class="filters__options">
            <input
              type="search"
              class="filters__director-search"
              placeholder="Search directors..."
              [value]="directorQuery()"
              (input)="onDirectorSearch($event)"
              autocomplete="off"
            />
            @for (dir of filteredDirectors(); track dir.name) {
              <label class="filters__checkbox">
                <input
                  type="checkbox"
                  [checked]="selectedDirectors().has(dir.name)"
                  (change)="toggleDirector(dir.name)"
                />
                <span>{{ dir.name }}</span>
                <span class="filters__director-count">{{ dir.count }}</span>
              </label>
            }
            @if (filteredDirectors().length === 0 && directorQuery().length > 0) {
              <p class="filters__empty">No directors found</p>
            }
          </div>
        }
      </div>

      <div class="filters__group">
        <label class="filters__range-label">
          Year Range
          <span class="filters__range-value">{{ yearMin() }}–{{ yearMax() }}</span>
        </label>
        <div class="filters__year-range">
          <input
            type="range"
            [min]="yearBounds()[0]"
            [max]="yearBounds()[1]"
            step="1"
            class="filters__range"
            [value]="yearMin()"
            (input)="onYearMinChange($event)"
            aria-label="Minimum year"
          />
          <input
            type="range"
            [min]="yearBounds()[0]"
            [max]="yearBounds()[1]"
            step="1"
            class="filters__range"
            [value]="yearMax()"
            (input)="onYearMaxChange($event)"
            aria-label="Maximum year"
          />
        </div>
      </div>

      @if (availableLanguages().length > 0) {
        <div class="filters__group">
          <button class="filters__toggle" (click)="languagesOpen.set(!languagesOpen())">
            <span>Language</span>
            <span class="filters__chevron" [class.open]="languagesOpen()">&#9662;</span>
          </button>
          @if (languagesOpen()) {
            <div class="filters__options">
              <input
                type="search"
                class="filters__director-search"
                placeholder="Search languages..."
                [value]="languageQuery()"
                (input)="onLanguageSearch($event)"
                autocomplete="off"
              />
              @for (lang of filteredLanguages(); track lang.name) {
                <label class="filters__checkbox">
                  <input
                    type="checkbox"
                    [checked]="selectedLanguages().has(lang.name)"
                    (change)="toggleLanguage(lang.name)"
                  />
                  <span>{{ lang.name }}</span>
                  <span class="filters__director-count">{{ lang.count }}</span>
                </label>
              }
              @if (filteredLanguages().length === 0 && languageQuery().length > 0) {
                <p class="filters__empty">No languages found</p>
              }
            </div>
          }
        </div>
      }

      <div class="filters__group filters__group--inline">
        <label class="filters__checkbox filters__checkbox--toggle">
          <input
            type="checkbox"
            [checked]="streamableOnly()"
            (change)="streamableOnly.set(!streamableOnly()); emitFilter()"
          />
          <span>Free to watch only</span>
        </label>
      </div>

      <div class="filters__group">
        <label class="filters__range-label">
          Minimum rating
          <span class="filters__range-value">{{ minRating() > 0 ? minRating().toFixed(1) : 'Any' }}</span>
        </label>
        <input
          type="range"
          min="0"
          max="10"
          step="0.5"
          class="filters__range"
          [value]="minRating()"
          (input)="onRatingChange($event)"
        />
      </div>
    </aside>
  `,
  styles: [`
    .filters {
      background-color: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-md);
    }
    .filters__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: var(--space-md);
      border-bottom: 1px solid var(--border);
      margin-bottom: var(--space-xs);
    }
    .filters__title {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }
    .filters__clear-btn {
      background: none;
      border: 1px solid var(--border);
      border-radius: 12px;
      color: var(--text-tertiary);
      font-size: 0.75rem;
      font-weight: 600;
      padding: 3px 10px;
      min-height: auto;
      min-width: auto;
      cursor: pointer;
      transition: all 0.2s;
    }
    .filters__clear-btn:hover {
      color: var(--accent-gold);
      border-color: var(--accent-gold);
    }
    .filters__group {
      border-bottom: 1px solid var(--border);
      padding: var(--space-xs) 0;
    }
    .filters__group:last-child {
      border-bottom: none;
    }
    .filters__group--inline {
      padding: var(--space-sm) 0;
    }
    .filters__toggle {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: var(--space-sm) 2px;
      cursor: pointer;
      min-height: 36px;
      min-width: auto;
      transition: color 0.2s;
    }
    .filters__toggle:hover {
      color: var(--accent-gold);
    }
    .filters__chevron {
      font-size: 0.7rem;
      transition: transform 0.2s;
      color: var(--text-tertiary);
    }
    .filters__chevron.open {
      transform: rotate(180deg);
      color: var(--accent-gold);
    }
    .filters__options {
      padding: 2px 0 var(--space-sm);
      max-height: 220px;
      overflow-y: auto;
    }
    .filters__options::-webkit-scrollbar { width: 4px; }
    .filters__options::-webkit-scrollbar-track { background: transparent; }
    .filters__options::-webkit-scrollbar-thumb { background: var(--border-bright); border-radius: 2px; }
    .filters__checkbox {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: 5px 4px;
      cursor: pointer;
      font-size: 0.85rem;
      color: var(--text-primary);
      border-radius: var(--radius-sm);
      transition: background-color 0.15s;
    }
    .filters__checkbox:hover {
      background-color: var(--bg-hover);
    }
    .filters__checkbox input[type="checkbox"] {
      width: 15px;
      height: 15px;
      accent-color: var(--accent-gold);
      cursor: pointer;
      flex-shrink: 0;
    }
    .filters__checkbox--toggle {
      font-weight: 600;
      font-size: 0.85rem;
    }
    .filters__range-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--text-secondary);
      margin-bottom: var(--space-sm);
      padding: 0 2px;
    }
    .filters__range-value {
      color: var(--accent-gold);
      font-weight: 700;
      font-size: 0.85rem;
      text-transform: none;
      letter-spacing: 0;
    }
    .filters__range {
      width: 100%;
      accent-color: var(--accent-gold);
      cursor: pointer;
      height: 4px;
    }
    .filters__director-search {
      width: 100%;
      font-size: 0.82rem;
      padding: 7px 10px;
      margin-bottom: var(--space-xs);
      background-color: var(--bg-input);
      color: var(--text-primary);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      min-height: 32px;
      transition: border-color 0.2s;
    }
    .filters__director-search:focus {
      border-color: var(--accent-gold);
      outline: none;
    }
    .filters__director-search::placeholder {
      color: var(--text-tertiary);
    }
    .filters__director-count {
      margin-left: auto;
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--text-tertiary);
      background-color: var(--bg-raised);
      padding: 1px 6px;
      border-radius: 8px;
      flex-shrink: 0;
    }
    .filters__empty {
      font-size: 0.82rem;
      color: var(--text-tertiary);
      padding: var(--space-sm) 4px;
      margin: 0;
    }
    .filters__year-range {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }
    @media (max-width: 768px) {
      .filters__checkbox input[type="checkbox"] { width: 20px; height: 20px; }
      .filters__toggle { min-height: 44px; }
      .filters__checkbox { min-height: 44px; }
      .filters__director-search { min-height: 44px; font-size: 1rem; }
      .filters__range { height: 24px; }
      .filters__options { max-height: 260px; }
    }
    @media (max-width: 480px) {
      .filters__checkbox input[type="checkbox"] { width: 22px; height: 22px; }
      .filters__checkbox { gap: var(--space-md); }
      .filters__group { padding: var(--space-sm) 0; }
    }
  `],
})
export class FilterPanelComponent {
  readonly availableDecades = input<number[]>([]);
  readonly availableGenres = input<string[]>([]);
  readonly availableDirectors = input<DirectorCount[]>([]);
  readonly availableLanguages = input<string[]>([]);
  readonly languageCountsInput = input<{ name: string; count: number }[]>([], { alias: 'languageCounts' });

  readonly selectedDecades = signal(new Set<number>());
  readonly selectedGenres = signal(new Set<string>());
  readonly selectedDirectors = signal(new Set<string>());
  readonly selectedLanguages = signal(FilterPanelComponent.loadLanguagePref());
  readonly streamableOnly = signal(true);
  readonly minRating = signal(0);
  readonly directorQuery = signal('');
  readonly languageQuery = signal('');

  readonly yearMin = signal(1890);
  readonly yearMax = signal(1970);
  readonly yearBounds = computed(() => {
    const decades = this.availableDecades();
    if (decades.length === 0) return [1890, 1970] as const;
    return [decades[0], decades[decades.length - 1] + 9] as const;
  });

  private static readonly LANG_PREF_KEY = 'bw-cinema-lang-pref';

  readonly decadesOpen = signal(false);
  readonly genresOpen = signal(false);
  readonly directorsOpen = signal(false);
  readonly languagesOpen = signal(this.selectedLanguages().size > 0);

  private static loadLanguagePref(): Set<string> {
    try {
      const raw = localStorage.getItem('bw-cinema-lang-pref');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return new Set(parsed);
      }
    } catch { /* noop */ }
    return new Set();
  }

  private saveLanguagePref(): void {
    try {
      localStorage.setItem(FilterPanelComponent.LANG_PREF_KEY, JSON.stringify([...this.selectedLanguages()]));
    } catch { /* noop */ }
  }

  readonly filteredDirectors = computed(() => {
    const q = this.directorQuery().toLowerCase();
    const dirs = this.availableDirectors();
    if (!q) return dirs.slice(0, 20);
    return dirs.filter((d) => d.name.toLowerCase().includes(q)).slice(0, 20);
  });

  readonly filteredLanguages = computed(() => {
    const q = this.languageQuery().toLowerCase();
    const langs = this.languageCountsInput();
    if (langs.length === 0) {
      // Fallback: use availableLanguages without counts
      const names = this.availableLanguages();
      const filtered = q ? names.filter((n) => n.toLowerCase().includes(q)) : names;
      return filtered.slice(0, 30).map((name) => ({ name, count: 0 }));
    }
    if (!q) return langs.slice(0, 30);
    return langs.filter((l) => l.name.toLowerCase().includes(q)).slice(0, 30);
  });

  readonly filterChanged = output<{
    decades: number[];
    genres: string[];
    directors: string[];
    languages: string[];
    streamableOnly: boolean;
    minRating: number;
    yearRange: [number, number] | null;
  }>();

  toggleDecade(decade: number): void {
    this.selectedDecades.update((set) => {
      const next = new Set(set);
      if (next.has(decade)) next.delete(decade);
      else next.add(decade);
      return next;
    });
    this.emitFilter();
  }

  toggleGenre(genre: string): void {
    this.selectedGenres.update((set) => {
      const next = new Set(set);
      if (next.has(genre)) next.delete(genre);
      else next.add(genre);
      return next;
    });
    this.emitFilter();
  }

  toggleLanguage(lang: string): void {
    this.selectedLanguages.update((set) => {
      const next = new Set(set);
      if (next.has(lang)) next.delete(lang);
      else next.add(lang);
      return next;
    });
    this.saveLanguagePref();
    this.emitFilter();
  }

  onRatingChange(event: Event): void {
    this.minRating.set(parseFloat((event.target as HTMLInputElement).value));
    this.emitFilter();
  }

  toggleDirector(name: string): void {
    this.selectedDirectors.update((set) => {
      const next = new Set(set);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
    this.emitFilter();
  }

  onYearMinChange(event: Event): void {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    this.yearMin.set(Math.min(val, this.yearMax()));
    this.emitFilter();
  }

  onYearMaxChange(event: Event): void {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    this.yearMax.set(Math.max(val, this.yearMin()));
    this.emitFilter();
  }

  onDirectorSearch(event: Event): void {
    this.directorQuery.set((event.target as HTMLInputElement).value);
  }

  onLanguageSearch(event: Event): void {
    this.languageQuery.set((event.target as HTMLInputElement).value);
  }

  clearFilters(): void {
    this.selectedDecades.set(new Set());
    this.selectedGenres.set(new Set());
    this.selectedDirectors.set(new Set());
    this.selectedLanguages.set(new Set());
    this.saveLanguagePref();
    this.streamableOnly.set(true);
    this.minRating.set(0);
    this.directorQuery.set('');
    const [min, max] = this.yearBounds();
    this.yearMin.set(min);
    this.yearMax.set(max);
    this.emitFilter();
  }

  emitFilter(): void {
    const [boundsMin, boundsMax] = this.yearBounds();
    const yearRange: [number, number] | null =
      (this.yearMin() !== boundsMin || this.yearMax() !== boundsMax)
        ? [this.yearMin(), this.yearMax()]
        : null;
    this.filterChanged.emit({
      decades: [...this.selectedDecades()],
      genres: [...this.selectedGenres()],
      directors: [...this.selectedDirectors()],
      languages: [...this.selectedLanguages()],
      streamableOnly: this.streamableOnly(),
      minRating: this.minRating(),
      yearRange,
    });
  }
}
