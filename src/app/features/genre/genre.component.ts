import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CatalogService } from '../../core/services/catalog.service';
import { CollectionService } from '../../core/services/collection.service';
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
            @if (peakDecade(); as peak) {
              <div class="genre__stat">
                <span class="genre__stat-value">{{ peak.decade }}s</span>
                <span class="genre__stat-label">Peak Decade ({{ peak.count }})</span>
              </div>
            }
            @if (directorCount() > 1) {
              <div class="genre__stat">
                <span class="genre__stat-value">{{ directorCount() }}</span>
                <span class="genre__stat-label">Directors</span>
              </div>
            }
            @if (silentEraCount() > 0) {
              <div class="genre__stat">
                <span class="genre__stat-value">{{ silentEraCount() }}</span>
                <span class="genre__stat-label">Silent Era</span>
              </div>
            }
            <div class="genre__stat">
              <span class="genre__stat-value">{{ streamablePct() }}%</span>
              <span class="genre__stat-label">Streamable</span>
            </div>
            @if (avgYear()) {
              <div class="genre__stat">
                <span class="genre__stat-value">{{ avgYear() }}</span>
                <span class="genre__stat-label">Avg Year</span>
              </div>
            }
            @if (medianYear(); as my) {
              <div class="genre__stat">
                <span class="genre__stat-value">{{ my }}</span>
                <span class="genre__stat-label">Median Year</span>
              </div>
            }
            @if (exclusiveCount(); as ec) {
              <div class="genre__stat">
                <span class="genre__stat-value">{{ ec }}</span>
                <span class="genre__stat-label">Pure {{ name() }}</span>
              </div>
            }
            @if (ratingVsCatalog(); as rv) {
              <div class="genre__stat">
                <span class="genre__stat-value" [class.genre__stat-value--positive]="rv.startsWith('+')">{{ rv }}</span>
                <span class="genre__stat-label">vs Catalog Avg</span>
              </div>
            }
            @if (mostProlificDirector(); as mpd) {
              <a class="genre__stat genre__stat--link" [routerLink]="['/director', mpd.name]">
                <span class="genre__stat-value">{{ mpd.count }}</span>
                <span class="genre__stat-label">{{ mpd.name }}</span>
              </a>
            }
            @if (avgFilmAge() > 0) {
              <div class="genre__stat">
                <span class="genre__stat-value">{{ avgFilmAge() }}</span>
                <span class="genre__stat-label">Avg Film Age (yrs)</span>
              </div>
            }
            @if (coDirectedCount() > 0) {
              <div class="genre__stat">
                <span class="genre__stat-value">{{ coDirectedCount() }}</span>
                <span class="genre__stat-label">Co-directed</span>
              </div>
            }
            @if (silentEraCount() > 0) {
              <div class="genre__stat">
                <span class="genre__stat-value">{{ silentEraCount() }}</span>
                <span class="genre__stat-label">Silent Era</span>
              </div>
            }
          </div>

          @if (newestFilmYear(); as nfy) {
            <p class="genre__fact">Most recent: {{ nfy }}</p>
          }
          @if (watchedInGenre() > 0) {
            <p class="genre__fact">You've watched {{ watchedInGenre() }} {{ name() }} film{{ watchedInGenre() !== 1 ? 's' : '' }}</p>
          }
          @if (highestRatedTitle(); as hrt) {
            <p class="genre__fact">Top rated: {{ hrt.title }} (&#9733; {{ hrt.rating }})</p>
          }
          @if (unwatchedStreamableCount() > 0) {
            <p class="genre__fact">{{ unwatchedStreamableCount() }} free {{ name() }} films you haven't watched</p>
          }
          @if (nonEnglishPct() > 0) {
            <p class="genre__fact">{{ nonEnglishPct() }}% non-English films</p>
          }
          @if (medianRating(); as mr) {
            <p class="genre__fact">Median rating: &#9733; {{ mr }}</p>
          }
          @if (avgTitleLength(); as atl) {
            <p class="genre__fact">Avg title length: {{ atl }} chars</p>
          }
          @if (longestTitle(); as lt) {
            <p class="genre__fact">Longest title: "{{ lt }}"</p>
          }
          @if (shortestTitle(); as st) {
            <p class="genre__fact">Shortest title: "{{ st }}"</p>
          }
          @if (highlyRatedCount() > 0) {
            <p class="genre__fact">{{ highlyRatedCount() }} films rated 8.0+</p>
          }
          @if (coDirectedPct(); as cdp) {
            <p class="genre__fact">{{ cdp }}% co-directed</p>
          }
          @if (streamableHighRatedCount() > 0) {
            <p class="genre__fact">{{ streamableHighRatedCount() }} highly-rated free to watch</p>
          }
          @if (notableFact()) {
            <p class="genre__fact">{{ notableFact() }}</p>
          }

          @if (topFilm(); as top) {
            <div class="genre__top-film">
              <a class="genre__top-film-card" [routerLink]="['/movie', top.id]">
                @if (top.posterUrl) {
                  <img class="genre__top-film-poster" [src]="top.posterUrl" [alt]="top.title" loading="lazy" />
                } @else {
                  <div class="genre__top-film-placeholder">{{ top.title[0] }}</div>
                }
                <div class="genre__top-film-info">
                  <span class="genre__top-film-label">Highest Rated</span>
                  <strong class="genre__top-film-title">{{ top.title }}</strong>
                  <span class="genre__top-film-meta">{{ top.year }} &middot; {{ top.directors.join(', ') }}</span>
                  @if (top.voteAverage > 0) {
                    <span class="genre__top-film-rating">&#9733; {{ top.voteAverage.toFixed(1) }}</span>
                  }
                </div>
              </a>
            </div>
          }

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

          @if (relatedGenres().length > 0) {
            <div class="genre__related">
              <h2 class="genre__section-title">Related Genres</h2>
              <div class="genre__related-chips">
                @for (g of relatedGenres(); track g.name) {
                  <a class="genre__related-chip" [routerLink]="['/genre', g.name]">
                    {{ g.name }}
                    <span class="genre__related-pct">{{ g.pct }}%</span>
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
          @if (languageBreakdown().length > 0) {
            <div class="genre__languages">
              <h2 class="genre__section-title">Languages</h2>
              <div class="genre__lang-chips">
                @for (l of languageBreakdown(); track l.name) {
                  <span class="genre__lang-chip">
                    {{ l.name }}
                    <span class="genre__lang-count">{{ l.count }}</span>
                  </span>
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
    .genre__stat-value--positive {
      color: #198754;
    }
    .genre__stat--link {
      cursor: pointer;
      text-decoration: none;
      transition: border-color 0.2s;
    }
    .genre__stat--link:hover {
      border-color: var(--accent-gold);
    }
    .genre__top-film {
      margin-bottom: var(--space-xl);
    }
    .genre__top-film-card {
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
    .genre__top-film-card:hover {
      border-color: var(--accent-gold);
      box-shadow: var(--shadow-md);
      color: inherit;
    }
    .genre__top-film-poster {
      width: 60px;
      aspect-ratio: 2 / 3;
      object-fit: cover;
      border-radius: var(--radius);
      flex-shrink: 0;
    }
    .genre__top-film-placeholder {
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
    .genre__top-film-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .genre__top-film-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--accent-gold);
      font-weight: 600;
    }
    .genre__top-film-title {
      font-size: 1.1rem;
    }
    .genre__top-film-meta {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
    .genre__top-film-rating {
      font-family: var(--font-heading);
      font-size: 1rem;
      font-weight: 700;
      color: var(--accent-gold);
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
    .genre__related {
      margin-top: var(--space-xl);
      padding-top: var(--space-lg);
      border-top: 1px solid var(--border);
    }
    .genre__related-chips {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-sm);
    }
    .genre__related-chip {
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
    .genre__related-chip:hover {
      border-color: var(--accent-gold);
      color: var(--accent-gold);
    }
    .genre__related-pct {
      font-size: 0.7rem;
      background: var(--bg-raised);
      padding: 1px 6px;
      border-radius: 8px;
      color: var(--text-tertiary);
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
    .genre__languages {
      margin-top: var(--space-xl);
      padding-top: var(--space-lg);
      border-top: 1px solid var(--border);
    }
    .genre__lang-chips {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-xs);
    }
    .genre__lang-chip {
      display: inline-flex;
      align-items: center;
      gap: var(--space-xs);
      padding: 4px 12px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
    .genre__lang-count {
      font-size: 0.65rem;
      background: var(--bg-raised);
      padding: 1px 5px;
      border-radius: 6px;
      color: var(--text-tertiary);
    }
    .genre__empty {
      text-align: center;
      padding: var(--space-3xl);
      color: var(--text-tertiary);
    }
    .genre__fact {
      font-style: italic;
      color: var(--accent-gold);
      font-size: 0.95rem;
      margin: 0 0 var(--space-xl);
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
  private readonly collection = inject(CollectionService);
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

  readonly directorCount = computed(() => {
    const dirs = new Set<string>();
    for (const m of this.films()) for (const d of m.directors) dirs.add(d);
    return dirs.size;
  });

  readonly silentEraCount = computed(() =>
    this.films().filter((m) => m.year < 1930).length
  );

  readonly newestFilmYear = computed(() => {
    const f = this.films();
    if (f.length < 5) return null;
    const newest = Math.max(...f.map((m) => m.year));
    const oldest = Math.min(...f.map((m) => m.year));
    return newest - oldest >= 10 ? newest : null;
  });

  readonly watchedInGenre = computed(() => {
    const watchedIds = this.collection.watchedIds();
    if (watchedIds.size === 0) return 0;
    return this.films().filter((m) => watchedIds.has(m.id)).length;
  });

  readonly streamablePct = computed(() => {
    const f = this.films();
    if (f.length === 0) return 0;
    return Math.round((f.filter((m) => m.isStreamable).length / f.length) * 100);
  });

  readonly avgYear = computed(() => {
    const f = this.films();
    if (f.length < 3) return null;
    return Math.round(f.reduce((s, m) => s + m.year, 0) / f.length);
  });

  readonly topFilm = computed(() => {
    const rated = this.films().filter((m) => m.voteAverage > 0);
    if (rated.length === 0) return null;
    return rated.reduce((best, m) => m.voteAverage > best.voteAverage ? m : best);
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

  readonly relatedGenres = computed(() => {
    const thisGenre = this.name().toLowerCase();
    const coOccur = new Map<string, number>();
    const films = this.films();
    for (const m of films) {
      for (const g of m.genres) {
        if (g.toLowerCase() !== thisGenre) {
          coOccur.set(g, (coOccur.get(g) ?? 0) + 1);
        }
      }
    }
    const total = films.length;
    return [...coOccur.entries()]
      .filter(([, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, pct: Math.round((count / total) * 100) }));
  });

  readonly peakDecade = computed(() => {
    const breakdown = this.decadeBreakdown();
    if (breakdown.length === 0) return null;
    return breakdown.reduce((best, d) => d.count > best.count ? d : best);
  });

  readonly notableFact = computed(() => {
    const f = this.films();
    if (f.length < 3) return null;
    const streamable = f.filter((m) => m.isStreamable);
    const rated = f.filter((m) => m.voteAverage > 0);
    const avg = rated.length > 0 ? rated.reduce((s, m) => s + m.voteAverage, 0) / rated.length : 0;
    const langs = new Set(f.map((m) => m.language).filter(Boolean));
    const directors = new Set(f.flatMap((m) => m.directors));
    if (streamable.length === f.length) return `All ${f.length} films are free to watch`;
    if (avg >= 7.5 && rated.length >= 5) return `Exceptionally well-rated genre — ${avg.toFixed(1)} average across ${rated.length} films`;
    if (langs.size >= 5) return `Truly international — films in ${langs.size} languages`;
    if (directors.size >= f.length * 0.8 && f.length >= 10) return `Remarkably diverse — ${directors.size} different directors`;
    if (streamable.length >= 50) return `${streamable.length} films available to watch for free`;
    return null;
  });

  readonly languageBreakdown = computed(() => {
    const LANG_NAMES: Record<string, string> = {
      en: 'English', fr: 'French', de: 'German', ja: 'Japanese', it: 'Italian',
      es: 'Spanish', ru: 'Russian', sv: 'Swedish', da: 'Danish', pt: 'Portuguese',
      nl: 'Dutch', zh: 'Chinese', ko: 'Korean', pl: 'Polish', cs: 'Czech',
      hu: 'Hungarian', fi: 'Finnish', el: 'Greek', no: 'Norwegian', nb: 'Norwegian',
    };
    const counts = new Map<string, number>();
    for (const m of this.films()) {
      if (m.language) {
        const name = LANG_NAMES[m.language] ?? m.language.toUpperCase();
        counts.set(name, (counts.get(name) ?? 0) + 1);
      }
    }
    if (counts.size < 2) return [];
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));
  });

  readonly ratingVsCatalog = computed(() => {
    const rated = this.films().filter((m) => m.voteAverage > 0);
    if (rated.length < 5) return null;
    const genreAvg = rated.reduce((s, m) => s + m.voteAverage, 0) / rated.length;
    const allRated = this.catalog.movies().filter((m) => m.voteAverage > 0);
    if (allRated.length === 0) return null;
    const catAvg = allRated.reduce((s, m) => s + m.voteAverage, 0) / allRated.length;
    const diff = genreAvg - catAvg;
    if (Math.abs(diff) < 0.2) return null;
    return diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
  });

  readonly highestRatedTitle = computed(() => {
    const top = this.topFilm();
    if (!top || top.voteAverage < 7.0) return null;
    return { title: top.title.length > 30 ? top.title.slice(0, 28) + '...' : top.title, rating: top.voteAverage.toFixed(1) };
  });

  readonly medianYear = computed(() => {
    const f = this.films();
    if (f.length < 5) return null;
    const years = f.map((m) => m.year).sort((a, b) => a - b);
    const mid = Math.floor(years.length / 2);
    const median = years.length % 2 === 0 ? Math.round((years[mid - 1] + years[mid]) / 2) : years[mid];
    const avg = this.avgYear();
    if (avg !== null && Math.abs(median - avg) < 3) return null;
    return median;
  });

  readonly exclusiveCount = computed(() => {
    const f = this.films();
    if (f.length < 5) return null;
    const count = f.filter((m) => m.genres.length === 1).length;
    if (count < 1) return null;
    return count;
  });

  readonly mostProlificDirector = computed(() => {
    const counts = new Map<string, number>();
    for (const m of this.films()) {
      for (const d of m.directors) counts.set(d, (counts.get(d) ?? 0) + 1);
    }
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (!top || top[1] < 3) return null;
    return { name: top[0], count: top[1] };
  });

  readonly avgFilmAge = computed(() => {
    const f = this.films();
    if (f.length < 2) return 0;
    const now = new Date().getFullYear();
    return Math.round(f.reduce((s, m) => s + (now - m.year), 0) / f.length);
  });

  readonly coDirectedCount = computed(() => {
    const f = this.films();
    if (f.length < 5) return 0;
    return f.filter((m) => m.directors.length > 1).length;
  });

  readonly unwatchedStreamableCount = computed(() => {
    const f = this.films();
    if (f.length < 5) return 0;
    const watchedIds = this.collection.watchedIds();
    return f.filter((m) => m.isStreamable && !watchedIds.has(m.id)).length;
  });

  readonly nonEnglishPct = computed(() => {
    const f = this.films();
    if (f.length < 10) return 0;
    const count = f.filter((m) => m.language && m.language !== 'English' && m.language !== 'en').length;
    const pct = Math.round((count / f.length) * 100);
    return pct > 0 && pct < 100 ? pct : 0;
  });

  readonly medianRating = computed(() => {
    const rated = this.films().filter((m) => m.voteAverage > 0);
    if (rated.length < 5) return null;
    const sorted = rated.map((m) => m.voteAverage).sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    return median.toFixed(1);
  });

  readonly highlyRatedCount = computed(() => {
    return this.films().filter((m) => m.voteAverage >= 8.0).length;
  });

  readonly shortestTitle = computed(() => {
    const f = this.films();
    if (f.length < 5) return null;
    const shortest = f.reduce((a, b) => a.title.length <= b.title.length ? a : b);
    return shortest.title.length <= 12 ? shortest.title : null;
  });

  readonly longestTitle = computed(() => {
    const f = this.films();
    if (f.length < 5) return null;
    const longest = f.reduce((a, b) => a.title.length >= b.title.length ? a : b);
    return longest.title.length >= 20 ? longest.title : null;
  });

  readonly avgTitleLength = computed(() => {
    const f = this.films();
    if (f.length < 5) return null;
    const avg = Math.round(f.reduce((s, m) => s + m.title.length, 0) / f.length);
    return avg > 0 ? avg : null;
  });

  readonly coDirectedPct = computed(() => {
    const f = this.films();
    if (f.length < 10) return null;
    const pct = Math.round((f.filter((m) => m.directors.length > 1).length / f.length) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });

  readonly streamableHighRatedCount = computed(() => {
    return this.films().filter((m) => m.isStreamable && m.voteAverage >= 7.0).length;
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
