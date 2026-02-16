import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CatalogService } from '../../core/services/catalog.service';
import { MovieService } from '../../core/services/movie.service';
import { MovieGridComponent } from '../../shared/components/movie-grid.component';
import { MovieListComponent } from '../../shared/components/movie-list.component';
import { ViewToggleComponent, type ViewMode } from '../../shared/components/view-toggle.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import type { MovieSummary } from '../../core/models/movie.model';

@Component({
  selector: 'app-actor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MovieGridComponent, MovieListComponent, ViewToggleComponent, LoadingSpinnerComponent],
  template: `
    @if (catalog.loading()) {
      <div class="actor container">
        <app-loading-spinner />
      </div>
    } @else {
      <div class="actor container">
        <div class="actor__header">
          <div class="actor__profile">
            @if (photoUrl()) {
              <img class="actor__photo" [src]="photoUrl()" [alt]="name()" />
            } @else {
              <div class="actor__photo-placeholder">
                <span>{{ name()[0] }}</span>
              </div>
            }
            <div>
              <p class="actor__eyebrow">Actor</p>
              <h1 class="actor__name">{{ name() }}</h1>
              <p class="actor__meta">{{ films().length }} film{{ films().length !== 1 ? 's' : '' }} in catalog</p>
            </div>
          </div>
          <app-view-toggle [(mode)]="viewMode" />
        </div>

        @if (films().length > 0) {
          <div class="actor__stats">
            <div class="actor__stat">
              <span class="actor__stat-value">{{ yearRange() }}</span>
              <span class="actor__stat-label">Active Years</span>
            </div>
            <div class="actor__stat">
              <span class="actor__stat-value">{{ avgRating() }}</span>
              <span class="actor__stat-label">Avg. Rating</span>
            </div>
            <div class="actor__stat">
              <span class="actor__stat-value">{{ streamableCount() }}</span>
              <span class="actor__stat-label">Free to Watch</span>
            </div>
          </div>

          @if (topGenres().length > 0) {
            <div class="actor__genres">
              @for (g of topGenres(); track g) {
                <a class="actor__genre-tag" [routerLink]="['/genre', g]">{{ g }}</a>
              }
            </div>
          }

          @if (topDirectors().length > 0) {
            <div class="actor__collabs">
              <h3>Frequent Collaborators</h3>
              <div class="actor__collab-list">
                @for (d of topDirectors(); track d.name) {
                  <a class="actor__collab-chip" [routerLink]="['/director', d.name]">
                    {{ d.name }}
                    <span class="actor__collab-count">{{ d.count }}</span>
                  </a>
                }
              </div>
            </div>
          }

          @if (viewMode() === 'grid') {
            <app-movie-grid [movies]="films()" />
          } @else {
            <app-movie-list [movies]="films()" />
          }
        } @else {
          <div class="actor__empty">
            <p>No films found for this actor in our catalog.</p>
            <a class="btn-primary" routerLink="/browse">Browse Films</a>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .actor { padding: var(--space-xl) 0; }
    .actor__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: var(--space-lg);
    }
    .actor__profile {
      display: flex;
      align-items: center;
      gap: var(--space-lg);
    }
    .actor__photo {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      box-shadow: var(--shadow-md);
    }
    .actor__photo-placeholder {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: var(--bg-raised);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-heading);
      font-size: 2rem;
      color: var(--accent-gold);
      font-weight: 700;
    }
    .actor__eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.15em;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--accent-gold);
      margin: 0 0 var(--space-xs);
    }
    .actor__name { margin-bottom: var(--space-xs); }
    .actor__meta {
      color: var(--text-secondary);
      font-size: 0.95rem;
      margin: 0;
    }
    .actor__stats {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: var(--space-md);
      margin-bottom: var(--space-xl);
    }
    .actor__stat {
      background-color: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-md);
      text-align: center;
    }
    .actor__stat-value {
      display: block;
      font-family: var(--font-heading);
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--accent-gold);
      margin-bottom: 2px;
    }
    .actor__stat-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-tertiary);
    }
    .actor__genres {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-sm);
      margin-bottom: var(--space-xl);
    }
    .actor__genre-tag {
      font-size: 0.85rem;
      padding: 4px 14px;
      border: 1px solid var(--border-bright);
      border-radius: 16px;
      color: var(--text-secondary);
      text-decoration: none;
      transition: all 0.2s;
    }
    .actor__genre-tag:hover {
      border-color: var(--accent-gold);
      color: var(--accent-gold);
      background-color: var(--accent-gold-dim);
    }
    .actor__collabs {
      margin-bottom: var(--space-xl);
    }
    .actor__collabs h3 { margin-bottom: var(--space-sm); }
    .actor__collab-list {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-sm);
    }
    .actor__collab-chip {
      display: inline-flex;
      align-items: center;
      gap: var(--space-xs);
      font-size: 0.85rem;
      padding: 6px 14px;
      background-color: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 20px;
      color: var(--text-primary);
      text-decoration: none;
      transition: all 0.2s;
    }
    .actor__collab-chip:hover {
      border-color: var(--accent-gold);
      color: var(--accent-gold);
    }
    .actor__collab-count {
      font-size: 0.7rem;
      background-color: var(--bg-raised);
      padding: 1px 6px;
      border-radius: 8px;
      color: var(--text-tertiary);
    }
    .actor__empty {
      text-align: center;
      padding: var(--space-3xl);
      color: var(--text-tertiary);
    }
    @media (max-width: 768px) {
      .actor__header { flex-direction: column; gap: var(--space-md); }
    }
    @media (max-width: 480px) {
      .actor__profile { flex-direction: column; text-align: center; }
      .actor__stats { grid-template-columns: 1fr; }
    }
  `],
})
export class ActorComponent implements OnInit {
  readonly name = input.required<string>();

  protected readonly catalog = inject(CatalogService);
  private readonly movieService = inject(MovieService);
  private readonly titleService = inject(Title);

  readonly viewMode = signal<ViewMode>('grid');
  readonly photoUrl = signal<string | null>(null);

  /** Films this actor appears in — resolved by loading details for catalog films */
  private readonly actorFilmIds = signal<Set<string>>(new Set());

  readonly films = computed(() => {
    const ids = this.actorFilmIds();
    if (ids.size === 0) return [];
    return this.catalog.movies()
      .filter((m) => ids.has(m.id))
      .sort((a, b) => b.voteAverage - a.voteAverage);
  });

  readonly yearRange = computed(() => {
    const f = this.films();
    if (f.length === 0) return '—';
    const years = f.map((m) => m.year);
    const min = Math.min(...years);
    const max = Math.max(...years);
    return min === max ? `${min}` : `${min}–${max}`;
  });

  readonly avgRating = computed(() => {
    const rated = this.films().filter((m) => m.voteAverage > 0);
    if (rated.length === 0) return '—';
    return (rated.reduce((s, m) => s + m.voteAverage, 0) / rated.length).toFixed(1);
  });

  readonly streamableCount = computed(() =>
    this.films().filter((m) => m.isStreamable).length
  );

  readonly topGenres = computed(() => {
    const counts = new Map<string, number>();
    for (const m of this.films()) {
      for (const g of m.genres) counts.set(g, (counts.get(g) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([g]) => g);
  });

  readonly topDirectors = computed(() => {
    const counts = new Map<string, number>();
    for (const m of this.films()) {
      for (const d of m.directors) counts.set(d, (counts.get(d) ?? 0) + 1);
    }
    return [...counts.entries()]
      .filter(([, c]) => c >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  });

  async ngOnInit(): Promise<void> {
    await this.catalog.load();
    this.titleService.setTitle(`${this.name()} — BW Cinema`);

    // Search for films containing this actor by loading details
    // First, do a quick scan — load detail for a batch of films to find cast matches
    const actorName = this.name().toLowerCase();
    const movies = this.catalog.movies();
    const matchIds = new Set<string>();

    // Load details in batches to find films with this actor
    const batchSize = 50;
    for (let i = 0; i < movies.length; i += batchSize) {
      const batch = movies.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map((m) => this.movieService.getDetail(m))
      );
      for (const result of results) {
        if (result.status === 'fulfilled') {
          const detail = result.value;
          if (detail.cast.some((c) => c.name.toLowerCase() === actorName)) {
            matchIds.add(detail.id);
            // Grab photo from first match
            if (!this.photoUrl()) {
              const actor = detail.cast.find((c) => c.name.toLowerCase() === actorName);
              if (actor?.profileUrl) this.photoUrl.set(actor.profileUrl);
            }
          }
        }
      }
      // Update incrementally so user sees results appearing
      if (matchIds.size > 0) {
        this.actorFilmIds.set(new Set(matchIds));
      }
    }
    this.actorFilmIds.set(new Set(matchIds));
  }
}
