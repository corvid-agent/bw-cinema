import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy, signal, computed, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { CatalogService } from '../../core/services/catalog.service';
import { CollectionService } from '../../core/services/collection.service';
import { MovieGridComponent } from '../../shared/components/movie-grid.component';
import { SearchBarComponent } from '../../shared/components/search-bar.component';
import { FilterPanelComponent } from '../../shared/components/filter-panel.component';
import { SkeletonGridComponent } from '../../shared/components/skeleton-grid.component';
import { MovieListComponent } from '../../shared/components/movie-list.component';
import { ViewToggleComponent, type ViewMode } from '../../shared/components/view-toggle.component';
import { KeyboardNavDirective } from '../../shared/directives/keyboard-nav.directive';
import { ScrollRowComponent } from '../../shared/components/scroll-row.component';
import type { CatalogFilter } from '../../core/models/catalog.model';

@Component({
  selector: 'app-browse',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MovieGridComponent, MovieListComponent, ViewToggleComponent, SearchBarComponent, FilterPanelComponent, SkeletonGridComponent, KeyboardNavDirective, ScrollRowComponent],
  template: `
    <div class="browse container">
      <div class="browse__top">
        <h1>Browse Films</h1>
        <p class="browse__subtitle" aria-live="polite" aria-atomic="true">
          {{ filteredMovies().length }} films found
          @if (!filter().streamableOnly && streamableResultCount() > 0 && streamableResultCount() < filteredMovies().length) {
            <span class="browse__streamable-count">({{ streamableResultCount() }} free to watch)</span>
          }
        </p>
        @if (resultsSummary(); as rs) {
          <p class="browse__results-summary">
            {{ rs.minYear }}–{{ rs.maxYear }}
            @if (rs.avgRating) {
              <span class="browse__results-sep">&middot;</span> Avg &#9733; {{ rs.avgRating }}
            }
            @if (rs.topGenre) {
              <span class="browse__results-sep">&middot;</span> Mostly {{ rs.topGenre }}
            }
            @if (rs.langCount) {
              <span class="browse__results-sep">&middot;</span> {{ rs.langCount }} languages
            }
            @if (rs.dirCount) {
              <span class="browse__results-sep">&middot;</span> {{ rs.dirCount }} directors
            }
          </p>
        }
        @if (resultStreamablePct(); as rsp) {
          <p class="browse__watched-note">{{ rsp }}% streamable@if (resultYearRange(); as ryr) { &middot; {{ ryr }}}@if (resultLanguageCount(); as rlc) { &middot; {{ rlc }} languages}</p>
        }
        @if (watchedInResults() > 0) {
          <p class="browse__watched-note">{{ watchedInResults() }} already watched</p>
        }
        @if (topResultDirector(); as trd) {
          <p class="browse__watched-note">Top director: <a [routerLink]="['/director', trd.name]">{{ trd.name }}</a> ({{ trd.count }})</p>
        }
        <button class="browse__more-toggle" (click)="showMoreStats.set(!showMoreStats())" [attr.aria-expanded]="showMoreStats()" aria-label="Toggle additional statistics">
          {{ showMoreStats() ? 'Less' : 'More stats' }}
        </button>
        @if (showMoreStats()) {
          @if (resultHighRatedCount(); as rhrc) {
            <p class="browse__watched-note">{{ rhrc }} rated 7.0+ &middot; median &#9733; {{ resultMedianRating() }}</p>
          }
          @if (resultUniqueDirectorCount(); as rudc) {
            <p class="browse__watched-note">{{ rudc }} directors &middot; {{ resultGenreCount() }} genres &middot; {{ resultDecadeCount() }} decades</p>
          }
          @if (resultNonEnglishCount(); as rnec) {
            <p class="browse__watched-note">{{ rnec }} non-English &middot; {{ resultCoDirectedCount() }} co-directed &middot; {{ resultSilentEraCount() }} silent-era</p>
          }
          @if (resultYtStreamablePct(); as rysp) {
            <p class="browse__watched-note">{{ rysp }}% YouTube &middot; {{ resultIaStreamablePct() }}% IA &middot; {{ resultImdbLinkedPct() }}% IMDb</p>
          }
        }
      </div>

      @if (catalog.error(); as err) {
        <div class="catalog-error" role="alert">
          <p>{{ err }}</p>
          <button (click)="catalog.retry()">Try Again</button>
        </div>
      } @else if (catalog.loading()) {
        <app-skeleton-grid [count]="24" />
      } @else {
        <div class="browse__layout">
          <button class="browse__filter-toggle" (click)="toggleFilter()">
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
              [languageCounts]="catalog.languageCounts()"
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

            @if (filterChips().length > 0) {
              <div class="browse__chips">
                @for (chip of filterChips(); track chip.label) {
                  <button class="browse__chip" (click)="removeChip(chip)">
                    {{ chip.label }}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                }
                <button class="browse__chip browse__chip--clear" (click)="clearFilters()">Clear all</button>
              </div>
            }

            @if (quickDecades().length > 0 && filterChips().length === 0) {
              <app-scroll-row class="browse__quick-decades">
                @for (d of quickDecades(); track d.decade) {
                  <button class="browse__quick-decade" (click)="quickFilterDecade(d.decade)">
                    {{ d.decade }}s
                    <span class="browse__quick-count">{{ d.count }}</span>
                  </button>
                }
              </app-scroll-row>
              <app-scroll-row class="browse__quick-decades">
                @for (g of quickGenres(); track g.name) {
                  <button class="browse__quick-decade" (click)="quickFilterGenre(g.name)">
                    {{ g.name }}
                    <span class="browse__quick-count">{{ g.count }}</span>
                  </button>
                }
              </app-scroll-row>
            }

            @if (browseSuggestion(); as suggestion) {
              <a class="browse__suggestion" [routerLink]="['/movie', suggestion.film.id]">
                <span class="browse__suggestion-text">Because you watched <strong>{{ suggestion.source }}</strong></span>
                <span class="browse__suggestion-pick">
                  @if (suggestion.film.posterUrl) {
                    <img [src]="suggestion.film.posterUrl" [alt]="suggestion.film.title" />
                  }
                  <span>
                    <strong>{{ suggestion.film.title }}</strong> ({{ suggestion.film.year }})
                    @if (suggestion.film.voteAverage > 0) {
                      &middot; &#9733; {{ suggestion.film.voteAverage.toFixed(1) }}
                    }
                  </span>
                </span>
              </a>
            }

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
    .browse__streamable-count {
      color: var(--accent-gold);
      font-weight: 600;
    }
    .browse__results-summary {
      font-size: 0.8rem;
      color: var(--text-tertiary);
      margin: var(--space-xs) 0 0;
    }
    .browse__results-sep {
      color: var(--border-bright);
      margin: 0 2px;
    }
    .browse__watched-note {
      font-size: 0.8rem;
      color: var(--text-tertiary);
      margin: var(--space-xs) 0 0;
    }
    .browse__more-toggle {
      background: none;
      border: none;
      color: var(--text-tertiary);
      font-size: 0.75rem;
      cursor: pointer;
      padding: var(--space-xs) 0;
      opacity: 0.7;
      &:hover { opacity: 1; }
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
    .browse__chips {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-xs);
      margin-bottom: var(--space-md);
    }
    .browse__chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      background: var(--accent-gold-dim);
      border: 1px solid var(--accent-gold);
      border-radius: 14px;
      color: var(--accent-gold);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;
      min-height: auto;
      min-width: auto;
    }
    .browse__chip:hover {
      background: var(--accent-gold);
      color: var(--bg-deep);
    }
    .browse__chip--clear {
      background: transparent;
      border-color: var(--border);
      color: var(--text-tertiary);
    }
    .browse__chip--clear:hover {
      background: var(--bg-raised);
      border-color: var(--text-tertiary);
      color: var(--text-secondary);
    }
    .browse__quick-decades {
      --scroll-row-gap: var(--space-xs);
      margin-bottom: var(--space-md);
    }
    .browse__quick-decade {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 12px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      color: var(--text-secondary);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s;
      min-height: auto;
      min-width: auto;
    }
    .browse__quick-decade:hover {
      border-color: var(--accent-gold);
      color: var(--accent-gold);
      background: var(--accent-gold-dim);
    }
    .browse__quick-count {
      font-size: 0.65rem;
      color: var(--text-tertiary);
    }
    .browse__suggestion {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      padding: var(--space-md);
      margin-bottom: var(--space-lg);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      text-decoration: none;
      color: inherit;
      transition: border-color 0.2s, background-color 0.2s;
    }
    .browse__suggestion:hover {
      border-color: var(--accent-gold);
      background: var(--bg-raised);
    }
    .browse__suggestion-text {
      font-size: 0.8rem;
      color: var(--text-tertiary);
    }
    .browse__suggestion-text strong {
      color: var(--accent-gold);
    }
    .browse__suggestion-pick {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }
    .browse__suggestion-pick img {
      width: 40px;
      height: 60px;
      object-fit: cover;
      border-radius: var(--radius-sm);
      aspect-ratio: 2 / 3;
    }
    .browse__suggestion-pick strong {
      color: var(--text-primary);
    }
    .browse__suggestion-pick > span {
      font-size: 0.9rem;
      color: var(--text-secondary);
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
    @media (max-width: 768px) {
      .browse__surprise { min-height: 44px; min-width: 44px; }
      .browse__streamable-toggle { min-height: 44px; }
      .browse__chip { min-height: 44px; }
      .browse__toolbar { gap: var(--space-sm); }
    }
    @media (max-width: 480px) {
      .browse__toolbar { flex-direction: column; align-items: stretch; }
      .browse__sort { flex: 1 1 100%; }
      .browse__sort select { width: 100%; }
      .browse__lang { flex: 1 1 100%; }
      .browse__lang select { width: 100%; }
      .browse__chip { font-size: 0.8rem; padding: 4px 10px; }
    }
    @media (max-width: 360px) {
      .browse__toolbar { gap: var(--space-xs); }
      .browse__chip { font-size: 0.75rem; padding: 3px 8px; min-height: 40px; }
      .browse__surprise { min-height: 40px; min-width: 40px; }
    }
  `],
})
export class BrowseComponent implements OnInit, OnDestroy, AfterViewInit {
  protected readonly catalog = inject(CatalogService);
  private readonly collection = inject(CollectionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly elRef = inject(ElementRef);
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);

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
  readonly showMoreStats = signal(false);

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

  readonly filterChips = computed(() => {
    const f = this.filter();
    const chips: { label: string; type: string; value: string | number }[] = [];
    for (const d of f.decades) chips.push({ label: `${d}s`, type: 'decade', value: d });
    for (const g of f.genres) chips.push({ label: g, type: 'genre', value: g });
    for (const d of f.directors) chips.push({ label: d, type: 'director', value: d });
    for (const l of f.languages) chips.push({ label: l, type: 'language', value: l });
    if (f.minRating > 0) chips.push({ label: `${f.minRating}+ rating`, type: 'minRating', value: f.minRating });
    if (f.yearRange) chips.push({ label: `${f.yearRange[0]}–${f.yearRange[1]}`, type: 'yearRange', value: 0 });
    if (f.query) chips.push({ label: `"${f.query}"`, type: 'query', value: f.query });
    return chips;
  });

  readonly quickDecades = computed(() => {
    const meta = this.catalog.meta();
    if (!meta) return [];
    const movies = this.catalog.movies();
    const counts = new Map<number, number>();
    for (const m of movies) {
      const d = Math.floor(m.year / 10) * 10;
      counts.set(d, (counts.get(d) ?? 0) + 1);
    }
    return meta.decades.map((d) => ({ decade: d, count: counts.get(d) ?? 0 }));
  });

  readonly quickGenres = computed(() => {
    const meta = this.catalog.meta();
    if (!meta) return [];
    const movies = this.catalog.movies();
    const counts = new Map<string, number>();
    for (const m of movies) {
      for (const g of m.genres) counts.set(g, (counts.get(g) ?? 0) + 1);
    }
    return meta.genres.slice(0, 8).map((g) => ({ name: g, count: counts.get(g) ?? 0 }));
  });

  readonly filteredMovies = computed(() => this.catalog.search(this.filter()));

  // ── Single-pass filtered result stats index ────────────────────────
  private readonly resultIdx = computed(() => {
    const films = this.filteredMovies();
    const watchedIds = this.collection.watchedIds();
    const n = films.length;
    const now = new Date().getFullYear();
    let ratingSum = 0, ratedCount = 0, yearSum = 0, titleLenSum = 0;
    let streamable = 0, nonEnglish = 0, silentEra = 0, coDirected = 0, highRated7 = 0;
    let withImdb = 0, withPoster = 0, withYt = 0, withIa = 0, watched = 0;
    let minYear = Infinity, maxYear = 0;
    let longestTitle = '', shortestTitle = films[0]?.title ?? '';
    const decades = new Set<number>();
    const genres = new Set<string>();
    const langs = new Set<string>();
    const dirs = new Set<string>();
    const genreCounts = new Map<string, number>();
    const dirCounts = new Map<string, number>();
    const years: number[] = [];
    const ratings: number[] = [];

    for (const m of films) {
      if (m.voteAverage > 0) { ratingSum += m.voteAverage; ratedCount++; ratings.push(m.voteAverage); }
      if (m.voteAverage >= 7.0) highRated7++;
      yearSum += m.year; years.push(m.year);
      if (m.year < minYear) minYear = m.year;
      if (m.year > maxYear) maxYear = m.year;
      decades.add(Math.floor(m.year / 10) * 10);
      titleLenSum += m.title.length;
      if (m.title.length > longestTitle.length) longestTitle = m.title;
      if (m.title.length < shortestTitle.length) shortestTitle = m.title;
      if (m.isStreamable) streamable++;
      if (m.language && m.language !== 'English' && m.language !== 'en') nonEnglish++;
      if (m.year < 1930) silentEra++;
      if (m.directors.length > 1) coDirected++;
      if (m.imdbId) withImdb++;
      if (m.posterUrl) withPoster++;
      if (m.youtubeId) withYt++;
      if (m.internetArchiveId) withIa++;
      if (m.language) langs.add(m.language);
      if (watchedIds.has(m.id)) watched++;
      for (const g of m.genres) { genres.add(g); genreCounts.set(g, (genreCounts.get(g) ?? 0) + 1); }
      for (const d of m.directors) { dirs.add(d); dirCounts.set(d, (dirCounts.get(d) ?? 0) + 1); }
    }
    years.sort((a, b) => a - b);
    ratings.sort((a, b) => a - b);
    const topGenre = genreCounts.size > 0
      ? [...genreCounts.entries()].sort((a, b) => b[1] - a[1])[0][0]
      : null;
    return {
      n, now, ratingSum, ratedCount, yearSum, titleLenSum,
      streamable, nonEnglish, silentEra, coDirected, highRated7,
      withImdb, withPoster, withYt, withIa, watched,
      minYear, maxYear, longestTitle, shortestTitle,
      decadeCount: decades.size, genreCount: genres.size,
      langCount: langs.size, dirCount: dirs.size,
      topGenre, dirCounts, years, ratings,
    };
  });

  readonly resultsSummary = computed(() => {
    const i = this.resultIdx();
    if (i.n < 10) return null;
    const avgRating = i.ratedCount > 0 ? (i.ratingSum / i.ratedCount).toFixed(1) : null;
    const langCount = i.langCount > 1 ? i.langCount : null;
    const dirCount = i.dirCount > 1 ? i.dirCount : null;
    return { avgRating, minYear: i.minYear, maxYear: i.maxYear, topGenre: i.topGenre, langCount, dirCount };
  });
  readonly watchedInResults = computed(() => this.resultIdx().watched);
  readonly streamableResultCount = computed(() => this.resultIdx().streamable);
  readonly avgResultYear = computed(() => {
    const i = this.resultIdx();
    return i.n >= 5 ? Math.round(i.yearSum / i.n) : null;
  });
  readonly resultLanguageCount = computed(() => {
    const i = this.resultIdx();
    return i.n >= 10 && i.langCount > 1 ? i.langCount : null;
  });
  readonly resultAvgFilmAge = computed(() => {
    const i = this.resultIdx();
    if (i.n < 10) return null;
    return Math.round(i.years.reduce((s, y) => s + (i.now - y), 0) / i.n);
  });
  readonly resultYearRange = computed(() => {
    const i = this.resultIdx();
    if (i.n < 5 || i.maxYear - i.minYear < 5) return null;
    return `${i.minYear}–${i.maxYear}`;
  });
  readonly resultStreamablePct = computed(() => {
    const i = this.resultIdx();
    if (i.n < 10) return null;
    const pct = Math.round((i.streamable / i.n) * 100);
    return pct === 0 || pct === 100 ? null : pct;
  });
  readonly resultDecadeCount = computed(() => {
    const i = this.resultIdx();
    return i.n >= 10 && i.decadeCount > 1 ? i.decadeCount : null;
  });
  readonly resultHighRatedCount = computed(() => {
    const i = this.resultIdx();
    return i.n >= 10 && i.highRated7 > 0 && i.highRated7 < i.n ? i.highRated7 : null;
  });
  readonly resultCoDirectedCount = computed(() => {
    const i = this.resultIdx();
    return i.n >= 10 && i.coDirected > 0 ? i.coDirected : null;
  });
  readonly resultNonEnglishCount = computed(() => {
    const i = this.resultIdx();
    return i.n >= 10 && i.nonEnglish > 0 ? i.nonEnglish : null;
  });
  readonly resultSilentEraCount = computed(() => {
    const i = this.resultIdx();
    return i.n >= 10 && i.silentEra > 0 ? i.silentEra : null;
  });
  readonly resultMedianRating = computed(() => {
    const i = this.resultIdx();
    if (i.ratings.length < 10) return null;
    const mid = Math.floor(i.ratings.length / 2);
    const median = i.ratings.length % 2 === 0 ? (i.ratings[mid - 1] + i.ratings[mid]) / 2 : i.ratings[mid];
    return median.toFixed(1);
  });
  readonly resultMedianYear = computed(() => {
    const i = this.resultIdx();
    if (i.n < 10) return null;
    const mid = Math.floor(i.years.length / 2);
    return i.years.length % 2 === 0 ? Math.round((i.years[mid - 1] + i.years[mid]) / 2) : i.years[mid];
  });
  readonly resultAvgYear = computed(() => {
    const i = this.resultIdx();
    return i.n >= 10 ? Math.round(i.yearSum / i.n) : null;
  });
  readonly resultLongestTitle = computed(() => {
    const i = this.resultIdx();
    return i.n >= 10 && i.longestTitle.length >= 20 ? i.longestTitle : null;
  });
  readonly resultAvgTitleLength = computed(() => {
    const i = this.resultIdx();
    return i.n >= 10 ? Math.round(i.titleLenSum / i.n) : null;
  });
  readonly resultShortestTitle = computed(() => {
    const i = this.resultIdx();
    return i.n >= 10 && i.shortestTitle.length <= 8 ? i.shortestTitle : null;
  });
  readonly resultUniqueDirectorCount = computed(() => {
    const i = this.resultIdx();
    return i.n >= 10 && i.dirCount > 1 ? i.dirCount : null;
  });
  readonly resultGenreCount = computed(() => {
    const i = this.resultIdx();
    return i.n >= 10 && i.genreCount > 1 ? i.genreCount : null;
  });
  readonly resultImdbLinkedPct = computed(() => {
    const i = this.resultIdx();
    if (i.n < 10) return null;
    const pct = Math.round((i.withImdb / i.n) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });
  readonly resultPosterCoveragePct = computed(() => {
    const i = this.resultIdx();
    if (i.n < 10) return null;
    const pct = Math.round((i.withPoster / i.n) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });
  readonly resultYtStreamablePct = computed(() => {
    const i = this.resultIdx();
    if (i.n < 10) return null;
    const pct = Math.round((i.withYt / i.n) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });
  readonly resultHighlyRatedPct = computed(() => {
    const i = this.resultIdx();
    if (i.n < 10) return null;
    const pct = Math.round((i.highRated7 / i.n) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });
  readonly resultCoDirectedPct = computed(() => {
    const i = this.resultIdx();
    if (i.n < 10) return null;
    const pct = Math.round((i.coDirected / i.n) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });
  readonly resultIaStreamablePct = computed(() => {
    const i = this.resultIdx();
    if (i.n < 10) return null;
    const pct = Math.round((i.withIa / i.n) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });
  readonly topResultDirector = computed(() => {
    const i = this.resultIdx();
    if (i.n < 10) return null;
    const best = [...i.dirCounts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (!best || best[1] < 3) return null;
    return { name: best[0], count: best[1] };
  });

  readonly paginatedMovies = computed(() =>
    this.filteredMovies().slice(0, this.page() * this.pageSize)
  );

  readonly browseSuggestion = computed(() => {
    const watched = this.collection.watched();
    if (watched.length === 0) return null;
    const movies = this.catalog.movies();
    if (movies.length === 0) return null;
    const recent = [...watched].sort((a, b) => b.watchedAt - a.watchedAt).slice(0, 5);
    const movieMap = new Map(movies.map((m) => [m.id, m]));
    const watchedIds = this.collection.watchedIds();
    const watchlistIds = this.collection.watchlistIds();
    for (const w of recent) {
      const source = movieMap.get(w.movieId);
      if (!source || source.genres.length === 0) continue;
      const match = movies.find(
        (m) =>
          m.id !== source.id &&
          !watchedIds.has(m.id) &&
          !watchlistIds.has(m.id) &&
          m.isStreamable &&
          m.posterUrl &&
          m.voteAverage >= 6.0 &&
          m.genres.some((g) => source.genres.includes(g))
      );
      if (match) return { source: source.title, film: match };
    }
    return null;
  });

  ngOnInit(): void {
    this.catalog.load();
    this.titleService.setTitle('Browse Films — BW Cinema');
    const browseDesc = 'Browse and filter classic black-and-white films by decade, genre, director, and language.';
    this.metaService.updateTag({ name: 'description', content: browseDesc });
    this.metaService.updateTag({ property: 'og:description', content: browseDesc });
    this.metaService.updateTag({ name: 'twitter:description', content: browseDesc });
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

  toggleFilter(): void {
    const opening = !this.filterOpen();
    this.filterOpen.set(opening);
    if (opening) {
      setTimeout(() => {
        const sidebar = this.elRef.nativeElement.querySelector('.browse__sidebar');
        const focusable = sidebar?.querySelector('input, button, select, [tabindex]') as HTMLElement | null;
        focusable?.focus();
      });
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

  quickFilterDecade(decade: number): void {
    this.filter.update((f) => ({ ...f, decades: [decade] }));
    this.page.set(1);
    this.syncUrl();
  }

  quickFilterGenre(genre: string): void {
    this.filter.update((f) => ({ ...f, genres: [genre] }));
    this.page.set(1);
    this.syncUrl();
  }

  toggleStreamableOnly(): void {
    this.filter.update((f) => ({ ...f, streamableOnly: !f.streamableOnly }));
    this.page.set(1);
    this.syncUrl();
  }

  removeChip(chip: { type: string; value: string | number }): void {
    this.filter.update((f) => {
      switch (chip.type) {
        case 'decade': return { ...f, decades: f.decades.filter((d) => d !== chip.value) };
        case 'genre': return { ...f, genres: f.genres.filter((g) => g !== chip.value) };
        case 'director': return { ...f, directors: f.directors.filter((d) => d !== chip.value) };
        case 'language': return { ...f, languages: f.languages.filter((l) => l !== chip.value) };
        case 'minRating': return { ...f, minRating: 0 };
        case 'yearRange': return { ...f, yearRange: null };
        case 'query': return { ...f, query: '' };
        default: return f;
      }
    });
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
