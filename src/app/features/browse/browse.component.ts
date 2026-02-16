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
      <h1>Browse Films</h1>

      @if (catalog.loading()) {
        <app-loading-spinner />
      } @else {
        <div class="browse__layout">
          <div class="browse__sidebar">
            <app-filter-panel
              [availableDecades]="catalog.meta()?.decades ?? []"
              [availableGenres]="catalog.meta()?.genres ?? []"
              (filterChanged)="onFilterChange($event)"
            />
          </div>

          <div class="browse__main">
            <div class="browse__toolbar">
              <app-search-bar (searched)="onSearch($event)" />
              <div class="browse__sort">
                <label for="sort-select" class="sr-only">Sort by</label>
                <select id="sort-select" (change)="onSortChange($event)">
                  <option value="title-asc">Title A-Z</option>
                  <option value="title-desc">Title Z-A</option>
                  <option value="year-desc">Newest First</option>
                  <option value="year-asc">Oldest First</option>
                  <option value="rating-desc" selected>Highest Rated</option>
                </select>
              </div>
            </div>

            <p class="browse__count">{{ filteredMovies().length }} films found</p>

            <div appKeyboardNav>
              <app-movie-grid [movies]="paginatedMovies()" />
            </div>

            @if (paginatedMovies().length < filteredMovies().length) {
              <div class="browse__load-more">
                <button class="btn-primary" (click)="loadMore()">
                  Load More ({{ filteredMovies().length - paginatedMovies().length }} remaining)
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
    .browse__layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: var(--space-xl);
      margin-top: var(--space-lg);
    }
    .browse__toolbar {
      display: flex;
      gap: var(--space-md);
      align-items: flex-start;
      margin-bottom: var(--space-lg);
    }
    .browse__sort select {
      min-width: 180px;
    }
    .browse__count {
      color: var(--text-secondary);
      font-size: 0.95rem;
      margin: 0 0 var(--space-md);
    }
    .browse__load-more {
      text-align: center;
      padding: var(--space-xl) 0;
    }
    @media (max-width: 768px) {
      .browse__layout {
        grid-template-columns: 1fr;
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
