import { queryWikidata } from './wikidata-sparql';
import { enrichWithTmdb } from './enrich-tmdb';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface MovieSummary {
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
  isStreamable: boolean;
}

interface CatalogMeta {
  generatedAt: string;
  totalMovies: number;
  genres: string[];
  decades: number[];
  topDirectors: { name: string; count: number }[];
}

async function main(): Promise<void> {
  const tmdbKey = process.env['TMDB_API_KEY'];
  if (!tmdbKey) {
    console.error('Error: TMDB_API_KEY environment variable is required');
    process.exit(1);
  }

  console.log('=== BW Cinema Catalog Builder ===\n');

  // Step 1: Query Wikidata
  const wikidataFilms = await queryWikidata();

  // Step 2: Enrich with TMDb
  const tmdbData = await enrichWithTmdb(
    wikidataFilms.map((f) => f.tmdbId),
    tmdbKey
  );

  // Step 3: Build catalog entries
  const movies: MovieSummary[] = wikidataFilms
    .map((film) => {
      const tmdb = film.tmdbId ? tmdbData.get(film.tmdbId) : undefined;
      return {
        id: film.id,
        title: film.title,
        year: film.year,
        posterUrl: tmdb?.posterUrl ?? null,
        tmdbId: film.tmdbId,
        imdbId: film.imdbId,
        internetArchiveId: film.internetArchiveId,
        youtubeId: film.youtubeId,
        voteAverage: tmdb?.voteAverage ?? 0,
        genres: tmdb?.genres ?? film.genres,
        directors: film.directors,
        isStreamable: !!(film.internetArchiveId || film.youtubeId),
      };
    })
    .filter((m) => m.year > 0 && m.title && !m.title.startsWith('Q'));

  // Step 4: Compute metadata
  const genreCounts = new Map<string, number>();
  const directorCounts = new Map<string, number>();
  const decadeSet = new Set<number>();

  for (const movie of movies) {
    decadeSet.add(Math.floor(movie.year / 10) * 10);
    for (const genre of movie.genres) {
      genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1);
    }
    for (const director of movie.directors) {
      directorCounts.set(director, (directorCounts.get(director) ?? 0) + 1);
    }
  }

  const meta: CatalogMeta = {
    generatedAt: new Date().toISOString(),
    totalMovies: movies.length,
    genres: [...genreCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name),
    decades: [...decadeSet].sort(),
    topDirectors: [...directorCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([name, count]) => ({ name, count })),
  };

  // Step 5: Write catalog.json
  const outputDir = join(import.meta.dir, '..', 'src', 'assets', 'data');
  mkdirSync(outputDir, { recursive: true });
  const outputPath = join(outputDir, 'catalog.json');

  writeFileSync(outputPath, JSON.stringify({ meta, movies }, null, 2));
  console.log(`\nCatalog written to ${outputPath}`);
  console.log(`  Total films: ${movies.length}`);
  console.log(`  Genres: ${meta.genres.length}`);
  console.log(`  Decades: ${meta.decades.join(', ')}`);
  console.log(`  Streamable: ${movies.filter((m) => m.isStreamable).length}`);
}

main().catch((err) => {
  console.error('Catalog build failed:', err);
  process.exit(1);
});
