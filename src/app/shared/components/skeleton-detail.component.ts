import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-skeleton-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="skeleton-detail" aria-hidden="true">
      <div class="skeleton-detail__hero skeleton-shimmer"></div>
      <div class="skeleton-detail__content container">
        <div class="skeleton-detail__layout">
          <div class="skeleton-detail__poster skeleton-shimmer"></div>
          <div class="skeleton-detail__info">
            <div class="skeleton-detail__title skeleton-shimmer"></div>
            <div class="skeleton-detail__meta skeleton-shimmer"></div>
            <div class="skeleton-detail__tagline skeleton-shimmer"></div>
            <div class="skeleton-detail__text skeleton-shimmer"></div>
            <div class="skeleton-detail__text skeleton-detail__text--short skeleton-shimmer"></div>
            <div class="skeleton-detail__actions">
              <div class="skeleton-detail__btn skeleton-shimmer"></div>
              <div class="skeleton-detail__btn skeleton-shimmer"></div>
              <div class="skeleton-detail__btn skeleton-detail__btn--small skeleton-shimmer"></div>
            </div>
            <div class="skeleton-detail__row skeleton-shimmer"></div>
            <div class="skeleton-detail__row skeleton-detail__row--short skeleton-shimmer"></div>
          </div>
        </div>
      </div>
    </div>
    <span class="sr-only" role="status">Loading film details...</span>
  `,
  styles: [`
    .skeleton-detail__hero {
      height: 350px;
      background: linear-gradient(180deg, var(--bg-raised) 0%, var(--bg-deep) 100%);
    }
    .skeleton-detail__content {
      margin-top: -120px;
      position: relative;
      padding-bottom: var(--space-2xl);
    }
    .skeleton-detail__layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: var(--space-xl);
    }
    .skeleton-detail__poster {
      aspect-ratio: 2 / 3;
      border-radius: var(--radius-lg);
    }
    .skeleton-detail__title {
      height: 36px;
      width: 70%;
      border-radius: var(--radius);
      margin-bottom: var(--space-md);
    }
    .skeleton-detail__meta {
      height: 16px;
      width: 40%;
      border-radius: var(--radius-sm);
      margin-bottom: var(--space-lg);
    }
    .skeleton-detail__tagline {
      height: 16px;
      width: 55%;
      border-radius: var(--radius-sm);
      margin-bottom: var(--space-md);
    }
    .skeleton-detail__text {
      height: 14px;
      width: 100%;
      border-radius: var(--radius-sm);
      margin-bottom: var(--space-sm);
    }
    .skeleton-detail__text--short {
      width: 75%;
      margin-bottom: var(--space-xl);
    }
    .skeleton-detail__actions {
      display: flex;
      gap: var(--space-sm);
      margin-bottom: var(--space-xl);
    }
    .skeleton-detail__btn {
      height: 48px;
      width: 140px;
      border-radius: var(--radius-lg);
    }
    .skeleton-detail__btn--small {
      width: 100px;
    }
    .skeleton-detail__row {
      height: 14px;
      width: 60%;
      border-radius: var(--radius-sm);
      margin-bottom: var(--space-sm);
    }
    .skeleton-detail__row--short {
      width: 40%;
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
    @media (max-width: 768px) {
      .skeleton-detail__hero { height: 220px; }
      .skeleton-detail__content { margin-top: -60px; }
      .skeleton-detail__layout {
        grid-template-columns: 1fr;
        gap: var(--space-lg);
      }
      .skeleton-detail__poster {
        max-width: 200px;
        margin: 0 auto;
      }
    }
  `],
})
export class SkeletonDetailComponent {}
