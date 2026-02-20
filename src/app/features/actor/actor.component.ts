import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed, input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import { CatalogService } from '../../core/services/catalog.service';
import { CollectionService } from '../../core/services/collection.service';

import { MovieGridComponent } from '../../shared/components/movie-grid.component';
import { MovieListComponent } from '../../shared/components/movie-list.component';
import { ViewToggleComponent, type ViewMode } from '../../shared/components/view-toggle.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import type { MovieSummary } from '../../core/models/movie.model';

@Component({
  selector: 'app-actor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MovieGridComponent, MovieListComponent, ViewToggleComponent, LoadingSpinnerComponent],
  template: `
    @if (catalog.error(); as err) {
      <div class="actor container">
        <div class="catalog-error" role="alert">
          <p>{{ err }}</p>
          <button (click)="catalog.retry()">Try Again</button>
        </div>
      </div>
    } @else if (catalog.loading()) {
      <div class="actor container">
        <app-loading-spinner />
      </div>
    } @else {
      <div class="actor container">
        <div class="actor__header">
          <div class="actor__profile">
            @if (photoUrl()) {
              <img class="actor__photo" [src]="photoUrl()" [alt]="name()" />
            } @else {
              <div class="actor__photo-placeholder">
                <span>{{ name()[0] }}</span>
              </div>
            }
            <div>
              <p class="actor__eyebrow">Actor</p>
              <h1 class="actor__name">{{ name() }}</h1>
              <p class="actor__meta">{{ films().length }} film{{ films().length !== 1 ? 's' : '' }} in catalog</p>
            </div>
          </div>
        </div>

        @if (films().length > 0) {
          <div class="actor__stats">
            <div class="actor__stat">
              <span class="actor__stat-value">{{ yearRange() }}</span>
              <span class="actor__stat-label">Active Years</span>
            </div>
            <div class="actor__stat">
              <span class="actor__stat-value">{{ avgRating() }}</span>
              <span class="actor__stat-label">Avg. Rating</span>
            </div>
            <div class="actor__stat">
              <span class="actor__stat-value">{{ streamableCount() }}</span>
              <span class="actor__stat-label">Free to Watch</span>
            </div>
            @if (bestDecade()) {
              <div class="actor__stat">
                <span class="actor__stat-value">{{ bestDecade() }}s</span>
                <span class="actor__stat-label">Best Decade</span>
              </div>
            }
          </div>

          @if (topGenres().length > 0) {
            <div class="actor__genres">
              @for (g of topGenres(); track g) {
                <a class="actor__genre-tag" [routerLink]="['/genre', g]">{{ g }}</a>
              }
            </div>
          }

          @if (bestFilm(); as best) {
            <a class="actor__best-film-card" [routerLink]="['/movie', best.id]">
              @if (best.posterUrl) {
                <img class="actor__best-film-poster" [src]="best.posterUrl" [alt]="best.title" loading="lazy" />
              } @else {
                <div class="actor__best-film-poster actor__best-film-poster--placeholder">&#9733;</div>
              }
              <div class="actor__best-film-info">
                <span class="actor__best-film-label">Highest Rated Film</span>
                <span class="actor__best-film-title">{{ best.title }}</span>
                <span class="actor__best-film-meta">{{ best.year }} · &#9733; {{ best.voteAverage.toFixed(1) }}</span>
              </div>
            </a>
          }

          @if (careerTimeline().length > 1) {
            <div class="actor__timeline">
              <h3>Career Timeline</h3>
              <div class="actor__timeline-bars">
                @for (period of careerTimeline(); track period.decade) {
                  <a class="actor__timeline-decade" [routerLink]="['/decade', period.decade]">
                    <div class="actor__timeline-bar" [style.height.px]="period.barHeight">
                      <span class="actor__timeline-count">{{ period.count }}</span>
                    </div>
                    <span class="actor__timeline-label">{{ period.decade }}s</span>
                    <span class="actor__timeline-rating">{{ period.avgRating }}</span>
                  </a>
                }
              </div>
            </div>
          }

          @if (topDirectors().length > 0) {
            <div class="actor__collabs">
              <h3>Frequent Collaborators</h3>
              <div class="actor__collab-list">
                @for (d of topDirectors(); track d.name) {
                  <a class="actor__collab-chip" [routerLink]="['/director', d.name]">
                    {{ d.name }}
                    <span class="actor__collab-count">{{ d.count }}</span>
                  </a>
                }
              </div>
            </div>
          }

          @if (watchedCount() > 0 || unwatchedFilms().length > 0) {
            <div class="actor__completion">
              <div class="actor__completion-header">
                <span class="actor__completion-text">{{ watchedCount() }} of {{ films().length }} watched</span>
                <span class="actor__completion-pct">{{ completionPct() }}%</span>
              </div>
              <div class="actor__completion-track">
                <div class="actor__completion-fill" [style.width.%]="completionPct()"></div>
              </div>
              @if (unwatchedFilms().length > 0) {
                <button class="actor__add-unwatched" (click)="addUnwatchedToWatchlist()">
                  Add {{ unwatchedFilms().length }} unwatched to watchlist
                </button>
              }
            </div>
          }

          <div class="actor__view-bar">
            <div class="actor__sort-btns">
              <button class="actor__sort-btn" [class.actor__sort-btn--active]="sortMode() === 'rating'" (click)="sortMode.set('rating')">Top Rated</button>
              <button class="actor__sort-btn" [class.actor__sort-btn--active]="sortMode() === 'chronological'" (click)="sortMode.set('chronological')">Chronological</button>
            </div>
            <app-view-toggle [(mode)]="viewMode" />
          </div>

          @if (viewMode() === 'grid') {
            <app-movie-grid [movies]="sortedFilms()" />
          } @else {
            <app-movie-list [movies]="sortedFilms()" />
          }
        } @else if (searching()) {
          <div class="actor__searching">
            <app-loading-spinner />
            <p class="actor__searching-text">Searching filmography...</p>
          </div>
        } @else {
          <div class="actor__empty">
            <p>No films found for this actor in our catalog.</p>
            <a class="btn-primary" routerLink="/browse">Browse Films</a>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .actor { padding: var(--space-xl) 0; }
    .actor__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: var(--space-lg);
    }
    .actor__profile {
      display: flex;
      align-items: center;
      gap: var(--space-lg);
    }
    .actor__photo {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      box-shadow: var(--shadow-md);
    }
    .actor__photo-placeholder {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: var(--bg-raised);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-heading);
      font-size: 2rem;
      color: var(--accent-gold);
      font-weight: 700;
    }
    .actor__eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.15em;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--accent-gold);
      margin: 0 0 var(--space-xs);
    }
    .actor__name { margin-bottom: var(--space-xs); }
    .actor__meta {
      color: var(--text-secondary);
      font-size: 0.95rem;
      margin: 0;
    }
    .actor__stats {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: var(--space-md);
      margin-bottom: var(--space-xl);
    }
    .actor__stat {
      background-color: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-md);
      text-align: center;
    }
    .actor__stat-value {
      display: block;
      font-family: var(--font-heading);
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--accent-gold);
      margin-bottom: 2px;
    }
    .actor__stat-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-tertiary);
    }
    .actor__genres {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-sm);
      margin-bottom: var(--space-xl);
    }
    .actor__genre-tag {
      font-size: 0.85rem;
      padding: 4px 14px;
      border: 1px solid var(--border-bright);
      border-radius: 16px;
      color: var(--text-secondary);
      text-decoration: none;
      transition: all 0.2s;
    }
    .actor__genre-tag:hover {
      border-color: var(--accent-gold);
      color: var(--accent-gold);
      background-color: var(--accent-gold-dim);
    }
    .actor__timeline {
      margin-bottom: var(--space-xl);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-lg);
    }
    .actor__timeline h3 { margin-bottom: var(--space-md); font-size: 1rem; }
    .actor__timeline-bars {
      display: flex;
      align-items: flex-end;
      gap: var(--space-md);
      min-height: 120px;
    }
    .actor__timeline-decade {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      text-decoration: none;
      color: inherit;
    }
    .actor__timeline-bar {
      width: 100%;
      max-width: 48px;
      background: linear-gradient(0deg, var(--accent-gold), #c49b2c);
      border-radius: var(--radius-sm) var(--radius-sm) 0 0;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: 4px;
      transition: transform 0.2s;
    }
    .actor__timeline-decade:hover .actor__timeline-bar {
      transform: translateY(-2px);
    }
    .actor__timeline-count {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--bg-deep);
    }
    .actor__timeline-label {
      font-size: 0.7rem;
      color: var(--text-tertiary);
      font-weight: 600;
    }
    .actor__timeline-rating {
      font-size: 0.65rem;
      color: var(--accent-gold);
      font-weight: 600;
    }
    .actor__collabs {
      margin-bottom: var(--space-xl);
    }
    .actor__collabs h3 { margin-bottom: var(--space-sm); }
    .actor__collab-list {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-sm);
    }
    .actor__collab-chip {
      display: inline-flex;
      align-items: center;
      gap: var(--space-xs);
      font-size: 0.85rem;
      padding: 6px 14px;
      background-color: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 20px;
      color: var(--text-primary);
      text-decoration: none;
      transition: all 0.2s;
    }
    .actor__collab-chip:hover {
      border-color: var(--accent-gold);
      color: var(--accent-gold);
    }
    .actor__collab-count {
      font-size: 0.7rem;
      background-color: var(--bg-raised);
      padding: 1px 6px;
      border-radius: 8px;
      color: var(--text-tertiary);
    }
    .actor__completion {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-md) var(--space-lg);
      margin-bottom: var(--space-lg);
    }
    .actor__completion-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-sm);
    }
    .actor__completion-text {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
    .actor__completion-pct {
      font-family: var(--font-heading);
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--accent-gold);
    }
    .actor__completion-track {
      height: 8px;
      background: var(--bg-raised);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: var(--space-sm);
    }
    .actor__completion-fill {
      height: 100%;
      background: var(--accent-gold);
      border-radius: 4px;
      transition: width 0.4s ease;
    }
    .actor__add-unwatched {
      background: none;
      border: none;
      color: var(--accent-gold);
      font-size: 0.875rem;
      font-weight: 600;
      padding: 8px 0;
      min-height: 44px;
      cursor: pointer;
    }
    .actor__add-unwatched:hover { text-decoration: underline; }
    .actor__view-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-md);
      margin-bottom: var(--space-lg);
    }
    .actor__sort-btns {
      display: flex;
      gap: var(--space-xs);
    }
    .actor__sort-btn {
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
    .actor__sort-btn:hover {
      border-color: var(--accent-gold);
      color: var(--accent-gold);
    }
    .actor__sort-btn--active {
      background: var(--accent-gold-dim);
      border-color: var(--accent-gold);
      color: var(--accent-gold);
    }
    .actor__empty {
      text-align: center;
      padding: var(--space-3xl);
      color: var(--text-tertiary);
    }
    .actor__best-film-card {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-md) var(--space-lg);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      text-decoration: none;
      color: inherit;
      margin-bottom: var(--space-xl);
      transition: border-color 0.2s, background-color 0.2s;
    }
    .actor__best-film-card:hover {
      border-color: var(--accent-gold);
      background: var(--bg-raised);
      color: inherit;
    }
    .actor__best-film-poster {
      width: 48px;
      height: 72px;
      object-fit: cover;
      border-radius: var(--radius-sm);
      flex-shrink: 0;
    }
    .actor__best-film-poster--placeholder {
      background: var(--bg-raised);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      color: var(--accent-gold);
    }
    .actor__best-film-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .actor__best-film-label {
      font-size: 0.75rem;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: 600;
    }
    .actor__best-film-title {
      font-family: var(--font-heading);
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .actor__best-film-card:hover .actor__best-film-title {
      color: var(--accent-gold);
    }
    .actor__best-film-meta {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
    @media (max-width: 768px) {
      .actor__header { flex-direction: column; gap: var(--space-md); }
    }
    @media (max-width: 480px) {
      .actor__profile { flex-direction: column; text-align: center; }
      .actor__stats { grid-template-columns: repeat(2, 1fr); gap: var(--space-sm); }
      .actor__stat { padding: var(--space-sm); }
      .actor__stat-value { font-size: 1.2rem; }
      .actor__timeline-bars { gap: var(--space-sm); }
      .actor__best-film-card { padding: var(--space-sm) var(--space-md); }
      .actor__sort-btn { padding: 6px 10px; font-size: 0.8rem; }
      .actor__collab-chip { padding: 4px 10px; font-size: 0.8rem; }
    }
    @media (max-width: 360px) {
      .actor__name { font-size: 1.3rem; }
      .actor__stats { grid-template-columns: 1fr 1fr; }
      .actor__stat-value { font-size: 1rem; }
      .actor__stat-label { font-size: 0.65rem; }
      .actor__photo, .actor__photo-placeholder { width: 64px; height: 64px; }
      .actor__photo-placeholder { font-size: 1.5rem; }
      .actor__genre-tag { padding: 3px 10px; font-size: 0.8rem; }
    }
    .actor__searching {
      text-align: center;
      padding: var(--space-2xl) var(--space-lg);
    }
    .actor__searching-text {
      color: var(--text-tertiary);
      font-size: 0.9rem;
      margin-top: var(--space-md);
    }
  `],
})
export class ActorComponent implements OnInit {
  readonly name = input.required<string>();

  protected readonly catalog = inject(CatalogService);
  private readonly collectionService = inject(CollectionService);
  private readonly http = inject(HttpClient);
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);

  readonly viewMode = signal<ViewMode>('grid');
  readonly sortMode = signal<'rating' | 'chronological'>('rating');
  readonly photoUrl = signal<string | null>(null);
  readonly searching = signal(true);

  /** Films this actor appears in — resolved by loading details for catalog films */
  private readonly actorFilmIds = signal<Set<string>>(new Set());

  readonly films = computed(() => {
    const ids = this.actorFilmIds();
    if (ids.size === 0) return [];
    return this.catalog.movies()
      .filter((m) => ids.has(m.id))
      .sort((a, b) => b.voteAverage - a.voteAverage);
  });

  readonly sortedFilms = computed(() => {
    const f = [...this.films()];
    if (this.sortMode() === 'chronological') {
      return f.sort((a, b) => a.year - b.year);
    }
    return f.sort((a, b) => b.voteAverage - a.voteAverage);
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

  readonly topGenres = computed(() => {
    const counts = new Map<string, number>();
    for (const m of this.films()) {
      for (const g of m.genres) counts.set(g, (counts.get(g) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([g]) => g);
  });

  readonly bestDecade = computed(() => {
    const f = this.films();
    if (f.length < 3) return null;
    const decades = new Map<number, { count: number; totalRating: number }>();
    for (const m of f) {
      const d = Math.floor(m.year / 10) * 10;
      const entry = decades.get(d) ?? { count: 0, totalRating: 0 };
      entry.count++;
      entry.totalRating += m.voteAverage;
      decades.set(d, entry);
    }
    const eligible = [...decades.entries()].filter(([, v]) => v.count >= 2);
    if (eligible.length === 0) return null;
    const best = eligible.reduce((a, b) =>
      (b[1].totalRating / b[1].count) > (a[1].totalRating / a[1].count) ? b : a
    );
    return best[0];
  });

  readonly bestFilm = computed(() => {
    const rated = this.films().filter((m) => m.voteAverage > 0);
    if (rated.length === 0) return null;
    return rated.reduce((best, m) => m.voteAverage > best.voteAverage ? m : best);
  });

  readonly careerTimeline = computed(() => {
    const f = this.films();
    if (f.length === 0) return [];
    const decades = new Map<number, { count: number; totalRating: number; ratedCount: number }>();
    for (const m of f) {
      const d = Math.floor(m.year / 10) * 10;
      const entry = decades.get(d) ?? { count: 0, totalRating: 0, ratedCount: 0 };
      entry.count++;
      if (m.voteAverage > 0) {
        entry.totalRating += m.voteAverage;
        entry.ratedCount++;
      }
      decades.set(d, entry);
    }
    const maxCount = Math.max(1, ...[...decades.values()].map((v) => v.count));
    return [...decades.entries()]
      .map(([decade, data]) => ({
        decade,
        count: data.count,
        avgRating: data.ratedCount > 0 ? (data.totalRating / data.ratedCount).toFixed(1) : '—',
        barHeight: Math.max(20, (data.count / maxCount) * 80),
      }))
      .sort((a, b) => a.decade - b.decade);
  });

  readonly topDirectors = computed(() => {
    const counts = new Map<string, number>();
    for (const m of this.films()) {
      for (const d of m.directors) counts.set(d, (counts.get(d) ?? 0) + 1);
    }
    return [...counts.entries()]
      .filter(([, c]) => c >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  });

  async ngOnInit(): Promise<void> {
    await this.catalog.load();
    this.titleService.setTitle(`${this.name()} — BW Cinema`);
    const actorDesc = `Films starring ${this.name()} — explore their classic black-and-white filmography on BW Cinema.`;
    this.metaService.updateTag({ name: 'description', content: actorDesc });
    this.metaService.updateTag({ property: 'og:description', content: actorDesc });
    this.metaService.updateTag({ name: 'twitter:description', content: actorDesc });

    try {
      // Search TMDB for the person (1 API call)
      const searchResult = await firstValueFrom(
        this.http.get<{ results: { id: number; name: string; profile_path: string | null }[] }>(
          `https://api.themoviedb.org/3/search/person?query=${encodeURIComponent(this.name())}`
        )
      );

      const person = searchResult.results.find(
        (p) => p.name.toLowerCase() === this.name().toLowerCase()
      ) ?? searchResult.results[0];

      if (!person) {
        this.searching.set(false);
        return;
      }

      if (person.profile_path) {
        this.photoUrl.set(`https://image.tmdb.org/t/p/w185${person.profile_path}`);
      }

      // Get their movie credits (1 API call)
      const credits = await firstValueFrom(
        this.http.get<{ cast: { id: number }[] }>(
          `https://api.themoviedb.org/3/person/${person.id}/movie_credits`
        )
      );

      // Cross-reference TMDB movie IDs with our catalog
      const tmdbIds = new Set(credits.cast.map((c) => String(c.id)));
      const movies = this.catalog.movies();
      const matchIds = new Set<string>();
      for (const m of movies) {
        if (m.tmdbId && tmdbIds.has(m.tmdbId)) {
          matchIds.add(m.id);
        }
      }
      this.actorFilmIds.set(matchIds);
    } catch {
      // TMDB lookup failed — no results
    }
    this.searching.set(false);
  }

  addUnwatchedToWatchlist(): void {
    for (const m of this.unwatchedFilms()) {
      this.collectionService.addToWatchlist(m.id);
    }
  }
}
