import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { CatalogService } from '../../core/services/catalog.service';
import { CollectionService } from '../../core/services/collection.service';
import { MovieGridComponent } from '../../shared/components/movie-grid.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import type { MovieSummary } from '../../core/models/movie.model';

@Component({
  selector: 'app-collection',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MovieGridComponent, LoadingSpinnerComponent],
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
            Watchlist ({{ watchlistMovies().length }})
          </button>
          <button
            class="collection__tab"
            [class.collection__tab--active]="activeTab() === 'watched'"
            (click)="activeTab.set('watched')"
            role="tab"
            [attr.aria-selected]="activeTab() === 'watched'"
          >
            Watched ({{ watchedMovies().length }})
          </button>
        </div>

        @if (activeTab() === 'watchlist') {
          <div role="tabpanel">
            @if (watchlistMovies().length > 0) {
              <app-movie-grid [movies]="watchlistMovies()" />
            } @else {
              <div class="collection__empty">
                <h2>Your watchlist is empty</h2>
                <p class="text-secondary">Browse films and add ones you'd like to watch later.</p>
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
                <h2>No films watched yet</h2>
                <p class="text-secondary">Films you mark as watched will appear here.</p>
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
      gap: var(--space-sm);
      margin-bottom: var(--space-xl);
      border-bottom: 1px solid var(--border);
    }
    .collection__tab {
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--text-secondary);
      font-size: 1.1rem;
      padding: var(--space-md) var(--space-lg);
      cursor: pointer;
      transition: color 0.2s, border-color 0.2s;
      min-height: 48px;
    }
    .collection__tab:hover { color: var(--text-primary); }
    .collection__tab--active {
      color: var(--accent-gold);
      border-bottom-color: var(--accent-gold);
    }
    .collection__empty {
      text-align: center;
      padding: var(--space-2xl);
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
