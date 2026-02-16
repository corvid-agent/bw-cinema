import { Component, ChangeDetectionStrategy, inject, OnInit, signal, input, computed, HostListener } from '@angular/core';
import { Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { CatalogService } from '../../core/services/catalog.service';
import { MovieService } from '../../core/services/movie.service';
import { CollectionService } from '../../core/services/collection.service';
import { StreamingService } from '../../core/services/streaming.service';
import { NotificationService } from '../../core/services/notification.service';
import { RecentlyViewedService } from '../../core/services/recently-viewed.service';
import { RatingStarsComponent } from '../../shared/components/rating-stars.component';
import { SkeletonDetailComponent } from '../../shared/components/skeleton-detail.component';
import { RuntimePipe } from '../../shared/pipes/runtime.pipe';
import type { MovieDetail, MovieSummary } from '../../core/models/movie.model';

@Component({
  selector: 'app-movie',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RatingStarsComponent, SkeletonDetailComponent, RuntimePipe],
  template: `
    @if (loading()) {
      <app-skeleton-detail />
    } @else if (movie(); as m) {
      <div class="detail">
        <button class="detail__back" (click)="goBack()" aria-label="Go back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>
        <div class="detail__hero">
          @if (m.backdropUrl) {
            <div class="detail__backdrop" [style.background-image]="'url(' + m.backdropUrl + ')'"></div>
          }
          <div class="detail__hero-gradient"></div>
        </div>

        <div class="detail__content container">
          <div class="detail__layout">
            <div class="detail__poster">
              @if (m.posterUrl) {
                <img [src]="m.posterUrl" [alt]="m.title + ' poster'" />
              } @else {
                <div class="detail__poster-placeholder">
                  <span class="detail__poster-title">{{ m.title }}</span>
                  <span class="detail__poster-year">{{ m.year }}</span>
                </div>
              }
            </div>

            <div class="detail__info">
              <h1 class="detail__title">{{ m.title }}</h1>

              @if (catalogRank() > 0) {
                <span class="detail__rank">#{{ catalogRank() }} in catalog</span>
              }
              @if (ratingPercentile(); as pct) {
                <span class="detail__percentile">{{ pct }}</span>
              }
              <div class="detail__sub-ranks">
                @if (genreRank(); as gr) {
                  <a class="detail__sub-rank" [routerLink]="['/genre', gr.genre]">#{{ gr.rank }} in {{ gr.genre }}</a>
                }
                @if (decadeRank(); as dr) {
                  <a class="detail__sub-rank" [routerLink]="['/decade', dr.decade]">#{{ dr.rank }} in {{ dr.decade }}s</a>
                }
                @if (directorRank(); as dRank) {
                  <a class="detail__sub-rank" [routerLink]="['/director', dRank.director]">#{{ dRank.rank }} of {{ dRank.total }} by {{ dRank.director }}</a>
                }
              </div>

              <div class="detail__meta">
                <span class="detail__meta-item" [title]="yearPeers() > 1 ? 'One of ' + yearPeers() + ' films from ' + m.year : ''">{{ m.year }}</span>
                @if (m.runtime) {
                  <span class="detail__meta-sep">&middot;</span>
                  <span class="detail__meta-item">{{ m.runtime | runtime }}</span>
                }
                @if (m.originalLanguage) {
                  <span class="detail__meta-sep">&middot;</span>
                  <span class="detail__meta-item">{{ m.originalLanguage.toUpperCase() }}</span>
                }
              </div>

              @if (m.tagline) {
                <p class="detail__tagline">&ldquo;{{ m.tagline }}&rdquo;</p>
              }

              @if (m.overview) {
                <p class="detail__overview">{{ m.overview }}</p>
              }

              @if (m.tmdbRating || m.imdbRating || m.rottenTomatoesRating) {
                <div class="detail__ratings">
                  @if (m.tmdbRating) {
                    <div class="detail__rating-card">
                      <span class="detail__rating-source">TMDb</span>
                      <span class="detail__rating-score">{{ m.tmdbRating.toFixed(1) }}</span>
                      <app-rating-stars [rating]="m.tmdbRating / 2" />
                    </div>
                  }
                  @if (m.imdbRating) {
                    <div class="detail__rating-card">
                      <span class="detail__rating-source">IMDb</span>
                      <span class="detail__rating-score">{{ m.imdbRating }}</span>
                    </div>
                  }
                  @if (m.rottenTomatoesRating) {
                    <div class="detail__rating-card">
                      <span class="detail__rating-source">RT</span>
                      <span class="detail__rating-score">{{ m.rottenTomatoesRating }}</span>
                    </div>
                  }
                </div>
              }

              <div class="detail__actions">
                @if (streamingUrl()) {
                  <a class="btn-primary detail__watch-btn" [routerLink]="['/watch', m.id]">Watch Film</a>
                } @else if (m.imdbId) {
                  <a class="btn-secondary detail__watch-btn detail__imdb-btn" [href]="'https://www.imdb.com/title/' + m.imdbId" target="_blank" rel="noopener">View on IMDb</a>
                } @else {
                  <a class="btn-secondary detail__watch-btn" [href]="'https://archive.org/search?query=' + encodeTitle(m.title)" target="_blank" rel="noopener">Search Internet Archive</a>
                }
                <button
                  class="btn-ghost detail__fav-btn"
                  [class.detail__fav-btn--active]="collection.isFavorite(m.id)"
                  (click)="toggleFavorite(m.id)"
                  [attr.aria-label]="collection.isFavorite(m.id) ? 'Remove from favorites' : 'Add to favorites'"
                >
                  @if (collection.isFavorite(m.id)) {
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  } @else {
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  }
                </button>
                @if (!collection.isInWatchlist(m.id) && !collection.isWatched(m.id)) {
                  <button class="btn-secondary" (click)="addToWatchlist(m.id)">+ Watchlist</button>
                } @else if (collection.isInWatchlist(m.id)) {
                  <button class="btn-secondary detail__active-btn" (click)="removeFromWatchlist(m.id)">In Watchlist</button>
                }
                @if (!collection.isWatched(m.id)) {
                  <button class="btn-secondary" (click)="markWatched(m.id)">Mark Watched</button>
                }
                @if (collection.playlists().length > 0) {
                  <div class="detail__playlist-wrap">
                    <button class="btn-ghost detail__playlist-btn" (click)="playlistMenuOpen.set(!playlistMenuOpen())">+ Playlist</button>
                    @if (playlistMenuOpen()) {
                      <div class="detail__share-menu">
                        @for (pl of collection.playlists(); track pl.id) {
                          <button class="detail__share-option" (click)="addToPlaylist(pl.id, m.id)">{{ pl.name }}</button>
                        }
                      </div>
                    }
                  </div>
                }
                <div class="detail__share-wrap">
                  <button class="btn-ghost detail__share-btn" (click)="shareMenuOpen.set(!shareMenuOpen())" aria-label="Share this film">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                    Share
                  </button>
                  @if (shareMenuOpen()) {
                    <div class="detail__share-menu">
                      <button class="detail__share-option" (click)="shareTwitter(m)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        Twitter / X
                      </button>
                      <button class="detail__share-option" (click)="shareFacebook(m)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        Facebook
                      </button>
                      <button class="detail__share-option" (click)="copyLink()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        Copy Link
                      </button>
                    </div>
                  }
                </div>
              </div>

              @if (collection.isWatched(m.id)) {
                <div class="detail__user-rating">
                  <span class="detail__user-rating-label">Your Rating</span>
                  <app-rating-stars
                    [rating]="getUserRating(m.id)"
                    [interactive]="true"
                    (rated)="onRate(m.id, $event)"
                  />
                </div>
              }

              @if (collection.isWatched(m.id)) {
                <div class="detail__notes">
                  <label class="detail__notes-label" for="film-notes">Your Notes</label>
                  <textarea
                    id="film-notes"
                    class="detail__notes-input"
                    placeholder="Add your thoughts about this film..."
                    [value]="collection.getNote(m.id)"
                    (blur)="onNoteChange(m.id, $event)"
                    rows="3"
                  ></textarea>
                </div>
              }

              @if (collection.isWatched(m.id)) {
                <div class="detail__review">
                  <label class="detail__notes-label" for="film-review">Your Review</label>
                  @if (!reviewEditing()) {
                    @if (collection.getReview(m.id)) {
                      <div class="detail__review-display">
                        <p class="detail__review-text">{{ collection.getReview(m.id) }}</p>
                        <button class="btn-ghost detail__review-edit" (click)="reviewEditing.set(true)">Edit</button>
                      </div>
                    } @else {
                      <button class="btn-secondary detail__review-start" (click)="reviewEditing.set(true)">Write a Review</button>
                    }
                  } @else {
                    <textarea
                      id="film-review"
                      class="detail__notes-input detail__review-input"
                      placeholder="Share your thoughts on this film. What made it memorable?"
                      [value]="collection.getReview(m.id)"
                      (blur)="onReviewSave(m.id, $event)"
                      rows="5"
                    ></textarea>
                    <p class="detail__review-hint">Click outside to save</p>
                  }
                </div>
              }

              @if (m.directors.length > 0 || m.genres.length > 0) {
                <div class="detail__details">
                  @if (m.directors.length > 0) {
                    <div class="detail__detail-row">
                      <span class="detail__detail-label">Director{{ m.directors.length > 1 ? 's' : '' }}</span>
                      <span>
                        @for (dir of m.directors; track dir; let last = $last) {
                          <a [routerLink]="['/director', dir]">{{ dir }}</a>@if (!last) {, }
                        }
                      </span>
                    </div>
                  }
                  @if (m.genres.length > 0) {
                    <div class="detail__detail-row">
                      <span class="detail__detail-label">Genres</span>
                      <div class="detail__tags">
                        @for (genre of m.genres; track genre) {
                          <a class="detail__tag" [routerLink]="['/genre', genre]">{{ genre }}</a>
                        }
                      </div>
                    </div>
                  }
                </div>
              }

              @if (m.originalLanguage || m.productionCountries.length > 0) {
                <div class="detail__details">
                  @if (m.originalLanguage) {
                    <div class="detail__detail-row">
                      <span class="detail__detail-label">Language</span>
                      <a [routerLink]="['/browse']" [queryParams]="{ languages: languageName(m.originalLanguage), streamable: '0' }">{{ languageName(m.originalLanguage) }}</a>
                    </div>
                  }
                  @if (m.productionCountries.length > 0) {
                    <div class="detail__detail-row">
                      <span class="detail__detail-label">{{ m.productionCountries.length > 1 ? 'Countries' : 'Country' }}</span>
                      <span>{{ m.productionCountries.join(', ') }}</span>
                    </div>
                  }
                </div>
              }

              @if (m.imdbId || m.internetArchiveId || m.youtubeId) {
                <div class="detail__available">
                  <span class="detail__available-label">Available on</span>
                  @if (m.internetArchiveId) {
                    <a class="detail__source-badge detail__source-badge--ia" [href]="'https://archive.org/details/' + m.internetArchiveId" target="_blank" rel="noopener">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                      Internet Archive
                    </a>
                  }
                  @if (m.youtubeId) {
                    <a class="detail__source-badge detail__source-badge--yt" [href]="'https://www.youtube.com/watch?v=' + m.youtubeId" target="_blank" rel="noopener">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.377.504A3.016 3.016 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.504 9.376.504 9.376.504s7.505 0 9.377-.504a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                      YouTube
                    </a>
                  }
                  @if (m.imdbId) {
                    <a class="detail__source-badge detail__source-badge--imdb" [href]="'https://www.imdb.com/title/' + m.imdbId" target="_blank" rel="noopener">
                      IMDb
                    </a>
                  }
                </div>
              }
            </div>
          </div>

          @if (filmContext().length > 0) {
            <div class="detail__context">
              @for (ctx of filmContext(); track ctx) {
                <span class="detail__context-chip">{{ ctx }}</span>
              }
            </div>
          }

          @if (m.cast.length > 0) {
            <section class="detail__cast-section">
              <h2>Cast</h2>
              <div class="detail__cast">
                @for (actor of m.cast; track actor.name) {
                  <a class="cast-card" [routerLink]="['/actor', actor.name]">
                    @if (actor.profileUrl) {
                      <img [src]="actor.profileUrl" [alt]="actor.name" loading="lazy" />
                    } @else {
                      <div class="cast-card__placeholder"></div>
                    }
                    <p class="cast-card__name">{{ actor.name }}</p>
                    @if (actor.character) {
                      <p class="cast-card__character">{{ actor.character }}</p>
                    }
                  </a>
                }
              </div>
            </section>
          }

          @if (directorFilms().length > 0) {
            <section class="detail__similar" aria-label="More by director">
              <div class="detail__section-header">
                <h2>More by {{ movie()!.directors[0] }}</h2>
                <a class="detail__section-link" [routerLink]="['/director', movie()!.directors[0]]">View all &rarr;</a>
              </div>
              <div class="detail__carousel">
                @for (s of directorFilms(); track s.id) {
                  <a class="detail__carousel-card" [routerLink]="['/movie', s.id]">
                    <div class="detail__carousel-poster-wrap">
                      @if (s.posterUrl) {
                        <img [src]="s.posterUrl" [alt]="s.title" loading="lazy" />
                      } @else {
                        <div class="detail__carousel-placeholder">
                          <span>{{ s.title }}</span>
                        </div>
                      }
                      @if (collection.isWatched(s.id)) {
                        <span class="detail__carousel-badge detail__carousel-badge--watched" title="Watched">&#10003;</span>
                      } @else if (collection.isInWatchlist(s.id)) {
                        <span class="detail__carousel-badge detail__carousel-badge--watchlist" title="In watchlist">+</span>
                      }
                    </div>
                    <p class="detail__carousel-title">{{ s.title }}</p>
                    <p class="detail__carousel-meta">{{ s.year }}</p>
                  </a>
                }
              </div>
            </section>
          }

          @if (similarWithReasons().length > 0) {
            <section class="detail__similar" aria-label="Similar films">
              <h2>You Might Also Like</h2>
              <div class="detail__carousel">
                @for (s of similarWithReasons(); track s.movie.id) {
                  <a class="detail__carousel-card" [routerLink]="['/movie', s.movie.id]">
                    <div class="detail__carousel-poster-wrap">
                      @if (s.movie.posterUrl) {
                        <img [src]="s.movie.posterUrl" [alt]="s.movie.title" loading="lazy" />
                      } @else {
                        <div class="detail__carousel-placeholder">
                          <span>{{ s.movie.title }}</span>
                        </div>
                      }
                      @if (collection.isWatched(s.movie.id)) {
                        <span class="detail__carousel-badge detail__carousel-badge--watched" title="Watched">&#10003;</span>
                      } @else if (collection.isInWatchlist(s.movie.id)) {
                        <span class="detail__carousel-badge detail__carousel-badge--watchlist" title="In watchlist">+</span>
                      }
                    </div>
                    <p class="detail__carousel-title">{{ s.movie.title }}</p>
                    <p class="detail__carousel-meta">{{ s.movie.year }}</p>
                    @if (s.reason) {
                      <p class="detail__carousel-reason">{{ s.reason }}</p>
                    }
                  </a>
                }
              </div>
            </section>
          }
        </div>
      </div>
    } @else {
      <div class="container detail__not-found">
        <h2>Film not found</h2>
        <p class="text-secondary">This film is not in our catalog.</p>
        <a class="btn-primary" routerLink="/browse">Browse Films</a>
      </div>
    }
  `,
  styles: [`
    .detail__back {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      position: absolute;
      top: var(--space-md);
      left: var(--space-lg);
      z-index: 10;
      padding: 6px 14px 6px 8px;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 20px;
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .detail__back:hover {
      background: rgba(0, 0, 0, 0.7);
      color: var(--text-primary);
      border-color: var(--accent-gold);
    }
    .detail {
      position: relative;
    }
    .detail__hero {
      position: relative;
      height: 350px;
      overflow: hidden;
    }
    .detail__backdrop {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center top;
      opacity: 0.4;
    }
    .detail__hero-gradient {
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, transparent 30%, var(--bg-deep) 100%);
    }
    .detail__content {
      position: relative;
      margin-top: -120px;
      padding-bottom: var(--space-2xl);
    }
    .detail__layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: var(--space-xl);
    }
    .detail__poster img {
      width: 100%;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-poster);
    }
    .detail__poster-placeholder {
      width: 100%;
      aspect-ratio: 2 / 3;
      background: linear-gradient(170deg, #1a1a1a 0%, #222 40%, #1a1a1a 100%);
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-sm);
      box-shadow: var(--shadow-poster);
    }
    .detail__poster-title {
      font-family: var(--font-heading);
      color: var(--text-secondary);
      font-size: 1.1rem;
      text-align: center;
      padding: 0 var(--space-md);
    }
    .detail__poster-year {
      font-family: var(--font-heading);
      color: var(--accent-gold);
      font-size: 1.6rem;
      font-weight: 700;
      opacity: 0.5;
    }
    .detail__rank {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--accent-gold);
      background: var(--accent-gold-dim);
      padding: 2px 10px;
      border-radius: 10px;
      margin-bottom: var(--space-sm);
    }
    .detail__percentile {
      display: inline-block;
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--text-primary);
      background: var(--bg-raised);
      border: 1px solid var(--border-bright);
      padding: 2px 8px;
      border-radius: 10px;
      margin-left: var(--space-xs);
      margin-bottom: var(--space-sm);
      vertical-align: middle;
    }
    .detail__sub-ranks {
      display: flex;
      gap: var(--space-xs);
      flex-wrap: wrap;
      margin-bottom: var(--space-sm);
    }
    .detail__sub-ranks:empty { display: none; }
    .detail__sub-rank {
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--text-tertiary);
      background: var(--bg-raised);
      border: 1px solid var(--border);
      padding: 1px 8px;
      border-radius: 10px;
      text-decoration: none;
      transition: color 0.2s, border-color 0.2s;
    }
    .detail__sub-rank:hover {
      color: var(--accent-gold);
      border-color: var(--accent-gold);
    }
    .detail__title {
      font-size: 2.2rem;
      margin-bottom: var(--space-sm);
    }
    .detail__meta {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      color: var(--text-secondary);
      font-size: 1rem;
      margin-bottom: var(--space-lg);
    }
    .detail__meta-sep {
      color: var(--text-tertiary);
    }
    .detail__tagline {
      font-style: italic;
      color: var(--accent-cream);
      font-size: 1.05rem;
      margin: 0 0 var(--space-md);
      opacity: 0.85;
    }
    .detail__overview {
      color: var(--text-secondary);
      line-height: 1.8;
      margin: 0 0 var(--space-xl);
      font-size: 0.95rem;
    }
    .detail__ratings {
      display: flex;
      gap: var(--space-md);
      margin-bottom: var(--space-xl);
      flex-wrap: wrap;
    }
    .detail__rating-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      background-color: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-md) var(--space-lg);
      min-width: 80px;
    }
    .detail__rating-source {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-tertiary);
      font-weight: 600;
    }
    .detail__rating-score {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--accent-gold);
      font-family: var(--font-heading);
    }
    .detail__actions {
      display: flex;
      gap: var(--space-sm);
      flex-wrap: wrap;
      margin-bottom: var(--space-xl);
    }
    .detail__watch-btn {
      padding: var(--space-md) var(--space-xl);
      font-size: 1rem;
      border-radius: var(--radius-lg);
      display: inline-block;
    }
    .detail__active-btn {
      border-color: var(--accent-gold);
      color: var(--accent-gold);
    }
    .detail__details {
      margin-bottom: var(--space-lg);
    }
    .detail__detail-row {
      display: flex;
      gap: var(--space-md);
      padding: var(--space-sm) 0;
      border-bottom: 1px solid var(--border);
      font-size: 0.95rem;
    }
    .detail__detail-row:last-child {
      border-bottom: none;
    }
    .detail__detail-label {
      color: var(--text-tertiary);
      min-width: 90px;
      flex-shrink: 0;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      padding-top: 2px;
    }
    .detail__tags {
      display: flex;
      gap: var(--space-xs);
      flex-wrap: wrap;
    }
    .detail__tag {
      background-color: var(--bg-raised);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 2px 12px;
      font-size: 0.85rem;
      color: var(--text-secondary);
      text-decoration: none;
      transition: border-color 0.2s, color 0.2s, background-color 0.2s;
    }
    .detail__tag:hover {
      border-color: var(--accent-gold);
      color: var(--accent-gold);
      background-color: var(--accent-gold-dim);
    }
    .detail__available {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      flex-wrap: wrap;
    }
    .detail__available-label {
      font-size: 0.8rem;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
      margin-right: var(--space-xs);
    }
    .detail__source-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 14px;
      font-size: 0.8rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
    }
    .detail__source-badge--ia {
      background: rgba(25, 135, 84, 0.15);
      color: rgb(25, 135, 84);
      border: 1px solid rgba(25, 135, 84, 0.3);
    }
    .detail__source-badge--ia:hover {
      background: rgba(25, 135, 84, 0.25);
      border-color: rgb(25, 135, 84);
      color: rgb(25, 135, 84);
    }
    .detail__source-badge--yt {
      background: rgba(255, 0, 0, 0.1);
      color: rgb(220, 50, 50);
      border: 1px solid rgba(255, 0, 0, 0.2);
    }
    .detail__source-badge--yt:hover {
      background: rgba(255, 0, 0, 0.2);
      border-color: rgba(255, 0, 0, 0.5);
      color: rgb(220, 50, 50);
    }
    .detail__source-badge--imdb {
      background: rgba(245, 197, 24, 0.1);
      color: #f5c518;
      border: 1px solid rgba(245, 197, 24, 0.3);
    }
    .detail__source-badge--imdb:hover {
      background: rgba(245, 197, 24, 0.2);
      border-color: #f5c518;
      color: #f5c518;
    }
    .detail__cast-section {
      margin-top: var(--space-2xl);
      padding-top: var(--space-xl);
      border-top: 1px solid var(--border);
    }
    .detail__cast {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: var(--space-md);
    }
    .cast-card {
      text-align: center;
      text-decoration: none;
      color: inherit;
      transition: transform 0.2s;
    }
    .cast-card:hover { color: inherit; }
    @media (hover: hover) and (pointer: fine) {
      .cast-card:hover { transform: translateY(-2px); }
    }
    .cast-card:hover .cast-card__name { color: var(--accent-gold); }
    .cast-card img {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      object-fit: cover;
      margin-bottom: var(--space-sm);
      box-shadow: var(--shadow-sm);
    }
    .cast-card__placeholder {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background-color: var(--bg-raised);
      margin: 0 auto var(--space-sm);
    }
    .cast-card__name {
      font-size: 0.85rem;
      font-weight: 600;
      margin: 0 0 2px;
      color: var(--text-primary);
    }
    .cast-card__character {
      font-size: 0.75rem;
      color: var(--text-tertiary);
      margin: 0;
    }
    .detail__playlist-wrap {
      position: relative;
    }
    .detail__playlist-btn {
      font-size: 0.9rem;
    }
    .detail__share-wrap {
      position: relative;
    }
    .detail__share-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.9rem;
    }
    .detail__share-menu {
      position: absolute;
      top: 100%;
      left: 0;
      margin-top: 4px;
      background-color: var(--bg-surface);
      border: 1px solid var(--border-bright);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      z-index: 20;
      min-width: 160px;
      padding: var(--space-xs);
    }
    .detail__share-option {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      width: 100%;
      padding: var(--space-sm) var(--space-md);
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 0.9rem;
      cursor: pointer;
      border-radius: var(--radius);
      text-align: left;
      min-height: 40px;
    }
    .detail__share-option:hover {
      background-color: var(--bg-hover);
      color: var(--text-primary);
    }
    .detail__fav-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 48px;
      min-height: 48px;
      padding: 0;
      color: var(--text-tertiary);
      transition: color 0.2s, transform 0.2s;
    }
    .detail__fav-btn:hover { color: #e53e3e; }
    .detail__fav-btn--active { color: #e53e3e; }
    .detail__fav-btn--active:hover { transform: scale(1.1); }
    .detail__notes {
      margin-bottom: var(--space-xl);
    }
    .detail__notes-label {
      display: block;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-tertiary);
      font-weight: 600;
      margin-bottom: var(--space-sm);
    }
    .detail__notes-input {
      width: 100%;
      padding: var(--space-md);
      background-color: var(--bg-surface);
      color: var(--text-primary);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      font-family: var(--font-body);
      font-size: 0.95rem;
      line-height: 1.6;
      resize: vertical;
      min-height: 80px;
    }
    .detail__notes-input:focus {
      border-color: var(--accent-gold);
      outline: none;
    }
    .detail__notes-input::placeholder {
      color: var(--text-tertiary);
    }
    .detail__user-rating {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      margin-bottom: var(--space-xl);
      padding: var(--space-md) var(--space-lg);
      background-color: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
    }
    .detail__user-rating-label {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-tertiary);
      font-weight: 600;
    }
    .detail__section-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-bottom: var(--space-sm);
    }
    .detail__section-header h2 { margin-bottom: 0; }
    .detail__section-link {
      font-size: 0.9rem;
      font-weight: 600;
    }
    .detail__similar {
      margin-top: var(--space-2xl);
      padding-top: var(--space-xl);
      border-top: 1px solid var(--border);
    }
    .detail__carousel {
      display: flex;
      gap: var(--space-md);
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      padding-bottom: var(--space-sm);
      -webkit-overflow-scrolling: touch;
    }
    .detail__carousel::-webkit-scrollbar {
      height: 6px;
    }
    .detail__carousel::-webkit-scrollbar-track {
      background: var(--bg-raised);
      border-radius: 3px;
    }
    .detail__carousel::-webkit-scrollbar-thumb {
      background: var(--border-bright);
      border-radius: 3px;
    }
    .detail__carousel-card {
      flex: 0 0 140px;
      scroll-snap-align: start;
      text-decoration: none;
      color: var(--text-primary);
      transition: transform 0.2s;
    }
    .detail__carousel-card:hover {
      transform: translateY(-4px);
    }
    .detail__carousel-poster-wrap {
      position: relative;
    }
    .detail__carousel-card img {
      width: 100%;
      aspect-ratio: 2 / 3;
      object-fit: cover;
      border-radius: var(--radius);
      margin-bottom: var(--space-xs);
    }
    .detail__carousel-badge {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      font-weight: 700;
      backdrop-filter: blur(4px);
    }
    .detail__carousel-badge--watched {
      background: rgba(212, 175, 55, 0.9);
      color: var(--bg-deep);
    }
    .detail__carousel-badge--watchlist {
      background: rgba(0, 0, 0, 0.6);
      color: var(--accent-gold);
      border: 1px solid var(--accent-gold);
    }
    .detail__carousel-placeholder {
      width: 100%;
      aspect-ratio: 2 / 3;
      background: var(--bg-raised);
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-sm);
      margin-bottom: var(--space-xs);
      font-size: 0.75rem;
      color: var(--text-tertiary);
      text-align: center;
    }
    .detail__carousel-title {
      font-size: 0.85rem;
      font-weight: 600;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .detail__carousel-meta {
      font-size: 0.75rem;
      color: var(--text-tertiary);
      margin: 0;
    }
    .detail__carousel-reason {
      font-size: 0.65rem;
      color: var(--accent-gold);
      margin: 2px 0 0;
      opacity: 0.85;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .detail__context {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-xs);
      margin-bottom: var(--space-xl);
    }
    .detail__context-chip {
      font-size: 0.75rem;
      padding: 4px 12px;
      border-radius: 14px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      white-space: nowrap;
    }
    .detail__not-found {
      padding: var(--space-3xl) 0;
      text-align: center;
    }
    .detail__review {
      margin-bottom: var(--space-xl);
    }
    .detail__review-display {
      background-color: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-md) var(--space-lg);
    }
    .detail__review-text {
      color: var(--text-secondary);
      line-height: 1.8;
      font-size: 0.95rem;
      margin: 0 0 var(--space-sm);
      white-space: pre-wrap;
    }
    .detail__review-edit {
      font-size: 0.8rem;
      color: var(--text-tertiary);
    }
    .detail__review-edit:hover {
      color: var(--accent-gold);
    }
    .detail__review-start {
      font-size: 0.9rem;
    }
    .detail__review-input {
      min-height: 120px;
    }
    .detail__review-hint {
      font-size: 0.75rem;
      color: var(--text-tertiary);
      margin: var(--space-xs) 0 0;
    }
    .detail__imdb-btn {
      border-color: rgba(245, 197, 24, 0.5);
      color: #f5c518;
    }
    .detail__imdb-btn:hover {
      background-color: rgba(245, 197, 24, 0.1);
      border-color: #f5c518;
    }
    @media (max-width: 768px) {
      .detail__hero { height: 220px; }
      .detail__content { margin-top: -60px; }
      .detail__layout {
        grid-template-columns: 1fr;
        gap: var(--space-lg);
      }
      .detail__poster {
        max-width: 200px;
        margin: 0 auto;
      }
      .detail__title { font-size: 1.8rem; }
      .detail__actions {
        width: 100%;
      }
      .detail__watch-btn {
        flex: 1;
        text-align: center;
      }
    }
    @media (max-width: 480px) {
      .detail__poster {
        max-width: 150px;
      }
      .detail__title { font-size: 1.5rem; }
      .detail__ratings {
        flex-direction: column;
        gap: var(--space-sm);
      }
      .detail__rating-card {
        flex-direction: row;
        gap: var(--space-md);
        min-width: auto;
        padding: var(--space-sm) var(--space-md);
      }
      .detail__overview {
        font-size: 0.9rem;
      }
    }
  `],
})
export class MovieComponent implements OnInit {
  readonly id = input.required<string>();

  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly catalogService = inject(CatalogService);
  private readonly movieService = inject(MovieService);
  protected readonly collection = inject(CollectionService);
  private readonly streaming = inject(StreamingService);
  private readonly notifications = inject(NotificationService);
  private readonly recentlyViewed = inject(RecentlyViewedService);
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);

  readonly movie = signal<MovieDetail | null>(null);
  readonly loading = signal(true);
  readonly streamingUrl = signal<string | null>(null);
  readonly shareMenuOpen = signal(false);
  readonly playlistMenuOpen = signal(false);
  readonly reviewEditing = signal(false);
  private readonly summary = signal<MovieSummary | null>(null);
  readonly similarFilms = computed(() => {
    const s = this.summary();
    return s ? this.catalogService.getSimilar(s) : [];
  });

  readonly filmContext = computed(() => {
    const m = this.movie();
    if (!m) return [];
    const ctx: string[] = [];
    if (m.year < 1930) ctx.push('Silent Era');
    else if (m.year < 1950) ctx.push('Golden Age');
    else if (m.year < 1970) ctx.push('Post-War Cinema');
    const age = new Date().getFullYear() - m.year;
    ctx.push(`${age} years old`);
    if (m.isStreamable) {
      if (m.internetArchiveId) ctx.push('Free on Internet Archive');
      else if (m.youtubeId) ctx.push('Free on YouTube');
    } else {
      ctx.push('Not in public domain');
    }
    if (m.runtime) {
      if (m.runtime < 60) ctx.push('Short film');
      else if (m.runtime > 150) ctx.push('Epic length');
    }
    if (m.originalLanguage && m.originalLanguage !== 'en') ctx.push('Foreign language');
    if (m.genres.length >= 4) ctx.push('Multi-genre');
    return ctx;
  });

  readonly similarWithReasons = computed(() => {
    const s = this.summary();
    if (!s) return [];
    const films = this.similarFilms();
    const genreSet = new Set(s.genres.map((g) => g.toLowerCase()));
    const dirSet = new Set(s.directors.map((d) => d.toLowerCase()));
    const decade = Math.floor(s.year / 10) * 10;
    return films.map((m) => {
      const sharedDir = m.directors.find((d) => dirSet.has(d.toLowerCase()));
      const sharedGenres = m.genres.filter((g) => genreSet.has(g.toLowerCase()));
      const sameDec = Math.floor(m.year / 10) * 10 === decade;
      let reason = '';
      if (sharedDir) {
        reason = `Also by ${sharedDir}`;
      } else if (sharedGenres.length > 0 && sameDec) {
        reason = `${sharedGenres[0]}, ${decade}s`;
      } else if (sharedGenres.length > 0) {
        reason = sharedGenres.length > 1 ? sharedGenres.slice(0, 2).join(' & ') : sharedGenres[0];
      } else if (sameDec) {
        reason = `Also from the ${decade}s`;
      }
      return { movie: m, reason };
    });
  });

  readonly catalogRank = computed(() => {
    const s = this.summary();
    if (!s || s.voteAverage === 0) return 0;
    const ranked = this.catalogService.movies()
      .filter((m) => m.voteAverage > 0)
      .sort((a, b) => b.voteAverage - a.voteAverage);
    const idx = ranked.findIndex((m) => m.id === s.id);
    return idx >= 0 ? idx + 1 : 0;
  });

  readonly genreRank = computed(() => {
    const s = this.summary();
    if (!s || s.voteAverage === 0 || s.genres.length === 0) return null;
    const genre = s.genres[0];
    const ranked = this.catalogService.movies()
      .filter((m) => m.voteAverage > 0 && m.genres.includes(genre))
      .sort((a, b) => b.voteAverage - a.voteAverage);
    const idx = ranked.findIndex((m) => m.id === s.id);
    if (idx < 0 || idx >= 20) return null;
    return { rank: idx + 1, genre, total: ranked.length };
  });

  readonly decadeRank = computed(() => {
    const s = this.summary();
    if (!s || s.voteAverage === 0) return null;
    const decade = Math.floor(s.year / 10) * 10;
    const ranked = this.catalogService.movies()
      .filter((m) => m.voteAverage > 0 && Math.floor(m.year / 10) * 10 === decade)
      .sort((a, b) => b.voteAverage - a.voteAverage);
    const idx = ranked.findIndex((m) => m.id === s.id);
    if (idx < 0 || idx >= 20) return null;
    return { rank: idx + 1, decade, total: ranked.length };
  });

  readonly directorRank = computed(() => {
    const s = this.summary();
    if (!s || s.voteAverage === 0 || s.directors.length === 0) return null;
    const dir = s.directors[0];
    const dirFilms = this.catalogService.movies()
      .filter((m) => m.voteAverage > 0 && m.directors.includes(dir))
      .sort((a, b) => b.voteAverage - a.voteAverage);
    if (dirFilms.length < 3) return null;
    const idx = dirFilms.findIndex((m) => m.id === s.id);
    if (idx < 0 || idx >= 10) return null;
    return { rank: idx + 1, director: dir, total: dirFilms.length };
  });

  readonly yearPeers = computed(() => {
    const s = this.summary();
    if (!s) return 0;
    return this.catalogService.movies().filter((m) => m.year === s.year).length;
  });

  readonly ratingPercentile = computed(() => {
    const s = this.summary();
    if (!s || s.voteAverage === 0) return null;
    const rated = this.catalogService.movies().filter((m) => m.voteAverage > 0);
    if (rated.length < 10) return null;
    const rank = rated.filter((m) => m.voteAverage > s.voteAverage).length;
    const pct = Math.round((rank / rated.length) * 100);
    if (pct <= 5) return 'Top 5%';
    if (pct <= 10) return 'Top 10%';
    if (pct <= 25) return 'Top 25%';
    return null;
  });

  readonly directorFilms = computed(() => {
    const s = this.summary();
    if (!s || s.directors.length === 0) return [];
    const dir = s.directors[0];
    return this.catalogService.movies()
      .filter((m) => m.id !== s.id && m.directors.includes(dir))
      .sort((a, b) => b.voteAverage - a.voteAverage)
      .slice(0, 8);
  });

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
    if (event.key === 'j' || event.key === 'k') {
      const movies = this.catalogService.movies();
      const idx = movies.findIndex((m) => m.id === this.id());
      if (idx === -1) return;
      const next = event.key === 'j' ? idx + 1 : idx - 1;
      if (next >= 0 && next < movies.length) {
        this.router.navigate(['/movie', movies[next].id]);
      }
    }
  }

  async ngOnInit(): Promise<void> {
    await this.catalogService.load();
    const summary = this.catalogService.movies().find((m) => m.id === this.id());
    if (!summary) {
      this.loading.set(false);
      this.titleService.setTitle('Film Not Found — BW Cinema');
      return;
    }
    this.titleService.setTitle(`${summary.title} (${summary.year}) — BW Cinema`);
    this.recentlyViewed.add(summary.id);
    this.summary.set(summary);
    const source = this.streaming.getSource(summary.internetArchiveId, summary.youtubeId);
    this.streamingUrl.set(source?.embedUrl ?? null);

    this.updateMetaTags(summary);

    try {
      const detail = await this.movieService.getDetail(summary);
      this.movie.set(detail);
    } catch {
      this.movie.set({
        ...summary,
        overview: '',
        runtime: null,
        tagline: '',
        backdropUrl: null,
        cast: [],
        crew: [],
        tmdbRating: summary.voteAverage,
        imdbRating: null,
        rottenTomatoesRating: null,
        metacriticRating: null,
        releaseDate: '',
        originalLanguage: '',
        productionCountries: [],
      });
    }
    this.loading.set(false);
  }

  addToWatchlist(id: string): void {
    this.collection.addToWatchlist(id);
    this.notifications.show('Added to watchlist', 'success');
  }

  removeFromWatchlist(id: string): void {
    this.collection.removeFromWatchlist(id);
    this.notifications.show('Removed from watchlist', 'info');
  }

  markWatched(id: string): void {
    this.collection.markWatched(id);
    this.notifications.show('Marked as watched', 'success');
  }

  onRate(movieId: string, rating: number): void {
    this.collection.setRating(movieId, rating);
    this.notifications.show(`Rated ${rating} star${rating !== 1 ? 's' : ''}`, 'success');
  }

  getUserRating(movieId: string): number {
    const item = this.collection.watched().find((w) => w.movieId === movieId);
    return item?.userRating ?? 0;
  }

  toggleFavorite(id: string): void {
    this.collection.toggleFavorite(id);
    const msg = this.collection.isFavorite(id) ? 'Added to favorites' : 'Removed from favorites';
    this.notifications.show(msg, 'success');
  }

  onNoteChange(movieId: string, event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.collection.setNote(movieId, value);
  }

  onReviewSave(movieId: string, event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.collection.setReview(movieId, value);
    this.reviewEditing.set(false);
    if (value.trim()) {
      this.notifications.show('Review saved', 'success');
    }
  }

  private updateMetaTags(movie: { title: string; year: number; posterUrl: string | null; directors: string[]; genres: string[] }): void {
    const desc = `${movie.title} (${movie.year}) — ${movie.directors.join(', ')}. ${movie.genres.join(', ')}. Watch classic B&W cinema on BW Cinema.`;
    this.metaService.updateTag({ property: 'og:title', content: `${movie.title} (${movie.year}) — BW Cinema` });
    this.metaService.updateTag({ property: 'og:description', content: desc });
    this.metaService.updateTag({ name: 'twitter:title', content: `${movie.title} (${movie.year}) — BW Cinema` });
    this.metaService.updateTag({ name: 'twitter:description', content: desc });
    this.metaService.updateTag({ name: 'description', content: desc });
    if (movie.posterUrl) {
      this.metaService.updateTag({ property: 'og:image', content: movie.posterUrl });
      this.metaService.updateTag({ name: 'twitter:image', content: movie.posterUrl });
    }
  }

  addToPlaylist(playlistId: string, movieId: string): void {
    this.collection.addToPlaylist(playlistId, movieId);
    const pl = this.collection.playlists().find((p) => p.id === playlistId);
    this.notifications.show(`Added to ${pl?.name ?? 'playlist'}`, 'success');
    this.playlistMenuOpen.set(false);
  }

  shareTwitter(movie: MovieDetail): void {
    const url = window.location.href;
    const text = `${movie.title} (${movie.year}) — Watch classic B&W cinema`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'noopener,width=550,height=420');
    this.shareMenuOpen.set(false);
  }

  shareFacebook(movie: MovieDetail): void {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'noopener,width=550,height=420');
    this.shareMenuOpen.set(false);
  }

  async copyLink(): Promise<void> {
    await navigator.clipboard.writeText(window.location.href);
    this.notifications.show('Link copied to clipboard', 'info');
    this.shareMenuOpen.set(false);
  }

  goBack(): void {
    this.location.back();
  }

  encodeTitle(title: string): string {
    return encodeURIComponent(title);
  }

  private static readonly LANG_NAMES: Record<string, string> = {
    en: 'English', fr: 'French', de: 'German', ja: 'Japanese', it: 'Italian',
    es: 'Spanish', ru: 'Russian', sv: 'Swedish', da: 'Danish', no: 'Norwegian',
    pt: 'Portuguese', nl: 'Dutch', zh: 'Chinese', ko: 'Korean', pl: 'Polish',
    cs: 'Czech', hu: 'Hungarian', fi: 'Finnish', el: 'Greek', ro: 'Romanian',
    tr: 'Turkish', ar: 'Arabic', hi: 'Hindi', bn: 'Bengali', th: 'Thai',
    he: 'Hebrew', uk: 'Ukrainian', fa: 'Persian', id: 'Indonesian', nb: 'Norwegian',
    sh: 'Serbo-Croatian', sr: 'Serbian', hr: 'Croatian', sk: 'Slovak', bg: 'Bulgarian',
    ka: 'Georgian', vi: 'Vietnamese', ta: 'Tamil', te: 'Telugu', mr: 'Marathi',
    ml: 'Malayalam', kn: 'Kannada', is: 'Icelandic', ca: 'Catalan', eu: 'Basque',
    cn: 'Chinese', af: 'Afrikaans', cy: 'Welsh', ga: 'Irish', gl: 'Galician',
  };

  languageName(code: string): string {
    return MovieComponent.LANG_NAMES[code] ?? code.toUpperCase();
  }
}
