import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { MovieSummary } from '../../core/models/movie.model';

@Component({
  selector: 'app-movie-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="list" role="list" aria-label="Movie list">
      @for (movie of movies(); track movie.id) {
        <a class="list-item" [routerLink]="['/movie', movie.id]" role="listitem"
          [attr.aria-label]="movie.title + ', ' + movie.year + (movie.voteAverage > 0 ? ', rated ' + movie.voteAverage.toFixed(1) : '') + (movie.isStreamable ? ', free to watch' : '')">
          <div class="list-item__poster">
            @if (movie.posterUrl) {
              <img [src]="movie.posterUrl" [alt]="movie.title + ' poster'" loading="lazy" />
            } @else {
              <div class="list-item__poster-placeholder">
                <span>{{ movie.year }}</span>
              </div>
            }
          </div>
          <div class="list-item__info">
            <h3 class="list-item__title">{{ movie.title }}</h3>
            <p class="list-item__meta">
              {{ movie.year }}
              @if (movie.directors.length > 0) {
                &middot; {{ movie.directors.join(', ') }}
              }
            </p>
            @if (movie.genres.length > 0) {
              <div class="list-item__genres">
                @for (g of movie.genres.slice(0, 3); track g) {
                  <span class="list-item__genre">{{ g }}</span>
                }
              </div>
            }
          </div>
          <div class="list-item__right" aria-hidden="true">
            @if (movie.voteAverage > 0) {
              <span class="list-item__rating">&#9733; {{ movie.voteAverage.toFixed(1) }}</span>
            }
            @if (movie.isStreamable) {
              <span class="list-item__badge">Free</span>
            }
          </div>
        </a>
      } @empty {
        <div class="list__empty">
          <p>No films found matching your criteria.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .list {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }
    .list-item {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-md);
      background-color: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      text-decoration: none;
      color: inherit;
      transition: border-color 0.2s, background-color 0.2s;
      min-height: 80px;
    }
    .list-item:hover {
      border-color: var(--accent-gold);
      background-color: var(--bg-hover);
      color: inherit;
    }
    .list-item__poster {
      width: 50px;
      flex-shrink: 0;
    }
    .list-item__poster img {
      width: 50px;
      height: 75px;
      object-fit: cover;
      border-radius: var(--radius);
    }
    .list-item__poster-placeholder {
      width: 50px;
      height: 75px;
      background: var(--bg-raised);
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-heading);
      font-size: 0.8rem;
      color: var(--text-tertiary);
    }
    .list-item__info {
      flex: 1;
      min-width: 0;
    }
    .list-item__title {
      font-size: 1.05rem;
      font-weight: 600;
      margin: 0 0 2px;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .list-item__meta {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin: 0 0 4px;
    }
    .list-item__genres {
      display: flex;
      gap: var(--space-xs);
    }
    .list-item__genre {
      font-size: 0.75rem;
      padding: 1px 8px;
      border: 1px solid var(--border);
      border-radius: 10px;
      color: var(--text-tertiary);
    }
    .list-item__right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
      flex-shrink: 0;
    }
    .list-item__rating {
      color: var(--accent-gold);
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 1rem;
    }
    .list-item__badge {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: var(--radius-sm);
      background-color: var(--accent-gold);
      color: var(--bg-deep);
    }
    .list__empty {
      text-align: center;
      padding: var(--space-3xl);
      color: var(--text-tertiary);
    }
  `],
})
export class MovieListComponent {
  readonly movies = input.required<MovieSummary[]>();
}
