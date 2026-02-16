import { Component, ChangeDetectionStrategy, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { MovieSummary } from '../../core/models/movie.model';

@Component({
  selector: 'app-movie-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <a class="card" [routerLink]="['/movie', movie().id]" [attr.aria-label]="movie().title + ' (' + movie().year + ')'">
      <div class="card__poster">
        @if (movie().posterUrl && !imgFailed()) {
          <img [src]="movie().posterUrl" [alt]="movie().title + ' poster'" loading="lazy" (error)="imgFailed.set(true)" />
        } @else {
          <div class="card__poster-placeholder">
            <span class="card__film-icon">&#127902;</span>
            <span class="card__placeholder-title">{{ movie().title }}</span>
            <span class="card__placeholder-year">{{ movie().year }}</span>
            @if (movie().directors.length > 0) {
              <span class="card__placeholder-director">{{ movie().directors[0] }}</span>
            }
          </div>
        }
        @if (movie().isStreamable) {
          <span class="card__badge">&#9654; Watch Free</span>
        }
      </div>
      <div class="card__info">
        <h3 class="card__title">{{ movie().title }}</h3>
        <div class="card__meta">
          <span class="card__year">{{ movie().year }}</span>
          @if (movie().genres.length > 0) {
            <span class="card__genre">&bull; {{ movie().genres[0] }}</span>
          }
        </div>
        @if (movie().voteAverage > 0) {
          <p class="card__rating">&#9733; {{ movie().voteAverage.toFixed(1) }}</p>
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
      cursor: pointer;
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
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: var(--space-md);
      text-align: center;
      background: linear-gradient(160deg, #1a1a1a 0%, #252525 50%, #1e1e1e 100%);
    }
    .card__film-icon {
      font-size: 2.5rem;
      opacity: 0.6;
      margin-bottom: var(--space-sm);
    }
    .card__placeholder-title {
      font-family: var(--font-heading);
      font-size: 0.95rem;
      color: var(--accent-cream);
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .card__placeholder-year {
      font-size: 1.1rem;
      color: var(--accent-gold);
      font-weight: 600;
    }
    .card__placeholder-director {
      font-size: 0.8rem;
      color: var(--text-tertiary);
      font-style: italic;
    }
    .card__badge {
      position: absolute;
      top: var(--space-sm);
      right: var(--space-sm);
      background-color: var(--accent-gold);
      color: var(--bg-deep);
      font-size: 0.75rem;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: var(--radius-sm);
    }
    .card__info {
      padding: var(--space-sm) var(--space-md) var(--space-md);
    }
    .card__title {
      font-family: var(--font-heading);
      font-size: 1rem;
      margin: 0 0 var(--space-xs);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .card__meta {
      display: flex;
      gap: var(--space-xs);
      align-items: center;
    }
    .card__year {
      color: var(--text-secondary);
      font-size: 0.85rem;
    }
    .card__genre {
      color: var(--text-tertiary);
      font-size: 0.8rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
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
  readonly imgFailed = signal(false);
}
