import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CatalogService } from '../../core/services/catalog.service';
import { CollectionService } from '../../core/services/collection.service';
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
                <a class="director__genre-tag" [routerLink]="['/genre', g]">{{ g }}</a>
              }
            </div>
          }

          @if (watchedCount() > 0 || unwatchedFilms().length > 0) {
            <div class="director__completion">
              <div class="director__completion-header">
                <span class="director__completion-text">{{ watchedCount() }} of {{ films().length }} watched</span>
                <span class="director__completion-pct">{{ completionPct() }}%</span>
              </div>
              <div class="director__completion-track">
                <div class="director__completion-fill" [style.width.%]="completionPct()"></div>
              </div>
              @if (unwatchedFilms().length > 0) {
                <button class="director__add-unwatched" (click)="addUnwatchedToWatchlist()">
                  Add {{ unwatchedFilms().length }} unwatched to watchlist
                </button>
              }
            </div>
          }

          <div class="director__view-bar">
            <div class="director__sort-btns">
              <button
                class="director__sort-btn"
                [class.director__sort-btn--active]="sortMode() === 'rating'"
                (click)="sortMode.set('rating')"
              >Top Rated</button>
              <button
                class="director__sort-btn"
                [class.director__sort-btn--active]="sortMode() === 'chronological'"
                (click)="sortMode.set('chronological')"
              >Chronological</button>
            </div>
            <app-view-toggle [(mode)]="viewMode" />
          </div>

          @if (viewMode() === 'grid') {
            <app-movie-grid [movies]="sortedFilms()" />
          } @else {
            <app-movie-list [movies]="sortedFilms()" />
          }

          @if (collaborators().length > 0) {
            <div class="director__collaborators">
              <h2 class="director__section-title">Frequent Collaborators</h2>
              <div class="director__collab-list">
                @for (c of collaborators(); track c.name) {
                  <a class="director__collab-card" [routerLink]="['/director', c.name]">
                    <span class="director__collab-name">{{ c.name }}</span>
                    <span class="director__collab-count">{{ c.count }} shared film{{ c.count !== 1 ? 's' : '' }}</span>
                  </a>
                }
              </div>
            </div>
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
    .director__completion {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-md) var(--space-lg);
      margin-bottom: var(--space-lg);
    }
    .director__completion-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-sm);
    }
    .director__completion-text {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
    .director__completion-pct {
      font-family: var(--font-heading);
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--accent-gold);
    }
    .director__completion-track {
      height: 8px;
      background: var(--bg-raised);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: var(--space-sm);
    }
    .director__completion-fill {
      height: 100%;
      background: var(--accent-gold);
      border-radius: 4px;
      transition: width 0.4s ease;
    }
    .director__add-unwatched {
      background: none;
      border: none;
      color: var(--accent-gold);
      font-size: 0.85rem;
      font-weight: 600;
      padding: 0;
      min-height: auto;
      min-width: auto;
      cursor: pointer;
    }
    .director__add-unwatched:hover {
      text-decoration: underline;
    }
    .director__view-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-md);
      margin-bottom: var(--space-lg);
    }
    .director__sort-btns {
      display: flex;
      gap: var(--space-xs);
      flex-wrap: wrap;
    }
    .director__sort-btn {
      padding: 6px 14px;
      border-radius: var(--radius-lg);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .director__sort-btn:hover {
      border-color: var(--accent-gold);
      color: var(--accent-gold);
    }
    .director__sort-btn--active {
      background: var(--accent-gold-dim);
      border-color: var(--accent-gold);
      color: var(--accent-gold);
    }
    .director__section-title {
      font-size: 1.2rem;
      margin: var(--space-2xl) 0 var(--space-lg);
    }
    .director__collaborators {
      border-top: 1px solid var(--border);
      padding-top: var(--space-lg);
      margin-top: var(--space-xl);
    }
    .director__collab-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--space-md);
    }
    .director__collab-card {
      display: flex;
      flex-direction: column;
      padding: var(--space-md);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      text-decoration: none;
      transition: all 0.2s;
    }
    .director__collab-card:hover {
      border-color: var(--accent-gold);
      color: inherit;
    }
    .director__collab-name {
      font-weight: 600;
      color: var(--text-primary);
    }
    .director__collab-count {
      font-size: 0.8rem;
      color: var(--text-tertiary);
      margin-top: 2px;
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
        grid-template-columns: repeat(2, 1fr);
      }
      .director__header {
        flex-direction: column;
        gap: var(--space-md);
      }
      .director__sort-btn { padding: 8px 12px; font-size: 0.8rem; }
      .director__collab-list { grid-template-columns: 1fr; }
      .director__view-bar { flex-wrap: wrap; }
    }
  `],
})
export class DirectorComponent implements OnInit {
  readonly name = input.required<string>();

  protected readonly catalog = inject(CatalogService);
  private readonly collectionService = inject(CollectionService);
  private readonly titleService = inject(Title);

  readonly viewMode = signal<ViewMode>('grid');
  readonly sortMode = signal<'rating' | 'chronological'>('rating');

  readonly films = computed(() =>
    this.catalog.movies()
      .filter((m) => m.directors.some((d) => d === this.name()))
  );

  readonly sortedFilms = computed(() => {
    const f = [...this.films()];
    if (this.sortMode() === 'chronological') {
      return f.sort((a, b) => a.year - b.year);
    }
    return f.sort((a, b) => b.voteAverage - a.voteAverage);
  });

  readonly collaborators = computed(() => {
    const counts = new Map<string, number>();
    for (const m of this.films()) {
      for (const d of m.directors) {
        if (d !== this.name()) {
          counts.set(d, (counts.get(d) ?? 0) + 1);
        }
      }
    }
    return [...counts.entries()]
      .filter(([, count]) => count >= 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));
  });

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

  readonly watchedCount = computed(() => {
    const ids = this.collectionService.watchedIds();
    return this.films().filter((m) => ids.has(m.id)).length;
  });

  readonly unwatchedFilms = computed(() => {
    const watchedIds = this.collectionService.watchedIds();
    const watchlistIds = this.collectionService.watchlistIds();
    return this.films().filter((m) => !watchedIds.has(m.id) && !watchlistIds.has(m.id));
  });

  readonly completionPct = computed(() => {
    const total = this.films().length;
    return total > 0 ? Math.round((this.watchedCount() / total) * 100) : 0;
  });

  ngOnInit(): void {
    this.catalog.load();
    this.titleService.setTitle(`${this.name()} — BW Cinema`);
  }

  addUnwatchedToWatchlist(): void {
    for (const m of this.unwatchedFilms()) {
      this.collectionService.addToWatchlist(m.id);
    }
  }
}
