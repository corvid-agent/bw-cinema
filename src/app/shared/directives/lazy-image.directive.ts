import { Directive, ElementRef, inject, OnInit } from '@angular/core';

@Directive({ selector: 'img[appLazyImage]', standalone: true })
export class LazyImageDirective implements OnInit {
  private readonly el = inject(ElementRef<HTMLImageElement>);

  ngOnInit(): void {
    this.el.nativeElement.loading = 'lazy';
  }
}
