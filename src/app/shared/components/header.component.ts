import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../core/services/theme.service';
import { AccessibilityService } from '../../core/services/accessibility.service';
import { CollectionService } from '../../core/services/collection.service';
import { CatalogService } from '../../core/services/catalog.service';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, FormsModule],
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
          <a routerLink="/collection" routerLinkActive="active" (click)="menuOpen.set(false)" class="header__nav-collection">
            Collection
            @if (watchlistCount() > 0) {
              <span class="header__badge">{{ watchlistCount() }}</span>
            }
          </a>
          <a routerLink="/compare" routerLinkActive="active" (click)="menuOpen.set(false)">Compare</a>
          <a routerLink="/explore" routerLinkActive="active" (click)="menuOpen.set(false)">Explore</a>
          <a routerLink="/stats" routerLinkActive="active" (click)="menuOpen.set(false)">Stats</a>
          <a routerLink="/about" routerLinkActive="active" (click)="menuOpen.set(false)">About</a>
          <form class="header__search" (ngSubmit)="onSearch()" role="search">
            <svg class="header__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              #searchInput
              class="header__search-input"
              type="search"
              placeholder="Search films..."
              [(ngModel)]="searchQuery"
              name="q"
              aria-label="Search films (press / to focus)"
              (keydown.escape)="clearSearch()"
              (keydown.arrowDown)="navigateResults($event, 1)"
              (keydown.arrowUp)="navigateResults($event, -1)"
              (focus)="searchFocused.set(true)"
              (blur)="onSearchBlur()"
              autocomplete="off"
            />
            @if (searchResults().length > 0 && searchFocused()) {
              <div class="header__autocomplete" role="listbox">
                @for (result of searchResults(); track result.id; let i = $index) {
                  <a
                    class="header__autocomplete-item"
                    [class.header__autocomplete-item--active]="i === activeResultIndex()"
                    [routerLink]="['/movie', result.id]"
                    (mousedown)="selectResult(result.id)"
                    role="option"
                  >
                    @if (result.posterUrl) {
                      <img [src]="result.posterUrl" [alt]="result.title" />
                    } @else {
                      <div class="header__autocomplete-placeholder"></div>
                    }
                    <div class="header__autocomplete-info">
                      <span class="header__autocomplete-title">{{ result.title }}</span>
                      <span class="header__autocomplete-meta">{{ result.year }} · {{ result.directors.slice(0, 2).join(', ') }}</span>
                    </div>
                    @if (result.voteAverage > 0) {
                      <span class="header__autocomplete-rating">&#9733; {{ result.voteAverage.toFixed(1) }}</span>
                    }
                  </a>
                }
                <a class="header__autocomplete-all" routerLink="/browse" [queryParams]="{ q: searchQuery() }" (mousedown)="onSearch()">
                  View all results &rarr;
                </a>
              </div>
            }
          </form>
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
    .header__nav-collection {
      position: relative;
    }
    .header__badge {
      background-color: var(--accent-gold);
      color: var(--bg-deep);
      font-size: 0.65rem;
      font-weight: 700;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-left: 4px;
      vertical-align: super;
      line-height: 1;
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
    .header__search {
      position: relative;
      display: flex;
      align-items: center;
      margin-left: var(--space-sm);
    }
    .header__search-icon {
      position: absolute;
      left: 10px;
      color: var(--text-tertiary);
      pointer-events: none;
    }
    .header__search-input {
      width: 180px;
      height: 34px;
      padding: 0 10px 0 32px;
      background: var(--bg-hover);
      border: 1px solid var(--border);
      border-radius: 17px;
      color: var(--text-primary);
      font-size: 0.85rem;
      transition: width 0.3s ease, border-color 0.2s;
      min-height: auto;
    }
    .header__search-input:focus {
      width: 240px;
      border-color: var(--accent-gold);
      outline: none;
    }
    .header__search-input::placeholder {
      color: var(--text-tertiary);
    }
    .header__autocomplete {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      margin-top: 4px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      z-index: 200;
      min-width: 300px;
    }
    .header__autocomplete-item {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: 8px 12px;
      text-decoration: none;
      color: var(--text-primary);
      transition: background-color 0.15s;
      cursor: pointer;
    }
    .header__autocomplete-item:hover,
    .header__autocomplete-item--active {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
    .header__autocomplete-item img {
      width: 28px;
      height: 42px;
      object-fit: cover;
      border-radius: 3px;
      flex-shrink: 0;
    }
    .header__autocomplete-placeholder {
      width: 28px;
      height: 42px;
      background: var(--bg-raised);
      border-radius: 3px;
      flex-shrink: 0;
    }
    .header__autocomplete-info {
      flex: 1;
      min-width: 0;
    }
    .header__autocomplete-title {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .header__autocomplete-meta {
      display: block;
      font-size: 0.75rem;
      color: var(--text-tertiary);
    }
    .header__autocomplete-rating {
      font-size: 0.75rem;
      color: var(--accent-gold);
      font-weight: 600;
      flex-shrink: 0;
    }
    .header__autocomplete-all {
      display: block;
      padding: 8px 12px;
      text-align: center;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--accent-gold);
      border-top: 1px solid var(--border);
      text-decoration: none;
      cursor: pointer;
    }
    .header__autocomplete-all:hover {
      background: var(--bg-hover);
      color: var(--accent-gold);
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
      .header__search {
        margin: var(--space-xs) var(--space-md);
        order: -1;
      }
      .header__search-input {
        width: 100%;
      }
      .header__search-input:focus {
        width: 100%;
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
  private readonly collection = inject(CollectionService);
  private readonly catalog = inject(CatalogService);
  readonly theme = inject(ThemeService);
  readonly a11y = inject(AccessibilityService);
  readonly menuOpen = signal(false);
  readonly searchQuery = signal('');
  readonly searchFocused = signal(false);
  readonly activeResultIndex = signal(-1);
  readonly watchlistCount = computed(() => this.collection.watchlistIds().size);

  readonly searchResults = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (q.length < 2) return [];
    const movies = this.catalog.movies();
    return movies
      .filter((m) => m.title.toLowerCase().includes(q) || m.directors.some((d) => d.toLowerCase().includes(q)))
      .sort((a, b) => b.voteAverage - a.voteAverage)
      .slice(0, 6);
  });

  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  @HostListener('document:keydown', ['$event'])
  onGlobalKey(event: KeyboardEvent): void {
    if (event.key === '/' && !this.isInputFocused()) {
      event.preventDefault();
      this.searchInput?.nativeElement.focus();
    }
  }

  private isInputFocused(): boolean {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || (el as HTMLElement).isContentEditable;
  }

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.menuOpen.set(false);
      }
    });
  }

  onSearch(): void {
    const idx = this.activeResultIndex();
    const results = this.searchResults();
    if (idx >= 0 && idx < results.length) {
      this.selectResult(results[idx].id);
      return;
    }
    const q = this.searchQuery().trim();
    if (!q) return;
    this.searchFocused.set(false);
    this.activeResultIndex.set(-1);
    this.router.navigate(['/browse'], { queryParams: { q } });
    this.searchQuery.set('');
    this.menuOpen.set(false);
  }

  clearSearch(): void {
    if (this.searchQuery()) {
      this.searchQuery.set('');
      this.activeResultIndex.set(-1);
    } else {
      this.searchInput?.nativeElement.blur();
    }
  }

  onSearchBlur(): void {
    setTimeout(() => {
      this.searchFocused.set(false);
      this.activeResultIndex.set(-1);
    }, 200);
  }

  navigateResults(event: Event, direction: number): void {
    const results = this.searchResults();
    if (results.length === 0) return;
    event.preventDefault();
    this.activeResultIndex.update((i) => {
      const next = i + direction;
      if (next < 0) return results.length - 1;
      if (next >= results.length) return 0;
      return next;
    });
  }

  selectResult(id: string): void {
    this.searchFocused.set(false);
    this.searchQuery.set('');
    this.activeResultIndex.set(-1);
    this.menuOpen.set(false);
    this.router.navigate(['/movie', id]);
  }
}
