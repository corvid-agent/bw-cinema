import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <footer class="footer" role="contentinfo">
      <div class="footer__inner container">
        <div class="footer__top">
          <span class="footer__brand">BW Cinema</span>
          <span class="footer__sep" aria-hidden="true">&mdash;</span>
          <span class="footer__tagline">Celebrating classic black &amp; white film</span>
        </div>
        <nav class="footer__nav" aria-label="Footer navigation">
          <div class="footer__nav-col">
            <h4 class="footer__nav-heading">Discover</h4>
            <a routerLink="/browse">Browse Films</a>
            <a routerLink="/explore">Explore by Mood</a>
            <a routerLink="/quiz">Film Quiz</a>
          </div>
          <div class="footer__nav-col">
            <h4 class="footer__nav-heading">Library</h4>
            <a routerLink="/collection">My Collection</a>
            <a routerLink="/wrapped">Year in Review</a>
            <a routerLink="/compare">Compare Films</a>
          </div>
          <div class="footer__nav-col">
            <h4 class="footer__nav-heading">Info</h4>
            <a routerLink="/stats">Catalog Stats</a>
            <a routerLink="/about">About</a>
            <a href="https://github.com/corvid-agent/bw-cinema" target="_blank" rel="noopener">GitHub</a>
          </div>
          <div class="footer__nav-col footer__ecosystem">
            <h4 class="footer__nav-heading">Ecosystem</h4>
            <a href="https://corvid-agent.github.io/" target="_blank" rel="noopener">Home</a>
            <a href="https://corvid-agent.github.io/pd-gallery/" target="_blank" rel="noopener">Art Gallery</a>
            <a href="https://corvid-agent.github.io/pd-audiobooks/" target="_blank" rel="noopener">Audiobooks</a>
            <a href="https://corvid-agent.github.io/weather-dashboard/" target="_blank" rel="noopener">Weather</a>
            <a href="https://corvid-agent.github.io/space-dashboard/" target="_blank" rel="noopener">Space</a>
            <a href="https://corvid-agent.github.io/retro-arcade/" target="_blank" rel="noopener">Retro Arcade</a>
          </div>
        </nav>
        <div class="footer__decades">
          <h4 class="footer__nav-heading">Browse by Decade</h4>
          <div class="footer__decade-links">
            @for (d of decades; track d) {
              <a class="footer__decade-link" [routerLink]="['/decade', d]">{{ d }}s</a>
            }
          </div>
        </div>
        <p class="footer__credits">
          Data from
          <a href="https://www.wikidata.org" target="_blank" rel="noopener">Wikidata (opens in new tab)</a>
          &amp;
          <a href="https://www.themoviedb.org" target="_blank" rel="noopener">TMDb (opens in new tab)</a>.
          Streaming via
          <a href="https://archive.org" target="_blank" rel="noopener">Internet Archive (opens in new tab)</a>.
        </p>
        <div class="footer__tmdb">
          <img
            src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
            alt="TMDB logo"
            class="footer__tmdb-logo"
            width="120"
            height="14"
            loading="lazy"
          />
          <p class="footer__disclaimer">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      border-top: 1px solid var(--border);
      padding: var(--space-xl) 0;
      margin-top: var(--space-3xl);
    }
    .footer__inner { text-align: center; }
    .footer__top {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-sm);
      margin-bottom: var(--space-md);
    }
    .footer__brand {
      font-family: var(--font-heading);
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .footer__sep {
      color: var(--text-tertiary);
    }
    .footer__tagline {
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
    .footer__nav {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-lg);
      max-width: 580px;
      margin: 0 auto var(--space-xl);
      text-align: left;
    }
    .footer__nav-heading {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-tertiary);
      font-weight: 600;
      margin: 0 0 var(--space-sm);
    }
    .footer__nav-col {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }
    .footer__nav-col a {
      font-size: 0.85rem;
      color: var(--text-secondary);
      text-decoration: none;
      transition: color 0.2s;
    }
    .footer__nav-col a:hover {
      color: var(--accent-gold);
    }
    .footer__decades {
      max-width: 480px;
      margin: 0 auto var(--space-xl);
      text-align: center;
    }
    .footer__decades .footer__nav-heading {
      margin-bottom: var(--space-md);
    }
    .footer__decade-links {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--space-xs);
    }
    .footer__decade-link {
      font-size: 0.875rem;
      padding: 8px 14px;
      border: 1px solid var(--border);
      border-radius: 14px;
      color: var(--text-tertiary);
      text-decoration: none;
      transition: all 0.2s;
      min-height: 44px;
      display: inline-flex;
      align-items: center;
    }
    .footer__decade-link:hover {
      border-color: var(--accent-gold);
      color: var(--accent-gold);
      background-color: var(--accent-gold-dim);
    }
    .footer__credits {
      color: var(--text-tertiary);
      font-size: 0.85rem;
      margin: 0 0 var(--space-xs);
    }
    .footer__credits a {
      color: var(--text-secondary);
    }
    .footer__credits a:hover {
      color: var(--accent-gold);
    }
    .footer__tmdb {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-xs);
      margin-top: var(--space-sm);
    }
    .footer__tmdb-logo {
      opacity: 0.7;
    }
    .footer__disclaimer {
      color: var(--text-tertiary);
      font-size: 0.75rem;
      margin: 0;
      opacity: 0.7;
    }
    @media (max-width: 768px) { .footer { padding-bottom: 100px; } }
  `],
})
export class FooterComponent {
  readonly decades = [1890, 1900, 1910, 1920, 1930, 1940, 1950, 1960, 1970];
}
