import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CatalogService } from '../../core/services/catalog.service';
import { MovieGridComponent } from '../../shared/components/movie-grid.component';
import { MovieListComponent } from '../../shared/components/movie-list.component';
import { ViewToggleComponent, type ViewMode } from '../../shared/components/view-toggle.component';
import { SkeletonGridComponent } from '../../shared/components/skeleton-grid.component';

@Component({
  selector: 'app-genre',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MovieGridComponent, MovieListComponent, ViewToggleComponent, SkeletonGridComponent],
  template: `
    @if (catalog.loading()) {
      <div class="genre container">
        <app-skeleton-grid [count]="12" />
      </div>
    } @else {
      <div class="genre container">
        <div class="genre__header">
          <div>
            <p class="genre__eyebrow">Genre</p>
            <h1 class="genre__name">{{ name() }}</h1>
            <p class="genre__meta">{{ films().length }} film{{ films().length !== 1 ? 's' : '' }} in catalog</p>
          </div>
          <div class="genre__actions">
            <a class="btn-secondary genre__browse-link" routerLink="/browse" [queryParams]="{ genres: name() }">Browse with filters</a>
            <button class="genre__surprise-btn" (click)="surpriseMe()" aria-label="Random film from this genre" title="Random film">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="1" width="22" height="22" rx="4"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><circle cx="16" cy="8" r="1.5" fill="currentColor"/><circle cx="8" cy="16" r="1.5" fill="currentColor"/><circle cx="16" cy="16" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>
            </button>
          </div>
        </div>

        @if (films().length > 0) {
          <div class="genre__stats">
            <div class="genre__stat">
              <span class="genre__stat-value">{{ yearRange() }}</span>
              <span class="genre__stat-label">Years</span>
            </div>
            <div class="genre__stat">
              <span class="genre__stat-value">{{ avgRating() }}</span>
              <span class="genre__stat-label">Avg. Rating</span>
            </div>
            <div class="genre__stat">
              <span class="genre__stat-value">{{ streamableCount() }}</span>
              <span class="genre__stat-label">Free to Watch</span>
            </div>
          </div>

          <div class="genre__view-bar">
            <div class="genre__sort-btns">
              <button class="genre__sort-btn" [class.genre__sort-btn--active]="sortMode() === 'rating'" (click)="sortMode.set('rating')">Top Rated</button>
              <button class="genre__sort-btn" [class.genre__sort-btn--active]="sortMode() === 'newest'" (click)="sortMode.set('newest')">Newest</button>
              <button class="genre__sort-btn" [class.genre__sort-btn--active]="sortMode() === 'oldest'" (click)="sortMode.set('oldest')">Oldest</button>
              <button class="genre__sort-btn" [class.genre__sort-btn--active]="sortMode() === 'title'" (click)="sortMode.set('title')">Title</button>
            </div>
            <div class="genre__bar-right">
              <button
                class="genre__streamable-btn"
                [class.genre__streamable-btn--active]="streamableOnly()"
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

          @if (topDirectors().length > 0) {
            <div class="genre__directors">
              <h2 class="genre__section-title">Top Directors in {{ name() }}</h2>
              <div class="genre__directors-grid">
                @for (d of topDirectors(); track d.name) {
                  <a class="genre__director-card" [routerLink]="['/director', d.name]">
                    <span class="genre__director-name">{{ d.name }}</span>
                    <span class="genre__director-count">{{ d.count }} film{{ d.count !== 1 ? 's' : '' }}</span>
                    <span class="genre__director-rating">{{ d.avgRating }}</span>
                  </a>
                }
              </div>
            </div>
          }

          @if (decadeBreakdown().length > 0) {
            <div class="genre__decades">
              <h2 class="genre__section-title">By Decade</h2>
              <div class="genre__decades-row">
                @for (d of decadeBreakdown(); track d.decade) {
                  <a class="genre__decade-chip" [routerLink]="['/decade', d.decade]">
                    {{ d.decade }}s
                    <span class="genre__decade-count">{{ d.count }}</span>
                  </a>
                }
              </div>
            </div>
          }
        } @else {
          <div class="genre__empty">
            <p>No films found for this genre.</p>
            <a class="btn-primary" routerLink="/browse">Browse All Films</a>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .genre { padding: var(--space-xl) 0; }
    .genre__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: var(--space-lg);
    }
    .genre__eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.15em;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--accent-gold);
      margin: 0 0 var(--space-xs);
    }
    .genre__name { margin-bottom: var(--space-xs); }
    .genre__meta {
      color: var(--text-secondary);
      font-size: 0.95rem;
      margin: 0;
    }
    .genre__actions {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }
    .genre__browse-link {
      display: inline-block;
      font-size: 0.85rem;
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius-lg);
    }
    .genre__stats {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: var(--space-md);
      margin-bottom: var(--space-xl);
    }
    .genre__stat {
      background-color: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-md);
      text-align: center;
    }
    .genre__stat-value {
      display: block;
      font-family: var(--font-heading);
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--accent-gold);
      margin-bottom: 2px;
    }
    .genre__stat-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-tertiary);
    }
    .genre__view-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-md);
      margin-bottom: var(--space-lg);
      flex-wrap: wrap;
    }
    .genre__sort-btns {
      display: flex;
      gap: var(--space-xs);
      flex-wrap: wrap;
    }
    .genre__sort-btn {
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
    .genre__sort-btn:hover {
      border-color: var(--accent-gold);
      color: var(--accent-gold);
    }
    .genre__sort-btn--active {
      background: var(--accent-gold-dim);
      border-color: var(--accent-gold);
      color: var(--accent-gold);
    }
    .genre__bar-right {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }
    .genre__streamable-btn {
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
    .genre__streamable-btn:hover {
      border-color: var(--accent-gold);
      color: var(--accent-gold);
    }
    .genre__streamable-btn--active {
      background: var(--accent-gold-dim);
      border-color: var(--accent-gold);
      color: var(--accent-gold);
    }
    .genre__surprise-btn {
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
    .genre__surprise-btn:hover {
      background: var(--accent-gold-dim);
      border-color: var(--accent-gold);
      color: var(--accent-gold);
    }
    .genre__section-title {
      font-size: 1.2rem;
      margin-bottom: var(--space-md);
    }
    .genre__directors {
      margin-top: var(--space-2xl);
      padding-top: var(--space-lg);
      border-top: 1px solid var(--border);
    }
    .genre__directors-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--space-md);
    }
    .genre__director-card {
      display: flex;
      flex-direction: column;
      padding: var(--space-md);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      text-decoration: none;
      transition: all 0.2s;
    }
    .genre__director-card:hover {
      border-color: var(--accent-gold);
      color: inherit;
    }
    .genre__director-name {
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 2px;
    }
    .genre__director-count {
      font-size: 0.8rem;
      color: var(--text-tertiary);
    }
    .genre__director-rating {
      font-family: var(--font-heading);
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--accent-gold);
      margin-top: var(--space-xs);
    }
    .genre__decades {
      margin-top: var(--space-xl);
      padding-top: var(--space-lg);
      border-top: 1px solid var(--border);
    }
    .genre__decades-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-sm);
    }
    .genre__decade-chip {
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
    .genre__decade-chip:hover {
      border-color: var(--accent-gold);
      color: var(--accent-gold);
    }
    .genre__decade-count {
      font-size: 0.7rem;
      background: var(--bg-raised);
      padding: 1px 6px;
      border-radius: 8px;
      color: var(--text-tertiary);
    }
    .genre__empty {
      text-align: center;
      padding: var(--space-3xl);
      color: var(--text-tertiary);
    }
    @media (max-width: 768px) {
      .genre__header { flex-direction: column; gap: var(--space-md); }
    }
    @media (max-width: 480px) {
      .genre__stats { grid-template-columns: repeat(2, 1fr); }
      .genre__sort-btn { padding: 8px 12px; font-size: 0.8rem; }
      .genre__streamable-btn { padding: 8px 12px; }
    }
  `],
})
export class GenreComponent implements OnInit {
  readonly name = input.required<string>();

  protected readonly catalog = inject(CatalogService);
  private readonly titleService = inject(Title);
  private readonly router = inject(Router);

  readonly viewMode = signal<ViewMode>('grid');
  readonly sortMode = signal<'rating' | 'newest' | 'oldest' | 'title'>('rating');
  readonly streamableOnly = signal(true);

  readonly films = computed(() =>
    this.catalog.movies()
      .filter((m) => m.genres.some((g) => g.toLowerCase() === this.name().toLowerCase()))
  );

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

  readonly yearRange = computed(() => {
    const f = this.films();
    if (f.length === 0) return '—';
    const years = f.map((m) => m.year);
    return `${Math.min(...years)}–${Math.max(...years)}`;
  });

  readonly avgRating = computed(() => {
    const rated = this.films().filter((m) => m.voteAverage > 0);
    if (rated.length === 0) return '—';
    return (rated.reduce((s, m) => s + m.voteAverage, 0) / rated.length).toFixed(1);
  });

  readonly streamableCount = computed(() =>
    this.films().filter((m) => m.isStreamable).length
  );

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

  readonly decadeBreakdown = computed(() => {
    const decades = new Map<number, number>();
    for (const m of this.films()) {
      const d = Math.floor(m.year / 10) * 10;
      decades.set(d, (decades.get(d) ?? 0) + 1);
    }
    return [...decades.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([decade, count]) => ({ decade, count }));
  });

  ngOnInit(): void {
    this.catalog.load();
    this.titleService.setTitle(`${this.name()} Films — BW Cinema`);
  }

  surpriseMe(): void {
    const eligible = this.sortedFilms();
    if (eligible.length === 0) return;
    const pick = eligible[Math.floor(Math.random() * eligible.length)];
    this.router.navigate(['/movie', pick.id]);
  }
}
