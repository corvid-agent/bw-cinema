import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'dark' | 'sepia';

const STORAGE_KEY = 'bw-cinema-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<ThemeMode>(this.loadTheme());

  toggle(): void {
    const next: ThemeMode = this.theme() === 'dark' ? 'sepia' : 'dark';
    this.theme.set(next);
    this.applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  /** Call once at app startup to apply the persisted theme. */
  init(): void {
    this.applyTheme(this.theme());
  }

  private applyTheme(mode: ThemeMode): void {
    if (mode === 'sepia') {
      document.documentElement.setAttribute('data-theme', 'sepia');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  private loadTheme(): ThemeMode {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'sepia') return 'sepia';
    } catch {
      // localStorage unavailable
    }
    return 'dark';
  }
}
