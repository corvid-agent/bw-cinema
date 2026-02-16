import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer" role="contentinfo">
      <div class="footer__inner container">
        <div class="footer__top">
          <span class="footer__brand">BW Cinema</span>
          <span class="footer__sep" aria-hidden="true">&mdash;</span>
          <span class="footer__tagline">Celebrating classic black &amp; white film</span>
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
  `],
})
export class FooterComponent {}
