import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from '../app';

describe('Accessibility audit', () => {
  let mockStore: Record<string, string>;

  beforeEach(async () => {
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

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  it('should have skip-to-content link', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const skipLink = fixture.nativeElement.querySelector('.skip-link');
    expect(skipLink).toBeTruthy();
    expect(skipLink.getAttribute('href')).toBe('#main-content');
  });

  it('should have main landmark with id', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const main = fixture.nativeElement.querySelector('main#main-content');
    expect(main).toBeTruthy();
  });

  it('should have navigation landmark in header', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const nav = fixture.nativeElement.querySelector('nav[role="navigation"]');
    expect(nav).toBeTruthy();
  });

  it('should have aria-label on all icon buttons', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    for (const btn of buttons) {
      const text = btn.textContent?.trim();
      const ariaLabel = btn.getAttribute('aria-label');
      const ariaLabelledBy = btn.getAttribute('aria-labelledby');
      const hasLabel = (text && text.length > 0) || ariaLabel || ariaLabelledBy;
      expect(hasLabel).toBeTruthy();
    }
  });

  it('onboarding dialog should have role and aria-label', () => {
    // Ensure onboarding is not dismissed
    mockStore['bw-cinema-onboarded'] = '';
    delete mockStore['bw-cinema-onboarded'];

    const fixture = TestBed.createComponent(App);
    fixture.componentInstance.showOnboarding = true;
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-label')).toBeTruthy();
  });

  it('should render theme toggle with aria-label', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const themeBtn = fixture.nativeElement.querySelector('[aria-label*="Switch to"]') ||
                     fixture.nativeElement.querySelector('[aria-label*="theme"]');
    expect(themeBtn).toBeTruthy();
  });

  it('should render accessibility button with aria-label', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const a11yBtn = fixture.nativeElement.querySelector('[aria-label="Accessibility settings"]');
    expect(a11yBtn).toBeTruthy();
  });
});
