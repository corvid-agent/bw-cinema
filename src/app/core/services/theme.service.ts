import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'dark' | 'sepia' | 'light';

const STORAGE_KEY = 'bw-cinema-theme';
const THEME_ORDER: ThemeMode[] = ['dark', 'sepia', 'light'];

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<ThemeMode>(this.loadTheme());

  toggle(): void {
    const current = this.theme();
    const idx = THEME_ORDER.indexOf(current);
    const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length];
    this.setTheme(next);
  }

  setTheme(mode: ThemeMode): void {
    this.theme.set(mode);
    this.applyTheme(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch { /* localStorage unavailable */ }
  }

  /** Call once at app startup to apply the persisted theme. */
  init(): void {
    this.applyTheme(this.theme());
  }

  private applyTheme(mode: ThemeMode): void {
    if (mode === 'dark') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', mode);
    }
  }

  private loadTheme(): ThemeMode {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'sepia' || stored === 'light') return stored;
      if (stored === 'dark') return 'dark';
    } catch {
      // localStorage unavailable
    }
    // First visit: detect system preference
    try {
      if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
    } catch { /* matchMedia unavailable */ }
    return 'dark';
  }
}
