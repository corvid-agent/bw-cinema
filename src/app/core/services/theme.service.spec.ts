import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
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

    document.documentElement.removeAttribute('data-theme');

    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  it('should default to dark theme', () => {
    expect(service.theme()).toBe('dark');
  });

  it('should toggle to sepia', () => {
    service.toggle();
    expect(service.theme()).toBe('sepia');
    expect(document.documentElement.getAttribute('data-theme')).toBe('sepia');
    expect(mockStore['bw-cinema-theme']).toBe('sepia');
  });

  it('should toggle to light after sepia', () => {
    service.toggle(); // dark → sepia
    service.toggle(); // sepia → light
    expect(service.theme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(mockStore['bw-cinema-theme']).toBe('light');
  });

  it('should toggle back to dark after light', () => {
    service.toggle(); // dark → sepia
    service.toggle(); // sepia → light
    service.toggle(); // light → dark
    expect(service.theme()).toBe('dark');
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    expect(mockStore['bw-cinema-theme']).toBe('dark');
  });

  it('should apply theme on init', () => {
    service.toggle(); // sepia
    service.init();
    expect(document.documentElement.getAttribute('data-theme')).toBe('sepia');
  });

  it('should load sepia from localStorage', () => {
    mockStore['bw-cinema-theme'] = 'sepia';
    const fresh = new ThemeService();
    expect(fresh.theme()).toBe('sepia');
  });
});
