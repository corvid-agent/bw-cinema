import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CollectionService } from './collection.service';

describe('CollectionService', () => {
  let service: CollectionService;
  let mockStore: Record<string, string>;

  beforeEach(() => {
    mockStore = {};
    const mockStorage: Storage = {
      length: 0,
      clear: () => { mockStore = {}; },
      getItem: (key: string) => mockStore[key] ?? null,
      setItem: (key: string, value: string) => { mockStore[key] = value; },
      removeItem: (key: string) => { delete mockStore[key]; },
      key: () => null,
    };
    Object.defineProperty(globalThis, 'localStorage', { value: mockStorage, writable: true, configurable: true });

    TestBed.configureTestingModule({});
    service = TestBed.inject(CollectionService);
    // Reset since constructor may have run loadFromStorage before our mock was set
    service['watchlist'].set([]);
    service['watched'].set([]);
  });

  it('should add to watchlist', () => {
    service.addToWatchlist('Q1');
    expect(service.watchlist().length).toBe(1);
    expect(service.isInWatchlist('Q1')).toBe(true);
  });

  it('should not duplicate watchlist entries', () => {
    service.addToWatchlist('Q1');
    service.addToWatchlist('Q1');
    expect(service.watchlist().length).toBe(1);
  });

  it('should remove from watchlist', () => {
    service.addToWatchlist('Q1');
    service.removeFromWatchlist('Q1');
    expect(service.watchlist().length).toBe(0);
    expect(service.isInWatchlist('Q1')).toBe(false);
  });

  it('should mark as watched', () => {
    service.markWatched('Q1', 4);
    expect(service.watched().length).toBe(1);
    expect(service.isWatched('Q1')).toBe(true);
    expect(service.watched()[0].userRating).toBe(4);
  });

  it('should remove from watchlist when marking watched', () => {
    service.addToWatchlist('Q1');
    service.markWatched('Q1');
    expect(service.isInWatchlist('Q1')).toBe(false);
    expect(service.isWatched('Q1')).toBe(true);
  });

  it('should remove watched', () => {
    service.markWatched('Q1');
    service.removeWatched('Q1');
    expect(service.watched().length).toBe(0);
  });

  it('should set rating', () => {
    service.markWatched('Q1');
    service.setRating('Q1', 5);
    expect(service.watched()[0].userRating).toBe(5);
  });

  it('should persist state on mutation', () => {
    service.addToWatchlist('Q1');

    const raw = mockStore['bw-cinema-collection'];
    expect(raw).toBeDefined();
    const stored = JSON.parse(raw);
    expect(stored.watchlist.length).toBe(1);
    expect(stored.watchlist[0].movieId).toBe('Q1');
  });

  it('should load from localStorage', () => {
    mockStore['bw-cinema-collection'] = JSON.stringify({
      watchlist: [{ movieId: 'Q10', addedAt: 1000 }],
      watched: [{ movieId: 'Q20', watchedAt: 2000, userRating: 5 }],
    });

    service['loadFromStorage']();
    expect(service.isInWatchlist('Q10')).toBe(true);
    expect(service.isWatched('Q20')).toBe(true);
  });

  it('should set and get notes', () => {
    service.markWatched('Q1');
    service.setNote('Q1', 'Great film!');
    expect(service.getNote('Q1')).toBe('Great film!');
  });

  it('should clear empty notes', () => {
    service.markWatched('Q1');
    service.setNote('Q1', 'A note');
    service.setNote('Q1', '   ');
    expect(service.getNote('Q1')).toBe('');
  });

  it('should return empty string for no notes', () => {
    expect(service.getNote('nonexistent')).toBe('');
  });

  it('should toggle favorites', () => {
    service.toggleFavorite('Q1');
    expect(service.isFavorite('Q1')).toBe(true);
    service.toggleFavorite('Q1');
    expect(service.isFavorite('Q1')).toBe(false);
  });

  it('should persist favorites', () => {
    service.toggleFavorite('Q1');
    const raw = mockStore['bw-cinema-collection'];
    const stored = JSON.parse(raw);
    expect(stored.favorites).toContain('Q1');
  });

  it('should track watch progress', () => {
    service.trackProgress('Q1');
    expect(service.watchProgress().length).toBe(1);
    expect(service.watchProgress()[0].movieId).toBe('Q1');
  });

  it('should update existing progress timestamp', () => {
    service.trackProgress('Q1');
    const first = service.watchProgress()[0].startedAt;
    service.trackProgress('Q1');
    expect(service.watchProgress().length).toBe(1);
    expect(service.watchProgress()[0].startedAt).toBeGreaterThanOrEqual(first);
  });

  it('should remove progress when marking watched', () => {
    service.trackProgress('Q1');
    service.markWatched('Q1');
    expect(service.watchProgress().length).toBe(0);
  });

  it('should include notes: null on markWatched', () => {
    service.markWatched('Q1');
    expect(service.watched()[0].notes).toBeNull();
  });

  it('should load legacy data without notes field', () => {
    mockStore['bw-cinema-collection'] = JSON.stringify({
      watchlist: [],
      watched: [{ movieId: 'Q1', watchedAt: 1000, userRating: 3 }],
    });
    service['loadFromStorage']();
    expect(service.watched()[0].notes).toBeNull();
  });
});
