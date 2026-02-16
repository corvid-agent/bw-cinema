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
  languages: string[];
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
  languages: string[];
  streamableOnly: boolean;
  minRating: number;
  yearRange: [number, number] | null;
  sortBy: 'title' | 'year' | 'rating';
  sortDirection: 'asc' | 'desc';
}
