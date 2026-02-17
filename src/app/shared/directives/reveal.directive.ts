import { Directive, ElementRef, inject, OnInit, OnDestroy, Renderer2 } from '@angular/core';

@Directive({ selector: '[appReveal]', standalone: true })
export class RevealDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private observer: IntersectionObserver | null = null;

  ngOnInit(): void {
    const host = this.el.nativeElement;

    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return; // Respect reduced-motion preference
    }

    this.renderer.setStyle(host, 'opacity', '0');
    this.renderer.setStyle(host, 'transform', 'translateY(24px)');
    this.renderer.setStyle(host, 'transition', 'opacity 0.5s ease, transform 0.5s ease');

    if (typeof IntersectionObserver === 'undefined') {
      this.reveal(host);
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.reveal(entry.target as HTMLElement);
            this.observer?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    this.observer.observe(host);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private reveal(el: HTMLElement): void {
    this.renderer.setStyle(el, 'opacity', '1');
    this.renderer.setStyle(el, 'transform', 'translateY(0)');
  }
}
