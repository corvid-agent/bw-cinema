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

export interface Playlist {
  id: string;
  name: string;
  movieIds: string[];
  createdAt: number;
}

export interface UserCollection {
  watchlist: WatchlistItem[];
  watched: WatchedItem[];
  favorites: string[];
  playlists?: Playlist[];
}
