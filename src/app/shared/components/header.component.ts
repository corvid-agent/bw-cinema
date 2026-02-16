import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <div class="header__inner container">
        <a class="header__logo" routerLink="/home">
          <span class="header__logo-icon">&#9670;</span>
          BW Cinema
        </a>
        <button
          class="header__hamburger"
          (click)="menuOpen.set(!menuOpen())"
          [attr.aria-expanded]="menuOpen()"
          aria-label="Toggle navigation menu"
        >
          <span class="header__hamburger-bar" [class.open]="menuOpen()"></span>
          <span class="header__hamburger-bar" [class.open]="menuOpen()"></span>
          <span class="header__hamburger-bar" [class.open]="menuOpen()"></span>
        </button>
        <nav class="header__nav" [class.header__nav--open]="menuOpen()" role="navigation" aria-label="Main navigation">
          <a routerLink="/home" routerLinkActive="active" (click)="menuOpen.set(false)">Home</a>
          <a routerLink="/browse" routerLinkActive="active" (click)="menuOpen.set(false)">Browse</a>
          <a routerLink="/collection" routerLinkActive="active" (click)="menuOpen.set(false)">Collection</a>
          <a routerLink="/about" routerLinkActive="active" (click)="menuOpen.set(false)">About</a>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background-color: rgba(13, 13, 13, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .header__inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 60px;
    }
    .header__logo {
      font-family: var(--font-heading);
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--text-primary);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      letter-spacing: 0.02em;
    }
    .header__logo-icon {
      color: var(--accent-gold);
      font-size: 0.7rem;
    }
    .header__logo:hover { color: var(--accent-gold); }
    .header__nav {
      display: flex;
      gap: var(--space-xs);
    }
    .header__nav a {
      color: var(--text-tertiary);
      font-size: 0.9rem;
      font-weight: 600;
      padding: 6px 14px;
      border-radius: var(--radius);
      transition: color 0.2s, background-color 0.2s;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .header__nav a:hover {
      color: var(--text-primary);
      background-color: var(--bg-hover);
    }
    .header__nav a.active {
      color: var(--accent-gold);
      background-color: var(--accent-gold-dim);
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
      width: 22px;
      height: 2px;
      background-color: var(--text-primary);
      transition: transform 0.3s, opacity 0.3s;
      border-radius: 1px;
    }
    .header__hamburger-bar.open:nth-child(1) {
      transform: translateY(7px) rotate(45deg);
    }
    .header__hamburger-bar.open:nth-child(2) {
      opacity: 0;
    }
    .header__hamburger-bar.open:nth-child(3) {
      transform: translateY(-7px) rotate(-45deg);
    }
    @media (max-width: 768px) {
      .header__hamburger { display: flex; }
      .header__nav {
        display: none;
        position: absolute;
        top: 60px;
        left: 0;
        right: 0;
        background-color: rgba(13, 13, 13, 0.95);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        flex-direction: column;
        padding: var(--space-sm) var(--space-md);
        border-bottom: 1px solid var(--border);
        gap: 2px;
      }
      .header__nav--open { display: flex; }
      .header__nav a {
        padding: var(--space-md);
        border-radius: var(--radius);
      }
    }
  `],
})
export class HeaderComponent {
  readonly menuOpen = signal(false);
}
