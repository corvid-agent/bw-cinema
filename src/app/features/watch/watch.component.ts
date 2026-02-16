import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy, signal, input, computed, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl, Title } from '@angular/platform-browser';
import { CatalogService } from '../../core/services/catalog.service';
import { CollectionService } from '../../core/services/collection.service';
import { StreamingService, StreamingSource } from '../../core/services/streaming.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import type { MovieSummary } from '../../core/models/movie.model';

@Component({
  selector: 'app-watch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LoadingSpinnerComponent],
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
      <div class="container" style="padding: var(--space-2xl) 0; text-align: center;">
        <h2>Film not available for streaming</h2>
        <p class="text-secondary">This film is not currently available for online viewing.</p>
        <a class="btn-primary" [routerLink]="['/movie', id()]">Back to Film Details</a>
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
  readonly source = signal<StreamingSource | null>(null);
  readonly safeUrl = signal<SafeResourceUrl>('');
  readonly isFullscreen = signal(false);

  private fullscreenHandler = () => {
    this.isFullscreen.set(!!document.fullscreenElement);
  };

  async ngOnInit(): Promise<void> {
    await this.catalogService.load();
    const movie = this.catalogService.movies().find((m) => m.id === this.id());
    if (movie) {
      this.movieTitle.set(movie.title);
      this.titleService.setTitle(`Watch ${movie.title} — BW Cinema`);
      const src = this.streamingService.getSource(movie.internetArchiveId, movie.youtubeId);
      this.source.set(src);
      if (src) {
        this.safeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(src.embedUrl));
        this.collectionService.trackProgress(movie.id);
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
