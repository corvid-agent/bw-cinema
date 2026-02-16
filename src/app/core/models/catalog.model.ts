import type { MovieSummary } from './movie.model';

export interface Catalog {
  meta: CatalogMeta;
  movies: MovieSummary[];
}

export interface CatalogMeta {
  generatedAt: string;
  totalMovies: number;
  genres: string[];
  decades: number[];
  topDirectors: DirectorCount[];
}

export interface DirectorCount {
  name: string;
  count: number;
}

export interface CatalogFilter {
  query: string;
  decades: number[];
  genres: string[];
  directors: string[];
  streamableOnly: boolean;
  minRating: number;
  sortBy: 'title' | 'year' | 'rating';
  sortDirection: 'asc' | 'desc';
}
