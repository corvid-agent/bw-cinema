import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CatalogService } from '../../core/services/catalog.service';
import { CollectionService } from '../../core/services/collection.service';
import { MovieGridComponent } from '../../shared/components/movie-grid.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import type { MovieSummary } from '../../core/models/movie.model';

interface Mood {
  id: string;
  name: string;
  description: string;
  icon: string;
  genres: string[];
  yearRange?: [number, number];
}

const MOODS: Mood[] = [
  { id: 'noir', name: 'Dark & Moody', description: 'Shadowy crime, mystery, and suspense', icon: '🌑', genres: ['Crime', 'Mystery', 'Film Noir', 'Thriller'] },
  { id: 'fun', name: 'Light & Fun', description: 'Comedies, musicals, and feel-good films', icon: '☀️', genres: ['Comedy', 'Musical', 'Music', 'Family'] },
  { id: 'deep', name: 'Thought-Provoking', description: 'Dramas that stay with you', icon: '🎭', genres: ['Drama'] },
  { id: 'thrills', name: 'Edge of Your Seat', description: 'Horror, thriller, and sci-fi', icon: '⚡', genres: ['Horror', 'Thriller', 'Science Fiction'] },
  { id: 'romance', name: 'Romantic', description: 'Love stories across the decades', icon: '💫', genres: ['Romance'] },
  { id: 'adventure', name: 'Adventure & Action', description: 'Swashbucklers, westerns, and epic journeys', icon: '🗺️', genres: ['Adventure', 'Action', 'Western', 'War'] },
  { id: 'silent', name: 'Silent Cinema', description: 'Pioneering films from the silent era', icon: '🎞️', genres: [], yearRange: [1890, 1929] },
  { id: 'foreign', name: 'World Cinema', description: 'International masterpieces beyond English', icon: '🌍', genres: [] },
];

@Component({
  selector: 'app-explore',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MovieGridComponent, LoadingSpinnerComponent],
  template: `
    @if (catalog.loading()) {
      <div class="explore container">
        <app-loading-spinner />
      </div>
    } @else {
      <div class="explore container">
        <div class="explore__header">
          <h1>Explore</h1>
          <p class="explore__subtitle">Discover films by mood, or let fate decide</p>
        </div>

        <div class="explore__random">
          <button class="explore__random-btn" (click)="pickRandom()">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="7.5 4.21 12 6.81 16.5 4.21"/><polyline points="7.5 19.79 7.5 14.6 3 12"/><polyline points="21 12 16.5 14.6 16.5 19.79"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            Surprise Me
          </button>
          @if (unwatchedCount() > 0) {
            <button class="explore__random-btn explore__random-btn--secondary" (click)="pickUnwatched()">
              Pick an Unwatched Film
            </button>
          }
          <button class="explore__random-btn explore__random-btn--secondary" (click)="pickDoubleFeature()">
            Double Feature
          </button>
          <button class="explore__random-btn explore__random-btn--secondary" (click)="pickFilmFestival()">
            Film Festival
          </button>
          <button class="explore__random-btn explore__random-btn--secondary" (click)="pickSerendipity()">
            Serendipity
          </button>
          <button class="explore__random-btn explore__random-btn--secondary" (click)="blindWatch()">
            Blind Watch
          </button>
        </div>

        @if (doubleFeature().length === 2) {
          <div class="explore__double">
            <h2>Tonight's Double Feature</h2>
            <p class="explore__double-desc">Two complementary films for a perfect movie night</p>
            <div class="explore__double-pair">
              @for (m of doubleFeature(); track m.id) {
                <a class="explore__double-card" [routerLink]="['/movie', m.id]">
                  @if (m.posterUrl) {
                    <img [src]="m.posterUrl" [alt]="m.title" />
                  } @else {
                    <div class="explore__double-placeholder">{{ m.title }}</div>
                  }
                  <div class="explore__double-info">
                    <h3>{{ m.title }}</h3>
                    <p>{{ m.year }} &middot; {{ m.directors.join(', ') }}</p>
                    <p class="explore__double-genres">{{ m.genres.slice(0, 2).join(', ') }}</p>
                  </div>
                </a>
              }
            </div>
            <div class="explore__double-actions">
              <button class="btn-secondary" (click)="pickDoubleFeature()">Shuffle Pair</button>
              <button class="btn-ghost" (click)="doubleFeature.set([])">Dismiss</button>
            </div>
          </div>
        }

        @if (filmFestival().films.length === 3) {
          <div class="explore__double">
            <h2>{{ filmFestival().theme }}</h2>
            <p class="explore__double-desc">A curated triple feature for an all-day movie marathon</p>
            <div class="explore__festival-trio">
              @for (m of filmFestival().films; track m.id; let i = $index) {
                <a class="explore__double-card" [routerLink]="['/movie', m.id]">
                  <span class="explore__festival-num">{{ i + 1 }}</span>
                  @if (m.posterUrl) {
                    <img [src]="m.posterUrl" [alt]="m.title" />
                  } @else {
                    <div class="explore__double-placeholder">{{ m.title }}</div>
                  }
                  <div class="explore__double-info">
                    <h3>{{ m.title }}</h3>
                    <p>{{ m.year }} &middot; {{ m.directors.join(', ') }}</p>
                    <p class="explore__double-genres">{{ m.genres.slice(0, 2).join(', ') }}</p>
                  </div>
                </a>
              }
            </div>
            <div class="explore__double-actions">
              <button class="btn-secondary" (click)="pickFilmFestival()">Shuffle Festival</button>
              <button class="btn-ghost" (click)="filmFestival.set({ theme: '', films: [] })">Dismiss</button>
            </div>
          </div>
        }

        @if (catalogProgress(); as prog) {
          <div class="explore__catalog-progress">
            <div class="explore__catalog-header">
              <span class="explore__catalog-label">Catalog Progress</span>
              <span class="explore__catalog-pct">{{ prog.pct }}%</span>
            </div>
            <div class="explore__catalog-track">
              <div class="explore__catalog-fill" [style.width.%]="prog.pct"></div>
            </div>
            <span class="explore__catalog-detail">{{ prog.watched }} of {{ prog.total }} streamable films watched</span>
          </div>
        }

        @if (!activeMood()) {
          <div class="explore__moods">
            @for (mood of moods; track mood.id) {
              <button class="explore__mood-card" (click)="selectMood(mood)">
                <span class="explore__mood-icon">{{ mood.icon }}</span>
                <span class="explore__mood-name">{{ mood.name }}</span>
                <span class="explore__mood-desc">{{ mood.description }}</span>
                <span class="explore__mood-count">{{ moodCount(mood) }} films</span>
                @if (moodWatchedCount(mood) > 0) {
                  <span class="explore__mood-watched">{{ moodWatchedCount(mood) }} watched</span>
                }
                @if (moodWatchedCount(mood) > 0 && moodWatchedCount(mood) >= moodCount(mood)) {
                  <span class="explore__mood-complete">Complete!</span>
                }
              </button>
            }
          </div>

          @if (recommendations().length > 0) {
            <section class="explore__section">
              <h2>Recommended for You</h2>
              <p class="explore__section-desc">Based on your watched films</p>
              <app-movie-grid [movies]="recommendations().slice(0, recLimit())" />
              @if (recommendations().length > recLimit()) {
                <div class="explore__load-more">
                  <button class="btn-secondary" (click)="recLimit.update(l => l + 12)">Show More Recommendations</button>
                </div>
              }
            </section>
          } @else {
            <section class="explore__section explore__start-watching">
              <div class="explore__start-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
              <h3>Start watching to get personalized picks</h3>
              <p class="explore__section-desc">Mark films as watched and we'll recommend similar titles</p>
            </section>
          }

          @if (watchProgress(); as progress) {
            <section class="explore__section">
              <h2>Your Exploration Progress</h2>
              <p class="explore__section-desc">How many streamable films you've watched per mood</p>
              <div class="explore__progress-grid">
                @for (p of progress; track p.name) {
                  <div class="explore__progress-item">
                    <div class="explore__progress-header">
                      <span class="explore__progress-icon">{{ p.icon }}</span>
                      <span class="explore__progress-name">{{ p.name }}</span>
                      <span class="explore__progress-frac">{{ p.watched }}/{{ p.total }}</span>
                    </div>
                    <div class="explore__progress-track">
                      <div class="explore__progress-fill" [style.width.%]="p.pct"></div>
                    </div>
                  </div>
                }
              </div>
            </section>
          }

          @if (recentlyAdded().length > 0) {
            <section class="explore__section">
              <h2>More to Discover</h2>
              <p class="explore__section-desc">Highly rated streamable films from the catalog</p>
              <app-movie-grid [movies]="recentlyAdded()" />
            </section>
          }
        } @else {
          <div class="explore__active-mood">
            <button class="btn-ghost explore__back" (click)="activeMood.set(null)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              All Moods
            </button>
            <div class="explore__mood-header">
              <span class="explore__mood-icon explore__mood-icon--lg">{{ activeMood()!.icon }}</span>
              <div>
                <h2>{{ activeMood()!.name }}</h2>
                <p class="explore__mood-desc">{{ activeMood()!.description }}</p>
              </div>
            </div>
            <div class="explore__mood-actions">
              <button class="btn-secondary" (click)="shuffleMood()">Shuffle</button>
              <span class="explore__mood-count">{{ moodFilms().length }} films found</span>
            </div>
            @if (moodFilms().length > 0) {
              <app-movie-grid [movies]="moodFilmsPage()" />
              @if (moodFilmsPage().length < moodFilms().length) {
                <div class="explore__load-more">
                  <button class="btn-secondary" (click)="loadMore()">Load More</button>
                </div>
              }
            } @else {
              <div class="explore__mood-empty">
                <p>No streamable films found for this mood.</p>
                <button class="btn-secondary" (click)="activeMood.set(null)">Try another mood</button>
              </div>
            }
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .explore { padding: var(--space-xl) 0; }
    .explore__header { margin-bottom: var(--space-lg); }
    .explore__subtitle {
      color: var(--text-tertiary);
      font-size: 0.95rem;
      margin: 0;
    }
    .explore__random {
      display: flex;
      gap: var(--space-md);
      margin-bottom: var(--space-2xl);
    }
    .explore__random-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-md) var(--space-xl);
      background: linear-gradient(135deg, var(--accent-gold) 0%, #c49b2c 100%);
      color: var(--bg-deep);
      border: none;
      border-radius: var(--radius-lg);
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .explore__random-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(212, 175, 55, 0.3);
    }
    .explore__random-btn--secondary {
      background: var(--bg-surface);
      color: var(--text-primary);
      border: 1px solid var(--border);
    }
    .explore__random-btn--secondary:hover {
      border-color: var(--accent-gold);
      color: var(--accent-gold);
      box-shadow: none;
    }
    .explore__moods {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: var(--space-md);
      margin-bottom: var(--space-2xl);
    }
    .explore__mood-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-xs);
      padding: var(--space-lg);
      background-color: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
      color: var(--text-primary);
    }
    .explore__mood-card:hover {
      border-color: var(--accent-gold);
      transform: translateY(-3px);
      box-shadow: var(--shadow-md);
    }
    .explore__mood-icon {
      font-size: 2rem;
      margin-bottom: var(--space-xs);
    }
    .explore__mood-icon--lg {
      font-size: 2.5rem;
    }
    .explore__mood-name {
      font-family: var(--font-heading);
      font-size: 1.1rem;
      font-weight: 700;
    }
    .explore__mood-desc {
      font-size: 0.85rem;
      color: var(--text-tertiary);
      margin: 0;
    }
    .explore__mood-count {
      font-size: 0.75rem;
      color: var(--accent-gold);
      font-weight: 600;
    }
    .explore__mood-watched {
      font-size: 0.7rem;
      color: var(--text-tertiary);
      background: var(--bg-raised);
      padding: 2px 8px;
      border-radius: 8px;
    }
    .explore__mood-complete {
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--accent-gold);
      background: var(--accent-gold-dim);
      padding: 2px 8px;
      border-radius: 8px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .explore__double {
      margin-bottom: var(--space-2xl);
      padding: var(--space-xl);
      background: var(--bg-surface);
      border: 1px solid var(--accent-gold);
      border-radius: var(--radius-xl);
      text-align: center;
    }
    .explore__double h2 { margin-bottom: var(--space-xs); }
    .explore__double-desc {
      color: var(--text-tertiary);
      font-size: 0.9rem;
      margin: 0 0 var(--space-xl);
    }
    .explore__double-pair {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-xl);
      margin-bottom: var(--space-lg);
    }
    .explore__double-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-decoration: none;
      color: inherit;
      transition: transform 0.2s;
    }
    .explore__double-card:hover { color: inherit; transform: translateY(-4px); }
    .explore__double-card img {
      width: 160px;
      aspect-ratio: 2 / 3;
      object-fit: cover;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-poster);
      margin-bottom: var(--space-md);
    }
    .explore__double-placeholder {
      width: 160px;
      aspect-ratio: 2 / 3;
      background: var(--bg-raised);
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      color: var(--text-tertiary);
      text-align: center;
      padding: var(--space-sm);
      margin-bottom: var(--space-md);
    }
    .explore__double-info h3 { font-size: 1rem; margin: 0 0 4px; }
    .explore__double-info p {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin: 0;
    }
    .explore__double-genres {
      color: var(--accent-gold) !important;
      font-weight: 600;
    }
    .explore__festival-trio {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: var(--space-xl);
      margin-bottom: var(--space-lg);
    }
    .explore__festival-num {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--accent-gold);
      color: var(--bg-deep);
      font-size: 0.75rem;
      font-weight: 700;
      margin-bottom: var(--space-sm);
    }
    .explore__double-actions {
      display: flex;
      gap: var(--space-md);
      justify-content: center;
    }
    .explore__section {
      margin-bottom: var(--space-2xl);
    }
    .explore__section h2 {
      margin-bottom: var(--space-xs);
    }
    .explore__section-desc {
      color: var(--text-tertiary);
      font-size: 0.9rem;
      margin: 0 0 var(--space-lg);
    }
    .explore__load-more {
      text-align: center;
      margin-top: var(--space-xl);
    }
    .explore__active-mood {
      margin-bottom: var(--space-xl);
    }
    .explore__back {
      display: inline-flex;
      align-items: center;
      gap: var(--space-xs);
      font-size: 0.9rem;
      margin-bottom: var(--space-lg);
      color: var(--text-tertiary);
    }
    .explore__back:hover {
      color: var(--accent-gold);
    }
    .explore__mood-header {
      display: flex;
      align-items: center;
      gap: var(--space-lg);
      margin-bottom: var(--space-lg);
    }
    .explore__mood-actions {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      margin-bottom: var(--space-lg);
    }
    .explore__load-more {
      text-align: center;
      padding: var(--space-xl) 0;
    }
    .explore__mood-empty {
      text-align: center;
      padding: var(--space-3xl);
      color: var(--text-tertiary);
    }
    .explore__progress-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-md);
    }
    .explore__progress-item {
      padding: var(--space-md);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
    }
    .explore__progress-header {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      margin-bottom: var(--space-sm);
    }
    .explore__progress-icon { font-size: 1.1rem; }
    .explore__progress-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    .explore__progress-frac {
      margin-left: auto;
      font-size: 0.75rem;
      color: var(--text-tertiary);
      font-weight: 600;
    }
    .explore__progress-track {
      height: 6px;
      background: var(--bg-raised);
      border-radius: 3px;
      overflow: hidden;
    }
    .explore__progress-fill {
      height: 100%;
      background: var(--accent-gold);
      border-radius: 3px;
      min-width: 2px;
      transition: width 0.4s ease;
    }
    .explore__start-watching {
      text-align: center;
      padding: var(--space-2xl);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
    }
    .explore__start-icon {
      color: var(--accent-gold);
      margin-bottom: var(--space-md);
    }
    .explore__start-watching h3 {
      margin-bottom: var(--space-xs);
    }
    .explore__catalog-progress {
      margin-bottom: var(--space-2xl);
      padding: var(--space-lg);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
    }
    .explore__catalog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-sm);
    }
    .explore__catalog-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .explore__catalog-pct {
      font-family: var(--font-heading);
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--accent-gold);
    }
    .explore__catalog-track {
      height: 8px;
      background: var(--bg-raised);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: var(--space-xs);
    }
    .explore__catalog-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent-gold), #c49b2c);
      border-radius: 4px;
      min-width: 2px;
      transition: width 0.4s ease;
    }
    .explore__catalog-detail {
      font-size: 0.75rem;
      color: var(--text-tertiary);
    }
    @media (max-width: 480px) {
      .explore__double-pair { grid-template-columns: 1fr; gap: var(--space-lg); }
      .explore__festival-trio { grid-template-columns: 1fr; gap: var(--space-lg); }
      .explore__double-card img { width: 120px; }
      .explore__double { padding: var(--space-md); }
      .explore__random {
        flex-direction: column;
      }
      .explore__moods {
        grid-template-columns: repeat(2, 1fr);
      }
      .explore__mood-card {
        padding: var(--space-md);
      }
      .explore__mood-icon { font-size: 1.5rem; }
      .explore__mood-name { font-size: 0.95rem; }
      .explore__progress-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class ExploreComponent implements OnInit {
  protected readonly catalog = inject(CatalogService);
  private readonly collection = inject(CollectionService);
  private readonly router = inject(Router);
  private readonly titleService = inject(Title);

  readonly moods = MOODS;
  readonly activeMood = signal<Mood | null>(null);
  readonly doubleFeature = signal<MovieSummary[]>([]);
  readonly filmFestival = signal<{ theme: string; films: MovieSummary[] }>({ theme: '', films: [] });
  readonly moodPage = signal(1);
  private readonly shuffleSeed = signal(0);

  readonly moodFilms = computed(() => {
    const mood = this.activeMood();
    if (!mood) return [];
    let films = this.catalog.movies().filter((m) => m.isStreamable);

    if (mood.id === 'foreign') {
      films = films.filter((m) => m.language && m.language !== 'English');
    } else if (mood.yearRange) {
      films = films.filter((m) => m.year >= mood.yearRange![0] && m.year <= mood.yearRange![1]);
    } else if (mood.genres.length > 0) {
      const genreSet = new Set(mood.genres.map((g) => g.toLowerCase()));
      films = films.filter((m) => m.genres.some((g) => genreSet.has(g.toLowerCase())));
    }

    // Shuffle with seed for consistent but reshuffleable order
    const seed = this.shuffleSeed();
    return this.seededShuffle([...films], seed);
  });

  readonly moodFilmsPage = computed(() =>
    this.moodFilms().slice(0, this.moodPage() * 24)
  );

  readonly recLimit = signal(12);

  readonly recommendations = computed(() =>
    this.catalog.getRecommendations(this.collection.watchedIds(), 48)
  );

  readonly recentlyAdded = computed(() =>
    this.catalog.movies()
      .filter((m) => m.isStreamable && m.voteAverage >= 6 && m.posterUrl)
      .slice(-12)
      .reverse()
  );

  readonly watchProgress = computed(() => {
    const watchedIds = this.collection.watchedIds();
    if (watchedIds.size === 0) return null;
    const films = this.catalog.movies().filter((m) => m.isStreamable);
    const watched = films.filter((m) => watchedIds.has(m.id));
    return MOODS.map((mood) => {
      const moodFilter = (m: MovieSummary) => {
        if (mood.id === 'foreign') return m.language != null && m.language !== 'English';
        if (mood.yearRange) return m.year >= mood.yearRange[0] && m.year <= mood.yearRange[1];
        if (mood.genres.length > 0) {
          const gs = new Set(mood.genres.map((g) => g.toLowerCase()));
          return m.genres.some((g) => gs.has(g.toLowerCase()));
        }
        return false;
      };
      const total = films.filter(moodFilter).length;
      const w = watched.filter(moodFilter).length;
      return {
        name: mood.name,
        icon: mood.icon,
        total,
        watched: w,
        pct: total > 0 ? Math.round((w / total) * 100) : 0,
      };
    }).filter((p) => p.total > 0);
  });

  readonly catalogProgress = computed(() => {
    const watchedIds = this.collection.watchedIds();
    if (watchedIds.size === 0) return null;
    const streamable = this.catalog.movies().filter((m) => m.isStreamable);
    const total = streamable.length;
    if (total === 0) return null;
    const watched = streamable.filter((m) => watchedIds.has(m.id)).length;
    const pct = Math.round((watched / total) * 100);
    return { watched, total, pct };
  });

  readonly unwatchedCount = computed(() => {
    const watchedIds = this.collection.watchedIds();
    return this.catalog.movies().filter((m) => !watchedIds.has(m.id) && m.isStreamable).length;
  });

  moodWatchedCount(mood: Mood): number {
    const watchedIds = this.collection.watchedIds();
    if (watchedIds.size === 0) return 0;
    const films = this.catalog.movies().filter((m) => watchedIds.has(m.id));
    if (mood.id === 'foreign') return films.filter((m) => m.language && m.language !== 'English').length;
    if (mood.yearRange) return films.filter((m) => m.year >= mood.yearRange![0] && m.year <= mood.yearRange![1]).length;
    if (mood.genres.length > 0) {
      const genreSet = new Set(mood.genres.map((g) => g.toLowerCase()));
      return films.filter((m) => m.genres.some((g) => genreSet.has(g.toLowerCase()))).length;
    }
    return 0;
  }

  moodCount(mood: Mood): number {
    const films = this.catalog.movies().filter((m) => m.isStreamable);
    if (mood.id === 'foreign') {
      return films.filter((m) => m.language && m.language !== 'English').length;
    }
    if (mood.yearRange) {
      return films.filter((m) => m.year >= mood.yearRange![0] && m.year <= mood.yearRange![1]).length;
    }
    if (mood.genres.length > 0) {
      const genreSet = new Set(mood.genres.map((g) => g.toLowerCase()));
      return films.filter((m) => m.genres.some((g) => genreSet.has(g.toLowerCase()))).length;
    }
    return 0;
  }

  ngOnInit(): void {
    this.catalog.load();
    this.titleService.setTitle('Explore — BW Cinema');
    this.shuffleSeed.set(Date.now());
  }

  selectMood(mood: Mood): void {
    this.activeMood.set(mood);
    this.moodPage.set(1);
    this.shuffleSeed.set(Date.now());
  }

  shuffleMood(): void {
    this.shuffleSeed.set(Date.now());
    this.moodPage.set(1);
  }

  pickRandom(): void {
    const films = this.catalog.movies().filter((m) => m.isStreamable);
    if (films.length === 0) return;
    this.router.navigate(['/movie', films[Math.floor(Math.random() * films.length)].id]);
  }

  loadMore(): void {
    this.moodPage.update((p) => p + 1);
  }

  pickDoubleFeature(): void {
    const watchedIds = this.collection.watchedIds();
    const films = this.catalog.movies().filter((m) => m.isStreamable && !watchedIds.has(m.id) && m.posterUrl && m.voteAverage >= 6);
    if (films.length < 2) return;
    // Pick a random first film
    const first = films[Math.floor(Math.random() * films.length)];
    // Find a complementary second film: shared genre, different director, similar decade
    const firstGenres = new Set(first.genres.map((g) => g.toLowerCase()));
    const firstDecade = Math.floor(first.year / 10) * 10;
    const candidates = films
      .filter((m) => m.id !== first.id)
      .map((m) => {
        let score = 0;
        if (m.genres.some((g) => firstGenres.has(g.toLowerCase()))) score += 3;
        if (Math.floor(m.year / 10) * 10 === firstDecade) score += 1;
        if (!m.directors.some((d) => first.directors.includes(d))) score += 1;
        return { movie: m, score };
      })
      .filter((x) => x.score >= 3)
      .sort((a, b) => b.score - a.score);
    const second = candidates.length > 0
      ? candidates[Math.floor(Math.random() * Math.min(candidates.length, 10))].movie
      : films.filter((m) => m.id !== first.id)[Math.floor(Math.random() * (films.length - 1))];
    this.doubleFeature.set([first, second]);
  }

  pickFilmFestival(): void {
    const watchedIds = this.collection.watchedIds();
    const films = this.catalog.movies().filter((m) => m.isStreamable && !watchedIds.has(m.id) && m.posterUrl && m.voteAverage >= 5.5);
    if (films.length < 3) return;

    // Pick a theme: shared genre or shared director or shared decade
    const themes = [
      { name: 'Director Spotlight', pick: () => this.pickByDirector(films) },
      { name: 'Genre Deep Dive', pick: () => this.pickByGenre(films) },
      { name: 'Decade Marathon', pick: () => this.pickByDecade(films) },
    ];
    const theme = themes[Math.floor(Math.random() * themes.length)];
    const result = theme.pick();
    if (result) {
      this.filmFestival.set({ theme: result.theme, films: result.films });
    }
  }

  private pickByDirector(films: MovieSummary[]): { theme: string; films: MovieSummary[] } | null {
    const dirFilms = new Map<string, MovieSummary[]>();
    for (const m of films) {
      for (const d of m.directors) {
        const list = dirFilms.get(d) ?? [];
        list.push(m);
        dirFilms.set(d, list);
      }
    }
    const eligible = [...dirFilms.entries()].filter(([, f]) => f.length >= 3);
    if (eligible.length === 0) return this.pickByGenre(films);
    const [dir, dirMovies] = eligible[Math.floor(Math.random() * eligible.length)];
    const shuffled = [...dirMovies].sort(() => Math.random() - 0.5).slice(0, 3);
    return { theme: `${dir} Festival`, films: shuffled };
  }

  private pickByGenre(films: MovieSummary[]): { theme: string; films: MovieSummary[] } | null {
    const genreFilms = new Map<string, MovieSummary[]>();
    for (const m of films) {
      for (const g of m.genres) {
        const list = genreFilms.get(g) ?? [];
        list.push(m);
        genreFilms.set(g, list);
      }
    }
    const eligible = [...genreFilms.entries()].filter(([, f]) => f.length >= 6);
    if (eligible.length === 0) return null;
    const [genre, genreMovies] = eligible[Math.floor(Math.random() * eligible.length)];
    const shuffled = [...genreMovies].sort(() => Math.random() - 0.5).slice(0, 3);
    return { theme: `${genre} Triple Feature`, films: shuffled };
  }

  private pickByDecade(films: MovieSummary[]): { theme: string; films: MovieSummary[] } | null {
    const decadeFilms = new Map<number, MovieSummary[]>();
    for (const m of films) {
      const d = Math.floor(m.year / 10) * 10;
      const list = decadeFilms.get(d) ?? [];
      list.push(m);
      decadeFilms.set(d, list);
    }
    const eligible = [...decadeFilms.entries()].filter(([, f]) => f.length >= 6);
    if (eligible.length === 0) return this.pickByGenre(films);
    const [decade, decMovies] = eligible[Math.floor(Math.random() * eligible.length)];
    const shuffled = [...decMovies].sort(() => Math.random() - 0.5).slice(0, 3);
    return { theme: `Best of the ${decade}s`, films: shuffled };
  }

  pickSerendipity(): void {
    // Truly random: pick a streamable film the user hasn't watched, ignoring ratings/popularity
    const watchedIds = this.collection.watchedIds();
    const films = this.catalog.movies().filter((m) => m.isStreamable && !watchedIds.has(m.id));
    if (films.length === 0) return;
    this.router.navigate(['/movie', films[Math.floor(Math.random() * films.length)].id]);
  }

  pickUnwatched(): void {
    const watchedIds = this.collection.watchedIds();
    const films = this.catalog.movies().filter((m) => !watchedIds.has(m.id) && m.isStreamable);
    if (films.length === 0) return;
    this.router.navigate(['/movie', films[Math.floor(Math.random() * films.length)].id]);
  }

  blindWatch(): void {
    const watchedIds = this.collection.watchedIds();
    const films = this.catalog.movies().filter((m) => m.isStreamable && !watchedIds.has(m.id));
    if (films.length === 0) return;
    const pick = films[Math.floor(Math.random() * films.length)];
    this.router.navigate(['/watch', pick.id]);
  }

  private seededShuffle<T>(arr: T[], seed: number): T[] {
    let s = seed;
    const random = () => {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
