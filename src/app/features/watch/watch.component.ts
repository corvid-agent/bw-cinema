import { Component, ChangeDetectionStrategy, inject, OnInit, signal, input, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl, Title } from '@angular/platform-browser';
import { CatalogService } from '../../core/services/catalog.service';
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

        <div class="watch__player">
          <iframe
            [src]="safeUrl()"
            [title]="'Watch ' + movieTitle()"
            allowfullscreen
            sandbox="allow-same-origin allow-scripts allow-popups"
          ></iframe>
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
    .watch__fallback {
      text-align: center;
      margin-top: var(--space-lg);
      color: var(--text-secondary);
    }
  `],
})
export class WatchComponent implements OnInit {
  readonly id = input.required<string>();

  private readonly catalogService = inject(CatalogService);
  private readonly streamingService = inject(StreamingService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly titleService = inject(Title);

  readonly loading = signal(true);
  readonly movieTitle = signal('');
  readonly source = signal<StreamingSource | null>(null);
  readonly safeUrl = signal<SafeResourceUrl>('');

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
      }
    }
    this.loading.set(false);
  }
}
