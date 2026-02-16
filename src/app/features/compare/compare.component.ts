import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import type { MovieSummary } from '../../core/models/movie.model';

@Component({
  selector: 'app-compare',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="compare container">
      <h1>Compare Films</h1>
      <p class="compare__subtitle">Select two films to compare side by side</p>

      <div class="compare__pickers">
        <div class="compare__picker">
          <label for="film-a" class="compare__picker-label">Film 1</label>
          <input
            id="film-a"
            type="search"
            class="compare__search"
            placeholder="Search for a film..."
            [value]="queryA()"
            (input)="onSearchA($event)"
            (focus)="showDropA.set(true)"
            autocomplete="off"
          />
          @if (showDropA() && resultsA().length > 0) {
            <ul class="compare__dropdown">
              @for (m of resultsA(); track m.id) {
                <li (mousedown)="selectA(m)">{{ m.title }} ({{ m.year }})</li>
              }
            </ul>
          }
          @if (filmA()) {
            <div class="compare__selected">
              <span>{{ filmA()!.title }} ({{ filmA()!.year }})</span>
              <button class="compare__clear" (click)="filmA.set(null); queryA.set('')" aria-label="Clear film 1">&times;</button>
            </div>
          }
        </div>

        <div class="compare__vs">
          <button class="compare__swap" (click)="swap()" title="Swap films" aria-label="Swap films">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
          </button>
        </div>

        <div class="compare__picker">
          <label for="film-b" class="compare__picker-label">Film 2</label>
          <input
            id="film-b"
            type="search"
            class="compare__search"
            placeholder="Search for a film..."
            [value]="queryB()"
            (input)="onSearchB($event)"
            (focus)="showDropB.set(true)"
            autocomplete="off"
          />
          @if (showDropB() && resultsB().length > 0) {
            <ul class="compare__dropdown">
              @for (m of resultsB(); track m.id) {
                <li (mousedown)="selectB(m)">{{ m.title }} ({{ m.year }})</li>
              }
            </ul>
          }
          @if (filmB()) {
            <div class="compare__selected">
              <span>{{ filmB()!.title }} ({{ filmB()!.year }})</span>
              <button class="compare__clear" (click)="filmB.set(null); queryB.set('')" aria-label="Clear film 2">&times;</button>
            </div>
          }
        </div>
      </div>

      @if (filmA() && filmB()) {
        <div class="compare__table">
          <div class="compare__row compare__row--header">
            <div class="compare__cell compare__cell--label"></div>
            <div class="compare__cell compare__cell--a">
              @if (filmA()!.posterUrl) {
                <img [src]="filmA()!.posterUrl" [alt]="filmA()!.title" class="compare__poster" />
              }
              <a class="compare__film-link" [routerLink]="['/movie', filmA()!.id]">{{ filmA()!.title }}</a>
            </div>
            <div class="compare__cell compare__cell--b">
              @if (filmB()!.posterUrl) {
                <img [src]="filmB()!.posterUrl" [alt]="filmB()!.title" class="compare__poster" />
              }
              <a class="compare__film-link" [routerLink]="['/movie', filmB()!.id]">{{ filmB()!.title }}</a>
            </div>
          </div>

          <div class="compare__row">
            <div class="compare__cell compare__cell--label">Year</div>
            <div class="compare__cell">{{ filmA()!.year }}</div>
            <div class="compare__cell">{{ filmB()!.year }}</div>
          </div>
          <div class="compare__row">
            <div class="compare__cell compare__cell--label">Rating</div>
            <div class="compare__cell" [class.compare__cell--winner]="filmA()!.voteAverage > filmB()!.voteAverage">{{ filmA()!.voteAverage || '—' }}</div>
            <div class="compare__cell" [class.compare__cell--winner]="filmB()!.voteAverage > filmA()!.voteAverage">{{ filmB()!.voteAverage || '—' }}</div>
          </div>
          <div class="compare__row">
            <div class="compare__cell compare__cell--label">Directors</div>
            <div class="compare__cell">{{ filmA()!.directors.join(', ') || '—' }}</div>
            <div class="compare__cell">{{ filmB()!.directors.join(', ') || '—' }}</div>
          </div>
          <div class="compare__row">
            <div class="compare__cell compare__cell--label">Genres</div>
            <div class="compare__cell">{{ filmA()!.genres.join(', ') || '—' }}</div>
            <div class="compare__cell">{{ filmB()!.genres.join(', ') || '—' }}</div>
          </div>
          <div class="compare__row">
            <div class="compare__cell compare__cell--label">Language</div>
            <div class="compare__cell">{{ filmA()!.language || '—' }}</div>
            <div class="compare__cell">{{ filmB()!.language || '—' }}</div>
          </div>
          <div class="compare__row">
            <div class="compare__cell compare__cell--label">Streamable</div>
            <div class="compare__cell">{{ filmA()!.isStreamable ? 'Yes' : 'No' }}</div>
            <div class="compare__cell">{{ filmB()!.isStreamable ? 'Yes' : 'No' }}</div>
          </div>
          <div class="compare__row">
            <div class="compare__cell compare__cell--label">Source</div>
            <div class="compare__cell">{{ getStreamSource(filmA()!) }}</div>
            <div class="compare__cell">{{ getStreamSource(filmB()!) }}</div>
          </div>
          @if (sharedGenres().length > 0 || sharedDirectors().length > 0) {
            <div class="compare__shared">
              @if (sharedGenres().length > 0) {
                <div>
                  <span class="compare__shared-label">Shared genres:</span>
                  {{ sharedGenres().join(', ') }}
                </div>
              }
              @if (sharedDirectors().length > 0) {
                <div>
                  <span class="compare__shared-label">Shared directors:</span>
                  {{ sharedDirectors().join(', ') }}
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .compare { padding: var(--space-xl) 0; }
    .compare__subtitle {
      color: var(--text-tertiary);
      margin: 0 0 var(--space-xl);
    }
    .compare__pickers {
      display: flex;
      gap: var(--space-lg);
      align-items: flex-start;
      margin-bottom: var(--space-2xl);
    }
    .compare__picker {
      flex: 1;
      position: relative;
    }
    .compare__picker-label {
      display: block;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-tertiary);
      font-weight: 600;
      margin-bottom: var(--space-sm);
    }
    .compare__search {
      width: 100%;
      padding: var(--space-md);
      background-color: var(--bg-surface);
      color: var(--text-primary);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      font-size: 1rem;
    }
    .compare__search:focus {
      border-color: var(--accent-gold);
    }
    .compare__dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      list-style: none;
      padding: var(--space-xs) 0;
      margin: 4px 0 0;
      background-color: var(--bg-surface);
      border: 1px solid var(--border-bright);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      z-index: 20;
      max-height: 240px;
      overflow-y: auto;
    }
    .compare__dropdown li {
      padding: var(--space-sm) var(--space-md);
      cursor: pointer;
      font-size: 0.9rem;
      color: var(--text-primary);
    }
    .compare__dropdown li:hover {
      background-color: var(--bg-hover);
    }
    .compare__selected {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: var(--space-sm);
      padding: var(--space-sm) var(--space-md);
      background-color: var(--accent-gold-dim);
      border: 1px solid var(--accent-gold);
      border-radius: var(--radius);
      color: var(--accent-gold);
      font-weight: 600;
      font-size: 0.9rem;
    }
    .compare__clear {
      background: none;
      border: none;
      color: var(--accent-gold);
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0 4px;
      min-height: auto;
      min-width: auto;
      line-height: 1;
    }
    .compare__vs {
      padding-top: 38px;
      font-family: var(--font-heading);
      font-size: 1.2rem;
      color: var(--text-tertiary);
      font-weight: 700;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-sm);
    }
    .compare__swap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      min-width: 36px;
      min-height: 36px;
      padding: 0;
      border-radius: 50%;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      color: var(--text-tertiary);
      cursor: pointer;
      transition: all 0.2s;
    }
    .compare__swap:hover {
      border-color: var(--accent-gold);
      color: var(--accent-gold);
      background: var(--accent-gold-dim);
    }
    .compare__table {
      background-color: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .compare__row {
      display: grid;
      grid-template-columns: 120px 1fr 1fr;
      border-bottom: 1px solid var(--border);
    }
    .compare__row:last-child { border-bottom: none; }
    .compare__row--header {
      background-color: var(--bg-raised);
    }
    .compare__cell {
      padding: var(--space-md);
      font-size: 0.95rem;
      color: var(--text-primary);
    }
    .compare__cell--label {
      color: var(--text-tertiary);
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-weight: 600;
      display: flex;
      align-items: center;
    }
    .compare__cell--winner {
      color: var(--accent-gold);
      font-weight: 700;
    }
    .compare__cell--a,
    .compare__cell--b {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-lg) var(--space-md);
    }
    .compare__poster {
      width: 80px;
      aspect-ratio: 2 / 3;
      object-fit: cover;
      border-radius: var(--radius);
    }
    .compare__film-link {
      font-weight: 600;
      font-size: 1rem;
      text-align: center;
    }
    .compare__shared {
      padding: var(--space-md);
      font-size: 0.9rem;
      color: var(--text-secondary);
      border-top: 1px solid var(--border);
    }
    .compare__shared-label {
      color: var(--text-tertiary);
      font-weight: 600;
      margin-right: var(--space-sm);
    }
    @media (max-width: 768px) {
      .compare__pickers { flex-direction: column; }
      .compare__vs { padding-top: 0; text-align: center; }
      .compare__row { grid-template-columns: 80px 1fr 1fr; }
    }
    @media (max-width: 480px) {
      .compare__row { grid-template-columns: 1fr; }
      .compare__cell--label {
        border-bottom: none;
        padding-bottom: 0;
        font-size: 0.75rem;
      }
      .compare__row--header {
        display: flex;
        flex-direction: column;
      }
      .compare__poster { width: 120px; }
      .compare__cell { padding: var(--space-sm) var(--space-md); font-size: 0.9rem; }
    }
  `],
})
export class CompareComponent implements OnInit {
  private readonly catalog = inject(CatalogService);

  readonly queryA = signal('');
  readonly queryB = signal('');
  readonly filmA = signal<MovieSummary | null>(null);
  readonly filmB = signal<MovieSummary | null>(null);
  readonly showDropA = signal(false);
  readonly showDropB = signal(false);

  readonly resultsA = computed(() => this.searchFilms(this.queryA()));
  readonly resultsB = computed(() => this.searchFilms(this.queryB()));

  readonly sharedGenres = computed(() => {
    const a = this.filmA();
    const b = this.filmB();
    if (!a || !b) return [];
    const setB = new Set(b.genres);
    return a.genres.filter((g) => setB.has(g));
  });

  readonly sharedDirectors = computed(() => {
    const a = this.filmA();
    const b = this.filmB();
    if (!a || !b) return [];
    const setB = new Set(b.directors);
    return a.directors.filter((d) => setB.has(d));
  });

  ngOnInit(): void {
    this.catalog.load();
  }

  onSearchA(event: Event): void {
    this.queryA.set((event.target as HTMLInputElement).value);
    this.showDropA.set(true);
  }

  onSearchB(event: Event): void {
    this.queryB.set((event.target as HTMLInputElement).value);
    this.showDropB.set(true);
  }

  swap(): void {
    const a = this.filmA();
    const b = this.filmB();
    const qA = this.queryA();
    const qB = this.queryB();
    this.filmA.set(b);
    this.filmB.set(a);
    this.queryA.set(qB);
    this.queryB.set(qA);
  }

  getStreamSource(movie: MovieSummary): string {
    if (movie.internetArchiveId) return 'Internet Archive';
    if (movie.youtubeId) return 'YouTube';
    if (movie.imdbId) return 'IMDb (info only)';
    return 'Not available';
  }

  selectA(movie: MovieSummary): void {
    this.filmA.set(movie);
    this.queryA.set(movie.title);
    this.showDropA.set(false);
  }

  selectB(movie: MovieSummary): void {
    this.filmB.set(movie);
    this.queryB.set(movie.title);
    this.showDropB.set(false);
  }

  private searchFilms(query: string): MovieSummary[] {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return this.catalog.movies()
      .filter((m) => m.title.toLowerCase().includes(q))
      .slice(0, 8);
  }
}
