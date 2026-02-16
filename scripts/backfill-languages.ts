/**
 * Backfill language data from TMDb API into catalog.json.
 *
 * Reads existing catalog, fetches `original_language` for each movie
 * with a tmdbId, maps ISO 639-1 codes to readable names, and writes
 * the updated catalog back.
 *
 * Usage: bun run scripts/backfill-languages.ts
 * Requires TMDB_TOKEN or TMDB_API_KEY in .env
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const CONCURRENCY = 30;
const RATE_LIMIT_MS = 30;

// ISO 639-1 → readable language name
const LANG_MAP: Record<string, string> = {
  en: 'English', fr: 'French', de: 'German', ja: 'Japanese', it: 'Italian',
  es: 'Spanish', ru: 'Russian', sv: 'Swedish', da: 'Danish', no: 'Norwegian',
  pt: 'Portuguese', nl: 'Dutch', zh: 'Chinese', ko: 'Korean', pl: 'Polish',
  cs: 'Czech', hu: 'Hungarian', fi: 'Finnish', el: 'Greek', ro: 'Romanian',
  tr: 'Turkish', ar: 'Arabic', hi: 'Hindi', bn: 'Bengali', th: 'Thai',
  vi: 'Vietnamese', he: 'Hebrew', uk: 'Ukrainian', sr: 'Serbian', hr: 'Croatian',
  bg: 'Bulgarian', sk: 'Slovak', sl: 'Slovenian', lt: 'Lithuanian', lv: 'Latvian',
  et: 'Estonian', ka: 'Georgian', fa: 'Persian', ur: 'Urdu', id: 'Indonesian',
  ms: 'Malay', tl: 'Tagalog', ta: 'Tamil', te: 'Telugu', ml: 'Malayalam',
  mr: 'Marathi', gu: 'Gujarati', kn: 'Kannada', pa: 'Punjabi', si: 'Sinhala',
  my: 'Burmese', km: 'Khmer', lo: 'Lao', ne: 'Nepali', am: 'Amharic',
  sw: 'Swahili', yo: 'Yoruba', zu: 'Zulu', af: 'Afrikaans', is: 'Icelandic',
  ga: 'Irish', cy: 'Welsh', eu: 'Basque', ca: 'Catalan', gl: 'Galician',
  xx: 'No Language', cn: 'Chinese', nb: 'Norwegian', sh: 'Serbo-Croatian',
};

function langName(code: string): string {
  return LANG_MAP[code] ?? code.toUpperCase();
}

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
  language?: string | null;
  isStreamable: boolean;
}

interface Catalog {
  meta: {
    generatedAt: string;
    totalMovies: number;
    genres: string[];
    decades: number[];
    languages?: string[];
    topDirectors: { name: string; count: number }[];
  };
  movies: Movie[];
}

async function fetchLanguage(tmdbId: string, token: string): Promise<string | null> {
  try {
    const res = await fetch(`${TMDB_BASE}/movie/${tmdbId}?language=en-US`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    if (res.status === 429) {
      // Rate limited — wait and retry once
      await new Promise((r) => setTimeout(r, 2000));
      const retry = await fetch(`${TMDB_BASE}/movie/${tmdbId}?language=en-US`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (retry.ok) {
        const d = (await retry.json()) as { original_language?: string };
        return d.original_language ?? null;
      }
      return null;
    }
    if (!res.ok) return null;
    const d = (await res.json()) as { original_language?: string };
    return d.original_language ?? null;
  } catch {
    return null;
  }
}

async function main() {
  const token = process.env.TMDB_TOKEN;
  if (!token) {
    console.error('Missing TMDB_TOKEN in environment. Set it in .env');
    process.exit(1);
  }

  const catalogPath = join(import.meta.dir, '..', 'src', 'assets', 'data', 'catalog.json');
  console.log(`Reading catalog from ${catalogPath}...`);
  const catalog: Catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
  console.log(`Total movies: ${catalog.movies.length}`);

  const withTmdb = catalog.movies.filter((m) => m.tmdbId);
  const withoutTmdb = catalog.movies.filter((m) => !m.tmdbId);
  console.log(`With TMDb ID: ${withTmdb.length}`);
  console.log(`Without TMDb ID: ${withoutTmdb.length} (will remain null)`);

  // Process in batches with concurrency
  let processed = 0;
  let enriched = 0;
  const langMap = new Map<string, string>(); // tmdbId -> language ISO code

  for (let i = 0; i < withTmdb.length; i += CONCURRENCY) {
    const batch = withTmdb.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(async (m) => {
        const code = await fetchLanguage(m.tmdbId!, token);
        await new Promise((r) => setTimeout(r, RATE_LIMIT_MS));
        return { tmdbId: m.tmdbId!, code };
      })
    );

    for (const { tmdbId, code } of results) {
      if (code) {
        langMap.set(tmdbId, code);
        enriched++;
      }
    }

    processed += batch.length;
    if (processed % 500 === 0 || processed === withTmdb.length) {
      console.log(`  Processed ${processed}/${withTmdb.length} (${enriched} enriched so far)`);
    }
  }

  console.log(`\nFetched language for ${enriched}/${withTmdb.length} movies`);

  // Apply language to catalog
  const langCounts = new Map<string, number>();
  for (const movie of catalog.movies) {
    if (movie.tmdbId && langMap.has(movie.tmdbId)) {
      const code = langMap.get(movie.tmdbId)!;
      const name = langName(code);
      movie.language = name;
      langCounts.set(name, (langCounts.get(name) ?? 0) + 1);
    } else {
      movie.language = null;
    }
  }

  // Update meta.languages
  catalog.meta.languages = [...langCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([l]) => l);

  // Print language distribution
  console.log('\nLanguage distribution:');
  for (const [lang, count] of [...langCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20)) {
    console.log(`  ${lang}: ${count}`);
  }

  // Write updated catalog
  writeFileSync(catalogPath, JSON.stringify({ meta: catalog.meta, movies: catalog.movies }));
  console.log(`\nUpdated catalog written to ${catalogPath}`);
  console.log(`Languages in meta: ${catalog.meta.languages.length}`);
}

main().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
