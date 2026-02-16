import { Component, ChangeDetectionStrategy, output, signal, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="search">
      <label for="search-input" class="sr-only">Search films</label>
      <svg class="search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        id="search-input"
        type="search"
        class="search__input"
        placeholder="Search by title, director, or year..."
        [value]="query()"
        (input)="onInput($event)"
        aria-label="Search films"
      />
    </div>
  `,
  styles: [`
    .search {
      position: relative;
      width: 100%;
    }
    .search__icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      width: 18px;
      height: 18px;
      color: var(--text-tertiary);
      pointer-events: none;
    }
    .search__input {
      width: 100%;
      font-size: 1rem;
      padding: var(--space-md) var(--space-md) var(--space-md) 42px;
      background-color: var(--bg-surface);
      color: var(--text-primary);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
    }
    .search__input:focus {
      border-color: var(--accent-gold);
      background-color: var(--bg-input);
    }
  `],
})
export class SearchBarComponent implements OnDestroy {
  readonly searched = output<string>();
  readonly query = signal('');
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnDestroy(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.searched.emit(value);
    }, 300);
  }
}
