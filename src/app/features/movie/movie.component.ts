import { Component, ChangeDetectionStrategy, inject, OnInit, signal, input, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CatalogService } from '../../core/services/catalog.service';
import { MovieService } from '../../core/services/movie.service';
import { CollectionService } from '../../core/services/collection.service';
import { StreamingService } from '../../core/services/streaming.service';
import { NotificationService } from '../../core/services/notification.service';
import { RecentlyViewedService } from '../../core/services/recently-viewed.service';
import { RatingStarsComponent } from '../../shared/components/rating-stars.component';
import { MovieGridComponent } from '../../shared/components/movie-grid.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { RuntimePipe } from '../../shared/pipes/runtime.pipe';
import type { MovieDetail, MovieSummary } from '../../core/models/movie.model';

@Component({
  selector: 'app-movie',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RatingStarsComponent, MovieGridComponent, LoadingSpinnerComponent, RuntimePipe],
  template: `
    @if (loading()) {
      <app-loading-spinner />
    } @else if (movie(); as m) {
      <div class="detail">
        <div class="detail__hero">
          @if (m.backdropUrl) {
            <div class="detail__backdrop" [style.background-image]="'url(' + m.backdropUrl + ')'"></div>
          }
          <div class="detail__hero-gradient"></div>
        </div>

        <div class="detail__content container">
          <div class="detail__layout">
            <div class="detail__poster">
              @if (m.posterUrl) {
                <img [src]="m.posterUrl" [alt]="m.title + ' poster'" />
              } @else {
                <div class="detail__poster-placeholder">
                  <span class="detail__poster-title">{{ m.title }}</span>
                  <span class="detail__poster-year">{{ m.year }}</span>
                </div>
              }
            </div>

            <div class="detail__info">
              <h1 class="detail__title">{{ m.title }}</h1>

              <div class="detail__meta">
                <span class="detail__meta-item">{{ m.year }}</span>
                @if (m.runtime) {
                  <span class="detail__meta-sep">&middot;</span>
                  <span class="detail__meta-item">{{ m.runtime | runtime }}</span>
                }
                @if (m.originalLanguage) {
                  <span class="detail__meta-sep">&middot;</span>
                  <span class="detail__meta-item">{{ m.originalLanguage.toUpperCase() }}</span>
                }
              </div>

              @if (m.tagline) {
                <p class="detail__tagline">&ldquo;{{ m.tagline }}&rdquo;</p>
              }

              @if (m.overview) {
                <p class="detail__overview">{{ m.overview }}</p>
              }

              @if (m.tmdbRating || m.imdbRating || m.rottenTomatoesRating) {
                <div class="detail__ratings">
                  @if (m.tmdbRating) {
                    <div class="detail__rating-card">
                      <span class="detail__rating-source">TMDb</span>
                      <span class="detail__rating-score">{{ m.tmdbRating.toFixed(1) }}</span>
                      <app-rating-stars [rating]="m.tmdbRating / 2" />
                    </div>
                  }
                  @if (m.imdbRating) {
                    <div class="detail__rating-card">
                      <span class="detail__rating-source">IMDb</span>
                      <span class="detail__rating-score">{{ m.imdbRating }}</span>
                    </div>
                  }
                  @if (m.rottenTomatoesRating) {
                    <div class="detail__rating-card">
                      <span class="detail__rating-source">RT</span>
                      <span class="detail__rating-score">{{ m.rottenTomatoesRating }}</span>
                    </div>
                  }
                </div>
              }

              <div class="detail__actions">
                @if (streamingUrl()) {
                  <a class="btn-primary detail__watch-btn" [routerLink]="['/watch', m.id]">Watch Film</a>
                }
                <button
                  class="btn-ghost detail__fav-btn"
                  [class.detail__fav-btn--active]="collection.isFavorite(m.id)"
                  (click)="toggleFavorite(m.id)"
                  [attr.aria-label]="collection.isFavorite(m.id) ? 'Remove from favorites' : 'Add to favorites'"
                >
                  @if (collection.isFavorite(m.id)) {
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  } @else {
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  }
                </button>
                @if (!collection.isInWatchlist(m.id) && !collection.isWatched(m.id)) {
                  <button class="btn-secondary" (click)="addToWatchlist(m.id)">+ Watchlist</button>
                } @else if (collection.isInWatchlist(m.id)) {
                  <button class="btn-secondary detail__active-btn" (click)="removeFromWatchlist(m.id)">In Watchlist</button>
                }
                @if (!collection.isWatched(m.id)) {
                  <button class="btn-secondary" (click)="markWatched(m.id)">Mark Watched</button>
                }
                <button class="btn-ghost detail__share-btn" (click)="share(m)" aria-label="Share this film">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                  Share
                </button>
              </div>

              @if (collection.isWatched(m.id)) {
                <div class="detail__user-rating">
                  <span class="detail__user-rating-label">Your Rating</span>
                  <app-rating-stars
                    [rating]="getUserRating(m.id)"
                    [interactive]="true"
                    (rated)="onRate(m.id, $event)"
                  />
                </div>
              }

              @if (collection.isWatched(m.id)) {
                <div class="detail__notes">
                  <label class="detail__notes-label" for="film-notes">Your Notes</label>
                  <textarea
                    id="film-notes"
                    class="detail__notes-input"
                    placeholder="Add your thoughts about this film..."
                    [value]="collection.getNote(m.id)"
                    (blur)="onNoteChange(m.id, $event)"
                    rows="3"
                  ></textarea>
                </div>
              }

              @if (m.directors.length > 0 || m.genres.length > 0) {
                <div class="detail__details">
                  @if (m.directors.length > 0) {
                    <div class="detail__detail-row">
                      <span class="detail__detail-label">Director{{ m.directors.length > 1 ? 's' : '' }}</span>
                      <span>
                        @for (dir of m.directors; track dir; let last = $last) {
                          <a [routerLink]="['/director', dir]">{{ dir }}</a>@if (!last) {, }
                        }
                      </span>
                    </div>
                  }
                  @if (m.genres.length > 0) {
                    <div class="detail__detail-row">
                      <span class="detail__detail-label">Genres</span>
                      <div class="detail__tags">
                        @for (genre of m.genres; track genre) {
                          <span class="detail__tag">{{ genre }}</span>
                        }
                      </div>
                    </div>
                  }
                </div>
              }

              @if (m.imdbId || m.internetArchiveId) {
                <div class="detail__links">
                  @if (m.imdbId) {
                    <a class="detail__ext-link" [href]="'https://www.imdb.com/title/' + m.imdbId" target="_blank" rel="noopener">IMDb</a>
                  }
                  @if (m.internetArchiveId) {
                    <a class="detail__ext-link" [href]="'https://archive.org/details/' + m.internetArchiveId" target="_blank" rel="noopener">Internet Archive</a>
                  }
                </div>
              }
            </div>
          </div>

          @if (m.cast.length > 0) {
            <section class="detail__cast-section">
              <h2>Cast</h2>
              <div class="detail__cast">
                @for (actor of m.cast; track actor.name) {
                  <div class="cast-card">
                    @if (actor.profileUrl) {
                      <img [src]="actor.profileUrl" [alt]="actor.name" loading="lazy" />
                    } @else {
                      <div class="cast-card__placeholder"></div>
                    }
                    <p class="cast-card__name">{{ actor.name }}</p>
                    @if (actor.character) {
                      <p class="cast-card__character">{{ actor.character }}</p>
                    }
                  </div>
                }
              </div>
            </section>
          }

          @if (similarFilms().length > 0) {
            <section class="detail__similar" aria-label="Similar films">
              <h2>You Might Also Like</h2>
              <app-movie-grid [movies]="similarFilms()" />
            </section>
          }
        </div>
      </div>
    } @else {
      <div class="container detail__not-found">
        <h2>Film not found</h2>
        <p class="text-secondary">This film is not in our catalog.</p>
        <a class="btn-primary" routerLink="/browse">Browse Films</a>
      </div>
    }
  `,
  styles: [`
    .detail__hero {
      position: relative;
      height: 350px;
      overflow: hidden;
    }
    .detail__backdrop {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center top;
      opacity: 0.4;
    }
    .detail__hero-gradient {
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, transparent 30%, var(--bg-deep) 100%);
    }
    .detail__content {
      position: relative;
      margin-top: -120px;
      padding-bottom: var(--space-2xl);
    }
    .detail__layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: var(--space-xl);
    }
    .detail__poster img {
      width: 100%;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-poster);
    }
    .detail__poster-placeholder {
      width: 100%;
      aspect-ratio: 2 / 3;
      background: linear-gradient(170deg, #1a1a1a 0%, #222 40%, #1a1a1a 100%);
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-sm);
      box-shadow: var(--shadow-poster);
    }
    .detail__poster-title {
      font-family: var(--font-heading);
      color: var(--text-secondary);
      font-size: 1.1rem;
      text-align: center;
      padding: 0 var(--space-md);
    }
    .detail__poster-year {
      font-family: var(--font-heading);
      color: var(--accent-gold);
      font-size: 1.6rem;
      font-weight: 700;
      opacity: 0.5;
    }
    .detail__title {
      font-size: 2.2rem;
      margin-bottom: var(--space-sm);
    }
    .detail__meta {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      color: var(--text-secondary);
      font-size: 1rem;
      margin-bottom: var(--space-lg);
    }
    .detail__meta-sep {
      color: var(--text-tertiary);
    }
    .detail__tagline {
      font-style: italic;
      color: var(--accent-cream);
      font-size: 1.05rem;
      margin: 0 0 var(--space-md);
      opacity: 0.85;
    }
    .detail__overview {
      color: var(--text-secondary);
      line-height: 1.8;
      margin: 0 0 var(--space-xl);
      font-size: 0.95rem;
    }
    .detail__ratings {
      display: flex;
      gap: var(--space-md);
      margin-bottom: var(--space-xl);
      flex-wrap: wrap;
    }
    .detail__rating-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      background-color: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-md) var(--space-lg);
      min-width: 80px;
    }
    .detail__rating-source {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-tertiary);
      font-weight: 600;
    }
    .detail__rating-score {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--accent-gold);
      font-family: var(--font-heading);
    }
    .detail__actions {
      display: flex;
      gap: var(--space-sm);
      flex-wrap: wrap;
      margin-bottom: var(--space-xl);
    }
    .detail__watch-btn {
      padding: var(--space-md) var(--space-xl);
      font-size: 1rem;
      border-radius: var(--radius-lg);
      display: inline-block;
    }
    .detail__active-btn {
      border-color: var(--accent-gold);
      color: var(--accent-gold);
    }
    .detail__details {
      margin-bottom: var(--space-lg);
    }
    .detail__detail-row {
      display: flex;
      gap: var(--space-md);
      padding: var(--space-sm) 0;
      border-bottom: 1px solid var(--border);
      font-size: 0.95rem;
    }
    .detail__detail-row:last-child {
      border-bottom: none;
    }
    .detail__detail-label {
      color: var(--text-tertiary);
      min-width: 90px;
      flex-shrink: 0;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      padding-top: 2px;
    }
    .detail__tags {
      display: flex;
      gap: var(--space-xs);
      flex-wrap: wrap;
    }
    .detail__tag {
      background-color: var(--bg-raised);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 2px 12px;
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
    .detail__links {
      display: flex;
      gap: var(--space-md);
    }
    .detail__ext-link {
      font-size: 0.9rem;
      font-weight: 600;
      padding: 4px 0;
    }
    .detail__cast-section {
      margin-top: var(--space-2xl);
      padding-top: var(--space-xl);
      border-top: 1px solid var(--border);
    }
    .detail__cast {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: var(--space-md);
    }
    .cast-card { text-align: center; }
    .cast-card img {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      object-fit: cover;
      margin-bottom: var(--space-sm);
      box-shadow: var(--shadow-sm);
    }
    .cast-card__placeholder {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background-color: var(--bg-raised);
      margin: 0 auto var(--space-sm);
    }
    .cast-card__name {
      font-size: 0.85rem;
      font-weight: 600;
      margin: 0 0 2px;
      color: var(--text-primary);
    }
    .cast-card__character {
      font-size: 0.75rem;
      color: var(--text-tertiary);
      margin: 0;
    }
    .detail__share-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.9rem;
    }
    .detail__fav-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 48px;
      min-height: 48px;
      padding: 0;
      color: var(--text-tertiary);
      transition: color 0.2s, transform 0.2s;
    }
    .detail__fav-btn:hover { color: #e53e3e; }
    .detail__fav-btn--active { color: #e53e3e; }
    .detail__fav-btn--active:hover { transform: scale(1.1); }
    .detail__notes {
      margin-bottom: var(--space-xl);
    }
    .detail__notes-label {
      display: block;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-tertiary);
      font-weight: 600;
      margin-bottom: var(--space-sm);
    }
    .detail__notes-input {
      width: 100%;
      padding: var(--space-md);
      background-color: var(--bg-surface);
      color: var(--text-primary);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      font-family: var(--font-body);
      font-size: 0.95rem;
      line-height: 1.6;
      resize: vertical;
      min-height: 80px;
    }
    .detail__notes-input:focus {
      border-color: var(--accent-gold);
      outline: none;
    }
    .detail__notes-input::placeholder {
      color: var(--text-tertiary);
    }
    .detail__user-rating {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      margin-bottom: var(--space-xl);
      padding: var(--space-md) var(--space-lg);
      background-color: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
    }
    .detail__user-rating-label {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-tertiary);
      font-weight: 600;
    }
    .detail__similar {
      margin-top: var(--space-2xl);
      padding-top: var(--space-xl);
      border-top: 1px solid var(--border);
    }
    .detail__not-found {
      padding: var(--space-3xl) 0;
      text-align: center;
    }
    @media (max-width: 768px) {
      .detail__hero { height: 220px; }
      .detail__content { margin-top: -60px; }
      .detail__layout {
        grid-template-columns: 1fr;
        gap: var(--space-lg);
      }
      .detail__poster {
        max-width: 200px;
        margin: 0 auto;
      }
      .detail__title { font-size: 1.8rem; }
    }
  `],
})
export class MovieComponent implements OnInit {
  readonly id = input.required<string>();

  private readonly catalogService = inject(CatalogService);
  private readonly movieService = inject(MovieService);
  protected readonly collection = inject(CollectionService);
  private readonly streaming = inject(StreamingService);
  private readonly notifications = inject(NotificationService);
  private readonly recentlyViewed = inject(RecentlyViewedService);
  private readonly titleService = inject(Title);

  readonly movie = signal<MovieDetail | null>(null);
  readonly loading = signal(true);
  readonly streamingUrl = signal<string | null>(null);
  private readonly summary = signal<MovieSummary | null>(null);
  readonly similarFilms = computed(() => {
    const s = this.summary();
    return s ? this.catalogService.getSimilar(s) : [];
  });

  async ngOnInit(): Promise<void> {
    await this.catalogService.load();
    const summary = this.catalogService.movies().find((m) => m.id === this.id());
    if (!summary) {
      this.loading.set(false);
      this.titleService.setTitle('Film Not Found — BW Cinema');
      return;
    }
    this.titleService.setTitle(`${summary.title} (${summary.year}) — BW Cinema`);
    this.recentlyViewed.add(summary.id);
    this.summary.set(summary);
    const source = this.streaming.getSource(summary.internetArchiveId, summary.youtubeId);
    this.streamingUrl.set(source?.embedUrl ?? null);

    try {
      const detail = await this.movieService.getDetail(summary);
      this.movie.set(detail);
    } catch {
      this.movie.set({
        ...summary,
        overview: '',
        runtime: null,
        tagline: '',
        backdropUrl: null,
        cast: [],
        crew: [],
        tmdbRating: summary.voteAverage,
        imdbRating: null,
        rottenTomatoesRating: null,
        metacriticRating: null,
        releaseDate: '',
        originalLanguage: '',
        productionCountries: [],
      });
    }
    this.loading.set(false);
  }

  addToWatchlist(id: string): void {
    this.collection.addToWatchlist(id);
    this.notifications.show('Added to watchlist', 'success');
  }

  removeFromWatchlist(id: string): void {
    this.collection.removeFromWatchlist(id);
    this.notifications.show('Removed from watchlist', 'info');
  }

  markWatched(id: string): void {
    this.collection.markWatched(id);
    this.notifications.show('Marked as watched', 'success');
  }

  onRate(movieId: string, rating: number): void {
    this.collection.setRating(movieId, rating);
    this.notifications.show(`Rated ${rating} star${rating !== 1 ? 's' : ''}`, 'success');
  }

  getUserRating(movieId: string): number {
    const item = this.collection.watched().find((w) => w.movieId === movieId);
    return item?.userRating ?? 0;
  }

  toggleFavorite(id: string): void {
    this.collection.toggleFavorite(id);
    const msg = this.collection.isFavorite(id) ? 'Added to favorites' : 'Removed from favorites';
    this.notifications.show(msg, 'success');
  }

  onNoteChange(movieId: string, event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.collection.setNote(movieId, value);
  }

  async share(movie: MovieDetail): Promise<void> {
    const url = window.location.href;
    const text = `${movie.title} (${movie.year}) — Watch classic B&W cinema`;

    if (navigator.share) {
      try {
        await navigator.share({ title: movie.title, text, url });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      this.notifications.show('Link copied to clipboard', 'info');
    }
  }
}
