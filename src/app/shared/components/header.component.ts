import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { AccessibilityService } from '../../core/services/accessibility.service';

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
          <a routerLink="/compare" routerLinkActive="active" (click)="menuOpen.set(false)">Compare</a>
          <a routerLink="/explore" routerLinkActive="active" (click)="menuOpen.set(false)">Explore</a>
          <a routerLink="/stats" routerLinkActive="active" (click)="menuOpen.set(false)">Stats</a>
          <a routerLink="/about" routerLinkActive="active" (click)="menuOpen.set(false)">About</a>
          <button
            class="header__theme-toggle"
            (click)="theme.toggle()"
            [attr.aria-label]="theme.theme() === 'dark' ? 'Switch to sepia theme' : 'Switch to dark theme'"
            [attr.title]="theme.theme() === 'dark' ? 'Sepia mode' : 'Dark mode'"
          >
            @if (theme.theme() === 'dark') {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            } @else {
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>
          <button
            class="header__a11y-toggle"
            (click)="a11y.panelOpen.set(!a11y.panelOpen())"
            [attr.aria-expanded]="a11y.panelOpen()"
            aria-label="Accessibility settings"
            title="Accessibility settings"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4.5" r="2.5"/><path d="M12 7v5"/><path d="m8 10 4 2 4-2"/><path d="m9 22 3-7 3 7"/></svg>
          </button>
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
    .header__theme-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      min-width: 36px;
      min-height: 36px;
      padding: 0;
      border-radius: 50%;
      background: var(--bg-hover);
      border: 1px solid var(--border);
      color: var(--accent-gold);
      cursor: pointer;
      transition: background-color 0.2s, border-color 0.2s;
      margin-left: var(--space-sm);
    }
    .header__theme-toggle:hover,
    .header__a11y-toggle:hover {
      background: var(--accent-gold-dim);
      border-color: var(--accent-gold);
    }
    .header__a11y-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      min-width: 36px;
      min-height: 36px;
      padding: 0;
      border-radius: 50%;
      background: var(--bg-hover);
      border: 1px solid var(--border);
      color: var(--accent-gold);
      cursor: pointer;
      transition: background-color 0.2s, border-color 0.2s;
      margin-left: 4px;
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
      .header__nav--open {
        display: flex;
        max-height: calc(100vh - 60px);
        max-height: calc(100dvh - 60px);
        overflow-y: auto;
        z-index: 99;
        padding-bottom: env(safe-area-inset-bottom, 0px);
      }
      .header__nav a {
        padding: var(--space-md);
        border-radius: var(--radius);
      }
      .header__theme-toggle,
      .header__a11y-toggle {
        align-self: flex-start;
        margin: var(--space-sm) 0 var(--space-sm) var(--space-md);
      }
    }
  `],
})
export class HeaderComponent implements OnInit {
  private readonly router = inject(Router);
  readonly theme = inject(ThemeService);
  readonly a11y = inject(AccessibilityService);
  readonly menuOpen = signal(false);

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.menuOpen.set(false);
      }
    });
  }
}
