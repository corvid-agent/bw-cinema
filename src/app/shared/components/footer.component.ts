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
        <p class="footer__disclaimer">
          This product uses the TMDb API but is not endorsed or certified by TMDb.
        </p>
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
    .footer__disclaimer {
      color: var(--text-tertiary);
      font-size: 0.75rem;
      margin: 0;
      opacity: 0.7;
    }
  `],
})
export class FooterComponent {}
