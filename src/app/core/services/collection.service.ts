import { Injectable, signal, computed } from '@angular/core';
import type { WatchlistItem, WatchedItem, UserCollection } from '../models/collection.model';

const STORAGE_KEY = 'bw-cinema-collection';
const PROGRESS_KEY = 'bw-cinema-watch-progress';

export interface WatchProgress {
  movieId: string;
  startedAt: number;
}

@Injectable({ providedIn: 'root' })
export class CollectionService {
  readonly watchlist = signal<WatchlistItem[]>([]);
  readonly watched = signal<WatchedItem[]>([]);
  readonly favorites = signal<string[]>([]);
  readonly watchProgress = signal<WatchProgress[]>([]);

  readonly watchlistIds = computed(() => new Set(this.watchlist().map((w) => w.movieId)));
  readonly watchedIds = computed(() => new Set(this.watched().map((w) => w.movieId)));
  readonly favoriteIds = computed(() => new Set(this.favorites()));

  constructor() {
    this.loadFromStorage();
    this.loadProgress();
  }

  addToWatchlist(movieId: string): void {
    if (this.watchlistIds().has(movieId)) return;
    this.watchlist.update((list) => [...list, { movieId, addedAt: Date.now() }]);
    this.save();
  }

  removeFromWatchlist(movieId: string): void {
    this.watchlist.update((list) => list.filter((w) => w.movieId !== movieId));
    this.save();
  }

  markWatched(movieId: string, userRating: number | null = null): void {
    if (this.watchedIds().has(movieId)) return;
    this.watched.update((list) => [
      ...list,
      { movieId, watchedAt: Date.now(), userRating, notes: null },
    ]);
    this.removeFromWatchlist(movieId);
    this.removeProgress(movieId);
    this.save();
  }

  removeWatched(movieId: string): void {
    this.watched.update((list) => list.filter((w) => w.movieId !== movieId));
    this.save();
  }

  setRating(movieId: string, rating: number): void {
    this.watched.update((list) =>
      list.map((w) => (w.movieId === movieId ? { ...w, userRating: rating } : w))
    );
    this.save();
  }

  setNote(movieId: string, notes: string): void {
    const trimmed = notes.trim() || null;
    this.watched.update((list) =>
      list.map((w) => (w.movieId === movieId ? { ...w, notes: trimmed } : w))
    );
    this.save();
  }

  getNote(movieId: string): string {
    return this.watched().find((w) => w.movieId === movieId)?.notes ?? '';
  }

  // Favorites
  toggleFavorite(movieId: string): void {
    if (this.favoriteIds().has(movieId)) {
      this.favorites.update((list) => list.filter((id) => id !== movieId));
    } else {
      this.favorites.update((list) => [...list, movieId]);
    }
    this.save();
  }

  isFavorite(movieId: string): boolean {
    return this.favoriteIds().has(movieId);
  }

  // Watch progress
  trackProgress(movieId: string): void {
    const existing = this.watchProgress().find((p) => p.movieId === movieId);
    if (existing) {
      this.watchProgress.update((list) =>
        list.map((p) => (p.movieId === movieId ? { ...p, startedAt: Date.now() } : p))
      );
    } else {
      this.watchProgress.update((list) => [...list, { movieId, startedAt: Date.now() }]);
    }
    this.saveProgress();
  }

  removeProgress(movieId: string): void {
    this.watchProgress.update((list) => list.filter((p) => p.movieId !== movieId));
    this.saveProgress();
  }

  isInWatchlist(movieId: string): boolean {
    return this.watchlistIds().has(movieId);
  }

  isWatched(movieId: string): boolean {
    return this.watchedIds().has(movieId);
  }

  private save(): void {
    const collection: UserCollection = {
      watchlist: this.watchlist(),
      watched: this.watched(),
      favorites: this.favorites(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
    } catch {
      // Storage full or unavailable
    }
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const collection: UserCollection = JSON.parse(raw);
        this.watchlist.set(collection.watchlist ?? []);
        this.watched.set((collection.watched ?? []).map((w) => ({ ...w, notes: w.notes ?? null })));
        this.favorites.set(collection.favorites ?? []);
      }
    } catch {
      // Invalid stored data, start fresh
    }
  }

  private saveProgress(): void {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(this.watchProgress()));
    } catch { /* noop */ }
  }

  private loadProgress(): void {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      if (raw) this.watchProgress.set(JSON.parse(raw));
    } catch { /* noop */ }
  }
}
