import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { NotificationService } from '../../core/services/notification.service';
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
            (blur)="closeDropA()"
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
          } @else {
            <div class="compare__quick-picks">
              @for (m of quickPicks().slice(0, 4); track m.id) {
                <button class="compare__quick-btn" (click)="selectA(m)">{{ m.title }}</button>
              }
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
            (blur)="closeDropB()"
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
          } @else {
            <div class="compare__quick-picks">
              @for (m of quickPicks().slice(4, 8); track m.id) {
                <button class="compare__quick-btn" (click)="selectB(m)">{{ m.title }}</button>
              }
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
          @if (yearGap(); as gap) {
            <div class="compare__year-gap">{{ gap }}</div>
          }
          <div class="compare__row">
            <div class="compare__cell compare__cell--label">Rating</div>
            <div class="compare__cell" [class.compare__cell--winner]="filmA()!.voteAverage > filmB()!.voteAverage">
              {{ filmA()!.voteAverage || '—' }}
              @if (filmA()!.voteAverage > 0) {
                <div class="compare__rating-bar">
                  <div class="compare__rating-fill compare__rating-fill--a" [style.width.%]="filmA()!.voteAverage * 10"></div>
                </div>
              }
            </div>
            <div class="compare__cell" [class.compare__cell--winner]="filmB()!.voteAverage > filmA()!.voteAverage">
              {{ filmB()!.voteAverage || '—' }}
              @if (filmB()!.voteAverage > 0) {
                <div class="compare__rating-bar">
                  <div class="compare__rating-fill compare__rating-fill--b" [style.width.%]="filmB()!.voteAverage * 10"></div>
                </div>
              }
            </div>
          </div>
          <div class="compare__row">
            <div class="compare__cell compare__cell--label">Directors</div>
            <div class="compare__cell compare__cell--links">
              @for (dir of filmA()!.directors; track dir; let last = $last) {
                <a [routerLink]="['/director', dir]">{{ dir }}</a>@if (!last) {<span>, </span>}
              }
              @if (filmA()!.directors.length === 0) { <span>—</span> }
            </div>
            <div class="compare__cell compare__cell--links">
              @for (dir of filmB()!.directors; track dir; let last = $last) {
                <a [routerLink]="['/director', dir]">{{ dir }}</a>@if (!last) {<span>, </span>}
              }
              @if (filmB()!.directors.length === 0) { <span>—</span> }
            </div>
          </div>
          <div class="compare__row">
            <div class="compare__cell compare__cell--label">Genres</div>
            <div class="compare__cell compare__cell--links">
              @for (genre of filmA()!.genres; track genre; let last = $last) {
                <a [routerLink]="['/genre', genre]">{{ genre }}</a>@if (!last) {<span>, </span>}
              }
              @if (filmA()!.genres.length === 0) { <span>—</span> }
            </div>
            <div class="compare__cell compare__cell--links">
              @for (genre of filmB()!.genres; track genre; let last = $last) {
                <a [routerLink]="['/genre', genre]">{{ genre }}</a>@if (!last) {<span>, </span>}
              }
              @if (filmB()!.genres.length === 0) { <span>—</span> }
            </div>
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
          @if (similarityScore() > 0) {
            <div class="compare__similarity">
              <span class="compare__similarity-pct">{{ similarityScore() }}%</span>
              <span class="compare__similarity-label">Similarity</span>
            </div>
          }
          @if (doubleFeatureNote(); as dfn) {
            <p class="compare__double-feature-note">{{ dfn }}</p>
          }
          @if (eraLabel(); as era) {
            <p class="compare__double-feature-note">{{ era }}</p>
          }
          @if (midpointYear(); as mpy) {
            <p class="compare__double-feature-note">Midpoint: {{ mpy }}</p>
          }
          @if (yearSpan(); as ys) {
            <p class="compare__double-feature-note">Spanning {{ ys }}</p>
          }
          @if (combinedGenreCount(); as cgc) {
            <p class="compare__double-feature-note">{{ cgc }} genres between them</p>
          }
          @if (combinedAvgRating(); as avg) {
            <div class="compare__combined-avg">
              Combined Avg: {{ avg }}/10
              @if (ratingDifference(); as diff) {
                <span class="compare__overlap"> &middot; {{ diff }}pt gap</span>
              }
              @if (genreOverlapPct() > 0) {
                <span class="compare__overlap"> &middot; {{ genreOverlapPct() }}% genre overlap</span>
              }
              @if (combinedGenreCount() > 0) {
                <span class="compare__overlap"> &middot; {{ combinedGenreCount() }} genres combined</span>
              }
              @if (combinedDirectorCount() > 1) {
                <span class="compare__overlap"> &middot; {{ combinedDirectorCount() }} directors</span>
              }
              @if (combinedLanguageCount() > 1) {
                <span class="compare__overlap"> &middot; {{ combinedLanguageCount() }} languages</span>
              }
              @if (avgFilmAge(); as afa) {
                <span class="compare__overlap"> &middot; avg {{ afa }} years old</span>
              }
              @if (bothStreamable()) {
                <span class="compare__overlap"> &middot; both free to watch</span>
              }
              @if (bothNonEnglish()) {
                <span class="compare__overlap"> &middot; both non-English</span>
              }
              @if (bothSilentEra()) {
                <span class="compare__overlap"> &middot; both silent-era</span>
              }
              @if (combinedTitleLength(); as ctl) {
                <span class="compare__overlap"> &middot; {{ ctl }} chars combined</span>
              }
              @if (sameLanguage(); as sl) {
                <span class="compare__overlap"> &middot; both in {{ sl }}</span>
              }
              @if (genreCountDiff(); as gcd) {
                <span class="compare__overlap"> &middot; {{ gcd }} genre difference</span>
              }
              @if (directorCountDiff(); as dcd) {
                <span class="compare__overlap"> &middot; {{ dcd }} director difference</span>
              }
              @if (bothHighlyRated()) {
                <span class="compare__overlap"> &middot; both rated 8+</span>
              }
              @if (bothPreWar()) {
                <span class="compare__overlap"> &middot; both pre-1940</span>
              }
              @if (avgYearDiff(); as ayd) {
                <span class="compare__overlap"> &middot; {{ ayd }} avg year diff from catalog</span>
              }
              @if (sameDecade()) {
                <span class="compare__overlap"> &middot; same decade</span>
              }
              @if (bothCoDirected()) {
                <span class="compare__overlap"> &middot; both co-directed</span>
              }
              @if (ratingGap(); as rg) {
                <span class="compare__overlap"> &middot; {{ rg }} rating gap</span>
              }
              @if (combinedGenreList(); as cgl) {
                <span class="compare__overlap"> &middot; genres: {{ cgl }}</span>
              }
              @if (combinedAvgYear(); as cay) {
                <span class="compare__overlap"> &middot; avg year {{ cay }}</span>
              }
              @if (titleLengthDiff(); as tld) {
                <span class="compare__overlap"> &middot; {{ tld }} char title difference</span>
              }
            </div>
          }
          @if (comparisonNotes().length > 0 || sharedGenres().length > 0 || sharedDirectors().length > 0) {
            <div class="compare__shared">
              @for (note of comparisonNotes(); track note) {
                <div class="compare__note">{{ note }}</div>
              }
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
          @if (verdict()) {
            <div class="compare__verdict">{{ verdict() }}</div>
          }
          <div class="compare__actions">
            <button class="compare__action-btn" (click)="copyComparison()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              Copy Comparison
            </button>
            <button class="compare__action-btn" (click)="randomCompare()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              Random Pair
            </button>
          </div>
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
    .compare__quick-picks {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-xs);
      margin-top: var(--space-sm);
    }
    .compare__quick-btn {
      padding: 4px 10px;
      font-size: 0.75rem;
      border-radius: 12px;
      background: var(--bg-raised);
      border: 1px solid var(--border);
      color: var(--text-tertiary);
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .compare__quick-btn:hover {
      border-color: var(--accent-gold);
      color: var(--accent-gold);
      background: var(--accent-gold-dim);
    }
    .compare__rating-bar {
      width: 100%;
      height: 6px;
      background: var(--bg-raised);
      border-radius: 3px;
      overflow: hidden;
      margin-top: 4px;
    }
    .compare__rating-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.4s ease;
    }
    .compare__rating-fill--a { background: var(--accent-gold); }
    .compare__rating-fill--b { background: var(--accent-gold); }
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
    .compare__cell--links a {
      color: var(--text-primary);
      text-decoration: none;
      transition: color 0.2s;
    }
    .compare__cell--links a:hover {
      color: var(--accent-gold);
    }
    .compare__similarity {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-sm);
      padding: var(--space-md);
      border-top: 1px solid var(--border);
    }
    .compare__similarity-pct {
      font-family: var(--font-heading);
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--accent-gold);
    }
    .compare__similarity-label {
      font-size: 0.85rem;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }
    .compare__combined-avg {
      text-align: center;
      padding: var(--space-sm) var(--space-md);
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-secondary);
      border-top: 1px solid var(--border);
    }
    .compare__note {
      color: var(--accent-gold);
      font-weight: 600;
      font-size: 0.9rem;
    }
    .compare__double-feature-note {
      text-align: center;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--accent-gold);
      padding: var(--space-xs) 0;
      margin: 0;
    }
    .compare__actions {
      display: flex;
      gap: var(--space-sm);
      padding: var(--space-md);
      border-top: 1px solid var(--border);
    }
    .compare__action-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: var(--bg-raised);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      color: var(--text-secondary);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .compare__action-btn:hover {
      border-color: var(--accent-gold);
      color: var(--accent-gold);
    }
    .compare__year-gap {
      text-align: center;
      font-size: 0.75rem;
      color: var(--text-tertiary);
      padding: 2px 0;
      border-bottom: 1px solid var(--border);
    }
    .compare__verdict {
      padding: var(--space-md) var(--space-lg);
      font-size: 0.95rem;
      font-style: italic;
      color: var(--text-secondary);
      border-top: 1px solid var(--border);
      text-align: center;
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
  private readonly notifications = inject(NotificationService);

  readonly queryA = signal('');
  readonly queryB = signal('');
  readonly filmA = signal<MovieSummary | null>(null);
  readonly filmB = signal<MovieSummary | null>(null);
  readonly showDropA = signal(false);
  readonly showDropB = signal(false);

  readonly resultsA = computed(() => this.searchFilms(this.queryA()));
  readonly resultsB = computed(() => this.searchFilms(this.queryB()));

  readonly quickPicks = computed(() =>
    this.catalog.movies()
      .filter((m) => m.voteAverage >= 7.5 && m.posterUrl && m.isStreamable)
      .sort((a, b) => b.voteAverage - a.voteAverage)
      .slice(0, 8)
  );

  readonly sharedGenres = computed(() => {
    const a = this.filmA();
    const b = this.filmB();
    if (!a || !b) return [];
    const setB = new Set(b.genres);
    return a.genres.filter((g) => setB.has(g));
  });

  readonly comparisonNotes = computed(() => {
    const a = this.filmA();
    const b = this.filmB();
    if (!a || !b) return [];
    const notes: string[] = [];
    const yearGap = Math.abs(a.year - b.year);
    if (yearGap === 0) {
      notes.push('Released the same year');
    } else {
      notes.push(`${yearGap} year${yearGap > 1 ? 's' : ''} apart`);
    }
    const decadeA = Math.floor(a.year / 10) * 10;
    const decadeB = Math.floor(b.year / 10) * 10;
    if (decadeA === decadeB) {
      notes.push(`Both from the ${decadeA}s`);
    }
    if (a.isStreamable && b.isStreamable) {
      notes.push('Both free to watch');
    }
    const ratingDiff = Math.abs(a.voteAverage - b.voteAverage);
    if (a.voteAverage > 0 && b.voteAverage > 0 && ratingDiff < 0.3) {
      notes.push('Nearly identical ratings');
    }
    if (a.language && b.language) {
      if (a.language === b.language) {
        if (a.language !== 'en') notes.push(`Both in ${a.language.toUpperCase()}`);
      } else {
        notes.push(`${a.language.toUpperCase()} vs ${b.language.toUpperCase()}`);
      }
    }
    return notes;
  });

  readonly yearGap = computed(() => {
    const a = this.filmA();
    const b = this.filmB();
    if (!a || !b) return null;
    const diff = Math.abs(a.year - b.year);
    if (diff === 0) return 'Same year';
    return `${diff} year${diff !== 1 ? 's' : ''} apart`;
  });

  readonly similarityScore = computed(() => {
    const a = this.filmA();
    const b = this.filmB();
    if (!a || !b) return 0;
    let score = 0;
    let maxScore = 0;
    // Shared genres (up to 30 points)
    maxScore += 30;
    const genresA = new Set(a.genres);
    const shared = b.genres.filter((g) => genresA.has(g)).length;
    const totalGenres = new Set([...a.genres, ...b.genres]).size;
    if (totalGenres > 0) score += Math.round((shared / totalGenres) * 30);
    // Same decade (15 points)
    maxScore += 15;
    if (Math.floor(a.year / 10) === Math.floor(b.year / 10)) score += 15;
    else if (Math.abs(a.year - b.year) <= 15) score += 7;
    // Same language (15 points)
    maxScore += 15;
    if (a.language && b.language && a.language === b.language) score += 15;
    // Rating proximity (20 points)
    maxScore += 20;
    if (a.voteAverage > 0 && b.voteAverage > 0) {
      const diff = Math.abs(a.voteAverage - b.voteAverage);
      score += Math.round(Math.max(0, 20 - diff * 4));
    }
    // Shared directors (20 points)
    maxScore += 20;
    const dirsA = new Set(a.directors);
    const sharedDirs = b.directors.filter((d) => dirsA.has(d)).length;
    if (sharedDirs > 0) score += 20;
    return Math.round((score / maxScore) * 100);
  });

  readonly sharedDirectors = computed(() => {
    const a = this.filmA();
    const b = this.filmB();
    if (!a || !b) return [];
    const setB = new Set(b.directors);
    return a.directors.filter((d) => setB.has(d));
  });

  readonly verdict = computed(() => {
    const a = this.filmA();
    const b = this.filmB();
    if (!a || !b) return '';
    if (a.voteAverage > 0 && b.voteAverage > 0) {
      const diff = a.voteAverage - b.voteAverage;
      if (Math.abs(diff) < 0.3) return `${a.title} and ${b.title} are rated nearly identically — a true toss-up.`;
      const winner = diff > 0 ? a : b;
      const loser = diff > 0 ? b : a;
      if (Math.abs(diff) >= 2) return `${winner.title} has a commanding lead over ${loser.title} with a ${Math.abs(diff).toFixed(1)}-point edge.`;
      return `${winner.title} edges out ${loser.title} by ${Math.abs(diff).toFixed(1)} points.`;
    }
    if (a.year !== b.year) {
      const older = a.year < b.year ? a : b;
      const newer = a.year < b.year ? b : a;
      return `${older.title} predates ${newer.title} by ${newer.year - older.year} years.`;
    }
    return `${a.title} and ${b.title} — two films from ${a.year}.`;
  });

  readonly genreOverlapPct = computed(() => {
    const a = this.filmA();
    const b = this.filmB();
    if (!a || !b || a.genres.length === 0 || b.genres.length === 0) return 0;
    const setA = new Set(a.genres);
    const shared = b.genres.filter((g) => setA.has(g)).length;
    const total = new Set([...a.genres, ...b.genres]).size;
    return total > 0 ? Math.round((shared / total) * 100) : 0;
  });

  readonly ratingDifference = computed(() => {
    const a = this.filmA();
    const b = this.filmB();
    if (!a || !b || a.voteAverage === 0 || b.voteAverage === 0) return null;
    const diff = Math.abs(a.voteAverage - b.voteAverage);
    if (diff < 0.1) return null;
    return diff.toFixed(1);
  });

  readonly doubleFeatureNote = computed(() => {
    const score = this.similarityScore();
    if (score >= 70) return 'Perfect double feature!';
    if (score >= 50) return 'Great double feature pairing';
    return null;
  });

  readonly eraLabel = computed(() => {
    const a = this.filmA();
    const b = this.filmB();
    if (!a || !b) return null;
    const decadeA = Math.floor(a.year / 10) * 10;
    const decadeB = Math.floor(b.year / 10) * 10;
    const gap = Math.abs(decadeA - decadeB);
    if (gap === 0) return null; // already covered by "Both from the Xs" in comparisonNotes
    if (gap >= 30) return 'A cross-era pairing';
    return null;
  });

  readonly combinedGenreCount = computed(() => {
    const a = this.filmA();
    const b = this.filmB();
    if (!a || !b) return 0;
    return new Set([...a.genres, ...b.genres]).size;
  });

  readonly combinedDirectorCount = computed(() => {
    const a = this.filmA();
    const b = this.filmB();
    if (!a || !b) return 0;
    return new Set([...a.directors, ...b.directors]).size;
  });

  readonly midpointYear = computed(() => {
    const a = this.filmA();
    const b = this.filmB();
    if (!a || !b) return null;
    const gap = Math.abs(a.year - b.year);
    if (gap < 5) return null;
    return Math.round((a.year + b.year) / 2);
  });

  readonly yearSpan = computed(() => {
    const a = this.filmA();
    const b = this.filmB();
    if (!a || !b) return null;
    const gap = Math.abs(a.year - b.year);
    if (gap < 5) return null;
    const min = Math.min(a.year, b.year);
    const max = Math.max(a.year, b.year);
    return `${min}–${max}`;
  });

  readonly combinedLanguageCount = computed(() => {
    const a = this.filmA();
    const b = this.filmB();
    if (!a || !b) return 0;
    const langs = new Set<string>();
    if (a.language) langs.add(a.language);
    if (b.language) langs.add(b.language);
    return langs.size;
  });

  readonly avgFilmAge = computed(() => {
    const a = this.filmA();
    const b = this.filmB();
    if (!a || !b) return null;
    const now = new Date().getFullYear();
    const avg = Math.round(((now - a.year) + (now - b.year)) / 2);
    return avg >= 30 ? avg : null;
  });

  readonly combinedAvgRating = computed(() => {
    const a = this.filmA();
    const b = this.filmB();
    if (!a || !b || a.voteAverage === 0 || b.voteAverage === 0) return null;
    return ((a.voteAverage + b.voteAverage) / 2).toFixed(1);
  });

  readonly bothStreamable = computed(() => {
    const a = this.filmA();
    const b = this.filmB();
    return !!(a && b && a.isStreamable && b.isStreamable);
  });

  readonly bothNonEnglish = computed(() => {
    const a = this.filmA();
    const b = this.filmB();
    return !!(a && b && a.language && a.language !== 'English' && a.language !== 'en' && b.language && b.language !== 'English' && b.language !== 'en');
  });

  readonly bothHighlyRated = computed(() => {
    const a = this.filmA();
    const b = this.filmB();
    return !!(a && b && a.voteAverage >= 8.0 && b.voteAverage >= 8.0);
  });

  readonly sameLanguage = computed(() => {
    const a = this.filmA();
    const b = this.filmB();
    if (!a || !b || !a.language || !b.language) return null;
    if (a.language === b.language && a.language !== 'English' && a.language !== 'en') return a.language;
    return null;
  });

  readonly combinedTitleLength = computed(() => {
    const a = this.filmA();
    const b = this.filmB();
    if (!a || !b) return null;
    const total = a.title.length + b.title.length;
    return total >= 10 ? total : null;
  });

  readonly sameDecade = computed(() => {
    const a = this.filmA();
    const b = this.filmB();
    if (!a || !b) return false;
    return Math.floor(a.year / 10) === Math.floor(b.year / 10);
  });

  readonly ratingGap = computed(() => {
    const a = this.filmA();
    const b = this.filmB();
    if (!a || !b || a.voteAverage === 0 || b.voteAverage === 0) return null;
    const gap = Math.abs(a.voteAverage - b.voteAverage);
    return gap >= 1.0 ? gap.toFixed(1) : null;
  });

  readonly combinedAvgYear = computed(() => {
    const a = this.filmA();
    const b = this.filmB();
    if (!a || !b) return null;
    return Math.round((a.year + b.year) / 2);
  });

  readonly titleLengthDiff = computed(() => {
    const a = this.filmA();
    const b = this.filmB();
    if (!a || !b) return null;
    const diff = Math.abs(a.title.length - b.title.length);
    return diff >= 5 ? diff : null;
  });

  readonly bothSilentEra = computed(() => {
    const a = this.filmA();
    const b = this.filmB();
    return !!(a && b && a.year < 1930 && b.year < 1930);
  });

  readonly combinedGenreList = computed(() => {
    const a = this.filmA();
    const b = this.filmB();
    if (!a || !b) return null;
    const genres = new Set([...a.genres, ...b.genres]);
    return genres.size >= 3 ? [...genres].slice(0, 4).join(', ') : null;
  });

  readonly bothCoDirected = computed(() => {
    const a = this.filmA();
    const b = this.filmB();
    return !!(a && b && a.directors.length > 1 && b.directors.length > 1);
  });

  readonly bothPreWar = computed(() => {
    const a = this.filmA();
    const b = this.filmB();
    return !!(a && b && a.year < 1940 && b.year < 1940);
  });

  readonly avgYearDiff = computed(() => {
    const a = this.filmA();
    const b = this.filmB();
    if (!a || !b) return null;
    const movies = this.catalog.movies();
    if (movies.length < 10) return null;
    const avgYear = Math.round(movies.reduce((s, m) => s + m.year, 0) / movies.length);
    const pairAvg = Math.round((a.year + b.year) / 2);
    const diff = Math.abs(pairAvg - avgYear);
    return diff >= 5 ? diff : null;
  });

  readonly directorCountDiff = computed(() => {
    const a = this.filmA();
    const b = this.filmB();
    if (!a || !b) return null;
    const diff = Math.abs(a.directors.length - b.directors.length);
    return diff >= 1 ? diff : null;
  });

  readonly genreCountDiff = computed(() => {
    const a = this.filmA();
    const b = this.filmB();
    if (!a || !b) return null;
    const diff = Math.abs(a.genres.length - b.genres.length);
    return diff >= 2 ? diff : null;
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

  /** Close dropdown A after a short delay (allows mousedown on items to fire first) */
  closeDropA(): void {
    setTimeout(() => this.showDropA.set(false), 200);
  }

  /** Close dropdown B after a short delay (allows mousedown on items to fire first) */
  closeDropB(): void {
    setTimeout(() => this.showDropB.set(false), 200);
  }

  copyComparison(): void {
    const a = this.filmA();
    const b = this.filmB();
    if (!a || !b) return;
    const notes = this.comparisonNotes();
    const shared = this.sharedGenres();
    const text = [
      `${a.title} (${a.year}) vs ${b.title} (${b.year})`,
      '',
      `Rating: ${a.voteAverage || '—'} vs ${b.voteAverage || '—'}`,
      `Directors: ${a.directors.join(', ') || '—'} vs ${b.directors.join(', ') || '—'}`,
      `Genres: ${a.genres.join(', ') || '—'} vs ${b.genres.join(', ') || '—'}`,
      `Language: ${a.language || '—'} vs ${b.language || '—'}`,
      '',
      ...notes,
      shared.length > 0 ? `Shared genres: ${shared.join(', ')}` : '',
    ].filter(Boolean).join('\n');
    navigator.clipboard.writeText(text).then(
      () => this.notifications.show('Comparison copied to clipboard', 'success'),
      () => this.notifications.show('Failed to copy', 'error'),
    );
  }

  randomCompare(): void {
    const films = this.catalog.movies().filter((m) => m.posterUrl && m.voteAverage >= 6);
    if (films.length < 2) return;
    const idxA = Math.floor(Math.random() * films.length);
    let idxB = Math.floor(Math.random() * (films.length - 1));
    if (idxB >= idxA) idxB++;
    this.selectA(films[idxA]);
    this.selectB(films[idxB]);
  }

  private searchFilms(query: string): MovieSummary[] {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return this.catalog.movies()
      .filter((m) => m.title.toLowerCase().includes(q))
      .slice(0, 8);
  }
}
