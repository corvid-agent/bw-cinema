import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  let fixture: ComponentFixture<NotFoundComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should render 404 code', () => {
    const code = el.querySelector('.not-found__code');
    expect(code?.textContent).toContain('404');
  });

  it('should render "Page Not Found" title', () => {
    const title = el.querySelector('.not-found__title');
    expect(title?.textContent).toContain('Page Not Found');
  });

  it('should render description text', () => {
    const text = el.querySelector('.not-found__text');
    expect(text?.textContent).toContain("doesn't exist");
  });

  it('should have a link back to home', () => {
    const link = el.querySelector('.not-found__cta') as HTMLAnchorElement;
    expect(link).toBeTruthy();
    expect(link.textContent).toContain('Back to Home');
    expect(link.getAttribute('href')).toBe('/home');
  });
});
