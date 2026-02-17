import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { CatalogService } from '../../core/services/catalog.service';
import { CollectionService } from '../../core/services/collection.service';
import { NotificationService } from '../../core/services/notification.service';
import { MovieGridComponent } from '../../shared/components/movie-grid.component';
import { MovieListComponent } from '../../shared/components/movie-list.component';
import { ViewToggleComponent, type ViewMode } from '../../shared/components/view-toggle.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import type { MovieSummary } from '../../core/models/movie.model';

type SortOption = 'added-desc' | 'added-asc' | 'title-asc' | 'title-desc' | 'rating-desc' | 'year-desc';

@Component({
  selector: 'app-collection',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MovieGridComponent, MovieListComponent, ViewToggleComponent, LoadingSpinnerComponent],
  template: `
    <div class="collection container">
      @if (isSharedView()) {
        <h1>Shared Collection</h1>
        <p class="collection__shared-info">{{ sharedMovies().length }} film{{ sharedMovies().length !== 1 ? 's' : '' }} in this shared collection</p>
        @if (sharedMovies().length > 0) {
          <app-movie-grid [movies]="sharedMovies()" />
        } @else {
          <div class="collection__empty">
            <p class="collection__empty-title">No films found</p>
            <p class="collection__empty-text">The shared link may be invalid or the films are no longer in our catalog.</p>
            <a class="btn-primary" routerLink="/browse">Browse Films</a>
          </div>
        }
      } @else {
      @if (catalog.error(); as err) {
        <div class="catalog-error" role="alert">
          <p>{{ err }}</p>
          <button (click)="catalog.retry()">Try Again</button>
        </div>
      } @else {
      <div class="collection__title-row">
        <h1>My Collection</h1>
        <a class="collection__wrapped-link" routerLink="/wrapped">Year in Review &rarr;</a>
      </div>

      @if (catalog.loading()) {
        <app-loading-spinner />
      } @else {
        <div class="collection__controls">
          <div class="collection__tabs" role="tablist" (keydown)="onTabKeydown($event)">
            <button
              class="collection__tab"
              [class.collection__tab--active]="activeTab() === 'watchlist'"
              (click)="activeTab.set('watchlist')"
              role="tab"
              [attr.aria-selected]="activeTab() === 'watchlist'"
              [attr.tabindex]="activeTab() === 'watchlist' ? 0 : -1"
            >
              Watchlist
              @if (watchlistMovies().length > 0) {
                <span class="collection__count">{{ watchlistMovies().length }}</span>
              }
              @if (newThisWeek() > 0) {
                <span class="collection__new-dot" title="{{ newThisWeek() }} added this week"></span>
              }
            </button>
            <button
              class="collection__tab"
              [class.collection__tab--active]="activeTab() === 'watched'"
              (click)="activeTab.set('watched')"
              role="tab"
              [attr.aria-selected]="activeTab() === 'watched'"
              [attr.tabindex]="activeTab() === 'watched' ? 0 : -1"
            >
              Watched
              @if (watchedMovies().length > 0) {
                <span class="collection__count">{{ watchedMovies().length }}</span>
              }
            </button>
            <button
              class="collection__tab"
              [class.collection__tab--active]="activeTab() === 'favorites'"
              (click)="activeTab.set('favorites')"
              role="tab"
              [attr.aria-selected]="activeTab() === 'favorites'"
              [attr.tabindex]="activeTab() === 'favorites' ? 0 : -1"
            >
              Favorites
              @if (favoriteMovies().length > 0) {
                <span class="collection__count">{{ favoriteMovies().length }}</span>
              }
            </button>
            <button
              class="collection__tab"
              [class.collection__tab--active]="activeTab() === 'playlists'"
              (click)="activeTab.set('playlists')"
              role="tab"
              [attr.aria-selected]="activeTab() === 'playlists'"
              [attr.tabindex]="activeTab() === 'playlists' ? 0 : -1"
            >
              Playlists
              @if (collectionService.playlists().length > 0) {
                <span class="collection__count">{{ collectionService.playlists().length }}</span>
              }
            </button>
            <button
              class="collection__tab"
              [class.collection__tab--active]="activeTab() === 'stats'"
              (click)="activeTab.set('stats')"
              role="tab"
              [attr.aria-selected]="activeTab() === 'stats'"
              [attr.tabindex]="activeTab() === 'stats' ? 0 : -1"
            >
              Stats
            </button>
          </div>

          @if (activeTab() !== 'stats' && activeTab() !== 'playlists') {
            <div class="collection__search">
              <input
                type="search"
                class="collection__search-input"
                placeholder="Search in collection..."
                [value]="collectionQuery()"
                (input)="collectionQuery.set($any($event.target).value)"
                autocomplete="off"
              />
              <select class="collection__filter-select" (change)="genreFilter.set($any($event.target).value)">
                <option value="">All Genres</option>
                @for (g of collectionGenres(); track g) {
                  <option [value]="g">{{ g }}</option>
                }
              </select>
              <select class="collection__filter-select" (change)="decadeFilter.set($any($event.target).value)">
                <option value="">All Decades</option>
                @for (d of collectionDecades(); track d) {
                  <option [value]="d">{{ d }}s</option>
                }
              </select>
              @if (activeTab() === 'watched') {
                <select class="collection__rating-filter" (change)="onRatingFilterChange($event)">
                  <option value="0">All Ratings</option>
                  <option value="1">1+ Stars</option>
                  <option value="2">2+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="5">5 Stars</option>
                  <option value="-1">Unrated</option>
                </select>
              }
            </div>
          }
          @if (activeTab() !== 'stats') {
            <div class="collection__actions">
              <label for="collection-sort" class="sr-only">Sort by</label>
              <select id="collection-sort" class="collection__sort" (change)="onSortChange($event)">
                <option value="added-desc" selected>Recently Added</option>
                <option value="added-asc">Oldest Added</option>
                <option value="title-asc">Title A–Z</option>
                <option value="title-desc">Title Z–A</option>
                <option value="rating-desc">Highest Rated</option>
                <option value="year-desc">Newest Films</option>
              </select>
              @if (currentMovies().length > 0) {
                <button class="btn-ghost collection__export" (click)="exportCsv()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  CSV
                </button>
                <button class="btn-ghost collection__export" (click)="exportLetterboxd()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Letterboxd
                </button>
                <label class="btn-ghost collection__export collection__import-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Import
                  <input type="file" accept=".csv" class="sr-only" (change)="importLetterboxd($event)" />
                </label>
              }
              <app-view-toggle [(mode)]="viewMode" />
            </div>
          }
          @if (activeTab() !== 'stats' && activeTab() !== 'playlists') {
            <div class="collection__backup">
              <button class="btn-ghost collection__backup-btn" (click)="shareCollection()">Share</button>
            </div>
          }
          @if (activeTab() !== 'stats') {
            <div class="collection__backup">
              <button class="btn-ghost collection__backup-btn" (click)="exportBackup()">Backup</button>
              <label class="btn-ghost collection__backup-btn collection__restore-label">
                Restore
                <input type="file" accept=".json" class="sr-only" (change)="importBackup($event)" />
              </label>
            </div>
          }
        </div>

        @if (activeTab() === 'watchlist') {
          <div role="tabpanel" aria-live="polite">
            @if (sortedWatchlist().length > 0) {
              @if (viewMode() === 'grid') {
                <app-movie-grid [movies]="sortedWatchlist()" />
              } @else {
                <app-movie-list [movies]="sortedWatchlist()" />
              }
            } @else {
              <div class="collection__empty">
                <p class="collection__empty-title">No films in your watchlist</p>
                <p class="collection__empty-text">Browse films and add ones you'd like to watch later.</p>
                <a class="btn-primary" routerLink="/browse">Browse Films</a>
              </div>
            }
          </div>
        }

        @if (activeTab() === 'watched') {
          <div role="tabpanel" aria-live="polite">
            @if (sortedWatched().length > 0) {
              @if (viewMode() === 'grid') {
                <app-movie-grid [movies]="sortedWatched()" />
              } @else {
                <app-movie-list [movies]="sortedWatched()" />
              }
            } @else {
              <div class="collection__empty">
                <p class="collection__empty-title">No films watched yet</p>
                <p class="collection__empty-text">Films you mark as watched will appear here.</p>
                <a class="btn-primary" routerLink="/browse">Discover Films</a>
              </div>
            }
          </div>
        }

        @if (activeTab() === 'favorites') {
          <div role="tabpanel" aria-live="polite">
            @if (sortedFavorites().length > 0) {
              @if (viewMode() === 'grid') {
                <app-movie-grid [movies]="sortedFavorites()" />
              } @else {
                <app-movie-list [movies]="sortedFavorites()" />
              }
            } @else {
              <div class="collection__empty">
                <p class="collection__empty-title">No favorite films yet</p>
                <p class="collection__empty-text">Tap the heart icon on any film to add it to your favorites.</p>
                <a class="btn-primary" routerLink="/browse">Browse Films</a>
              </div>
            }
          </div>
        }

        @if (activeTab() === 'playlists') {
          <div role="tabpanel" class="playlists">
            <div class="playlists__create">
              <input
                type="text"
                class="playlists__input"
                placeholder="New playlist name..."
                [value]="newPlaylistName()"
                (input)="newPlaylistName.set($any($event.target).value)"
                (keydown.enter)="createPlaylist()"
              />
              <button class="btn-secondary" (click)="createPlaylist()" [disabled]="!newPlaylistName().trim()">Create</button>
            </div>

            @if (collectionService.playlists().length === 0) {
              <div class="collection__empty">
                <p class="collection__empty-title">No playlists yet</p>
                <p class="collection__empty-text">Create a playlist to organize your favorite films into custom lists.</p>
              </div>
            } @else {
              @for (pl of collectionService.playlists(); track pl.id) {
                <div class="playlists__card">
                  <div class="playlists__header">
                    @if (editingPlaylistId() === pl.id) {
                      <input
                        type="text"
                        class="playlists__rename-input"
                        [value]="editPlaylistName()"
                        (input)="editPlaylistName.set($any($event.target).value)"
                        (keydown.enter)="saveRename(pl.id)"
                        (blur)="saveRename(pl.id)"
                      />
                    } @else {
                      <h3 class="playlists__name" (click)="startRename(pl)">{{ pl.name }}</h3>
                    }
                    <span class="playlists__count">{{ pl.movieIds.length }} films</span>
                    <button class="btn-ghost playlists__delete" (click)="deletePlaylist(pl.id)" aria-label="Delete playlist">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                  @if (playlistMovies(pl.id).length > 0) {
                    <div class="playlists__movies">
                      @for (m of playlistMovies(pl.id); track m.id) {
                        <a class="playlists__movie" [routerLink]="['/movie', m.id]">
                          @if (m.posterUrl) {
                            <img [src]="m.posterUrl" [alt]="m.title" loading="lazy" />
                          } @else {
                            <div class="playlists__movie-placeholder">{{ m.title[0] }}</div>
                          }
                        </a>
                      }
                    </div>
                  }
                </div>
              }
            }
          </div>
        }

        @if (activeTab() === 'stats') {
          <div role="tabpanel" class="stats">
            @if (watchedMovies().length === 0) {
              <div class="collection__empty">
                <p class="collection__empty-title">No stats yet</p>
                <p class="collection__empty-text">Watch some films to see your viewing statistics.</p>
                <a class="btn-primary" routerLink="/browse">Discover Films</a>
              </div>
            } @else {
              <div class="stats__overview">
                <div class="stats__card">
                  <span class="stats__card-value">{{ watchedMovies().length }}</span>
                  <span class="stats__card-label">Films Watched</span>
                </div>
                <div class="stats__card stats__card--highlight">
                  <span class="stats__card-value">{{ watchedThisYear() }}</span>
                  <span class="stats__card-label">Watched in {{ currentYear }}</span>
                </div>
                <div class="stats__card">
                  <span class="stats__card-value">{{ avgRating() }}</span>
                  <span class="stats__card-label">Avg. Your Rating</span>
                </div>
                <div class="stats__card">
                  <span class="stats__card-value">{{ avgTmdbRating() }}</span>
                  <span class="stats__card-label">Avg. TMDb Rating</span>
                </div>
                <div class="stats__card">
                  <span class="stats__card-value">{{ totalDecades() }}</span>
                  <span class="stats__card-label">Decades Spanned</span>
                </div>
                @if (uniqueLanguages() > 1) {
                  <div class="stats__card">
                    <span class="stats__card-value">{{ uniqueLanguages() }}</span>
                    <span class="stats__card-label">Languages Explored</span>
                  </div>
                }
                <div class="stats__card">
                  <span class="stats__card-value">{{ currentStreak() }}</span>
                  <span class="stats__card-label">Current Streak (days)</span>
                </div>
                <div class="stats__card">
                  <span class="stats__card-value">{{ longestStreak() }}</span>
                  <span class="stats__card-label">Best Streak (days)</span>
                </div>
                @if (watchedAvgFilmAge() > 0) {
                  <div class="stats__card">
                    <span class="stats__card-value">{{ watchedAvgFilmAge() }}</span>
                    <span class="stats__card-label">Avg Film Age (yrs)</span>
                  </div>
                }
                @if (watchedDirectorCount() > 1) {
                  <div class="stats__card">
                    <span class="stats__card-value">{{ watchedDirectorCount() }}</span>
                    <span class="stats__card-label">Unique Directors</span>
                  </div>
                }
                @if (watchedNonEnglishCount() > 0) {
                  <div class="stats__card">
                    <span class="stats__card-value">{{ watchedNonEnglishCount() }}</span>
                    <span class="stats__card-label">Non-English Films</span>
                  </div>
                }
                @if (watchedSilentEraCount() > 0) {
                  <div class="stats__card">
                    <span class="stats__card-value">{{ watchedSilentEraCount() }}</span>
                    <span class="stats__card-label">Silent-Era Films</span>
                  </div>
                }
                @if (watchedMedianYear(); as wmy) {
                  <div class="stats__card">
                    <span class="stats__card-value">{{ wmy }}</span>
                    <span class="stats__card-label">Median Year</span>
                  </div>
                }
                @if (watchedAvgYear(); as way) {
                  <div class="stats__card">
                    <span class="stats__card-value">{{ way }}</span>
                    <span class="stats__card-label">Avg. Year</span>
                  </div>
                }
                @if (watchedCoDirectedCount() > 0) {
                  <div class="stats__card">
                    <span class="stats__card-value">{{ watchedCoDirectedCount() }}</span>
                    <span class="stats__card-label">Co-directed</span>
                  </div>
                }
                @if (watchedAvgTitleLength(); as watl) {
                  <div class="stats__card">
                    <span class="stats__card-value">{{ watl }}</span>
                    <span class="stats__card-label">Avg Title Length</span>
                  </div>
                }
                @if (watchedLongestTitle(); as wlt) {
                  <div class="stats__card">
                    <span class="stats__card-value" style="font-size: 0.75em">{{ wlt }}</span>
                    <span class="stats__card-label">Longest Title</span>
                  </div>
                }
                @if (watchlistAvgYear(); as way) {
                  <div class="stats__card">
                    <span class="stats__card-value">{{ way }}</span>
                    <span class="stats__card-label">Watchlist Avg Year</span>
                  </div>
                }
                @if (watchlistOldestYear(); as woy) {
                  <div class="stats__card">
                    <span class="stats__card-value">{{ woy }}</span>
                    <span class="stats__card-label">Oldest in Watchlist</span>
                  </div>
                }
                @if (watchlistIaStreamableCount(); as wiasc) {
                  <div class="stats__card">
                    <span class="stats__card-value">{{ wiasc }}</span>
                    <span class="stats__card-label">Watchlist on IA</span>
                  </div>
                }
                @if (favoritesAvgRating(); as far) {
                  <div class="stats__card">
                    <span class="stats__card-value">{{ far }}</span>
                    <span class="stats__card-label">Favorites Avg &#9733;</span>
                  </div>
                }
                @if (favoritesOldestYear()) {
                  <div class="stats__card">
                    <span class="stats__card-value">{{ favoritesOldestYear() }}</span>
                    <span class="stats__card-label">Oldest Favorite</span>
                  </div>
                }
                @if (favoritesIaStreamableCount(); as fiasc) {
                  <div class="stats__card">
                    <span class="stats__card-value">{{ fiasc }}</span>
                    <span class="stats__card-label">Favorites on IA</span>
                  </div>
                }
                @if (watchedLanguageCount(); as wlc) {
                  <div class="stats__card">
                    <span class="stats__card-value">{{ wlc }}</span>
                    <span class="stats__card-label">Languages Watched</span>
                  </div>
                }
                @if (watchedAvgGenreCount(); as wagc) {
                  <div class="stats__card">
                    <span class="stats__card-value">{{ wagc }}</span>
                    <span class="stats__card-label">Avg Genres/Film</span>
                  </div>
                }
                @if (watchlistStreamablePct(); as wsp) {
                  <div class="stats__card">
                    <span class="stats__card-value">{{ wsp }}%</span>
                    <span class="stats__card-label">Watchlist Streamable</span>
                  </div>
                }
                @if (watchedImdbLinkedCount(); as wilc) {
                  <div class="stats__card">
                    <span class="stats__card-value">{{ wilc }}</span>
                    <span class="stats__card-label">IMDb Linked</span>
                  </div>
                }
                @if (watchedPosterCoveragePct(); as wpcp) {
                  <div class="stats__card">
                    <span class="stats__card-value">{{ wpcp }}%</span>
                    <span class="stats__card-label">Have Poster</span>
                  </div>
                }
                @if (favoritesStreamablePct(); as fsp) {
                  <div class="stats__card">
                    <span class="stats__card-value">{{ fsp }}%</span>
                    <span class="stats__card-label">Favorites Free</span>
                  </div>
                }
                @if (watchedYtStreamableCount(); as wysc) {
                  <div class="stats__card">
                    <span class="stats__card-value">{{ wysc }}</span>
                    <span class="stats__card-label">On YouTube</span>
                  </div>
                }
                @if (watchedCoDirectedPct(); as wcdp) {
                  <div class="stats__card">
                    <span class="stats__card-value">{{ wcdp }}%</span>
                    <span class="stats__card-label">Co-Directed</span>
                  </div>
                }
                @if (watchedShortestTitle(); as wst) {
                  <div class="stats__card">
                    <span class="stats__card-value" style="font-size: 0.85em">{{ wst }}</span>
                    <span class="stats__card-label">Shortest Title</span>
                  </div>
                }
                @if (watchedNewestYear()) {
                  <div class="stats__card">
                    <span class="stats__card-value">{{ watchedNewestYear() }}</span>
                    <span class="stats__card-label">Newest Watched</span>
                  </div>
                }
                @if (watchedHighlyRatedCount() > 0) {
                  <div class="stats__card">
                    <span class="stats__card-value">{{ watchedHighlyRatedCount() }}</span>
                    <span class="stats__card-label">Rated 8.0+</span>
                  </div>
                }
                @if (watchedAvgDirectorCount(); as wadc) {
                  <div class="stats__card">
                    <span class="stats__card-value">{{ wadc }}</span>
                    <span class="stats__card-label">Avg Directors/Film</span>
                  </div>
                }
                @if (watchedPreWarCount()) {
                  <div class="stats__card">
                    <span class="stats__card-value">{{ watchedPreWarCount() }}</span>
                    <span class="stats__card-label">Pre-1940 Watched</span>
                  </div>
                }
                @if (watchedOldestYear()) {
                  <div class="stats__card">
                    <span class="stats__card-value">{{ watchedOldestYear() }}</span>
                    <span class="stats__card-label">Oldest Watched</span>
                  </div>
                }
                @if (watchedStreamablePct(); as wsp) {
                  <div class="stats__card">
                    <span class="stats__card-value">{{ wsp }}%</span>
                    <span class="stats__card-label">Streamable</span>
                  </div>
                }
                @if (watchedRatingSpread(); as wrs) {
                  <div class="stats__card">
                    <span class="stats__card-value">{{ wrs }}</span>
                    <span class="stats__card-label">Rating Spread</span>
                  </div>
                }
                @if (watchedMedianRating(); as wmr) {
                  <div class="stats__card">
                    <span class="stats__card-value">{{ wmr }}</span>
                    <span class="stats__card-label">Median Rating</span>
                  </div>
                }
                @if (watchedDecadeCount() > 1) {
                  <div class="stats__card">
                    <span class="stats__card-value">{{ watchedDecadeCount() }}</span>
                    <span class="stats__card-label">Decades</span>
                  </div>
                }
                @if (watchedGenreCount() > 1) {
                  <div class="stats__card">
                    <span class="stats__card-value">{{ watchedGenreCount() }}</span>
                    <span class="stats__card-label">Genres</span>
                  </div>
                }
                @if (watchedTopDirector(); as wtd) {
                  <div class="stats__card">
                    <span class="stats__card-value" style="font-size: 0.85em">{{ wtd }}</span>
                    <span class="stats__card-label">Top Director</span>
                  </div>
                }
              </div>

              @if (nextMilestone(); as milestone) {
                <div class="stats__milestone">
                  <span class="stats__milestone-icon">{{ milestone.icon }}</span>
                  <div class="stats__milestone-info">
                    <span class="stats__milestone-name">{{ milestone.name }}</span>
                    <span class="stats__milestone-desc">{{ milestone.remaining }} more to go</span>
                  </div>
                  <div class="stats__milestone-bar-track">
                    <div class="stats__milestone-bar-fill" [style.width.%]="milestone.pct"></div>
                  </div>
                  <span class="stats__milestone-progress">{{ milestone.current }}/{{ milestone.target }}</span>
                </div>
              }

              @if (achievements().length > 0) {
                <section class="achievements">
                  <h3>Achievements</h3>
                  <div class="achievements__grid">
                    @for (badge of achievements(); track badge.id) {
                      <div class="achievements__badge" [class.achievements__badge--earned]="badge.earned">
                        <span class="achievements__icon">{{ badge.icon }}</span>
                        <span class="achievements__name">{{ badge.name }}</span>
                        <span class="achievements__desc">{{ badge.description }}</span>
                      </div>
                    }
                  </div>
                </section>
              }

              <section class="challenges">
                <h3>{{ monthlyChallenges().month }} Challenges</h3>
                <div class="challenges__grid">
                  @for (ch of monthlyChallenges().challenges; track ch.id) {
                    <div class="challenges__card" [class.challenges__card--done]="ch.current >= ch.target">
                      <span class="challenges__icon">{{ ch.icon }}</span>
                      <div class="challenges__info">
                        <span class="challenges__name">{{ ch.name }}</span>
                        <span class="challenges__desc">{{ ch.description }}</span>
                        <div class="challenges__bar-track">
                          <div class="challenges__bar-fill" [style.width.%]="(ch.current / ch.target) * 100"></div>
                        </div>
                        <span class="challenges__progress">{{ ch.current }}/{{ ch.target }}</span>
                      </div>
                    </div>
                  }
                </div>
              </section>

              @if (directorStats().length > 0) {
                <section class="stats__section">
                  <h3>Top Directors</h3>
                  <div class="stats__bars">
                    @for (d of directorStats(); track d.name) {
                      <div class="stats__bar-row">
                        <a class="stats__bar-label stats__bar-label--link" [routerLink]="['/director', d.name]">{{ d.name }}</a>
                        <div class="stats__bar-track">
                          <div class="stats__bar-fill" [style.width.%]="d.pct"></div>
                        </div>
                        <span class="stats__bar-count">{{ d.count }}</span>
                      </div>
                    }
                  </div>
                </section>
              }

              <div class="stats__sections">
                <section class="stats__section">
                  <h3>Top Genres</h3>
                  <div class="stats__bars">
                    @for (g of genreStats(); track g.name) {
                      <a class="stats__bar-row" [routerLink]="['/genre', g.name]">
                        <span class="stats__bar-label stats__bar-label--link">{{ g.name }}</span>
                        <div class="stats__bar-track">
                          <div class="stats__bar-fill" [style.width.%]="g.pct"></div>
                        </div>
                        <span class="stats__bar-count">{{ g.count }}</span>
                      </a>
                    }
                  </div>
                </section>

                <section class="stats__section">
                  <h3>By Decade</h3>
                  <div class="stats__bars">
                    @for (d of decadeStats(); track d.name) {
                      <a class="stats__bar-row" [routerLink]="['/decade', d.name.replace('s', '')]">
                        <span class="stats__bar-label stats__bar-label--link">{{ d.name }}</span>
                        <div class="stats__bar-track">
                          <div class="stats__bar-fill" [style.width.%]="d.pct"></div>
                        </div>
                        <span class="stats__bar-count">{{ d.count }}</span>
                      </a>
                    }
                  </div>
                </section>
              </div>

              @if (languageStats().length > 1) {
                <section class="stats__section stats__lang-section">
                  <h3>Languages</h3>
                  <div class="stats__bars">
                    @for (l of languageStats(); track l.name) {
                      <div class="stats__bar-row">
                        <span class="stats__bar-label">{{ l.name }}</span>
                        <div class="stats__bar-track">
                          <div class="stats__bar-fill" [style.width.%]="l.pct"></div>
                        </div>
                        <span class="stats__bar-count">{{ l.count }}</span>
                      </div>
                    }
                  </div>
                </section>
              }

              @if (ratingDistribution().length > 0) {
                <section class="stats__section stats__rating-dist">
                  <h3>Your Rating Distribution</h3>
                  <div class="stats__bars">
                    @for (r of ratingDistribution(); track r.name) {
                      <div class="stats__bar-row">
                        <span class="stats__bar-label">{{ r.name }} &#9733;</span>
                        <div class="stats__bar-track">
                          <div class="stats__bar-fill" [style.width.%]="r.pct"></div>
                        </div>
                        <span class="stats__bar-count">{{ r.count }}</span>
                      </div>
                    }
                  </div>
                </section>
              }

              @if (monthlyTrends().length > 1) {
                <section class="stats__section stats__trends">
                  <h3>Monthly Activity</h3>
                  <div class="stats__trend-chart">
                    @for (m of monthlyTrends(); track m.label) {
                      <div class="stats__trend-col">
                        <span class="stats__trend-count">{{ m.count }}</span>
                        <div class="stats__trend-bar" [style.height.%]="m.pct"></div>
                        <span class="stats__trend-label">{{ m.label }}</span>
                      </div>
                    }
                  </div>
                </section>
              }

              @if (watchHeatmap().weeks.length > 0) {
                <section class="heatmap">
                  <div class="heatmap__header">
                    <h3>Watch Calendar</h3>
                    @if (heatmapYears().length > 1) {
                      <div class="heatmap__years">
                        <button
                          class="heatmap__year-btn"
                          [class.heatmap__year-btn--active]="heatmapYear() === null"
                          (click)="heatmapYear.set(null)"
                        >Last 12mo</button>
                        @for (yr of heatmapYears(); track yr) {
                          <button
                            class="heatmap__year-btn"
                            [class.heatmap__year-btn--active]="heatmapYear() === yr"
                            (click)="heatmapYear.set(yr)"
                          >{{ yr }}</button>
                        }
                      </div>
                    }
                  </div>
                  <div class="heatmap__scroll">
                    <div class="heatmap__grid">
                      @for (week of watchHeatmap().weeks; track $index) {
                        <div class="heatmap__col">
                          @for (day of week.days; track day.date) {
                            <div
                              class="heatmap__cell"
                              [class.heatmap__cell--l1]="day.level === 1"
                              [class.heatmap__cell--l2]="day.level === 2"
                              [class.heatmap__cell--l3]="day.level === 3"
                              [class.heatmap__cell--future]="day.level === -1"
                              [title]="day.count >= 0 ? day.date + ': ' + day.count + ' film(s)' : ''"
                            ></div>
                          }
                        </div>
                      }
                    </div>
                    <div class="heatmap__legend">
                      <span>Less</span>
                      <div class="heatmap__cell heatmap__cell--l0"></div>
                      <div class="heatmap__cell heatmap__cell--l1"></div>
                      <div class="heatmap__cell heatmap__cell--l2"></div>
                      <div class="heatmap__cell heatmap__cell--l3"></div>
                      <span>More</span>
                    </div>
                  </div>
                </section>
              }

              @if (filmTimeline().length > 1) {
                <section class="film-tl">
                  <h3>Your Films Through Time</h3>
                  <div class="film-tl__scroll">
                    <div class="film-tl__track">
                      <div class="film-tl__line"></div>
                      @for (pt of filmTimeline(); track pt.year) {
                        <div class="film-tl__point" [style.left.%]="pt.pct">
                          <div class="film-tl__marker" [style.height.px]="8 + pt.count * 6" [title]="pt.year + ': ' + pt.count + ' film(s)'"></div>
                          <span class="film-tl__year">{{ pt.year }}</span>
                        </div>
                      }
                    </div>
                  </div>
                </section>
              }

              @if (discoveryGaps().length > 0) {
                <section class="gaps">
                  <h3>Discovery Gaps</h3>
                  <p class="gaps__desc">Genres and decades you haven't explored yet</p>
                  <div class="gaps__grid">
                    @for (gap of discoveryGaps(); track gap.label) {
                      <a class="gaps__chip" [routerLink]="gap.link">
                        <span class="gaps__chip-label">{{ gap.label }}</span>
                        <span class="gaps__chip-count">{{ gap.count }} films</span>
                      </a>
                    }
                  </div>
                </section>
              }

              @if (viewingInsights().length > 0) {
                <section class="insights">
                  <h3>Viewing Insights</h3>
                  <div class="insights__grid">
                    @for (insight of viewingInsights(); track insight.label) {
                      <div class="insights__card">
                        <span class="insights__value">{{ insight.value }}</span>
                        <span class="insights__label">{{ insight.label }}</span>
                      </div>
                    }
                  </div>
                </section>
              }

              @if (watchTimeline().length > 0) {
                <section class="timeline">
                  <h3>Watch History</h3>
                  <div class="timeline__list">
                    @for (entry of watchTimeline(); track entry.movieId) {
                      <div class="timeline__item">
                        <div class="timeline__dot"></div>
                        <div class="timeline__content">
                          <a class="timeline__title" [routerLink]="['/movie', entry.movieId]">{{ entry.title }}</a>
                          <span class="timeline__date">{{ entry.dateLabel }}</span>
                          @if (entry.rating) {
                            <span class="timeline__rating">&#9733; {{ entry.rating }}/10</span>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </section>
              }
            }
          </div>
        }
      }
      }
      }
    </div>
  `,
  styles: [`
    .collection { padding: var(--space-xl) 0; }
    .collection__shared-info {
      color: var(--text-secondary);
      margin: 0 0 var(--space-xl);
    }
    .collection__controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--space-md);
      margin-bottom: var(--space-xl);
    }
    .collection__title-row { display: flex; align-items: baseline; justify-content: space-between; }
    .collection__wrapped-link { font: 600 0.85rem var(--font-body); color: var(--accent-gold); }
    .collection__tabs {
      display: flex;
      gap: 2px;
      background: var(--bg-surface);
      border-radius: var(--radius-lg);
      padding: 4px;
      width: fit-content;
    }
    .collection__tab {
      background: none;
      border: none;
      color: var(--text-tertiary);
      font-size: 0.95rem;
      font-weight: 600;
      padding: var(--space-sm) var(--space-xl);
      cursor: pointer;
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      min-height: 44px;
    }
    .collection__tab:hover { color: var(--text-primary); }
    .collection__tab--active { color: var(--accent-gold); background: var(--bg-raised); }
    .collection__count {
      font-size: 0.75rem;
      background: var(--accent-gold-dim);
      color: var(--accent-gold);
      padding: 1px 8px;
      border-radius: 10px;
    }
    .collection__new-dot {
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgb(25, 135, 84);
      vertical-align: super;
    }
    .collection__actions { display: flex; gap: var(--space-sm); align-items: center; }
    .collection__sort {
      min-width: 160px;
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius-lg);
      background: var(--bg-surface);
    }
    .collection__export { display: inline-flex; align-items: center; gap: 6px; font-size: 0.85rem; }
    .collection__import-label, .collection__restore-label { cursor: pointer; }
    .collection__search {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-sm);
      width: 100%;
    }
    .collection__search-input, .playlists__input {
      flex: 1;
      max-width: 320px;
      padding: var(--space-sm) var(--space-md);
      background: var(--bg-surface);
      color: var(--text-primary);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      font-size: 0.9rem;
    }
    .collection__search-input:focus, .playlists__input:focus {
      border-color: var(--accent-gold);
      outline: none;
    }
    .collection__filter-select, .collection__rating-filter {
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius-lg);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      color: var(--text-primary);
      font-size: 0.85rem;
      min-width: 120px;
    }
    .collection__empty {
      text-align: center;
      padding: var(--space-3xl) var(--space-lg);
    }
    .collection__empty-title { font-family: var(--font-heading); font-size: 1.3rem; margin: 0 0 var(--space-sm); }
    .collection__empty-text { color: var(--text-tertiary); margin: 0 0 var(--space-lg); }

    /* Stats */
    .stats__overview {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: var(--space-md);
      margin-bottom: var(--space-2xl);
    }
    .stats__card, .insights__card, .achievements__badge, .challenges__card, .playlists__card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-md);
    }
    .stats__card { padding: var(--space-lg); text-align: center; }
    .stats__card--highlight, .achievements__badge--earned, .challenges__card--done {
      border-color: var(--accent-gold);
      background: var(--accent-gold-dim);
    }
    .stats__card-value, .insights__value {
      display: block;
      font-family: var(--font-heading);
      font-weight: 700;
      color: var(--accent-gold);
      margin-bottom: 4px;
    }
    .stats__card-value { font-size: 2rem; }
    .stats__card-label, .insights__label {
      font-size: 0.8rem;
      text-transform: uppercase;
      color: var(--text-tertiary);
    }
    .stats__sections {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-xl);
    }
    .stats__section h3, .achievements h3, .challenges h3 { margin-bottom: var(--space-md); }
    .stats__bars {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }
    .stats__bar-row, .playlists__header { display: flex; align-items: center; gap: var(--space-sm); }
    .stats__bar-label { min-width: 80px; font-size: 0.85rem; color: var(--text-secondary); text-align: right; }
    .stats__bar-track, .stats__milestone-bar-track, .challenges__bar-track {
      height: 8px;
      background: var(--bg-raised);
      border-radius: 4px;
    }
    .stats__bar-fill, .stats__milestone-bar-fill, .challenges__bar-fill {
      height: 100%;
      background: var(--accent-gold);
    }
    .stats__bar-track { flex: 1; }
    .stats__bar-count {
      min-width: 24px;
      font-size: 0.8rem;
      color: var(--text-tertiary);
    }
    .stats__bar-label--link { text-decoration: none; color: inherit; }
    .stats__bar-label--link:hover { color: var(--accent-gold); }

    .collection__backup, .playlists__create { display: flex; gap: var(--space-sm); }
    .collection__backup { margin-bottom: var(--space-md); }
    .collection__backup-btn { font-size: 0.8rem; padding: var(--space-xs) var(--space-md); }
    .collection__restore-label { display: inline-flex; align-items: center; }
    .stats__lang-section, .stats__rating-dist {
      margin-top: var(--space-xl);
      max-width: 500px;
    }
    .stats__milestone {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-md) var(--space-lg);
      background: var(--accent-gold-dim);
      border: 1px solid var(--accent-gold);
      border-radius: var(--radius-lg);
      margin-bottom: var(--space-xl);
    }
    .stats__milestone-icon, .challenges__icon { font-size: 1.5rem; flex-shrink: 0; }
    .stats__milestone-info, .challenges__info { flex: 1; min-width: 0; }
    .stats__milestone-name, .challenges__name { display: block; font-weight: 700; font-size: 0.9rem; }
    .stats__milestone-desc, .challenges__desc { display: block; font-size: 0.75rem; }
    .stats__milestone-desc { color: var(--text-secondary); }
    .challenges__desc { color: var(--text-tertiary); }
    .stats__milestone-bar-track { width: 80px; height: 6px; }
    .stats__milestone-progress, .challenges__progress {
      font-size: 0.75rem;
      color: var(--text-tertiary);
    }
    .stats__milestone-progress { font-weight: 600; white-space: nowrap; }
    .achievements__grid, .challenges__grid {
      display: grid;
      gap: var(--space-sm);
    }
    .achievements__grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
    .achievements__badge { text-align: center; opacity: 0.35; }
    .achievements__badge--earned { opacity: 1; }
    .achievements__icon { font-size: 1.8rem; margin-bottom: var(--space-xs); }
    .achievements__name { font-size: 0.85rem; font-weight: 700; margin-bottom: 2px; }
    .achievements__desc { font-size: 0.7rem; color: var(--text-tertiary); }
    .stats__trends { margin-top: var(--space-xl); }
    .stats__trend-chart {
      display: flex;
      gap: var(--space-xs);
      align-items: flex-end;
      height: 160px;
    }
    .stats__trend-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      justify-content: flex-end;
    }
    .stats__trend-count { font-size: 0.7rem; }
    .stats__trend-bar {
      width: 100%;
      max-width: 40px;
      min-height: 4px;
      background: var(--accent-gold);
      border-radius: 3px 3px 0 0;
    }
    .stats__trend-label { font-size: 0.65rem; color: var(--text-tertiary); white-space: nowrap; }
    /* Playlists */
    .playlists__create { margin-bottom: var(--space-xl); }
    .playlists__input { font-size: 0.95rem; }
    .playlists__card {
      margin-bottom: var(--space-md);
    }
    .playlists__header { gap: var(--space-md); margin-bottom: var(--space-sm); }
    .playlists__name { font-size: 1.1rem; margin: 0; cursor: pointer; }
    .playlists__name:hover { color: var(--accent-gold); }
    .playlists__rename-input {
      font: 700 1.1rem var(--font-body);
      background: var(--bg-raised);
      border: 1px solid var(--accent-gold);
      border-radius: var(--radius);
      padding: 2px 8px;
    }
    .playlists__count { font-size: 0.8rem; color: var(--text-tertiary); }
    .playlists__delete { margin-left: auto; color: var(--text-tertiary); width: 36px; height: 36px; padding: 0; display: flex; align-items: center; justify-content: center; }
    .playlists__delete:hover { color: #e53e3e; }
    .playlists__movies { display: flex; gap: var(--space-xs); overflow-x: auto; }
    .playlists__movie { flex: 0 0 60px; }
    .playlists__movie img { width: 60px; aspect-ratio: 2 / 3; object-fit: cover; border-radius: var(--radius-sm); }
    .playlists__movie-placeholder {
      width: 60px;
      aspect-ratio: 2 / 3;
      background: var(--bg-raised);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-tertiary);
    }
    /* Challenges */
    .challenges, .achievements { margin-bottom: var(--space-xl); }
    .challenges__grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
    .challenges__card {
      display: flex;
      gap: var(--space-md);
      align-items: flex-start;
    }
    .challenges__name { margin-bottom: 2px; }
    .challenges__desc { margin-bottom: var(--space-xs); }
    .challenges__bar-track { height: 6px; }
    .challenges__progress { font-size: 0.7rem; }
    /* Heatmap */
    .heatmap__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--space-sm);
      margin-bottom: var(--space-md);
    }
    .heatmap__header h3 { margin: 0; }
    .heatmap__years {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }
    .heatmap__year-btn {
      padding: 3px 10px;
      border-radius: 12px;
      background: var(--bg-raised);
      border: 1px solid transparent;
      color: var(--text-tertiary);
      font: 600 0.75rem var(--font-body);
      cursor: pointer;
    }
    .heatmap__year-btn:hover, .heatmap__year-btn--active { color: var(--accent-gold); border-color: var(--accent-gold); }
    .heatmap__year-btn--active { background: var(--accent-gold-dim); }
    .heatmap, .film-tl, .timeline { margin-top: var(--space-2xl); }
    .heatmap h3 { margin-bottom: 0; }
    .heatmap__scroll, .film-tl__scroll {
      overflow-x: auto;
    }
    .heatmap__grid, .heatmap__col { display: flex; gap: 2px; }
    .heatmap__col { flex-direction: column; }
    .heatmap__cell { width: 12px; height: 12px; border-radius: 2px; background: var(--bg-raised); }
    .heatmap__cell--l1 { background: rgba(212, 175, 55, 0.3); }
    .heatmap__cell--l2 { background: rgba(212, 175, 55, 0.6); }
    .heatmap__cell--l3 { background: var(--accent-gold); }
    .heatmap__cell--future { background: transparent; }
    .heatmap__legend {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: var(--space-sm);
      justify-content: flex-end;
      font-size: 0.65rem;
      color: var(--text-tertiary);
    }
    .heatmap__legend .heatmap__cell { width: 10px; height: 10px; }
    .film-tl h3, .timeline h3 { margin-bottom: var(--space-lg); }
    .film-tl__scroll { padding-bottom: var(--space-md); }
    .film-tl__track {
      position: relative;
      min-width: min(600px, 100%);
      height: 80px;
      margin: 0 var(--space-md);
    }
    .film-tl__line { position: absolute; top: 50%; left: 0; right: 0; height: 2px; background: var(--border); }
    .film-tl__point { position: absolute; top: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; }
    .film-tl__marker { width: 8px; background: var(--accent-gold); border-radius: 4px; margin-bottom: 4px; }
    .film-tl__year { font-size: 0.65rem; color: var(--text-tertiary); white-space: nowrap; margin-top: 4px; }
    /* Watch Timeline */
    .timeline__list {
      position: relative;
      padding-left: var(--space-lg);
    }
    /* Discovery Gaps */
    .gaps { margin-top: var(--space-xl); }
    .gaps h3 { margin-bottom: var(--space-xs); }
    .gaps__desc {
      font-size: 0.85rem;
      color: var(--text-tertiary);
      margin: 0 0 var(--space-md);
    }
    .gaps__grid {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-sm);
    }
    .gaps__chip {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      padding: var(--space-sm) var(--space-md);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      text-decoration: none;
      color: var(--text-secondary);
    }
    .gaps__chip:hover { border-color: var(--accent-gold); color: var(--accent-gold); }
    .gaps__chip-label { font-size: 0.85rem; font-weight: 600; }
    .gaps__chip-count { font-size: 0.7rem; color: var(--text-tertiary); }
    .insights { margin-top: var(--space-xl); }
    .insights__grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: var(--space-md);
      margin-top: var(--space-md);
    }
    .insights__card { text-align: center; }
    .insights__value { font-size: 1.2rem; }
    .insights__label { font-size: 0.75rem; }
    .timeline__list::before {
      content: '';
      position: absolute;
      left: 6px;
      top: 4px;
      bottom: 4px;
      width: 2px;
      background: var(--border);
    }
    .timeline__item { position: relative; display: flex; gap: var(--space-md); padding-bottom: var(--space-md); }
    .timeline__dot {
      position: absolute;
      left: calc(-1 * var(--space-lg) + 2px);
      top: 4px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--accent-gold);
      border: 2px solid var(--bg-deep);
    }
    .timeline__content { display: flex; flex-direction: column; gap: 2px; }
    .timeline__title { color: var(--text-primary); font-weight: 600; font-size: 0.95rem; text-decoration: none; }
    .timeline__title:hover { color: var(--accent-gold); }
    .timeline__date { font-size: 0.8rem; color: var(--text-tertiary); }
    .timeline__rating { font-size: 0.8rem; color: var(--accent-gold); }
    @media (max-width: 768px) {
      .collection__controls {
        flex-direction: column;
        align-items: flex-start;
      }
      .stats__sections {
        grid-template-columns: 1fr;
      }
      .stats__overview {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (max-width: 480px) {
      .collection__tabs {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        white-space: nowrap;
        max-width: 100%;
        scrollbar-width: none;
      }
      .collection__tabs::-webkit-scrollbar { display: none; }
      .collection__tabs {
        mask-image: linear-gradient(to right, transparent 0, #000 8px, #000 calc(100% - 24px), transparent 100%);
        -webkit-mask-image: linear-gradient(to right, transparent 0, #000 8px, #000 calc(100% - 24px), transparent 100%);
      }
      .collection__tab {
        flex-shrink: 0;
        padding: var(--space-sm) var(--space-md);
        font-size: 0.85rem;
      }
      .stats__overview {
        grid-template-columns: repeat(2, 1fr);
        gap: var(--space-sm);
      }
      .stats__overview .stats__card {
        padding: var(--space-md);
      }
      .collection__actions {
        flex-wrap: wrap;
      }
      .challenges__grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class CollectionComponent implements OnInit {
  protected readonly catalog = inject(CatalogService);
  protected readonly collectionService = inject(CollectionService);
  private readonly notifications = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);

  readonly currentYear = new Date().getFullYear();
  readonly isSharedView = signal(false);
  readonly sharedMovies = signal<MovieSummary[]>([]);

  readonly activeTab = signal<'watchlist' | 'watched' | 'favorites' | 'playlists' | 'stats'>('watchlist');
  readonly sortBy = signal<SortOption>('added-desc');
  readonly viewMode = signal<ViewMode>('grid');
  readonly collectionQuery = signal('');
  readonly genreFilter = signal('');
  readonly decadeFilter = signal('');
  readonly ratingFilter = signal<number>(0);
  readonly heatmapYear = signal<number | null>(null);

  readonly watchlistMovies = computed(() => {
    const ids = this.collectionService.watchlistIds();
    return this.catalog.movies().filter((m) => ids.has(m.id));
  });

  readonly watchedMovies = computed(() => {
    const ids = this.collectionService.watchedIds();
    return this.catalog.movies().filter((m) => ids.has(m.id));
  });

  readonly currentMovies = computed(() =>
    this.activeTab() === 'watchlist' ? this.watchlistMovies() : this.watchedMovies()
  );

  readonly favoriteMovies = computed(() => {
    const ids = this.collectionService.favoriteIds();
    return this.catalog.movies().filter((m) => ids.has(m.id));
  });

  readonly collectionGenres = computed(() => {
    const all = [...this.watchlistMovies(), ...this.watchedMovies(), ...this.favoriteMovies()];
    const genres = new Set<string>();
    for (const m of all) for (const g of m.genres) genres.add(g);
    return [...genres].sort();
  });

  readonly collectionDecades = computed(() => {
    const all = [...this.watchlistMovies(), ...this.watchedMovies(), ...this.favoriteMovies()];
    const decades = new Set<number>();
    for (const m of all) decades.add(Math.floor(m.year / 10) * 10);
    return [...decades].sort();
  });

  readonly sortedWatchlist = computed(() => this.applyFilters(this.applyQuery(this.sortMovies(this.watchlistMovies(), 'watchlist'))));
  readonly sortedWatched = computed(() => this.applyRatingFilter(this.applyFilters(this.applyQuery(this.sortMovies(this.watchedMovies(), 'watched')))));
  readonly sortedFavorites = computed(() => {
    const sort = this.sortBy();
    const movies = [...this.favoriteMovies()];
    const sorted = movies.sort((a, b) => {
      switch (sort) {
        case 'title-asc': return a.title.localeCompare(b.title);
        case 'title-desc': return b.title.localeCompare(a.title);
        case 'rating-desc': return b.voteAverage - a.voteAverage;
        case 'year-desc': return b.year - a.year;
        default: return 0;
      }
    });
    return this.applyFilters(this.applyQuery(sorted));
  });

  // ── Single-pass watched movie index ──────────────────────────────
  private readonly watchIdx = computed(() => {
    const films = this.watchedMovies();
    const n = films.length;
    const now = new Date().getFullYear();

    let ratingSum = 0, ratedCount = 0, ageSum = 0, yearSum = 0;
    let titleLenSum = 0, genreLenSum = 0, dirLenSum = 0;
    let streamable = 0, coDirected = 0, nonEnglish = 0, silentEra = 0, preWar = 0;
    let highlyRated8 = 0, yt = 0, imdb = 0, poster = 0;
    let minYear = Infinity, maxYear = -Infinity;
    let shortestTitle = '', longestTitle = '';
    let bestRated: typeof films[0] | null = null;
    const genreSet = new Set<string>();
    const decadeSet = new Set<number>();
    const langSet = new Set<string>();
    const dirCounts = new Map<string, number>();
    const ratings: number[] = [];

    for (const m of films) {
      ageSum += now - m.year;
      yearSum += m.year;
      titleLenSum += m.title.length;
      genreLenSum += m.genres.length;
      dirLenSum += m.directors.length;
      if (m.isStreamable) streamable++;
      if (m.directors.length > 1) coDirected++;
      if (m.language && m.language !== 'English' && m.language !== 'en') nonEnglish++;
      if (m.year < 1930) silentEra++;
      if (m.year < 1940) preWar++;
      if (m.youtubeId) yt++;
      if (m.imdbId) imdb++;
      if (m.posterUrl) poster++;
      if (m.language) langSet.add(m.language);
      decadeSet.add(Math.floor(m.year / 10) * 10);
      for (const g of m.genres) genreSet.add(g);
      for (const d of m.directors) dirCounts.set(d, (dirCounts.get(d) ?? 0) + 1);
      if (m.year < minYear) { minYear = m.year; }
      if (m.year > maxYear) { maxYear = m.year; }
      if (!shortestTitle || m.title.length < shortestTitle.length) shortestTitle = m.title;
      if (!longestTitle || m.title.length > longestTitle.length) longestTitle = m.title;
      if (m.voteAverage > 0) {
        ratingSum += m.voteAverage;
        ratedCount++;
        ratings.push(m.voteAverage);
        if (m.voteAverage >= 8.0) highlyRated8++;
        if (!bestRated || m.voteAverage > bestRated.voteAverage) bestRated = m;
      }
    }

    ratings.sort((a, b) => a - b);
    const years = films.map((m) => m.year).sort((a, b) => a - b);
    const sortedDirs = [...dirCounts.entries()].sort((a, b) => b[1] - a[1]);

    return {
      n, now, ratingSum, ratedCount, ageSum, yearSum,
      titleLenSum, genreLenSum, dirLenSum,
      streamable, coDirected, nonEnglish, silentEra, preWar,
      highlyRated8, yt, imdb, poster,
      minYear, maxYear, shortestTitle, longestTitle, bestRated,
      genreSet, decadeSet, langSet, dirCounts, sortedDirs,
      ratings, years,
    };
  });

  // Stats
  readonly avgRating = computed(() => {
    const items = this.collectionService.watched().filter((w) => w.userRating != null);
    if (items.length === 0) return '—';
    const avg = items.reduce((sum, w) => sum + (w.userRating ?? 0), 0) / items.length;
    return avg.toFixed(1);
  });

  readonly avgTmdbRating = computed(() => {
    const { ratedCount, ratingSum } = this.watchIdx();
    if (ratedCount === 0) return '—';
    return (ratingSum / ratedCount).toFixed(1);
  });

  readonly totalDecades = computed(() => this.watchIdx().decadeSet.size);

  readonly uniqueLanguages = computed(() => this.watchIdx().langSet.size);

  readonly watchedThisYear = computed(() => {
    const yearStart = new Date(new Date().getFullYear(), 0, 1).getTime();
    return this.collectionService.watched().filter((w) => w.watchedAt >= yearStart).length;
  });

  readonly newThisWeek = computed(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return this.collectionService.watchlist().filter((w) => w.addedAt >= weekAgo).length;
  });

  readonly achievements = computed(() => {
    const { n: watchedCount, decadeSet: decades, genreSet: genres, silentEra: silentCount, streamable: streamedCount } = this.watchIdx();
    const favCount = this.collectionService.favorites().length;
    const ratedCount = this.collectionService.watched().filter((w) => w.userRating != null).length;
    const { longest } = this.streaks();

    return [
      { id: 'first', icon: '🎬', name: 'First Film', description: 'Watch your first film', earned: watchedCount >= 1 },
      { id: 'ten', icon: '🎞️', name: 'Film Buff', description: 'Watch 10 films', earned: watchedCount >= 10 },
      { id: 'twentyfive', icon: '📽️', name: 'Cinephile', description: 'Watch 25 films', earned: watchedCount >= 25 },
      { id: 'fifty', icon: '🏆', name: 'Film Scholar', description: 'Watch 50 films', earned: watchedCount >= 50 },
      { id: 'hundred', icon: '👑', name: 'Film Historian', description: 'Watch 100 films', earned: watchedCount >= 100 },
      { id: 'decades3', icon: '📅', name: 'Time Traveler', description: 'Watch films from 3+ decades', earned: decades.size >= 3 },
      { id: 'decades5', icon: '⏳', name: 'Era Explorer', description: 'Watch films from 5+ decades', earned: decades.size >= 5 },
      { id: 'genres5', icon: '🎭', name: 'Genre Hopper', description: 'Watch films in 5+ genres', earned: genres.size >= 5 },
      { id: 'silent', icon: '🤫', name: 'Silent Era Fan', description: 'Watch 3 films from before 1930', earned: silentCount >= 3 },
      { id: 'stream5', icon: '📺', name: 'Free Spirit', description: 'Watch 5 free films', earned: streamedCount >= 5 },
      { id: 'fav5', icon: '❤️', name: 'Curator', description: 'Favorite 5 films', earned: favCount >= 5 },
      { id: 'rate10', icon: '⭐', name: 'Critic', description: 'Rate 10 films', earned: ratedCount >= 10 },
      { id: 'streak7', icon: '🔥', name: 'On Fire', description: '7-day watch streak', earned: longest >= 7 },
    ];
  });

  readonly nextMilestone = computed(() => {
    const badges = this.achievements();
    const unearned = badges.filter((b) => !b.earned);
    if (unearned.length === 0) return null;

    const { n: watchedCount, decadeSet: decades, genreSet: genres, silentEra: silentCount, streamable: streamedCount } = this.watchIdx();
    const favCount = this.collectionService.favorites().length;
    const ratedCount = this.collectionService.watched().filter((w) => w.userRating != null).length;
    const { longest } = this.streaks();

    const targets: Record<string, { current: number; target: number }> = {
      first: { current: watchedCount, target: 1 },
      ten: { current: watchedCount, target: 10 },
      twentyfive: { current: watchedCount, target: 25 },
      fifty: { current: watchedCount, target: 50 },
      hundred: { current: watchedCount, target: 100 },
      decades3: { current: decades.size, target: 3 },
      decades5: { current: decades.size, target: 5 },
      genres5: { current: genres.size, target: 5 },
      silent: { current: silentCount, target: 3 },
      stream5: { current: streamedCount, target: 5 },
      fav5: { current: favCount, target: 5 },
      rate10: { current: ratedCount, target: 10 },
      streak7: { current: longest, target: 7 },
    };

    // Find closest unearned badge
    let closest: { icon: string; name: string; current: number; target: number; remaining: number; pct: number } | null = null;
    for (const badge of unearned) {
      const t = targets[badge.id];
      if (!t) continue;
      const remaining = t.target - t.current;
      const pct = Math.round((t.current / t.target) * 100);
      if (!closest || remaining < closest.remaining) {
        closest = { icon: badge.icon, name: badge.name, current: t.current, target: t.target, remaining, pct };
      }
    }
    return closest;
  });

  readonly currentStreak = computed(() => this.streaks().current);
  readonly longestStreak = computed(() => this.streaks().longest);

  readonly watchedAvgFilmAge = computed(() => {
    const { n, ageSum } = this.watchIdx();
    return n < 2 ? 0 : Math.round(ageSum / n);
  });

  readonly watchedDirectorCount = computed(() => {
    const { n, dirCounts } = this.watchIdx();
    return n < 2 ? 0 : dirCounts.size;
  });

  readonly watchedNonEnglishCount = computed(() => {
    const { n, nonEnglish } = this.watchIdx();
    return n < 2 ? 0 : nonEnglish;
  });

  readonly watchedSilentEraCount = computed(() => {
    const { n, silentEra } = this.watchIdx();
    return n < 2 ? 0 : silentEra;
  });

  readonly watchedMedianYear = computed(() => {
    const { n, years } = this.watchIdx();
    if (n < 5) return null;
    const mid = Math.floor(years.length / 2);
    return years.length % 2 === 0 ? Math.round((years[mid - 1] + years[mid]) / 2) : years[mid];
  });

  readonly watchedAvgYear = computed(() => {
    const { n, yearSum } = this.watchIdx();
    if (n < 5) return null;
    return Math.round(yearSum / n);
  });

  readonly watchedCoDirectedCount = computed(() => {
    const { n, coDirected } = this.watchIdx();
    return n < 2 ? 0 : coDirected;
  });

  readonly watchedAvgTitleLength = computed(() => {
    const { n, titleLenSum } = this.watchIdx();
    if (n < 5) return null;
    return Math.round(titleLenSum / n);
  });

  readonly watchedHighlyRatedCount = computed(() => this.watchIdx().highlyRated8);

  readonly watchedShortestTitle = computed(() => {
    const { n, shortestTitle } = this.watchIdx();
    if (n < 3) return null;
    return shortestTitle.length <= 15 ? shortestTitle : null;
  });

  readonly watchedStreamablePct = computed(() => {
    const { n, streamable } = this.watchIdx();
    if (n < 3) return null;
    const pct = Math.round((streamable / n) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });

  readonly watchedMedianRating = computed(() => {
    const { ratings } = this.watchIdx();
    if (ratings.length < 3) return null;
    const mid = Math.floor(ratings.length / 2);
    const median = ratings.length % 2 === 0 ? (ratings[mid - 1] + ratings[mid]) / 2 : ratings[mid];
    return median.toFixed(1);
  });

  readonly watchedDecadeCount = computed(() => this.watchIdx().decadeSet.size);

  readonly watchedGenreCount = computed(() => this.watchIdx().genreSet.size);

  readonly watchedTopDirector = computed(() => {
    const { n, sortedDirs } = this.watchIdx();
    if (n < 3) return null;
    const top = sortedDirs[0];
    return top && top[1] >= 2 ? top[0] : null;
  });

  readonly watchedLongestTitle = computed(() => {
    const { n, longestTitle } = this.watchIdx();
    if (n < 3) return null;
    return longestTitle.length >= 15 ? longestTitle : null;
  });

  readonly watchedRatingSpread = computed(() => {
    const { ratings } = this.watchIdx();
    if (ratings.length < 5) return null;
    const spread = ratings[ratings.length - 1] - ratings[0];
    return spread >= 2 ? spread.toFixed(1) : null;
  });

  readonly watchedPreWarCount = computed(() => {
    const { n, preWar } = this.watchIdx();
    if (n < 3) return null;
    return preWar >= 1 ? preWar : null;
  });

  readonly watchedAvgDirectorCount = computed(() => {
    const { n, dirLenSum } = this.watchIdx();
    if (n < 5) return null;
    const avg = dirLenSum / n;
    return avg >= 1.05 ? avg.toFixed(2) : null;
  });

  readonly watchedOldestYear = computed(() => {
    const { n, minYear } = this.watchIdx();
    return n < 2 ? null : minYear;
  });

  readonly watchedNewestYear = computed(() => {
    const { n, maxYear } = this.watchIdx();
    return n < 2 ? null : maxYear;
  });

  readonly favoritesAvgRating = computed(() => {
    const films = this.favoriteMovies();
    if (films.length < 2) return null;
    const rated = films.filter((m) => m.voteAverage > 0);
    if (rated.length < 2) return null;
    return (rated.reduce((s, m) => s + m.voteAverage, 0) / rated.length).toFixed(1);
  });

  readonly watchlistStreamablePct = computed(() => {
    const films = this.watchlistMovies();
    if (films.length < 3) return null;
    const pct = Math.round((films.filter((m) => m.isStreamable).length / films.length) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });

  readonly watchedImdbLinkedCount = computed(() => {
    const { n, imdb } = this.watchIdx();
    if (n < 3) return null;
    return imdb > 0 ? imdb : null;
  });

  readonly watchedPosterCoveragePct = computed(() => {
    const { n, poster } = this.watchIdx();
    if (n < 3) return null;
    const pct = Math.round((poster / n) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });

  readonly favoritesStreamablePct = computed(() => {
    const films = this.favoriteMovies();
    if (films.length < 3) return null;
    const pct = Math.round((films.filter((m) => m.isStreamable).length / films.length) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });

  readonly watchedYtStreamableCount = computed(() => {
    const { n, yt } = this.watchIdx();
    if (n < 3) return null;
    return yt > 0 ? yt : null;
  });

  readonly watchedAvgGenreCount = computed(() => {
    const { n, genreLenSum } = this.watchIdx();
    if (n < 5) return null;
    const avg = genreLenSum / n;
    return avg >= 1.5 ? avg.toFixed(1) : null;
  });

  readonly watchedLanguageCount = computed(() => {
    const { n, langSet } = this.watchIdx();
    if (n < 3) return null;
    return langSet.size >= 2 ? langSet.size : null;
  });

  readonly favoritesOldestYear = computed(() => {
    const films = this.favoriteMovies();
    if (films.length < 2) return null;
    return films.reduce((a, b) => a.year <= b.year ? a : b).year;
  });

  readonly watchlistOldestYear = computed(() => {
    const films = this.watchlistMovies();
    if (films.length < 2) return null;
    return films.reduce((a, b) => a.year <= b.year ? a : b).year;
  });

  readonly watchlistAvgYear = computed(() => {
    const films = this.watchlistMovies();
    if (films.length < 3) return null;
    return Math.round(films.reduce((s, m) => s + m.year, 0) / films.length);
  });

  readonly watchedCoDirectedPct = computed(() => {
    const { n, coDirected } = this.watchIdx();
    if (n < 5) return null;
    const pct = Math.round((coDirected / n) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });

  readonly favoritesIaStreamableCount = computed(() => {
    const films = this.favoriteMovies();
    if (films.length < 3) return null;
    const count = films.filter((m) => m.internetArchiveId).length;
    return count > 0 ? count : null;
  });

  readonly watchlistIaStreamableCount = computed(() => {
    const films = this.watchlistMovies();
    if (films.length < 3) return null;
    const count = films.filter((m) => m.internetArchiveId).length;
    return count > 0 ? count : null;
  });

  private readonly streaks = computed(() => this.computeStreaks());

  private computeStreaks(): { current: number; longest: number } {
    const watched = this.collectionService.watched();
    if (watched.length === 0) return { current: 0, longest: 0 };

    const daySet = new Set<string>();
    for (const w of watched) {
      const d = new Date(w.watchedAt);
      daySet.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    }

    const days = [...daySet].sort();
    if (days.length === 0) return { current: 0, longest: 0 };

    const toDate = (key: string) => {
      const [y, m, d] = key.split('-').map(Number);
      return new Date(y, m, d);
    };

    let longest = 1;
    let streak = 1;
    for (let i = 1; i < days.length; i++) {
      const prev = toDate(days[i - 1]);
      const curr = toDate(days[i]);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (Math.round(diff) === 1) {
        streak++;
        if (streak > longest) longest = streak;
      } else {
        streak = 1;
      }
    }

    // Check if current streak is still active (includes today or yesterday)
    const lastDay = toDate(days[days.length - 1]);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffFromToday = (today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24);
    const current = diffFromToday <= 1 ? streak : 0;

    return { current, longest };
  }

  readonly genreStats = computed(() => this.computeStats(
    this.watchedMovies().flatMap((m) => m.genres)
  ));

  readonly decadeStats = computed(() => this.computeStats(
    this.watchedMovies().map((m) => `${Math.floor(m.year / 10) * 10}s`)
  ));

  readonly languageStats = computed(() => {
    const movies = this.watchedMovies().filter((m) => m.language);
    if (movies.length < 3) return [];
    const LANG_NAMES: Record<string, string> = {
      en: 'English', fr: 'French', de: 'German', ja: 'Japanese', it: 'Italian',
      es: 'Spanish', ru: 'Russian', sv: 'Swedish', da: 'Danish', pt: 'Portuguese',
      nl: 'Dutch', zh: 'Chinese', ko: 'Korean', pl: 'Polish', cs: 'Czech',
      hu: 'Hungarian', fi: 'Finnish', el: 'Greek', ro: 'Romanian', tr: 'Turkish',
      ar: 'Arabic', hi: 'Hindi', no: 'Norwegian', nb: 'Norwegian',
    };
    const counts = new Map<string, number>();
    for (const m of movies) {
      const name = m.language ? (LANG_NAMES[m.language] ?? m.language.toUpperCase()) : 'Unknown';
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    const max = sorted[0]?.[1] ?? 1;
    return sorted.map(([name, count]) => ({ name, count, pct: (count / max) * 100 }));
  });

  readonly directorStats = computed(() => {
    const dirCounts = new Map<string, number>();
    for (const m of this.watchedMovies()) {
      for (const d of m.directors) dirCounts.set(d, (dirCounts.get(d) ?? 0) + 1);
    }
    const sorted = [...dirCounts.entries()]
      .filter(([, c]) => c >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    const max = sorted[0]?.[1] ?? 1;
    return sorted.map(([name, count]) => ({ name, count, pct: (count / max) * 100 }));
  });

  readonly ratingDistribution = computed(() => {
    const rated = this.collectionService.watched().filter((w) => w.userRating != null);
    if (rated.length === 0) return [];
    const buckets = new Map<number, number>();
    for (const w of rated) {
      const r = Math.round(w.userRating!);
      buckets.set(r, (buckets.get(r) ?? 0) + 1);
    }
    const max = Math.max(...buckets.values());
    return Array.from({ length: 10 }, (_, i) => i + 1)
      .map((r) => ({ name: String(r), count: buckets.get(r) ?? 0, pct: ((buckets.get(r) ?? 0) / max) * 100 }))
      .filter((r) => r.count > 0);
  });

  // Monthly trends
  readonly monthlyTrends = computed(() => {
    const watched = this.collectionService.watched();
    if (watched.length === 0) return [];
    const months = new Map<string, number>();
    for (const w of watched) {
      const d = new Date(w.watchedAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.set(key, (months.get(key) ?? 0) + 1);
    }
    const sorted = [...months.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-12);
    const max = Math.max(...sorted.map(([, c]) => c));
    return sorted.map(([key, count]) => {
      const [y, m] = key.split('-');
      const label = new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      return { label, count, pct: (count / max) * 100 };
    });
  });

  // Film timeline by release year
  readonly filmTimeline = computed(() => {
    const movies = this.watchedMovies();
    if (movies.length < 2) return [];
    const yearCounts = new Map<number, number>();
    for (const m of movies) yearCounts.set(m.year, (yearCounts.get(m.year) ?? 0) + 1);
    const years = [...yearCounts.keys()].sort((a, b) => a - b);
    const min = years[0];
    const max = years[years.length - 1];
    const range = max - min || 1;
    return years.map((year) => ({
      year,
      count: yearCounts.get(year)!,
      pct: ((year - min) / range) * 100,
    }));
  });

  // Monthly challenges
  readonly monthlyChallenges = computed(() => {
    const watched = this.collectionService.watched();
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const monthWatched = watched.filter((w) => {
      const d = new Date(w.watchedAt);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });
    const monthRated = monthWatched.filter((w) => w.userRating != null);
    const monthReviewed = monthWatched.filter((w) => w.review);
    const monthMovies = this.catalog.movies().filter(
      (m) => monthWatched.some((w) => w.movieId === m.id)
    );
    const monthDecades = new Set(monthMovies.map((m) => Math.floor(m.year / 10) * 10));
    const monthName = now.toLocaleDateString('en-US', { month: 'long' });

    return {
      month: monthName,
      challenges: [
        { id: 'watch5', name: 'Film Buff', description: `Watch 5 films in ${monthName}`, current: Math.min(monthWatched.length, 5), target: 5, icon: '🎬' },
        { id: 'rate3', name: 'Critic', description: `Rate 3 films in ${monthName}`, current: Math.min(monthRated.length, 3), target: 3, icon: '⭐' },
        { id: 'review1', name: 'Reviewer', description: `Write a review in ${monthName}`, current: Math.min(monthReviewed.length, 1), target: 1, icon: '✍️' },
        { id: 'decades2', name: 'Time Traveler', description: 'Watch from 2+ decades this month', current: Math.min(monthDecades.size, 2), target: 2, icon: '📅' },
      ],
    };
  });

  // Watch heatmap
  readonly heatmapYears = computed(() => {
    const years = new Set<number>();
    for (const w of this.collectionService.watched()) {
      years.add(new Date(w.watchedAt).getFullYear());
    }
    return [...years].sort((a, b) => b - a);
  });

  readonly watchHeatmap = computed(() => {
    const watched = this.collectionService.watched();
    if (watched.length === 0) return { weeks: [] as { days: { date: string; count: number; level: number }[] }[] };

    const selectedYear = this.heatmapYear();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const dayCounts = new Map<string, number>();
    for (const w of watched) {
      const d = new Date(w.watchedAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      dayCounts.set(key, (dayCounts.get(key) ?? 0) + 1);
    }

    let startDate: Date;
    let endDate: Date;
    if (selectedYear) {
      startDate = new Date(selectedYear, 0, 1);
      startDate.setDate(startDate.getDate() - startDate.getDay());
      endDate = new Date(selectedYear, 11, 31);
    } else {
      endDate = today;
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 364 - startDate.getDay());
    }

    const weeks: { days: { date: string; count: number; level: number }[] }[] = [];
    for (let w = 0; w < 53; w++) {
      const days: { date: string; count: number; level: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(cellDate.getDate() + w * 7 + d);
        const key = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, '0')}-${String(cellDate.getDate()).padStart(2, '0')}`;
        const count = dayCounts.get(key) ?? 0;
        const isFuture = cellDate > today;
        days.push({
          date: key,
          count: isFuture ? -1 : count,
          level: isFuture ? -1 : count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : 3,
        });
      }
      weeks.push({ days });
    }

    return { weeks };
  });

  // Playlists
  readonly newPlaylistName = signal('');
  readonly editingPlaylistId = signal<string | null>(null);
  readonly editPlaylistName = signal('');

  playlistMovies(playlistId: string): MovieSummary[] {
    const pl = this.collectionService.playlists().find((p) => p.id === playlistId);
    if (!pl) return [];
    const movies = this.catalog.movies();
    return pl.movieIds.map((id) => movies.find((m) => m.id === id)).filter((m): m is MovieSummary => !!m);
  }

  createPlaylist(): void {
    const name = this.newPlaylistName().trim();
    if (!name) return;
    this.collectionService.createPlaylist(name);
    this.newPlaylistName.set('');
    this.notifications.show('Playlist created', 'success');
  }

  startRename(pl: { id: string; name: string }): void {
    this.editingPlaylistId.set(pl.id);
    this.editPlaylistName.set(pl.name);
  }

  saveRename(id: string): void {
    const name = this.editPlaylistName().trim();
    if (name) this.collectionService.renamePlaylist(id, name);
    this.editingPlaylistId.set(null);
  }

  deletePlaylist(id: string): void {
    this.collectionService.deletePlaylist(id);
    this.notifications.show('Playlist deleted', 'info');
  }

  readonly discoveryGaps = computed(() => {
    const watched = this.watchedMovies();
    if (watched.length < 5) return [];
    const watchedGenres = new Set(watched.flatMap((m) => m.genres));
    const watchedDecades = new Set(watched.map((m) => Math.floor(m.year / 10) * 10));
    const allMovies = this.catalog.movies().filter((m) => m.isStreamable);
    const gaps: { label: string; count: number; link: string[] }[] = [];

    // Unexplored genres with significant catalog presence
    const genreCounts = new Map<string, number>();
    for (const m of allMovies) for (const g of m.genres) genreCounts.set(g, (genreCounts.get(g) ?? 0) + 1);
    for (const [genre, count] of genreCounts) {
      if (!watchedGenres.has(genre) && count >= 10) {
        gaps.push({ label: genre, count, link: ['/genre', genre] });
      }
    }

    // Unexplored decades
    const decadeCounts = new Map<number, number>();
    for (const m of allMovies) {
      const d = Math.floor(m.year / 10) * 10;
      decadeCounts.set(d, (decadeCounts.get(d) ?? 0) + 1);
    }
    for (const [decade, count] of decadeCounts) {
      if (!watchedDecades.has(decade) && count >= 5) {
        gaps.push({ label: `${decade}s`, count, link: ['/decade', String(decade)] });
      }
    }

    return gaps.sort((a, b) => b.count - a.count).slice(0, 8);
  });

  readonly viewingInsights = computed(() => {
    const watched = this.collectionService.watched();
    if (watched.length < 3) return [];
    const movies = this.catalog.movies();
    const movieMap = new Map(movies.map((m) => [m.id, m]));
    const insights: { label: string; value: string }[] = [];

    // Films per month
    const dates = watched.map((w) => w.watchedAt).sort();
    const firstDate = new Date(dates[0]);
    const now = new Date();
    const monthsActive = Math.max(1, (now.getFullYear() - firstDate.getFullYear()) * 12 + now.getMonth() - firstDate.getMonth() + 1);
    const perMonth = (watched.length / monthsActive).toFixed(1);
    insights.push({ label: 'Films per Month', value: perMonth });

    // Favorite genre
    const genreCounts = new Map<string, number>();
    for (const w of watched) {
      const m = movieMap.get(w.movieId);
      if (m) for (const g of m.genres) genreCounts.set(g, (genreCounts.get(g) ?? 0) + 1);
    }
    const topGenre = [...genreCounts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (topGenre) insights.push({ label: 'Favorite Genre', value: topGenre[0] });

    // Most watched director
    const dirCounts = new Map<string, number>();
    for (const w of watched) {
      const m = movieMap.get(w.movieId);
      if (m) for (const d of m.directors) dirCounts.set(d, (dirCounts.get(d) ?? 0) + 1);
    }
    const topDir = [...dirCounts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (topDir && topDir[1] >= 2) insights.push({ label: 'Top Director', value: topDir[0] });

    // Preferred decade
    const decCounts = new Map<number, number>();
    for (const w of watched) {
      const m = movieMap.get(w.movieId);
      if (m) {
        const d = Math.floor(m.year / 10) * 10;
        decCounts.set(d, (decCounts.get(d) ?? 0) + 1);
      }
    }
    const topDec = [...decCounts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (topDec) insights.push({ label: 'Preferred Decade', value: `${topDec[0]}s` });

    // Average release year
    const yearSum = watched.reduce((s, w) => {
      const m = movieMap.get(w.movieId);
      return m ? s + m.year : s;
    }, 0);
    const matchedCount = watched.filter((w) => movieMap.has(w.movieId)).length;
    if (matchedCount >= 3) {
      insights.push({ label: 'Avg Film Year', value: `${Math.round(yearSum / matchedCount)}` });
    }

    // Newest and oldest film watched (by release year)
    let newestYear = 0;
    let oldestYear = 9999;
    for (const w of watched) {
      const m = movieMap.get(w.movieId);
      if (m) {
        if (m.year > newestYear) newestYear = m.year;
        if (m.year < oldestYear) oldestYear = m.year;
      }
    }
    if (newestYear > 0) {
      insights.push({ label: 'Newest Film', value: `${newestYear}` });
    }
    if (oldestYear < 9999) {
      insights.push({ label: 'Oldest Film', value: `${oldestYear}` });
    }

    // Highest rated film
    const ratedItems = watched.filter((w) => w.userRating != null).sort((a, b) => (b.userRating ?? 0) - (a.userRating ?? 0));
    if (ratedItems.length > 0) {
      const topFilm = movieMap.get(ratedItems[0].movieId);
      if (topFilm) {
        const title = topFilm.title.length > 18 ? topFilm.title.slice(0, 16) + '...' : topFilm.title;
        insights.push({ label: 'Highest Rated', value: title });
      }
    }

    // Streamable percentage of watched films
    const streamableWatched = watched.filter((w) => {
      const m = movieMap.get(w.movieId);
      return m?.isStreamable;
    }).length;
    if (watched.length >= 3) {
      insights.push({ label: 'Streamable %', value: `${Math.round((streamableWatched / watched.length) * 100)}%` });
    }

    // Unique directors watched
    const uniqueDirs = new Set<string>();
    for (const w of watched) {
      const m = movieMap.get(w.movieId);
      if (m) for (const d of m.directors) uniqueDirs.add(d);
    }
    if (uniqueDirs.size >= 2) {
      insights.push({ label: 'Unique Directors', value: `${uniqueDirs.size}` });
    }

    // Unique languages watched
    const uniqueLangs = new Set<string>();
    for (const w of watched) {
      const m = movieMap.get(w.movieId);
      if (m && m.language) uniqueLangs.add(m.language);
    }
    if (uniqueLangs.size >= 2) {
      insights.push({ label: 'Languages', value: `${uniqueLangs.size}` });
    }

    // Unique genres explored
    const uniqueGenres = new Set<string>();
    for (const w of watched) {
      const m = movieMap.get(w.movieId);
      if (m) for (const g of m.genres) uniqueGenres.add(g);
    }
    if (uniqueGenres.size >= 3) {
      insights.push({ label: 'Genres Explored', value: `${uniqueGenres.size}` });
    }

    // Average user rating
    const userRated = watched.filter((w) => w.userRating != null && w.userRating > 0);
    if (userRated.length >= 3) {
      const avgUserRating = userRated.reduce((s, w) => s + (w.userRating ?? 0), 0) / userRated.length;
      insights.push({ label: 'Avg Your Rating', value: avgUserRating.toFixed(1) });
    }

    // Decade span
    const watchedDecades = new Set<number>();
    for (const w of watched) {
      const m = movieMap.get(w.movieId);
      if (m) watchedDecades.add(Math.floor(m.year / 10) * 10);
    }
    if (watchedDecades.size >= 3) {
      const sorted = [...watchedDecades].sort((a, b) => a - b);
      insights.push({ label: 'Decade Span', value: `${sorted[0]}s–${sorted[sorted.length - 1]}s` });
    }

    // Co-directed films watched
    const coDirected = watched.filter((w) => {
      const m = movieMap.get(w.movieId);
      return m && m.directors.length > 1;
    }).length;
    if (coDirected > 0) {
      insights.push({ label: 'Co-directed Films', value: `${coDirected}` });
    }

    // Avg catalog rating of watched films
    const catalogRated = watched.map((w) => movieMap.get(w.movieId)).filter((m): m is MovieSummary => !!m && m.voteAverage > 0);
    if (catalogRated.length >= 3) {
      const avgCat = catalogRated.reduce((s, m) => s + m.voteAverage, 0) / catalogRated.length;
      insights.push({ label: 'Avg TMDb Rating', value: avgCat.toFixed(1) });
    }

    // Average film age
    const currentYear = new Date().getFullYear();
    const ages = watched.map((w) => movieMap.get(w.movieId)).filter((m): m is MovieSummary => !!m).map((m) => currentYear - m.year);
    if (ages.length >= 3) {
      const avgAge = Math.round(ages.reduce((s, a) => s + a, 0) / ages.length);
      if (avgAge >= 10) insights.push({ label: 'Avg Film Age', value: `${avgAge} years` });
    }

    // Rating bias vs TMDb
    if (ratedItems.length >= 3) {
      let userTotal = 0;
      let tmdbTotal = 0;
      let count = 0;
      for (const w of ratedItems) {
        const m = movieMap.get(w.movieId);
        if (m && m.voteAverage > 0 && w.userRating != null) {
          userTotal += w.userRating;
          tmdbTotal += m.voteAverage;
          count++;
        }
      }
      if (count >= 3) {
        const diff = (userTotal / count) - (tmdbTotal / count);
        if (Math.abs(diff) >= 0.3) {
          insights.push({ label: 'Rating Bias', value: diff > 0 ? `+${diff.toFixed(1)} vs TMDb` : `${diff.toFixed(1)} vs TMDb` });
        }
      }
    }

    return insights;
  });

  readonly watchTimeline = computed(() => {
    const movieMap = new Map(this.catalog.movies().map((m) => [m.id, m]));
    return [...this.collectionService.watched()]
      .sort((a, b) => b.watchedAt - a.watchedAt)
      .slice(0, 20)
      .map((w) => {
        const movie = movieMap.get(w.movieId);
        const d = new Date(w.watchedAt);
        return {
          movieId: w.movieId,
          title: movie?.title ?? 'Unknown Film',
          dateLabel: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          rating: w.userRating,
        };
      });
  });

  private readonly tabs: Array<'watchlist' | 'watched' | 'favorites' | 'playlists' | 'stats'> = ['watchlist', 'watched', 'favorites', 'playlists', 'stats'];

  onTabKeydown(event: KeyboardEvent): void {
    const idx = this.tabs.indexOf(this.activeTab());
    let next = idx;
    if (event.key === 'ArrowRight') next = (idx + 1) % this.tabs.length;
    else if (event.key === 'ArrowLeft') next = (idx - 1 + this.tabs.length) % this.tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = this.tabs.length - 1;
    else return;
    event.preventDefault();
    this.activeTab.set(this.tabs[next]);
    const tablist = (event.currentTarget as HTMLElement);
    const buttons = tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    buttons[next]?.focus();
  }

  ngOnInit(): void {
    this.catalog.load();
    this.titleService.setTitle('My Collection — BW Cinema');
    const collDesc = 'Manage your personal collection \u2014 watchlist, watched history, and viewing stats.';
    this.metaService.updateTag({ name: 'description', content: collDesc });
    this.metaService.updateTag({ property: 'og:description', content: collDesc });
    this.metaService.updateTag({ name: 'twitter:description', content: collDesc });
    const shared = this.route.snapshot.queryParams['shared'];
    if (shared) {
      this.isSharedView.set(true);
      const ids = shared.split(',');
      // Wait for catalog to load, then resolve IDs
      const checkLoaded = () => {
        if (this.catalog.loaded()) {
          const movies = this.catalog.movies();
          this.sharedMovies.set(ids.map((id: string) => movies.find((m) => m.id === id)).filter((m: MovieSummary | undefined): m is MovieSummary => !!m));
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
    }
  }

  shareCollection(): void {
    const movies = this.currentMovies();
    if (movies.length === 0) {
      this.notifications.show('No films to share', 'info');
      return;
    }
    const ids = movies.map((m) => m.id).join(',');
    const url = `${window.location.origin}/collection?shared=${ids}`;
    navigator.clipboard.writeText(url).then(() => {
      this.notifications.show('Share link copied to clipboard', 'success');
    }).catch(() => {
      this.notifications.show('Failed to copy link', 'error');
    });
  }

  onSortChange(event: Event): void {
    this.sortBy.set((event.target as HTMLSelectElement).value as SortOption);
  }

  onRatingFilterChange(event: Event): void {
    this.ratingFilter.set(parseInt((event.target as HTMLSelectElement).value, 10));
  }

  private applyQuery(movies: MovieSummary[]): MovieSummary[] {
    const q = this.collectionQuery().toLowerCase().trim();
    if (!q) return movies;
    return movies.filter((m) =>
      m.title.toLowerCase().includes(q) ||
      m.directors.some((d) => d.toLowerCase().includes(q)) ||
      m.genres.some((g) => g.toLowerCase().includes(q))
    );
  }

  private applyFilters(movies: MovieSummary[]): MovieSummary[] {
    const genre = this.genreFilter();
    const decade = this.decadeFilter();
    let result = movies;
    if (genre) {
      result = result.filter((m) => m.genres.includes(genre));
    }
    if (decade) {
      const d = parseInt(decade, 10);
      result = result.filter((m) => Math.floor(m.year / 10) * 10 === d);
    }
    return result;
  }

  private applyRatingFilter(movies: MovieSummary[]): MovieSummary[] {
    const r = this.ratingFilter();
    if (r === 0) return movies;
    if (r === -1) {
      // Unrated only
      return movies.filter((m) => {
        const item = this.collectionService.watched().find((w) => w.movieId === m.id);
        return item && item.userRating == null;
      });
    }
    return movies.filter((m) => {
      const item = this.collectionService.watched().find((w) => w.movieId === m.id);
      return item && item.userRating != null && item.userRating >= r;
    });
  }

  exportCsv(): void {
    const movies = this.currentMovies();
    const tab = this.activeTab();
    const headers = ['Title', 'Year', 'Genres', 'Directors', 'Rating', 'Streamable'];
    if (tab === 'watched') headers.push('Your Rating');

    const rows = movies.map((m) => {
      const row = [
        `"${m.title.replace(/"/g, '""')}"`,
        m.year,
        `"${m.genres.join(', ')}"`,
        `"${m.directors.join(', ')}"`,
        m.voteAverage || '',
        m.isStreamable ? 'Yes' : 'No',
      ];
      if (tab === 'watched') {
        const item = this.collectionService.watched().find((w) => w.movieId === m.id);
        row.push(item?.userRating ?? '');
      }
      return row.join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bw-cinema-${tab}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  exportLetterboxd(): void {
    const movies = this.activeTab() === 'watched' ? this.sortedWatched() : this.sortedWatchlist();
    const tab = this.activeTab();
    const headers = ['imdbID', 'Title', 'Year', 'Rating10'];

    const rows = movies.map((m) => {
      const item = tab === 'watched' ? this.collectionService.watched().find((w) => w.movieId === m.id) : null;
      return [
        m.imdbId ?? '',
        `"${m.title.replace(/"/g, '""')}"`,
        m.year,
        item?.userRating ?? '',
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `letterboxd-${tab}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.notifications.show('Letterboxd CSV exported', 'success');
  }

  importLetterboxd(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const lines = text.split('\n').filter((l) => l.trim());
        if (lines.length < 2) {
          this.notifications.show('CSV file is empty', 'error');
          return;
        }
        const header = lines[0].toLowerCase();
        const hasImdb = header.includes('imdbid');
        const hasTitle = header.includes('title');
        if (!hasImdb && !hasTitle) {
          this.notifications.show('CSV must have imdbID or Title column', 'error');
          return;
        }

        const cols = this.parseCsvRow(lines[0]);
        const imdbIdx = cols.findIndex((c) => c.toLowerCase().trim() === 'imdbid');
        const titleIdx = cols.findIndex((c) => c.toLowerCase().trim() === 'title');
        const yearIdx = cols.findIndex((c) => c.toLowerCase().trim() === 'year');
        const ratingIdx = cols.findIndex((c) => c.toLowerCase().trim().includes('rating'));

        const movies = this.catalog.movies();
        let matched = 0;

        for (let i = 1; i < lines.length; i++) {
          const row = this.parseCsvRow(lines[i]);
          if (row.length === 0) continue;

          let movie: MovieSummary | undefined;
          if (imdbIdx >= 0 && row[imdbIdx]) {
            movie = movies.find((m) => m.imdbId === row[imdbIdx].trim());
          }
          if (!movie && titleIdx >= 0 && row[titleIdx]) {
            const title = row[titleIdx].trim().toLowerCase();
            const year = yearIdx >= 0 ? parseInt(row[yearIdx], 10) : NaN;
            movie = movies.find((m) =>
              m.title.toLowerCase() === title && (isNaN(year) || m.year === year)
            );
          }

          if (movie && !this.collectionService.isWatched(movie.id)) {
            const rating = ratingIdx >= 0 ? parseFloat(row[ratingIdx]) : NaN;
            this.collectionService.markWatched(movie.id, isNaN(rating) ? null : Math.round(rating * 2) / 2);
            matched++;
          }
        }

        this.notifications.show(`Imported ${matched} film${matched !== 1 ? 's' : ''}`, 'success');
      } catch {
        this.notifications.show('Failed to parse CSV file', 'error');
      }
      input.value = '';
    };
    reader.readAsText(file);
  }

  private parseCsvRow(row: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (inQuotes) {
        if (ch === '"') {
          if (row[i + 1] === '"') { current += '"'; i++; }
          else inQuotes = false;
        } else {
          current += ch;
        }
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result;
  }

  exportBackup(): void {
    const data = {
      watchlist: this.collectionService.watchlist(),
      watched: this.collectionService.watched(),
      favorites: this.collectionService.favorites(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bw-cinema-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.notifications.show('Backup downloaded', 'success');
  }

  importBackup(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (data.watchlist && Array.isArray(data.watchlist)) {
          for (const item of data.watchlist) {
            if (item.movieId && !this.collectionService.isInWatchlist(item.movieId) && !this.collectionService.isWatched(item.movieId)) {
              this.collectionService.addToWatchlist(item.movieId);
            }
          }
        }
        if (data.watched && Array.isArray(data.watched)) {
          for (const item of data.watched) {
            if (item.movieId && !this.collectionService.isWatched(item.movieId)) {
              this.collectionService.markWatched(item.movieId, item.userRating ?? null);
            }
          }
        }
        if (data.favorites && Array.isArray(data.favorites)) {
          for (const id of data.favorites) {
            if (typeof id === 'string' && !this.collectionService.isFavorite(id)) {
              this.collectionService.toggleFavorite(id);
            }
          }
        }
        this.notifications.show('Collection restored successfully', 'success');
      } catch {
        this.notifications.show('Invalid backup file', 'error');
      }
      input.value = '';
    };
    reader.readAsText(file);
  }

  private sortMovies(movies: MovieSummary[], list: 'watchlist' | 'watched'): MovieSummary[] {
    const sort = this.sortBy();
    const items = list === 'watchlist' ? this.collectionService.watchlist() : this.collectionService.watched();
    const timeMap = new Map(items.map((i) => [i.movieId, 'addedAt' in i ? i.addedAt : (i as { watchedAt: number }).watchedAt]));

    return [...movies].sort((a, b) => {
      switch (sort) {
        case 'added-desc': return (timeMap.get(b.id) ?? 0) - (timeMap.get(a.id) ?? 0);
        case 'added-asc': return (timeMap.get(a.id) ?? 0) - (timeMap.get(b.id) ?? 0);
        case 'title-asc': return a.title.localeCompare(b.title);
        case 'title-desc': return b.title.localeCompare(a.title);
        case 'rating-desc': return b.voteAverage - a.voteAverage;
        case 'year-desc': return b.year - a.year;
        default: return 0;
      }
    });
  }

  private computeStats(items: string[]): { name: string; count: number; pct: number }[] {
    const counts = new Map<string, number>();
    for (const item of items) {
      counts.set(item, (counts.get(item) ?? 0) + 1);
    }
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    const max = sorted[0]?.[1] ?? 1;
    return sorted.map(([name, count]) => ({ name, count, pct: (count / max) * 100 }));
  }
}
