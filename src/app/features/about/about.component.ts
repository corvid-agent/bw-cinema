import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
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

      <section class="about__section">
        <h2>Data Sources</h2>
        <p>Our catalog is built from multiple trusted sources:</p>
        <ul class="about__list">
          <li>
            <strong>Wikidata</strong> &mdash; Our master film database, providing the comprehensive
            list of black &amp; white films with cross-referenced identifiers.
          </li>
          <li>
            <strong>The Movie Database (TMDb)</strong> &mdash; Provides poster images, cast information,
            synopses, and community ratings. This product uses the TMDb API but is not endorsed
            or certified by TMDb.
          </li>
          <li>
            <strong>OMDb API</strong> &mdash; Provides additional ratings from IMDb, Rotten Tomatoes,
            and Metacritic.
          </li>
          <li>
            <strong>Internet Archive</strong> &mdash; Hosts public domain films that you can watch
            for free directly on our site.
          </li>
        </ul>
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
    .about { padding: var(--space-xl) 0; max-width: 800px; }
    .about__section {
      margin-bottom: var(--space-2xl);
    }
    .about__section p {
      color: var(--text-secondary);
      line-height: 1.8;
    }
    .about__list {
      list-style: none;
      padding: 0;
    }
    .about__list li {
      padding: var(--space-md) 0;
      border-bottom: 1px solid var(--border);
      color: var(--text-secondary);
      line-height: 1.7;
    }
    .about__list li strong {
      color: var(--accent-gold);
    }
  `],
})
export class AboutComponent {}
