import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { MovieDetail, CastMember, CrewMember } from '../models/movie.model';
import type { MovieSummary } from '../models/movie.model';

interface TmdbMovieResponse {
  overview: string;
  runtime: number | null;
  tagline: string;
  backdrop_path: string | null;
  release_date: string;
  original_language: string;
  production_countries: { name: string }[];
  credits: {
    cast: { name: string; character: string; profile_path: string | null }[];
    crew: { name: string; job: string; department: string }[];
  };
}

interface OmdbResponse {
  imdbRating?: string;
  Ratings?: { Source: string; Value: string }[];
  Metascore?: string;
}

@Injectable({ providedIn: 'root' })
export class MovieService {
  private readonly http = inject(HttpClient);
  private readonly cache = new Map<string, MovieDetail>();

  async getDetail(summary: MovieSummary): Promise<MovieDetail> {
    const cached = this.cache.get(summary.id);
    if (cached) return cached;

    let detail: MovieDetail = {
      ...summary,
      overview: '',
      runtime: null,
      tagline: '',
      backdropUrl: null,
      cast: [],
      crew: [],
      tmdbRating: summary.voteAverage,
      imdbRating: null,
      rottenTomatoesRating: null,
      metacriticRating: null,
      releaseDate: '',
      originalLanguage: '',
      productionCountries: [],
    };

    if (summary.tmdbId) {
      try {
        const tmdb = await firstValueFrom(
          this.http.get<TmdbMovieResponse>(
            `https://api.themoviedb.org/3/movie/${summary.tmdbId}?append_to_response=credits`
          )
        );
        detail = {
          ...detail,
          overview: tmdb.overview,
          runtime: tmdb.runtime,
          tagline: tmdb.tagline,
          backdropUrl: tmdb.backdrop_path
            ? `https://image.tmdb.org/t/p/w1280${tmdb.backdrop_path}`
            : null,
          releaseDate: tmdb.release_date,
          originalLanguage: tmdb.original_language,
          productionCountries: tmdb.production_countries.map((c) => c.name),
          cast: tmdb.credits.cast.slice(0, 10).map(
            (c): CastMember => ({
              name: c.name,
              character: c.character,
              profileUrl: c.profile_path
                ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
                : null,
            })
          ),
          crew: tmdb.credits.crew
            .filter((c) => ['Director', 'Writer', 'Producer'].includes(c.job))
            .map(
              (c): CrewMember => ({
                name: c.name,
                job: c.job,
                department: c.department,
              })
            ),
        };
      } catch {
        // TMDb enrichment failed, continue with basic data
      }
    }

    if (summary.imdbId) {
      try {
        const omdb = await firstValueFrom(
          this.http.get<OmdbResponse>(
            `https://www.omdbapi.com/?i=${summary.imdbId}&apikey=${this.getOmdbKey()}`
          )
        );
        detail.imdbRating = omdb.imdbRating ?? null;
        const rt = omdb.Ratings?.find((r) => r.Source === 'Rotten Tomatoes');
        detail.rottenTomatoesRating = rt?.Value ?? null;
        detail.metacriticRating = omdb.Metascore ?? null;
      } catch {
        // OMDb enrichment failed, continue without
      }
    }

    this.cache.set(summary.id, detail);
    return detail;
  }

  private getOmdbKey(): string {
    return (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>)['__OMDB_KEY'] as string) || '';
  }
}
