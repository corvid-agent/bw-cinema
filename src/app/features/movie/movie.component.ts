import { Component, ChangeDetectionStrategy, inject, OnInit, signal, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { MovieService } from '../../core/services/movie.service';
import { CollectionService } from '../../core/services/collection.service';
import { StreamingService } from '../../core/services/streaming.service';
import { NotificationService } from '../../core/services/notification.service';
import { RatingStarsComponent } from '../../shared/components/rating-stars.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { RuntimePipe } from '../../shared/pipes/runtime.pipe';
import type { MovieDetail } from '../../core/models/movie.model';

@Component({
  selector: 'app-movie',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RatingStarsComponent, LoadingSpinnerComponent, RuntimePipe],
  template: `
    @if (loading()) {
      <app-loading-spinner />
    } @else if (movie(); as m) {
      <div class="detail">
        @if (m.backdropUrl) {
          <div class="detail__backdrop" [style.background-image]="'url(' + m.backdropUrl + ')'"></div>
        }

        <div class="detail__content container">
          <div class="detail__layout">
            <div class="detail__poster">
              @if (m.posterUrl) {
                <img [src]="m.posterUrl" [alt]="m.title + ' poster'" />
              } @else {
                <div class="detail__poster-placeholder">No Poster Available</div>
              }
            </div>

            <div class="detail__info">
              <h1>{{ m.title }}</h1>

              <div class="detail__meta">
                <span>{{ m.year }}</span>
                @if (m.runtime) {
                  <span>&bull; {{ m.runtime | runtime }}</span>
                }
                @if (m.originalLanguage) {
                  <span>&bull; {{ m.originalLanguage.toUpperCase() }}</span>
                }
              </div>

              @if (m.tagline) {
                <p class="detail__tagline">&ldquo;{{ m.tagline }}&rdquo;</p>
              }

              @if (m.overview) {
                <p class="detail__overview">{{ m.overview }}</p>
              }

              <div class="detail__ratings">
                @if (m.tmdbRating) {
                  <div class="detail__rating">
                    <span class="detail__rating-label">TMDb</span>
                    <app-rating-stars [rating]="m.tmdbRating / 2" />
                    <span class="detail__rating-value">{{ m.tmdbRating.toFixed(1) }}</span>
                  </div>
                }
                @if (m.imdbRating) {
                  <div class="detail__rating">
                    <span class="detail__rating-label">IMDb</span>
                    <span class="detail__rating-value">{{ m.imdbRating }}</span>
                  </div>
                }
                @if (m.rottenTomatoesRating) {
                  <div class="detail__rating">
                    <span class="detail__rating-label">RT</span>
                    <span class="detail__rating-value">{{ m.rottenTomatoesRating }}</span>
                  </div>
                }
              </div>

              <div class="detail__actions">
                @if (streamingUrl()) {
                  <a class="btn-primary" [routerLink]="['/watch', m.id]">Watch Film</a>
                }
                @if (!collection.isInWatchlist(m.id) && !collection.isWatched(m.id)) {
                  <button class="btn-secondary" (click)="addToWatchlist(m.id)">Add to Watchlist</button>
                } @else if (collection.isInWatchlist(m.id)) {
                  <button class="btn-secondary" (click)="removeFromWatchlist(m.id)">Remove from Watchlist</button>
                }
                @if (!collection.isWatched(m.id)) {
                  <button class="btn-secondary" (click)="markWatched(m.id)">Mark Watched</button>
                }
              </div>

              <div class="detail__links">
                @if (m.imdbId) {
                  <a [href]="'https://www.imdb.com/title/' + m.imdbId" target="_blank" rel="noopener">IMDb</a>
                }
                @if (m.internetArchiveId) {
                  <a [href]="'https://archive.org/details/' + m.internetArchiveId" target="_blank" rel="noopener">Internet Archive</a>
                }
              </div>

              @if (m.directors.length > 0) {
                <div class="detail__section">
                  <h3>Director{{ m.directors.length > 1 ? 's' : '' }}</h3>
                  <p>{{ m.directors.join(', ') }}</p>
                </div>
              }

              @if (m.genres.length > 0) {
                <div class="detail__section">
                  <h3>Genres</h3>
                  <div class="detail__tags">
                    @for (genre of m.genres; track genre) {
                      <span class="detail__tag">{{ genre }}</span>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          @if (m.cast.length > 0) {
            <section class="detail__section">
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
                    <p class="cast-card__character">{{ actor.character }}</p>
                  </div>
                }
              </div>
            </section>
          }
        </div>
      </div>
    } @else {
      <div class="container" style="padding: var(--space-2xl) 0; text-align: center;">
        <h2>Film not found</h2>
        <p class="text-secondary">This film is not in our catalog.</p>
        <a class="btn-primary" routerLink="/browse">Browse Films</a>
      </div>
    }
  `,
  styles: [`
    .detail__backdrop {
      height: 300px;
      background-size: cover;
      background-position: center;
      position: relative;
      opacity: 0.3;
    }
    .detail__content { padding: var(--space-xl) 0; }
    .detail__layout {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: var(--space-xl);
    }
    .detail__poster img {
      width: 100%;
      border-radius: var(--radius);
      box-shadow: var(--shadow-lg);
    }
    .detail__poster-placeholder {
      width: 100%;
      aspect-ratio: 2 / 3;
      background-color: var(--bg-raised);
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-tertiary);
    }
    .detail__meta {
      color: var(--text-secondary);
      font-size: 1.1rem;
      margin-bottom: var(--space-md);
      display: flex;
      gap: var(--space-sm);
    }
    .detail__tagline {
      font-style: italic;
      color: var(--accent-cream);
      font-size: 1.1rem;
      margin: 0 0 var(--space-md);
    }
    .detail__overview {
      color: var(--text-secondary);
      line-height: 1.7;
      margin: 0 0 var(--space-lg);
    }
    .detail__ratings {
      display: flex;
      gap: var(--space-xl);
      margin-bottom: var(--space-lg);
      flex-wrap: wrap;
    }
    .detail__rating {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }
    .detail__rating-label {
      color: var(--text-tertiary);
      font-size: 0.85rem;
      text-transform: uppercase;
    }
    .detail__rating-value {
      color: var(--accent-gold);
      font-weight: 600;
    }
    .detail__actions {
      display: flex;
      gap: var(--space-md);
      flex-wrap: wrap;
      margin-bottom: var(--space-lg);
    }
    .detail__links {
      display: flex;
      gap: var(--space-lg);
      margin-bottom: var(--space-lg);
    }
    .detail__section { margin-top: var(--space-xl); }
    .detail__tags {
      display: flex;
      gap: var(--space-sm);
      flex-wrap: wrap;
    }
    .detail__tag {
      background-color: var(--bg-raised);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: var(--space-xs) var(--space-md);
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
    .detail__cast {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: var(--space-md);
    }
    .cast-card { text-align: center; }
    .cast-card img {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      margin-bottom: var(--space-sm);
    }
    .cast-card__placeholder {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background-color: var(--bg-raised);
      margin: 0 auto var(--space-sm);
    }
    .cast-card__name {
      font-size: 0.9rem;
      font-weight: 600;
      margin: 0 0 2px;
    }
    .cast-card__character {
      font-size: 0.8rem;
      color: var(--text-tertiary);
      margin: 0;
    }
    @media (max-width: 768px) {
      .detail__layout { grid-template-columns: 1fr; }
      .detail__poster { max-width: 250px; margin: 0 auto; }
      .detail__backdrop { height: 200px; }
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

  readonly movie = signal<MovieDetail | null>(null);
  readonly loading = signal(true);
  readonly streamingUrl = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    await this.catalogService.load();
    const summary = this.catalogService.movies().find((m) => m.id === this.id());
    if (!summary) {
      this.loading.set(false);
      return;
    }
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
}
