import { Component, ChangeDetectionStrategy, inject, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';

@Component({
  selector: 'app-stats',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="stats container">
      <h1>Catalog Statistics</h1>
      <p class="stats__subtitle">A look at the numbers behind our collection of classic cinema.</p>

      @if (catalog.loading()) {
        <app-loading-spinner />
      } @else {
        <div class="stats__overview">
          <div class="stats__card">
            <span class="stats__card-value">{{ totalFilms() }}</span>
            <span class="stats__card-label">Total Films</span>
          </div>
          <div class="stats__card">
            <span class="stats__card-value">{{ streamableFilms() }}</span>
            <span class="stats__card-label">Free to Watch</span>
          </div>
          <div class="stats__card">
            <span class="stats__card-value">{{ streamablePct() }}%</span>
            <span class="stats__card-label">Streamable</span>
          </div>
          <div class="stats__card">
            <span class="stats__card-value">{{ avgRating() }}</span>
            <span class="stats__card-label">Avg. Rating</span>
          </div>
          <div class="stats__card">
            <span class="stats__card-value">{{ yearRange() }}</span>
            <span class="stats__card-label">Year Range</span>
          </div>
          <div class="stats__card">
            <span class="stats__card-value">{{ uniqueDirectors() }}</span>
            <span class="stats__card-label">Directors</span>
          </div>
        </div>

        <div class="stats__availability">
          <h2>Streaming Availability</h2>
          <div class="stats__avail-bars">
            <div class="stats__avail-row">
              <span class="stats__avail-label">Internet Archive</span>
              <div class="stats__avail-track">
                <div class="stats__avail-fill stats__avail-fill--ia" [style.width.%]="iaFilmsPct()"></div>
              </div>
              <span class="stats__avail-count">{{ iaFilms() }}</span>
            </div>
            <div class="stats__avail-row">
              <span class="stats__avail-label">YouTube</span>
              <div class="stats__avail-track">
                <div class="stats__avail-fill stats__avail-fill--yt" [style.width.%]="ytFilmsPct()"></div>
              </div>
              <span class="stats__avail-count">{{ ytFilms() }}</span>
            </div>
            <div class="stats__avail-row">
              <span class="stats__avail-label">Not Streamable</span>
              <div class="stats__avail-track">
                <div class="stats__avail-fill stats__avail-fill--none" [style.width.%]="notStreamablePct()"></div>
              </div>
              <span class="stats__avail-count">{{ totalFilms() - streamableFilms() }}</span>
            </div>
          </div>
        </div>

        <div class="stats__sections">
          <section class="stats__section">
            <h2>Films by Decade</h2>
            <div class="stats__bars">
              @for (d of decadeStats(); track d.name) {
                <a class="stats__bar-row stats__bar-row--link" [routerLink]="['/decade', d.decade]">
                  <span class="stats__bar-label">{{ d.name }}</span>
                  <div class="stats__bar-track">
                    <div class="stats__bar-fill" [style.width.%]="d.pct"></div>
                  </div>
                  <span class="stats__bar-count">{{ d.count }}</span>
                </a>
              }
            </div>
          </section>

          <section class="stats__section">
            <h2>Top Genres</h2>
            <div class="stats__bars">
              @for (g of genreStats(); track g.name) {
                <a class="stats__bar-row stats__bar-row--link" [routerLink]="['/genre', g.name]">
                  <span class="stats__bar-label">{{ g.name }}</span>
                  <div class="stats__bar-track">
                    <div class="stats__bar-fill" [style.width.%]="g.pct"></div>
                  </div>
                  <span class="stats__bar-count">{{ g.count }}</span>
                </a>
              }
            </div>
          </section>
        </div>

        <div class="stats__sections">
          <section class="stats__section">
            <h2>Top Directors</h2>
            <div class="stats__bars">
              @for (d of directorStats(); track d.name) {
                <a class="stats__bar-row stats__bar-row--link" [routerLink]="['/director', d.name]">
                  <span class="stats__bar-label">{{ d.name }}</span>
                  <div class="stats__bar-track">
                    <div class="stats__bar-fill" [style.width.%]="d.pct"></div>
                  </div>
                  <span class="stats__bar-count">{{ d.count }}</span>
                </a>
              }
            </div>
          </section>

          <section class="stats__section">
            <h2>Rating Distribution</h2>
            <div class="stats__bars">
              @for (r of ratingDistribution(); track r.name) {
                <div class="stats__bar-row">
                  <span class="stats__bar-label">{{ r.name }}</span>
                  <div class="stats__bar-track">
                    <div class="stats__bar-fill" [style.width.%]="r.pct"></div>
                  </div>
                  <span class="stats__bar-count">{{ r.count }}</span>
                </div>
              }
            </div>
          </section>
        </div>
        <div class="stats__sections">
          <section class="stats__section">
            <h2>Top Languages</h2>
            <div class="stats__bars">
              @for (l of languageStats(); track l.name) {
                <a class="stats__bar-row stats__bar-row--link" [routerLink]="['/browse']" [queryParams]="{ languages: l.name, streamable: '0' }">
                  <span class="stats__bar-label">{{ l.name }}</span>
                  <div class="stats__bar-track">
                    <div class="stats__bar-fill" [style.width.%]="l.pct"></div>
                  </div>
                  <span class="stats__bar-count">{{ l.count }}</span>
                </a>
              }
            </div>
          </section>

          <section class="stats__section">
            <h2>Language Diversity</h2>
            <div class="stats__lang-summary">
              <div class="stats__card">
                <span class="stats__card-value">{{ uniqueLanguages() }}</span>
                <span class="stats__card-label">Languages</span>
              </div>
              <div class="stats__card">
                <span class="stats__card-value">{{ nonEnglishPct() }}%</span>
                <span class="stats__card-label">Non-English</span>
              </div>
            </div>
          </section>
        </div>

        <div class="stats__highlights">
          @if (oldestFilm(); as film) {
            <a class="stats__highlight" [routerLink]="['/movie', film.id]">
              @if (film.posterUrl) {
                <img class="stats__highlight-poster" [src]="film.posterUrl" [alt]="film.title" loading="lazy" />
              }
              <div class="stats__highlight-text">
                <span class="stats__highlight-label">Oldest Film</span>
                <span class="stats__highlight-value">{{ film.title }}</span>
                <span class="stats__highlight-meta">{{ film.year }}</span>
              </div>
            </a>
          }
          @if (newestFilm(); as film) {
            <a class="stats__highlight" [routerLink]="['/movie', film.id]">
              @if (film.posterUrl) {
                <img class="stats__highlight-poster" [src]="film.posterUrl" [alt]="film.title" loading="lazy" />
              }
              <div class="stats__highlight-text">
                <span class="stats__highlight-label">Most Recent Film</span>
                <span class="stats__highlight-value">{{ film.title }}</span>
                <span class="stats__highlight-meta">{{ film.year }}</span>
              </div>
            </a>
          }
          @if (highestRatedFilm(); as film) {
            <a class="stats__highlight" [routerLink]="['/movie', film.id]">
              @if (film.posterUrl) {
                <img class="stats__highlight-poster" [src]="film.posterUrl" [alt]="film.title" loading="lazy" />
              }
              <div class="stats__highlight-text">
                <span class="stats__highlight-label">Highest Rated</span>
                <span class="stats__highlight-value">{{ film.title }}</span>
                <span class="stats__highlight-meta">&#9733; {{ film.voteAverage.toFixed(1) }}</span>
              </div>
            </a>
          }
          @if (mostFilmedDirector(); as dir) {
            <a class="stats__highlight" [routerLink]="['/director', dir.name]">
              <div class="stats__highlight-initial">{{ dir.name[0] }}</div>
              <div class="stats__highlight-text">
                <span class="stats__highlight-label">Most Prolific Director</span>
                <span class="stats__highlight-value">{{ dir.name }}</span>
                <span class="stats__highlight-meta">{{ dir.count }} films</span>
              </div>
            </a>
          }
          @if (highestRatedDirector(); as dir) {
            <a class="stats__highlight" [routerLink]="['/director', dir.name]">
              <div class="stats__highlight-initial">{{ dir.name[0] }}</div>
              <div class="stats__highlight-text">
                <span class="stats__highlight-label">Highest Rated Director</span>
                <span class="stats__highlight-value">{{ dir.name }}</span>
                <span class="stats__highlight-meta">&#9733; {{ dir.avgRating }} avg ({{ dir.count }} films)</span>
              </div>
            </a>
          }
          @if (longestCareer(); as dir) {
            <a class="stats__highlight" [routerLink]="['/director', dir.name]">
              <div class="stats__highlight-initial">{{ dir.name[0] }}</div>
              <div class="stats__highlight-text">
                <span class="stats__highlight-label">Longest Career</span>
                <span class="stats__highlight-value">{{ dir.name }}</span>
                <span class="stats__highlight-meta">{{ dir.span }} years ({{ dir.count }} films)</span>
              </div>
            </a>
          }
          @if (oldestStreamable(); as film) {
            <a class="stats__highlight" [routerLink]="['/movie', film.id]">
              @if (film.posterUrl) {
                <img class="stats__highlight-poster" [src]="film.posterUrl" [alt]="film.title" loading="lazy" />
              }
              <div class="stats__highlight-text">
                <span class="stats__highlight-label">Oldest Free Film</span>
                <span class="stats__highlight-value">{{ film.title }}</span>
                <span class="stats__highlight-meta">{{ film.year }}</span>
              </div>
            </a>
          }
          @if (mostVersatileDirector(); as dir) {
            <a class="stats__highlight" [routerLink]="['/director', dir.name]">
              <div class="stats__highlight-initial">{{ dir.name[0] }}</div>
              <div class="stats__highlight-text">
                <span class="stats__highlight-label">Most Versatile Director</span>
                <span class="stats__highlight-value">{{ dir.name }}</span>
                <span class="stats__highlight-meta">{{ dir.genreCount }} genres across {{ dir.count }} films</span>
              </div>
            </a>
          }
          @if (longestTitle(); as film) {
            <a class="stats__highlight" [routerLink]="['/movie', film.id]">
              @if (film.posterUrl) {
                <img class="stats__highlight-poster" [src]="film.posterUrl" [alt]="film.title" loading="lazy" />
              }
              <div class="stats__highlight-text">
                <span class="stats__highlight-label">Longest Title</span>
                <span class="stats__highlight-value">{{ film.title }}</span>
                <span class="stats__highlight-meta">{{ film.title.length }} characters</span>
              </div>
            </a>
          }
          @if (shortestTitle(); as film) {
            <a class="stats__highlight" [routerLink]="['/movie', film.id]">
              @if (film.posterUrl) {
                <img class="stats__highlight-poster" [src]="film.posterUrl" [alt]="film.title" loading="lazy" />
              }
              <div class="stats__highlight-text">
                <span class="stats__highlight-label">Shortest Title</span>
                <span class="stats__highlight-value">{{ film.title }}</span>
                <span class="stats__highlight-meta">{{ film.title.length }} characters</span>
              </div>
            </a>
          }
          @if (newestStreamable(); as film) {
            <a class="stats__highlight" [routerLink]="['/movie', film.id]">
              @if (film.posterUrl) {
                <img class="stats__highlight-poster" [src]="film.posterUrl" [alt]="film.title" loading="lazy" />
              }
              <div class="stats__highlight-text">
                <span class="stats__highlight-label">Newest Free Film</span>
                <span class="stats__highlight-value">{{ film.title }}</span>
                <span class="stats__highlight-meta">{{ film.year }}</span>
              </div>
            </a>
          }
        </div>

        <section class="stats__fun-facts">
          <h2>Fun Facts</h2>
          <div class="stats__facts-grid">
            <div class="stats__fact-card">
              <span class="stats__fact-number">{{ silentFilmCount() }}</span>
              <span class="stats__fact-text">silent-era films (pre-1930)</span>
            </div>
            <div class="stats__fact-card">
              <span class="stats__fact-number">{{ filmNoirCount() }}</span>
              <span class="stats__fact-text">film noir titles</span>
            </div>
            <div class="stats__fact-card">
              <span class="stats__fact-number">{{ peakDecade() }}</span>
              <span class="stats__fact-text">most represented decade</span>
            </div>
            <div class="stats__fact-card">
              <span class="stats__fact-number">{{ avgYear() }}</span>
              <span class="stats__fact-text">average release year</span>
            </div>
            @if (medianYear() > 0) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ medianYear() }}</span>
                <span class="stats__fact-text">median release year</span>
              </div>
            }
            <div class="stats__fact-card">
              <span class="stats__fact-number">{{ filmsWithPosters() }}%</span>
              <span class="stats__fact-text">films have poster artwork</span>
            </div>
            <div class="stats__fact-card">
              <span class="stats__fact-number">{{ multiGenreCount() }}</span>
              <span class="stats__fact-text">films span 3+ genres</span>
            </div>
            <div class="stats__fact-card">
              <span class="stats__fact-number">{{ peakYear() }}</span>
              <span class="stats__fact-text">year with the most films</span>
            </div>
            <div class="stats__fact-card">
              <span class="stats__fact-number">{{ soloDirectorFilms() }}</span>
              <span class="stats__fact-text">single-director films</span>
            </div>
            <div class="stats__fact-card">
              <span class="stats__fact-number">{{ coDirectedCount() }}</span>
              <span class="stats__fact-text">co-directed films</span>
            </div>
            @if (uniqueLanguageCount() > 1) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ uniqueLanguageCount() }}</span>
                <span class="stats__fact-text">languages represented</span>
              </div>
            }
            @if (yearSpan()) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ yearSpan() }}</span>
                <span class="stats__fact-text">year range of catalog</span>
              </div>
            }
            @if (highRatedPct() > 0) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ highRatedPct() }}%</span>
                <span class="stats__fact-text">rated 7.0 or higher</span>
              </div>
            }
            @if (medianRating()) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ medianRating() }}</span>
                <span class="stats__fact-text">median film rating</span>
              </div>
            }
            @if (avgFilmsPerDirector()) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ avgFilmsPerDirector() }}</span>
                <span class="stats__fact-text">avg films per director</span>
              </div>
            }
            @if (oneFilmDirectorCount() > 0) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ oneFilmDirectorCount() }}</span>
                <span class="stats__fact-text">one-film directors</span>
              </div>
            }
            @if (unratedFilmCount() > 0) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ unratedFilmCount() }}</span>
                <span class="stats__fact-text">films without ratings</span>
              </div>
            }
            @if (avgGenresPerFilm(); as agpf) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ agpf }}</span>
                <span class="stats__fact-text">avg genres per film</span>
              </div>
            }
            @if (multiDirectorPct(); as mdp) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ mdp }}%</span>
                <span class="stats__fact-text">co-directed films</span>
              </div>
            }
            @if (avgGenresPerDirector(); as agpd) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ agpd }}</span>
                <span class="stats__fact-text">avg genres per director</span>
              </div>
            }
            @if (avgDirectorCareer(); as adc) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ adc }}yr</span>
                <span class="stats__fact-text">avg director career span</span>
              </div>
            }
            @if (topStreamableDecade(); as tsd) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ tsd.decade }}s</span>
                <span class="stats__fact-text">most free films ({{ tsd.count }})</span>
              </div>
            }
            @if (avgFilmAge() > 0) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ avgFilmAge() }}yr</span>
                <span class="stats__fact-text">avg film age</span>
              </div>
            }
            @if (medianFilmAge() > 0) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ medianFilmAge() }}yr</span>
                <span class="stats__fact-text">median film age</span>
              </div>
            }
            @if (streamableAvgRating(); as sar) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ sar }}</span>
                <span class="stats__fact-text">avg rating (free films)</span>
              </div>
            }
            @if (silentEraStreamablePct(); as sesp) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ sesp }}%</span>
                <span class="stats__fact-text">silent-era films streamable</span>
              </div>
            }
            @if (coDirectedPct(); as cdp) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ cdp }}%</span>
                <span class="stats__fact-text">co-directed films</span>
              </div>
            }
            @if (avgTitleLength() > 0) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ avgTitleLength() }}</span>
                <span class="stats__fact-text">avg title length (chars)</span>
              </div>
            }
            @if (multiLanguageDirectorCount(); as mldc) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ mldc }}</span>
                <span class="stats__fact-text">multilingual directors</span>
              </div>
            }
          </div>
        </section>

        @if (genrePairs().length > 0) {
          <section class="stats__section">
            <h2>Most Common Genre Pairs</h2>
            <div class="stats__bars">
              @for (pair of genrePairs(); track pair.name) {
                <div class="stats__bar-row">
                  <span class="stats__bar-label stats__bar-label--wide">{{ pair.name }}</span>
                  <div class="stats__bar-track">
                    <div class="stats__bar-fill" [style.width.%]="pair.pct"></div>
                  </div>
                  <span class="stats__bar-count">{{ pair.count }}</span>
                </div>
              }
            </div>
          </section>
        }
      }
    </div>
  `,
  styles: [`
    .stats { padding: var(--space-xl) 0; }
    .stats__subtitle {
      color: var(--text-tertiary);
      margin: 0 0 var(--space-xl);
    }
    .stats__overview {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: var(--space-md);
      margin-bottom: var(--space-2xl);
    }
    .stats__card {
      background-color: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-lg);
      text-align: center;
    }
    .stats__card-value {
      display: block;
      font-family: var(--font-heading);
      font-size: 2rem;
      font-weight: 700;
      color: var(--accent-gold);
      margin-bottom: 4px;
    }
    .stats__card-label {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-tertiary);
    }
    .stats__sections {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-xl);
      margin-bottom: var(--space-xl);
    }
    .stats__section h2 {
      margin-bottom: var(--space-md);
    }
    .stats__bars {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }
    .stats__bar-row {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }
    .stats__bar-row--link {
      text-decoration: none;
      color: inherit;
      border-radius: var(--radius);
      padding: 2px 0;
      transition: background-color 0.15s;
    }
    .stats__bar-row--link:hover {
      background-color: var(--bg-hover);
    }
    .stats__bar-row--link:hover .stats__bar-label {
      color: var(--accent-gold);
    }
    .stats__bar-label {
      min-width: 90px;
      font-size: 0.85rem;
      color: var(--text-secondary);
      text-align: right;
      transition: color 0.15s;
    }
    .stats__bar-label--wide {
      min-width: 140px;
    }
    .stats__bar-track {
      flex: 1;
      height: 8px;
      background-color: var(--bg-raised);
      border-radius: 4px;
      overflow: hidden;
    }
    .stats__bar-fill {
      height: 100%;
      background-color: var(--accent-gold);
      border-radius: 4px;
      transition: width 0.4s ease;
    }
    .stats__bar-count {
      min-width: 32px;
      font-size: 0.8rem;
      color: var(--text-tertiary);
    }
    .stats__availability {
      margin-bottom: var(--space-2xl);
    }
    .stats__availability h2 {
      margin-bottom: var(--space-md);
    }
    .stats__avail-bars {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }
    .stats__avail-row {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }
    .stats__avail-label {
      min-width: 130px;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
    .stats__avail-track {
      flex: 1;
      height: 20px;
      background: var(--bg-raised);
      border-radius: var(--radius);
      overflow: hidden;
    }
    .stats__avail-fill {
      height: 100%;
      border-radius: var(--radius);
      transition: width 0.4s ease;
    }
    .stats__avail-fill--ia { background: rgba(25, 135, 84, 0.8); }
    .stats__avail-fill--yt { background: rgba(255, 0, 0, 0.7); }
    .stats__avail-fill--none { background: var(--border-bright); }
    .stats__avail-count {
      min-width: 50px;
      font-size: 0.85rem;
      color: var(--text-tertiary);
      text-align: right;
    }
    .stats__highlights {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: var(--space-md);
      margin-top: var(--space-xl);
    }
    .stats__highlight {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-md) var(--space-lg);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      text-decoration: none;
      color: inherit;
      transition: border-color 0.2s, background-color 0.2s;
    }
    .stats__highlight:hover {
      border-color: var(--accent-gold);
      background: var(--bg-raised);
      color: inherit;
    }
    .stats__highlight-poster {
      width: 40px;
      height: 60px;
      object-fit: cover;
      border-radius: var(--radius-sm);
      flex-shrink: 0;
    }
    .stats__highlight-initial {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: var(--accent-gold-dim);
      color: var(--accent-gold);
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 1.2rem;
      flex-shrink: 0;
    }
    .stats__highlight-text {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .stats__highlight-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-tertiary);
      font-weight: 600;
    }
    .stats__highlight-value {
      font-family: var(--font-heading);
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .stats__highlight:hover .stats__highlight-value {
      color: var(--accent-gold);
    }
    .stats__highlight-meta {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
    .stats__lang-summary {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-md);
    }
    .stats__fun-facts {
      margin-top: var(--space-2xl);
    }
    .stats__fun-facts h2 {
      margin-bottom: var(--space-lg);
    }
    .stats__facts-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-md);
    }
    .stats__fact-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-lg);
      text-align: center;
    }
    .stats__fact-number {
      display: block;
      font-family: var(--font-heading);
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--accent-gold);
      margin-bottom: 4px;
    }
    .stats__fact-text {
      font-size: 0.8rem;
      color: var(--text-tertiary);
    }
    @media (max-width: 768px) {
      .stats__sections { grid-template-columns: 1fr; }
    }
    @media (max-width: 480px) {
      .stats__overview { grid-template-columns: repeat(2, 1fr); }
      .stats__bar-label { min-width: 70px; font-size: 0.8rem; }
      .stats__avail-label { min-width: 80px; font-size: 0.8rem; }
      .stats__highlights { grid-template-columns: repeat(2, 1fr); }
      .stats__lang-summary { grid-template-columns: 1fr; }
      .stats__facts-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `],
})
export class StatsComponent implements OnInit {
  protected readonly catalog = inject(CatalogService);

  readonly totalFilms = computed(() => this.catalog.movies().length);
  readonly streamableFilms = computed(() => this.catalog.movies().filter((m) => m.isStreamable).length);
  readonly streamablePct = computed(() => {
    const total = this.totalFilms();
    return total > 0 ? Math.round((this.streamableFilms() / total) * 100) : 0;
  });
  readonly iaFilms = computed(() => this.catalog.movies().filter((m) => m.internetArchiveId).length);
  readonly ytFilms = computed(() => this.catalog.movies().filter((m) => m.youtubeId && !m.internetArchiveId).length);
  readonly iaFilmsPct = computed(() => {
    const total = this.totalFilms();
    return total > 0 ? (this.iaFilms() / total) * 100 : 0;
  });
  readonly ytFilmsPct = computed(() => {
    const total = this.totalFilms();
    return total > 0 ? (this.ytFilms() / total) * 100 : 0;
  });
  readonly notStreamablePct = computed(() => {
    const total = this.totalFilms();
    return total > 0 ? ((total - this.streamableFilms()) / total) * 100 : 0;
  });
  readonly uniqueDirectors = computed(() => {
    const dirs = new Set<string>();
    for (const m of this.catalog.movies()) for (const d of m.directors) dirs.add(d);
    return dirs.size;
  });
  readonly oldestFilm = computed(() => {
    const movies = this.catalog.movies();
    if (movies.length === 0) return null;
    return movies.reduce((oldest, m) => m.year < oldest.year ? m : oldest);
  });
  readonly newestFilm = computed(() => {
    const movies = this.catalog.movies();
    if (movies.length === 0) return null;
    return movies.reduce((newest, m) => m.year > newest.year ? m : newest);
  });
  readonly highestRatedFilm = computed(() => {
    const movies = this.catalog.movies().filter((m) => m.voteAverage > 0);
    if (movies.length === 0) return null;
    return movies.reduce((best, m) => m.voteAverage > best.voteAverage ? m : best);
  });
  readonly mostFilmedDirector = computed(() => {
    const stats = this.directorStats();
    return stats.length > 0 ? stats[0] : null;
  });

  readonly highestRatedDirector = computed(() => {
    const dirMap = new Map<string, { total: number; count: number }>();
    for (const m of this.catalog.movies()) {
      if (m.voteAverage === 0) continue;
      for (const d of m.directors) {
        const entry = dirMap.get(d) ?? { total: 0, count: 0 };
        entry.total += m.voteAverage;
        entry.count++;
        dirMap.set(d, entry);
      }
    }
    const eligible = [...dirMap.entries()]
      .filter(([, v]) => v.count >= 5)
      .map(([name, v]) => ({ name, count: v.count, avgRating: (v.total / v.count).toFixed(1) }))
      .sort((a, b) => parseFloat(b.avgRating) - parseFloat(a.avgRating));
    return eligible[0] ?? null;
  });

  readonly longestCareer = computed(() => {
    const dirYears = new Map<string, { min: number; max: number; count: number }>();
    for (const m of this.catalog.movies()) {
      for (const d of m.directors) {
        const entry = dirYears.get(d) ?? { min: m.year, max: m.year, count: 0 };
        entry.min = Math.min(entry.min, m.year);
        entry.max = Math.max(entry.max, m.year);
        entry.count++;
        dirYears.set(d, entry);
      }
    }
    const eligible = [...dirYears.entries()]
      .filter(([, v]) => v.count >= 3)
      .map(([name, v]) => ({ name, span: v.max - v.min, count: v.count }))
      .sort((a, b) => b.span - a.span);
    return eligible[0] ?? null;
  });

  readonly oldestStreamable = computed(() => {
    const streamable = this.catalog.movies().filter((m) => m.isStreamable);
    if (streamable.length === 0) return null;
    return streamable.reduce((oldest, m) => m.year < oldest.year ? m : oldest);
  });

  readonly avgRating = computed(() => {
    const rated = this.catalog.movies().filter((m) => m.voteAverage > 0);
    if (rated.length === 0) return '—';
    return (rated.reduce((s, m) => s + m.voteAverage, 0) / rated.length).toFixed(1);
  });

  readonly yearRange = computed(() => {
    const movies = this.catalog.movies();
    if (movies.length === 0) return '—';
    const years = movies.map((m) => m.year);
    return `${Math.min(...years)}–${Math.max(...years)}`;
  });

  readonly decadeStats = computed(() => {
    const counts = new Map<number, number>();
    for (const m of this.catalog.movies()) {
      const decade = Math.floor(m.year / 10) * 10;
      counts.set(decade, (counts.get(decade) ?? 0) + 1);
    }
    const sorted = [...counts.entries()].sort((a, b) => a[0] - b[0]);
    const max = Math.max(...sorted.map(([, c]) => c), 1);
    return sorted.map(([decade, count]) => ({
      name: `${decade}s`,
      decade,
      count,
      pct: (count / max) * 100,
    }));
  });

  readonly genreStats = computed(() => this.computeStats(
    this.catalog.movies().flatMap((m) => m.genres)
  ));

  readonly directorStats = computed(() => {
    const counts = new Map<string, number>();
    for (const m of this.catalog.movies()) {
      for (const d of m.directors) counts.set(d, (counts.get(d) ?? 0) + 1);
    }
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
    const max = sorted[0]?.[1] ?? 1;
    return sorted.map(([name, count]) => ({ name, count, pct: (count / max) * 100 }));
  });

  readonly languageStats = computed(() => {
    const counts = new Map<string, number>();
    for (const m of this.catalog.movies()) {
      if (m.language) counts.set(m.language, (counts.get(m.language) ?? 0) + 1);
    }
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
    const max = sorted[0]?.[1] ?? 1;
    return sorted.map(([name, count]) => ({ name, count, pct: (count / max) * 100 }));
  });

  readonly uniqueLanguages = computed(() => {
    const langs = new Set<string>();
    for (const m of this.catalog.movies()) if (m.language) langs.add(m.language);
    return langs.size;
  });

  readonly nonEnglishPct = computed(() => {
    const withLang = this.catalog.movies().filter((m) => m.language);
    if (withLang.length === 0) return 0;
    const nonEn = withLang.filter((m) => m.language !== 'English').length;
    return Math.round((nonEn / withLang.length) * 100);
  });

  readonly ratingDistribution = computed(() => {
    const buckets = new Map<string, number>();
    const labels = ['9-10', '8-9', '7-8', '6-7', '5-6', '4-5', '0-4', 'Unrated'];
    for (const l of labels) buckets.set(l, 0);
    for (const m of this.catalog.movies()) {
      const r = m.voteAverage;
      if (r === 0) buckets.set('Unrated', (buckets.get('Unrated') ?? 0) + 1);
      else if (r >= 9) buckets.set('9-10', (buckets.get('9-10') ?? 0) + 1);
      else if (r >= 8) buckets.set('8-9', (buckets.get('8-9') ?? 0) + 1);
      else if (r >= 7) buckets.set('7-8', (buckets.get('7-8') ?? 0) + 1);
      else if (r >= 6) buckets.set('6-7', (buckets.get('6-7') ?? 0) + 1);
      else if (r >= 5) buckets.set('5-6', (buckets.get('5-6') ?? 0) + 1);
      else if (r >= 4) buckets.set('4-5', (buckets.get('4-5') ?? 0) + 1);
      else buckets.set('0-4', (buckets.get('0-4') ?? 0) + 1);
    }
    const max = Math.max(...buckets.values(), 1);
    return labels.map((name) => ({
      name,
      count: buckets.get(name) ?? 0,
      pct: ((buckets.get(name) ?? 0) / max) * 100,
    })).filter((r) => r.count > 0);
  });

  readonly silentFilmCount = computed(() =>
    this.catalog.movies().filter((m) => m.year < 1930).length
  );

  readonly filmNoirCount = computed(() =>
    this.catalog.movies().filter((m) =>
      m.genres.some((g) => g.toLowerCase().includes('noir'))
    ).length
  );

  readonly peakDecade = computed(() => {
    const counts = new Map<number, number>();
    for (const m of this.catalog.movies()) {
      const d = Math.floor(m.year / 10) * 10;
      counts.set(d, (counts.get(d) ?? 0) + 1);
    }
    let best = 0;
    let bestDecade = 1950;
    for (const [decade, count] of counts) {
      if (count > best) { best = count; bestDecade = decade; }
    }
    return `${bestDecade}s`;
  });

  readonly avgYear = computed(() => {
    const movies = this.catalog.movies();
    if (movies.length === 0) return 0;
    return Math.round(movies.reduce((s, m) => s + m.year, 0) / movies.length);
  });

  readonly medianYear = computed(() => {
    const movies = this.catalog.movies();
    if (movies.length === 0) return 0;
    const years = movies.map((m) => m.year).sort((a, b) => a - b);
    const mid = Math.floor(years.length / 2);
    return years.length % 2 === 0 ? Math.round((years[mid - 1] + years[mid]) / 2) : years[mid];
  });

  readonly yearSpan = computed(() => {
    const movies = this.catalog.movies();
    if (movies.length === 0) return '';
    const years = movies.map((m) => m.year);
    return `${Math.min(...years)}–${Math.max(...years)}`;
  });

  readonly filmsWithPosters = computed(() => {
    const movies = this.catalog.movies();
    if (movies.length === 0) return 0;
    return Math.round((movies.filter((m) => m.posterUrl).length / movies.length) * 100);
  });

  readonly multiGenreCount = computed(() =>
    this.catalog.movies().filter((m) => m.genres.length >= 3).length
  );

  readonly highRatedPct = computed(() => {
    const rated = this.catalog.movies().filter((m) => m.voteAverage > 0);
    if (rated.length === 0) return 0;
    const high = rated.filter((m) => m.voteAverage >= 7.0).length;
    return Math.round((high / rated.length) * 100);
  });

  readonly medianRating = computed(() => {
    const rated = this.catalog.movies()
      .filter((m) => m.voteAverage > 0)
      .map((m) => m.voteAverage)
      .sort((a, b) => a - b);
    if (rated.length === 0) return null;
    const mid = Math.floor(rated.length / 2);
    const median = rated.length % 2 === 0
      ? (rated[mid - 1] + rated[mid]) / 2
      : rated[mid];
    return median.toFixed(1);
  });

  readonly avgFilmsPerDirector = computed(() => {
    const dirs = this.uniqueDirectors();
    const total = this.totalFilms();
    if (dirs === 0) return null;
    return (total / dirs).toFixed(1);
  });

  readonly longestTitle = computed(() => {
    const movies = this.catalog.movies();
    if (movies.length === 0) return null;
    return movies.reduce((longest, m) => m.title.length > longest.title.length ? m : longest);
  });

  readonly shortestTitle = computed(() => {
    const movies = this.catalog.movies();
    if (movies.length === 0) return null;
    return movies.reduce((shortest, m) => m.title.length < shortest.title.length ? m : shortest);
  });

  readonly mostVersatileDirector = computed(() => {
    const dirGenres = new Map<string, { genres: Set<string>; count: number }>();
    for (const m of this.catalog.movies()) {
      for (const d of m.directors) {
        const entry = dirGenres.get(d) ?? { genres: new Set(), count: 0 };
        for (const g of m.genres) entry.genres.add(g);
        entry.count++;
        dirGenres.set(d, entry);
      }
    }
    const eligible = [...dirGenres.entries()]
      .filter(([, v]) => v.count >= 5)
      .map(([name, v]) => ({ name, genreCount: v.genres.size, count: v.count }))
      .sort((a, b) => b.genreCount - a.genreCount);
    return eligible[0] ?? null;
  });

  readonly peakYear = computed(() => {
    const counts = new Map<number, number>();
    for (const m of this.catalog.movies()) {
      counts.set(m.year, (counts.get(m.year) ?? 0) + 1);
    }
    let best = 0;
    let bestYear = 0;
    for (const [year, count] of counts) {
      if (count > best) { best = count; bestYear = year; }
    }
    return bestYear;
  });

  readonly soloDirectorFilms = computed(() =>
    this.catalog.movies().filter((m) => m.directors.length === 1).length
  );

  readonly coDirectedCount = computed(() =>
    this.catalog.movies().filter((m) => m.directors.length > 1).length
  );

  readonly uniqueLanguageCount = computed(() => {
    const langs = new Set(this.catalog.movies().filter((m) => m.language).map((m) => m.language));
    return langs.size;
  });

  readonly unratedFilmCount = computed(() =>
    this.catalog.movies().filter((m) => m.voteAverage === 0).length
  );

  readonly oneFilmDirectorCount = computed(() => {
    const counts = new Map<string, number>();
    for (const m of this.catalog.movies()) {
      for (const d of m.directors) counts.set(d, (counts.get(d) ?? 0) + 1);
    }
    return [...counts.values()].filter((c) => c === 1).length;
  });

  readonly newestStreamable = computed(() => {
    const movies = this.catalog.movies().filter((m) => m.isStreamable);
    if (movies.length === 0) return null;
    return movies.reduce((newest, m) => m.year > newest.year ? m : newest);
  });

  readonly multiDirectorPct = computed(() => {
    const movies = this.catalog.movies();
    if (movies.length === 0) return null;
    const multi = movies.filter((m) => m.directors.length > 1).length;
    const pct = Math.round((multi / movies.length) * 100);
    if (pct === 0) return null;
    return pct;
  });

  readonly avgGenresPerDirector = computed(() => {
    const dirGenres = new Map<string, Set<string>>();
    for (const m of this.catalog.movies()) {
      for (const d of m.directors) {
        const set = dirGenres.get(d) ?? new Set();
        for (const g of m.genres) set.add(g);
        dirGenres.set(d, set);
      }
    }
    const eligible = [...dirGenres.values()].filter((s) => s.size > 0);
    if (eligible.length < 10) return null;
    const avg = eligible.reduce((s, v) => s + v.size, 0) / eligible.length;
    return avg >= 1.1 ? avg.toFixed(1) : null;
  });

  readonly avgDirectorCareer = computed(() => {
    const dirYears = new Map<string, { min: number; max: number }>();
    for (const m of this.catalog.movies()) {
      for (const d of m.directors) {
        const entry = dirYears.get(d) ?? { min: m.year, max: m.year };
        if (m.year < entry.min) entry.min = m.year;
        if (m.year > entry.max) entry.max = m.year;
        dirYears.set(d, entry);
      }
    }
    const spans = [...dirYears.values()]
      .filter((v) => v.max - v.min > 0)
      .map((v) => v.max - v.min);
    if (spans.length < 10) return null;
    return Math.round(spans.reduce((s, v) => s + v, 0) / spans.length);
  });

  readonly topStreamableDecade = computed(() => {
    const counts = new Map<number, number>();
    for (const m of this.catalog.movies()) {
      if (m.isStreamable) {
        const d = Math.floor(m.year / 10) * 10;
        counts.set(d, (counts.get(d) ?? 0) + 1);
      }
    }
    const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    return best ? { decade: best[0], count: best[1] } : null;
  });

  readonly avgFilmAge = computed(() => {
    const movies = this.catalog.movies();
    if (movies.length === 0) return 0;
    const now = new Date().getFullYear();
    return Math.round(movies.reduce((s, m) => s + (now - m.year), 0) / movies.length);
  });

  readonly medianFilmAge = computed(() => {
    const movies = this.catalog.movies();
    if (movies.length === 0) return 0;
    const now = new Date().getFullYear();
    const ages = movies.map((m) => now - m.year).sort((a, b) => a - b);
    const mid = Math.floor(ages.length / 2);
    return ages.length % 2 === 0 ? Math.round((ages[mid - 1] + ages[mid]) / 2) : ages[mid];
  });

  readonly streamableAvgRating = computed(() => {
    const streamable = this.catalog.movies().filter((m) => m.isStreamable && m.voteAverage > 0);
    if (streamable.length < 10) return null;
    return (streamable.reduce((s, m) => s + m.voteAverage, 0) / streamable.length).toFixed(1);
  });

  readonly silentEraStreamablePct = computed(() => {
    const silent = this.catalog.movies().filter((m) => m.year < 1930);
    if (silent.length < 5) return null;
    const pct = Math.round((silent.filter((m) => m.isStreamable).length / silent.length) * 100);
    return pct > 0 ? pct : null;
  });

  readonly avgGenresPerFilm = computed(() => {
    const movies = this.catalog.movies();
    if (movies.length === 0) return null;
    const total = movies.reduce((s, m) => s + m.genres.length, 0);
    const avg = total / movies.length;
    if (avg < 1.1) return null;
    return avg.toFixed(1);
  });

  readonly genrePairs = computed(() => {
    const pairCounts = new Map<string, number>();
    for (const m of this.catalog.movies()) {
      const sorted = [...m.genres].sort();
      for (let i = 0; i < sorted.length; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
          const key = `${sorted[i]} + ${sorted[j]}`;
          pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1);
        }
      }
    }
    const sorted = [...pairCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    const max = sorted[0]?.[1] ?? 1;
    return sorted.map(([name, count]) => ({ name, count, pct: (count / max) * 100 }));
  });

  readonly coDirectedPct = computed(() => {
    const movies = this.catalog.movies();
    if (movies.length === 0) return null;
    const count = movies.filter((m) => m.directors.length > 1).length;
    const pct = Math.round((count / movies.length) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });

  readonly multiLanguageDirectorCount = computed(() => {
    const movies = this.catalog.movies();
    if (movies.length === 0) return null;
    const directorLangs = new Map<string, Set<string>>();
    for (const m of movies) {
      if (!m.language) continue;
      for (const d of m.directors) {
        if (!directorLangs.has(d)) directorLangs.set(d, new Set());
        directorLangs.get(d)!.add(m.language);
      }
    }
    const count = [...directorLangs.values()].filter((langs) => langs.size >= 2).length;
    return count > 0 ? count : null;
  });

  readonly avgTitleLength = computed(() => {
    const movies = this.catalog.movies();
    if (movies.length === 0) return 0;
    return Math.round(movies.reduce((s, m) => s + m.title.length, 0) / movies.length);
  });

  ngOnInit(): void {
    this.catalog.load();
  }

  private computeStats(items: string[]): { name: string; count: number; pct: number }[] {
    const counts = new Map<string, number>();
    for (const item of items) {
      counts.set(item, (counts.get(item) ?? 0) + 1);
    }
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
    const max = sorted[0]?.[1] ?? 1;
    return sorted.map(([name, count]) => ({ name, count, pct: (count / max) * 100 }));
  }
}
