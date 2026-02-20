import { Component, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit, signal, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-scroll-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="scroll-row" #scrollContainer (scroll)="updateArrows()">
      <ng-content />
    </div>
    @if (canScrollLeft()) {
      <button class="scroll-arrow scroll-arrow--left" (click)="scroll(-1)" aria-label="Scroll left">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
    }
    @if (canScrollRight()) {
      <button class="scroll-arrow scroll-arrow--right" (click)="scroll(1)" aria-label="Scroll right">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    }
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
      overflow: hidden;
    }
    .scroll-row {
      display: flex;
      gap: var(--scroll-row-gap, var(--space-md));
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scroll-behavior: smooth;
      padding-bottom: var(--space-sm);
      -webkit-overflow-scrolling: touch;
    }
    .scroll-row::-webkit-scrollbar { height: 6px; }
    .scroll-row::-webkit-scrollbar-track { background: var(--bg-raised); border-radius: 3px; }
    .scroll-row::-webkit-scrollbar-thumb { background: var(--border-bright); border-radius: 3px; }
    .scroll-arrow {
      position: absolute;
      top: calc(50% - 22px);
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--bg-surface);
      border: 1px solid var(--border-bright);
      color: var(--text-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: var(--shadow-md);
      z-index: 5;
      opacity: 0;
      transition: opacity 0.2s, border-color 0.2s, color 0.2s;
    }
    .scroll-arrow--left { left: -6px; }
    .scroll-arrow--right { right: -6px; }
    :host:hover .scroll-arrow { opacity: 1; }
    .scroll-arrow:hover {
      border-color: var(--accent-gold);
      color: var(--accent-gold);
      background: var(--accent-gold-dim);
    }
    @media (hover: none) {
      .scroll-arrow { display: none; }
    }
    @media (max-width: 768px) {
      .scroll-row::-webkit-scrollbar { height: 3px; }
      .scroll-row { padding-bottom: var(--space-xs); }
    }
  `],
})
export class ScrollRowComponent implements AfterViewInit, OnDestroy {
  @ViewChild('scrollContainer') private readonly containerRef!: ElementRef<HTMLElement>;

  readonly canScrollLeft = signal(false);
  readonly canScrollRight = signal(false);

  private resizeObserver: ResizeObserver | null = null;

  ngAfterViewInit(): void {
    this.updateArrows();
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.updateArrows());
      this.resizeObserver.observe(this.containerRef.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  updateArrows(): void {
    const el = this.containerRef.nativeElement;
    this.canScrollLeft.set(el.scrollLeft > 10);
    this.canScrollRight.set(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }

  scroll(direction: number): void {
    const el = this.containerRef.nativeElement;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' });
    setTimeout(() => this.updateArrows(), 400);
  }
}
