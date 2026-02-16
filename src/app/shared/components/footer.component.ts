import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer">
      <div class="footer__inner container">
        <p class="footer__brand">BW Cinema &mdash; Celebrating Classic Black &amp; White Film</p>
        <p class="footer__credits">
          Data from
          <a href="https://www.wikidata.org" target="_blank" rel="noopener">Wikidata</a>,
          <a href="https://www.themoviedb.org" target="_blank" rel="noopener">TMDb</a>,
          <a href="https://www.omdbapi.com" target="_blank" rel="noopener">OMDb</a>.
          Streaming via <a href="https://archive.org" target="_blank" rel="noopener">Internet Archive</a>.
        </p>
        <p class="footer__tmdb">
          This product uses the TMDb API but is not endorsed or certified by TMDb.
        </p>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background-color: var(--bg-surface);
      border-top: 1px solid var(--border);
      padding: var(--space-xl) 0;
      margin-top: var(--space-2xl);
    }
    .footer__inner { text-align: center; }
    .footer__brand {
      font-family: var(--font-heading);
      font-size: 1.1rem;
      color: var(--accent-gold);
      margin: 0 0 var(--space-sm);
    }
    .footer__credits {
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin: 0 0 var(--space-xs);
    }
    .footer__tmdb {
      color: var(--text-tertiary);
      font-size: 0.8rem;
      margin: 0;
    }
  `],
})
export class FooterComponent {}
