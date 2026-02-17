import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="not-found container">
      <h1 class="not-found__code">404</h1>
      <p class="not-found__title">Page Not Found</p>
      <p class="not-found__text">The page you're looking for doesn't exist or has been moved.</p>
      <a class="not-found__cta" routerLink="/home">Back to Home</a>
    </div>
  `,
  styles: [`
    .not-found {
      text-align: center;
      padding: var(--space-3xl) var(--space-lg);
      min-height: 60vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .not-found__code {
      font-family: var(--font-heading);
      font-size: 5rem;
      font-weight: 700;
      color: var(--accent-gold);
      margin: 0 0 var(--space-sm);
      line-height: 1;
    }
    .not-found__title {
      font-family: var(--font-heading);
      font-size: 1.5rem;
      margin: 0 0 var(--space-sm);
    }
    .not-found__text {
      color: var(--text-tertiary);
      margin: 0 0 var(--space-xl);
      max-width: 400px;
    }
    .not-found__cta {
      display: inline-block;
      padding: var(--space-sm) var(--space-lg);
      background: var(--accent-gold);
      color: var(--bg-base);
      border-radius: var(--radius-lg);
      font-weight: 600;
      font-size: 0.9rem;
      text-decoration: none;
      transition: opacity 0.2s;
    }
    .not-found__cta:hover { opacity: 0.85; }
  `],
})
export class NotFoundComponent {}
