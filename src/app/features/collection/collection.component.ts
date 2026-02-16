import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { CollectionService } from '../../core/services/collection.service';
import { MovieGridComponent } from '../../shared/components/movie-grid.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';

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
        </div>

        @if (activeTab() === 'watchlist') {
          <div role="tabpanel">
            @if (watchlistMovies().length > 0) {
              <app-movie-grid [movies]="watchlistMovies()" />
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
            @if (watchedMovies().length > 0) {
              <app-movie-grid [movies]="watchedMovies()" />
            } @else {
              <div class="collection__empty">
                <p class="collection__empty-title">No films watched yet</p>
                <p class="collection__empty-text">Films you mark as watched will appear here.</p>
                <a class="btn-primary" routerLink="/browse">Discover Films</a>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .collection { padding: var(--space-xl) 0; }
    .collection__tabs {
      display: flex;
      gap: 2px;
      margin-bottom: var(--space-xl);
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
  `],
})
export class CollectionComponent implements OnInit {
  protected readonly catalog = inject(CatalogService);
  private readonly collectionService = inject(CollectionService);

  readonly activeTab = signal<'watchlist' | 'watched'>('watchlist');

  readonly watchlistMovies = computed(() => {
    const ids = this.collectionService.watchlistIds();
    return this.catalog.movies().filter((m) => ids.has(m.id));
  });

  readonly watchedMovies = computed(() => {
    const ids = this.collectionService.watchedIds();
    return this.catalog.movies().filter((m) => ids.has(m.id));
  });

  ngOnInit(): void {
    this.catalog.load();
  }
}
