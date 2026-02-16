import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { MovieGridComponent } from '../../shared/components/movie-grid.component';
import { SearchBarComponent } from '../../shared/components/search-bar.component';
import { FilterPanelComponent } from '../../shared/components/filter-panel.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { KeyboardNavDirective } from '../../shared/directives/keyboard-nav.directive';
import type { CatalogFilter } from '../../core/models/catalog.model';

@Component({
  selector: 'app-browse',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MovieGridComponent, SearchBarComponent, FilterPanelComponent, LoadingSpinnerComponent, KeyboardNavDirective],
  template: `
    <div class="browse container">
      <div class="browse__top">
        <h1>Browse Films</h1>
        <p class="browse__subtitle" aria-live="polite" aria-atomic="true">{{ filteredMovies().length }} films found</p>
      </div>

      @if (catalog.loading()) {
        <app-loading-spinner />
      } @else {
        <div class="browse__layout">
          <aside class="browse__sidebar">
            <app-filter-panel
              [availableDecades]="catalog.meta()?.decades ?? []"
              [availableGenres]="catalog.meta()?.genres ?? []"
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
            </div>

            <div appKeyboardNav>
              <app-movie-grid [movies]="paginatedMovies()" />
            </div>

            @if (paginatedMovies().length < filteredMovies().length) {
              <div class="browse__load-more">
                <button class="btn-secondary browse__load-btn" (click)="loadMore()">
                  Show More
                  <span class="browse__remaining">{{ filteredMovies().length - paginatedMovies().length }} remaining</span>
                </button>
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
    .browse__load-more {
      text-align: center;
      padding: var(--space-2xl) 0 var(--space-md);
    }
    .browse__load-btn {
      padding: var(--space-md) var(--space-2xl);
      border-radius: var(--radius-lg);
    }
    .browse__remaining {
      display: block;
      font-size: 0.8rem;
      color: var(--text-tertiary);
      font-weight: 400;
      margin-top: 2px;
    }
    @media (max-width: 900px) {
      .browse__layout {
        grid-template-columns: 1fr;
      }
      .browse__sidebar {
        position: static;
        max-height: none;
      }
      .browse__toolbar {
        flex-direction: column;
      }
      .browse__sort select { width: 100%; }
    }
  `],
})
export class BrowseComponent implements OnInit {
  protected readonly catalog = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);

  private readonly pageSize = 24;
  readonly page = signal(1);

  readonly filter = signal<CatalogFilter>({
    query: '',
    decades: [],
    genres: [],
    streamableOnly: false,
    minRating: 0,
    sortBy: 'rating',
    sortDirection: 'desc',
  });

  readonly filteredMovies = computed(() => this.catalog.search(this.filter()));
  readonly paginatedMovies = computed(() =>
    this.filteredMovies().slice(0, this.page() * this.pageSize)
  );

  ngOnInit(): void {
    this.catalog.load();
    const params = this.route.snapshot.queryParams;
    if (params['q'] || params['decade'] || params['genre']) {
      this.filter.update((f) => ({
        ...f,
        query: params['q'] ?? '',
        decades: params['decade'] ? [parseInt(params['decade'], 10)] : [],
        genres: params['genre'] ? [params['genre']] : [],
      }));
    }
  }

  onSearch(query: string): void {
    this.filter.update((f) => ({ ...f, query }));
    this.page.set(1);
  }

  onFilterChange(filters: { decades: number[]; genres: string[]; streamableOnly: boolean; minRating: number }): void {
    this.filter.update((f) => ({ ...f, ...filters }));
    this.page.set(1);
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const [sortBy, sortDirection] = value.split('-') as [CatalogFilter['sortBy'], CatalogFilter['sortDirection']];
    this.filter.update((f) => ({ ...f, sortBy, sortDirection }));
    this.page.set(1);
  }

  loadMore(): void {
    this.page.update((p) => p + 1);
  }
}
