import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { CollectionService } from '../../core/services/collection.service';
import { NotificationService } from '../../core/services/notification.service';
import { RecentlyViewedService } from '../../core/services/recently-viewed.service';
import { MovieGridComponent } from '../../shared/components/movie-grid.component';
import { SearchBarComponent } from '../../shared/components/search-bar.component';
import { SkeletonGridComponent } from '../../shared/components/skeleton-grid.component';
import { KeyboardNavDirective } from '../../shared/directives/keyboard-nav.directive';
import { ScrollRowComponent } from '../../shared/components/scroll-row.component';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MovieGridComponent, SearchBarComponent, SkeletonGridComponent, KeyboardNavDirective, RouterLink, ScrollRowComponent, RevealDirective],
  template: `
    <section class="hero">
      <div class="hero__bg"></div>
      <div class="hero__content container">
        <p class="hero__eyebrow">Discover &amp; Stream</p>
        <h1 class="hero__title">Classic Black &amp; White Cinema</h1>
        <p class="hero__subtitle">
          Over {{ filmCount() }} timeless masterpieces from the golden age of film.
          Browse, track, and watch for free.
        </p>
        <div class="hero__search">
          <app-search-bar (searched)="onSearch($event)" />
        </div>
        <button class="hero__surprise btn-secondary" (click)="surpriseMe()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="7.5 4.21 12 6.81 16.5 4.21"/><polyline points="7.5 19.79 7.5 14.6 3 12"/><polyline points="21 12 16.5 14.6 16.5 19.79"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          Surprise Me
        </button>
        <div class="hero__stats">
          <div class="hero__stat">
            <span class="hero__stat-value">{{ filmCount() }}</span>
            <span class="hero__stat-label">Films</span>
          </div>
          <div class="hero__stat">
            <span class="hero__stat-value">{{ streamableCount() }}</span>
            <span class="hero__stat-label">Free to Watch</span>
          </div>
          <div class="hero__stat">
            <span class="hero__stat-value">{{ decadeSpan() }}</span>
            <span class="hero__stat-label">Decades</span>
          </div>
          <div class="hero__stat">
            <span class="hero__stat-value">{{ languageCount() }}</span>
            <span class="hero__stat-label">Languages</span>
          </div>
          <div class="hero__stat">
            <span class="hero__stat-value">{{ directorCount() }}</span>
            <span class="hero__stat-label">Directors</span>
          </div>
          <div class="hero__stat">
            <span class="hero__stat-value">{{ genreCount() }}</span>
            <span class="hero__stat-label">Genres</span>
          </div>
        </div>
        @if (avgCatalogRating(); as acr) {
          <p class="hero__avg-rating">Average rating: &#9733; {{ acr }}</p>
        }
        @if (catalogLanguageCount(); as clc) {
          <p class="hero__avg-rating">{{ clc }} languages &middot; {{ catalogDirectorCount() }} directors</p>
        }
        @if (totalWatchedCount() > 0) {
          <p class="hero__avg-rating">You've watched {{ totalWatchedCount() }} film{{ totalWatchedCount() !== 1 ? 's' : '' }}@if (watchlistSize() > 0) { &middot; {{ watchlistSize() }} in watchlist}@if (favoritesCount() > 0) { &middot; {{ favoritesCount() }} favorite{{ favoritesCount() !== 1 ? 's' : '' }}}</p>
        }
        @if (oldestFilmYear(); as ofy) {
          <p class="hero__avg-rating">{{ ofy }}–{{ newestFilmYear() }} &middot; {{ topDecadeName() }} peak</p>
        }
        <button class="hero__more-toggle" (click)="showMoreHero.set(!showMoreHero())">
          {{ showMoreHero() ? 'Less' : 'More stats' }}
        </button>
        @if (showMoreHero()) {
          @if (silentEraCount() > 0) {
            <p class="hero__avg-rating">{{ silentEraCount() }} silent-era films (pre-1930)</p>
          }
          @if (highlyRatedCount() > 0) {
            <p class="hero__avg-rating">{{ highlyRatedCount() }} films rated 7.0+ &middot; {{ streamableHighRatedCount() }} free</p>
          }
          @if (nonEnglishCount() > 0) {
            <p class="hero__avg-rating">{{ nonEnglishCount() }} non-English films@if (topNonEnglishLang(); as lang) { &middot; top: {{ lang.name }} ({{ lang.count }})}</p>
          }
          @if (catalogYtStreamablePct(); as cysp) {
            <p class="hero__avg-rating">{{ cysp }}% on YouTube &middot; {{ catalogIaStreamablePct() }}% on Internet Archive</p>
          }
          @if (catalogCoDirectedPct(); as ccdp) {
            <p class="hero__avg-rating">{{ ccdp }}% co-directed &middot; {{ catalogImdbLinkedPct() }}% IMDb-linked &middot; {{ catalogPosterCoveragePct() }}% have posters</p>
          }
          @if (avgFilmAge() > 0) {
            <p class="hero__avg-rating">Avg age {{ avgFilmAge() }}yr &middot; median year {{ medianYear() }}</p>
          }
        }
      </div>
    </section>

    @if (catalog.error(); as err) {
      <section class="section container">
        <div class="home__error" role="alert">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p>{{ err }}</p>
          <button class="home__error-retry" (click)="catalog.retry()">Try Again</button>
        </div>
      </section>
    } @else if (catalog.loading()) {
      <section class="section container">
        <h2>Featured Films</h2>
        <app-skeleton-grid />
      </section>
    } @else {
      @if (catalog.filmOfTheDay(); as fotd) {
        <section class="section container fotd" aria-label="Film of the day">
          <h2 class="fotd__heading">Film of the Day</h2>
          <a class="fotd__card" [routerLink]="['/movie', fotd.id]">
            @if (fotd.posterUrl) {
              <img class="fotd__poster" [src]="fotd.posterUrl" [alt]="fotd.title + ' poster'" />
            } @else {
              <div class="fotd__poster-placeholder">
                <span>{{ fotd.title }}</span>
              </div>
            }
            <div class="fotd__info">
              <h3 class="fotd__title">{{ fotd.title }}</h3>
              <p class="fotd__meta">{{ fotd.year }} &middot; {{ fotd.directors.join(', ') }}</p>
              @if (fotd.genres.length > 0) {
                <div class="fotd__genres">
                  @for (g of fotd.genres.slice(0, 3); track g) {
                    <span class="fotd__genre">{{ g }}</span>
                  }
                </div>
              }
              <div class="fotd__bottom">
                @if (fotd.voteAverage > 0) {
                  <span class="fotd__rating">&#9733; {{ fotd.voteAverage.toFixed(1) }}</span>
                }
                @if (fotd.isStreamable) {
                  <span class="fotd__free-badge">Free to Watch</span>
                }
              </div>
              <span class="fotd__cta">View Details &rarr;</span>
            </div>
            <button class="fotd__watchlist-btn"
              [attr.aria-label]="collectionService.isInWatchlist(fotd.id) ? 'In watchlist' : 'Add ' + fotd.title + ' to watchlist'"
              (click)="toggleFotdWatchlist($event, fotd)">
              @if (collectionService.isWatched(fotd.id)) {
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              } @else if (collectionService.isInWatchlist(fotd.id)) {
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              } @else {
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              }
            </button>
          </a>
        </section>
      }

      <section class="section container" aria-label="Featured films">
        <div class="section__header">
          <h2>Featured Films</h2>
          <a class="section__link" routerLink="/browse">View all &rarr;</a>
        </div>
        <div appKeyboardNav>
          <app-movie-grid [movies]="catalog.featured()" />
        </div>
      </section>

      @if (hiddenGems().length > 0) {
        <section appReveal class="section container" aria-label="Hidden gems">
          <div class="section__header">
            <h2>Hidden Gems</h2>
            <span class="section__desc">Highly rated films with under 1,000 votes</span>
          </div>
          <app-scroll-row class="gems__scroll">
            @for (gem of hiddenGems(); track gem.id) {
              <a class="gems__card" [routerLink]="['/movie', gem.id]">
                @if (gem.posterUrl) {
                  <img [src]="gem.posterUrl" [alt]="gem.title" loading="lazy" />
                } @else {
                  <div class="gems__placeholder">{{ gem.title }}</div>
                }
                <p class="gems__title">{{ gem.title }}</p>
                <p class="gems__meta">{{ gem.year }}</p>
              </a>
            }
          </app-scroll-row>
        </section>
      }

      @if (topRated().length > 0) {
        <section appReveal class="section container" aria-label="Top rated classics">
          <div class="section__header">
            <h2>Top Rated Classics</h2>
            <a class="section__link" routerLink="/browse" [queryParams]="{ sort: 'rating' }">View all &rarr;</a>
          </div>
          <app-scroll-row class="gems__scroll">
            @for (film of topRated(); track film.id) {
              <a class="gems__card" [routerLink]="['/movie', film.id]">
                @if (film.posterUrl) {
                  <img [src]="film.posterUrl" [alt]="film.title" loading="lazy" />
                } @else {
                  <div class="gems__placeholder">{{ film.title }}</div>
                }
                <p class="gems__title">{{ film.title }}</p>
                <p class="gems__meta">{{ film.year }} &middot; &#9733; {{ film.voteAverage.toFixed(1) }}</p>
              </a>
            }
          </app-scroll-row>
        </section>
      }

      @if (worldCinema().length > 0) {
        <section appReveal class="section container" aria-label="World cinema">
          <div class="section__header">
            <h2>World Cinema</h2>
            <a class="section__link" routerLink="/browse" [queryParams]="{ streamable: '1' }">Browse all &rarr;</a>
          </div>
          <app-scroll-row class="gems__scroll">
            @for (film of worldCinema(); track film.id) {
              <a class="gems__card" [routerLink]="['/movie', film.id]">
                @if (film.posterUrl) {
                  <img [src]="film.posterUrl" [alt]="film.title" loading="lazy" />
                } @else {
                  <div class="gems__placeholder">{{ film.title }}</div>
                }
                <p class="gems__title">{{ film.title }}</p>
                <p class="gems__meta">{{ film.year }} &middot; {{ film.language }}</p>
              </a>
            }
          </app-scroll-row>
        </section>
      }

      @if (decades().length > 0) {
        <section appReveal class="section container" aria-label="Browse by decade">
          <h2>Browse by Decade</h2>
          <div class="decades">
            @for (decade of decades(); track decade) {
              <a class="decade-card" [routerLink]="['/decade', decade]">
                <div class="decade-card__info">
                  <span class="decade-card__year">{{ decade }}s</span>
                  <span class="decade-card__count">{{ decadeFilmCounts().get(decade) ?? 0 }} films</span>
                </div>
                <span class="decade-card__arrow">&rarr;</span>
              </a>
            }
          </div>
        </section>
      }

      @if (genres().length > 0) {
        <section appReveal class="section container" aria-label="Popular genres">
          <h2>Popular Genres</h2>
          <div class="genres">
            @for (genre of genres(); track genre) {
              <a class="genre-tag" [routerLink]="['/genre', genre]">{{ genre }}</a>
            }
          </div>
        </section>
      }

      @if (topDirectors().length > 0) {
        <section appReveal class="section container" aria-label="Featured directors">
          <div class="section__header">
            <h2>Featured Directors</h2>
          </div>
          <app-scroll-row class="directors-row">
            @for (d of topDirectors(); track d.name) {
              <a class="director-chip" [routerLink]="['/director', d.name]">
                <span class="director-chip__initial">{{ d.name[0] }}</span>
                <div class="director-chip__info">
                  <span class="director-chip__name">{{ d.name }}</span>
                  <span class="director-chip__count">{{ d.count }} films</span>
                </div>
              </a>
            }
          </app-scroll-row>
        </section>
      }

      @if (decadeSpotlight(); as dSpot) {
        <section appReveal class="section container" aria-label="Decade spotlight">
          <div class="section__header">
            <div>
              <h2>Decade Spotlight: {{ dSpot.decade }}s</h2>
              <p class="section__desc">{{ dSpot.count }} films from this era</p>
            </div>
            <a class="section__link" [routerLink]="['/decade', dSpot.decade]">See all &rarr;</a>
          </div>
          <app-scroll-row class="gems__scroll">
            @for (film of dSpot.films; track film.id) {
              <a class="gems__card" [routerLink]="['/movie', film.id]">
                @if (film.posterUrl) {
                  <img [src]="film.posterUrl" [alt]="film.title" loading="lazy" />
                } @else {
                  <div class="gems__placeholder">{{ film.title }}</div>
                }
                <p class="gems__title">{{ film.title }}</p>
                <p class="gems__meta">{{ film.year }} &middot; &#9733; {{ film.voteAverage.toFixed(1) }}</p>
              </a>
            }
          </app-scroll-row>
        </section>
      }

      @if (genreSpotlight(); as gSpot) {
        <section appReveal class="section container" aria-label="Genre spotlight">
          <div class="section__header">
            <div>
              <h2>Genre Spotlight: {{ gSpot.name }}</h2>
              <p class="section__desc">{{ gSpot.count }} films in catalog</p>
            </div>
            <a class="section__link" [routerLink]="['/genre', gSpot.name]">See all &rarr;</a>
          </div>
          <app-scroll-row class="gems__scroll">
            @for (film of gSpot.films; track film.id) {
              <a class="gems__card" [routerLink]="['/movie', film.id]">
                @if (film.posterUrl) {
                  <img [src]="film.posterUrl" [alt]="film.title" loading="lazy" />
                } @else {
                  <div class="gems__placeholder">{{ film.title }}</div>
                }
                <p class="gems__title">{{ film.title }}</p>
                <p class="gems__meta">{{ film.year }} &middot; &#9733; {{ film.voteAverage.toFixed(1) }}</p>
              </a>
            }
          </app-scroll-row>
        </section>
      }

      @if (directorSpotlight(); as spotlight) {
        <section appReveal class="section container" aria-label="Director spotlight">
          <div class="section__header">
            <div>
              <h2>Director Spotlight</h2>
              <p class="section__desc">{{ spotlight.name }} &middot; {{ spotlight.films.length }} films in catalog</p>
            </div>
            <a class="section__link" [routerLink]="['/director', spotlight.name]">See all &rarr;</a>
          </div>
          <app-scroll-row class="gems__scroll">
            @for (film of spotlight.films.slice(0, 8); track film.id) {
              <a class="gems__card" [routerLink]="['/movie', film.id]">
                @if (film.posterUrl) {
                  <img [src]="film.posterUrl" [alt]="film.title" loading="lazy" />
                } @else {
                  <div class="gems__placeholder">{{ film.title }}</div>
                }
                <p class="gems__title">{{ film.title }}</p>
                <p class="gems__meta">{{ film.year }}</p>
              </a>
            }
          </app-scroll-row>
        </section>
      }

      @if (recentMovies().length > 0) {
        <section class="section container" aria-label="Recently viewed">
          <div class="section__header">
            <h2>Recently Viewed</h2>
          </div>
          <div appKeyboardNav>
            <app-movie-grid [movies]="recentMovies()" />
          </div>
        </section>
      }

      @if (continueWatching().length > 0) {
        <section class="section container" aria-label="Continue watching">
          <div class="section__header">
            <h2>Continue Watching</h2>
          </div>
          <div appKeyboardNav>
            <app-movie-grid [movies]="continueWatching()" />
          </div>
        </section>
      }

      @if (watchlistNext().length > 0) {
        <section class="section container" aria-label="Your watchlist">
          <div class="section__header">
            <div>
              <h2>Continue Your Journey</h2>
              <p class="section__desc">{{ watchlistTotal() }} films on your watchlist</p>
            </div>
            <a class="section__link" routerLink="/collection">View all &rarr;</a>
          </div>
          @if (watchlistProgress(); as progress) {
            <div class="progress-bar" role="progressbar" [attr.aria-valuenow]="progress.watched" [attr.aria-valuemax]="progress.total">
              <div class="progress-bar__fill" [style.width.%]="progress.percent"></div>
              <span class="progress-bar__label">{{ progress.watched }} of {{ progress.total }} watched ({{ progress.percent }}%)</span>
            </div>
          }
          <div appKeyboardNav>
            <app-movie-grid [movies]="watchlistNext()" />
          </div>
        </section>
      }

      @if (unratedWatched().length > 0) {
        <section class="section container" aria-label="Rate your films">
          <div class="section__header">
            <div>
              <h2>Rate These Films</h2>
              <p class="section__desc">You watched these but haven't rated them yet</p>
            </div>
          </div>
          <div class="rate-cards">
            @for (movie of unratedWatched().slice(0, 6); track movie.id) {
              <a class="rate-card" [routerLink]="['/movie', movie.id]">
                @if (movie.posterUrl) {
                  <img [src]="movie.posterUrl" [alt]="movie.title" loading="lazy" />
                } @else {
                  <div class="rate-card__placeholder">{{ movie.title }}</div>
                }
                <div class="rate-card__info">
                  <span class="rate-card__title">{{ movie.title }}</span>
                  <span class="rate-card__year">{{ movie.year }}</span>
                </div>
              </a>
            }
          </div>
        </section>
      }

      @if (recommendations().length > 0) {
        <section appReveal class="section container" aria-label="Recommended for you">
          <div class="section__header">
            <h2>Recommended for You</h2>
            <a class="section__link" routerLink="/browse">Browse all &rarr;</a>
          </div>
          <div appKeyboardNav>
            <app-movie-grid [movies]="recommendations()" />
          </div>
        </section>
      }

      <section appReveal class="section container cta-row" aria-label="Discover more">
        <a class="cta-card cta-card--quiz" routerLink="/quiz">
          <div class="cta-card__icon">?</div>
          <div>
            <h3 class="cta-card__title">What Should I Watch?</h3>
            <p class="cta-card__desc">Take a quick quiz and get personalized picks</p>
          </div>
          <span class="cta-card__arrow">&rarr;</span>
        </a>
        <a class="cta-card cta-card--wrapped" routerLink="/wrapped">
          <div class="cta-card__icon">&#9733;</div>
          <div>
            <h3 class="cta-card__title">Year in Review</h3>
            <p class="cta-card__desc">See your {{ currentYear }} viewing stats and highlights</p>
          </div>
          <span class="cta-card__arrow">&rarr;</span>
        </a>
        <a class="cta-card cta-card--explore" routerLink="/explore">
          <div class="cta-card__icon">&#9670;</div>
          <div>
            <h3 class="cta-card__title">Explore by Mood</h3>
            <p class="cta-card__desc">Browse films by mood or let fate decide</p>
          </div>
          <span class="cta-card__arrow">&rarr;</span>
        </a>
      </section>

      <section appReveal class="section container cta-row cta-row--secondary" aria-label="More features">
        <a class="cta-card cta-card--compare" routerLink="/compare">
          <div class="cta-card__icon">&#8644;</div>
          <div>
            <h3 class="cta-card__title">Compare Films</h3>
            <p class="cta-card__desc">Put two classics side by side and see how they stack up</p>
          </div>
          <span class="cta-card__arrow">&rarr;</span>
        </a>
        <a class="cta-card cta-card--stats" routerLink="/stats">
          <div class="cta-card__icon">&#9638;</div>
          <div>
            <h3 class="cta-card__title">Catalog Stats</h3>
            <p class="cta-card__desc">Explore the numbers behind {{ filmCount() }} classic films</p>
          </div>
          <span class="cta-card__arrow">&rarr;</span>
        </a>
      </section>

      @for (coll of catalog.curatedCollections().slice(0, 3); track coll.name) {
        <section class="section container" [attr.aria-label]="coll.name">
          <div class="section__header">
            <div>
              <h2>{{ coll.name }}</h2>
              <p class="section__desc">{{ coll.description }}</p>
            </div>
          </div>
          <div appKeyboardNav>
            <app-movie-grid [movies]="coll.movies" />
          </div>
        </section>
      }
    }
  `,
  styles: [`
    :host { display: block; overflow-x: hidden; }
    .hero {
      position: relative;
      padding: var(--space-3xl) 0 var(--space-2xl);
      text-align: center;
      overflow: hidden;
    }
    .hero__bg {
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at 50% 0%, rgba(212, 168, 67, 0.08) 0%, transparent 70%);
    }
    .hero__content {
      position: relative;
    }
    .home__error {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-xl);
      text-align: center;
      color: var(--text-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--bg-surface);
    }
    .home__error svg { color: var(--accent-gold); }
    .home__error-retry {
      padding: 8px 20px;
      background: var(--accent-gold);
      color: var(--bg-deep);
      border: none;
      border-radius: var(--radius);
      font-weight: 600;
      cursor: pointer;
    }
    .home__error-retry:hover { opacity: 0.9; }
    .hero__eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.2em;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--accent-gold);
      margin: 0 0 var(--space-md);
    }
    .hero__title {
      font-size: 3.2rem;
      font-weight: 900;
      line-height: 1.1;
      margin-bottom: var(--space-lg);
      background: linear-gradient(180deg, var(--text-primary) 40%, var(--text-secondary) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero__subtitle {
      color: var(--text-secondary);
      font-size: 1.15rem;
      margin: 0 auto var(--space-xl);
      max-width: 560px;
      line-height: 1.7;
    }
    .hero__search {
      max-width: 520px;
      margin: 0 auto var(--space-xl);
    }
    .hero__surprise {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin: 0 auto var(--space-xl);
      border-radius: 24px;
      padding: 10px 24px;
      font-size: 0.95rem;
    }
    .hero__stats {
      display: flex;
      justify-content: center;
      gap: var(--space-2xl);
    }
    .hero__stat {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .hero__stat-value {
      font-family: var(--font-heading);
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--accent-gold);
    }
    .hero__stat-label {
      font-size: 0.8rem;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-top: 2px;
    }
    .hero__avg-rating {
      font-size: 0.85rem;
      color: var(--text-tertiary);
      margin: var(--space-md) 0 0;
    }
    .hero__more-toggle {
      background: none;
      border: none;
      color: var(--text-tertiary);
      font-size: 0.8rem;
      cursor: pointer;
      padding: var(--space-xs) 0;
      opacity: 0.7;
      transition: opacity 0.2s;
      &:hover { opacity: 1; }
    }
    .section {
      padding: var(--space-2xl) 0;
    }
    .section__header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-bottom: var(--space-sm);
    }
    .section__header h2 {
      margin-bottom: 0;
    }
    .section__link {
      font-size: 0.9rem;
      font-weight: 600;
    }
    .section__desc {
      font-size: 0.9rem;
      color: var(--text-tertiary);
      margin: 2px 0 0;
    }
    .decades {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: var(--space-sm);
      margin-top: var(--space-md);
    }
    .decade-card {
      background-color: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-lg) var(--space-md);
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .decade-card:hover {
      border-color: var(--accent-gold);
      background-color: var(--accent-gold-dim);
    }
    .decade-card__info {
      display: flex;
      flex-direction: column;
    }
    .decade-card__year {
      font-family: var(--font-heading);
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .decade-card__count {
      font-size: 0.75rem;
      color: var(--text-tertiary);
      margin-top: 2px;
    }
    .decade-card:hover .decade-card__year {
      color: var(--accent-gold);
    }
    .decade-card__arrow {
      color: var(--text-tertiary);
      font-size: 1.1rem;
      transition: transform 0.2s, color 0.2s;
    }
    .decade-card:hover .decade-card__arrow {
      transform: translateX(3px);
      color: var(--accent-gold);
    }
    .genres {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-sm);
      margin-top: var(--space-md);
    }
    .genre-tag {
      background-color: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--border-bright);
      border-radius: 20px;
      padding: 6px 18px;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .genre-tag:hover {
      border-color: var(--accent-gold);
      color: var(--accent-gold);
      background-color: var(--accent-gold-dim);
    }
    .fotd__heading {
      margin-bottom: var(--space-md);
    }
    .fotd__card {
      position: relative;
      display: flex;
      gap: var(--space-xl);
      background-color: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: var(--space-lg);
      text-decoration: none;
      color: inherit;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .fotd__card:hover {
      border-color: var(--accent-gold);
      box-shadow: var(--shadow-md);
      color: inherit;
    }
    .fotd__poster {
      width: 140px;
      aspect-ratio: 2 / 3;
      flex-shrink: 0;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-poster);
      object-fit: cover;
    }
    .fotd__poster-placeholder {
      width: 140px;
      aspect-ratio: 2 / 3;
      background: var(--bg-raised);
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-heading);
      color: var(--text-tertiary);
      text-align: center;
      padding: var(--space-sm);
      flex-shrink: 0;
    }
    .fotd__info {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .fotd__title {
      font-size: 1.5rem;
      margin-bottom: var(--space-xs);
    }
    .fotd__meta {
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin: 0 0 var(--space-sm);
    }
    .fotd__genres {
      display: flex;
      gap: var(--space-xs);
      margin-bottom: var(--space-sm);
    }
    .fotd__genre {
      font-size: 0.8rem;
      padding: 2px 10px;
      border: 1px solid var(--border-bright);
      border-radius: 12px;
      color: var(--text-secondary);
    }
    .fotd__bottom {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      margin-bottom: var(--space-sm);
    }
    .fotd__rating {
      color: var(--accent-gold);
      font-family: var(--font-heading);
      font-size: 1.1rem;
      font-weight: 700;
    }
    .fotd__free-badge {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: var(--radius-sm);
      background-color: var(--accent-gold);
      color: var(--bg-deep);
    }
    .fotd__cta {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--accent-gold);
    }
    .fotd__watchlist-btn {
      position: absolute;
      top: var(--space-md);
      right: var(--space-md);
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s;
      z-index: 2;
    }
    .fotd__watchlist-btn:hover {
      background: var(--accent-gold-dim);
      border-color: var(--accent-gold);
      color: var(--accent-gold);
    }
    .gems__scroll {
      margin-top: var(--space-md);
    }
    .gems__card {
      flex: 0 0 130px;
      scroll-snap-align: start;
      text-decoration: none;
      color: var(--text-primary);
      transition: transform 0.2s;
    }
    @media (hover: hover) and (pointer: fine) {
      .gems__card:hover { transform: translateY(-4px); }
    }
    .gems__card:hover { color: var(--text-primary); }
    .gems__card img {
      width: 100%;
      aspect-ratio: 2 / 3;
      object-fit: cover;
      border-radius: var(--radius);
      margin-bottom: var(--space-xs);
    }
    .gems__placeholder {
      width: 100%;
      aspect-ratio: 2 / 3;
      background: var(--bg-raised);
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      color: var(--text-tertiary);
      text-align: center;
      padding: var(--space-sm);
      margin-bottom: var(--space-xs);
    }
    .gems__title {
      font-size: 0.85rem;
      font-weight: 600;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .gems__meta {
      font-size: 0.75rem;
      color: var(--text-tertiary);
      margin: 0;
    }
    .directors-row {
      --scroll-row-gap: var(--space-sm);
      margin-top: var(--space-md);
    }
    .director-chip {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-sm) var(--space-md);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      text-decoration: none;
      color: inherit;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .director-chip:hover {
      border-color: var(--accent-gold);
      color: inherit;
    }
    .director-chip__initial {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: var(--accent-gold-dim);
      color: var(--accent-gold);
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 1rem;
      flex-shrink: 0;
    }
    .director-chip__info {
      display: flex;
      flex-direction: column;
    }
    .director-chip__name {
      font-weight: 600;
      font-size: 0.85rem;
      color: var(--text-primary);
    }
    .director-chip__count {
      font-size: 0.7rem;
      color: var(--text-tertiary);
    }
    .cta-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-md);
    }
    .cta-card {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-lg);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      text-decoration: none;
      color: inherit;
      transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
    }
    .cta-card:hover {
      border-color: var(--accent-gold);
      box-shadow: var(--shadow-md);
      color: inherit;
    }
    @media (hover: hover) and (pointer: fine) {
      .cta-card:hover { transform: translateY(-2px); }
    }
    .cta-card__icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: var(--accent-gold-dim);
      color: var(--accent-gold);
      font-family: var(--font-heading);
      font-size: 1.2rem;
      font-weight: 700;
      flex-shrink: 0;
    }
    .cta-card__title {
      font-size: 1rem;
      font-weight: 700;
      margin: 0 0 2px;
    }
    .cta-card__desc {
      font-size: 0.8rem;
      color: var(--text-tertiary);
      margin: 0;
    }
    .cta-card__arrow {
      margin-left: auto;
      color: var(--text-tertiary);
      font-size: 1.1rem;
      flex-shrink: 0;
      transition: color 0.2s, transform 0.2s;
    }
    .cta-card:hover .cta-card__arrow {
      color: var(--accent-gold);
      transform: translateX(3px);
    }
    .progress-bar {
      position: relative;
      height: 28px;
      background: var(--bg-raised);
      border-radius: 14px;
      overflow: hidden;
      margin-bottom: var(--space-lg);
    }
    .progress-bar__fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent-gold-dim), var(--accent-gold));
      border-radius: 14px;
      transition: width 0.6s ease;
    }
    .progress-bar__label {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    .rate-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: var(--space-md);
    }
    .rate-card {
      text-decoration: none;
      color: inherit;
      transition: transform 0.2s;
    }
    @media (hover: hover) and (pointer: fine) {
      .rate-card:hover { transform: translateY(-4px); }
    }
    .rate-card img {
      width: 100%;
      aspect-ratio: 2 / 3;
      object-fit: cover;
      border-radius: var(--radius);
      margin-bottom: var(--space-xs);
    }
    .rate-card__placeholder {
      width: 100%;
      aspect-ratio: 2 / 3;
      background: var(--bg-raised);
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      color: var(--text-tertiary);
      text-align: center;
      padding: var(--space-sm);
      margin-bottom: var(--space-xs);
    }
    .rate-card__info {
      display: flex;
      flex-direction: column;
    }
    .rate-card__title {
      font-size: 0.85rem;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .rate-card__year {
      font-size: 0.75rem;
      color: var(--text-tertiary);
    }
    .cta-row--secondary {
      grid-template-columns: repeat(2, 1fr);
      padding-top: 0;
    }
    @media (max-width: 768px) {
      .cta-row { grid-template-columns: 1fr; }
      .cta-row--secondary { grid-template-columns: 1fr; }
      .hero { padding: var(--space-2xl) 0 var(--space-xl); }
      .hero__title { font-size: 2.2rem; }
      .hero__stats { gap: var(--space-xl); }
      .hero__stat-value { font-size: 1.4rem; }
      .fotd__card { flex-direction: column; gap: var(--space-md); }
      .fotd__poster { width: 100%; max-width: 200px; aspect-ratio: 2 / 3; }
    }
    @media (max-width: 480px) {
      .hero__title { font-size: 1.8rem; }
      .hero__subtitle { font-size: 1rem; }
      .hero__stats {
        flex-wrap: wrap;
        gap: var(--space-sm) var(--space-lg);
        justify-content: center;
      }
      .hero__stat-value { font-size: 1.2rem; }
      .hero__stat-label { font-size: 0.7rem; }
      .hero__surprise { padding: 8px 18px; font-size: 0.9rem; }
      .decades { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }
      .genre-tag { padding: 5px 14px; font-size: 0.85rem; }
      .gems__card { flex: 0 0 110px; }
      .fotd__poster { max-width: 160px; }
      .fotd__title { font-size: 1.2rem; }
      .cta-card { padding: var(--space-md); gap: var(--space-sm); }
      .cta-card__icon { width: 34px; height: 34px; font-size: 1rem; }
      .cta-card__title { font-size: 0.9rem; }
      .cta-card__desc { font-size: 0.75rem; }
      .rate-cards { grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: var(--space-sm); }
    }
    @media (max-width: 360px) {
      .hero { padding: var(--space-xl) 0 var(--space-lg); }
      .hero__title { font-size: 1.5rem; }
      .hero__subtitle { font-size: 0.9rem; }
      .hero__eyebrow { font-size: 0.7rem; }
      .hero__stats { gap: var(--space-xs) var(--space-md); }
      .hero__stat-value { font-size: 1rem; }
      .hero__stat-label { font-size: 0.65rem; }
      .decades { grid-template-columns: repeat(2, 1fr); }
      .decade-card { padding: var(--space-md) var(--space-sm); }
      .decade-card__year { font-size: 1.1rem; }
      .gems__card { flex: 0 0 100px; }
      .fotd__poster { max-width: 120px; }
      .fotd__title { font-size: 1.1rem; }
      .director-chip { padding: var(--space-xs) var(--space-sm); }
      .director-chip__initial { width: 28px; height: 28px; font-size: 0.85rem; }
      .director-chip__name { font-size: 0.8rem; }
    }
  `],
})
export class HomeComponent implements OnInit {
  protected readonly catalog = inject(CatalogService);
  private readonly router = inject(Router);
  protected readonly collectionService = inject(CollectionService);
  private readonly notifications = inject(NotificationService);
  private readonly recentlyViewedService = inject(RecentlyViewedService);

  readonly currentYear = new Date().getFullYear();
  readonly showMoreHero = signal(false);
  private readonly gemSeed = signal(0);
  readonly decades = computed(() => this.catalog.meta()?.decades ?? []);
  readonly decadeFilmCounts = computed(() => {
    const movies = this.catalog.movies();
    const counts = new Map<number, number>();
    for (const m of movies) {
      const d = Math.floor(m.year / 10) * 10;
      counts.set(d, (counts.get(d) ?? 0) + 1);
    }
    return counts;
  });
  readonly recentMovies = computed(() => {
    const ids = this.recentlyViewedService.ids();
    const movies = this.catalog.movies();
    return ids.map((id) => movies.find((m) => m.id === id)).filter((m): m is NonNullable<typeof m> => !!m);
  });
  readonly continueWatching = computed(() => {
    const progress = this.collectionService.watchProgress();
    const watchedIds = this.collectionService.watchedIds();
    const movies = this.catalog.movies();
    return progress
      .filter((p) => !watchedIds.has(p.movieId))
      .sort((a, b) => b.startedAt - a.startedAt)
      .slice(0, 6)
      .map((p) => movies.find((m) => m.id === p.movieId))
      .filter((m): m is NonNullable<typeof m> => !!m);
  });

  readonly hiddenGems = computed(() => {
    const gems = this.catalog.movies()
      .filter((m) => m.voteAverage >= 7.0 && m.voteAverage <= 8.0 && m.isStreamable && m.posterUrl);
    return this.seededShuffle([...gems], this.gemSeed()).slice(0, 12);
  });

  readonly topRated = computed(() =>
    this.catalog.movies()
      .filter((m) => m.voteAverage >= 8.0 && m.isStreamable && m.posterUrl)
      .sort((a, b) => b.voteAverage - a.voteAverage)
      .slice(0, 12)
  );

  readonly worldCinema = computed(() =>
    this.catalog.movies()
      .filter((m) => m.isStreamable && m.posterUrl && m.language && m.language !== 'English' && m.voteAverage >= 6.5)
      .sort((a, b) => b.voteAverage - a.voteAverage)
      .slice(0, 12)
  );

  readonly watchlistNext = computed(() => {
    const watchlistIds = this.collectionService.watchlistIds();
    const movies = this.catalog.movies();
    return [...watchlistIds]
      .map((id) => movies.find((m) => m.id === id))
      .filter((m): m is NonNullable<typeof m> => !!m && m.isStreamable)
      .slice(0, 6);
  });

  readonly watchlistTotal = computed(() => this.collectionService.watchlistIds().size);

  readonly genres = computed(() => this.catalog.meta()?.genres ?? []);

  readonly watchlistProgress = computed(() => {
    const watchlistIds = [...this.collectionService.watchlistIds()];
    const watchedIds = this.collectionService.watchedIds();
    const total = watchlistIds.length + watchedIds.size;
    if (total === 0) return null;
    const watched = watchedIds.size;
    return { watched, total, percent: Math.round((watched / total) * 100) };
  });

  readonly unratedWatched = computed(() => {
    const watched = this.collectionService.watched();
    const unrated = watched.filter((w) => w.userRating === null);
    const movies = this.catalog.movies();
    const movieMap = new Map(movies.map((m) => [m.id, m]));
    return unrated
      .sort((a, b) => b.watchedAt - a.watchedAt)
      .map((w) => movieMap.get(w.movieId))
      .filter((m): m is NonNullable<typeof m> => !!m);
  });

  readonly recommendations = computed(() =>
    this.catalog.getRecommendations(this.collectionService.watchedIds())
  );

  readonly topDirectors = computed(() => {
    const dirMap = new Map<string, number>();
    for (const m of this.catalog.movies()) {
      for (const d of m.directors) dirMap.set(d, (dirMap.get(d) ?? 0) + 1);
    }
    return [...dirMap.entries()]
      .filter(([, count]) => count >= 5)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
  });
  readonly decadeSpotlight = computed(() => {
    const seed = this.gemSeed();
    const decades = this.decades();
    if (decades.length === 0) return null;
    const idx = Math.abs(seed + 13) % decades.length;
    const decade = decades[idx];
    const films = this.catalog.movies()
      .filter((m) => m.year >= decade && m.year < decade + 10 && m.isStreamable && m.posterUrl)
      .sort((a, b) => b.voteAverage - a.voteAverage)
      .slice(0, 10);
    if (films.length < 3) return null;
    const count = this.catalog.movies().filter((m) => m.year >= decade && m.year < decade + 10).length;
    return { decade, count, films };
  });

  readonly genreSpotlight = computed(() => {
    const seed = this.gemSeed();
    const genreMap = new Map<string, import('../../core/models/movie.model').MovieSummary[]>();
    for (const m of this.catalog.movies()) {
      for (const g of m.genres) {
        const list = genreMap.get(g) ?? [];
        list.push(m);
        genreMap.set(g, list);
      }
    }
    const eligible = [...genreMap.entries()]
      .filter(([, films]) => films.length >= 20 && films.some((f) => f.isStreamable && f.posterUrl));
    if (eligible.length === 0) return null;
    const idx = Math.abs(seed + 7) % eligible.length;
    const [name, films] = eligible[idx];
    const sorted = films
      .filter((f) => f.posterUrl && f.isStreamable)
      .sort((a, b) => b.voteAverage - a.voteAverage)
      .slice(0, 10);
    return { name, count: films.length, films: sorted };
  });

  readonly directorSpotlight = computed(() => {
    const seed = this.gemSeed();
    const dirMap = new Map<string, import('../../core/models/movie.model').MovieSummary[]>();
    for (const m of this.catalog.movies()) {
      for (const d of m.directors) {
        const list = dirMap.get(d) ?? [];
        list.push(m);
        dirMap.set(d, list);
      }
    }
    const eligible = [...dirMap.entries()]
      .filter(([, films]) => films.length >= 8 && films.some((f) => f.isStreamable && f.posterUrl));
    if (eligible.length === 0) return null;
    // Use seed for deterministic daily rotation
    const idx = Math.abs(seed) % eligible.length;
    const [name, films] = eligible[idx];
    const sorted = films
      .filter((f) => f.posterUrl)
      .sort((a, b) => b.voteAverage - a.voteAverage);
    return { name, films: sorted };
  });

  // ── Single-pass hero stats index ────────────────────────────────────
  private readonly heroIdx = computed(() => {
    const movies = this.catalog.movies();
    const now = new Date().getFullYear();
    let streamable = 0, silentEra = 0, nonEnglish = 0, highRated7 = 0, streamHighRated = 0;
    let ratingSum = 0, ratedCount = 0, yearSum = 0;
    let withImdb = 0, withPoster = 0, withYt = 0, withIa = 0, coDirected = 0;
    let minYear = Infinity, maxYear = 0;
    const langs = new Set<string>();
    const dirs = new Set<string>();
    const genres = new Set<string>();
    const nonEnLangCounts = new Map<string, number>();
    const years: number[] = [];

    for (const m of movies) {
      if (m.isStreamable) streamable++;
      if (m.year < 1930) silentEra++;
      if (m.language && m.language !== 'English' && m.language !== 'en') nonEnglish++;
      if (m.voteAverage >= 7.0) { highRated7++; if (m.isStreamable) streamHighRated++; }
      if (m.voteAverage > 0) { ratingSum += m.voteAverage; ratedCount++; }
      if (m.imdbId) withImdb++;
      if (m.posterUrl) withPoster++;
      if (m.youtubeId) withYt++;
      if (m.internetArchiveId) withIa++;
      if (m.directors.length > 1) coDirected++;
      yearSum += m.year;
      years.push(m.year);
      if (m.year < minYear) minYear = m.year;
      if (m.year > maxYear) maxYear = m.year;
      if (m.language) {
        langs.add(m.language);
        if (m.language !== 'en') nonEnLangCounts.set(m.language, (nonEnLangCounts.get(m.language) ?? 0) + 1);
      }
      for (const d of m.directors) dirs.add(d);
      for (const g of m.genres) genres.add(g);
    }
    years.sort((a, b) => a - b);
    return {
      total: movies.length, streamable, silentEra, nonEnglish, highRated7, streamHighRated,
      ratingSum, ratedCount, yearSum, now, years,
      withImdb, withPoster, withYt, withIa, coDirected,
      minYear, maxYear, langCount: langs.size, dirCount: dirs.size, genreCount: genres.size,
      nonEnLangCounts,
    };
  });

  readonly filmCount = computed(() => {
    const total = this.catalog.meta()?.totalMovies ?? 0;
    return total > 1000 ? `${(total / 1000).toFixed(1)}k` : `${total}`;
  });
  readonly streamableCount = computed(() => {
    const c = this.heroIdx().streamable;
    return c > 1000 ? `${(c / 1000).toFixed(1)}k` : `${c}`;
  });
  readonly languageCount = computed(() => this.heroIdx().langCount);
  readonly directorCount = computed(() => {
    const c = this.heroIdx().dirCount;
    return c > 1000 ? `${(c / 1000).toFixed(1)}k` : `${c}`;
  });
  readonly genreCount = computed(() => this.heroIdx().genreCount);
  readonly silentEraCount = computed(() => this.heroIdx().silentEra);
  readonly oldestFilmYear = computed(() => this.heroIdx().total > 0 ? this.heroIdx().minYear : null);
  readonly newestFilmYear = computed(() => this.heroIdx().total > 0 ? this.heroIdx().maxYear : null);
  readonly totalWatchedCount = computed(() => this.collectionService.watchedIds().size);
  readonly watchlistSize = computed(() => this.collectionService.watchlistIds().size);
  readonly favoritesCount = computed(() => this.collectionService.favoriteIds().size);

  readonly avgCatalogRating = computed(() => {
    const i = this.heroIdx();
    return i.ratedCount > 0 ? (i.ratingSum / i.ratedCount).toFixed(1) : null;
  });

  readonly topNonEnglishLang = computed(() => {
    const LANG_NAMES: Record<string, string> = {
      fr: 'French', de: 'German', ja: 'Japanese', it: 'Italian', es: 'Spanish',
      ru: 'Russian', sv: 'Swedish', da: 'Danish', pt: 'Portuguese', nl: 'Dutch',
      zh: 'Chinese', ko: 'Korean', pl: 'Polish', cs: 'Czech', hu: 'Hungarian',
    };
    const best = [...this.heroIdx().nonEnLangCounts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (!best || best[1] < 10) return null;
    return { name: LANG_NAMES[best[0]] ?? best[0].toUpperCase(), count: best[1] };
  });

  readonly topDecadeName = computed(() => {
    const counts = this.decadeFilmCounts();
    if (counts.size < 2) return null;
    let best = 0, bestDecade = 0;
    for (const [decade, count] of counts) {
      if (count > best) { best = count; bestDecade = decade; }
    }
    return best > 0 ? `${bestDecade}s` : null;
  });

  readonly avgFilmAge = computed(() => {
    const i = this.heroIdx();
    return i.total > 0 ? Math.round(i.years.reduce((s, y) => s + (i.now - y), 0) / i.total) : 0;
  });

  readonly nonEnglishCount = computed(() => this.heroIdx().nonEnglish);

  readonly medianYear = computed(() => {
    const y = this.heroIdx().years;
    if (y.length === 0) return 0;
    const mid = Math.floor(y.length / 2);
    return y.length % 2 === 0 ? Math.round((y[mid - 1] + y[mid]) / 2) : y[mid];
  });

  readonly highlyRatedCount = computed(() => this.heroIdx().highRated7);
  readonly streamableHighRatedCount = computed(() => this.heroIdx().streamHighRated);
  readonly catalogDirectorCount = computed(() => {
    const i = this.heroIdx();
    return i.total >= 10 && i.dirCount >= 10 ? i.dirCount : null;
  });
  readonly catalogLanguageCount = computed(() => {
    const i = this.heroIdx();
    return i.total >= 10 && i.langCount >= 3 ? i.langCount : null;
  });
  readonly catalogImdbLinkedPct = computed(() => {
    const i = this.heroIdx();
    if (i.total < 50) return null;
    const pct = Math.round((i.withImdb / i.total) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });
  readonly catalogPosterCoveragePct = computed(() => {
    const i = this.heroIdx();
    if (i.total < 50) return null;
    const pct = Math.round((i.withPoster / i.total) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });
  readonly catalogYtStreamablePct = computed(() => {
    const i = this.heroIdx();
    if (i.total < 50) return null;
    const pct = Math.round((i.withYt / i.total) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });
  readonly catalogCoDirectedPct = computed(() => {
    const i = this.heroIdx();
    if (i.total < 50) return null;
    const pct = Math.round((i.coDirected / i.total) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });
  readonly decadeSpan = computed(() => {
    const d = this.decades();
    if (d.length < 2) return `${d.length}`;
    return `${d[0]}s–${d[d.length - 1]}s`;
  });
  readonly catalogIaStreamablePct = computed(() => {
    const i = this.heroIdx();
    if (i.total < 50) return null;
    const pct = Math.round((i.withIa / i.total) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });

  ngOnInit(): void {
    this.catalog.load();
    this.gemSeed.set(Date.now());
  }

  onSearch(query: string): void {
    if (query.trim()) {
      this.router.navigate(['/browse'], { queryParams: { q: query } });
    }
  }

  browseTo(decade: number): void {
    this.router.navigate(['/browse'], { queryParams: { decade } });
  }

  browseGenre(genre: string): void {
    this.router.navigate(['/browse'], { queryParams: { genre } });
  }

  toggleFotdWatchlist(event: Event, movie: { id: string; title: string }): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.collectionService.isWatched(movie.id)) return;
    if (this.collectionService.isInWatchlist(movie.id)) {
      this.collectionService.removeFromWatchlist(movie.id);
      this.notifications.show('Removed from watchlist', 'info');
    } else {
      this.collectionService.addToWatchlist(movie.id);
      this.notifications.show(`Added "${movie.title}" to watchlist`, 'success');
    }
  }

  surpriseMe(): void {
    const streamable = this.catalog.movies().filter((m) => m.isStreamable);
    if (streamable.length === 0) return;
    const pick = streamable[Math.floor(Math.random() * streamable.length)];
    this.router.navigate(['/movie', pick.id]);
  }

  private seededShuffle<T>(arr: T[], seed: number): T[] {
    let s = seed;
    const random = () => {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
