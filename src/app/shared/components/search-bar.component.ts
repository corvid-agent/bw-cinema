import { Component, ChangeDetectionStrategy, output, signal, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="search">
      <label for="search-input" class="sr-only">Search films</label>
      <input
        id="search-input"
        type="search"
        class="search__input"
        placeholder="Search by title or director..."
        [value]="query()"
        (input)="onInput($event)"
        aria-label="Search films"
      />
    </div>
  `,
  styles: [`
    .search { width: 100%; }
    .search__input {
      width: 100%;
      font-size: 1.1rem;
      padding: var(--space-md);
      background-color: var(--bg-input);
      color: var(--text-primary);
      border: 1px solid var(--border);
      border-radius: var(--radius);
    }
    .search__input:focus {
      border-color: var(--accent-gold);
      outline: none;
    }
  `],
})
export class SearchBarComponent implements OnInit, OnDestroy {
  readonly searched = output<string>();
  readonly query = signal('');
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {}

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
