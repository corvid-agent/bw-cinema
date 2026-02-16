import { TestBed } from '@angular/core/testing';
import { AccessibilityService } from './accessibility.service';

describe('AccessibilityService', () => {
  let service: AccessibilityService;

  beforeEach(() => {
    try { localStorage.removeItem('bw-cinema-a11y'); } catch { /* noop */ }
    document.documentElement.removeAttribute('style');
    document.documentElement.className = '';
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccessibilityService);
  });

  it('should start with default preferences', () => {
    const prefs = service.prefs();
    expect(prefs.fontSize).toBe('default');
    expect(prefs.highContrast).toBe(false);
    expect(prefs.reducedMotion).toBe(false);
    expect(prefs.wideSpacing).toBe(false);
  });

  it('should increase font size', () => {
    service.init();
    service.increaseFontSize();
    expect(service.prefs().fontSize).toBe('large');
    expect(service.getFontSizeLabel()).toBe('Large');
    expect(document.documentElement.style.getPropertyValue('--font-size-base')).toBe('20px');
  });

  it('should decrease font size', () => {
    service.increaseFontSize();
    service.increaseFontSize();
    service.decreaseFontSize();
    expect(service.prefs().fontSize).toBe('large');
  });

  it('should not increase past xx-large', () => {
    service.increaseFontSize(); // large
    service.increaseFontSize(); // x-large
    service.increaseFontSize(); // xx-large
    service.increaseFontSize(); // should stay xx-large
    expect(service.prefs().fontSize).toBe('xx-large');
    expect(service.canIncrease()).toBe(false);
  });

  it('should not decrease past default', () => {
    service.decreaseFontSize();
    expect(service.prefs().fontSize).toBe('default');
    expect(service.canDecrease()).toBe(false);
  });

  it('should toggle high contrast', () => {
    service.init();
    service.toggleHighContrast();
    expect(service.prefs().highContrast).toBe(true);
    expect(document.documentElement.classList.contains('high-contrast')).toBe(true);

    service.toggleHighContrast();
    expect(service.prefs().highContrast).toBe(false);
    expect(document.documentElement.classList.contains('high-contrast')).toBe(false);
  });

  it('should toggle reduced motion', () => {
    service.init();
    service.toggleReducedMotion();
    expect(service.prefs().reducedMotion).toBe(true);
    expect(document.documentElement.classList.contains('reduced-motion')).toBe(true);
  });

  it('should toggle wide spacing', () => {
    service.init();
    service.toggleWideSpacing();
    expect(service.prefs().wideSpacing).toBe(true);
    expect(document.documentElement.classList.contains('wide-spacing')).toBe(true);
  });

  it('should apply preferences on init', () => {
    service.increaseFontSize();
    service.toggleHighContrast();
    service.init();

    expect(document.documentElement.style.getPropertyValue('--font-size-base')).toBe('20px');
    expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
  });

  it('should reset all preferences', () => {
    service.increaseFontSize();
    service.toggleHighContrast();
    service.toggleReducedMotion();
    service.toggleWideSpacing();
    service.resetAll();

    expect(service.prefs().fontSize).toBe('default');
    expect(service.prefs().highContrast).toBe(false);
    expect(service.prefs().reducedMotion).toBe(false);
    expect(service.prefs().wideSpacing).toBe(false);
  });
});
