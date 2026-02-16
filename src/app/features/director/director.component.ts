import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CatalogService } from '../../core/services/catalog.service';
import { MovieGridComponent } from '../../shared/components/movie-grid.component';
import { MovieListComponent } from '../../shared/components/movie-list.component';
import { ViewToggleComponent, type ViewMode } from '../../shared/components/view-toggle.component';
import { SkeletonGridComponent } from '../../shared/components/skeleton-grid.component';

@Component({
  selector: 'app-director',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MovieGridComponent, MovieListComponent, ViewToggleComponent, SkeletonGridComponent],
  template: `
    @if (catalog.loading()) {
      <div class="director container">
        <app-skeleton-grid [count]="6" />
      </div>
    } @else {
      <div class="director container">
        <div class="director__header">
          <div>
            <p class="director__eyebrow">Director</p>
            <h1 class="director__name">{{ name() }}</h1>
            <p class="director__meta">{{ films().length }} film{{ films().length !== 1 ? 's' : '' }} in catalog</p>
          </div>
          <app-view-toggle [(mode)]="viewMode" />
        </div>

        @if (films().length > 0) {
          <div class="director__stats">
            <div class="director__stat">
              <span class="director__stat-value">{{ yearRange() }}</span>
              <span class="director__stat-label">Active Years</span>
            </div>
            <div class="director__stat">
              <span class="director__stat-value">{{ avgRating() }}</span>
              <span class="director__stat-label">Avg. Rating</span>
            </div>
            <div class="director__stat">
              <span class="director__stat-value">{{ streamableCount() }}</span>
              <span class="director__stat-label">Free to Watch</span>
            </div>
            <div class="director__stat">
              <span class="director__stat-value">{{ decadesActive() }}</span>
              <span class="director__stat-label">Decades</span>
            </div>
          </div>

          @if (topGenres().length > 0) {
            <div class="director__genres">
              @for (g of topGenres(); track g) {
                <a class="director__genre-tag" [routerLink]="['/browse']" [queryParams]="{ genre: g }">{{ g }}</a>
              }
            </div>
          }

          @if (viewMode() === 'grid') {
            <app-movie-grid [movies]="films()" />
          } @else {
            <app-movie-list [movies]="films()" />
          }
        } @else {
          <div class="director__empty">
            <p>No films found for this director.</p>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .director { padding: var(--space-xl) 0; }
    .director__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: var(--space-lg);
    }
    .director__eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.15em;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--accent-gold);
      margin: 0 0 var(--space-xs);
    }
    .director__name {
      margin-bottom: var(--space-xs);
    }
    .director__meta {
      color: var(--text-secondary);
      font-size: 0.95rem;
      margin: 0;
    }
    .director__stats {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: var(--space-md);
      margin-bottom: var(--space-xl);
    }
    .director__stat {
      background-color: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-md);
      text-align: center;
    }
    .director__stat-value {
      display: block;
      font-family: var(--font-heading);
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--accent-gold);
      margin-bottom: 2px;
    }
    .director__stat-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-tertiary);
    }
    .director__genres {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-sm);
      margin-bottom: var(--space-xl);
    }
    .director__genre-tag {
      font-size: 0.85rem;
      padding: 4px 14px;
      border: 1px solid var(--border-bright);
      border-radius: 16px;
      color: var(--text-secondary);
      text-decoration: none;
      transition: all 0.2s;
    }
    .director__genre-tag:hover {
      border-color: var(--accent-gold);
      color: var(--accent-gold);
      background-color: var(--accent-gold-dim);
    }
    .director__empty {
      text-align: center;
      padding: var(--space-3xl);
      color: var(--text-tertiary);
    }
    @media (max-width: 768px) {
      .director__stats {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (max-width: 480px) {
      .director__stats {
        grid-template-columns: 1fr;
      }
      .director__header {
        flex-direction: column;
        gap: var(--space-md);
      }
    }
  `],
})
export class DirectorComponent implements OnInit {
  readonly name = input.required<string>();

  protected readonly catalog = inject(CatalogService);
  private readonly titleService = inject(Title);

  readonly viewMode = signal<ViewMode>('grid');
  readonly films = computed(() =>
    this.catalog.movies()
      .filter((m) => m.directors.some((d) => d === this.name()))
      .sort((a, b) => b.voteAverage - a.voteAverage)
  );

  readonly yearRange = computed(() => {
    const f = this.films();
    if (f.length === 0) return '—';
    const years = f.map((m) => m.year);
    const min = Math.min(...years);
    const max = Math.max(...years);
    return min === max ? `${min}` : `${min}–${max}`;
  });

  readonly avgRating = computed(() => {
    const rated = this.films().filter((m) => m.voteAverage > 0);
    if (rated.length === 0) return '—';
    return (rated.reduce((s, m) => s + m.voteAverage, 0) / rated.length).toFixed(1);
  });

  readonly streamableCount = computed(() =>
    this.films().filter((m) => m.isStreamable).length
  );

  readonly decadesActive = computed(() => {
    const decades = new Set(this.films().map((m) => Math.floor(m.year / 10) * 10));
    return decades.size;
  });

  readonly topGenres = computed(() => {
    const counts = new Map<string, number>();
    for (const m of this.films()) {
      for (const g of m.genres) counts.set(g, (counts.get(g) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([g]) => g);
  });

  ngOnInit(): void {
    this.catalog.load();
    this.titleService.setTitle(`${this.name()} — BW Cinema`);
  }
}
