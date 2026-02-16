import { Directive, ElementRef, inject, OnInit, OnDestroy, Renderer2 } from '@angular/core';

@Directive({ selector: 'img[appLazyImage]', standalone: true })
export class LazyImageDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLImageElement>);
  private readonly renderer = inject(Renderer2);
  private observer: IntersectionObserver | null = null;

  ngOnInit(): void {
    const img = this.el.nativeElement;

    // Start transparent, fade in on load
    this.renderer.setStyle(img, 'opacity', '0');
    this.renderer.setStyle(img, 'transition', 'opacity 0.3s ease');

    // Use IntersectionObserver to defer src loading
    const src = img.getAttribute('src');
    if (src && 'IntersectionObserver' in window) {
      img.setAttribute('data-src', src);
      img.removeAttribute('src');

      this.observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              const target = entry.target as HTMLImageElement;
              const lazySrc = target.getAttribute('data-src');
              if (lazySrc) {
                target.src = lazySrc;
                target.removeAttribute('data-src');
              }
              this.observer?.unobserve(target);
            }
          }
        },
        { rootMargin: '200px 0px' } // Start loading 200px before visible
      );

      this.observer.observe(img);
    }

    // Fade in once loaded
    img.addEventListener('load', this.onLoad);
    img.addEventListener('error', this.onLoad);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    const img = this.el.nativeElement;
    img.removeEventListener('load', this.onLoad);
    img.removeEventListener('error', this.onLoad);
  }

  private onLoad = (): void => {
    this.renderer.setStyle(this.el.nativeElement, 'opacity', '1');
  };
}
