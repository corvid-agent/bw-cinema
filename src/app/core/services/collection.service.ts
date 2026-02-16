import { Injectable, signal, computed } from '@angular/core';
import type { WatchlistItem, WatchedItem, UserCollection, Playlist } from '../models/collection.model';

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
  readonly playlists = signal<Playlist[]>([]);
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
      { movieId, watchedAt: Date.now(), userRating, notes: null, review: null, reviewedAt: null },
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

  setReview(movieId: string, review: string): void {
    const trimmed = review.trim() || null;
    this.watched.update((list) =>
      list.map((w) => (w.movieId === movieId ? { ...w, review: trimmed, reviewedAt: trimmed ? Date.now() : null } : w))
    );
    this.save();
  }

  getReview(movieId: string): string {
    return this.watched().find((w) => w.movieId === movieId)?.review ?? '';
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

  // Playlists
  createPlaylist(name: string): Playlist {
    const playlist: Playlist = {
      id: crypto.randomUUID(),
      name,
      movieIds: [],
      createdAt: Date.now(),
    };
    this.playlists.update((list) => [...list, playlist]);
    this.save();
    return playlist;
  }

  renamePlaylist(id: string, name: string): void {
    this.playlists.update((list) =>
      list.map((p) => (p.id === id ? { ...p, name } : p))
    );
    this.save();
  }

  deletePlaylist(id: string): void {
    this.playlists.update((list) => list.filter((p) => p.id !== id));
    this.save();
  }

  addToPlaylist(playlistId: string, movieId: string): void {
    this.playlists.update((list) =>
      list.map((p) =>
        p.id === playlistId && !p.movieIds.includes(movieId)
          ? { ...p, movieIds: [...p.movieIds, movieId] }
          : p
      )
    );
    this.save();
  }

  removeFromPlaylist(playlistId: string, movieId: string): void {
    this.playlists.update((list) =>
      list.map((p) =>
        p.id === playlistId
          ? { ...p, movieIds: p.movieIds.filter((id) => id !== movieId) }
          : p
      )
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
      favorites: this.favorites(),
      playlists: this.playlists(),
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
        this.watched.set((collection.watched ?? []).map((w) => ({ ...w, notes: w.notes ?? null, review: w.review ?? null, reviewedAt: w.reviewedAt ?? null })));
        this.favorites.set(collection.favorites ?? []);
        this.playlists.set(collection.playlists ?? []);
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
