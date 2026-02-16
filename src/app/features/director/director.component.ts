import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed, input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CatalogService } from '../../core/services/catalog.service';
import { MovieGridComponent } from '../../shared/components/movie-grid.component';
import { MovieListComponent } from '../../shared/components/movie-list.component';
import { ViewToggleComponent, type ViewMode } from '../../shared/components/view-toggle.component';
import { SkeletonGridComponent } from '../../shared/components/skeleton-grid.component';

@Component({
  selector: 'app-director',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MovieGridComponent, MovieListComponent, ViewToggleComponent, SkeletonGridComponent],
  template: `
    @if (catalog.loading()) {
      <div class="director container">
        <app-skeleton-grid [count]="6" />
      </div>
    } @else {
      <div class="director container">
        <div class="director__header">
          <div>
            <p class="director__eyebrow">Director</p>
            <h1 class="director__name">{{ name() }}</h1>
            <p class="director__meta">{{ films().length }} film{{ films().length !== 1 ? 's' : '' }} in catalog</p>
          </div>
          <app-view-toggle [(mode)]="viewMode" />
        </div>

        @if (films().length > 0) {
          @if (viewMode() === 'grid') {
            <app-movie-grid [movies]="films()" />
          } @else {
            <app-movie-list [movies]="films()" />
          }
        } @else {
          <div class="director__empty">
            <p>No films found for this director.</p>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .director { padding: var(--space-xl) 0; }
    .director__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: var(--space-xl);
    }
    .director__eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.15em;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--accent-gold);
      margin: 0 0 var(--space-xs);
    }
    .director__name {
      margin-bottom: var(--space-xs);
    }
    .director__meta {
      color: var(--text-secondary);
      font-size: 0.95rem;
      margin: 0;
    }
    .director__empty {
      text-align: center;
      padding: var(--space-3xl);
      color: var(--text-tertiary);
    }
  `],
})
export class DirectorComponent implements OnInit {
  readonly name = input.required<string>();

  protected readonly catalog = inject(CatalogService);
  private readonly titleService = inject(Title);

  readonly viewMode = signal<ViewMode>('grid');
  readonly films = computed(() =>
    this.catalog.movies()
      .filter((m) => m.directors.some((d) => d === this.name()))
      .sort((a, b) => b.voteAverage - a.voteAverage)
  );

  ngOnInit(): void {
    this.catalog.load();
    this.titleService.setTitle(`${this.name()} — BW Cinema`);
  }
}
