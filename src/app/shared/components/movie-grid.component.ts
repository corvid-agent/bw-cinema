import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { MovieCardComponent } from './movie-card.component';
import type { MovieSummary } from '../../core/models/movie.model';

@Component({
  selector: 'app-movie-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MovieCardComponent],
  template: `
    <div class="grid" role="list" aria-label="Movie list">
      @for (movie of movies(); track movie.id) {
        <div role="listitem">
          <app-movie-card [movie]="movie" />
        </div>
      } @empty {
        <div class="grid__empty">
          <p class="grid__empty-text">No films found matching your criteria.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: var(--space-lg) var(--space-md);
    }
    .grid__empty {
      grid-column: 1 / -1;
      text-align: center;
      padding: var(--space-3xl) var(--space-lg);
    }
    .grid__empty-text {
      color: var(--text-tertiary);
      font-size: 1.05rem;
    }
    @media (min-width: 1200px) {
      .grid {
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      }
    }
    @media (max-width: 480px) {
      .grid {
        grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
        gap: var(--space-md) var(--space-sm);
      }
    }
  `],
})
export class MovieGridComponent {
  readonly movies = input.required<MovieSummary[]>();
}
