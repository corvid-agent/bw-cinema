import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { CollectionService } from '../../core/services/collection.service';
import { RecentlyViewedService } from '../../core/services/recently-viewed.service';
import { MovieGridComponent } from '../../shared/components/movie-grid.component';
import { SearchBarComponent } from '../../shared/components/search-bar.component';
import { SkeletonGridComponent } from '../../shared/components/skeleton-grid.component';
import { KeyboardNavDirective } from '../../shared/directives/keyboard-nav.directive';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MovieGridComponent, SearchBarComponent, SkeletonGridComponent, KeyboardNavDirective, RouterLink],
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
        </div>
      </div>
    </section>

    @if (catalog.loading()) {
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
              @if (fotd.voteAverage > 0) {
                <p class="fotd__rating">&#9733; {{ fotd.voteAverage.toFixed(1) }}</p>
              }
              <span class="fotd__cta">View Details &rarr;</span>
            </div>
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
        <section class="section container" aria-label="Hidden gems">
          <div class="section__header">
            <h2>Hidden Gems</h2>
            <span class="section__desc">Highly rated films with under 1,000 votes</span>
          </div>
          <div class="gems__scroll">
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
          </div>
        </section>
      }

      @if (decades().length > 0) {
        <section class="section container" aria-label="Browse by decade">
          <h2>Browse by Decade</h2>
          <div class="decades">
            @for (decade of decades(); track decade) {
              <a class="decade-card" [routerLink]="['/decade', decade]">
                <span class="decade-card__year">{{ decade }}s</span>
                <span class="decade-card__arrow">&rarr;</span>
              </a>
            }
          </div>
        </section>
      }

      @if (genres().length > 0) {
        <section class="section container" aria-label="Popular genres">
          <h2>Popular Genres</h2>
          <div class="genres">
            @for (genre of genres(); track genre) {
              <a class="genre-tag" [routerLink]="['/genre', genre]">{{ genre }}</a>
            }
          </div>
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
          <div appKeyboardNav>
            <app-movie-grid [movies]="watchlistNext()" />
          </div>
        </section>
      }

      @if (recommendations().length > 0) {
        <section class="section container" aria-label="Recommended for you">
          <div class="section__header">
            <h2>Recommended for You</h2>
            <a class="section__link" routerLink="/browse">Browse all &rarr;</a>
          </div>
          <div appKeyboardNav>
            <app-movie-grid [movies]="recommendations()" />
          </div>
        </section>
      }

      <section class="section container cta-row" aria-label="Discover more">
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
    .decade-card__year {
      font-family: var(--font-heading);
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--text-primary);
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
    .fotd__rating {
      color: var(--accent-gold);
      font-family: var(--font-heading);
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0 0 var(--space-sm);
    }
    .fotd__cta {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--accent-gold);
    }
    .gems__scroll {
      display: flex;
      gap: var(--space-md);
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      padding-bottom: var(--space-sm);
      -webkit-overflow-scrolling: touch;
      margin-top: var(--space-md);
    }
    .gems__scroll::-webkit-scrollbar { height: 6px; }
    .gems__scroll::-webkit-scrollbar-track { background: var(--bg-raised); border-radius: 3px; }
    .gems__scroll::-webkit-scrollbar-thumb { background: var(--border-bright); border-radius: 3px; }
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
    @media (max-width: 768px) {
      .cta-row { grid-template-columns: 1fr; }
      .hero { padding: var(--space-2xl) 0 var(--space-xl); }
      .hero__title { font-size: 2.2rem; }
      .hero__stats { gap: var(--space-xl); }
      .hero__stat-value { font-size: 1.4rem; }
      .fotd__card { flex-direction: column; gap: var(--space-md); }
      .fotd__poster { width: 100%; max-width: 200px; }
    }
    @media (max-width: 480px) {
      .hero__title { font-size: 1.8rem; }
      .hero__subtitle { font-size: 1rem; }
      .hero__stats { flex-wrap: wrap; gap: var(--space-lg); }
    }
  `],
})
export class HomeComponent implements OnInit {
  protected readonly catalog = inject(CatalogService);
  private readonly router = inject(Router);
  private readonly collectionService = inject(CollectionService);
  private readonly recentlyViewedService = inject(RecentlyViewedService);

  readonly currentYear = new Date().getFullYear();
  readonly decades = computed(() => this.catalog.meta()?.decades ?? []);
  readonly genres = computed(() => this.catalog.meta()?.genres.slice(0, 12) ?? []);
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

  readonly hiddenGems = computed(() =>
    this.catalog.movies()
      .filter((m) => m.voteAverage >= 7.0 && m.voteAverage <= 8.0 && m.isStreamable && m.posterUrl)
      .sort(() => Math.random() - 0.5)
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

  readonly recommendations = computed(() =>
    this.catalog.getRecommendations(this.collectionService.watchedIds())
  );
  readonly filmCount = computed(() => {
    const total = this.catalog.meta()?.totalMovies ?? 0;
    return total > 1000 ? `${(total / 1000).toFixed(1)}k` : `${total}`;
  });
  readonly streamableCount = computed(() => {
    const count = this.catalog.movies().filter((m) => m.isStreamable).length;
    return count > 1000 ? `${(count / 1000).toFixed(1)}k` : `${count}`;
  });
  readonly decadeSpan = computed(() => {
    const d = this.decades();
    if (d.length < 2) return `${d.length}`;
    return `${d[0]}s–${d[d.length - 1]}s`;
  });

  ngOnInit(): void {
    this.catalog.load();
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

  surpriseMe(): void {
    const streamable = this.catalog.movies().filter((m) => m.isStreamable);
    if (streamable.length === 0) return;
    const pick = streamable[Math.floor(Math.random() * streamable.length)];
    this.router.navigate(['/movie', pick.id]);
  }
}
