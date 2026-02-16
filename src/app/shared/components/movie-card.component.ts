import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { MovieSummary } from '../../core/models/movie.model';

@Component({
  selector: 'app-movie-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <a class="card" [routerLink]="['/movie', movie().id]" [attr.aria-label]="movie().title + ' (' + movie().year + ')'">
      <div class="card__poster">
        @if (movie().posterUrl) {
          <img [src]="movie().posterUrl" [alt]="movie().title + ' poster'" loading="lazy" />
        } @else {
          <div class="card__poster-placeholder">
            <span>No Poster</span>
          </div>
        }
        @if (movie().isStreamable) {
          <span class="card__badge">Watch Free</span>
        }
      </div>
      <div class="card__info">
        <h3 class="card__title">{{ movie().title }}</h3>
        <p class="card__year">{{ movie().year }}</p>
        @if (movie().voteAverage > 0) {
          <p class="card__rating">{{ movie().voteAverage.toFixed(1) }}</p>
        }
      </div>
    </a>
  `,
  styles: [`
    .card {
      display: block;
      text-decoration: none;
      color: inherit;
      background-color: var(--bg-surface);
      border-radius: var(--radius);
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
      border: 1px solid var(--border);
    }
    .card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
      border-color: var(--accent-gold);
    }
    .card__poster {
      position: relative;
      aspect-ratio: 2 / 3;
      background-color: var(--bg-raised);
      overflow: hidden;
    }
    .card__poster img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .card__poster-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-tertiary);
      font-size: 0.9rem;
    }
    .card__badge {
      position: absolute;
      top: var(--space-sm);
      right: var(--space-sm);
      background-color: var(--accent-gold);
      color: var(--bg-deep);
      font-size: 0.75rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: var(--radius-sm);
    }
    .card__info {
      padding: var(--space-sm) var(--space-md);
    }
    .card__title {
      font-family: var(--font-heading);
      font-size: 1rem;
      margin: 0 0 var(--space-xs);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .card__year {
      color: var(--text-secondary);
      font-size: 0.85rem;
      margin: 0;
    }
    .card__rating {
      color: var(--accent-gold);
      font-size: 0.85rem;
      font-weight: 600;
      margin: var(--space-xs) 0 0;
    }
  `],
})
export class MovieCardComponent {
  readonly movie = input.required<MovieSummary>();
}
