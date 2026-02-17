import { Component, ChangeDetectionStrategy, inject, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { CatalogService } from '../../core/services/catalog.service';

@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="about container">
      <h1>About BW Cinema</h1>

      <section class="about__section">
        <h2>Our Mission</h2>
        <p>
          BW Cinema is the definitive destination for discovering, tracking, and watching
          classic black &amp; white films. We believe these timeless masterpieces deserve
          a dedicated platform that celebrates their artistry and makes them accessible
          to everyone.
        </p>
      </section>

      @if (catalogStats(); as stats) {
        <section class="about__section">
          <h2>The Collection</h2>
          <div class="about__stats">
            <div class="about__stat">
              <span class="about__stat-value">{{ stats.total }}</span>
              <span class="about__stat-label">Films in Catalog</span>
            </div>
            <div class="about__stat">
              <span class="about__stat-value">{{ stats.streamable }}</span>
              <span class="about__stat-label">Free to Watch</span>
            </div>
            <div class="about__stat">
              <span class="about__stat-value">{{ stats.decades }}</span>
              <span class="about__stat-label">Decades Covered</span>
            </div>
            <div class="about__stat">
              <span class="about__stat-value">{{ stats.genres }}</span>
              <span class="about__stat-label">Genres</span>
            </div>
            <div class="about__stat">
              <span class="about__stat-value">{{ stats.directors }}</span>
              <span class="about__stat-label">Directors</span>
            </div>
            <div class="about__stat">
              <span class="about__stat-value">{{ stats.yearRange }}</span>
              <span class="about__stat-label">Year Range</span>
            </div>
          </div>
        </section>
      }

      @if (highlights(); as h) {
        <section class="about__section">
          <h2>Catalog Highlights</h2>
          <div class="about__highlights">
            @if (h.oldest) {
              <a class="about__highlight" [routerLink]="['/movie', h.oldest.id]">
                <span class="about__highlight-label">Oldest Film</span>
                <span class="about__highlight-value">{{ h.oldest.title }} ({{ h.oldest.year }})</span>
              </a>
            }
            @if (h.highestRated) {
              <a class="about__highlight" [routerLink]="['/movie', h.highestRated.id]">
                <span class="about__highlight-label">Highest Rated</span>
                <span class="about__highlight-value">{{ h.highestRated.title }} &#9733; {{ h.highestRated.voteAverage.toFixed(1) }}</span>
              </a>
            }
            @if (h.topDirector) {
              <a class="about__highlight" [routerLink]="['/director', h.topDirector.name]">
                <span class="about__highlight-label">Most Prolific Director</span>
                <span class="about__highlight-value">{{ h.topDirector.name }} ({{ h.topDirector.count }} films)</span>
              </a>
            }
            @if (h.topGenre) {
              <a class="about__highlight" [routerLink]="['/genre', h.topGenre.name]">
                <span class="about__highlight-label">Most Popular Genre</span>
                <span class="about__highlight-value">{{ h.topGenre.name }} ({{ h.topGenre.count }} films)</span>
              </a>
            }
          </div>
        </section>
      }

      <section class="about__section">
        <h2>Data Sources</h2>
        <div class="about__sources">
          <div class="about__source">
            <h3>Wikidata</h3>
            <p>Our master film database, providing the comprehensive list of black &amp; white films with cross-referenced identifiers.</p>
          </div>
          <div class="about__source">
            <h3>
              <img
                src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
                alt="TMDB"
                width="100"
                height="12"
                loading="lazy"
                class="about__tmdb-logo"
              />
            </h3>
            <p>Provides poster images, cast information, synopses, and community ratings for movie detail pages. This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
          </div>
          <div class="about__source">
            <h3>Internet Archive</h3>
            <p>Hosts public domain films that you can watch for free directly on our site.</p>
          </div>
        </div>
      </section>

      <section class="about__section">
        <h2>Frequently Asked Questions</h2>
        <div class="about__faq">
          <details class="about__faq-item">
            <summary>What is the public domain?</summary>
            <div class="about__faq-content"><div>
              <p>
                Works in the public domain are no longer under copyright protection and can be freely
                distributed and viewed by anyone. Many classic films — particularly those released before
                1928, or those whose copyrights were not properly renewed — have entered the public domain.
                The Internet Archive hosts thousands of these films for free streaming.
              </p>
            </div></div>
          </details>
          <details class="about__faq-item">
            <summary>Why can't I watch some films?</summary>
            <div class="about__faq-content"><div>
              <p>
                Not all films in our catalog are in the public domain. Films that are still under copyright
                cannot be freely streamed. For these films, we provide links to IMDb and the Internet Archive
                so you can find them through other channels. Look for the <strong>IA</strong> (Internet Archive)
                or <strong>YT</strong> (YouTube) badges on film cards to identify freely streamable titles.
              </p>
            </div></div>
          </details>
          <details class="about__faq-item">
            <summary>How often is the catalog updated?</summary>
            <div class="about__faq-content"><div>
              <p>
                Our catalog is compiled from Wikidata and enriched with metadata from TMDB. The core
                catalog is updated periodically as new public domain films are identified and as
                streaming availability changes.
              </p>
            </div></div>
          </details>
          <details class="about__faq-item">
            <summary>Where is my data stored?</summary>
            <div class="about__faq-content"><div>
              <p>
                All your personal data — your watchlist, watched films, ratings, reviews, and playlists —
                is stored locally in your browser using localStorage. Nothing is sent to any server.
                This means your data stays private, but also that it won't sync across devices.
                You can export your collection from the Collection page.
              </p>
            </div></div>
          </details>
          <details class="about__faq-item">
            <summary>How do I report a problem?</summary>
            <div class="about__faq-content"><div>
              <p>
                If you find incorrect film data, broken streaming links, or have suggestions for
                improvements, please open an issue on our
                <a href="https://github.com/corvid-agent/bw-cinema/issues" target="_blank" rel="noopener">GitHub repository</a>.
              </p>
            </div></div>
          </details>
        </div>
      </section>

      <section class="about__section">
        <h2>Features</h2>
        <div class="about__features">
          <a class="about__feature" routerLink="/browse">
            <span class="about__feature-icon">&#9776;</span>
            <div>
              <h3>Browse &amp; Filter</h3>
              <p>Search, filter by decade, genre, and sort thousands of classic films</p>
            </div>
          </a>
          <a class="about__feature" routerLink="/quiz">
            <span class="about__feature-icon">?</span>
            <div>
              <h3>What Should I Watch?</h3>
              <p>Take a quick quiz and get personalized film recommendations</p>
            </div>
          </a>
          <a class="about__feature" routerLink="/explore">
            <span class="about__feature-icon">&#9670;</span>
            <div>
              <h3>Explore by Mood</h3>
              <p>Discover films by mood, theme, or let fate decide with random picks</p>
            </div>
          </a>
          <a class="about__feature" routerLink="/wrapped">
            <span class="about__feature-icon">&#9733;</span>
            <div>
              <h3>Year in Review</h3>
              <p>See your annual viewing stats, top genres, and favorite directors</p>
            </div>
          </a>
          <a class="about__feature" routerLink="/stats">
            <span class="about__feature-icon">&#9638;</span>
            <div>
              <h3>Catalog Stats</h3>
              <p>Explore statistics across the entire catalog — decades, genres, directors</p>
            </div>
          </a>
          <a class="about__feature" routerLink="/collection">
            <span class="about__feature-icon">&#9829;</span>
            <div>
              <h3>Your Collection</h3>
              <p>Track watched films, build a watchlist, rate and review your favorites</p>
            </div>
          </a>
        </div>
      </section>

      <section class="about__section">
        <h2>Accessibility</h2>
        <p>
          BW Cinema is designed with accessibility as a priority. We use large, readable fonts,
          high-contrast colors, clear focus indicators, and full keyboard navigation support.
          If you encounter any accessibility issues, please let us know.
        </p>
      </section>

      <section class="about__section">
        <h2>Keyboard Shortcuts</h2>
        <p>Press <kbd class="about__kbd">?</kbd> anywhere to open the shortcuts panel. Here are the available shortcuts:</p>
        <div class="about__shortcuts">
          <div class="about__shortcut"><kbd class="about__kbd">/</kbd><span>Focus search bar</span></div>
          <div class="about__shortcut"><kbd class="about__kbd">?</kbd><span>Show keyboard shortcuts</span></div>
          <div class="about__shortcut"><kbd class="about__kbd">Esc</kbd><span>Close overlay or dismiss</span></div>
          <div class="about__shortcut"><kbd class="about__kbd">&larr; &rarr; &uarr; &darr;</kbd><span>Navigate movie grids</span></div>
          <div class="about__shortcut"><kbd class="about__kbd">j / k</kbd><span>Previous / next film on detail page</span></div>
          <div class="about__shortcut"><kbd class="about__kbd">Home / End</kbd><span>Jump to first / last in grid</span></div>
        </div>
      </section>

      <section class="about__section">
        <h2>Privacy</h2>
        <p>
          Your watchlist and viewing history are stored entirely in your browser's local storage.
          We do not collect personal data or use tracking cookies. External API requests are made
          only to fetch film information.
        </p>
      </section>
    </div>
  `,
  styles: [`
    .about { padding: var(--space-2xl) 0; max-width: 800px; }
    .about__section {
      margin-bottom: var(--space-2xl);
    }
    .about__section p {
      color: var(--text-secondary);
      line-height: 1.8;
    }
    .about__sources {
      display: grid;
      gap: var(--space-md);
      margin-top: var(--space-md);
    }
    .about__source {
      background-color: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-lg);
    }
    .about__source h3 {
      color: var(--accent-gold);
      margin-bottom: var(--space-sm);
    }
    .about__tmdb-logo {
      vertical-align: middle;
    }
    .about__source p {
      margin: 0;
      font-size: 0.95rem;
    }
    .about__shortcuts {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      margin-top: var(--space-md);
    }
    .about__shortcut {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-sm) var(--space-md);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
    }
    .about__shortcut span {
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
    .about__kbd {
      display: inline-block;
      min-width: 28px;
      padding: 3px 8px;
      background: var(--bg-raised);
      border: 1px solid var(--border-bright);
      border-radius: var(--radius-sm);
      font-family: var(--font-heading);
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-primary);
      text-align: center;
      white-space: nowrap;
    }
    .about__faq {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      margin-top: var(--space-md);
    }
    .about__faq-item {
      background-color: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      transition: border-color 0.2s;
    }
    .about__faq-item[open] {
      border-color: var(--accent-gold);
    }
    .about__faq-item summary {
      padding: var(--space-md) var(--space-lg);
      font-weight: 600;
      cursor: pointer;
      color: var(--text-primary);
      list-style: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: color 0.2s;
    }
    .about__faq-item summary:hover {
      color: var(--accent-gold);
    }
    .about__faq-item summary::after {
      content: '+';
      font-size: 1.2rem;
      color: var(--accent-gold);
      font-weight: 400;
      transition: transform 0.3s;
    }
    .about__faq-item[open] summary::after {
      content: '-';
      transform: rotate(180deg);
    }
    .about__faq-item summary::-webkit-details-marker { display: none; }
    .about__faq-item .about__faq-content {
      display: grid;
      grid-template-rows: 0fr;
      transition: grid-template-rows 0.3s ease;
    }
    .about__faq-item[open] .about__faq-content {
      grid-template-rows: 1fr;
    }
    .about__faq-content > div {
      overflow: hidden;
    }
    .about__faq-item p {
      padding: 0 var(--space-lg) var(--space-lg);
      margin: 0;
      font-size: 0.95rem;
    }
    .about__faq-item a {
      color: var(--accent-gold);
    }
    .about__stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-md);
      margin-top: var(--space-md);
    }
    .about__stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--space-lg);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
    }
    .about__stat-value {
      font-family: var(--font-heading);
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--accent-gold);
      line-height: 1;
      margin-bottom: var(--space-xs);
    }
    .about__stat-label {
      font-size: 0.75rem;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: 600;
    }
    .about__highlights {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-md);
      margin-top: var(--space-md);
    }
    .about__highlight {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: var(--space-md) var(--space-lg);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      text-decoration: none;
      color: inherit;
      transition: border-color 0.2s;
    }
    .about__highlight:hover {
      border-color: var(--accent-gold);
      color: inherit;
    }
    .about__highlight-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-tertiary);
      font-weight: 600;
    }
    .about__highlight-value {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--accent-gold);
    }
    .about__features {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-md);
      margin-top: var(--space-md);
    }
    .about__feature {
      display: flex;
      align-items: flex-start;
      gap: var(--space-md);
      padding: var(--space-lg);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      text-decoration: none;
      color: inherit;
      transition: border-color 0.2s, background-color 0.2s;
    }
    .about__feature:hover {
      border-color: var(--accent-gold);
      background: var(--bg-raised);
      color: inherit;
    }
    .about__feature-icon {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: var(--accent-gold-dim);
      color: var(--accent-gold);
      font-size: 1rem;
      font-weight: 700;
      flex-shrink: 0;
    }
    .about__feature h3 {
      font-size: 0.95rem;
      margin: 0 0 2px;
      color: var(--text-primary);
    }
    .about__feature:hover h3 { color: var(--accent-gold); }
    .about__feature p {
      font-size: 0.8rem;
      margin: 0;
      line-height: 1.5;
    }
    @media (max-width: 480px) {
      .about__stats { grid-template-columns: repeat(2, 1fr); }
      .about__stat-value { font-size: 1.4rem; }
      .about__features { grid-template-columns: 1fr; }
      .about__highlights { grid-template-columns: 1fr; }
    }
  `],
})
export class AboutComponent implements OnInit {
  private readonly catalog = inject(CatalogService);
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);

  readonly catalogStats = computed(() => {
    const movies = this.catalog.movies();
    if (movies.length === 0) return null;
    const meta = this.catalog.meta();
    const streamable = movies.filter((m) => m.isStreamable).length;
    const directorSet = new Set<string>();
    for (const m of movies) {
      for (const d of m.directors) directorSet.add(d);
    }
    const years = movies.map((m) => m.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    return {
      total: movies.length.toLocaleString(),
      streamable: streamable.toLocaleString(),
      decades: meta?.decades.length ?? 0,
      genres: meta?.genres.length ?? 0,
      directors: directorSet.size.toLocaleString(),
      yearRange: `${minYear}–${maxYear}`,
    };
  });

  readonly highlights = computed(() => {
    const movies = this.catalog.movies();
    if (movies.length === 0) return null;

    const oldest = movies.reduce((o, m) => m.year < o.year ? m : o);
    const rated = movies.filter((m) => m.voteAverage > 0);
    const highestRated = rated.length > 0
      ? rated.reduce((h, m) => m.voteAverage > h.voteAverage ? m : h)
      : null;

    const dirCounts = new Map<string, number>();
    for (const m of movies) for (const d of m.directors) dirCounts.set(d, (dirCounts.get(d) ?? 0) + 1);
    const topDir = [...dirCounts.entries()].sort((a, b) => b[1] - a[1])[0];

    const genreCounts = new Map<string, number>();
    for (const m of movies) for (const g of m.genres) genreCounts.set(g, (genreCounts.get(g) ?? 0) + 1);
    const topGenre = [...genreCounts.entries()].sort((a, b) => b[1] - a[1])[0];

    return {
      oldest,
      highestRated,
      topDirector: topDir ? { name: topDir[0], count: topDir[1] } : null,
      topGenre: topGenre ? { name: topGenre[0], count: topGenre[1] } : null,
    };
  });

  ngOnInit(): void {
    this.catalog.load();
    this.titleService.setTitle('About — BW Cinema');
    const aboutDesc = 'About BW Cinema — a curated collection of classic black-and-white films, free to stream and explore.';
    this.metaService.updateTag({ name: 'description', content: aboutDesc });
    this.metaService.updateTag({ property: 'og:description', content: aboutDesc });
    this.metaService.updateTag({ name: 'twitter:description', content: aboutDesc });
  }
}
