import { Injectable, inject, signal } from '@angular/core';
import { AccessibilityService } from './accessibility.service';

@Injectable({ providedIn: 'root' })
export class KeyboardShortcutsService {
  private readonly a11y = inject(AccessibilityService);
  readonly helpOpen = signal(false);

  init(): void {
    document.addEventListener('keydown', (e) => this.onKeydown(e));
  }

  private onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable;

    if (event.key === 'Escape') {
      if (this.helpOpen()) { this.helpOpen.set(false); return; }
      if (this.a11y.panelOpen()) { this.a11y.panelOpen.set(false); return; }
    }

    if (isInput) return;

    if (event.key === '/') {
      event.preventDefault();
      const searchInput = document.querySelector<HTMLInputElement>('#search-input');
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
      return;
    }

    if (event.key === '?') {
      event.preventDefault();
      this.helpOpen.update((v) => !v);
      return;
    }
  }
}
