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
});
