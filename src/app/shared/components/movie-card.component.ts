import { Component, ChangeDetectionStrategy, input, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LazyImageDirective } from '../directives/lazy-image.directive';
import { CollectionService } from '../../core/services/collection.service';
import { NotificationService } from '../../core/services/notification.service';
import type { MovieSummary } from '../../core/models/movie.model';

@Component({
  selector: 'app-movie-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LazyImageDirective],
  template: `
    <a class="card" [routerLink]="['/movie', movie().id]" [attr.aria-label]="movie().title + ', ' + movie().year + (movie().voteAverage > 0 ? ', rated ' + movie().voteAverage.toFixed(1) + ' out of 10' : '') + (movie().internetArchiveId ? ', free on Internet Archive' : movie().youtubeId ? ', free on YouTube' : '')">
      <div class="card__poster">
        @if (movie().posterUrl && !imgFailed()) {
          <img appLazyImage [src]="movie().posterUrl" [alt]="movie().title + ' poster'" [class.loaded]="imgLoaded()" (load)="onImageLoad()" (error)="imgFailed.set(true)" />
        } @else {
          <div class="card__poster-placeholder">
            <span class="card__placeholder-title">{{ movie().title }}</span>
            <span class="card__placeholder-year">{{ movie().year }}</span>
            @if (movie().directors.length > 0) {
              <span class="card__placeholder-director">{{ movie().directors[0] }}</span>
            }
          </div>
        }
        <div class="card__overlay" aria-hidden="true">
          @if (collection.getUserRating(movie().id); as ur) {
            <span class="card__user-rating" title="Your rating">{{ ur }}/10</span>
          } @else if (movie().voteAverage > 0) {
            <span class="card__rating">{{ movie().voteAverage.toFixed(1) }}</span>
          }
          @if (movie().internetArchiveId) {
            <span class="card__badge card__badge--ia">IA</span>
          } @else if (movie().youtubeId) {
            <span class="card__badge card__badge--yt">YT</span>
          } @else if (movie().imdbId) {
            <span class="card__badge card__badge--imdb">IMDb</span>
          }
        </div>
        <div class="card__hover-info" aria-hidden="true">
          @if (movie().directors.length > 0) {
            <span class="card__hover-director">{{ movie().directors[0] }}</span>
          }
          @if (movie().genres.length > 0) {
            <span class="card__hover-genres">{{ movie().genres.slice(0, 2).join(' / ') }}</span>
          }
        </div>
        @if (collection.isFavorite(movie().id)) {
          <span class="card__heart" aria-label="Favorited">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </span>
        }
        <div class="card__actions">
          @if (collection.isWatched(movie().id)) {
            <button class="card__action card__action--watched" aria-label="Watched" (click)="onAction($event)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
          } @else if (collection.isInWatchlist(movie().id)) {
            <button class="card__action card__action--inlist" aria-label="In watchlist" (click)="removeFromWatchlist($event)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
          } @else {
            <button class="card__action" [attr.aria-label]="'Add ' + movie().title + ' to watchlist'" (click)="addToWatchlist($event)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          }
        </div>
      </div>
      <div class="card__info">
        <h3 class="card__title">{{ movie().title }}</h3>
        <div class="card__meta">
          <span class="card__year">{{ movie().year }}</span>
          @if (movie().genres.length > 0) {
            <span class="card__divider">&middot;</span>
            <span class="card__genre">{{ movie().genres[0] }}</span>
          }
          @if (movie().directors.length > 1) {
            <span class="card__co-dir" title="Co-directed by {{ movie().directors.join(', ') }}">{{ movie().directors.length }}dir</span>
          }
          @if (movie().language && movie().language !== 'en') {
            <span class="card__lang">{{ (movie().language ?? '').toUpperCase() }}</span>
          }
        </div>
      </div>
    </a>
  `,
  styles: [`
    .card {
      display: block;
      text-decoration: none;
      color: inherit;
      border-radius: var(--radius-lg);
      overflow: hidden;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
      cursor: pointer;
      background: transparent;
    }
    @media (hover: hover) and (pointer: fine) {
      .card:hover {
        transform: translateY(-6px) scale(1.02);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
      }
      .card:hover .card__poster {
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px var(--accent-gold);
      }
      .card:hover .card__poster img {
        transform: scale(1.05);
      }
    }
    .card__poster {
      position: relative;
      aspect-ratio: 2 / 3;
      background-color: var(--bg-raised);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-poster);
    }
    .card__poster img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease, filter 0.4s ease;
      filter: blur(8px);
    }
    .card__poster img.loaded {
      filter: blur(0);
    }
    .card__poster-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: var(--space-lg);
      text-align: center;
      background: linear-gradient(170deg, #1a1a1a 0%, #222 40%, #1a1a1a 100%);
    }
    .card__placeholder-title {
      font-family: var(--font-heading);
      font-size: 0.95rem;
      color: var(--text-secondary);
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .card__placeholder-year {
      font-size: 1.5rem;
      color: var(--accent-gold);
      font-weight: 700;
      font-family: var(--font-heading);
      opacity: 0.6;
    }
    .card__placeholder-director {
      font-size: 0.8rem;
      color: var(--text-tertiary);
      font-style: italic;
    }
    .card__overlay {
      position: absolute;
      top: var(--space-sm);
      left: var(--space-sm);
      right: var(--space-sm);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      pointer-events: none;
    }
    .card__rating {
      background-color: rgba(0, 0, 0, 0.75);
      color: var(--accent-gold);
      font-size: 0.8rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: var(--radius-sm);
      backdrop-filter: blur(4px);
    }
    .card__user-rating {
      background-color: rgba(25, 135, 84, 0.85);
      color: #fff;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: var(--radius-sm);
      backdrop-filter: blur(4px);
    }
    .card__badge {
      background-color: var(--accent-gold);
      color: var(--bg-deep);
      font-size: 0.7rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: var(--radius-sm);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-left: auto;
    }
    .card__badge--ia {
      background-color: rgba(25, 135, 84, 0.9);
      color: #fff;
    }
    .card__badge--yt {
      background-color: rgba(255, 0, 0, 0.85);
      color: #fff;
    }
    .card__badge--imdb {
      background-color: rgba(245, 197, 24, 0.85);
      color: #000;
    }
    .card__hover-info {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: var(--space-md) var(--space-sm) var(--space-sm);
      background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%);
      display: flex;
      flex-direction: column;
      gap: 2px;
      opacity: 0;
      transform: translateY(4px);
      transition: opacity 0.25s ease, transform 0.25s ease;
      pointer-events: none;
    }
    @media (hover: hover) and (pointer: fine) {
      .card:hover .card__hover-info {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .card__hover-director {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--accent-gold);
    }
    .card__hover-genres {
      font-size: 0.7rem;
      color: rgba(255,255,255,0.7);
    }
    .card__lang {
      font-size: 0.65rem;
      font-weight: 700;
      padding: 1px 4px;
      border-radius: 3px;
      background: var(--bg-raised);
      color: var(--text-tertiary);
      letter-spacing: 0.04em;
      margin-left: auto;
    }
    .card__heart {
      position: absolute;
      bottom: var(--space-sm);
      right: var(--space-sm);
      color: #e53e3e;
      filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
      pointer-events: none;
    }
    .card__actions {
      position: absolute;
      bottom: var(--space-sm);
      left: var(--space-sm);
      display: flex;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.2s ease;
      pointer-events: auto;
      z-index: 2;
    }
    @media (hover: hover) and (pointer: fine) {
      .card:hover .card__actions { opacity: 1; }
    }
    @media (hover: none) {
      .card__actions { opacity: 1; }
    }
    .card__action {
      width: 28px;
      height: 28px;
      min-width: 28px;
      min-height: 28px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;
      cursor: pointer;
      backdrop-filter: blur(4px);
      transition: background-color 0.2s, border-color 0.2s, transform 0.15s;
    }
    .card__action:hover {
      background: var(--accent-gold);
      border-color: var(--accent-gold);
      color: var(--bg-deep);
      transform: scale(1.15);
    }
    .card__action--watched {
      background: rgba(25, 135, 84, 0.8);
      border-color: rgba(25, 135, 84, 0.9);
      cursor: default;
    }
    .card__action--inlist {
      background: rgba(200, 170, 60, 0.7);
      border-color: var(--accent-gold);
    }
    .card__info {
      padding: 10px 4px 4px;
    }
    .card__title {
      font-family: var(--font-body);
      font-size: 0.9rem;
      font-weight: 600;
      margin: 0 0 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--text-primary);
      letter-spacing: 0;
    }
    .card__meta {
      display: flex;
      gap: 5px;
      align-items: center;
    }
    .card__year {
      color: var(--text-tertiary);
      font-size: 0.8rem;
    }
    .card__divider {
      color: var(--text-tertiary);
      font-size: 0.7rem;
    }
    .card__co-dir {
      font-size: 0.65rem;
      font-weight: 600;
      padding: 1px 4px;
      border-radius: 3px;
      background: var(--accent-gold-dim);
      color: var(--accent-gold);
      letter-spacing: 0.02em;
    }
    .card__genre {
      color: var(--text-tertiary);
      font-size: 0.8rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `],
})
export class MovieCardComponent {
  readonly movie = input.required<MovieSummary>();
  readonly imgFailed = signal(false);
  readonly imgLoaded = signal(false);
  protected readonly collection = inject(CollectionService);
  private readonly notifications = inject(NotificationService);

  onImageLoad(): void {
    this.imgLoaded.set(true);
  }

  addToWatchlist(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.collection.addToWatchlist(this.movie().id);
    this.notifications.show(`Added "${this.movie().title}" to watchlist`, 'success');
  }

  removeFromWatchlist(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.collection.removeFromWatchlist(this.movie().id);
    this.notifications.show(`Removed from watchlist`, 'info');
  }

  onAction(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }
}
