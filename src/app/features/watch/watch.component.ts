import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy, signal, input, computed, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl, Title } from '@angular/platform-browser';
import { CatalogService } from '../../core/services/catalog.service';
import { CollectionService } from '../../core/services/collection.service';
import { StreamingService, StreamingSource } from '../../core/services/streaming.service';
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
          <h1>{{ movieTitle() }}</h1>
          <p class="text-secondary">Streaming via {{ src.label }}</p>
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

        <div class="watch__fallback">
          <p>Having trouble?
            <a [href]="src.externalUrl" target="_blank" rel="noopener">
              Watch directly on {{ src.label }} (opens in new tab)
            </a>
          </p>
        </div>
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
    .watch__fallback {
      text-align: center;
      margin-top: var(--space-lg);
      color: var(--text-secondary);
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
  `],
})
export class WatchComponent implements OnInit, OnDestroy {
  readonly id = input.required<string>();

  private readonly catalogService = inject(CatalogService);
  private readonly collectionService = inject(CollectionService);
  private readonly streamingService = inject(StreamingService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly titleService = inject(Title);

  @ViewChild('playerContainer') playerContainer!: ElementRef<HTMLElement>;

  readonly loading = signal(true);
  readonly movieTitle = signal('');
  readonly movieImdbId = signal<string | null>(null);
  readonly encodedTitle = signal('');
  readonly source = signal<StreamingSource | null>(null);
  readonly safeUrl = signal<SafeResourceUrl>('');
  readonly isFullscreen = signal(false);
  readonly similarFilms = signal<MovieSummary[]>([]);

  private fullscreenHandler = () => {
    this.isFullscreen.set(!!document.fullscreenElement);
  };

  async ngOnInit(): Promise<void> {
    await this.catalogService.load();
    const movie = this.catalogService.movies().find((m) => m.id === this.id());
    if (movie) {
      this.movieTitle.set(movie.title);
      this.movieImdbId.set(movie.imdbId);
      this.encodedTitle.set(encodeURIComponent(movie.title));
      this.titleService.setTitle(`Watch ${movie.title} — BW Cinema`);
      const src = this.streamingService.getSource(movie.internetArchiveId, movie.youtubeId);
      this.source.set(src);
      if (src) {
        this.safeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(src.embedUrl));
        this.collectionService.trackProgress(movie.id);
      } else {
        this.similarFilms.set(this.findSimilar(movie));
      }
    }
    this.loading.set(false);
    document.addEventListener('fullscreenchange', this.fullscreenHandler);
  }

  ngOnDestroy(): void {
    document.removeEventListener('fullscreenchange', this.fullscreenHandler);
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
