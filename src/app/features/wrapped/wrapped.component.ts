import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CatalogService } from '../../core/services/catalog.service';
import { CollectionService } from '../../core/services/collection.service';
import { NotificationService } from '../../core/services/notification.service';
import { MovieGridComponent } from '../../shared/components/movie-grid.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import type { MovieSummary } from '../../core/models/movie.model';

interface WrappedStats {
  totalFilms: number;
  totalHours: number;
  avgRating: number;
  ratedCount: number;
  topGenres: { name: string; count: number }[];
  topDirectors: { name: string; count: number }[];
  topDecades: { decade: number; count: number }[];
  oldestFilm: MovieSummary | null;
  newestFilm: MovieSummary | null;
  highestRated: MovieSummary | null;
  firstWatched: MovieSummary | null;
  monthlyBreakdown: { month: string; count: number }[];
  favoriteCount: number;
  reviewCount: number;
}

@Component({
  selector: 'app-wrapped',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MovieGridComponent, LoadingSpinnerComponent],
  template: `
    @if (catalog.loading()) {
      <div class="wrapped container">
        <app-loading-spinner />
      </div>
    } @else {
      <div class="wrapped container">
        <div class="wrapped__header">
          <p class="wrapped__eyebrow">Year in Review</p>
          <h1 class="wrapped__title">{{ selectedYear() }} Wrapped</h1>
          <div class="wrapped__year-select">
            @for (yr of availableYears(); track yr) {
              <button
                class="wrapped__year-btn"
                [class.wrapped__year-btn--active]="yr === selectedYear()"
                (click)="selectedYear.set(yr)"
              >{{ yr }}</button>
            }
          </div>
          @if (stats().totalFilms > 0) {
            <div class="wrapped__share">
              <button class="wrapped__share-btn" (click)="shareWrapped()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                Share Your Wrapped
              </button>
            </div>
          }
        </div>

        @if (stats().totalFilms === 0) {
          <div class="wrapped__empty">
            <p class="wrapped__empty-title">No films watched in {{ selectedYear() }}</p>
            <p class="wrapped__empty-text">Start watching to see your year in review!</p>
            <a class="btn-primary" routerLink="/browse">Browse Films</a>
          </div>
        } @else {
          <div class="wrapped__hero-stats">
            <div class="wrapped__hero-stat">
              <span class="wrapped__hero-value">{{ stats().totalFilms }}</span>
              <span class="wrapped__hero-label">Films Watched</span>
            </div>
            <div class="wrapped__hero-stat">
              <span class="wrapped__hero-value">{{ stats().avgRating > 0 ? stats().avgRating.toFixed(1) : '—' }}</span>
              <span class="wrapped__hero-label">Avg Rating</span>
            </div>
            <div class="wrapped__hero-stat">
              <span class="wrapped__hero-value">{{ stats().favoriteCount }}</span>
              <span class="wrapped__hero-label">Favorites</span>
            </div>
            <div class="wrapped__hero-stat">
              <span class="wrapped__hero-value">{{ stats().reviewCount }}</span>
              <span class="wrapped__hero-label">Reviews</span>
            </div>
            @if (languagesWatched() > 1) {
              <div class="wrapped__hero-stat">
                <span class="wrapped__hero-value">{{ languagesWatched() }}</span>
                <span class="wrapped__hero-label">Languages</span>
              </div>
            }
            @if (busiestMonth(); as bm) {
              <div class="wrapped__hero-stat">
                <span class="wrapped__hero-value">{{ bm.name }}</span>
                <span class="wrapped__hero-label">Busiest Month ({{ bm.count }})</span>
              </div>
            }
            @if (longestStreak() > 1) {
              <div class="wrapped__hero-stat">
                <span class="wrapped__hero-value">{{ longestStreak() }}</span>
                <span class="wrapped__hero-label">Month Streak</span>
              </div>
            }
            @if (directorsExplored() > 1) {
              <div class="wrapped__hero-stat">
                <span class="wrapped__hero-value">{{ directorsExplored() }}</span>
                <span class="wrapped__hero-label">Directors</span>
              </div>
            }
            @if (genresExplored() > 1) {
              <div class="wrapped__hero-stat">
                <span class="wrapped__hero-value">{{ genresExplored() }}</span>
                <span class="wrapped__hero-label">Genres</span>
              </div>
            }
            @if (decadeSpan(); as ds) {
              <div class="wrapped__hero-stat wrapped__hero-stat--text">
                <span class="wrapped__hero-value">{{ ds }}</span>
                <span class="wrapped__hero-label">Decade Span</span>
              </div>
            }
            @if (streamablePct() > 0 && streamablePct() < 100) {
              <div class="wrapped__hero-stat">
                <span class="wrapped__hero-value">{{ streamablePct() }}%</span>
                <span class="wrapped__hero-label">Free to Stream</span>
              </div>
            }
            @if (uniqueDecadeCount() > 1) {
              <div class="wrapped__hero-stat">
                <span class="wrapped__hero-value">{{ uniqueDecadeCount() }}</span>
                <span class="wrapped__hero-label">Decades Covered</span>
              </div>
            }
            @if (avgFilmAge() > 0) {
              <div class="wrapped__hero-stat">
                <span class="wrapped__hero-value">{{ avgFilmAge() }}</span>
                <span class="wrapped__hero-label">Avg Film Age (yrs)</span>
              </div>
            }
            @if (avgCatalogRating(); as acr) {
              <div class="wrapped__hero-stat">
                <span class="wrapped__hero-value">{{ acr }}</span>
                <span class="wrapped__hero-label">Avg TMDb Rating</span>
              </div>
            }
            @if (mostWatchedDecadeName(); as mwd) {
              <div class="wrapped__hero-stat wrapped__hero-stat--text">
                <span class="wrapped__hero-value">{{ mwd }}</span>
                <span class="wrapped__hero-label">Top Decade</span>
              </div>
            }
            @if (silentEraWatched() > 0) {
              <div class="wrapped__hero-stat">
                <span class="wrapped__hero-value">{{ silentEraWatched() }}</span>
                <span class="wrapped__hero-label">Silent Era Films</span>
              </div>
            }
            @if (mostWatchedGenreName(); as mwg) {
              <div class="wrapped__hero-stat wrapped__hero-stat--text">
                <span class="wrapped__hero-value">{{ mwg }}</span>
                <span class="wrapped__hero-label">Top Genre</span>
              </div>
            }
            @if (oldestFilmAge(); as ofa) {
              <div class="wrapped__hero-stat">
                <span class="wrapped__hero-value">{{ ofa }}</span>
                <span class="wrapped__hero-label">Oldest Film (yrs)</span>
              </div>
            }
            @if (avgUserRating(); as aur) {
              <div class="wrapped__hero-stat">
                <span class="wrapped__hero-value">{{ aur }}</span>
                <span class="wrapped__hero-label">Avg Your Rating</span>
              </div>
            }
            @if (newestFilmWatched(); as nfw) {
              <div class="wrapped__hero-stat">
                <span class="wrapped__hero-value">{{ nfw }}</span>
                <span class="wrapped__hero-label">Newest Film</span>
              </div>
            }
            @if (coDirectedCount() > 0) {
              <div class="wrapped__hero-stat">
                <span class="wrapped__hero-value">{{ coDirectedCount() }}</span>
                <span class="wrapped__hero-label">Co-directed Films</span>
              </div>
            }
            @if (repeatDirectorCount() > 0) {
              <div class="wrapped__hero-stat">
                <span class="wrapped__hero-value">{{ repeatDirectorCount() }}</span>
                <span class="wrapped__hero-label">Repeat Directors</span>
              </div>
            }
            @if (nonEnglishWatchedCount() > 0) {
              <div class="wrapped__hero-stat">
                <span class="wrapped__hero-value">{{ nonEnglishWatchedCount() }}</span>
                <span class="wrapped__hero-label">Non-English Films</span>
              </div>
            }
            @if (medianRating(); as mr) {
              <div class="wrapped__hero-stat">
                <span class="wrapped__hero-value">{{ mr }}</span>
                <span class="wrapped__hero-label">Median Rating</span>
              </div>
            }
            @if (silentEraWatchedPct(); as sewp) {
              <div class="wrapped__hero-stat">
                <span class="wrapped__hero-value">{{ sewp }}%</span>
                <span class="wrapped__hero-label">Silent Era</span>
              </div>
            }
            @if (uniqueGenrePct(); as ugp) {
              <div class="wrapped__hero-stat">
                <span class="wrapped__hero-value">{{ ugp }}%</span>
                <span class="wrapped__hero-label">Genres explored</span>
              </div>
            }
            @if (coDirectedPct(); as cdp) {
              <div class="wrapped__hero-stat">
                <span class="wrapped__hero-value">{{ cdp }}%</span>
                <span class="wrapped__hero-label">Co-directed</span>
              </div>
            }
          </div>

          <div class="wrapped__cards">
            @if (stats().topGenres.length > 0) {
              <div class="wrapped__card">
                <h3 class="wrapped__card-title">Top Genres</h3>
                <div class="wrapped__bars">
                  @for (g of stats().topGenres.slice(0, 5); track g.name) {
                    <div class="wrapped__bar-row">
                      <a class="wrapped__bar-label wrapped__bar-label--link" [routerLink]="['/genre', g.name]">{{ g.name }}</a>
                      <div class="wrapped__bar-track">
                        <div class="wrapped__bar-fill" [style.width.%]="barWidth(g.count)"></div>
                      </div>
                      <span class="wrapped__bar-value">{{ g.count }}</span>
                    </div>
                  }
                </div>
              </div>
            }

            @if (stats().topDirectors.length > 0) {
              <div class="wrapped__card">
                <h3 class="wrapped__card-title">Top Directors</h3>
                <div class="wrapped__bars">
                  @for (d of stats().topDirectors.slice(0, 5); track d.name) {
                    <div class="wrapped__bar-row">
                      <a class="wrapped__bar-label wrapped__bar-label--link" [routerLink]="['/director', d.name]">{{ d.name }}</a>
                      <div class="wrapped__bar-track">
                        <div class="wrapped__bar-fill" [style.width.%]="barWidth(d.count)"></div>
                      </div>
                      <span class="wrapped__bar-value">{{ d.count }}</span>
                    </div>
                  }
                </div>
              </div>
            }

            @if (stats().topDecades.length > 0) {
              <div class="wrapped__card">
                <h3 class="wrapped__card-title">Decades Explored</h3>
                <div class="wrapped__bars">
                  @for (d of stats().topDecades.slice(0, 5); track d.decade) {
                    <div class="wrapped__bar-row">
                      <a class="wrapped__bar-label wrapped__bar-label--link" [routerLink]="['/decade', d.decade]">{{ d.decade }}s</a>
                      <div class="wrapped__bar-track">
                        <div class="wrapped__bar-fill" [style.width.%]="barWidth(d.count)"></div>
                      </div>
                      <span class="wrapped__bar-value">{{ d.count }}</span>
                    </div>
                  }
                </div>
              </div>
            }

            <div class="wrapped__card">
              <h3 class="wrapped__card-title">Monthly Activity</h3>
              <div class="wrapped__months">
                @for (m of stats().monthlyBreakdown; track m.month) {
                  <div class="wrapped__month">
                    <div class="wrapped__month-bar" [style.height.%]="monthHeight(m.count)"></div>
                    <span class="wrapped__month-label">{{ m.month }}</span>
                    @if (m.count > 0) {
                      <span class="wrapped__month-count">{{ m.count }}</span>
                    }
                  </div>
                }
              </div>
            </div>
          </div>

          <div class="wrapped__highlights">
            @if (stats().oldestFilm; as film) {
              <a class="wrapped__highlight" [routerLink]="['/movie', film.id]">
                @if (film.posterUrl) {
                  <img class="wrapped__highlight-poster" [src]="film.posterUrl" [alt]="film.title" loading="lazy" />
                } @else {
                  <div class="wrapped__highlight-placeholder">{{ film.year }}</div>
                }
                <div class="wrapped__highlight-text">
                  <span class="wrapped__highlight-label">Oldest Film</span>
                  <span class="wrapped__highlight-title">{{ film.title }}</span>
                  <span class="wrapped__highlight-meta">{{ film.year }}</span>
                </div>
              </a>
            }
            @if (stats().newestFilm; as film) {
              <a class="wrapped__highlight" [routerLink]="['/movie', film.id]">
                @if (film.posterUrl) {
                  <img class="wrapped__highlight-poster" [src]="film.posterUrl" [alt]="film.title" loading="lazy" />
                } @else {
                  <div class="wrapped__highlight-placeholder">{{ film.year }}</div>
                }
                <div class="wrapped__highlight-text">
                  <span class="wrapped__highlight-label">Most Recent Film</span>
                  <span class="wrapped__highlight-title">{{ film.title }}</span>
                  <span class="wrapped__highlight-meta">{{ film.year }}</span>
                </div>
              </a>
            }
            @if (stats().highestRated; as film) {
              <a class="wrapped__highlight" [routerLink]="['/movie', film.id]">
                @if (film.posterUrl) {
                  <img class="wrapped__highlight-poster" [src]="film.posterUrl" [alt]="film.title" loading="lazy" />
                } @else {
                  <div class="wrapped__highlight-placeholder">&#9733;</div>
                }
                <div class="wrapped__highlight-text">
                  <span class="wrapped__highlight-label">Your Highest Rated</span>
                  <span class="wrapped__highlight-title">{{ film.title }}</span>
                  @if (highestRating(); as rating) {
                    <span class="wrapped__highlight-meta">{{ rating }}/10</span>
                  }
                </div>
              </a>
            }
            @if (stats().firstWatched; as film) {
              <a class="wrapped__highlight" [routerLink]="['/movie', film.id]">
                @if (film.posterUrl) {
                  <img class="wrapped__highlight-poster" [src]="film.posterUrl" [alt]="film.title" loading="lazy" />
                } @else {
                  <div class="wrapped__highlight-placeholder">#1</div>
                }
                <div class="wrapped__highlight-text">
                  <span class="wrapped__highlight-label">First Film of {{ selectedYear() }}</span>
                  <span class="wrapped__highlight-title">{{ film.title }}</span>
                  <span class="wrapped__highlight-meta">{{ film.year }}</span>
                </div>
              </a>
            }
          </div>

          @if (avgWatchedYear(); as awy) {
            <p class="wrapped__decade-range">Average release year of your picks: {{ awy }}</p>
          }

          @if (yearFilms().length > 0) {
            <section class="wrapped__films">
              <h2>All Films Watched in {{ selectedYear() }}</h2>
              <app-movie-grid [movies]="yearFilms()" />
            </section>
          }
        }
      </div>
    }
  `,
  styles: [`
    .wrapped { padding: var(--space-xl) 0 var(--space-3xl); }
    .wrapped__header { text-align: center; margin-bottom: var(--space-2xl); }
    .wrapped__eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.2em;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--accent-gold);
      margin: 0 0 var(--space-sm);
    }
    .wrapped__title {
      font-size: 2.8rem;
      font-weight: 900;
      background: linear-gradient(180deg, var(--text-primary) 40%, var(--accent-gold) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: var(--space-lg);
    }
    .wrapped__year-select {
      display: flex;
      gap: var(--space-xs);
      justify-content: center;
      flex-wrap: wrap;
    }
    .wrapped__year-btn {
      padding: 6px 16px;
      border-radius: 20px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .wrapped__year-btn:hover {
      border-color: var(--accent-gold);
      color: var(--accent-gold);
    }
    .wrapped__year-btn--active {
      background: var(--accent-gold-dim);
      border-color: var(--accent-gold);
      color: var(--accent-gold);
    }
    .wrapped__share {
      margin-top: var(--space-lg);
    }
    .wrapped__share-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-sm);
      padding: 8px 20px;
      background: var(--accent-gold-dim);
      border: 1px solid var(--accent-gold);
      border-radius: 20px;
      color: var(--accent-gold);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .wrapped__share-btn:hover {
      background: var(--accent-gold);
      color: var(--bg-deep);
    }
    .wrapped__empty {
      text-align: center;
      padding: var(--space-3xl) 0;
    }
    .wrapped__empty-title {
      font-family: var(--font-heading);
      font-size: 1.3rem;
      margin-bottom: var(--space-sm);
    }
    .wrapped__empty-text {
      color: var(--text-tertiary);
      margin-bottom: var(--space-lg);
    }
    .wrapped__hero-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: var(--space-md);
      margin-bottom: var(--space-2xl);
    }
    .wrapped__hero-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--space-lg);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
    }
    .wrapped__hero-value {
      font-family: var(--font-heading);
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--accent-gold);
      line-height: 1;
      margin-bottom: var(--space-xs);
    }
    .wrapped__hero-label {
      font-size: 0.8rem;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 600;
    }
    .wrapped__cards {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-lg);
      margin-bottom: var(--space-2xl);
    }
    .wrapped__card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: var(--space-lg);
    }
    .wrapped__card-title {
      font-size: 1rem;
      margin: 0 0 var(--space-md);
      color: var(--text-primary);
    }
    .wrapped__bars {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }
    .wrapped__bar-row {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }
    .wrapped__bar-label {
      font-size: 0.85rem;
      color: var(--text-secondary);
      min-width: 90px;
      flex-shrink: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .wrapped__bar-label--link {
      text-decoration: none;
      color: var(--text-secondary);
      transition: color 0.2s;
    }
    .wrapped__bar-label--link:hover {
      color: var(--accent-gold);
    }
    .wrapped__bar-track {
      flex: 1;
      height: 8px;
      background: var(--bg-raised);
      border-radius: 4px;
      overflow: hidden;
    }
    .wrapped__bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent-gold), #c49b2c);
      border-radius: 4px;
      min-width: 4px;
      transition: width 0.4s ease;
    }
    .wrapped__bar-value {
      font-size: 0.8rem;
      color: var(--accent-gold);
      font-weight: 600;
      min-width: 24px;
      text-align: right;
    }
    .wrapped__months {
      display: flex;
      align-items: flex-end;
      gap: 4px;
      height: 120px;
    }
    .wrapped__month {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      height: 100%;
      position: relative;
    }
    .wrapped__month-bar {
      width: 100%;
      background: linear-gradient(0deg, var(--accent-gold), #c49b2c);
      border-radius: 3px 3px 0 0;
      min-height: 2px;
      transition: height 0.4s ease;
    }
    .wrapped__month-label {
      font-size: 0.65rem;
      color: var(--text-tertiary);
      margin-top: 4px;
    }
    .wrapped__month-count {
      position: absolute;
      top: -16px;
      font-size: 0.65rem;
      color: var(--accent-gold);
      font-weight: 600;
    }
    .wrapped__highlights {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-md);
      margin-bottom: var(--space-2xl);
    }
    .wrapped__highlight {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-md) var(--space-lg);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      text-decoration: none;
      color: inherit;
      transition: border-color 0.2s, background-color 0.2s;
    }
    .wrapped__highlight:hover {
      border-color: var(--accent-gold);
      background: var(--bg-raised);
      color: inherit;
    }
    .wrapped__highlight-poster {
      width: 48px;
      height: 72px;
      object-fit: cover;
      border-radius: var(--radius-sm);
      flex-shrink: 0;
    }
    .wrapped__highlight-placeholder {
      width: 48px;
      height: 72px;
      background: var(--bg-raised);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-heading);
      font-size: 0.85rem;
      color: var(--accent-gold);
      flex-shrink: 0;
    }
    .wrapped__highlight-text {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .wrapped__highlight-label {
      font-size: 0.75rem;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: 600;
    }
    .wrapped__highlight-title {
      font-family: var(--font-heading);
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .wrapped__highlight:hover .wrapped__highlight-title {
      color: var(--accent-gold);
    }
    .wrapped__highlight-meta {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
    .wrapped__films {
      margin-top: var(--space-xl);
    }
    .wrapped__films h2 {
      margin-bottom: var(--space-lg);
    }
    .wrapped__hero-stat--text .wrapped__hero-value {
      font-size: 1.5rem;
    }
    @media (max-width: 768px) {
      .wrapped__title { font-size: 2rem; }
      .wrapped__hero-stats { grid-template-columns: repeat(2, 1fr); }
      .wrapped__hero-value { font-size: 2rem; }
      .wrapped__cards { grid-template-columns: 1fr; }
      .wrapped__highlights { grid-template-columns: 1fr; }
    }
    @media (max-width: 480px) {
      .wrapped__title { font-size: 1.6rem; }
      .wrapped__hero-value { font-size: 1.6rem; }
      .wrapped__bar-label { min-width: 70px; font-size: 0.8rem; }
    }
  `],
})
export class WrappedComponent implements OnInit {
  protected readonly catalog = inject(CatalogService);
  private readonly collection = inject(CollectionService);
  private readonly titleService = inject(Title);
  private readonly notifications = inject(NotificationService);

  readonly selectedYear = signal(new Date().getFullYear());

  readonly availableYears = computed(() => {
    const watched = this.collection.watched();
    const years = new Set(watched.map((w) => new Date(w.watchedAt).getFullYear()));
    return [...years].sort((a, b) => b - a);
  });

  readonly yearWatched = computed(() => {
    const year = this.selectedYear();
    return this.collection.watched().filter((w) => {
      const d = new Date(w.watchedAt);
      return d.getFullYear() === year;
    });
  });

  readonly yearFilms = computed(() => {
    const movies = this.catalog.movies();
    const movieMap = new Map(movies.map((m) => [m.id, m]));
    return this.yearWatched()
      .map((w) => movieMap.get(w.movieId))
      .filter((m): m is MovieSummary => !!m);
  });

  readonly stats = computed((): WrappedStats => {
    const watched = this.yearWatched();
    const films = this.yearFilms();
    const favorites = this.collection.favoriteIds();

    if (films.length === 0) {
      return {
        totalFilms: 0, totalHours: 0, avgRating: 0, ratedCount: 0,
        topGenres: [], topDirectors: [], topDecades: [],
        oldestFilm: null, newestFilm: null, highestRated: null, firstWatched: null,
        monthlyBreakdown: this.emptyMonths(), favoriteCount: 0, reviewCount: 0,
      };
    }

    // Genre counts
    const genreMap = new Map<string, number>();
    films.forEach((f) => f.genres.forEach((g) => genreMap.set(g, (genreMap.get(g) ?? 0) + 1)));
    const topGenres = [...genreMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Director counts
    const dirMap = new Map<string, number>();
    films.forEach((f) => f.directors.forEach((d) => dirMap.set(d, (dirMap.get(d) ?? 0) + 1)));
    const topDirectors = [...dirMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Decade counts
    const decMap = new Map<number, number>();
    films.forEach((f) => {
      const decade = Math.floor(f.year / 10) * 10;
      decMap.set(decade, (decMap.get(decade) ?? 0) + 1);
    });
    const topDecades = [...decMap.entries()]
      .map(([decade, count]) => ({ decade, count }))
      .sort((a, b) => b.count - a.count);

    // Ratings
    const rated = watched.filter((w) => w.userRating !== null && w.userRating > 0);
    const avgRating = rated.length > 0
      ? rated.reduce((sum, w) => sum + (w.userRating ?? 0), 0) / rated.length
      : 0;

    // Find highest user-rated film
    const highestRatedWatched = rated.sort((a, b) => (b.userRating ?? 0) - (a.userRating ?? 0))[0];
    const movieMap = new Map(films.map((m) => [m.id, m]));
    const highestRated = highestRatedWatched ? movieMap.get(highestRatedWatched.movieId) ?? null : null;

    // Oldest / newest film by release year
    const sortedByYear = [...films].sort((a, b) => a.year - b.year);
    const oldestFilm = sortedByYear[0] ?? null;
    const newestFilm = sortedByYear[sortedByYear.length - 1] ?? null;

    // First watched
    const sortedByDate = [...watched].sort((a, b) => a.watchedAt - b.watchedAt);
    const firstWatched = sortedByDate.length > 0 ? movieMap.get(sortedByDate[0].movieId) ?? null : null;

    // Monthly breakdown
    const months = this.emptyMonths();
    watched.forEach((w) => {
      const month = new Date(w.watchedAt).getMonth();
      months[month].count++;
    });

    // Favorites & reviews
    const favoriteCount = films.filter((f) => favorites.has(f.id)).length;
    const reviewCount = watched.filter((w) => w.review && w.review.trim().length > 0).length;

    return {
      totalFilms: films.length,
      totalHours: 0,
      avgRating,
      ratedCount: rated.length,
      topGenres,
      topDirectors,
      topDecades,
      oldestFilm,
      newestFilm,
      highestRated,
      firstWatched,
      monthlyBreakdown: months,
      favoriteCount,
      reviewCount,
    };
  });

  readonly languagesWatched = computed(() => {
    const films = this.yearFilms();
    const langs = new Set(films.map((m) => m.language).filter(Boolean));
    return langs.size;
  });

  readonly highestRating = computed(() => {
    const watched = this.yearWatched();
    const rated = watched.filter((w) => w.userRating !== null && w.userRating > 0);
    if (rated.length === 0) return null;
    const best = rated.reduce((a, b) => ((b.userRating ?? 0) > (a.userRating ?? 0) ? b : a));
    return best.userRating;
  });

  readonly busiestMonth = computed((): { name: string; count: number } | null => {
    const months = this.stats().monthlyBreakdown;
    const fullNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let best: { name: string; count: number } | null = null;
    months.forEach((m, i) => {
      if (m.count > 0 && (!best || m.count > best.count)) {
        best = { name: fullNames[i], count: m.count };
      }
    });
    return best;
  });

  readonly longestStreak = computed(() => {
    const months = this.stats().monthlyBreakdown;
    let max = 0;
    let current = 0;
    for (const m of months) {
      if (m.count > 0) {
        current++;
        if (current > max) max = current;
      } else {
        current = 0;
      }
    }
    return max;
  });

  readonly directorsExplored = computed(() => {
    const films = this.yearFilms();
    const dirs = new Set<string>();
    for (const f of films) {
      for (const d of f.directors) dirs.add(d);
    }
    return dirs.size;
  });

  readonly genresExplored = computed(() => {
    const genres = new Set<string>();
    for (const f of this.yearFilms()) {
      for (const g of f.genres) genres.add(g);
    }
    return genres.size;
  });

  readonly decadeSpan = computed(() => {
    const films = this.yearFilms();
    if (films.length < 2) return null;
    const decades = new Set(films.map((m) => Math.floor(m.year / 10) * 10));
    if (decades.size < 2) return null;
    const sorted = [...decades].sort((a, b) => a - b);
    return `${sorted[0]}s–${sorted[sorted.length - 1]}s`;
  });

  readonly streamablePct = computed(() => {
    const films = this.yearFilms();
    if (films.length === 0) return 0;
    const streamable = films.filter((m) => m.isStreamable).length;
    return Math.round((streamable / films.length) * 100);
  });

  readonly uniqueDecadeCount = computed(() => {
    const films = this.yearFilms();
    if (films.length < 2) return 0;
    return new Set(films.map((m) => Math.floor(m.year / 10) * 10)).size;
  });

  readonly mostWatchedDecadeName = computed(() => {
    const films = this.yearFilms();
    if (films.length < 3) return null;
    const counts = new Map<number, number>();
    for (const m of films) {
      const d = Math.floor(m.year / 10) * 10;
      counts.set(d, (counts.get(d) ?? 0) + 1);
    }
    const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (!best || best[1] < 2) return null;
    return `${best[0]}s`;
  });

  readonly avgCatalogRating = computed(() => {
    const films = this.yearFilms();
    const rated = films.filter((m) => m.voteAverage > 0);
    if (rated.length < 3) return null;
    return (rated.reduce((s, m) => s + m.voteAverage, 0) / rated.length).toFixed(1);
  });

  readonly oldestFilmAge = computed(() => {
    const films = this.yearFilms();
    if (films.length < 2) return null;
    const year = this.selectedYear();
    const oldest = Math.min(...films.map((m) => m.year));
    const age = year - oldest;
    return age >= 50 ? age : null;
  });

  readonly mostWatchedGenreName = computed(() => {
    const films = this.yearFilms();
    if (films.length < 3) return null;
    const counts = new Map<string, number>();
    for (const m of films) {
      for (const g of m.genres) counts.set(g, (counts.get(g) ?? 0) + 1);
    }
    const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (!best || best[1] < 2) return null;
    return best[0];
  });

  readonly newestFilmWatched = computed(() => {
    const films = this.yearFilms();
    if (films.length < 2) return null;
    const newest = Math.max(...films.map((m) => m.year));
    const oldest = Math.min(...films.map((m) => m.year));
    return newest - oldest >= 10 ? newest : null;
  });

  readonly avgUserRating = computed(() => {
    const watched = this.yearWatched();
    const rated = watched.filter((w) => w.userRating != null && w.userRating > 0);
    if (rated.length < 3) return null;
    return (rated.reduce((s, w) => s + (w.userRating ?? 0), 0) / rated.length).toFixed(1);
  });

  readonly silentEraWatched = computed(() => {
    return this.yearFilms().filter((m) => m.year < 1930).length;
  });

  readonly coDirectedCount = computed(() => {
    return this.yearFilms().filter((m) => m.directors.length > 1).length;
  });

  readonly repeatDirectorCount = computed(() => {
    const films = this.yearFilms();
    if (films.length < 3) return 0;
    const counts = new Map<string, number>();
    for (const m of films) {
      for (const d of m.directors) counts.set(d, (counts.get(d) ?? 0) + 1);
    }
    let repeats = 0;
    for (const c of counts.values()) {
      if (c >= 2) repeats++;
    }
    return repeats;
  });

  readonly nonEnglishWatchedCount = computed(() => {
    const films = this.yearFilms();
    if (films.length < 3) return 0;
    return films.filter((m) => m.language && m.language !== 'English' && m.language !== 'en').length;
  });

  readonly medianRating = computed(() => {
    const rated = this.yearFilms().filter((m) => m.voteAverage > 0);
    if (rated.length < 3) return null;
    const sorted = rated.map((m) => m.voteAverage).sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    return median.toFixed(1);
  });

  readonly avgFilmAge = computed(() => {
    const films = this.yearFilms();
    const year = this.selectedYear();
    if (films.length < 2) return 0;
    const avg = films.reduce((s, m) => s + (year - m.year), 0) / films.length;
    return Math.round(avg);
  });

  private maxBarValue = computed(() => {
    const s = this.stats();
    const allCounts = [
      ...s.topGenres.map((g) => g.count),
      ...s.topDirectors.map((d) => d.count),
      ...s.topDecades.map((d) => d.count),
    ];
    return Math.max(1, ...allCounts);
  });

  ngOnInit(): void {
    this.catalog.load();
    this.titleService.setTitle('Year in Review — BW Cinema');
    // Auto-select the most recent year with data
    const years = this.availableYears();
    if (years.length > 0) {
      this.selectedYear.set(years[0]);
    }
  }

  barWidth(count: number): number {
    return (count / this.maxBarValue()) * 100;
  }

  monthHeight(count: number): number {
    const max = Math.max(1, ...this.stats().monthlyBreakdown.map((m) => m.count));
    return count === 0 ? 2 : (count / max) * 85;
  }

  shareWrapped(): void {
    const s = this.stats();
    const year = this.selectedYear();
    const topGenre = s.topGenres[0]?.name ?? '';
    const topDirector = s.topDirectors[0]?.name ?? '';
    const text = [
      `My ${year} BW Cinema Wrapped:`,
      `${s.totalFilms} classic B&W films watched`,
      s.avgRating > 0 ? `Average rating: ${s.avgRating.toFixed(1)}/10` : '',
      topGenre ? `Favorite genre: ${topGenre}` : '',
      topDirector ? `Most watched director: ${topDirector}` : '',
      `${s.favoriteCount} favorites, ${s.reviewCount} reviews`,
      '',
      'bw-cinema.app/wrapped',
    ].filter(Boolean).join('\n');

    if (navigator.share) {
      navigator.share({ title: `${year} BW Cinema Wrapped`, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(
        () => this.notifications.show('Wrapped stats copied to clipboard!', 'success'),
        () => this.notifications.show('Failed to copy', 'error'),
      );
    }
  }

  readonly uniqueGenrePct = computed(() => {
    const films = this.yearFilms();
    if (films.length < 5) return null;
    const allGenres = new Set(this.catalog.movies().flatMap((m) => m.genres));
    if (allGenres.size === 0) return null;
    const watchedGenres = new Set(films.flatMap((m) => m.genres));
    const pct = Math.round((watchedGenres.size / allGenres.size) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });

  readonly coDirectedPct = computed(() => {
    const films = this.yearFilms();
    if (films.length < 5) return null;
    const count = films.filter((m) => m.directors.length > 1).length;
    const pct = Math.round((count / films.length) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });

  readonly silentEraWatchedPct = computed(() => {
    const films = this.yearFilms();
    if (films.length < 5) return null;
    const count = films.filter((m) => m.year < 1930).length;
    const pct = Math.round((count / films.length) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });

  readonly avgWatchedYear = computed(() => {
    const films = this.yearFilms();
    if (films.length < 3) return null;
    const avg = Math.round(films.reduce((s, m) => s + m.year, 0) / films.length);
    return avg;
  });

  private emptyMonths(): { month: string; count: number }[] {
    const names = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    return names.map((month) => ({ month, count: 0 }));
  }
}
