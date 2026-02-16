import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <div class="header__inner container">
        <a class="header__logo" routerLink="/home">BW Cinema</a>
        <button
          class="header__hamburger"
          (click)="menuOpen.set(!menuOpen())"
          [attr.aria-expanded]="menuOpen()"
          aria-label="Toggle navigation menu"
        >
          <span class="header__hamburger-bar"></span>
          <span class="header__hamburger-bar"></span>
          <span class="header__hamburger-bar"></span>
        </button>
        <nav class="header__nav" [class.header__nav--open]="menuOpen()" role="navigation" aria-label="Main navigation">
          <a routerLink="/home" routerLinkActive="active" (click)="menuOpen.set(false)">Home</a>
          <a routerLink="/browse" routerLinkActive="active" (click)="menuOpen.set(false)">Browse</a>
          <a routerLink="/collection" routerLinkActive="active" (click)="menuOpen.set(false)">My Collection</a>
          <a routerLink="/about" routerLinkActive="active" (click)="menuOpen.set(false)">About</a>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background-color: var(--bg-surface);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .header__inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
    }
    .header__logo {
      font-family: var(--font-heading);
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--accent-gold);
      text-decoration: none;
    }
    .header__logo:hover { color: var(--accent-cream); }
    .header__nav {
      display: flex;
      gap: var(--space-lg);
    }
    .header__nav a {
      color: var(--text-secondary);
      font-size: 1rem;
      padding: var(--space-sm) 0;
      border-bottom: 2px solid transparent;
      transition: color 0.2s, border-color 0.2s;
    }
    .header__nav a:hover,
    .header__nav a.active {
      color: var(--text-primary);
      border-bottom-color: var(--accent-gold);
    }
    .header__hamburger {
      display: none;
      flex-direction: column;
      gap: 5px;
      background: none;
      border: none;
      padding: var(--space-sm);
      cursor: pointer;
      min-height: 44px;
      min-width: 44px;
      align-items: center;
      justify-content: center;
    }
    .header__hamburger-bar {
      display: block;
      width: 24px;
      height: 2px;
      background-color: var(--text-primary);
      transition: transform 0.2s;
    }
    @media (max-width: 768px) {
      .header__hamburger { display: flex; }
      .header__nav {
        display: none;
        position: absolute;
        top: 64px;
        left: 0;
        right: 0;
        background-color: var(--bg-surface);
        flex-direction: column;
        padding: var(--space-md);
        border-bottom: 1px solid var(--border);
        gap: var(--space-sm);
      }
      .header__nav--open { display: flex; }
      .header__nav a {
        padding: var(--space-sm) var(--space-md);
        border-bottom: none;
      }
    }
  `],
})
export class HeaderComponent {
  readonly menuOpen = signal(false);
}
