interface TmdbEnrichment {
  posterUrl: string | null;
  voteAverage: number;
  genres: string[];
}

const TMDB_BASE = 'https://api.themoviedb.org/3';
const RATE_LIMIT_MS = 25;

export async function enrichWithTmdb(
  tmdbIds: (string | null)[],
  apiKey: string
): Promise<Map<string, TmdbEnrichment>> {
  const results = new Map<string, TmdbEnrichment>();
  const validIds = tmdbIds.filter((id): id is string => id !== null);
  const unique = [...new Set(validIds)];

  console.log(`Enriching ${unique.length} films from TMDb...`);

  let processed = 0;
  for (const tmdbId of unique) {
    try {
      const response = await fetch(`${TMDB_BASE}/movie/${tmdbId}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json() as {
          poster_path: string | null;
          vote_average: number;
          genres: { name: string }[];
        };
        results.set(tmdbId, {
          posterUrl: data.poster_path
            ? `https://image.tmdb.org/t/p/w342${data.poster_path}`
            : null,
          voteAverage: data.vote_average,
          genres: data.genres.map((g) => g.name),
        });
      } else if (response.status === 429) {
        console.warn('TMDb rate limited, waiting 2s...');
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
    } catch (err) {
      console.warn(`TMDb fetch failed for ${tmdbId}:`, err);
    }

    processed++;
    if (processed % 100 === 0) {
      console.log(`  TMDb: ${processed}/${unique.length} processed`);
    }
    await new Promise((r) => setTimeout(r, RATE_LIMIT_MS));
  }

  console.log(`TMDb enrichment complete: ${results.size} films enriched`);
  return results;
}
