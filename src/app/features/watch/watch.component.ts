import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy, signal, input, computed, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl, Title } from '@angular/platform-browser';
import { CatalogService } from '../../core/services/catalog.service';
import { CollectionService } from '../../core/services/collection.service';
import { StreamingService, StreamingSource } from '../../core/services/streaming.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { MovieGridComponent } from '../../shared/components/movie-grid.component';
import type { MovieSummary } from '../../core/models/movie.model';

@Component({
  selector: 'app-watch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LoadingSpinnerComponent, MovieGridComponent],
  template: `
    @if (loading()) {
      <app-loading-spinner />
    } @else if (source(); as src) {
      <div class="watch container">
        <div class="watch__header">
          <a [routerLink]="['/movie', id()]" class="watch__back">&larr; Back to details</a>
          <h1>{{ movieTitle() }}@if (movieYear()) { <span class="watch__header-year">({{ movieYear() }})</span>}</h1>
          @if (movieGenres()) {
            <p class="watch__genres">{{ movieGenres() }}</p>
          }
          <p class="text-secondary">
            Streaming via {{ src.label }}
            @if (movieRating()) {
              <span class="watch__header-rating">&middot; &#9733; {{ movieRating() }}</span>
            }
            @if (directorName()) {
              <span class="watch__header-rating">&middot; <a [routerLink]="['/director', directorName()]" class="watch__header-director">{{ directorName() }}</a></span>
            }
            @if (filmAge()) {
              <span class="watch__header-rating">&middot; {{ filmAge() }}</span>
            }
            @if (movieLanguage()) {
              <span class="watch__header-rating">&middot; {{ movieLanguage() }}</span>
            }
          </p>
        </div>

        <div class="watch__player" #playerContainer>
          <iframe
            [src]="safeUrl()"
            [title]="'Watch ' + movieTitle()"
            allowfullscreen
            sandbox="allow-same-origin allow-scripts allow-popups"
          ></iframe>
          <button
            class="watch__fullscreen-btn"
            (click)="toggleFullscreen()"
            [attr.aria-label]="isFullscreen() ? 'Exit fullscreen' : 'Enter fullscreen'"
            [attr.title]="isFullscreen() ? 'Exit fullscreen' : 'Fullscreen'"
          >
            @if (isFullscreen()) {
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
            } @else {
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
            }
          </button>
        </div>

        <div class="watch__shortcuts">
          <span class="watch__shortcut"><kbd>f</kbd> fullscreen</span>
        </div>

        <div class="watch__actions">
          @if (!isWatched()) {
            <button class="watch__mark-btn" (click)="markWatched()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Mark as Watched
            </button>
          } @else {
            <span class="watch__watched-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Watched
              @if (watchedAgo()) {
                <span class="watch__watched-ago">{{ watchedAgo() }}</span>
              }
            </span>
          }
          <a class="watch__external-link" [href]="src.externalUrl" target="_blank" rel="noopener">
            Watch on {{ src.label }} &nearr;
          </a>
          <button class="watch__share-btn" (click)="shareFilm()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Share
          </button>
        </div>

        @if (directorFilms().length > 0) {
          <div class="watch__more-director">
            <h3 class="watch__more-director-title">More from {{ directorName() }}@if (directorTotalFilms() > 2) { <span class="watch__header-year">({{ directorTotalFilms() }} in catalog)</span>}</h3>
            <div class="watch__more-director-row">
              @for (m of directorFilms(); track m.id) {
                <a class="watch__director-film" [routerLink]="m.isStreamable ? ['/watch', m.id] : ['/movie', m.id]">
                  @if (m.posterUrl) {
                    <img [src]="m.posterUrl" [alt]="m.title" loading="lazy" />
                  } @else {
                    <div class="watch__director-film-placeholder">{{ m.title[0] }}</div>
                  }
                  <span class="watch__director-film-title">{{ m.title }}</span>
                  <span class="watch__director-film-year">{{ m.year }}</span>
                </a>
              }
            </div>
          </div>
        }

        @if (upNext(); as next) {
          <div class="watch__up-next">
            <span class="watch__up-next-label">Up Next</span>
            @if (upNextReason()) {
              <span class="watch__up-next-reason">{{ upNextReason() }}</span>
            }
            <a class="watch__up-next-card" [routerLink]="['/watch', next.id]">
              @if (next.posterUrl) {
                <img [src]="next.posterUrl" [alt]="next.title" />
              }
              <div class="watch__up-next-info">
                <strong>{{ next.title }}</strong>
                <span>{{ next.year }} · {{ next.genres.slice(0, 2).join(', ') }}</span>
                @if (next.voteAverage > 0) {
                  <span class="watch__up-next-rating">&#9733; {{ next.voteAverage.toFixed(1) }}</span>
                }
              </div>
            </a>
          </div>
        }
      </div>
    } @else {
      <div class="watch__unavailable container">
        <div class="watch__unavail-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/></svg>
        </div>
        <h2>Not Available for Free Streaming</h2>
        <p class="watch__unavail-explain">
          <strong>{{ movieTitle() }}</strong> is likely still under copyright protection and
          hasn't been released to the public domain. Only films whose copyrights have expired
          or were never properly renewed can be freely streamed.
        </p>
        <div class="watch__fallback-actions">
          @if (movieImdbId()) {
            <a class="btn-secondary watch__fallback-btn" [href]="'https://www.imdb.com/title/' + movieImdbId()" target="_blank" rel="noopener">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              View on IMDb
            </a>
          }
          <a class="btn-secondary watch__fallback-btn" [href]="'https://archive.org/search?query=' + encodedTitle()" target="_blank" rel="noopener">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Search Internet Archive
          </a>
          <a class="btn-primary watch__fallback-btn" [routerLink]="['/movie', id()]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back to Film Details
          </a>
        </div>
        <div class="watch__unavail-info">
          <h3>About Public Domain Films</h3>
          <p>
            Films enter the public domain when their copyright expires. In the US, works published
            before 1928 are automatically in the public domain. Many later films also entered the
            public domain due to failure to renew copyright registrations. The Internet Archive
            hosts over 30,000 freely viewable films.
          </p>
          <a routerLink="/about" class="watch__learn-more">Learn more &rarr;</a>
        </div>

        @if (similarFilms().length > 0) {
          <div class="watch__similar">
            <h3>Similar Films You Can Watch</h3>
            <app-movie-grid [movies]="similarFilms()" />
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .watch { padding: var(--space-xl) 0; }
    .watch__header { margin-bottom: var(--space-lg); }
    .watch__genres {
      font-size: 0.85rem;
      color: var(--accent-gold);
      margin: 0 0 var(--space-xs);
    }
    .watch__header-year {
      font-weight: 400;
      color: var(--text-secondary);
      font-size: 0.85em;
    }
    .watch__header-rating {
      color: var(--accent-gold);
      font-weight: 600;
    }
    .watch__header-director {
      color: var(--accent-gold);
      text-decoration: none;
    }
    .watch__header-director:hover {
      text-decoration: underline;
    }
    .watch__back {
      display: inline-block;
      margin-bottom: var(--space-md);
      font-size: 0.95rem;
    }
    .watch__player {
      position: relative;
      width: 100%;
      max-width: 960px;
      margin: 0 auto;
      aspect-ratio: 4 / 3;
      background-color: #000;
      border-radius: var(--radius);
      overflow: hidden;
      box-shadow: var(--shadow-lg);
    }
    .watch__player iframe {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      border: none;
    }
    .watch__fullscreen-btn {
      position: absolute;
      bottom: 12px;
      right: 12px;
      width: 48px;
      height: 48px;
      min-width: 48px;
      min-height: 48px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: var(--radius);
      color: #fff;
      cursor: pointer;
      backdrop-filter: blur(4px);
      transition: background-color 0.2s, border-color 0.2s;
      z-index: 10;
    }
    .watch__fullscreen-btn:hover {
      background: rgba(0, 0, 0, 0.9);
      border-color: var(--accent-gold);
      color: var(--accent-gold);
    }
    :host-context(:fullscreen) .watch__player {
      max-width: 100%;
      border-radius: 0;
    }
    .watch__actions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-md);
      margin-top: var(--space-lg);
      flex-wrap: wrap;
    }
    .watch__mark-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-sm) var(--space-xl);
      background: linear-gradient(135deg, var(--accent-gold) 0%, #c49b2c 100%);
      color: var(--bg-deep);
      border: none;
      border-radius: var(--radius-lg);
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .watch__mark-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(212, 175, 55, 0.3);
    }
    .watch__watched-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--space-xs);
      padding: var(--space-sm) var(--space-lg);
      background: var(--accent-gold-dim);
      color: var(--accent-gold);
      border-radius: var(--radius-lg);
      font-size: 0.9rem;
      font-weight: 600;
    }
    .watch__watched-ago {
      font-size: 0.75rem;
      font-weight: 400;
      color: var(--text-tertiary);
      margin-left: 4px;
    }
    .watch__external-link {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
    .watch__share-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: var(--space-sm) var(--space-md);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .watch__share-btn:hover {
      border-color: var(--accent-gold);
      color: var(--accent-gold);
    }
    .watch__more-director {
      max-width: 960px;
      margin: var(--space-xl) auto 0;
    }
    .watch__more-director-title {
      font-size: 1rem;
      margin-bottom: var(--space-md);
      color: var(--text-secondary);
    }
    .watch__more-director-row {
      display: flex;
      gap: var(--space-md);
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      padding-bottom: var(--space-xs);
    }
    .watch__director-film {
      flex-shrink: 0;
      width: 100px;
      text-decoration: none;
      color: inherit;
      text-align: center;
      transition: transform 0.2s;
    }
    .watch__director-film:hover {
      transform: translateY(-2px);
    }
    .watch__director-film img {
      width: 100px;
      aspect-ratio: 2 / 3;
      object-fit: cover;
      border-radius: var(--radius);
      margin-bottom: 4px;
    }
    .watch__director-film-placeholder {
      width: 100px;
      aspect-ratio: 2 / 3;
      background: var(--bg-raised);
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-heading);
      color: var(--text-tertiary);
      font-size: 1.2rem;
      margin-bottom: 4px;
    }
    .watch__director-film-title {
      display: block;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .watch__director-film-year {
      display: block;
      font-size: 0.7rem;
      color: var(--text-tertiary);
    }
    .watch__up-next {
      max-width: 500px;
      margin: var(--space-xl) auto 0;
    }
    .watch__up-next-label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-tertiary);
      margin-bottom: var(--space-sm);
    }
    .watch__up-next-reason {
      display: inline-block;
      font-size: 0.75rem;
      color: var(--accent-gold);
      background: var(--accent-gold-dim);
      padding: 2px 10px;
      border-radius: 8px;
      margin-bottom: var(--space-xs);
    }
    .watch__up-next-card {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-md);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      text-decoration: none;
      color: inherit;
      transition: border-color 0.2s, background-color 0.2s;
    }
    .watch__up-next-card:hover {
      border-color: var(--accent-gold);
      background: var(--bg-raised);
      color: inherit;
    }
    .watch__up-next-card img {
      width: 48px;
      height: 72px;
      object-fit: cover;
      border-radius: var(--radius-sm);
      aspect-ratio: 2 / 3;
      flex-shrink: 0;
    }
    .watch__up-next-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .watch__up-next-info strong {
      font-size: 0.95rem;
      color: var(--text-primary);
    }
    .watch__up-next-info span {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
    .watch__up-next-rating {
      color: var(--accent-gold) !important;
      font-weight: 600;
    }
    .watch__unavailable {
      padding: var(--space-2xl) 0;
      text-align: center;
    }
    .watch__fallback-actions {
      display: flex;
      gap: var(--space-md);
      justify-content: center;
      flex-wrap: wrap;
      margin: var(--space-xl) 0;
    }
    .watch__fallback-btn {
      display: inline-block;
      padding: var(--space-md) var(--space-xl);
      border-radius: var(--radius-lg);
      font-size: 0.95rem;
    }
    .watch__unavail-icon {
      color: var(--text-tertiary);
      margin-bottom: var(--space-lg);
    }
    .watch__unavail-explain {
      color: var(--text-secondary);
      max-width: 520px;
      margin: 0 auto var(--space-sm);
      line-height: 1.7;
    }
    .watch__unavail-explain strong {
      color: var(--text-primary);
    }
    .watch__fallback-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-sm);
    }
    .watch__unavail-info {
      max-width: 520px;
      margin: var(--space-2xl) auto 0;
      padding: var(--space-lg);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      text-align: left;
    }
    .watch__unavail-info h3 {
      font-size: 0.95rem;
      margin: 0 0 var(--space-sm);
      color: var(--text-primary);
    }
    .watch__unavail-info p {
      font-size: 0.9rem;
      color: var(--text-secondary);
      line-height: 1.7;
      margin: 0 0 var(--space-sm);
    }
    .watch__learn-more {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--accent-gold);
    }
    .watch__similar {
      max-width: 800px;
      margin: var(--space-2xl) auto 0;
      text-align: left;
    }
    .watch__similar h3 {
      font-size: 1.2rem;
      margin-bottom: var(--space-lg);
    }
    .watch__shortcuts {
      display: flex;
      justify-content: center;
      gap: var(--space-md);
      margin-top: var(--space-sm);
    }
    .watch__shortcut {
      font-size: 0.75rem;
      color: var(--text-tertiary);
    }
    .watch__shortcut kbd {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 4px;
      background: var(--bg-raised);
      border: 1px solid var(--border);
      font-family: var(--font-body);
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--text-secondary);
      margin-right: 3px;
    }
    @media (hover: none) {
      .watch__shortcuts { display: none; }
    }
  `],
})
export class WatchComponent implements OnInit, OnDestroy {
  readonly id = input.required<string>();

  private readonly catalogService = inject(CatalogService);
  private readonly collectionService = inject(CollectionService);
  private readonly streamingService = inject(StreamingService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly titleService = inject(Title);
  private readonly notifications = inject(NotificationService);

  @ViewChild('playerContainer') playerContainer!: ElementRef<HTMLElement>;

  readonly loading = signal(true);
  readonly movieTitle = signal('');
  readonly movieImdbId = signal<string | null>(null);
  readonly encodedTitle = signal('');
  readonly source = signal<StreamingSource | null>(null);
  readonly safeUrl = signal<SafeResourceUrl>('');
  readonly isFullscreen = signal(false);
  readonly isWatched = signal(false);
  readonly upNext = signal<MovieSummary | null>(null);
  readonly upNextReason = signal<string>('');
  readonly similarFilms = signal<MovieSummary[]>([]);
  readonly directorFilms = signal<MovieSummary[]>([]);
  readonly directorName = signal('');
  readonly watchedAgo = signal('');
  readonly movieGenres = signal('');
  readonly movieRating = signal('');
  readonly movieYear = signal('');
  readonly filmAge = signal('');
  readonly directorTotalFilms = signal(0);
  readonly movieLanguage = signal('');

  private fullscreenHandler = () => {
    this.isFullscreen.set(!!document.fullscreenElement);
  };

  private keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'f' && !e.ctrlKey && !e.metaKey && !e.altKey && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
      e.preventDefault();
      this.toggleFullscreen();
    }
  };

  async ngOnInit(): Promise<void> {
    await this.catalogService.load();
    const movie = this.catalogService.movies().find((m) => m.id === this.id());
    if (movie) {
      this.movieTitle.set(movie.title);
      this.movieImdbId.set(movie.imdbId);
      this.encodedTitle.set(encodeURIComponent(movie.title));
      if (movie.genres.length > 0) this.movieGenres.set(movie.genres.slice(0, 3).join(' / '));
      if (movie.voteAverage > 0) this.movieRating.set(movie.voteAverage.toFixed(1));
      this.movieYear.set(String(movie.year));
      if (movie.language && movie.language !== 'English') this.movieLanguage.set(movie.language);
      const age = new Date().getFullYear() - movie.year;
      if (age >= 50) this.filmAge.set(`${age} years old`);
      this.titleService.setTitle(`Watch ${movie.title} — BW Cinema`);
      const src = this.streamingService.getSource(movie.internetArchiveId, movie.youtubeId);
      this.source.set(src);
      this.isWatched.set(this.collectionService.isWatched(movie.id));
      if (this.isWatched()) {
        const entry = this.collectionService.watched().find((w) => w.movieId === movie.id);
        if (entry) this.watchedAgo.set(this.timeAgo(entry.watchedAt));
      }
      if (src) {
        this.safeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(src.embedUrl));
        this.collectionService.trackProgress(movie.id);
        const nextResult = this.findUpNext(movie);
        this.upNext.set(nextResult.movie);
        this.upNextReason.set(nextResult.reason);
        if (movie.directors.length > 0) {
          this.directorName.set(movie.directors[0]);
          const allDirFilms = this.catalogService.movies()
            .filter((m) => m.id !== movie.id && m.directors.some((d) => movie.directors.includes(d)));
          this.directorTotalFilms.set(allDirFilms.length + 1);
          const dirFilms = allDirFilms
            .filter((m) => m.posterUrl)
            .sort((a, b) => b.voteAverage - a.voteAverage)
            .slice(0, 8);
          this.directorFilms.set(dirFilms);
        }
      } else {
        this.similarFilms.set(this.findSimilar(movie));
      }
    }
    this.loading.set(false);
    document.addEventListener('fullscreenchange', this.fullscreenHandler);
    document.addEventListener('keydown', this.keyHandler);
  }

  ngOnDestroy(): void {
    document.removeEventListener('fullscreenchange', this.fullscreenHandler);
    document.removeEventListener('keydown', this.keyHandler);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }

  private findSimilar(movie: MovieSummary): MovieSummary[] {
    const genreSet = new Set(movie.genres.map((g) => g.toLowerCase()));
    const decade = Math.floor(movie.year / 10) * 10;
    return this.catalogService.movies()
      .filter((m) => m.id !== movie.id && m.isStreamable)
      .map((m) => {
        let score = 0;
        const mGenres = m.genres.map((g) => g.toLowerCase());
        for (const g of mGenres) if (genreSet.has(g)) score += 3;
        if (Math.floor(m.year / 10) * 10 === decade) score += 2;
        if (m.voteAverage >= 6) score += 1;
        return { movie: m, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || b.movie.voteAverage - a.movie.voteAverage)
      .slice(0, 6)
      .map((x) => x.movie);
  }

  markWatched(): void {
    const movieId = this.id();
    if (this.collectionService.isWatched(movieId)) return;
    this.collectionService.markWatched(movieId);
    this.isWatched.set(true);
    this.watchedAgo.set('just now');
    this.notifications.show(`Marked "${this.movieTitle()}" as watched`, 'success');
  }

  private findUpNext(movie: MovieSummary): { movie: MovieSummary | null; reason: string } {
    const watchlistIds = this.collectionService.watchlistIds();
    const watchedIds = this.collectionService.watchedIds();
    const genreSet = new Set(movie.genres.map((g) => g.toLowerCase()));
    const candidates = this.catalogService.movies()
      .filter((m) => m.id !== movie.id && m.isStreamable && !watchedIds.has(m.id) && m.posterUrl)
      .map((m) => {
        let score = 0;
        const inWatchlist = watchlistIds.has(m.id);
        if (inWatchlist) score += 5;
        const sharedGenres = m.genres.filter((g) => genreSet.has(g.toLowerCase()));
        score += sharedGenres.length * 2;
        const sameDirector = m.directors.some((d) => movie.directors.includes(d));
        if (sameDirector) score += 3;
        if (m.voteAverage >= 7) score += 1;
        return { movie: m, score, inWatchlist, sharedGenres, sameDirector };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);

    if (candidates.length === 0) return { movie: null, reason: '' };
    const pick = candidates[0];
    let reason = '';
    if (pick.inWatchlist) reason = 'From your watchlist';
    else if (pick.sameDirector) reason = `Same director`;
    else if (pick.sharedGenres.length > 0) reason = `Similar: ${pick.sharedGenres[0]}`;
    return { movie: pick.movie, reason };
  }

  shareFilm(): void {
    const url = `${window.location.origin}/watch/${this.id()}`;
    navigator.clipboard.writeText(url).then(() => {
      this.notifications.show('Watch link copied to clipboard', 'success');
    }).catch(() => {
      this.notifications.show('Failed to copy link', 'error');
    });
  }

  private timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'yesterday';
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }

  toggleFullscreen(): void {
    if (!this.playerContainer) return;
    const el = this.playerContainer.nativeElement;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      el.requestFullscreen().catch(() => {});
    }
  }
}
