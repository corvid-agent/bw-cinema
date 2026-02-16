import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { RecentlyViewedService } from './recently-viewed.service';

describe('RecentlyViewedService', () => {
  let service: RecentlyViewedService;
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
    service = TestBed.inject(RecentlyViewedService);
  });

  it('should add an item', () => {
    service.add('Q1');
    expect(service.ids()).toContain('Q1');
  });

  it('should move recently viewed to front', () => {
    service.add('Q1');
    service.add('Q2');
    service.add('Q1');
    expect(service.ids()[0]).toBe('Q1');
    expect(service.ids().length).toBe(2);
  });

  it('should limit to 12 items', () => {
    for (let i = 0; i < 15; i++) {
      service.add(`Q${i}`);
    }
    expect(service.ids().length).toBe(12);
  });

  it('should not duplicate entries', () => {
    service.add('Q1');
    service.add('Q1');
    expect(service.ids().length).toBe(1);
  });

  it('should persist to localStorage', () => {
    service.add('Q1');
    const raw = mockStore['bw-cinema-recent'];
    expect(raw).toBeDefined();
    expect(JSON.parse(raw)).toContain('Q1');
  });
});
