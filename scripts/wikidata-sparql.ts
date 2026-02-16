interface WikidataFilm {
  id: string;
  title: string;
  year: number;
  imdbId: string | null;
  internetArchiveId: string | null;
  youtubeId: string | null;
  tmdbId: string | null;
  directors: string[];
  genres: string[];
}

const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';

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

export async function queryWikidata(): Promise<WikidataFilm[]> {
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

  const films: WikidataFilm[] = data.results.bindings.map((b) => {
    const wikidataId = b.film.value.split('/').pop()!;
    return {
      id: wikidataId,
      title: b.filmLabel.value,
      year: parseInt(b.year.value, 10),
      imdbId: b.imdbId?.value ?? null,
      internetArchiveId: b.iaId?.value ?? null,
      youtubeId: b.youtubeId?.value ?? null,
      tmdbId: b.tmdbId?.value ?? null,
      directors: b.directors?.value ? b.directors.value.split('|').filter(Boolean) : [],
      genres: b.genres?.value ? b.genres.value.split('|').filter(Boolean) : [],
    };
  });

  console.log(`Found ${films.length} B&W films from Wikidata`);
  return films;
}
