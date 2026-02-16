import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { MovieGridComponent } from '../../shared/components/movie-grid.component';
import { SearchBarComponent } from '../../shared/components/search-bar.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MovieGridComponent, SearchBarComponent, LoadingSpinnerComponent],
  template: `
    <section class="hero">
      <div class="container">
        <h1 class="hero__title">Discover Classic<br /><span class="text-gold">Black &amp; White</span> Cinema</h1>
        <p class="hero__subtitle">Explore hundreds of timeless films from the golden age of cinema</p>
        <div class="hero__search">
          <app-search-bar (searched)="onSearch($event)" />
        </div>
      </div>
    </section>

    @if (catalog.loading()) {
      <app-loading-spinner />
    } @else {
      <section class="section container">
        <h2>Featured Films</h2>
        <p class="text-secondary">Top-rated films available to watch free</p>
        <app-movie-grid [movies]="catalog.featured()" />
      </section>

      @if (decades().length > 0) {
        <section class="section container">
          <h2>Browse by Decade</h2>
          <div class="decades">
            @for (decade of decades(); track decade) {
              <button class="decade-card" (click)="browseTo(decade)">
                <span class="decade-card__label">{{ decade }}s</span>
              </button>
            }
          </div>
        </section>
      }

      @if (genres().length > 0) {
        <section class="section container">
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
      background-color: var(--bg-surface);
      padding: var(--space-2xl) 0;
      text-align: center;
      border-bottom: 1px solid var(--border);
    }
    .hero__title {
      font-size: 2.8rem;
      margin-bottom: var(--space-md);
    }
    .hero__subtitle {
      color: var(--text-secondary);
      font-size: 1.2rem;
      margin: 0 0 var(--space-xl);
    }
    .hero__search {
      max-width: 600px;
      margin: 0 auto;
    }
    .section {
      padding: var(--space-2xl) 0;
    }
    .decades {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: var(--space-md);
      margin-top: var(--space-lg);
    }
    .decade-card {
      background-color: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: var(--space-xl) var(--space-md);
      text-align: center;
      cursor: pointer;
      transition: border-color 0.2s, transform 0.2s;
    }
    .decade-card:hover {
      border-color: var(--accent-gold);
      transform: translateY(-2px);
    }
    .decade-card__label {
      font-family: var(--font-heading);
      font-size: 1.4rem;
      color: var(--accent-gold);
    }
    .genres {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-sm);
      margin-top: var(--space-lg);
    }
    .genre-tag {
      background-color: var(--bg-raised);
      color: var(--text-primary);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: var(--space-sm) var(--space-lg);
      font-size: 0.95rem;
      cursor: pointer;
      transition: border-color 0.2s, background-color 0.2s;
    }
    .genre-tag:hover {
      border-color: var(--accent-gold);
      background-color: var(--accent-gold-dim);
    }
    @media (max-width: 768px) {
      .hero__title { font-size: 2rem; }
    }
  `],
})
export class HomeComponent implements OnInit {
  protected readonly catalog = inject(CatalogService);
  private readonly router = inject(Router);

  readonly decades = computed(() => this.catalog.meta()?.decades ?? []);
  readonly genres = computed(() => this.catalog.meta()?.genres.slice(0, 12) ?? []);

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
