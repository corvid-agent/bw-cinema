import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'bw-cinema-recent';
const MAX_ITEMS = 12;

@Injectable({ providedIn: 'root' })
export class RecentlyViewedService {
  readonly ids = signal<string[]>(this.load());

  add(movieId: string): void {
    this.ids.update((list) => {
      const filtered = list.filter((id) => id !== movieId);
      return [movieId, ...filtered].slice(0, MAX_ITEMS);
    });
    this.save();
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.ids()));
    } catch { /* noop */ }
  }

  private load(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* noop */ }
    return [];
  }
}
