/**
 * Build catalog from Wikidata only (no TMDb key required).
 * Produces a catalog.json with real B&W film data — titles, years, directors,
 * genres, streaming IDs. No poster URLs (those need TMDb).
 *
 * Filters to curated set: streamable films + well-known films with genres.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';

// Query B&W films with useful metadata
const SPARQL_QUERY = `
SELECT DISTINCT
  ?film ?filmLabel ?year
  ?imdbId ?iaId ?youtubeId ?tmdbId
  (GROUP_CONCAT(DISTINCT ?directorLabel; SEPARATOR="|") AS ?directors)
  (GROUP_CONCAT(DISTINCT ?genreLabel; SEPARATOR="|") AS ?genres)
WHERE {
  ?film wdt:P31 wd:Q11424 .
  ?film wdt:P462 wd:Q838368 .
  ?film wdt:P577 ?date .
  BIND(YEAR(?date) AS ?year)
  FILTER(?year > 1890 && ?year < 1975)
  OPTIONAL { ?film wdt:P345 ?imdbId . }
  OPTIONAL { ?film wdt:P724 ?iaId . }
  OPTIONAL { ?film wdt:P1651 ?youtubeId . }
  OPTIONAL { ?film wdt:P4947 ?tmdbId . }
  OPTIONAL {
    ?film wdt:P57 ?director .
    ?director rdfs:label ?directorLabel .
    FILTER(LANG(?directorLabel) = "en")
  }
  OPTIONAL {
    ?film wdt:P136 ?genre .
    ?genre rdfs:label ?genreLabel .
    FILTER(LANG(?genreLabel) = "en")
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}
GROUP BY ?film ?filmLabel ?year ?imdbId ?iaId ?youtubeId ?tmdbId
ORDER BY DESC(?year)
`;

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

async function main() {
  console.log('Querying Wikidata for B&W films...');

  const url = new URL(SPARQL_ENDPOINT);
  url.searchParams.set('query', SPARQL_QUERY);

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/sparql-results+json',
      'User-Agent': 'BWCinema/1.0 (https://github.com/corvid-agent/bw-cinema)',
    },
  });

  if (!response.ok) {
    throw new Error(`Wikidata query failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as {
    results: {
      bindings: Array<{
        film: { value: string };
        filmLabel: { value: string };
        year: { value: string };
        imdbId?: { value: string };
        iaId?: { value: string };
        youtubeId?: { value: string };
        tmdbId?: { value: string };
        directors?: { value: string };
        genres?: { value: string };
      }>;
    };
  };

  console.log(`Raw results: ${data.results.bindings.length}`);

  const movies: MovieSummary[] = data.results.bindings
    .map((b) => {
      const wikidataId = b.film.value.split('/').pop()!;
      const title = b.filmLabel.value;
      const year = parseInt(b.year.value, 10);

      if (!title || title.startsWith('Q') || !year || year < 1890) return null;

      return {
        id: wikidataId,
        title,
        year,
        posterUrl: null,
        tmdbId: b.tmdbId?.value ?? null,
        imdbId: b.imdbId?.value ?? null,
        internetArchiveId: b.iaId?.value ?? null,
        youtubeId: b.youtubeId?.value ?? null,
        voteAverage: 0,
        genres: b.genres?.value ? [...new Set(b.genres.value.split('|').filter(Boolean))] : [],
        directors: b.directors?.value ? [...new Set(b.directors.value.split('|').filter(Boolean))] : [],
        isStreamable: !!(b.iaId?.value || b.youtubeId?.value),
      };
    })
    .filter((m): m is MovieSummary => m !== null);

  // Deduplicate by Wikidata ID
  const seen = new Set<string>();
  const unique = movies.filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });

  console.log(`After dedup: ${unique.length}`);

  // Curate: keep streamable films + well-known films (genres + director + IMDb)
  // Cap non-streamable at ~3000 to keep catalog under 2MB
  const streamable = unique.filter((m) => m.isStreamable);
  const notable = unique
    .filter((m) => !m.isStreamable && m.genres.length > 0 && m.directors.length > 0 && m.imdbId)
    .slice(0, 3000);
  const curated = [...streamable, ...notable];

  console.log(`After curation: ${curated.length}`);

  // Normalize genres to top 30 to avoid noise
  const genreRaw = new Map<string, number>();
  for (const m of curated) {
    for (const g of m.genres) genreRaw.set(g, (genreRaw.get(g) ?? 0) + 1);
  }
  const topGenres = new Set(
    [...genreRaw.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30).map(([g]) => g)
  );

  // Filter each movie's genres to only known genres
  for (const m of curated) {
    m.genres = m.genres.filter((g) => topGenres.has(g));
  }

  // Compute metadata
  const directorCounts = new Map<string, number>();
  const decadeSet = new Set<number>();

  for (const movie of curated) {
    decadeSet.add(Math.floor(movie.year / 10) * 10);
    for (const director of movie.directors) {
      directorCounts.set(director, (directorCounts.get(director) ?? 0) + 1);
    }
  }

  const meta = {
    generatedAt: new Date().toISOString(),
    totalMovies: curated.length,
    genres: [...topGenres],
    decades: [...decadeSet].sort(),
    topDirectors: [...directorCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([name, count]) => ({ name, count })),
  };

  const outputDir = join(import.meta.dir, '..', 'src', 'assets', 'data');
  mkdirSync(outputDir, { recursive: true });
  const outputPath = join(outputDir, 'catalog.json');

  // Write compact JSON (no pretty-print) to save space
  writeFileSync(outputPath, JSON.stringify({ meta, movies: curated }));

  console.log(`\nCatalog written to ${outputPath}`);
  console.log(`  Total films: ${curated.length}`);
  console.log(`  Streamable: ${curated.filter((m) => m.isStreamable).length}`);
  console.log(`  With IMDb: ${curated.filter((m) => m.imdbId).length}`);
  console.log(`  Genres: ${meta.genres.length}`);
  console.log(`  Decades: ${meta.decades.join(', ')}`);
  console.log(`  Top directors: ${meta.topDirectors.slice(0, 5).map((d) => d.name).join(', ')}`);
}

main().catch((err) => {
  console.error('Catalog build failed:', err);
  process.exit(1);
});
