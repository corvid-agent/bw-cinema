import { Component, ChangeDetectionStrategy, inject, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';

@Component({
  selector: 'app-stats',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="stats container">
      <h1>Catalog Statistics</h1>
      <p class="stats__subtitle">A look at the numbers behind our collection of classic cinema.</p>

      @if (catalog.loading()) {
        <app-loading-spinner />
      } @else {
        <div class="stats__overview">
          <div class="stats__card">
            <span class="stats__card-value">{{ totalFilms() }}</span>
            <span class="stats__card-label">Total Films</span>
          </div>
          <div class="stats__card">
            <span class="stats__card-value">{{ streamableFilms() }}</span>
            <span class="stats__card-label">Free to Watch</span>
          </div>
          <div class="stats__card">
            <span class="stats__card-value">{{ avgRating() }}</span>
            <span class="stats__card-label">Avg. Rating</span>
          </div>
          <div class="stats__card">
            <span class="stats__card-value">{{ yearRange() }}</span>
            <span class="stats__card-label">Year Range</span>
          </div>
        </div>

        <div class="stats__sections">
          <section class="stats__section">
            <h2>Films by Decade</h2>
            <div class="stats__bars">
              @for (d of decadeStats(); track d.name) {
                <a class="stats__bar-row stats__bar-row--link" [routerLink]="['/decade', d.decade]">
                  <span class="stats__bar-label">{{ d.name }}</span>
                  <div class="stats__bar-track">
                    <div class="stats__bar-fill" [style.width.%]="d.pct"></div>
                  </div>
                  <span class="stats__bar-count">{{ d.count }}</span>
                </a>
              }
            </div>
          </section>

          <section class="stats__section">
            <h2>Top Genres</h2>
            <div class="stats__bars">
              @for (g of genreStats(); track g.name) {
                <a class="stats__bar-row stats__bar-row--link" [routerLink]="['/genre', g.name]">
                  <span class="stats__bar-label">{{ g.name }}</span>
                  <div class="stats__bar-track">
                    <div class="stats__bar-fill" [style.width.%]="g.pct"></div>
                  </div>
                  <span class="stats__bar-count">{{ g.count }}</span>
                </a>
              }
            </div>
          </section>
        </div>

        <div class="stats__sections">
          <section class="stats__section">
            <h2>Top Directors</h2>
            <div class="stats__bars">
              @for (d of directorStats(); track d.name) {
                <a class="stats__bar-row stats__bar-row--link" [routerLink]="['/director', d.name]">
                  <span class="stats__bar-label">{{ d.name }}</span>
                  <div class="stats__bar-track">
                    <div class="stats__bar-fill" [style.width.%]="d.pct"></div>
                  </div>
                  <span class="stats__bar-count">{{ d.count }}</span>
                </a>
              }
            </div>
          </section>

          <section class="stats__section">
            <h2>Languages</h2>
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
        </div>
      }
    </div>
  `,
  styles: [`
    .stats { padding: var(--space-xl) 0; }
    .stats__subtitle {
      color: var(--text-tertiary);
      margin: 0 0 var(--space-xl);
    }
    .stats__overview {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: var(--space-md);
      margin-bottom: var(--space-2xl);
    }
    .stats__card {
      background-color: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-lg);
      text-align: center;
    }
    .stats__card-value {
      display: block;
      font-family: var(--font-heading);
      font-size: 2rem;
      font-weight: 700;
      color: var(--accent-gold);
      margin-bottom: 4px;
    }
    .stats__card-label {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-tertiary);
    }
    .stats__sections {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-xl);
      margin-bottom: var(--space-xl);
    }
    .stats__section h2 {
      margin-bottom: var(--space-md);
    }
    .stats__bars {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }
    .stats__bar-row {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }
    .stats__bar-row--link {
      text-decoration: none;
      color: inherit;
      border-radius: var(--radius);
      padding: 2px 0;
      transition: background-color 0.15s;
    }
    .stats__bar-row--link:hover {
      background-color: var(--bg-hover);
    }
    .stats__bar-row--link:hover .stats__bar-label {
      color: var(--accent-gold);
    }
    .stats__bar-label {
      min-width: 90px;
      font-size: 0.85rem;
      color: var(--text-secondary);
      text-align: right;
      transition: color 0.15s;
    }
    .stats__bar-track {
      flex: 1;
      height: 8px;
      background-color: var(--bg-raised);
      border-radius: 4px;
      overflow: hidden;
    }
    .stats__bar-fill {
      height: 100%;
      background-color: var(--accent-gold);
      border-radius: 4px;
      transition: width 0.4s ease;
    }
    .stats__bar-count {
      min-width: 32px;
      font-size: 0.8rem;
      color: var(--text-tertiary);
    }
    @media (max-width: 768px) {
      .stats__sections { grid-template-columns: 1fr; }
    }
    @media (max-width: 480px) {
      .stats__overview { grid-template-columns: repeat(2, 1fr); }
      .stats__bar-label { min-width: 70px; font-size: 0.8rem; }
    }
  `],
})
export class StatsComponent implements OnInit {
  protected readonly catalog = inject(CatalogService);

  readonly totalFilms = computed(() => this.catalog.movies().length);
  readonly streamableFilms = computed(() => this.catalog.movies().filter((m) => m.isStreamable).length);

  readonly avgRating = computed(() => {
    const rated = this.catalog.movies().filter((m) => m.voteAverage > 0);
    if (rated.length === 0) return '—';
    return (rated.reduce((s, m) => s + m.voteAverage, 0) / rated.length).toFixed(1);
  });

  readonly yearRange = computed(() => {
    const movies = this.catalog.movies();
    if (movies.length === 0) return '—';
    const years = movies.map((m) => m.year);
    return `${Math.min(...years)}–${Math.max(...years)}`;
  });

  readonly decadeStats = computed(() => {
    const counts = new Map<number, number>();
    for (const m of this.catalog.movies()) {
      const decade = Math.floor(m.year / 10) * 10;
      counts.set(decade, (counts.get(decade) ?? 0) + 1);
    }
    const sorted = [...counts.entries()].sort((a, b) => a[0] - b[0]);
    const max = Math.max(...sorted.map(([, c]) => c), 1);
    return sorted.map(([decade, count]) => ({
      name: `${decade}s`,
      decade,
      count,
      pct: (count / max) * 100,
    }));
  });

  readonly genreStats = computed(() => this.computeStats(
    this.catalog.movies().flatMap((m) => m.genres)
  ));

  readonly directorStats = computed(() => {
    const counts = new Map<string, number>();
    for (const m of this.catalog.movies()) {
      for (const d of m.directors) counts.set(d, (counts.get(d) ?? 0) + 1);
    }
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
    const max = sorted[0]?.[1] ?? 1;
    return sorted.map(([name, count]) => ({ name, count, pct: (count / max) * 100 }));
  });

  readonly languageStats = computed(() => {
    const counts = new Map<string, number>();
    for (const m of this.catalog.movies()) {
      if (m.language) counts.set(m.language, (counts.get(m.language) ?? 0) + 1);
    }
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
    const max = sorted[0]?.[1] ?? 1;
    return sorted.map(([name, count]) => ({ name, count, pct: (count / max) * 100 }));
  });

  ngOnInit(): void {
    this.catalog.load();
  }

  private computeStats(items: string[]): { name: string; count: number; pct: number }[] {
    const counts = new Map<string, number>();
    for (const item of items) {
      counts.set(item, (counts.get(item) ?? 0) + 1);
    }
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
    const max = sorted[0]?.[1] ?? 1;
    return sorted.map(([name, count]) => ({ name, count, pct: (count / max) * 100 }));
  }
}
