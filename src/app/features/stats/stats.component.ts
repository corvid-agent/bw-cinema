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
            @if (avgTitleLengthByDecade().length > 0) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ avgTitleLengthByDecade()[0].decade }}s</span>
                <span class="stats__fact-text">longest titles (avg {{ avgTitleLengthByDecade()[0].avg }} chars)</span>
              </div>
            }
            @if (multiLanguageDirectorCount(); as mldc) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ mldc }}</span>
                <span class="stats__fact-text">multilingual directors</span>
              </div>
            }
            @if (preWarPct(); as pwp) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ pwp }}%</span>
                <span class="stats__fact-text">films from before 1940</span>
              </div>
            }
            @if (topGenreByRating(); as tgbr) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">&#9733; {{ tgbr.rating }}</span>
                <span class="stats__fact-text">{{ tgbr.genre }} (highest rated genre)</span>
              </div>
            }
            @if (singleDirectorPct(); as sdp) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ sdp }}%</span>
                <span class="stats__fact-text">solo-directed films</span>
              </div>
            }
            @if (avgDirectorsPerFilm(); as adpf) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ adpf }}</span>
                <span class="stats__fact-text">avg directors per film</span>
              </div>
            }
            @if (multiGenreFilmPct(); as mgfp) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ mgfp }}%</span>
                <span class="stats__fact-text">films with 2+ genres</span>
              </div>
            }
            @if (imdbLinkedPct(); as ilp) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ ilp }}%</span>
                <span class="stats__fact-text">linked to IMDb</span>
              </div>
            }
            @if (highlyRatedCount() > 0) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ highlyRatedCount() }}</span>
                <span class="stats__fact-text">films rated 8.0+</span>
              </div>
            }
            @if (ytStreamablePct(); as ysp) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ ysp }}%</span>
                <span class="stats__fact-text">YouTube sourced</span>
              </div>
            }
            @if (topGenre(); as tg) {
              <div class="stats__fact-card">
                <span class="stats__fact-number" style="font-size: 0.85em">{{ tg.name }}</span>
                <span class="stats__fact-text">top genre ({{ tg.count }} films)</span>
              </div>
            }
            @if (topDecadeByStreamable(); as tdbs) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ tdbs.decade }}s</span>
                <span class="stats__fact-text">most streamable ({{ tdbs.count }})</span>
              </div>
            }
            @if (mostCommonTitleWord(); as mctw) {
              <div class="stats__fact-card">
                <span class="stats__fact-number" style="font-size: 0.85em">"{{ mctw.word }}"</span>
                <span class="stats__fact-text">most common title word ({{ mctw.count }}x)</span>
              </div>
            }
            @if (nonStreamableWithImdbCount(); as nsic) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ nsic }}</span>
                <span class="stats__fact-text">non-free with IMDb link</span>
              </div>
            }
            @if (bestRatedDecade(); as brd) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ brd.decade }}s</span>
                <span class="stats__fact-text">best rated decade (avg &#9733; {{ brd.avg }})</span>
              </div>
            }
            @if (decadeWithMostDirectors(); as dwmd) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ dwmd.decade }}s</span>
                <span class="stats__fact-text">most directors ({{ dwmd.count }})</span>
              </div>
            }
            @if (avgDirectorFilmCount(); as adfc) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ adfc }}</span>
                <span class="stats__fact-text">avg films per director</span>
              </div>
            }
            @if (catalogMedianRating(); as cmr) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ cmr }}</span>
                <span class="stats__fact-text">median rating</span>
              </div>
            }
            @if (longestDirectorCareer(); as ldc) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ ldc.span }} yr</span>
                <span class="stats__fact-text">longest career ({{ ldc.name }})</span>
              </div>
            }
            @if (mostCommonLanguage(); as mcl) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ mcl.count }}</span>
                <span class="stats__fact-text">{{ mcl.name }} films (top non-English)</span>
              </div>
            }
            @if (filmsWithPosterPct(); as fwpp) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ fwpp }}%</span>
                <span class="stats__fact-text">have poster images</span>
              </div>
            }
            @if (decadeWithMostStreamable(); as dwms) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ dwms.decade }}s</span>
                <span class="stats__fact-text">most streamable ({{ dwms.count }})</span>
              </div>
            }
            @if (preWarStreamableCount(); as pwsc) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ pwsc }}</span>
                <span class="stats__fact-text">pre-1940 films streamable</span>
              </div>
            }
            @if (avgFilmsPerDecade(); as afpd) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ afpd }}</span>
                <span class="stats__fact-text">avg films per decade</span>
              </div>
            }
            @if (iaVsYtRatio(); as iyr) {
              <div class="stats__fact-card">
                <span class="stats__fact-number">{{ iyr }}</span>
                <span class="stats__fact-text">Internet Archive : YouTube ratio</span>
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
      transform-origin: left;
      animation: bar-grow 0.6s ease both;
    }
    @keyframes bar-grow { from { transform: scaleX(0); } }
    @media (prefers-reduced-motion: reduce) {
      .stats__bar-fill, .stats__avail-fill { animation: none; }
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
      transform-origin: left;
      animation: bar-grow 0.6s ease both;
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

  // ── Single-pass catalog index ──────────────────────────────────────
  private readonly idx = computed(() => {
    const movies = this.catalog.movies();
    const now = new Date().getFullYear();
    const stopWords = new Set(['the', 'of', 'a', 'and', 'in', 'to', 'is', 'it', 'for', 'on', 'at', 'an', 'or', 'de', 'la', 'le', 'el', 'das', 'der', 'die', 'les', 'des', 'du', 'un', 'une']);

    let total = 0, streamable = 0, iaCount = 0, ytOnlyCount = 0, ytAnyCount = 0;
    let withPoster = 0, withImdb = 0, unrated = 0;
    let silentCount = 0, silentStreamable = 0;
    let preWarCount = 0, preWarStreamable = 0;
    let multiGenre3 = 0, multiGenre2 = 0;
    let soloDir = 0, coDirected = 0;
    let highlyRated8 = 0, highRated7 = 0, filmNoir = 0;
    let totalDirsPerFilm = 0, totalGenresPerFilm = 0;
    let totalTitleLen = 0, totalYearSum = 0;
    let ratingSum = 0, ratedCount = 0;
    let streamRatingSum = 0, streamRatedCount = 0;
    let nonStreamableImdb = 0;

    const ratings: number[] = [];
    const years: number[] = [];
    type Film = typeof movies[0];
    let oldest: Film | null = null, newest: Film | null = null;
    let oldestStream: Film | null = null, newestStream: Film | null = null;
    let bestRated: Film | null = null;
    let longTitle: Film | null = null, shortTitle: Film | null = null;

    const yearCounts = new Map<number, number>();
    const decCounts = new Map<number, number>();
    const decStream = new Map<number, number>();
    const decRating = new Map<number, { total: number; count: number }>();
    const decDirs = new Map<number, Set<string>>();
    const decTitleLen = new Map<number, { total: number; count: number }>();
    const genreCounts = new Map<string, number>();
    const genreRatings = new Map<string, number[]>();
    const genrePairCounts = new Map<string, number>();
    const dirCounts = new Map<string, number>();
    const dirRating = new Map<string, { total: number; count: number }>();
    const dirYears = new Map<string, { min: number; max: number; count: number }>();
    const dirGenres = new Map<string, Set<string>>();
    const dirLangs = new Map<string, Set<string>>();
    const langCounts = new Map<string, number>();
    const nonEnLangCounts = new Map<string, number>();
    const titleWords = new Map<string, number>();
    const ratingBuckets = new Map<string, number>();
    for (const l of ['9-10', '8-9', '7-8', '6-7', '5-6', '4-5', '0-4', 'Unrated']) ratingBuckets.set(l, 0);

    for (const m of movies) {
      total++;
      const decade = Math.floor(m.year / 10) * 10;

      if (m.isStreamable) streamable++;
      if (m.internetArchiveId) iaCount++;
      if (m.youtubeId) ytAnyCount++;
      if (m.youtubeId && !m.internetArchiveId) ytOnlyCount++;
      if (m.posterUrl) withPoster++;
      if (m.imdbId) withImdb++;
      if (!m.isStreamable && m.imdbId) nonStreamableImdb++;
      if (m.year < 1930) { silentCount++; if (m.isStreamable) silentStreamable++; }
      if (m.year < 1940) { preWarCount++; if (m.isStreamable) preWarStreamable++; }
      if (m.genres.length >= 3) multiGenre3++;
      if (m.genres.length >= 2) multiGenre2++;
      if (m.directors.length === 1) soloDir++;
      if (m.directors.length > 1) coDirected++;
      if (m.voteAverage >= 8.0) highlyRated8++;
      if (m.genres.some((g) => g.toLowerCase().includes('noir'))) filmNoir++;

      totalDirsPerFilm += m.directors.length;
      totalGenresPerFilm += m.genres.length;
      totalTitleLen += m.title.length;
      totalYearSum += m.year;
      years.push(m.year);

      // Rating
      const r = m.voteAverage;
      if (r > 0) {
        ratedCount++; ratingSum += r; ratings.push(r);
        if (r >= 7.0) highRated7++;
        if (m.isStreamable) { streamRatedCount++; streamRatingSum += r; }
        // Bucket
        if (r >= 9) ratingBuckets.set('9-10', ratingBuckets.get('9-10')! + 1);
        else if (r >= 8) ratingBuckets.set('8-9', ratingBuckets.get('8-9')! + 1);
        else if (r >= 7) ratingBuckets.set('7-8', ratingBuckets.get('7-8')! + 1);
        else if (r >= 6) ratingBuckets.set('6-7', ratingBuckets.get('6-7')! + 1);
        else if (r >= 5) ratingBuckets.set('5-6', ratingBuckets.get('5-6')! + 1);
        else if (r >= 4) ratingBuckets.set('4-5', ratingBuckets.get('4-5')! + 1);
        else ratingBuckets.set('0-4', ratingBuckets.get('0-4')! + 1);
      } else {
        unrated++;
        ratingBuckets.set('Unrated', ratingBuckets.get('Unrated')! + 1);
      }

      // Extremes
      if (!oldest || m.year < oldest.year) oldest = m;
      if (!newest || m.year > newest.year) newest = m;
      if (m.isStreamable) {
        if (!oldestStream || m.year < oldestStream.year) oldestStream = m;
        if (!newestStream || m.year > newestStream.year) newestStream = m;
      }
      if (r > 0 && (!bestRated || r > bestRated.voteAverage)) bestRated = m;
      if (!longTitle || m.title.length > longTitle.title.length) longTitle = m;
      if (!shortTitle || m.title.length < shortTitle.title.length) shortTitle = m;

      // Year / Decade maps
      yearCounts.set(m.year, (yearCounts.get(m.year) ?? 0) + 1);
      decCounts.set(decade, (decCounts.get(decade) ?? 0) + 1);
      if (m.isStreamable) decStream.set(decade, (decStream.get(decade) ?? 0) + 1);
      if (r > 0) {
        const dr = decRating.get(decade) ?? { total: 0, count: 0 };
        dr.total += r; dr.count++;
        decRating.set(decade, dr);
      }
      if (!decDirs.has(decade)) decDirs.set(decade, new Set());
      for (const d of m.directors) decDirs.get(decade)!.add(d);
      const dtl = decTitleLen.get(decade) ?? { total: 0, count: 0 };
      dtl.total += m.title.length; dtl.count++;
      decTitleLen.set(decade, dtl);

      // Genres
      for (const g of m.genres) {
        genreCounts.set(g, (genreCounts.get(g) ?? 0) + 1);
        if (r > 0) {
          if (!genreRatings.has(g)) genreRatings.set(g, []);
          genreRatings.get(g)!.push(r);
        }
      }
      const sg = [...m.genres].sort();
      for (let i = 0; i < sg.length; i++) {
        for (let j = i + 1; j < sg.length; j++) {
          const key = `${sg[i]} + ${sg[j]}`;
          genrePairCounts.set(key, (genrePairCounts.get(key) ?? 0) + 1);
        }
      }

      // Directors
      for (const d of m.directors) {
        dirCounts.set(d, (dirCounts.get(d) ?? 0) + 1);
        if (r > 0) {
          const dr = dirRating.get(d) ?? { total: 0, count: 0 };
          dr.total += r; dr.count++;
          dirRating.set(d, dr);
        }
        const dy = dirYears.get(d) ?? { min: m.year, max: m.year, count: 0 };
        dy.min = Math.min(dy.min, m.year); dy.max = Math.max(dy.max, m.year); dy.count++;
        dirYears.set(d, dy);
        if (!dirGenres.has(d)) dirGenres.set(d, new Set());
        for (const g of m.genres) dirGenres.get(d)!.add(g);
        if (m.language) {
          if (!dirLangs.has(d)) dirLangs.set(d, new Set());
          dirLangs.get(d)!.add(m.language);
        }
      }

      // Language
      if (m.language) {
        langCounts.set(m.language, (langCounts.get(m.language) ?? 0) + 1);
        if (m.language !== 'English' && m.language !== 'en') {
          nonEnLangCounts.set(m.language, (nonEnLangCounts.get(m.language) ?? 0) + 1);
        }
      }

      // Title words
      const words = m.title.toLowerCase().split(/\s+/).filter((w) => w.length > 2 && !stopWords.has(w));
      for (const w of words) titleWords.set(w, (titleWords.get(w) ?? 0) + 1);
    }

    ratings.sort((a, b) => a - b);
    years.sort((a, b) => a - b);

    return {
      total, streamable, iaCount, ytOnlyCount, ytAnyCount,
      withPoster, withImdb, unrated, nonStreamableImdb,
      silentCount, silentStreamable,
      preWarCount, preWarStreamable,
      multiGenre3, multiGenre2, soloDir, coDirected,
      highlyRated8, highRated7, filmNoir,
      totalDirsPerFilm, totalGenresPerFilm,
      totalTitleLen, totalYearSum,
      ratingSum, ratedCount, streamRatingSum, streamRatedCount,
      ratings, years, now,
      oldest, newest, oldestStream, newestStream,
      bestRated, longTitle, shortTitle,
      yearCounts, decCounts, decStream, decRating, decDirs, decTitleLen,
      genreCounts, genreRatings, genrePairCounts,
      dirCounts, dirRating, dirYears, dirGenres, dirLangs,
      langCounts, nonEnLangCounts, titleWords, ratingBuckets,
    };
  });

  // ── Overview cards ─────────────────────────────────────────────────
  readonly totalFilms = computed(() => this.idx().total);
  readonly streamableFilms = computed(() => this.idx().streamable);
  readonly streamablePct = computed(() => {
    const i = this.idx();
    return i.total > 0 ? Math.round((i.streamable / i.total) * 100) : 0;
  });
  readonly iaFilms = computed(() => this.idx().iaCount);
  readonly ytFilms = computed(() => this.idx().ytOnlyCount);
  readonly iaFilmsPct = computed(() => { const i = this.idx(); return i.total > 0 ? (i.iaCount / i.total) * 100 : 0; });
  readonly ytFilmsPct = computed(() => { const i = this.idx(); return i.total > 0 ? (i.ytOnlyCount / i.total) * 100 : 0; });
  readonly notStreamablePct = computed(() => { const i = this.idx(); return i.total > 0 ? ((i.total - i.streamable) / i.total) * 100 : 0; });
  readonly uniqueDirectors = computed(() => this.idx().dirCounts.size);
  readonly avgRating = computed(() => {
    const i = this.idx();
    return i.ratedCount > 0 ? (i.ratingSum / i.ratedCount).toFixed(1) : '—';
  });
  readonly yearRange = computed(() => {
    const i = this.idx();
    if (i.years.length === 0) return '—';
    return `${i.years[0]}–${i.years[i.years.length - 1]}`;
  });

  // ── Film extremes ──────────────────────────────────────────────────
  readonly oldestFilm = computed(() => this.idx().oldest);
  readonly newestFilm = computed(() => this.idx().newest);
  readonly highestRatedFilm = computed(() => this.idx().bestRated);
  readonly oldestStreamable = computed(() => this.idx().oldestStream);
  readonly newestStreamable = computed(() => this.idx().newestStream);
  readonly longestTitle = computed(() => this.idx().longTitle);
  readonly shortestTitle = computed(() => this.idx().shortTitle);

  // ── Chart data ─────────────────────────────────────────────────────
  readonly decadeStats = computed(() => {
    const sorted = [...this.idx().decCounts.entries()].sort((a, b) => a[0] - b[0]);
    const max = Math.max(...sorted.map(([, c]) => c), 1);
    return sorted.map(([decade, count]) => ({ name: `${decade}s`, decade, count, pct: (count / max) * 100 }));
  });

  readonly genreStats = computed(() => {
    const sorted = [...this.idx().genreCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
    const max = sorted[0]?.[1] ?? 1;
    return sorted.map(([name, count]) => ({ name, count, pct: (count / max) * 100 }));
  });

  readonly directorStats = computed(() => {
    const sorted = [...this.idx().dirCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
    const max = sorted[0]?.[1] ?? 1;
    return sorted.map(([name, count]) => ({ name, count, pct: (count / max) * 100 }));
  });

  readonly languageStats = computed(() => {
    const sorted = [...this.idx().langCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
    const max = sorted[0]?.[1] ?? 1;
    return sorted.map(([name, count]) => ({ name, count, pct: (count / max) * 100 }));
  });

  readonly ratingDistribution = computed(() => {
    const buckets = this.idx().ratingBuckets;
    const labels = ['9-10', '8-9', '7-8', '6-7', '5-6', '4-5', '0-4', 'Unrated'];
    const max = Math.max(...buckets.values(), 1);
    return labels.map((name) => ({ name, count: buckets.get(name) ?? 0, pct: ((buckets.get(name) ?? 0) / max) * 100 })).filter((r) => r.count > 0);
  });

  readonly genrePairs = computed(() => {
    const sorted = [...this.idx().genrePairCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    const max = sorted[0]?.[1] ?? 1;
    return sorted.map(([name, count]) => ({ name, count, pct: (count / max) * 100 }));
  });

  // ── Language section ───────────────────────────────────────────────
  readonly uniqueLanguages = computed(() => this.idx().langCounts.size);
  readonly nonEnglishPct = computed(() => {
    const i = this.idx();
    const withLang = [...i.langCounts.values()].reduce((a, b) => a + b, 0);
    if (withLang === 0) return 0;
    const enCount = i.langCounts.get('English') ?? 0;
    return Math.round(((withLang - enCount) / withLang) * 100);
  });

  // ── Director highlights ────────────────────────────────────────────
  readonly mostFilmedDirector = computed(() => {
    const stats = this.directorStats();
    return stats.length > 0 ? stats[0] : null;
  });

  readonly highestRatedDirector = computed(() => {
    const eligible = [...this.idx().dirRating.entries()]
      .filter(([, v]) => v.count >= 5)
      .map(([name, v]) => ({ name, count: v.count, avgRating: (v.total / v.count).toFixed(1) }))
      .sort((a, b) => parseFloat(b.avgRating) - parseFloat(a.avgRating));
    return eligible[0] ?? null;
  });

  readonly longestCareer = computed(() => {
    const eligible = [...this.idx().dirYears.entries()]
      .filter(([, v]) => v.count >= 3)
      .map(([name, v]) => ({ name, span: v.max - v.min, count: v.count }))
      .sort((a, b) => b.span - a.span);
    return eligible[0] ?? null;
  });

  readonly mostVersatileDirector = computed(() => {
    const i = this.idx();
    const eligible = [...i.dirGenres.entries()]
      .filter(([name]) => (i.dirCounts.get(name) ?? 0) >= 5)
      .map(([name, genres]) => ({ name, genreCount: genres.size, count: i.dirCounts.get(name)! }))
      .sort((a, b) => b.genreCount - a.genreCount);
    return eligible[0] ?? null;
  });

  // ── Fun facts ──────────────────────────────────────────────────────
  readonly silentFilmCount = computed(() => this.idx().silentCount);
  readonly filmNoirCount = computed(() => this.idx().filmNoir);

  readonly peakDecade = computed(() => {
    let best = 0, bestDecade = 1950;
    for (const [decade, count] of this.idx().decCounts) {
      if (count > best) { best = count; bestDecade = decade; }
    }
    return `${bestDecade}s`;
  });

  readonly avgYear = computed(() => {
    const i = this.idx();
    return i.total > 0 ? Math.round(i.totalYearSum / i.total) : 0;
  });

  readonly medianYear = computed(() => {
    const y = this.idx().years;
    if (y.length === 0) return 0;
    const mid = Math.floor(y.length / 2);
    return y.length % 2 === 0 ? Math.round((y[mid - 1] + y[mid]) / 2) : y[mid];
  });

  readonly yearSpan = computed(() => {
    const y = this.idx().years;
    return y.length > 0 ? `${y[0]}–${y[y.length - 1]}` : '';
  });

  readonly filmsWithPosters = computed(() => {
    const i = this.idx();
    return i.total > 0 ? Math.round((i.withPoster / i.total) * 100) : 0;
  });

  readonly multiGenreCount = computed(() => this.idx().multiGenre3);

  readonly peakYear = computed(() => {
    let best = 0, bestYear = 0;
    for (const [year, count] of this.idx().yearCounts) {
      if (count > best) { best = count; bestYear = year; }
    }
    return bestYear;
  });

  readonly soloDirectorFilms = computed(() => this.idx().soloDir);
  readonly coDirectedCount = computed(() => this.idx().coDirected);
  readonly uniqueLanguageCount = computed(() => this.idx().langCounts.size);
  readonly unratedFilmCount = computed(() => this.idx().unrated);
  readonly highlyRatedCount = computed(() => this.idx().highlyRated8);

  readonly highRatedPct = computed(() => {
    const i = this.idx();
    return i.ratedCount > 0 ? Math.round((i.highRated7 / i.ratedCount) * 100) : 0;
  });

  readonly medianRating = computed(() => {
    const r = this.idx().ratings;
    if (r.length === 0) return null;
    const mid = Math.floor(r.length / 2);
    return (r.length % 2 === 0 ? (r[mid - 1] + r[mid]) / 2 : r[mid]).toFixed(1);
  });

  readonly avgFilmsPerDirector = computed(() => {
    const i = this.idx();
    const dirs = i.dirCounts.size;
    return dirs > 0 ? (i.total / dirs).toFixed(1) : null;
  });

  readonly oneFilmDirectorCount = computed(() =>
    [...this.idx().dirCounts.values()].filter((c) => c === 1).length
  );

  readonly multiDirectorPct = computed(() => {
    const i = this.idx();
    if (i.total === 0) return null;
    const pct = Math.round((i.coDirected / i.total) * 100);
    return pct > 0 ? pct : null;
  });

  readonly avgGenresPerFilm = computed(() => {
    const i = this.idx();
    if (i.total === 0) return null;
    const avg = i.totalGenresPerFilm / i.total;
    return avg >= 1.1 ? avg.toFixed(1) : null;
  });

  readonly avgGenresPerDirector = computed(() => {
    const eligible = [...this.idx().dirGenres.values()].filter((s) => s.size > 0);
    if (eligible.length < 10) return null;
    const avg = eligible.reduce((s, v) => s + v.size, 0) / eligible.length;
    return avg >= 1.1 ? avg.toFixed(1) : null;
  });

  readonly avgDirectorCareer = computed(() => {
    const spans = [...this.idx().dirYears.values()]
      .filter((v) => v.max - v.min > 0)
      .map((v) => v.max - v.min);
    if (spans.length < 10) return null;
    return Math.round(spans.reduce((s, v) => s + v, 0) / spans.length);
  });

  readonly topStreamableDecade = computed(() => {
    const best = [...this.idx().decStream.entries()].sort((a, b) => b[1] - a[1])[0];
    return best ? { decade: best[0], count: best[1] } : null;
  });

  readonly avgFilmAge = computed(() => {
    const i = this.idx();
    return i.total > 0 ? Math.round(i.years.reduce((s, y) => s + (i.now - y), 0) / i.total) : 0;
  });

  readonly medianFilmAge = computed(() => {
    const i = this.idx();
    if (i.years.length === 0) return 0;
    const mid = Math.floor(i.years.length / 2);
    const medianYear = i.years.length % 2 === 0 ? (i.years[mid - 1] + i.years[mid]) / 2 : i.years[mid];
    return Math.round(i.now - medianYear);
  });

  readonly streamableAvgRating = computed(() => {
    const i = this.idx();
    return i.streamRatedCount >= 10 ? (i.streamRatingSum / i.streamRatedCount).toFixed(1) : null;
  });

  readonly silentEraStreamablePct = computed(() => {
    const i = this.idx();
    if (i.silentCount < 5) return null;
    const pct = Math.round((i.silentStreamable / i.silentCount) * 100);
    return pct > 0 ? pct : null;
  });

  readonly coDirectedPct = computed(() => {
    const i = this.idx();
    if (i.total === 0) return null;
    const pct = Math.round((i.coDirected / i.total) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });

  readonly avgTitleLength = computed(() => {
    const i = this.idx();
    return i.total > 0 ? Math.round(i.totalTitleLen / i.total) : 0;
  });

  readonly avgTitleLengthByDecade = computed(() => {
    return [...this.idx().decTitleLen.entries()]
      .filter(([, v]) => v.count >= 10)
      .map(([decade, v]) => ({ decade, avg: Math.round(v.total / v.count) }))
      .sort((a, b) => b.avg - a.avg);
  });

  readonly multiLanguageDirectorCount = computed(() => {
    const i = this.idx();
    if (i.total === 0) return null;
    const count = [...i.dirLangs.values()].filter((langs) => langs.size >= 2).length;
    return count > 0 ? count : null;
  });

  readonly preWarPct = computed(() => {
    const i = this.idx();
    if (i.total < 10) return null;
    const pct = Math.round((i.preWarCount / i.total) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });

  readonly topGenreByRating = computed(() => {
    const gr = this.idx().genreRatings;
    const avgs = [...gr.entries()]
      .filter(([, r]) => r.length >= 20)
      .map(([genre, r]) => ({ genre, rating: (r.reduce((a, b) => a + b, 0) / r.length).toFixed(1) }));
    if (avgs.length < 2) return null;
    avgs.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    return avgs[0];
  });

  readonly singleDirectorPct = computed(() => {
    const i = this.idx();
    if (i.total < 10) return null;
    const pct = Math.round((i.soloDir / i.total) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });

  readonly avgDirectorsPerFilm = computed(() => {
    const i = this.idx();
    if (i.total === 0) return null;
    const avg = i.totalDirsPerFilm / i.total;
    return avg > 1.01 ? avg.toFixed(2) : null;
  });

  readonly multiGenreFilmPct = computed(() => {
    const i = this.idx();
    if (i.total < 50) return null;
    const pct = Math.round((i.multiGenre2 / i.total) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });

  readonly imdbLinkedPct = computed(() => {
    const i = this.idx();
    if (i.total < 10) return null;
    const pct = Math.round((i.withImdb / i.total) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });

  readonly topGenre = computed(() => {
    const best = [...this.idx().genreCounts.entries()].sort((a, b) => b[1] - a[1])[0];
    return best ? { name: best[0], count: best[1] } : null;
  });

  readonly topDecadeByStreamable = computed(() => {
    const ds = this.idx().decStream;
    if (ds.size < 2) return null;
    const top = [...ds.entries()].sort((a, b) => b[1] - a[1])[0];
    return top ? { decade: top[0], count: top[1] } : null;
  });

  readonly mostCommonTitleWord = computed(() => {
    const top = [...this.idx().titleWords.entries()].sort((a, b) => b[1] - a[1])[0];
    return top && top[1] >= 10 ? { word: top[0], count: top[1] } : null;
  });

  readonly nonStreamableWithImdbCount = computed(() => {
    const c = this.idx().nonStreamableImdb;
    return c >= 10 ? c : null;
  });

  readonly bestRatedDecade = computed(() => {
    const best = [...this.idx().decRating.entries()]
      .filter(([, v]) => v.count >= 20)
      .map(([decade, v]) => ({ decade, avg: (v.total / v.count).toFixed(1) }))
      .sort((a, b) => parseFloat(b.avg) - parseFloat(a.avg));
    return best[0] ?? null;
  });

  readonly decadeWithMostDirectors = computed(() => {
    const best = [...this.idx().decDirs.entries()]
      .filter(([, dirs]) => dirs.size >= 10)
      .sort((a, b) => b[1].size - a[1].size)[0];
    return best ? { decade: best[0], count: best[1].size } : null;
  });

  readonly avgDirectorFilmCount = computed(() => {
    const dc = this.idx().dirCounts;
    if (dc.size < 5) return null;
    const avg = [...dc.values()].reduce((s, c) => s + c, 0) / dc.size;
    return avg >= 1.1 ? avg.toFixed(1) : null;
  });

  readonly catalogMedianRating = computed(() => {
    const r = this.idx().ratings;
    if (r.length < 10) return null;
    const mid = Math.floor(r.length / 2);
    return (r.length % 2 === 0 ? (r[mid - 1] + r[mid]) / 2 : r[mid]).toFixed(1);
  });

  readonly longestDirectorCareer = computed(() => {
    const i = this.idx();
    if (i.total < 50) return null;
    let best: { name: string; span: number } | null = null;
    for (const [name, { min, max }] of i.dirYears) {
      const span = max - min;
      if (span >= 10 && (!best || span > best.span)) best = { name, span };
    }
    return best;
  });

  readonly mostCommonLanguage = computed(() => {
    const top = [...this.idx().nonEnLangCounts.entries()].sort((a, b) => b[1] - a[1])[0];
    return top && top[1] >= 5 ? { name: top[0], count: top[1] } : null;
  });

  readonly filmsWithPosterPct = computed(() => {
    const i = this.idx();
    if (i.total < 50) return null;
    const pct = Math.round((i.withPoster / i.total) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });

  readonly decadeWithMostStreamable = computed(() => {
    const i = this.idx();
    if (i.total < 50) return null;
    const top = [...i.decStream.entries()].sort((a, b) => b[1] - a[1])[0];
    return top ? { decade: top[0], count: top[1] } : null;
  });

  readonly preWarStreamableCount = computed(() => {
    const i = this.idx();
    return i.total >= 50 && i.preWarStreamable > 0 ? i.preWarStreamable : null;
  });

  readonly avgFilmsPerDecade = computed(() => {
    const i = this.idx();
    if (i.total < 50 || i.decCounts.size < 3) return null;
    const avg = Math.round(i.total / i.decCounts.size);
    return avg > 0 ? avg : null;
  });

  readonly iaVsYtRatio = computed(() => {
    const i = this.idx();
    if (i.total < 50 || i.iaCount === 0 || i.ytAnyCount === 0) return null;
    return `${(i.iaCount / i.ytAnyCount).toFixed(1)}:1`;
  });

  readonly ytStreamablePct = computed(() => {
    const i = this.idx();
    if (i.streamable < 10) return null;
    const pct = Math.round((i.ytOnlyCount / i.streamable) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });

  ngOnInit(): void {
    this.catalog.load();
  }
}
