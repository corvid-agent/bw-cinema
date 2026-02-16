import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { MovieGridComponent } from '../../shared/components/movie-grid.component';
import { SearchBarComponent } from '../../shared/components/search-bar.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { KeyboardNavDirective } from '../../shared/directives/keyboard-nav.directive';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MovieGridComponent, SearchBarComponent, LoadingSpinnerComponent, KeyboardNavDirective],
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
      <app-loading-spinner />
    } @else {
      <section class="section container" aria-label="Featured films">
        <div class="section__header">
          <h2>Featured Films</h2>
          <a class="section__link" routerLink="/browse">View all &rarr;</a>
        </div>
        <div appKeyboardNav>
          <app-movie-grid [movies]="catalog.featured()" />
        </div>
      </section>

      @if (decades().length > 0) {
        <section class="section container" aria-label="Browse by decade">
          <h2>Browse by Decade</h2>
          <div class="decades">
            @for (decade of decades(); track decade) {
              <button class="decade-card" (click)="browseTo(decade)">
                <span class="decade-card__year">{{ decade }}s</span>
                <span class="decade-card__arrow">&rarr;</span>
              </button>
            }
          </div>
        </section>
      }

      @if (genres().length > 0) {
        <section class="section container" aria-label="Popular genres">
          <h2>Popular Genres</h2>
          <div class="genres">
            @for (genre of genres(); track genre) {
              <button class="genre-tag" (click)="browseGenre(genre)">{{ genre }}</button>
            }
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
    @media (max-width: 768px) {
      .hero { padding: var(--space-2xl) 0 var(--space-xl); }
      .hero__title { font-size: 2.2rem; }
      .hero__stats { gap: var(--space-xl); }
      .hero__stat-value { font-size: 1.4rem; }
    }
  `],
})
export class HomeComponent implements OnInit {
  protected readonly catalog = inject(CatalogService);
  private readonly router = inject(Router);

  readonly decades = computed(() => this.catalog.meta()?.decades ?? []);
  readonly genres = computed(() => this.catalog.meta()?.genres.slice(0, 12) ?? []);
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
}
