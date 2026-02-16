import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { CollectionService } from '../../core/services/collection.service';
import { MovieGridComponent } from '../../shared/components/movie-grid.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import type { MovieSummary } from '../../core/models/movie.model';

type SortOption = 'added-desc' | 'added-asc' | 'title-asc' | 'title-desc' | 'rating-desc' | 'year-desc';

@Component({
  selector: 'app-collection',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MovieGridComponent, LoadingSpinnerComponent],
  template: `
    <div class="collection container">
      <h1>My Collection</h1>

      @if (catalog.loading()) {
        <app-loading-spinner />
      } @else {
        <div class="collection__controls">
          <div class="collection__tabs" role="tablist">
            <button
              class="collection__tab"
              [class.collection__tab--active]="activeTab() === 'watchlist'"
              (click)="activeTab.set('watchlist')"
              role="tab"
              [attr.aria-selected]="activeTab() === 'watchlist'"
            >
              Watchlist
              @if (watchlistMovies().length > 0) {
                <span class="collection__count">{{ watchlistMovies().length }}</span>
              }
            </button>
            <button
              class="collection__tab"
              [class.collection__tab--active]="activeTab() === 'watched'"
              (click)="activeTab.set('watched')"
              role="tab"
              [attr.aria-selected]="activeTab() === 'watched'"
            >
              Watched
              @if (watchedMovies().length > 0) {
                <span class="collection__count">{{ watchedMovies().length }}</span>
              }
            </button>
            <button
              class="collection__tab"
              [class.collection__tab--active]="activeTab() === 'stats'"
              (click)="activeTab.set('stats')"
              role="tab"
              [attr.aria-selected]="activeTab() === 'stats'"
            >
              Stats
            </button>
          </div>

          @if (activeTab() !== 'stats') {
            <div class="collection__actions">
              <label for="collection-sort" class="sr-only">Sort by</label>
              <select id="collection-sort" class="collection__sort" (change)="onSortChange($event)">
                <option value="added-desc" selected>Recently Added</option>
                <option value="added-asc">Oldest Added</option>
                <option value="title-asc">Title A–Z</option>
                <option value="title-desc">Title Z–A</option>
                <option value="rating-desc">Highest Rated</option>
                <option value="year-desc">Newest Films</option>
              </select>
              @if (currentMovies().length > 0) {
                <button class="btn-ghost collection__export" (click)="exportCsv()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export CSV
                </button>
              }
            </div>
          }
        </div>

        @if (activeTab() === 'watchlist') {
          <div role="tabpanel">
            @if (sortedWatchlist().length > 0) {
              <app-movie-grid [movies]="sortedWatchlist()" />
            } @else {
              <div class="collection__empty">
                <p class="collection__empty-title">No films in your watchlist</p>
                <p class="collection__empty-text">Browse films and add ones you'd like to watch later.</p>
                <a class="btn-primary" routerLink="/browse">Browse Films</a>
              </div>
            }
          </div>
        }

        @if (activeTab() === 'watched') {
          <div role="tabpanel">
            @if (sortedWatched().length > 0) {
              <app-movie-grid [movies]="sortedWatched()" />
            } @else {
              <div class="collection__empty">
                <p class="collection__empty-title">No films watched yet</p>
                <p class="collection__empty-text">Films you mark as watched will appear here.</p>
                <a class="btn-primary" routerLink="/browse">Discover Films</a>
              </div>
            }
          </div>
        }

        @if (activeTab() === 'stats') {
          <div role="tabpanel" class="stats">
            @if (watchedMovies().length === 0) {
              <div class="collection__empty">
                <p class="collection__empty-title">No stats yet</p>
                <p class="collection__empty-text">Watch some films to see your viewing statistics.</p>
                <a class="btn-primary" routerLink="/browse">Discover Films</a>
              </div>
            } @else {
              <div class="stats__overview">
                <div class="stats__card">
                  <span class="stats__card-value">{{ watchedMovies().length }}</span>
                  <span class="stats__card-label">Films Watched</span>
                </div>
                <div class="stats__card">
                  <span class="stats__card-value">{{ avgRating() }}</span>
                  <span class="stats__card-label">Avg. Your Rating</span>
                </div>
                <div class="stats__card">
                  <span class="stats__card-value">{{ avgTmdbRating() }}</span>
                  <span class="stats__card-label">Avg. TMDb Rating</span>
                </div>
                <div class="stats__card">
                  <span class="stats__card-value">{{ totalDecades() }}</span>
                  <span class="stats__card-label">Decades Spanned</span>
                </div>
              </div>

              <div class="stats__sections">
                <section class="stats__section">
                  <h3>Top Genres</h3>
                  <div class="stats__bars">
                    @for (g of genreStats(); track g.name) {
                      <div class="stats__bar-row">
                        <span class="stats__bar-label">{{ g.name }}</span>
                        <div class="stats__bar-track">
                          <div class="stats__bar-fill" [style.width.%]="g.pct"></div>
                        </div>
                        <span class="stats__bar-count">{{ g.count }}</span>
                      </div>
                    }
                  </div>
                </section>

                <section class="stats__section">
                  <h3>By Decade</h3>
                  <div class="stats__bars">
                    @for (d of decadeStats(); track d.name) {
                      <div class="stats__bar-row">
                        <span class="stats__bar-label">{{ d.name }}</span>
                        <div class="stats__bar-track">
                          <div class="stats__bar-fill" [style.width.%]="d.pct"></div>
                        </div>
                        <span class="stats__bar-count">{{ d.count }}</span>
                      </div>
                    }
                  </div>
                </section>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .collection { padding: var(--space-xl) 0; }
    .collection__controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--space-md);
      margin-bottom: var(--space-xl);
    }
    .collection__tabs {
      display: flex;
      gap: 2px;
      background-color: var(--bg-surface);
      border-radius: var(--radius-lg);
      padding: 4px;
      width: fit-content;
    }
    .collection__tab {
      background: none;
      border: none;
      color: var(--text-tertiary);
      font-size: 0.95rem;
      font-weight: 600;
      padding: var(--space-sm) var(--space-xl);
      cursor: pointer;
      border-radius: var(--radius);
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      min-height: 40px;
    }
    .collection__tab:hover { color: var(--text-primary); }
    .collection__tab--active {
      color: var(--accent-gold);
      background-color: var(--bg-raised);
    }
    .collection__count {
      font-size: 0.75rem;
      background-color: var(--accent-gold-dim);
      color: var(--accent-gold);
      padding: 1px 8px;
      border-radius: 10px;
    }
    .collection__actions {
      display: flex;
      gap: var(--space-sm);
      align-items: center;
    }
    .collection__sort {
      min-width: 160px;
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius-lg);
      background-color: var(--bg-surface);
      font-size: 0.9rem;
    }
    .collection__export {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      white-space: nowrap;
    }
    .collection__empty {
      text-align: center;
      padding: var(--space-3xl) var(--space-lg);
    }
    .collection__empty-title {
      font-family: var(--font-heading);
      font-size: 1.3rem;
      color: var(--text-primary);
      margin: 0 0 var(--space-sm);
    }
    .collection__empty-text {
      color: var(--text-tertiary);
      margin: 0 0 var(--space-lg);
    }

    /* Stats */
    .stats__overview {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: var(--space-md);
      margin-bottom: var(--space-2xl);
    }
    .stats__card {
      background-color: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-lg);
      text-align: center;
    }
    .stats__card-value {
      display: block;
      font-family: var(--font-heading);
      font-size: 2rem;
      font-weight: 700;
      color: var(--accent-gold);
      margin-bottom: 4px;
    }
    .stats__card-label {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-tertiary);
    }
    .stats__sections {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-xl);
    }
    .stats__section h3 {
      margin-bottom: var(--space-md);
    }
    .stats__bars {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }
    .stats__bar-row {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }
    .stats__bar-label {
      min-width: 80px;
      font-size: 0.85rem;
      color: var(--text-secondary);
      text-align: right;
    }
    .stats__bar-track {
      flex: 1;
      height: 8px;
      background-color: var(--bg-raised);
      border-radius: 4px;
      overflow: hidden;
    }
    .stats__bar-fill {
      height: 100%;
      background-color: var(--accent-gold);
      border-radius: 4px;
      transition: width 0.4s ease;
    }
    .stats__bar-count {
      min-width: 24px;
      font-size: 0.8rem;
      color: var(--text-tertiary);
    }

    @media (max-width: 768px) {
      .collection__controls {
        flex-direction: column;
        align-items: flex-start;
      }
      .stats__sections {
        grid-template-columns: 1fr;
      }
      .stats__overview {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `],
})
export class CollectionComponent implements OnInit {
  protected readonly catalog = inject(CatalogService);
  private readonly collectionService = inject(CollectionService);

  readonly activeTab = signal<'watchlist' | 'watched' | 'stats'>('watchlist');
  readonly sortBy = signal<SortOption>('added-desc');

  readonly watchlistMovies = computed(() => {
    const ids = this.collectionService.watchlistIds();
    return this.catalog.movies().filter((m) => ids.has(m.id));
  });

  readonly watchedMovies = computed(() => {
    const ids = this.collectionService.watchedIds();
    return this.catalog.movies().filter((m) => ids.has(m.id));
  });

  readonly currentMovies = computed(() =>
    this.activeTab() === 'watchlist' ? this.watchlistMovies() : this.watchedMovies()
  );

  readonly sortedWatchlist = computed(() => this.sortMovies(this.watchlistMovies(), 'watchlist'));
  readonly sortedWatched = computed(() => this.sortMovies(this.watchedMovies(), 'watched'));

  // Stats
  readonly avgRating = computed(() => {
    const items = this.collectionService.watched().filter((w) => w.userRating != null);
    if (items.length === 0) return '—';
    const avg = items.reduce((sum, w) => sum + (w.userRating ?? 0), 0) / items.length;
    return avg.toFixed(1);
  });

  readonly avgTmdbRating = computed(() => {
    const movies = this.watchedMovies().filter((m) => m.voteAverage > 0);
    if (movies.length === 0) return '—';
    const avg = movies.reduce((sum, m) => sum + m.voteAverage, 0) / movies.length;
    return avg.toFixed(1);
  });

  readonly totalDecades = computed(() => {
    const decades = new Set(this.watchedMovies().map((m) => Math.floor(m.year / 10) * 10));
    return decades.size;
  });

  readonly genreStats = computed(() => this.computeStats(
    this.watchedMovies().flatMap((m) => m.genres)
  ));

  readonly decadeStats = computed(() => this.computeStats(
    this.watchedMovies().map((m) => `${Math.floor(m.year / 10) * 10}s`)
  ));

  ngOnInit(): void {
    this.catalog.load();
  }

  onSortChange(event: Event): void {
    this.sortBy.set((event.target as HTMLSelectElement).value as SortOption);
  }

  exportCsv(): void {
    const movies = this.currentMovies();
    const tab = this.activeTab();
    const headers = ['Title', 'Year', 'Genres', 'Directors', 'Rating', 'Streamable'];
    if (tab === 'watched') headers.push('Your Rating');

    const rows = movies.map((m) => {
      const row = [
        `"${m.title.replace(/"/g, '""')}"`,
        m.year,
        `"${m.genres.join(', ')}"`,
        `"${m.directors.join(', ')}"`,
        m.voteAverage || '',
        m.isStreamable ? 'Yes' : 'No',
      ];
      if (tab === 'watched') {
        const item = this.collectionService.watched().find((w) => w.movieId === m.id);
        row.push(item?.userRating ?? '');
      }
      return row.join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bw-cinema-${tab}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private sortMovies(movies: MovieSummary[], list: 'watchlist' | 'watched'): MovieSummary[] {
    const sort = this.sortBy();
    const items = list === 'watchlist' ? this.collectionService.watchlist() : this.collectionService.watched();
    const timeMap = new Map(items.map((i) => [i.movieId, 'addedAt' in i ? i.addedAt : (i as { watchedAt: number }).watchedAt]));

    return [...movies].sort((a, b) => {
      switch (sort) {
        case 'added-desc': return (timeMap.get(b.id) ?? 0) - (timeMap.get(a.id) ?? 0);
        case 'added-asc': return (timeMap.get(a.id) ?? 0) - (timeMap.get(b.id) ?? 0);
        case 'title-asc': return a.title.localeCompare(b.title);
        case 'title-desc': return b.title.localeCompare(a.title);
        case 'rating-desc': return b.voteAverage - a.voteAverage;
        case 'year-desc': return b.year - a.year;
        default: return 0;
      }
    });
  }

  private computeStats(items: string[]): { name: string; count: number; pct: number }[] {
    const counts = new Map<string, number>();
    for (const item of items) {
      counts.set(item, (counts.get(item) ?? 0) + 1);
    }
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    const max = sorted[0]?.[1] ?? 1;
    return sorted.map(([name, count]) => ({ name, count, pct: (count / max) * 100 }));
  }
}
