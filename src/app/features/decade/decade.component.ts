import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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
            <a class="btn-secondary decade__browse-link" routerLink="/browse" [queryParams]="{ decades: year() }">Browse with filters</a>
            <button class="decade__surprise-btn" (click)="surpriseMe()" aria-label="Random film from this decade" title="Random film">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="1" width="22" height="22" rx="4"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><circle cx="16" cy="8" r="1.5" fill="currentColor"/><circle cx="8" cy="16" r="1.5" fill="currentColor"/><circle cx="16" cy="16" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>
            </button>
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

          <div class="decade__view-bar">
            <div class="decade__sort-btns">
              <button class="decade__sort-btn" [class.decade__sort-btn--active]="sortMode() === 'rating'" (click)="sortMode.set('rating')">Top Rated</button>
              <button class="decade__sort-btn" [class.decade__sort-btn--active]="sortMode() === 'newest'" (click)="sortMode.set('newest')">Newest</button>
              <button class="decade__sort-btn" [class.decade__sort-btn--active]="sortMode() === 'oldest'" (click)="sortMode.set('oldest')">Oldest</button>
              <button class="decade__sort-btn" [class.decade__sort-btn--active]="sortMode() === 'title'" (click)="sortMode.set('title')">Title</button>
            </div>
            <div class="decade__bar-right">
              <button
                class="decade__streamable-btn"
                [class.decade__streamable-btn--active]="streamableOnly()"
                (click)="streamableOnly.set(!streamableOnly())"
              >
                {{ streamableOnly() ? 'Free only' : 'All films' }}
              </button>
              <app-view-toggle [(mode)]="viewMode" />
            </div>
          </div>

          @if (viewMode() === 'grid') {
            <app-movie-grid [movies]="sortedFilms()" />
          } @else {
            <app-movie-list [movies]="sortedFilms()" />
          }

          @if (genreBreakdown().length > 0) {
            <div class="decade__genres">
              <h2 class="decade__section-title">Genres of the {{ decadeLabel() }}</h2>
              <div class="decade__genre-chips">
                @for (g of genreBreakdown(); track g.name) {
                  <a class="decade__genre-chip" [routerLink]="['/genre', g.name]">
                    {{ g.name }}
                    <span class="decade__genre-count">{{ g.count }}</span>
                  </a>
                }
              </div>
            </div>
          }

          @if (topDirectors().length > 0) {
            <div class="decade__directors">
              <h2 class="decade__section-title">Notable Directors</h2>
              <div class="decade__directors-grid">
                @for (d of topDirectors(); track d.name) {
                  <a class="decade__director-card" [routerLink]="['/director', d.name]">
                    <span class="decade__director-name">{{ d.name }}</span>
                    <span class="decade__director-films">{{ d.count }} film{{ d.count !== 1 ? 's' : '' }}</span>
                    <span class="decade__director-rating">{{ d.avgRating }}</span>
                  </a>
                }
              </div>
            </div>
          }

          @if (yearByYear().length > 1) {
            <div class="decade__yearly">
              <h2 class="decade__section-title">Year by Year</h2>
              <div class="decade__yearly-chart">
                @for (y of yearByYear(); track y.year) {
                  <div class="decade__yearly-bar" [title]="y.year + ': ' + y.count + ' films'">
                    <div class="decade__yearly-fill" [style.height.%]="y.heightPct"></div>
                    <span class="decade__yearly-count">{{ y.count }}</span>
                    <span class="decade__yearly-label">{{ y.year }}</span>
                  </div>
                }
              </div>
            </div>
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
    .decade__view-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-md);
      margin-bottom: var(--space-lg);
      flex-wrap: wrap;
    }
    .decade__sort-btns {
      display: flex;
      gap: var(--space-xs);
      flex-wrap: wrap;
    }
    .decade__sort-btn {
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
    .decade__sort-btn:hover {
      border-color: var(--accent-gold);
      color: var(--accent-gold);
    }
    .decade__sort-btn--active {
      background: var(--accent-gold-dim);
      border-color: var(--accent-gold);
      color: var(--accent-gold);
    }
    .decade__bar-right {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }
    .decade__streamable-btn {
      padding: 6px 12px;
      border-radius: var(--radius-lg);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .decade__streamable-btn:hover {
      border-color: var(--accent-gold);
      color: var(--accent-gold);
    }
    .decade__streamable-btn--active {
      background: var(--accent-gold-dim);
      border-color: var(--accent-gold);
      color: var(--accent-gold);
    }
    .decade__surprise-btn {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: var(--bg-hover);
      border: 1px solid var(--border);
      color: var(--text-tertiary);
      cursor: pointer;
      transition: all 0.2s;
    }
    .decade__surprise-btn:hover {
      background: var(--accent-gold-dim);
      border-color: var(--accent-gold);
      color: var(--accent-gold);
    }
    .decade__section-title {
      font-size: 1.2rem;
      margin-bottom: var(--space-md);
    }
    .decade__genres {
      margin-top: var(--space-2xl);
      padding-top: var(--space-lg);
      border-top: 1px solid var(--border);
    }
    .decade__genre-chips {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-sm);
    }
    .decade__genre-chip {
      display: inline-flex;
      align-items: center;
      gap: var(--space-xs);
      padding: 6px 14px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-decoration: none;
      transition: all 0.2s;
    }
    .decade__genre-chip:hover {
      border-color: var(--accent-gold);
      color: var(--accent-gold);
    }
    .decade__genre-count {
      font-size: 0.7rem;
      background: var(--bg-raised);
      padding: 1px 6px;
      border-radius: 8px;
      color: var(--text-tertiary);
    }
    .decade__directors {
      margin-top: var(--space-xl);
      padding-top: var(--space-lg);
      border-top: 1px solid var(--border);
    }
    .decade__directors-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--space-md);
    }
    .decade__director-card {
      display: flex;
      flex-direction: column;
      padding: var(--space-md);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      text-decoration: none;
      transition: all 0.2s;
    }
    .decade__director-card:hover {
      border-color: var(--accent-gold);
      color: inherit;
    }
    .decade__director-name {
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 2px;
    }
    .decade__director-films {
      font-size: 0.8rem;
      color: var(--text-tertiary);
    }
    .decade__director-rating {
      font-family: var(--font-heading);
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--accent-gold);
      margin-top: var(--space-xs);
    }
    .decade__yearly {
      margin-top: var(--space-xl);
      padding-top: var(--space-lg);
      border-top: 1px solid var(--border);
    }
    .decade__yearly-chart {
      display: flex;
      align-items: flex-end;
      gap: var(--space-sm);
      height: 120px;
      padding: var(--space-md) 0;
    }
    .decade__yearly-bar {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      height: 100%;
      cursor: default;
    }
    .decade__yearly-fill {
      width: 100%;
      max-width: 40px;
      background: linear-gradient(to top, var(--accent-gold), var(--accent-gold-dim));
      border-radius: 4px 4px 0 0;
      min-height: 4px;
      transition: height 0.4s ease;
    }
    .decade__yearly-count {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--accent-gold);
      margin-bottom: 2px;
    }
    .decade__yearly-label {
      font-size: 0.65rem;
      color: var(--text-tertiary);
      margin-top: var(--space-xs);
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
      .decade__stats { grid-template-columns: repeat(2, 1fr); }
      .decade__sort-btn { padding: 8px 12px; font-size: 0.8rem; }
      .decade__streamable-btn { padding: 8px 12px; }
    }
  `],
})
export class DecadeComponent implements OnInit {
  readonly year = input.required<string>();

  protected readonly catalog = inject(CatalogService);
  private readonly titleService = inject(Title);
  private readonly router = inject(Router);

  readonly viewMode = signal<ViewMode>('grid');
  readonly sortMode = signal<'rating' | 'newest' | 'oldest' | 'title'>('rating');
  readonly streamableOnly = signal(true);

  readonly decadeLabel = computed(() => `${this.year()}s`);

  readonly films = computed(() => {
    const y = parseInt(this.year(), 10);
    return this.catalog.movies()
      .filter((m) => m.year >= y && m.year < y + 10);
  });

  readonly sortedFilms = computed(() => {
    let f = this.films();
    if (this.streamableOnly()) {
      f = f.filter((m) => m.isStreamable);
    }
    const sorted = [...f];
    switch (this.sortMode()) {
      case 'rating': return sorted.sort((a, b) => b.voteAverage - a.voteAverage);
      case 'newest': return sorted.sort((a, b) => b.year - a.year);
      case 'oldest': return sorted.sort((a, b) => a.year - b.year);
      case 'title': return sorted.sort((a, b) => a.title.localeCompare(b.title));
    }
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

  readonly genreBreakdown = computed(() => {
    const counts = new Map<string, number>();
    for (const m of this.films()) {
      for (const g of m.genres) counts.set(g, (counts.get(g) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
  });

  readonly topDirectors = computed(() => {
    const dirMap = new Map<string, { count: number; totalRating: number }>();
    for (const m of this.films()) {
      for (const d of m.directors) {
        const entry = dirMap.get(d) ?? { count: 0, totalRating: 0 };
        entry.count++;
        entry.totalRating += m.voteAverage;
        dirMap.set(d, entry);
      }
    }
    return [...dirMap.entries()]
      .filter(([, v]) => v.count >= 2)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 8)
      .map(([name, v]) => ({
        name,
        count: v.count,
        avgRating: (v.totalRating / v.count).toFixed(1),
      }));
  });

  readonly yearByYear = computed(() => {
    const y = parseInt(this.year(), 10);
    const counts = new Map<number, number>();
    for (const m of this.films()) {
      counts.set(m.year, (counts.get(m.year) ?? 0) + 1);
    }
    const entries: { year: number; count: number; heightPct: number }[] = [];
    for (let yr = y; yr < y + 10; yr++) {
      entries.push({ year: yr, count: counts.get(yr) ?? 0, heightPct: 0 });
    }
    const max = Math.max(...entries.map((e) => e.count));
    for (const e of entries) {
      e.heightPct = max > 0 ? Math.round((e.count / max) * 100) : 0;
    }
    return entries;
  });

  ngOnInit(): void {
    this.catalog.load();
    this.titleService.setTitle(`${this.year()}s Films — BW Cinema`);
  }

  surpriseMe(): void {
    const eligible = this.sortedFilms();
    if (eligible.length === 0) return;
    const pick = eligible[Math.floor(Math.random() * eligible.length)];
    this.router.navigate(['/movie', pick.id]);
  }
}
