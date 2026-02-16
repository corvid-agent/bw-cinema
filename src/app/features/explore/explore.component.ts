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
        </div>

        @if (!activeMood()) {
          <div class="explore__moods">
            @for (mood of moods; track mood.id) {
              <button class="explore__mood-card" (click)="selectMood(mood)">
                <span class="explore__mood-icon">{{ mood.icon }}</span>
                <span class="explore__mood-name">{{ mood.name }}</span>
                <span class="explore__mood-desc">{{ mood.description }}</span>
                <span class="explore__mood-count">{{ moodCount(mood) }} films</span>
              </button>
            }
          </div>

          @if (recommendations().length > 0) {
            <section class="explore__section">
              <h2>Recommended for You</h2>
              <p class="explore__section-desc">Based on your watched films</p>
              <app-movie-grid [movies]="recommendations()" />
            </section>
          }

          @if (recentlyAdded().length > 0) {
            <section class="explore__section">
              <h2>Recently Added to Catalog</h2>
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
            <app-movie-grid [movies]="moodFilmsPage()" />
            @if (moodFilmsPage().length < moodFilms().length) {
              <div class="explore__load-more">
                <button class="btn-secondary" (click)="loadMore()">Load More</button>
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
    @media (max-width: 480px) {
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

  readonly recommendations = computed(() =>
    this.catalog.getRecommendations(this.collection.watchedIds(), 12)
  );

  readonly recentlyAdded = computed(() =>
    this.catalog.movies()
      .filter((m) => m.isStreamable && m.voteAverage >= 6 && m.posterUrl)
      .slice(-12)
      .reverse()
  );

  readonly unwatchedCount = computed(() => {
    const watchedIds = this.collection.watchedIds();
    return this.catalog.movies().filter((m) => !watchedIds.has(m.id) && m.isStreamable).length;
  });

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

  pickUnwatched(): void {
    const watchedIds = this.collection.watchedIds();
    const films = this.catalog.movies().filter((m) => !watchedIds.has(m.id) && m.isStreamable);
    if (films.length === 0) return;
    this.router.navigate(['/movie', films[Math.floor(Math.random() * films.length)].id]);
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
