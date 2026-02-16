import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-rating-stars',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="stars"
      [class.stars--interactive]="interactive()"
      role="img"
      [attr.aria-label]="'Rating: ' + displayRating().toFixed(1) + ' out of 5'"
    >
      @for (star of starArray(); track star) {
        @if (interactive()) {
          <button
            class="stars__star"
            [class.stars__star--filled]="star <= displayRating()"
            [class.stars__star--half]="star - 0.5 === displayRating()"
            (click)="rated.emit(star)"
            [attr.aria-label]="'Rate ' + star + ' stars'"
          >&#9733;</button>
        } @else {
          <span
            class="stars__star"
            [class.stars__star--filled]="star <= displayRating()"
          >&#9733;</span>
        }
      }
    </div>
  `,
  styles: [`
    .stars { display: inline-flex; gap: 2px; }
    .stars__star {
      font-size: 1.3rem;
      color: var(--border-bright);
      transition: color 0.15s;
      background: none;
      border: none;
      padding: 0;
      cursor: default;
      min-height: auto;
      min-width: auto;
    }
    .stars__star--filled { color: var(--accent-gold); }
    .stars--interactive .stars__star {
      cursor: pointer;
      min-height: 44px;
      min-width: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .stars--interactive .stars__star:hover { color: var(--accent-cream); }
  `],
})
export class RatingStarsComponent {
  readonly rating = input(0);
  readonly maxStars = input(5);
  readonly interactive = input(false);
  readonly rated = output<number>();

  readonly displayRating = computed(() => {
    const r = this.rating();
    return Math.round(r * 2) / 2;
  });

  readonly starArray = computed(() =>
    Array.from({ length: this.maxStars() }, (_, i) => i + 1)
  );
}
