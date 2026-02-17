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
            <div class="decade__stat">
              <span class="decade__stat-value">{{ languageCount() }}</span>
              <span class="decade__stat-label">Languages</span>
            </div>
            <div class="decade__stat">
              <span class="decade__stat-value">{{ streamablePct() }}%</span>
              <span class="decade__stat-label">Streamable</span>
            </div>
            <div class="decade__stat">
              <span class="decade__stat-value">{{ directorCount() }}</span>
              <span class="decade__stat-label">Directors</span>
            </div>
            @if (peakYear(); as py) {
              <div class="decade__stat">
                <span class="decade__stat-value">{{ py.year }}</span>
                <span class="decade__stat-label">Peak Year ({{ py.count }})</span>
              </div>
            }
            @if (ratingVsCatalog(); as rv) {
              <div class="decade__stat">
                <span class="decade__stat-value" [class.decade__stat-value--positive]="rv.startsWith('+')">{{ rv }}</span>
                <span class="decade__stat-label">vs Catalog Avg</span>
              </div>
            }
            @if (coDirectedCount() > 0) {
              <div class="decade__stat">
                <span class="decade__stat-value">{{ coDirectedCount() }}</span>
                <span class="decade__stat-label">Co-Directed</span>
              </div>
            }
            @if (mostProlificDirector(); as mpd) {
              <a class="decade__stat decade__stat--link" [routerLink]="['/director', mpd.name]">
                <span class="decade__stat-value">{{ mpd.count }}</span>
                <span class="decade__stat-label">{{ mpd.name }}</span>
              </a>
            }
            @if (uniqueGenreCount() > 1) {
              <div class="decade__stat">
                <span class="decade__stat-value">{{ uniqueGenreCount() }}</span>
                <span class="decade__stat-label">Genres</span>
              </div>
            }
            @if (silentEraFilmCount() > 0) {
              <div class="decade__stat">
                <span class="decade__stat-value">{{ silentEraFilmCount() }}</span>
                <span class="decade__stat-label">Silent Era</span>
              </div>
            }
            @if (avgFilmsPerDirector(); as afpd) {
              <div class="decade__stat">
                <span class="decade__stat-value">{{ afpd }}</span>
                <span class="decade__stat-label">Films/Director</span>
              </div>
            }
            @if (highRatedPct(); as hrp) {
              <div class="decade__stat">
                <span class="decade__stat-value">{{ hrp }}%</span>
                <span class="decade__stat-label">Rated 7.0+</span>
              </div>
            }
            @if (medianRating(); as mr) {
              <div class="decade__stat">
                <span class="decade__stat-value">{{ mr }}</span>
                <span class="decade__stat-label">Median Rating</span>
              </div>
            }
            @if (avgFilmAge() > 0) {
              <div class="decade__stat">
                <span class="decade__stat-value">{{ avgFilmAge() }}</span>
                <span class="decade__stat-label">Avg Film Age (yrs)</span>
              </div>
            }
            @if (nonEnglishCount() > 0) {
              <div class="decade__stat">
                <span class="decade__stat-value">{{ nonEnglishCount() }}</span>
                <span class="decade__stat-label">Non-English</span>
              </div>
            }
          </div>

          @if (decadeFact(); as fact) {
            <p class="decade__fact">{{ fact }}</p>
          }
          @if (longestTitle(); as lt) {
            <p class="decade__fact">Longest title: "{{ lt }}"</p>
          }
          @if (shortestTitle(); as st) {
            <p class="decade__fact">Shortest title: "{{ st }}"</p>
          }
          @if (medianRating(); as mr) {
            <p class="decade__fact">Median rating: &#9733; {{ mr }}</p>
          }
          @if (nonEnglishPct(); as nep) {
            <p class="decade__fact">{{ nep }}% non-English films</p>
          }
          @if (avgTitleLength(); as atl) {
            <p class="decade__fact">Avg title length: {{ atl }} characters</p>
          }
          @if (highlyRatedCount() > 0) {
            <p class="decade__fact">{{ highlyRatedCount() }} films rated 8.0+</p>
          }
          @if (streamableHighRatedCount() > 0) {
            <p class="decade__fact">{{ streamableHighRatedCount() }} highly-rated free to watch</p>
          }
          @if (topDirectorFilmCount(); as tdfc) {
            <p class="decade__fact">Top director: {{ tdfc.name }} ({{ tdfc.count }} films)</p>
          }
          @if (decadeTopGenre(); as dtg) {
            <p class="decade__fact">Top genre: {{ dtg }}</p>
          }
          @if (singleGenreCount()) {
            <p class="decade__fact">{{ singleGenreCount() }} single-genre films</p>
          }
          @if (coDirectedPct(); as cdp) {
            <p class="decade__fact">{{ cdp }}% co-directed</p>
          }
          @if (uniqueLanguageCount(); as ulc) {
            <p class="decade__fact">{{ ulc }} languages represented</p>
          }
          @if (bestRatedTitle(); as brt) {
            <p class="decade__fact">Highest rated: "{{ brt }}"</p>
          }
          @if (decadeDirectorCount(); as ddc) {
            <p class="decade__fact">{{ ddc }} unique directors</p>
          }

          @if (bestFilm(); as best) {
            <div class="decade__best-film">
              <a class="decade__best-film-card" [routerLink]="['/movie', best.id]">
                @if (best.posterUrl) {
                  <img class="decade__best-film-poster" [src]="best.posterUrl" [alt]="best.title" loading="lazy" />
                } @else {
                  <div class="decade__best-film-placeholder">{{ best.title[0] }}</div>
                }
                <div class="decade__best-film-info">
                  <span class="decade__best-film-label">Best of the {{ decadeLabel() }}</span>
                  <strong class="decade__best-film-title">{{ best.title }}</strong>
                  <span class="decade__best-film-meta">{{ best.year }} &middot; {{ best.directors.join(', ') }}</span>
                  @if (best.voteAverage > 0) {
                    <span class="decade__best-film-rating">&#9733; {{ best.voteAverage.toFixed(1) }}</span>
                  }
                </div>
              </a>
            </div>
          }

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

        <div class="decade__nav">
          @if (prevDecade()) {
            <a class="decade__nav-link" [routerLink]="['/decade', prevDecade()]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              {{ prevDecade() }}s
            </a>
          } @else {
            <span></span>
          }
          @if (nextDecade()) {
            <a class="decade__nav-link" [routerLink]="['/decade', nextDecade()]">
              {{ nextDecade() }}s
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </a>
          }
        </div>
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
    .decade__stat-value--positive {
      color: #198754;
    }
    .decade__stat--link {
      text-decoration: none;
      color: inherit;
      cursor: pointer;
      transition: border-color 0.2s;
    }
    .decade__stat--link:hover {
      border-color: var(--accent-gold);
    }
    .decade__fact {
      font-style: italic;
      color: var(--accent-gold);
      font-size: 0.95rem;
      margin: 0 0 var(--space-xl);
      padding: var(--space-sm) 0;
    }
    .decade__best-film {
      margin-bottom: var(--space-xl);
    }
    .decade__best-film-card {
      display: flex;
      align-items: center;
      gap: var(--space-lg);
      padding: var(--space-md);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      text-decoration: none;
      color: inherit;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .decade__best-film-card:hover {
      border-color: var(--accent-gold);
      box-shadow: var(--shadow-md);
      color: inherit;
    }
    .decade__best-film-poster {
      width: 60px;
      aspect-ratio: 2 / 3;
      object-fit: cover;
      border-radius: var(--radius);
      flex-shrink: 0;
    }
    .decade__best-film-placeholder {
      width: 60px;
      aspect-ratio: 2 / 3;
      background: var(--bg-raised);
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-heading);
      color: var(--text-tertiary);
      font-size: 1.2rem;
      flex-shrink: 0;
    }
    .decade__best-film-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .decade__best-film-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--accent-gold);
      font-weight: 600;
    }
    .decade__best-film-title {
      font-size: 1.1rem;
    }
    .decade__best-film-meta {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
    .decade__best-film-rating {
      font-family: var(--font-heading);
      font-size: 1rem;
      font-weight: 700;
      color: var(--accent-gold);
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
    .decade__nav {
      display: flex;
      justify-content: space-between;
      margin-top: var(--space-2xl);
      padding-top: var(--space-lg);
      border-top: 1px solid var(--border);
    }
    .decade__nav-link {
      display: inline-flex;
      align-items: center;
      gap: var(--space-xs);
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-decoration: none;
      transition: color 0.2s;
    }
    .decade__nav-link:hover {
      color: var(--accent-gold);
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

  readonly bestFilm = computed(() => {
    const rated = this.films().filter((m) => m.voteAverage > 0);
    if (rated.length === 0) return null;
    return rated.reduce((best, m) => m.voteAverage > best.voteAverage ? m : best);
  });

  readonly languageCount = computed(() => {
    const langs = new Set<string>();
    for (const m of this.films()) {
      if (m.language) langs.add(m.language);
    }
    return langs.size;
  });

  readonly topGenre = computed(() => {
    const counts = new Map<string, number>();
    for (const m of this.films()) {
      for (const g of m.genres) counts.set(g, (counts.get(g) ?? 0) + 1);
    }
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] ?? '—';
  });

  readonly directorCount = computed(() => {
    const dirs = new Set<string>();
    for (const m of this.films()) {
      for (const d of m.directors) dirs.add(d);
    }
    return dirs.size;
  });

  readonly peakYear = computed(() => {
    const f = this.films();
    if (f.length < 5) return null;
    const counts = new Map<number, number>();
    for (const m of f) counts.set(m.year, (counts.get(m.year) ?? 0) + 1);
    const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (!best || best[1] < 2) return null;
    return { year: best[0], count: best[1] };
  });

  readonly ratingVsCatalog = computed(() => {
    const rated = this.films().filter((m) => m.voteAverage > 0);
    if (rated.length < 5) return null;
    const decAvg = rated.reduce((s, m) => s + m.voteAverage, 0) / rated.length;
    const allRated = this.catalog.movies().filter((m) => m.voteAverage > 0);
    if (allRated.length === 0) return null;
    const catAvg = allRated.reduce((s, m) => s + m.voteAverage, 0) / allRated.length;
    const diff = decAvg - catAvg;
    if (Math.abs(diff) < 0.2) return null;
    return diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
  });

  readonly streamablePct = computed(() => {
    const f = this.films();
    if (f.length === 0) return 0;
    return Math.round((f.filter((m) => m.isStreamable).length / f.length) * 100);
  });

  readonly highRatedPct = computed(() => {
    const rated = this.films().filter((m) => m.voteAverage > 0);
    if (rated.length < 10) return null;
    const high = rated.filter((m) => m.voteAverage >= 7.0).length;
    const pct = Math.round((high / rated.length) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });

  readonly medianRating = computed(() => {
    const rated = this.films()
      .filter((m) => m.voteAverage > 0)
      .map((m) => m.voteAverage)
      .sort((a, b) => a - b);
    if (rated.length < 10) return null;
    const mid = Math.floor(rated.length / 2);
    const median = rated.length % 2 === 0
      ? (rated[mid - 1] + rated[mid]) / 2
      : rated[mid];
    return median.toFixed(1);
  });

  readonly avgFilmAge = computed(() => {
    const f = this.films();
    if (f.length < 2) return 0;
    const now = new Date().getFullYear();
    return Math.round(f.reduce((s, m) => s + (now - m.year), 0) / f.length);
  });

  readonly coDirectedCount = computed(() =>
    this.films().filter((m) => m.directors.length > 1).length
  );

  readonly nonEnglishCount = computed(() => {
    const f = this.films();
    if (f.length < 5) return 0;
    return f.filter((m) => m.language && m.language !== 'English' && m.language !== 'en').length;
  });

  readonly uniqueGenreCount = computed(() => {
    const genres = new Set<string>();
    for (const m of this.films()) {
      for (const g of m.genres) genres.add(g);
    }
    return genres.size;
  });

  readonly longestTitle = computed(() => {
    const f = this.films();
    if (f.length < 10) return null;
    const longest = f.reduce((best, m) => m.title.length > best.title.length ? m : best, f[0]);
    return longest.title.length >= 25 ? longest.title : null;
  });

  readonly shortestTitle = computed(() => {
    const f = this.films();
    if (f.length < 10) return null;
    const shortest = f.reduce((best, m) => m.title.length < best.title.length ? m : best, f[0]);
    return shortest.title.length <= 10 ? shortest.title : null;
  });

  readonly mostProlificDirector = computed(() => {
    const f = this.films();
    if (f.length < 5) return null;
    const counts = new Map<string, number>();
    for (const m of f) {
      for (const d of m.directors) counts.set(d, (counts.get(d) ?? 0) + 1);
    }
    const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (!best || best[1] < 3) return null;
    return { name: best[0], count: best[1] };
  });


  readonly avgFilmsPerDirector = computed(() => {
    const f = this.films();
    if (f.length < 10) return null;
    const dirs = new Set<string>();
    for (const m of f) for (const d of m.directors) dirs.add(d);
    if (dirs.size === 0) return null;
    const avg = f.length / dirs.size;
    if (avg < 1.2) return null;
    return avg.toFixed(1);
  });

  readonly silentEraFilmCount = computed(() => {
    const y = parseInt(this.year(), 10);
    if (y >= 1930) return 0;
    return this.films().filter((m) => m.year < 1930).length;
  });

  readonly decadeFact = computed(() => {
    const f = this.films();
    if (f.length < 5) return null;
    const streamable = f.filter((m) => m.isStreamable);
    const directors = new Set(f.flatMap((m) => m.directors));
    const langs = new Set(f.map((m) => m.language).filter(Boolean));
    const rated = f.filter((m) => m.voteAverage > 0);
    const avg = rated.length > 0 ? rated.reduce((s, m) => s + m.voteAverage, 0) / rated.length : 0;

    if (streamable.length === f.length) return `Every film from the ${this.decadeLabel()} is free to watch.`;
    if (avg >= 7.5 && rated.length >= 10) return `An exceptional decade — ${avg.toFixed(1)} average rating across ${rated.length} rated films.`;
    if (langs.size >= 8) return `A truly global decade with films in ${langs.size} languages.`;
    if (directors.size >= f.length * 0.85 && f.length >= 20) return `Remarkably diverse — ${directors.size} directors across ${f.length} films.`;
    if (streamable.length >= 100) return `${streamable.length} films from this decade available to watch for free.`;
    return null;
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

  readonly prevDecade = computed(() => {
    const y = parseInt(this.year(), 10);
    const prev = y - 10;
    const hasFilms = this.catalog.movies().some((m) => m.year >= prev && m.year < prev + 10);
    return hasFilms ? prev : null;
  });

  readonly nextDecade = computed(() => {
    const y = parseInt(this.year(), 10);
    const next = y + 10;
    const hasFilms = this.catalog.movies().some((m) => m.year >= next && m.year < next + 10);
    return hasFilms ? next : null;
  });

  readonly nonEnglishPct = computed(() => {
    const f = this.films();
    if (f.length < 10) return null;
    const count = f.filter((m) => m.language && m.language !== 'English' && m.language !== 'en').length;
    const pct = Math.round((count / f.length) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });

  readonly highlyRatedCount = computed(() => {
    return this.films().filter((m) => m.voteAverage >= 8.0).length;
  });

  readonly avgTitleLength = computed(() => {
    const f = this.films();
    if (f.length < 5) return null;
    return Math.round(f.reduce((s, m) => s + m.title.length, 0) / f.length);
  });

  readonly streamableHighRatedCount = computed(() => {
    return this.films().filter((m) => m.isStreamable && m.voteAverage >= 7.0).length;
  });

  readonly topDirectorFilmCount = computed(() => {
    const f = this.films();
    if (f.length < 5) return null;
    const counts = new Map<string, number>();
    for (const m of f) for (const d of m.directors) counts.set(d, (counts.get(d) ?? 0) + 1);
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    return top && top[1] >= 3 ? { name: top[0], count: top[1] } : null;
  });

  readonly decadeTopGenre = computed(() => {
    const f = this.films();
    if (f.length < 10) return null;
    const counts = new Map<string, number>();
    for (const m of f) for (const g of m.genres) counts.set(g, (counts.get(g) ?? 0) + 1);
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    return top ? top[0] : null;
  });

  readonly decadeDirectorCount = computed(() => {
    const f = this.films();
    if (f.length < 5) return null;
    const dirs = new Set<string>();
    for (const m of f) for (const d of m.directors) dirs.add(d);
    return dirs.size >= 5 ? dirs.size : null;
  });

  readonly bestRatedTitle = computed(() => {
    const rated = this.films().filter((m) => m.voteAverage > 0);
    if (rated.length < 5) return null;
    const best = rated.reduce((a, b) => a.voteAverage >= b.voteAverage ? a : b);
    return best.title;
  });

  readonly uniqueLanguageCount = computed(() => {
    const f = this.films();
    if (f.length < 10) return null;
    const langs = new Set(f.filter((m) => m.language).map((m) => m.language));
    return langs.size >= 3 ? langs.size : null;
  });

  readonly coDirectedPct = computed(() => {
    const f = this.films();
    if (f.length < 10) return null;
    const pct = Math.round((f.filter((m) => m.directors.length > 1).length / f.length) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });

  readonly singleGenreCount = computed(() => {
    const f = this.films();
    if (f.length < 5) return 0;
    const count = f.filter((m) => m.genres.length === 1).length;
    return count >= 3 ? count : 0;
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
