import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="skeleton-grid" aria-hidden="true">
      @for (i of items; track i) {
        <div class="skeleton-card">
          <div class="skeleton-card__poster skeleton-shimmer"></div>
          <div class="skeleton-card__info">
            <div class="skeleton-card__title skeleton-shimmer"></div>
            <div class="skeleton-card__meta skeleton-shimmer"></div>
          </div>
        </div>
      }
    </div>
    <span class="sr-only" role="status">Loading films...</span>
  `,
  styles: [`
    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: var(--space-lg) var(--space-md);
    }
    .skeleton-card__poster {
      aspect-ratio: 2 / 3;
      border-radius: var(--radius-lg);
    }
    .skeleton-card__info {
      padding: 10px 4px 4px;
    }
    .skeleton-card__title {
      height: 14px;
      width: 80%;
      border-radius: var(--radius-sm);
      margin-bottom: 6px;
    }
    .skeleton-card__meta {
      height: 12px;
      width: 50%;
      border-radius: var(--radius-sm);
    }
    .skeleton-shimmer {
      background: linear-gradient(
        90deg,
        var(--bg-raised) 25%,
        var(--bg-hover) 50%,
        var(--bg-raised) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    @media (prefers-reduced-motion: reduce) {
      .skeleton-shimmer {
        animation: none;
        background: var(--bg-raised);
      }
    }
    @media (min-width: 1200px) {
      .skeleton-grid {
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      }
    }
    @media (max-width: 480px) {
      .skeleton-grid {
        grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
        gap: var(--space-md) var(--space-sm);
      }
    }
  `],
})
export class SkeletonGridComponent {
  readonly count = input(12);
  get items(): number[] {
    return Array.from({ length: this.count() }, (_, i) => i);
  }
}
