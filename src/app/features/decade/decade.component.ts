import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CatalogService } from '../../core/services/catalog.service';
import { MovieGridComponent } from '../../shared/components/movie-grid.component';
import { MovieListComponent } from '../../shared/components/movie-list.component';
import { ViewToggleComponent, type ViewMode } from '../../shared/components/view-toggle.component';
import { SkeletonGridComponent } from '../../shared/components/skeleton-grid.component';

@Component({
  selector: 'app-decade',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MovieGridComponent, MovieListComponent, ViewToggleComponent, SkeletonGridComponent],
  template: `
    @if (catalog.loading()) {
      <div class="decade container">
        <app-skeleton-grid [count]="12" />
      </div>
    } @else {
      <div class="decade container">
        <div class="decade__header">
          <div>
            <p class="decade__eyebrow">Decade</p>
            <h1 class="decade__name">The {{ decadeLabel() }}</h1>
            <p class="decade__meta">{{ films().length }} film{{ films().length !== 1 ? 's' : '' }} in catalog</p>
          </div>
          <div class="decade__actions">
            <a class="btn-secondary decade__browse-link" routerLink="/browse" [queryParams]="{ decade: year() }">Browse with filters</a>
            <app-view-toggle [(mode)]="viewMode" />
          </div>
        </div>

        @if (films().length > 0) {
          <div class="decade__stats">
            <div class="decade__stat">
              <span class="decade__stat-value">{{ avgRating() }}</span>
              <span class="decade__stat-label">Avg. Rating</span>
            </div>
            <div class="decade__stat">
              <span class="decade__stat-value">{{ streamableCount() }}</span>
              <span class="decade__stat-label">Free to Watch</span>
            </div>
            <div class="decade__stat">
              <span class="decade__stat-value">{{ topGenre() }}</span>
              <span class="decade__stat-label">Top Genre</span>
            </div>
          </div>

          @if (viewMode() === 'grid') {
            <app-movie-grid [movies]="films()" />
          } @else {
            <app-movie-list [movies]="films()" />
          }
        } @else {
          <div class="decade__empty">
            <p>No films found for this decade.</p>
            <a class="btn-primary" routerLink="/browse">Browse All Films</a>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .decade { padding: var(--space-xl) 0; }
    .decade__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: var(--space-lg);
    }
    .decade__eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.15em;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--accent-gold);
      margin: 0 0 var(--space-xs);
    }
    .decade__name { margin-bottom: var(--space-xs); }
    .decade__meta {
      color: var(--text-secondary);
      font-size: 0.95rem;
      margin: 0;
    }
    .decade__actions {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }
    .decade__browse-link {
      display: inline-block;
      font-size: 0.85rem;
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius-lg);
    }
    .decade__stats {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: var(--space-md);
      margin-bottom: var(--space-xl);
    }
    .decade__stat {
      background-color: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-md);
      text-align: center;
    }
    .decade__stat-value {
      display: block;
      font-family: var(--font-heading);
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--accent-gold);
      margin-bottom: 2px;
    }
    .decade__stat-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-tertiary);
    }
    .decade__empty {
      text-align: center;
      padding: var(--space-3xl);
      color: var(--text-tertiary);
    }
    @media (max-width: 768px) {
      .decade__header { flex-direction: column; gap: var(--space-md); }
    }
    @media (max-width: 480px) {
      .decade__stats { grid-template-columns: 1fr; }
    }
  `],
})
export class DecadeComponent implements OnInit {
  readonly year = input.required<string>();

  protected readonly catalog = inject(CatalogService);
  private readonly titleService = inject(Title);

  readonly viewMode = signal<ViewMode>('grid');

  readonly decadeLabel = computed(() => `${this.year()}s`);

  readonly films = computed(() => {
    const y = parseInt(this.year(), 10);
    return this.catalog.movies()
      .filter((m) => m.isStreamable && m.year >= y && m.year < y + 10)
      .sort((a, b) => b.voteAverage - a.voteAverage);
  });

  readonly avgRating = computed(() => {
    const rated = this.films().filter((m) => m.voteAverage > 0);
    if (rated.length === 0) return '—';
    return (rated.reduce((s, m) => s + m.voteAverage, 0) / rated.length).toFixed(1);
  });

  readonly streamableCount = computed(() =>
    this.films().filter((m) => m.isStreamable).length
  );

  readonly topGenre = computed(() => {
    const counts = new Map<string, number>();
    for (const m of this.films()) {
      for (const g of m.genres) counts.set(g, (counts.get(g) ?? 0) + 1);
    }
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] ?? '—';
  });

  ngOnInit(): void {
    this.catalog.load();
    this.titleService.setTitle(`${this.year()}s Films — BW Cinema`);
  }
}
