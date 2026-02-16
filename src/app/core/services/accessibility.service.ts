import { Injectable, signal } from '@angular/core';

export type FontSize = 'default' | 'large' | 'x-large' | 'xx-large';
export interface AccessibilityPrefs {
  fontSize: FontSize;
  highContrast: boolean;
  reducedMotion: boolean;
  wideSpacing: boolean;
}

const STORAGE_KEY = 'bw-cinema-a11y';

const FONT_SIZE_MAP: Record<FontSize, string> = {
  'default': '17px',
  'large': '20px',
  'x-large': '23px',
  'xx-large': '27px',
};

const FONT_SIZE_ORDER: FontSize[] = ['default', 'large', 'x-large', 'xx-large'];

@Injectable({ providedIn: 'root' })
export class AccessibilityService {
  readonly prefs = signal<AccessibilityPrefs>(this.load());
  readonly panelOpen = signal(false);

  init(): void {
    this.apply(this.prefs());
  }

  increaseFontSize(): void {
    const current = this.prefs().fontSize;
    const idx = FONT_SIZE_ORDER.indexOf(current);
    if (idx < FONT_SIZE_ORDER.length - 1) {
      this.update({ fontSize: FONT_SIZE_ORDER[idx + 1] });
    }
  }

  decreaseFontSize(): void {
    const current = this.prefs().fontSize;
    const idx = FONT_SIZE_ORDER.indexOf(current);
    if (idx > 0) {
      this.update({ fontSize: FONT_SIZE_ORDER[idx - 1] });
    }
  }

  toggleHighContrast(): void {
    this.update({ highContrast: !this.prefs().highContrast });
  }

  toggleReducedMotion(): void {
    this.update({ reducedMotion: !this.prefs().reducedMotion });
  }

  toggleWideSpacing(): void {
    this.update({ wideSpacing: !this.prefs().wideSpacing });
  }

  resetAll(): void {
    this.update({
      fontSize: 'default',
      highContrast: false,
      reducedMotion: false,
      wideSpacing: false,
    });
  }

  getFontSizeLabel(): string {
    switch (this.prefs().fontSize) {
      case 'default': return 'Default';
      case 'large': return 'Large';
      case 'x-large': return 'X-Large';
      case 'xx-large': return 'XX-Large';
    }
  }

  canIncrease(): boolean {
    return FONT_SIZE_ORDER.indexOf(this.prefs().fontSize) < FONT_SIZE_ORDER.length - 1;
  }

  canDecrease(): boolean {
    return FONT_SIZE_ORDER.indexOf(this.prefs().fontSize) > 0;
  }

  private update(partial: Partial<AccessibilityPrefs>): void {
    const next = { ...this.prefs(), ...partial };
    this.prefs.set(next);
    this.apply(next);
    this.save(next);
  }

  private apply(p: AccessibilityPrefs): void {
    const root = document.documentElement;
    root.style.setProperty('--font-size-base', FONT_SIZE_MAP[p.fontSize]);

    root.classList.toggle('high-contrast', p.highContrast);
    root.classList.toggle('reduced-motion', p.reducedMotion);
    root.classList.toggle('wide-spacing', p.wideSpacing);
  }

  private save(p: AccessibilityPrefs): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch {
      // localStorage unavailable
    }
  }

  private load(): AccessibilityPrefs {
    const defaults: AccessibilityPrefs = {
      fontSize: 'default',
      highContrast: false,
      reducedMotion: false,
      wideSpacing: false,
    };
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaults, ...parsed };
      }
    } catch {
      // Invalid or unavailable
    }
    return defaults;
  }
}
