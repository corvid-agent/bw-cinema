import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy, signal, computed, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { MovieGridComponent } from '../../shared/components/movie-grid.component';
import { SearchBarComponent } from '../../shared/components/search-bar.component';
import { FilterPanelComponent } from '../../shared/components/filter-panel.component';
import { SkeletonGridComponent } from '../../shared/components/skeleton-grid.component';
import { MovieListComponent } from '../../shared/components/movie-list.component';
import { ViewToggleComponent, type ViewMode } from '../../shared/components/view-toggle.component';
import { KeyboardNavDirective } from '../../shared/directives/keyboard-nav.directive';
import type { CatalogFilter } from '../../core/models/catalog.model';

@Component({
  selector: 'app-browse',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MovieGridComponent, MovieListComponent, ViewToggleComponent, SearchBarComponent, FilterPanelComponent, SkeletonGridComponent, KeyboardNavDirective],
  template: `
    <div class="browse container">
      <div class="browse__top">
        <h1>Browse Films</h1>
        <p class="browse__subtitle" aria-live="polite" aria-atomic="true">{{ filteredMovies().length }} films found</p>
      </div>

      @if (catalog.loading()) {
        <app-skeleton-grid [count]="24" />
      } @else {
        <div class="browse__layout">
          <button class="browse__filter-toggle" (click)="filterOpen.set(!filterOpen())">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Filters
            @if (activeFilterCount() > 0) {
              <span class="browse__filter-badge">{{ activeFilterCount() }}</span>
            }
          </button>
          <aside class="browse__sidebar" [class.browse__sidebar--open]="filterOpen()">
            <app-filter-panel
              [availableDecades]="catalog.meta()?.decades ?? []"
              [availableGenres]="catalog.meta()?.genres ?? []"
              [availableDirectors]="catalog.meta()?.topDirectors ?? []"
              [availableLanguages]="catalog.availableLanguages()"
              (filterChanged)="onFilterChange($event)"
            />
          </aside>

          <div class="browse__main">
            <div class="browse__toolbar">
              <div class="browse__search">
                <app-search-bar (searched)="onSearch($event)" />
              </div>
              <div class="browse__sort">
                <label for="sort-select" class="sr-only">Sort by</label>
                <select id="sort-select" (change)="onSortChange($event)">
                  <option value="rating-desc" selected>Highest Rated</option>
                  <option value="year-desc">Newest</option>
                  <option value="year-asc">Oldest</option>
                  <option value="title-asc">Title A-Z</option>
                  <option value="title-desc">Title Z-A</option>
                </select>
              </div>
              @if (catalog.availableLanguages().length > 0) {
                <div class="browse__lang">
                  <label for="lang-select" class="sr-only">Language</label>
                  <select id="lang-select" [value]="selectedLanguage()" (change)="onLanguageChange($event)">
                    <option value="">All Languages</option>
                    @for (lang of catalog.availableLanguages(); track lang) {
                      <option [value]="lang">{{ lang }}</option>
                    }
                  </select>
                </div>
              }
              <button
                class="browse__streamable-toggle"
                [class.browse__streamable-toggle--active]="filter().streamableOnly"
                (click)="toggleStreamableOnly()"
                [attr.title]="filter().streamableOnly ? 'Showing watchable films only — click to show all' : 'Showing all films — click to show watchable only'"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                {{ filter().streamableOnly ? 'Watchable' : 'All' }}
              </button>
              <app-view-toggle [(mode)]="viewMode" />
              <button class="browse__surprise" (click)="surpriseMe()" title="Random film">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="7.5 4.21 12 6.81 16.5 4.21"/><polyline points="7.5 19.79 7.5 14.6 3 12"/><polyline points="21 12 16.5 14.6 16.5 19.79"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              </button>
            </div>

            @if (filteredMovies().length === 0) {
              <div class="browse__empty">
                <svg class="browse__empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                <p class="browse__empty-title">No films found matching your criteria</p>
                <p class="browse__empty-hint">Try adjusting your filters or search query</p>
                <button class="btn-secondary" (click)="clearFilters()">Clear All Filters</button>
              </div>
            } @else {
              <div appKeyboardNav>
                @if (viewMode() === 'grid') {
                  <app-movie-grid [movies]="paginatedMovies()" />
                } @else {
                  <app-movie-list [movies]="paginatedMovies()" />
                }
              </div>
            }

            @if (paginatedMovies().length < filteredMovies().length) {
              <div class="browse__load-more" #loadMoreSentinel>
                <div class="browse__loading-indicator">
                  <span class="browse__spinner"></span>
                  <span class="browse__remaining">{{ filteredMovies().length - paginatedMovies().length }} more films</span>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .browse { padding: var(--space-xl) 0; }
    .browse__top {
      margin-bottom: var(--space-lg);
    }
    .browse__top h1 {
      margin-bottom: var(--space-xs);
    }
    .browse__subtitle {
      color: var(--text-tertiary);
      font-size: 0.95rem;
      margin: 0;
    }
    .browse__layout {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: var(--space-xl);
    }
    .browse__sidebar {
      position: sticky;
      top: 76px;
      align-self: start;
      max-height: calc(100vh - 92px);
      overflow-y: auto;
    }
    .browse__toolbar {
      display: flex;
      gap: var(--space-sm);
      align-items: stretch;
      margin-bottom: var(--space-lg);
    }
    .browse__search {
      flex: 1;
    }
    .browse__sort select {
      min-width: 160px;
      height: 100%;
      border-radius: var(--radius-lg);
      background-color: var(--bg-surface);
    }
    .browse__surprise {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      min-width: 40px;
      min-height: 40px;
      padding: 0;
      border-radius: 50%;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      color: var(--accent-gold);
      cursor: pointer;
      transition: background-color 0.2s, border-color 0.2s;
    }
    .browse__surprise:hover {
      background: var(--accent-gold-dim);
      border-color: var(--accent-gold);
    }
    .browse__load-more {
      text-align: center;
      padding: var(--space-2xl) 0 var(--space-md);
    }
    .browse__loading-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-sm);
    }
    .browse__spinner {
      width: 32px;
      height: 32px;
      border: 3px solid var(--border);
      border-top-color: var(--accent-gold);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .browse__remaining {
      font-size: 0.8rem;
      color: var(--text-tertiary);
      font-weight: 400;
    }
    .browse__empty {
      text-align: center;
      padding: var(--space-3xl) var(--space-lg);
    }
    .browse__empty-icon {
      color: var(--text-tertiary);
      margin-bottom: var(--space-md);
      opacity: 0.5;
    }
    .browse__empty-title {
      font-size: 1.1rem;
      color: var(--text-secondary);
      margin: 0 0 var(--space-xs);
    }
    .browse__empty-hint {
      font-size: 0.9rem;
      color: var(--text-tertiary);
      margin: 0 0 var(--space-lg);
    }
    .browse__lang select {
      min-width: 130px;
      height: 100%;
      border-radius: var(--radius-lg);
      background-color: var(--bg-surface);
    }
    .browse__streamable-toggle {
      display: flex;
      align-items: center;
      gap: 5px;
      height: 40px;
      padding: 0 12px;
      border-radius: var(--radius-lg);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s, border-color 0.2s, color 0.2s;
      white-space: nowrap;
    }
    .browse__streamable-toggle:hover {
      border-color: var(--accent-gold);
      color: var(--accent-gold);
    }
    .browse__streamable-toggle--active {
      background: var(--accent-gold-dim);
      border-color: var(--accent-gold);
      color: var(--accent-gold);
    }
    .browse__filter-toggle {
      display: none;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-sm) var(--space-md);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      color: var(--text-secondary);
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      margin-bottom: var(--space-md);
      min-height: 44px;
    }
    .browse__filter-toggle:hover {
      border-color: var(--accent-gold);
      color: var(--accent-gold);
    }
    .browse__filter-badge {
      background-color: var(--accent-gold);
      color: var(--bg-deep);
      font-size: 0.7rem;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 10px;
      min-width: 20px;
      text-align: center;
    }
    @media (max-width: 900px) {
      .browse__layout {
        grid-template-columns: 1fr;
      }
      .browse__filter-toggle { display: inline-flex; }
      .browse__sidebar {
        display: none;
        position: static;
        max-height: none;
      }
      .browse__sidebar--open { display: block; }
      .browse__toolbar {
        flex-wrap: wrap;
      }
      .browse__search { flex: 1 1 100%; }
      .browse__sort { flex: 1; }
      .browse__sort select { width: 100%; }
      .browse__lang { flex: 1; }
      .browse__lang select { width: 100%; }
    }
  `],
})
export class BrowseComponent implements OnInit, OnDestroy, AfterViewInit {
  protected readonly catalog = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private static loadLangPref(): string[] {
    try {
      const raw = localStorage.getItem('bw-cinema-lang-pref');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch { /* noop */ }
    return [];
  }

  @ViewChild('loadMoreSentinel') loadMoreSentinel?: ElementRef<HTMLElement>;
  private observer: IntersectionObserver | null = null;

  private readonly pageSize = 24;
  readonly page = signal(1);
  readonly viewMode = signal<ViewMode>('grid');
  readonly filterOpen = signal(false);

  readonly filter = signal<CatalogFilter>({
    query: '',
    decades: [],
    genres: [],
    directors: [],
    languages: BrowseComponent.loadLangPref(),
    streamableOnly: true,
    minRating: 0,
    yearRange: null,
    sortBy: 'rating',
    sortDirection: 'desc',
  });

  readonly selectedLanguage = computed(() => {
    const langs = this.filter().languages;
    return langs.length === 1 ? langs[0] : '';
  });

  readonly activeFilterCount = computed(() => {
    const f = this.filter();
    let count = 0;
    if (f.decades.length > 0) count++;
    if (f.genres.length > 0) count++;
    if (f.directors.length > 0) count++;
    if (f.streamableOnly) count++;
    if (f.minRating > 0) count++;
    if (f.yearRange) count++;
    return count;
  });

  readonly filteredMovies = computed(() => this.catalog.search(this.filter()));
  readonly paginatedMovies = computed(() =>
    this.filteredMovies().slice(0, this.page() * this.pageSize)
  );

  ngOnInit(): void {
    this.catalog.load();
    const p = this.route.snapshot.queryParams;
    if (Object.keys(p).length > 0) {
      this.filter.update((f) => ({
        ...f,
        query: p['q'] ?? f.query,
        decades: p['decades'] ? p['decades'].split(',').map(Number) : (p['decade'] ? [parseInt(p['decade'], 10)] : f.decades),
        genres: p['genres'] ? p['genres'].split(',') : (p['genre'] ? [p['genre']] : f.genres),
        directors: p['directors'] ? p['directors'].split(',') : f.directors,
        languages: p['languages'] ? p['languages'].split(',') : f.languages,
        streamableOnly: p['streamable'] === '0' ? false : p['streamable'] === '1' ? true : f.streamableOnly,
        minRating: p['minRating'] ? parseFloat(p['minRating']) : f.minRating,
        yearRange: p['yearMin'] && p['yearMax'] ? [parseInt(p['yearMin'], 10), parseInt(p['yearMax'], 10)] : f.yearRange,
        sortBy: (p['sortBy'] as CatalogFilter['sortBy']) ?? f.sortBy,
        sortDirection: (p['sortDir'] as CatalogFilter['sortDirection']) ?? f.sortDirection,
      }));
    }
  }

  onSearch(query: string): void {
    this.filter.update((f) => ({ ...f, query }));
    this.page.set(1);
    this.syncUrl();
  }

  onFilterChange(filters: { decades: number[]; genres: string[]; directors: string[]; languages: string[]; streamableOnly: boolean; minRating: number; yearRange: [number, number] | null }): void {
    this.filter.update((f) => ({ ...f, ...filters }));
    this.page.set(1);
    this.syncUrl();
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const [sortBy, sortDirection] = value.split('-') as [CatalogFilter['sortBy'], CatalogFilter['sortDirection']];
    this.filter.update((f) => ({ ...f, sortBy, sortDirection }));
    this.page.set(1);
    this.syncUrl();
  }

  private syncUrl(): void {
    const f = this.filter();
    const queryParams: Record<string, string | null> = {
      q: f.query || null,
      decades: f.decades.length > 0 ? f.decades.join(',') : null,
      genres: f.genres.length > 0 ? f.genres.join(',') : null,
      directors: f.directors.length > 0 ? f.directors.join(',') : null,
      languages: f.languages.length > 0 ? f.languages.join(',') : null,
      streamable: f.streamableOnly ? null : '0',
      minRating: f.minRating > 0 ? String(f.minRating) : null,
      yearMin: f.yearRange ? String(f.yearRange[0]) : null,
      yearMax: f.yearRange ? String(f.yearRange[1]) : null,
      sortBy: f.sortBy !== 'rating' ? f.sortBy : null,
      sortDir: f.sortDirection !== 'desc' ? f.sortDirection : null,
      // Remove legacy single-value params
      decade: null,
      genre: null,
    };
    this.router.navigate([], { queryParams, queryParamsHandling: 'merge', replaceUrl: true });
  }

  onLanguageChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    const newLangs = val ? [val] : [];
    this.filter.update((f) => ({ ...f, languages: newLangs }));
    try { localStorage.setItem('bw-cinema-lang-pref', JSON.stringify(newLangs)); } catch { /* noop */ }
    this.page.set(1);
    this.syncUrl();
  }

  toggleStreamableOnly(): void {
    this.filter.update((f) => ({ ...f, streamableOnly: !f.streamableOnly }));
    this.page.set(1);
    this.syncUrl();
  }

  clearFilters(): void {
    this.filter.set({
      query: '',
      decades: [],
      genres: [],
      directors: [],
      languages: [],
      streamableOnly: true,
      minRating: 0,
      yearRange: null,
      sortBy: 'rating',
      sortDirection: 'desc',
    });
    this.page.set(1);
    this.syncUrl();
  }

  surpriseMe(): void {
    const films = this.filteredMovies();
    if (films.length === 0) return;
    const pick = films[Math.floor(Math.random() * films.length)];
    this.router.navigate(['/movie', pick.id]);
  }

  ngAfterViewInit(): void {
    this.setupInfiniteScroll();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private setupInfiniteScroll(): void {
    if (typeof IntersectionObserver === 'undefined') return;
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && this.paginatedMovies().length < this.filteredMovies().length) {
          this.page.update((p) => p + 1);
          // Re-observe after Angular re-renders the sentinel
          setTimeout(() => this.observeSentinel(), 100);
        }
      },
      { rootMargin: '200px' }
    );
    this.observeSentinel();
  }

  private observeSentinel(): void {
    this.observer?.disconnect();
    if (this.loadMoreSentinel) {
      this.observer?.observe(this.loadMoreSentinel.nativeElement);
    }
  }
}
