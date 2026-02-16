import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-filter-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="filters" aria-label="Filter options">
      <div class="filters__header">
        <h3 class="filters__title">Filters</h3>
        <button class="filters__clear-btn" (click)="clearFilters()">Reset</button>
      </div>

      <div class="filters__group">
        <button class="filters__toggle" (click)="decadesOpen.set(!decadesOpen())">
          <span>Decades</span>
          <span class="filters__chevron" [class.open]="decadesOpen()">&#9662;</span>
        </button>
        @if (decadesOpen()) {
          <div class="filters__options">
            @for (decade of availableDecades(); track decade) {
              <label class="filters__checkbox">
                <input
                  type="checkbox"
                  [checked]="selectedDecades().has(decade)"
                  (change)="toggleDecade(decade)"
                />
                <span>{{ decade }}s</span>
              </label>
            }
          </div>
        }
      </div>

      <div class="filters__group">
        <button class="filters__toggle" (click)="genresOpen.set(!genresOpen())">
          <span>Genres</span>
          <span class="filters__chevron" [class.open]="genresOpen()">&#9662;</span>
        </button>
        @if (genresOpen()) {
          <div class="filters__options">
            @for (genre of availableGenres(); track genre) {
              <label class="filters__checkbox">
                <input
                  type="checkbox"
                  [checked]="selectedGenres().has(genre)"
                  (change)="toggleGenre(genre)"
                />
                <span>{{ genre }}</span>
              </label>
            }
          </div>
        }
      </div>

      <div class="filters__group filters__group--inline">
        <label class="filters__checkbox filters__checkbox--toggle">
          <input
            type="checkbox"
            [checked]="streamableOnly()"
            (change)="streamableOnly.set(!streamableOnly()); emitFilter()"
          />
          <span>Free to watch only</span>
        </label>
      </div>

      <div class="filters__group">
        <label class="filters__range-label">
          Minimum rating
          <span class="filters__range-value">{{ minRating() > 0 ? minRating().toFixed(1) : 'Any' }}</span>
        </label>
        <input
          type="range"
          min="0"
          max="10"
          step="0.5"
          class="filters__range"
          [value]="minRating()"
          (input)="onRatingChange($event)"
        />
      </div>
    </aside>
  `,
  styles: [`
    .filters {
      background-color: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-md);
    }
    .filters__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: var(--space-md);
      border-bottom: 1px solid var(--border);
      margin-bottom: var(--space-sm);
    }
    .filters__title {
      font-size: 1rem;
      color: var(--text-primary);
      margin: 0;
    }
    .filters__clear-btn {
      background: none;
      border: none;
      color: var(--text-tertiary);
      font-size: 0.8rem;
      padding: 4px 8px;
      min-height: auto;
      min-width: auto;
      cursor: pointer;
    }
    .filters__clear-btn:hover {
      color: var(--accent-gold);
    }
    .filters__group {
      border-bottom: 1px solid var(--border);
      padding: var(--space-sm) 0;
    }
    .filters__group:last-child {
      border-bottom: none;
    }
    .filters__group--inline {
      padding: var(--space-md) 0;
    }
    .filters__toggle {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: var(--space-sm) 0;
      cursor: pointer;
      min-height: auto;
      min-width: auto;
    }
    .filters__toggle:hover {
      color: var(--text-primary);
    }
    .filters__chevron {
      font-size: 0.75rem;
      transition: transform 0.2s;
    }
    .filters__chevron.open {
      transform: rotate(180deg);
    }
    .filters__options {
      padding: var(--space-xs) 0 var(--space-sm);
      max-height: 200px;
      overflow-y: auto;
    }
    .filters__checkbox {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: 4px 0;
      cursor: pointer;
      font-size: 0.9rem;
      color: var(--text-primary);
    }
    .filters__checkbox input[type="checkbox"] {
      width: 16px;
      height: 16px;
      accent-color: var(--accent-gold);
      cursor: pointer;
      flex-shrink: 0;
    }
    .filters__checkbox--toggle {
      font-weight: 500;
    }
    .filters__range-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-bottom: var(--space-sm);
    }
    .filters__range-value {
      color: var(--accent-gold);
      font-weight: 600;
      font-size: 0.9rem;
    }
    .filters__range {
      width: 100%;
      accent-color: var(--accent-gold);
      cursor: pointer;
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

  readonly decadesOpen = signal(false);
  readonly genresOpen = signal(false);

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

  emitFilter(): void {
    this.filterChanged.emit({
      decades: [...this.selectedDecades()],
      genres: [...this.selectedGenres()],
      streamableOnly: this.streamableOnly(),
      minRating: this.minRating(),
    });
  }
}
