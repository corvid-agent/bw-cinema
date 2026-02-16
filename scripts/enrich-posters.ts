/**
 * Enrich existing catalog.json with TMDb poster URLs and ratings.
 * Usage: TMDB_TOKEN=xxx bun run scripts/enrich-posters.ts
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const RATE_LIMIT_MS = 30; // ~33 req/sec, under 40 limit

interface Movie {
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

interface Catalog {
  meta: Record<string, unknown>;
  movies: Movie[];
}

async function main() {
  const token = process.env['TMDB_TOKEN'];
  if (!token) {
    console.error('Error: TMDB_TOKEN environment variable required');
    process.exit(1);
  }

  const catalogPath = join(import.meta.dir, '..', 'src', 'assets', 'data', 'catalog.json');
  const catalog: Catalog = JSON.parse(readFileSync(catalogPath, 'utf-8'));

  const needsEnrichment = catalog.movies.filter((m) => m.tmdbId && !m.posterUrl);
  console.log(`Total movies: ${catalog.movies.length}`);
  console.log(`Need enrichment: ${needsEnrichment.length}`);

  let enriched = 0;
  let failed = 0;

  for (let i = 0; i < needsEnrichment.length; i++) {
    const movie = needsEnrichment[i];
    try {
      const res = await fetch(`${TMDB_BASE}/movie/${movie.tmdbId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json() as {
          poster_path: string | null;
          vote_average: number;
        };
        if (data.poster_path) {
          movie.posterUrl = `https://image.tmdb.org/t/p/w342${data.poster_path}`;
          enriched++;
        }
        if (data.vote_average > 0 && movie.voteAverage === 0) {
          movie.voteAverage = data.vote_average;
        }
      } else if (res.status === 429) {
        console.warn(`Rate limited at ${i}, waiting 2s...`);
        await new Promise((r) => setTimeout(r, 2000));
        i--; // retry
        continue;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }

    if ((i + 1) % 200 === 0) {
      console.log(`  Progress: ${i + 1}/${needsEnrichment.length} (${enriched} posters, ${failed} failed)`);
    }

    await new Promise((r) => setTimeout(r, RATE_LIMIT_MS));
  }

  writeFileSync(catalogPath, JSON.stringify(catalog));

  console.log(`\nDone!`);
  console.log(`  Enriched: ${enriched} posters`);
  console.log(`  Failed: ${failed}`);
  console.log(`  With posters: ${catalog.movies.filter((m) => m.posterUrl).length}`);
  console.log(`  With ratings: ${catalog.movies.filter((m) => m.voteAverage > 0).length}`);
}

main().catch((err) => {
  console.error('Enrichment failed:', err);
  process.exit(1);
});
