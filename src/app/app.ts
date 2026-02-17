import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header.component';
import { FooterComponent } from './shared/components/footer.component';
import { ToastContainerComponent } from './shared/components/toast-container.component';
import { BackToTopComponent } from './shared/components/back-to-top.component';
import { BottomNavComponent } from './shared/components/bottom-nav.component';
import { ThemeService } from './core/services/theme.service';
import { KeyboardShortcutsService } from './core/services/keyboard-shortcuts.service';
import { AccessibilityService } from './core/services/accessibility.service';
import { NotificationService } from './core/services/notification.service';

const ONBOARDING_KEY = 'bw-cinema-onboarded';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ToastContainerComponent, BackToTopComponent, BottomNavComponent],
  template: `
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <app-header />
    <main id="main-content">
      <router-outlet />
    </main>
    <app-footer />
    <app-toast-container />
    <app-back-to-top />
    <app-bottom-nav />

    @if (showOnboarding) {
      <div class="onboarding-overlay" role="dialog" aria-label="Welcome">
        <div class="onboarding-panel">
          <h2 class="onboarding-title">Welcome to BW Cinema</h2>
          <p class="onboarding-text">Your home for classic black &amp; white films. Here's what you can do:</p>
          <ul class="onboarding-list">
            <li><strong>Browse</strong> &mdash; Search and filter thousands of classic films</li>
            <li><strong>Watch</strong> &mdash; Stream public domain films for free</li>
            <li><strong>Collect</strong> &mdash; Build your watchlist and track what you've seen</li>
            <li><strong>Customize</strong> &mdash; Adjust text size, contrast, and theme using the icons in the top menu</li>
          </ul>
          <p class="onboarding-tip">Tip: Press <kbd>/</kbd> anytime to search, or <kbd>?</kbd> for keyboard shortcuts.</p>
          <button class="btn-primary onboarding-btn" (click)="dismissOnboarding()">Get Started</button>
        </div>
      </div>
    }

    @if (a11y.panelOpen()) {
      <div class="a11y-overlay" (click)="a11y.panelOpen.set(false)">
        <aside class="a11y-panel" (click)="$event.stopPropagation()" role="dialog" aria-label="Accessibility settings">
          <div class="a11y-header">
            <h2 class="a11y-title">Accessibility</h2>
            <button class="a11y-close" (click)="a11y.panelOpen.set(false)" aria-label="Close accessibility settings">&times;</button>
          </div>

          <div class="a11y-section">
            <p class="a11y-label">Text Size</p>
            <div class="a11y-font-controls">
              <button
                class="a11y-btn"
                (click)="a11y.decreaseFontSize()"
                [disabled]="!a11y.canDecrease()"
                aria-label="Decrease text size"
              >A&minus;</button>
              <span class="a11y-font-label" aria-live="polite">{{ a11y.getFontSizeLabel() }}</span>
              <button
                class="a11y-btn"
                (click)="a11y.increaseFontSize()"
                [disabled]="!a11y.canIncrease()"
                aria-label="Increase text size"
              >A+</button>
            </div>
          </div>

          <div class="a11y-section">
            <label class="a11y-toggle">
              <span>High Contrast</span>
              <input type="checkbox" role="switch" [checked]="a11y.prefs().highContrast" (change)="a11y.toggleHighContrast()" />
              <span class="a11y-switch" [class.active]="a11y.prefs().highContrast"></span>
            </label>
          </div>

          <div class="a11y-section">
            <label class="a11y-toggle">
              <span>Reduce Motion</span>
              <input type="checkbox" role="switch" [checked]="a11y.prefs().reducedMotion" (change)="a11y.toggleReducedMotion()" />
              <span class="a11y-switch" [class.active]="a11y.prefs().reducedMotion"></span>
            </label>
          </div>

          <div class="a11y-section">
            <label class="a11y-toggle">
              <span>Wide Spacing</span>
              <input type="checkbox" role="switch" [checked]="a11y.prefs().wideSpacing" (change)="a11y.toggleWideSpacing()" />
              <span class="a11y-switch" [class.active]="a11y.prefs().wideSpacing"></span>
            </label>
          </div>

          <button class="a11y-reset" (click)="a11y.resetAll()">Reset to Defaults</button>
        </aside>
      </div>
    }

    @if (shortcuts.helpOpen()) {
      <div class="shortcuts-overlay" (click)="shortcuts.helpOpen.set(false)" role="dialog" aria-label="Keyboard shortcuts">
        <div class="shortcuts-panel" (click)="$event.stopPropagation()">
          <div class="shortcuts-header">
            <h2 class="shortcuts-title">Keyboard Shortcuts</h2>
            <button class="shortcuts-close" (click)="shortcuts.helpOpen.set(false)" aria-label="Close">&times;</button>
          </div>
          <div class="shortcuts-list">
            <div class="shortcut-row">
              <kbd>/</kbd>
              <span>Focus search</span>
            </div>
            <div class="shortcut-row">
              <kbd>?</kbd>
              <span>Show this help</span>
            </div>
            <div class="shortcut-row">
              <kbd>Esc</kbd>
              <span>Close overlay / dismiss</span>
            </div>
            <div class="shortcut-row">
              <kbd>&larr; &rarr; &uarr; &darr;</kbd>
              <span>Navigate movie grid</span>
            </div>
            <div class="shortcut-row">
              <kbd>Home / End</kbd>
              <span>First / last in grid</span>
            </div>
            <div class="shortcut-row">
              <kbd>j / k</kbd>
              <span>Next / previous film (detail page)</span>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    main {
      min-height: calc(100vh - 60px - 100px);
    }
    @media (max-width: 768px) {
      main {
        padding-bottom: 72px;
      }
    }
    .shortcuts-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 200;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(4px);
    }
    .shortcuts-panel {
      background-color: var(--bg-surface);
      border: 1px solid var(--border-bright);
      border-radius: var(--radius-xl);
      padding: var(--space-xl);
      min-width: 340px;
      max-width: 420px;
      width: 100%;
      box-shadow: var(--shadow-lg);
    }
    @media (max-width: 480px) {
      .shortcuts-panel {
        min-width: 0;
        max-width: none;
        width: calc(100% - var(--space-lg) * 2);
        padding: var(--space-lg);
      }
    }
    .shortcuts-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-lg);
    }
    .shortcuts-title {
      font-size: 1.2rem;
      margin: 0;
    }
    .shortcuts-close {
      background: none;
      border: none;
      color: var(--text-tertiary);
      font-size: 1.5rem;
      cursor: pointer;
      min-height: auto;
      min-width: auto;
      padding: 4px 8px;
      line-height: 1;
    }
    .shortcuts-close:hover {
      color: var(--text-primary);
    }
    .shortcuts-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }
    .shortcut-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-sm) 0;
      border-bottom: 1px solid var(--border);
    }
    .shortcut-row:last-child {
      border-bottom: none;
    }
    .shortcut-row kbd {
      background-color: var(--bg-raised);
      border: 1px solid var(--border-bright);
      border-radius: var(--radius-sm);
      padding: 2px 8px;
      font-family: var(--font-body);
      font-size: 0.85rem;
      color: var(--accent-gold);
      min-width: 28px;
      text-align: center;
    }
    .shortcut-row span {
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
    /* Onboarding */
    .onboarding-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      z-index: 300;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-lg);
    }
    .onboarding-panel {
      background-color: var(--bg-surface);
      border: 1px solid var(--border-bright);
      border-radius: var(--radius-xl);
      padding: var(--space-2xl);
      max-width: 480px;
      width: 100%;
      box-shadow: var(--shadow-lg);
    }
    .onboarding-title {
      font-size: 1.6rem;
      margin: 0 0 var(--space-md);
      color: var(--accent-gold);
    }
    .onboarding-text {
      color: var(--text-secondary);
      margin: 0 0 var(--space-lg);
      font-size: 1rem;
      line-height: 1.6;
    }
    .onboarding-list {
      list-style: none;
      padding: 0;
      margin: 0 0 var(--space-lg);
    }
    .onboarding-list li {
      padding: var(--space-sm) 0;
      border-bottom: 1px solid var(--border);
      color: var(--text-primary);
      font-size: 0.95rem;
      line-height: 1.5;
    }
    .onboarding-list li:last-child { border-bottom: none; }
    .onboarding-list strong { color: var(--accent-gold); }
    .onboarding-tip {
      font-size: 0.85rem;
      color: var(--text-tertiary);
      margin: 0 0 var(--space-xl);
    }
    .onboarding-tip kbd {
      background: var(--bg-raised);
      border: 1px solid var(--border-bright);
      border-radius: var(--radius-sm);
      padding: 1px 6px;
      font-size: 0.85rem;
      color: var(--accent-gold);
    }
    .onboarding-btn {
      width: 100%;
      font-size: 1.1rem;
      padding: var(--space-md);
      border-radius: var(--radius-lg);
    }
    /* Accessibility panel */
    .a11y-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 200;
      display: flex;
      justify-content: flex-end;
    }
    .a11y-panel {
      background-color: var(--bg-surface);
      border-left: 1px solid var(--border-bright);
      width: 320px;
      max-width: 90vw;
      height: 100%;
      padding: var(--space-xl);
      padding-right: max(var(--space-xl), env(safe-area-inset-right));
      overflow-y: auto;
      box-shadow: var(--shadow-lg);
    }
    .a11y-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-xl);
    }
    .a11y-title {
      font-size: 1.3rem;
      margin: 0;
    }
    .a11y-close {
      background: none;
      border: none;
      color: var(--text-tertiary);
      font-size: 1.6rem;
      cursor: pointer;
      min-height: 48px;
      min-width: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }
    .a11y-close:hover { color: var(--text-primary); }
    .a11y-section {
      padding: var(--space-md) 0;
      border-bottom: 1px solid var(--border);
    }
    .a11y-section:last-of-type { border-bottom: none; }
    .a11y-label {
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
      margin: 0 0 var(--space-sm);
    }
    .a11y-font-controls {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }
    .a11y-btn {
      background-color: var(--bg-raised);
      border: 1px solid var(--border-bright);
      color: var(--text-primary);
      font-size: 1rem;
      font-weight: 700;
      border-radius: var(--radius);
      min-width: 56px;
      min-height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 0;
    }
    .a11y-btn:hover:not(:disabled) {
      background-color: var(--accent-gold-dim);
      border-color: var(--accent-gold);
      color: var(--accent-gold);
    }
    .a11y-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    .a11y-font-label {
      flex: 1;
      text-align: center;
      font-weight: 600;
      color: var(--accent-gold);
      font-size: 0.95rem;
    }
    .a11y-toggle {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      min-height: 48px;
      font-size: 0.95rem;
      color: var(--text-primary);
    }
    .a11y-toggle input { position: absolute; opacity: 0; width: 0; height: 0; }
    .a11y-switch {
      position: relative;
      width: 48px;
      height: 28px;
      background-color: var(--bg-raised);
      border: 1px solid var(--border-bright);
      border-radius: 14px;
      flex-shrink: 0;
      transition: background-color 0.2s;
    }
    .a11y-switch::after {
      content: '';
      position: absolute;
      left: 3px;
      top: 3px;
      width: 20px;
      height: 20px;
      background-color: var(--text-tertiary);
      border-radius: 50%;
      transition: transform 0.2s, background-color 0.2s;
    }
    .a11y-switch.active {
      background-color: var(--accent-gold-dim);
      border-color: var(--accent-gold);
    }
    .a11y-switch.active::after {
      transform: translateX(20px);
      background-color: var(--accent-gold);
    }
    .a11y-reset {
      margin-top: var(--space-lg);
      width: 100%;
      background: none;
      border: 1px solid var(--border);
      color: var(--text-tertiary);
      font-size: 0.9rem;
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius);
      cursor: pointer;
    }
    .a11y-reset:hover {
      color: var(--text-primary);
      border-color: var(--text-tertiary);
    }
  `],
})
export class App implements OnInit, OnDestroy {
  private readonly theme = inject(ThemeService);
  protected readonly shortcuts = inject(KeyboardShortcutsService);
  protected readonly a11y = inject(AccessibilityService);
  private readonly notifications = inject(NotificationService);

  showOnboarding = false;

  private onlineHandler = () => this.notifications.show('You\'re back online', 'success');
  private offlineHandler = () => this.notifications.show('You\'re offline — cached content still available', 'info', 5000);

  ngOnInit(): void {
    this.theme.init();
    this.shortcuts.init();
    this.a11y.init();
    try {
      if (!localStorage.getItem(ONBOARDING_KEY)) {
        this.showOnboarding = true;
      }
    } catch { /* noop */ }

    window.addEventListener('online', this.onlineHandler);
    window.addEventListener('offline', this.offlineHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('online', this.onlineHandler);
    window.removeEventListener('offline', this.offlineHandler);
  }

  dismissOnboarding(): void {
    this.showOnboarding = false;
    try {
      localStorage.setItem(ONBOARDING_KEY, '1');
    } catch { /* noop */ }
  }
}
