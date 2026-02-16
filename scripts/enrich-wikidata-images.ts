/**
 * Enrich catalog.json with Wikidata images from Wikimedia Commons.
 * No API key required — uses public SPARQL endpoint.
 *
 * Usage: bun run scripts/enrich-wikidata-images.ts
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';

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

async function queryBatch(ids: string[]): Promise<Map<string, string>> {
  // Build VALUES clause for batch lookup
  const values = ids.map((id) => `wd:${id}`).join(' ');
  const query = `
SELECT ?film ?image WHERE {
  VALUES ?film { ${values} }
  ?film wdt:P18 ?image .
}`;

  const url = new URL(SPARQL_ENDPOINT);
  url.searchParams.set('query', query);

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/sparql-results+json',
      'User-Agent': 'BWCinema/1.0 (https://github.com/corvid-agent/bw-cinema)',
    },
  });

  if (!response.ok) {
    if (response.status === 429) {
      console.warn('Rate limited, waiting 30s...');
      await new Promise((r) => setTimeout(r, 30000));
      return queryBatch(ids); // retry
    }
    throw new Error(`SPARQL query failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    results: {
      bindings: Array<{
        film: { value: string };
        image: { value: string };
      }>;
    };
  };

  const result = new Map<string, string>();
  for (const b of data.results.bindings) {
    const wikidataId = b.film.value.split('/').pop()!;
    if (!result.has(wikidataId)) {
      // Use Wikimedia Commons thumbnail URL (342px width for card display)
      const filename = b.image.value.split('/Special:FilePath/').pop();
      if (filename) {
        result.set(
          wikidataId,
          `https://commons.wikimedia.org/wiki/Special:FilePath/${filename}?width=342`
        );
      }
    }
  }

  return result;
}

async function main() {
  const catalogPath = join(import.meta.dir, '..', 'src', 'assets', 'data', 'catalog.json');
  const catalog: Catalog = JSON.parse(readFileSync(catalogPath, 'utf-8'));

  const needsImage = catalog.movies.filter((m) => !m.posterUrl);
  console.log(`Total movies: ${catalog.movies.length}`);
  console.log(`Already have images: ${catalog.movies.length - needsImage.length}`);
  console.log(`Need images: ${needsImage.length}`);

  // Batch IDs in groups of 200 (SPARQL VALUES clause limit)
  const BATCH_SIZE = 200;
  let enriched = 0;

  for (let i = 0; i < needsImage.length; i += BATCH_SIZE) {
    const batch = needsImage.slice(i, i + BATCH_SIZE);
    const ids = batch.map((m) => m.id);

    try {
      const imageMap = await queryBatch(ids);

      for (const movie of batch) {
        const imageUrl = imageMap.get(movie.id);
        if (imageUrl) {
          movie.posterUrl = imageUrl;
          enriched++;
        }
      }

      console.log(
        `  Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(needsImage.length / BATCH_SIZE)}: ` +
          `found ${imageMap.size} images (total enriched: ${enriched})`
      );
    } catch (err) {
      console.error(`  Batch failed at ${i}:`, err);
    }

    // Be nice to Wikidata servers
    await new Promise((r) => setTimeout(r, 1000));
  }

  writeFileSync(catalogPath, JSON.stringify(catalog));

  console.log(`\nDone!`);
  console.log(`  Enriched: ${enriched} images`);
  console.log(`  With images: ${catalog.movies.filter((m) => m.posterUrl).length}/${catalog.movies.length}`);
}

main().catch((err) => {
  console.error('Image enrichment failed:', err);
  process.exit(1);
});
