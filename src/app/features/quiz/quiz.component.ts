import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { CollectionService } from '../../core/services/collection.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import type { MovieSummary } from '../../core/models/movie.model';

interface QuizStep {
  question: string;
  options: { label: string; value: string }[];
}

@Component({
  selector: 'app-quiz',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="quiz container">
      <h1>What Should I Watch?</h1>
      <p class="quiz__subtitle">Answer a few questions and we'll recommend the perfect classic film.</p>

      @if (catalog.loading()) {
        <app-loading-spinner />
      } @else if (!showResults()) {
        <div class="quiz__progress">
          <div class="quiz__progress-bar" [style.width.%]="progressPct()"></div>
        </div>
        <div class="quiz__step">
          <h2 class="quiz__question">{{ currentStep().question }}</h2>
          <div class="quiz__options">
            @for (opt of currentStep().options; track opt.value) {
              <button
                class="quiz__option"
                [class.quiz__option--selected]="answers()[step()] === opt.value"
                (click)="selectAnswer(opt.value)"
              >
                {{ opt.label }}
              </button>
            }
          </div>
          <div class="quiz__nav">
            @if (step() > 0) {
              <button class="btn-ghost" (click)="step.set(step() - 1)">Back</button>
            }
          </div>
        </div>
      } @else {
        <div class="quiz__results">
          <h2>Your Recommendations</h2>
          <p class="quiz__results-subtitle">Based on your preferences, here are {{ results().length }} films we think you'll enjoy:</p>
          @if (poolSize() > results().length) {
            <p class="quiz__pool-note">
              Shuffled from {{ poolSize() }} matching films
              @if (avgMatchScore() > 0) {
                &middot; Avg {{ avgMatchScore() }}% match
              }
            </p>
          }
          @if (resultDecadeRange(); as dr) {
            <p class="quiz__decade-range">Spanning {{ dr }}</p>
          }
          @if (resultAvgRating(); as avgR) {
            <p class="quiz__decade-range">Avg rating: &#9733; {{ avgR }}</p>
          }
          @if (resultStreamableCount() > 0) {
            <p class="quiz__decade-range">{{ resultStreamableCount() }} of {{ results().length }} free to watch</p>
          }
          @if (resultUniqueDirectors() > 1) {
            <p class="quiz__decade-range">{{ resultUniqueDirectors() }} different directors</p>
          }
          @if (resultAvgYear(); as ray) {
            <p class="quiz__decade-range">Average release year: {{ ray }}</p>
          }
          @if (resultLanguageCount(); as rlc) {
            <p class="quiz__decade-range">{{ rlc }} languages represented</p>
          }
          @if (resultGenreCount(); as rgc) {
            <p class="quiz__decade-range">{{ rgc }} genres covered</p>
          }
          @if (resultOldestYear(); as roy) {
            <p class="quiz__decade-range">Oldest from {{ roy }}</p>
          }
          @if (resultHighestRated(); as rhr) {
            <p class="quiz__decade-range">Top pick: {{ rhr }}</p>
          }
          @if (resultAvgFilmAge(); as rafa) {
            <p class="quiz__decade-range">Avg age: {{ rafa }} years</p>
          }
          @if (resultCoDirectedCount(); as rcdc) {
            <p class="quiz__decade-range">{{ rcdc }} co-directed films</p>
          }
          @if (resultNonEnglishCount(); as rnec) {
            <p class="quiz__decade-range">{{ rnec }} non-English films</p>
          }
          @if (resultSilentEraCount(); as rsec) {
            <p class="quiz__decade-range">{{ rsec }} silent-era films (pre-1930)</p>
          }
          @if (resultMedianYear(); as rmy) {
            <p class="quiz__decade-range">Median year: {{ rmy }}</p>
          }
          @if (resultStreamablePct(); as rsp) {
            <p class="quiz__decade-range">{{ rsp }}% free to watch</p>
          }
          @if (resultCoDirectedPct(); as rcdp) {
            <p class="quiz__decade-range">{{ rcdp }}% co-directed</p>
          }
          @if (resultAvgTitleLength(); as ratl) {
            <p class="quiz__decade-range">Avg title: {{ ratl }} characters</p>
          }
          @if (resultHighlyRatedCount(); as rhrc) {
            <p class="quiz__decade-range">{{ rhrc }} rated 8.0+</p>
          }
          @if (resultLongestTitle(); as rlt) {
            <p class="quiz__decade-range">Longest: "{{ rlt }}"</p>
          }
          @if (resultShortestTitle(); as rst) {
            <p class="quiz__decade-range">Shortest: "{{ rst }}"</p>
          }
          @if (resultTopDirector(); as rtd) {
            <p class="quiz__decade-range">Top director: {{ rtd }}</p>
          }
          @if (resultNewestTitle(); as rnt) {
            <p class="quiz__decade-range">Newest: "{{ rnt }}"</p>
          }
          @if (resultOldestTitle(); as rot) {
            <p class="quiz__decade-range">Oldest: "{{ rot }}"</p>
          }
          @if (resultMedianRating(); as rmr) {
            <p class="quiz__decade-range">Median rating: &#9733; {{ rmr }}</p>
          }
          @if (resultNonEnglishPct(); as rnep) {
            <p class="quiz__decade-range">{{ rnep }}% non-English</p>
          }
          @if (resultSilentEraPct(); as rsep) {
            <p class="quiz__decade-range">{{ rsep }}% from silent era</p>
          }
          @if (resultPreWarPct(); as rpwp) {
            <p class="quiz__decade-range">{{ rpwp }}% pre-1940</p>
          }
          @if (resultUniqueDirectorCount(); as rudc) {
            <p class="quiz__decade-range">{{ rudc }} unique directors</p>
          }
          @if (resultAvgDirectorCount(); as radc) {
            <p class="quiz__decade-range">Avg {{ radc }} directors per film</p>
          }
          @if (resultAvgGenreCount(); as ragc) {
            <p class="quiz__decade-range">Avg {{ ragc }} genres per film</p>
          }
          @if (resultPosterCoveragePct(); as rpcp) {
            <p class="quiz__decade-range">{{ rpcp }}% have poster art</p>
          }
          @if (resultImdbLinkedPct(); as rilp) {
            <p class="quiz__decade-range">{{ rilp }}% linked to IMDb</p>
          }
          @if (resultYtStreamablePct(); as rysp) {
            <p class="quiz__decade-range">{{ rysp }}% on YouTube</p>
          }
          @if (resultIaStreamableCount(); as riasc) {
            <p class="quiz__decade-range">{{ riasc }} on Internet Archive</p>
          }
          <div class="quiz__prefs">
            @for (pref of selectedPrefs(); track pref) {
              <span class="quiz__pref-chip">{{ pref }}</span>
            }
          </div>
          <div class="quiz__result-grid">
            @for (m of results(); track m.id) {
              <a class="quiz__result-card" [routerLink]="['/movie', m.id]">
                @if (m.id === bestMatchId()) {
                  <span class="quiz__best-match">Best Match</span>
                } @else if (matchScores().get(m.id); as score) {
                  <span class="quiz__match-score">{{ score }}% match</span>
                }
                @if (m.posterUrl) {
                  <img [src]="m.posterUrl" [alt]="m.title" loading="lazy" />
                } @else {
                  <div class="quiz__poster-placeholder">
                    <span>{{ m.title }}</span>
                  </div>
                }
                <div class="quiz__result-info">
                  <h3>{{ m.title }}</h3>
                  <p class="quiz__result-meta">{{ m.year }} &middot; {{ m.genres.slice(0, 2).join(', ') }}</p>
                  @if (m.voteAverage > 0) {
                    <p class="quiz__result-rating">&#9733; {{ m.voteAverage.toFixed(1) }}</p>
                  }
                  @if (matchReasons().get(m.id); as reasons) {
                    <div class="quiz__match-tags">
                      @for (tag of reasons; track tag) {
                        <span class="quiz__match-tag">{{ tag }}</span>
                      }
                    </div>
                  }
                </div>
              </a>
            }
          </div>
          <div class="quiz__result-actions">
            <button class="btn-secondary" (click)="shuffle()">Shuffle</button>
            <button class="quiz__add-all" (click)="addAllToWatchlist()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add All to Watchlist
            </button>
            <button class="quiz__share-btn" (click)="shareResults()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              Share Results
            </button>
            <button class="btn-ghost" (click)="restart()">Start Over</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .quiz { padding: var(--space-xl) 0; max-width: 700px; }
    .quiz__subtitle {
      color: var(--text-tertiary);
      margin: 0 0 var(--space-xl);
    }
    .quiz__progress {
      height: 4px;
      background-color: var(--bg-raised);
      border-radius: 2px;
      margin-bottom: var(--space-xl);
      overflow: hidden;
    }
    .quiz__progress-bar {
      height: 100%;
      background-color: var(--accent-gold);
      border-radius: 2px;
      transition: width 0.3s ease;
    }
    .quiz__step {
      text-align: center;
    }
    .quiz__question {
      margin-bottom: var(--space-xl);
    }
    .quiz__options {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      max-width: 400px;
      margin: 0 auto var(--space-xl);
    }
    .quiz__option {
      padding: var(--space-md) var(--space-lg);
      background-color: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      color: var(--text-primary);
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
    }
    .quiz__option:hover {
      border-color: var(--accent-gold);
      background-color: var(--accent-gold-dim);
    }
    .quiz__option--selected {
      border-color: var(--accent-gold);
      background-color: var(--accent-gold-dim);
      color: var(--accent-gold);
      font-weight: 600;
    }
    .quiz__nav {
      display: flex;
      justify-content: center;
    }
    .quiz__results {
      text-align: center;
    }
    .quiz__results-subtitle {
      color: var(--text-secondary);
      margin: 0 0 var(--space-xl);
    }
    .quiz__prefs {
      display: flex;
      gap: var(--space-xs);
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: var(--space-lg);
    }
    .quiz__pref-chip {
      font-size: 0.75rem;
      padding: 3px 10px;
      border-radius: 10px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      color: var(--text-secondary);
    }
    .quiz__result-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: var(--space-md);
      margin-bottom: var(--space-xl);
      text-align: left;
    }
    .quiz__result-card {
      text-decoration: none;
      color: inherit;
      transition: transform 0.2s;
    }
    .quiz__result-card:hover { color: inherit; }
    @media (hover: hover) and (pointer: fine) {
      .quiz__result-card:hover { transform: translateY(-4px); }
    }
    .quiz__match-score {
      display: inline-block;
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--accent-gold);
      background: var(--accent-gold-dim);
      padding: 2px 8px;
      border-radius: 8px;
      margin-bottom: var(--space-xs);
    }
    .quiz__best-match {
      display: inline-block;
      font-size: 0.7rem;
      font-weight: 700;
      color: #fff;
      background: rgba(25, 135, 84, 0.9);
      padding: 2px 8px;
      border-radius: 8px;
      margin-bottom: var(--space-xs);
    }
    .quiz__result-card img {
      width: 100%;
      aspect-ratio: 2 / 3;
      object-fit: cover;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-poster);
      margin-bottom: var(--space-sm);
    }
    .quiz__poster-placeholder {
      width: 100%;
      aspect-ratio: 2 / 3;
      background: var(--bg-raised);
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-heading);
      color: var(--text-tertiary);
      text-align: center;
      padding: var(--space-sm);
      margin-bottom: var(--space-sm);
    }
    .quiz__result-info h3 {
      font-size: 0.9rem;
      margin: 0 0 2px;
    }
    .quiz__result-meta {
      font-size: 0.8rem;
      color: var(--text-tertiary);
      margin: 0;
    }
    .quiz__result-rating {
      font-size: 0.85rem;
      color: var(--accent-gold);
      font-weight: 700;
      margin: 4px 0 0;
    }
    .quiz__match-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 4px;
    }
    .quiz__match-tag {
      font-size: 0.65rem;
      padding: 1px 6px;
      border-radius: 6px;
      background: var(--accent-gold-dim);
      color: var(--accent-gold);
      font-weight: 600;
      white-space: nowrap;
    }
    .quiz__result-actions {
      display: flex;
      gap: var(--space-md);
      justify-content: center;
      flex-wrap: wrap;
    }
    .quiz__add-all {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: var(--space-sm) var(--space-lg);
      background: var(--accent-gold-dim);
      border: 1px solid var(--accent-gold);
      border-radius: var(--radius-lg);
      color: var(--accent-gold);
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .quiz__add-all:hover {
      background: var(--accent-gold);
      color: var(--bg-deep);
    }
    .quiz__share-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: var(--space-sm) var(--space-lg);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      color: var(--text-secondary);
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .quiz__share-btn:hover {
      border-color: var(--accent-gold);
      color: var(--accent-gold);
    }
    .quiz__pool-note {
      font-size: 0.8rem;
      color: var(--text-tertiary);
      margin: calc(-1 * var(--space-md)) 0 var(--space-lg);
    }
    .quiz__decade-range {
      font-size: 0.8rem;
      color: var(--text-tertiary);
      margin: 0 0 var(--space-sm);
    }
    @media (max-width: 480px) {
      .quiz__result-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `],
})
export class QuizComponent implements OnInit {
  protected readonly catalog = inject(CatalogService);
  private readonly collection = inject(CollectionService);
  private readonly notifications = inject(NotificationService);

  private readonly steps: QuizStep[] = [
    {
      question: 'What era interests you most?',
      options: [
        { label: 'Silent era (pre-1930)', value: 'silent' },
        { label: 'Golden age (1930s–1940s)', value: 'golden' },
        { label: 'Post-war (1950s–1960s)', value: 'postwar' },
        { label: 'Surprise me!', value: 'any' },
      ],
    },
    {
      question: 'What genre are you in the mood for?',
      options: [
        { label: 'Drama', value: 'Drama' },
        { label: 'Comedy', value: 'Comedy' },
        { label: 'Horror / Thriller', value: 'Horror' },
        { label: 'Anything goes', value: 'any' },
      ],
    },
    {
      question: 'What mood are you looking for?',
      options: [
        { label: 'Something thought-provoking', value: 'deep' },
        { label: 'Light and fun', value: 'light' },
        { label: 'Dark and intense', value: 'dark' },
        { label: 'No preference', value: 'any' },
      ],
    },
    {
      question: 'How important are ratings?',
      options: [
        { label: 'Only the best (8+)', value: 'high' },
        { label: 'Well-regarded (6+)', value: 'medium' },
        { label: 'Hidden gems — ratings don\'t matter', value: 'low' },
      ],
    },
    {
      question: 'Any language preference?',
      options: [
        { label: 'English only', value: 'english' },
        { label: 'World cinema (non-English)', value: 'foreign' },
        { label: 'No preference', value: 'any' },
      ],
    },
    {
      question: 'Must it be free to watch?',
      options: [
        { label: 'Yes, free streaming only', value: 'free' },
        { label: 'No, show me everything', value: 'any' },
      ],
    },
  ];

  readonly step = signal(0);
  readonly answers = signal<Record<number, string>>({});
  readonly showResults = signal(false);
  readonly results = signal<MovieSummary[]>([]);
  readonly poolSize = signal(0);

  readonly bestMatchId = computed(() => {
    const scores = this.matchScores();
    if (scores.size < 2) return null;
    let bestId: string | null = null;
    let bestScore = 0;
    for (const [id, score] of scores) {
      if (score > bestScore) {
        bestScore = score;
        bestId = id;
      }
    }
    return bestScore > 50 ? bestId : null;
  });

  readonly resultDecadeRange = computed(() => {
    const films = this.results();
    if (films.length < 2) return null;
    const decades = new Set(films.map((m) => Math.floor(m.year / 10) * 10));
    if (decades.size < 2) return null;
    const sorted = [...decades].sort((a, b) => a - b);
    return `${sorted[0]}s–${sorted[sorted.length - 1]}s`;
  });

  readonly resultAvgRating = computed(() => {
    const films = this.results();
    const rated = films.filter((m) => m.voteAverage > 0);
    if (rated.length === 0) return null;
    return (rated.reduce((s, m) => s + m.voteAverage, 0) / rated.length).toFixed(1);
  });

  readonly resultStreamableCount = computed(() =>
    this.results().filter((m) => m.isStreamable).length
  );

  readonly resultUniqueDirectors = computed(() => {
    const dirs = new Set<string>();
    for (const m of this.results()) {
      for (const d of m.directors) dirs.add(d);
    }
    return dirs.size;
  });

  readonly resultGenreCount = computed(() => {
    const films = this.results();
    if (films.length < 2) return null;
    const genres = new Set<string>();
    for (const m of films) for (const g of m.genres) genres.add(g);
    return genres.size > 2 ? genres.size : null;
  });

  readonly resultLanguageCount = computed(() => {
    const films = this.results();
    if (films.length < 2) return null;
    const langs = new Set(films.map((m) => m.language).filter(Boolean));
    return langs.size > 1 ? langs.size : null;
  });

  readonly resultAvgYear = computed(() => {
    const films = this.results();
    if (films.length < 2) return null;
    return Math.round(films.reduce((s, m) => s + m.year, 0) / films.length);
  });

  readonly resultHighestRated = computed(() => {
    const films = this.results();
    if (films.length < 2) return null;
    const rated = films.filter((m) => m.voteAverage > 0);
    if (rated.length === 0) return null;
    const best = rated.reduce((a, b) => b.voteAverage > a.voteAverage ? b : a);
    const title = best.title.length > 25 ? best.title.slice(0, 23) + '...' : best.title;
    return `${title} (${best.voteAverage.toFixed(1)})`;
  });

  readonly resultAvgFilmAge = computed(() => {
    const films = this.results();
    if (films.length < 2) return null;
    const now = new Date().getFullYear();
    return Math.round(films.reduce((s, m) => s + (now - m.year), 0) / films.length);
  });

  readonly resultCoDirectedCount = computed(() => {
    const films = this.results();
    if (films.length < 3) return null;
    const count = films.filter((m) => m.directors.length > 1).length;
    return count > 0 ? count : null;
  });

  readonly resultNonEnglishCount = computed(() => {
    const films = this.results();
    if (films.length < 3) return null;
    const count = films.filter((m) => m.language && m.language !== 'English' && m.language !== 'en').length;
    return count > 0 ? count : null;
  });

  readonly resultSilentEraCount = computed(() => {
    const films = this.results();
    if (films.length < 3) return null;
    const count = films.filter((m) => m.year < 1930).length;
    return count > 0 ? count : null;
  });

  readonly resultStreamablePct = computed(() => {
    const films = this.results();
    if (films.length < 3) return null;
    const pct = Math.round((films.filter((m) => m.isStreamable).length / films.length) * 100);
    return pct > 0 ? pct : null;
  });

  readonly resultMedianYear = computed(() => {
    const films = this.results();
    if (films.length < 3) return null;
    const years = films.map((m) => m.year).sort((a, b) => a - b);
    const mid = Math.floor(years.length / 2);
    return years.length % 2 === 0 ? Math.round((years[mid - 1] + years[mid]) / 2) : years[mid];
  });

  readonly resultHighlyRatedCount = computed(() => {
    const films = this.results();
    if (films.length < 3) return null;
    const count = films.filter((m) => m.voteAverage >= 8.0).length;
    return count > 0 ? count : null;
  });

  readonly resultAvgTitleLength = computed(() => {
    const films = this.results();
    if (films.length < 3) return null;
    return Math.round(films.reduce((s, m) => s + m.title.length, 0) / films.length);
  });

  readonly resultCoDirectedPct = computed(() => {
    const films = this.results();
    if (films.length < 3) return null;
    const count = films.filter((m) => m.directors.length > 1).length;
    const pct = Math.round((count / films.length) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });

  readonly resultOldestYear = computed(() => {
    const films = this.results();
    if (films.length < 2) return null;
    const oldest = Math.min(...films.map((m) => m.year));
    const newest = Math.max(...films.map((m) => m.year));
    return newest - oldest >= 5 ? oldest : null;
  });

  readonly resultLongestTitle = computed(() => {
    const films = this.results();
    if (films.length < 3) return null;
    const longest = films.reduce((a, b) => a.title.length >= b.title.length ? a : b);
    return longest.title.length >= 20 ? longest.title : null;
  });

  readonly resultShortestTitle = computed(() => {
    const films = this.results();
    if (films.length < 3) return null;
    const shortest = films.reduce((a, b) => a.title.length <= b.title.length ? a : b);
    return shortest.title.length <= 10 ? shortest.title : null;
  });

  readonly resultTopDirector = computed(() => {
    const films = this.results();
    if (films.length < 3) return null;
    const counts = new Map<string, number>();
    for (const m of films) {
      for (const d of m.directors) counts.set(d, (counts.get(d) ?? 0) + 1);
    }
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    return top && top[1] >= 2 ? top[0] : null;
  });

  readonly resultSilentEraPct = computed(() => {
    const films = this.results();
    if (films.length < 3) return null;
    const silent = films.filter((m) => m.year < 1930).length;
    const pct = Math.round((silent / films.length) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });

  readonly resultAvgGenreCount = computed(() => {
    const films = this.results();
    if (films.length < 3) return null;
    const avg = films.reduce((s, m) => s + m.genres.length, 0) / films.length;
    return avg >= 1.5 ? avg.toFixed(1) : null;
  });

  readonly resultPosterCoveragePct = computed(() => {
    const films = this.results();
    if (films.length < 3) return null;
    const pct = Math.round((films.filter((m) => m.posterUrl).length / films.length) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });

  readonly resultImdbLinkedPct = computed(() => {
    const films = this.results();
    if (films.length < 3) return null;
    const pct = Math.round((films.filter((m) => m.imdbId).length / films.length) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });

  readonly resultYtStreamablePct = computed(() => {
    const films = this.results();
    if (films.length < 3) return null;
    const pct = Math.round((films.filter((m) => m.youtubeId).length / films.length) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });

  readonly resultAvgDirectorCount = computed(() => {
    const films = this.results();
    if (films.length < 3) return null;
    const avg = films.reduce((s, m) => s + m.directors.length, 0) / films.length;
    return avg >= 1.1 ? avg.toFixed(1) : null;
  });

  readonly resultUniqueDirectorCount = computed(() => {
    const films = this.results();
    if (films.length < 3) return null;
    const dirs = new Set<string>();
    for (const m of films) for (const d of m.directors) dirs.add(d);
    return dirs.size >= 3 ? dirs.size : null;
  });

  readonly resultPreWarPct = computed(() => {
    const films = this.results();
    if (films.length < 3) return null;
    const preWar = films.filter((m) => m.year < 1940).length;
    const pct = Math.round((preWar / films.length) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });

  readonly resultNonEnglishPct = computed(() => {
    const films = this.results();
    if (films.length < 3) return null;
    const nonEng = films.filter((m) => m.language && m.language !== 'English' && m.language !== 'en').length;
    const pct = Math.round((nonEng / films.length) * 100);
    return pct > 0 && pct < 100 ? pct : null;
  });

  readonly resultMedianRating = computed(() => {
    const rated = this.results().filter((m) => m.voteAverage > 0);
    if (rated.length < 3) return null;
    const sorted = rated.map((m) => m.voteAverage).sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    return median.toFixed(1);
  });

  readonly resultOldestTitle = computed(() => {
    const films = this.results();
    if (films.length < 2) return null;
    const oldest = films.reduce((a, b) => a.year <= b.year ? a : b);
    return oldest.title;
  });

  readonly resultNewestTitle = computed(() => {
    const films = this.results();
    if (films.length < 2) return null;
    const newest = films.reduce((a, b) => a.year >= b.year ? a : b);
    return newest.title;
  });

  readonly resultIaStreamableCount = computed(() => {
    const films = this.results();
    if (films.length < 3) return null;
    const count = films.filter((m) => m.internetArchiveId).length;
    return count > 0 ? count : null;
  });

  readonly avgMatchScore = computed(() => {
    const scores = this.matchScores();
    if (scores.size === 0) return 0;
    const total = [...scores.values()].reduce((s, v) => s + v, 0);
    return Math.round(total / scores.size);
  });

  readonly currentStep = computed(() => this.steps[this.step()]);
  readonly progressPct = computed(() => ((this.step() + 1) / this.steps.length) * 100);

  readonly selectedPrefs = computed(() => {
    const a = this.answers();
    const labels: string[] = [];
    for (let i = 0; i < this.steps.length; i++) {
      const val = a[i];
      if (val && val !== 'any') {
        const opt = this.steps[i].options.find((o) => o.value === val);
        if (opt) labels.push(opt.label);
      }
    }
    return labels;
  });

  readonly matchScores = computed(() => {
    const a = this.answers();
    const films = this.results();
    const map = new Map<string, number>();
    const totalCriteria = Object.values(a).filter((v) => v !== 'any').length;
    if (totalCriteria === 0) return map;
    for (const m of films) {
      let matched = 0;
      const era = a[0];
      if (era === 'silent' && m.year < 1930) matched++;
      else if (era === 'golden' && m.year >= 1930 && m.year < 1950) matched++;
      else if (era === 'postwar' && m.year >= 1950) matched++;
      else if (era === 'any') { /* no criteria */ }
      const genre = a[1];
      if (genre && genre !== 'any' && m.genres.some((g) => g.toLowerCase().includes(genre.toLowerCase()))) matched++;
      const mood = a[2];
      if (mood === 'light' && m.genres.some((g) => ['Comedy', 'Musical', 'Romance', 'Animation'].includes(g))) matched++;
      else if (mood === 'dark' && m.genres.some((g) => ['Horror', 'Thriller', 'Crime', 'War', 'Mystery'].includes(g))) matched++;
      else if (mood === 'deep' && m.genres.some((g) => ['Drama', 'History', 'Documentary'].includes(g))) matched++;
      const rating = a[3];
      if (rating === 'high' && m.voteAverage >= 8) matched++;
      else if (rating === 'medium' && m.voteAverage >= 6) matched++;
      const lang = a[4];
      if (lang === 'english' && (!m.language || m.language === 'English')) matched++;
      else if (lang === 'foreign' && m.language && m.language !== 'English') matched++;
      const streamable = a[5];
      if (streamable === 'free' && m.isStreamable) matched++;
      const pct = Math.round((matched / totalCriteria) * 100);
      map.set(m.id, Math.min(pct, 100));
    }
    return map;
  });

  readonly matchReasons = computed(() => {
    const a = this.answers();
    const films = this.results();
    const map = new Map<string, string[]>();
    for (const m of films) {
      const tags: string[] = [];
      const era = a[0];
      if (era === 'silent' && m.year < 1930) tags.push('Silent era');
      else if (era === 'golden' && m.year >= 1930 && m.year < 1950) tags.push('Golden age');
      else if (era === 'postwar' && m.year >= 1950) tags.push('Post-war');
      const genre = a[1];
      if (genre && genre !== 'any') {
        const matched = m.genres.find((g) => g.toLowerCase().includes(genre.toLowerCase()));
        if (matched) tags.push(matched);
      }
      if (m.voteAverage >= 8) tags.push('Highly rated');
      else if (m.voteAverage >= 7) tags.push('Well rated');
      if (m.language && m.language !== 'English') tags.push(m.language);
      if (m.isStreamable) tags.push('Free');
      map.set(m.id, tags.slice(0, 3));
    }
    return map;
  });

  ngOnInit(): void {
    this.catalog.load();
  }

  selectAnswer(value: string): void {
    this.answers.update((a) => ({ ...a, [this.step()]: value }));
    if (this.step() < this.steps.length - 1) {
      this.step.update((s) => s + 1);
    } else {
      this.computeResults();
    }
  }

  shuffle(): void {
    this.computeResults();
  }

  addAllToWatchlist(): void {
    const films = this.results();
    let added = 0;
    for (const m of films) {
      if (!this.collection.isInWatchlist(m.id) && !this.collection.isWatched(m.id)) {
        this.collection.addToWatchlist(m.id);
        added++;
      }
    }
    if (added > 0) {
      this.notifications.show(`Added ${added} film${added > 1 ? 's' : ''} to watchlist`, 'success');
    } else {
      this.notifications.show('All films already in your collection', 'info');
    }
  }

  shareResults(): void {
    const films = this.results();
    if (films.length === 0) return;
    const titles = films.map((m) => `${m.title} (${m.year})`).join('\n');
    const text = `My BW Cinema quiz picks:\n\n${titles}\n\nTake the quiz: ${window.location.origin}/quiz`;
    navigator.clipboard.writeText(text).then(() => {
      this.notifications.show('Results copied to clipboard', 'success');
    }).catch(() => {
      this.notifications.show('Failed to copy', 'error');
    });
  }

  restart(): void {
    this.step.set(0);
    this.answers.set({});
    this.showResults.set(false);
    this.results.set([]);
  }

  private computeResults(): void {
    const a = this.answers();
    let films = this.catalog.movies().filter((m) => m.isStreamable);

    // Era filter
    const era = a[0];
    if (era === 'silent') films = films.filter((m) => m.year < 1930);
    else if (era === 'golden') films = films.filter((m) => m.year >= 1930 && m.year < 1950);
    else if (era === 'postwar') films = films.filter((m) => m.year >= 1950);

    // Genre filter
    const genre = a[1];
    if (genre && genre !== 'any') {
      films = films.filter((m) => m.genres.some((g) => g.toLowerCase().includes(genre.toLowerCase())));
    }

    // Mood filter (genres are Wikidata-style, e.g. "comedy film", "drama film")
    const mood = a[2];
    if (mood === 'light') {
      const lightTerms = ['comedy', 'musical', 'romance', 'animation'];
      films = films.filter((m) => m.genres.some((g) => lightTerms.some((t) => g.toLowerCase().includes(t))));
    } else if (mood === 'dark') {
      const darkTerms = ['horror', 'thriller', 'crime', 'war', 'mystery', 'noir'];
      films = films.filter((m) => m.genres.some((g) => darkTerms.some((t) => g.toLowerCase().includes(t))));
    } else if (mood === 'deep') {
      const deepTerms = ['drama', 'history', 'documentary'];
      films = films.filter((m) => m.genres.some((g) => deepTerms.some((t) => g.toLowerCase().includes(t))));
    }

    // Rating filter
    const rating = a[3];
    if (rating === 'high') films = films.filter((m) => m.voteAverage >= 8);
    else if (rating === 'medium') films = films.filter((m) => m.voteAverage >= 6);

    // Language filter
    const lang = a[4];
    if (lang === 'english') films = films.filter((m) => !m.language || m.language === 'English');
    else if (lang === 'foreign') films = films.filter((m) => m.language && m.language !== 'English');

    // Streamable filter
    const streamable = a[5];
    if (streamable === 'free') films = films.filter((m) => m.isStreamable);

    this.poolSize.set(films.length);

    // Shuffle and pick 5
    for (let i = films.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [films[i], films[j]] = [films[j], films[i]];
    }

    this.results.set(films.slice(0, 5));
    this.showResults.set(true);
  }
}
