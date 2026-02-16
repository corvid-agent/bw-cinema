import { Component, ChangeDetectionStrategy, input, output, signal, computed } from '@angular/core';

@Component({
  selector: 'app-filter-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="filters" aria-label="Filter options">
      <h3 class="filters__title">Filters</h3>

      <div class="filters__section">
        <h4>Decades</h4>
        @for (decade of availableDecades(); track decade) {
          <label class="filters__checkbox">
            <input
              type="checkbox"
              [checked]="selectedDecades().has(decade)"
              (change)="toggleDecade(decade)"
            />
            {{ decade }}s
          </label>
        }
      </div>

      <div class="filters__section">
        <h4>Genres</h4>
        @for (genre of availableGenres(); track genre) {
          <label class="filters__checkbox">
            <input
              type="checkbox"
              [checked]="selectedGenres().has(genre)"
              (change)="toggleGenre(genre)"
            />
            {{ genre }}
          </label>
        }
      </div>

      <div class="filters__section">
        <label class="filters__checkbox">
          <input
            type="checkbox"
            [checked]="streamableOnly()"
            (change)="streamableOnly.set(!streamableOnly())"
          />
          Streamable only
        </label>
      </div>

      <div class="filters__section">
        <label class="filters__label">
          Min rating: {{ minRating().toFixed(1) }}
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            class="filters__range"
            [value]="minRating()"
            (input)="onRatingChange($event)"
          />
        </label>
      </div>

      <button class="btn-secondary filters__clear" (click)="clearFilters()">Clear Filters</button>
    </aside>
  `,
  styles: [`
    .filters {
      background-color: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: var(--space-lg);
    }
    .filters__title {
      font-family: var(--font-heading);
      margin: 0 0 var(--space-md);
      color: var(--accent-gold);
    }
    .filters__section {
      margin-bottom: var(--space-lg);
    }
    .filters__section h4 {
      font-size: 0.95rem;
      color: var(--text-secondary);
      margin: 0 0 var(--space-sm);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .filters__checkbox {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-xs) 0;
      cursor: pointer;
      font-size: 0.95rem;
      color: var(--text-primary);
      min-height: 36px;
    }
    .filters__checkbox input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: var(--accent-gold);
      cursor: pointer;
    }
    .filters__label {
      display: block;
      color: var(--text-primary);
      font-size: 0.95rem;
    }
    .filters__range {
      width: 100%;
      margin-top: var(--space-sm);
      accent-color: var(--accent-gold);
    }
    .filters__clear {
      width: 100%;
      margin-top: var(--space-sm);
    }
  `],
})
export class FilterPanelComponent {
  readonly availableDecades = input<number[]>([]);
  readonly availableGenres = input<string[]>([]);

  readonly selectedDecades = signal(new Set<number>());
  readonly selectedGenres = signal(new Set<string>());
  readonly streamableOnly = signal(false);
  readonly minRating = signal(0);

  readonly filterChanged = output<{
    decades: number[];
    genres: string[];
    streamableOnly: boolean;
    minRating: number;
  }>();

  toggleDecade(decade: number): void {
    this.selectedDecades.update((set) => {
      const next = new Set(set);
      if (next.has(decade)) next.delete(decade);
      else next.add(decade);
      return next;
    });
    this.emitFilter();
  }

  toggleGenre(genre: string): void {
    this.selectedGenres.update((set) => {
      const next = new Set(set);
      if (next.has(genre)) next.delete(genre);
      else next.add(genre);
      return next;
    });
    this.emitFilter();
  }

  onRatingChange(event: Event): void {
    this.minRating.set(parseFloat((event.target as HTMLInputElement).value));
    this.emitFilter();
  }

  clearFilters(): void {
    this.selectedDecades.set(new Set());
    this.selectedGenres.set(new Set());
    this.streamableOnly.set(false);
    this.minRating.set(0);
    this.emitFilter();
  }

  private emitFilter(): void {
    this.filterChanged.emit({
      decades: [...this.selectedDecades()],
      genres: [...this.selectedGenres()],
      streamableOnly: this.streamableOnly(),
      minRating: this.minRating(),
    });
  }
}
