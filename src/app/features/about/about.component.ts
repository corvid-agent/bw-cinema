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
  `],
})
export class AboutComponent {}
