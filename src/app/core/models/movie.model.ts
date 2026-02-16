export interface MovieSummary {
  id: string;
  title: string;
  year: number;
  posterUrl: string | null;
  tmdbId: string | null;
  imdbId: string | null;
  internetArchiveId: string | null;
  youtubeId: string | null;
  voteAverage: number;
  genres: string[];
  directors: string[];
  language: string | null;
  isStreamable: boolean;
}

export interface MovieDetail extends MovieSummary {
  overview: string;
  runtime: number | null;
  tagline: string;
  backdropUrl: string | null;
  cast: CastMember[];
  crew: CrewMember[];
  tmdbRating: number | null;
  imdbRating: string | null;
  rottenTomatoesRating: string | null;
  metacriticRating: string | null;
  releaseDate: string;
  originalLanguage: string;
  productionCountries: string[];
}

export interface CastMember {
  name: string;
  character: string;
  profileUrl: string | null;
}

export interface CrewMember {
  name: string;
  job: string;
  department: string;
}
