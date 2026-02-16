import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component } from '@angular/core';
import { LazyImageDirective } from './lazy-image.directive';

@Component({
  selector: 'app-test-host',
  imports: [LazyImageDirective],
  template: `<img appLazyImage src="https://example.com/poster.jpg" alt="Test" />`,
})
class TestHostComponent {}

describe('LazyImageDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should set opacity to 0 initially', () => {
    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(img.style.opacity).toBe('0');
  });

  it('should set transition on image', () => {
    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(img.style.transition).toContain('opacity');
  });

  it('should set opacity to 1 on load event', () => {
    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    img.dispatchEvent(new Event('load'));
    expect(img.style.opacity).toBe('1');
  });

  it('should set opacity to 1 on error event', () => {
    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    img.dispatchEvent(new Event('error'));
    expect(img.style.opacity).toBe('1');
  });
});
