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
        <p class="grid__empty">No films found matching your criteria.</p>
      }
    </div>
  `,
  styles: [`
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: var(--space-lg);
    }
    .grid__empty {
      grid-column: 1 / -1;
      text-align: center;
      color: var(--text-secondary);
      padding: var(--space-2xl);
      font-size: 1.1rem;
    }
    @media (max-width: 480px) {
      .grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: var(--space-md);
      }
    }
  `],
})
export class MovieGridComponent {
  readonly movies = input.required<MovieSummary[]>();
}
