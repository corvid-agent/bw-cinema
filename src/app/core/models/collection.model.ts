export interface WatchlistItem {
  movieId: string;
  addedAt: number;
}

export interface WatchedItem {
  movieId: string;
  watchedAt: number;
  userRating: number | null;
  notes: string | null;
}

export interface UserCollection {
  watchlist: WatchlistItem[];
  watched: WatchedItem[];
  favorites: string[];
}
