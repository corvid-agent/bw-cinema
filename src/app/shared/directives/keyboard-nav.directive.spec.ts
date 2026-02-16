import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component } from '@angular/core';
import { KeyboardNavDirective } from './keyboard-nav.directive';

@Component({
  selector: 'app-test-host',
  imports: [KeyboardNavDirective],
  template: `
    <div appKeyboardNav>
      <div class="grid" role="list">
        <div><a href="#" id="item-0">Item 0</a></div>
        <div><a href="#" id="item-1">Item 1</a></div>
        <div><a href="#" id="item-2">Item 2</a></div>
        <div><a href="#" id="item-3">Item 3</a></div>
      </div>
    </div>
  `,
})
class TestHostComponent {}

describe('KeyboardNavDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should move focus on ArrowRight', () => {
    const el = fixture.nativeElement as HTMLElement;
    const items = el.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>;
    items[0].focus();

    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true });
    items[0].dispatchEvent(event);

    expect(document.activeElement).toBe(items[1]);
  });

  it('should move focus on ArrowLeft', () => {
    const el = fixture.nativeElement as HTMLElement;
    const items = el.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>;
    items[1].focus();

    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true });
    items[1].dispatchEvent(event);

    expect(document.activeElement).toBe(items[0]);
  });

  it('should not wrap past the beginning', () => {
    const el = fixture.nativeElement as HTMLElement;
    const items = el.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>;
    items[0].focus();

    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true });
    items[0].dispatchEvent(event);

    expect(document.activeElement).toBe(items[0]);
  });

  it('should jump to first on Home', () => {
    const el = fixture.nativeElement as HTMLElement;
    const items = el.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>;
    items[2].focus();

    const event = new KeyboardEvent('keydown', { key: 'Home', bubbles: true });
    items[2].dispatchEvent(event);

    expect(document.activeElement).toBe(items[0]);
  });

  it('should jump to last on End', () => {
    const el = fixture.nativeElement as HTMLElement;
    const items = el.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>;
    items[0].focus();

    const event = new KeyboardEvent('keydown', { key: 'End', bubbles: true });
    items[0].dispatchEvent(event);

    expect(document.activeElement).toBe(items[3]);
  });
});
