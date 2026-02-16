import { Injectable, signal, computed } from '@angular/core';
import type { WatchlistItem, WatchedItem, UserCollection } from '../models/collection.model';

const STORAGE_KEY = 'bw-cinema-collection';

@Injectable({ providedIn: 'root' })
export class CollectionService {
  readonly watchlist = signal<WatchlistItem[]>([]);
  readonly watched = signal<WatchedItem[]>([]);

  readonly watchlistIds = computed(() => new Set(this.watchlist().map((w) => w.movieId)));
  readonly watchedIds = computed(() => new Set(this.watched().map((w) => w.movieId)));

  constructor() {
    this.loadFromStorage();
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
      { movieId, watchedAt: Date.now(), userRating },
    ]);
    this.removeFromWatchlist(movieId);
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
        this.watched.set(collection.watched ?? []);
      }
    } catch {
      // Invalid stored data, start fresh
    }
  }
}
