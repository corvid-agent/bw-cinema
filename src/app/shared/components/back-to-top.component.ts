import { Component, ChangeDetectionStrategy, signal, HostListener } from '@angular/core';

@Component({
  selector: 'app-back-to-top',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <button class="btt" (click)="scrollToTop()" aria-label="Back to top">
        &#9650;
      </button>
    }
  `,
  styles: [`
    .btt {
      position: fixed;
      bottom: var(--space-xl);
      left: var(--space-xl);
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-color: var(--accent-gold);
      color: var(--bg-deep);
      font-size: 1.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-md);
      cursor: pointer;
      border: none;
      transition: background-color 0.2s;
      z-index: 50;
    }
    .btt:hover { background-color: var(--accent-cream); }
    @media (max-width: 768px) {
      .btt {
        bottom: calc(var(--space-xl) + 60px);
      }
    }
  `],
})
export class BackToTopComponent {
  readonly visible = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    this.visible.set(window.scrollY > 400);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
