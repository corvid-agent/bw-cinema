import { Component, ChangeDetectionStrategy, input, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LazyImageDirective } from '../directives/lazy-image.directive';
import { CollectionService } from '../../core/services/collection.service';
import type { MovieSummary } from '../../core/models/movie.model';

@Component({
  selector: 'app-movie-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LazyImageDirective],
  template: `
    <a class="card" [routerLink]="['/movie', movie().id]" [attr.aria-label]="movie().title + ', ' + movie().year + (movie().voteAverage > 0 ? ', rated ' + movie().voteAverage.toFixed(1) + ' out of 10' : '') + (movie().isStreamable ? ', free to watch' : '')">
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
          @if (movie().voteAverage > 0) {
            <span class="card__rating">{{ movie().voteAverage.toFixed(1) }}</span>
          }
          @if (movie().isStreamable) {
            <span class="card__badge">Free</span>
          }
        </div>
        @if (collection.isFavorite(movie().id)) {
          <span class="card__heart" aria-label="Favorited">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </span>
        }
      </div>
      <div class="card__info">
        <h3 class="card__title">{{ movie().title }}</h3>
        <div class="card__meta">
          <span class="card__year">{{ movie().year }}</span>
          @if (movie().genres.length > 0) {
            <span class="card__divider">&middot;</span>
            <span class="card__genre">{{ movie().genres[0] }}</span>
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
    .card:hover {
      transform: translateY(-6px) scale(1.02);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
    }
    .card__poster {
      position: relative;
      aspect-ratio: 2 / 3;
      background-color: var(--bg-raised);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-poster);
    }
    .card:hover .card__poster {
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px var(--accent-gold);
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
    .card:hover .card__poster img {
      transform: scale(1.05);
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
    .card__heart {
      position: absolute;
      bottom: var(--space-sm);
      right: var(--space-sm);
      color: #e53e3e;
      filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
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

  onImageLoad(): void {
    this.imgLoaded.set(true);
  }
}
