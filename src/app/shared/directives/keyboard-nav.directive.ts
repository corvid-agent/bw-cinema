import { Directive, ElementRef, HostListener, inject } from '@angular/core';

@Directive({ selector: '[appKeyboardNav]', standalone: true })
export class KeyboardNavDirective {
  private readonly el = inject(ElementRef<HTMLElement>);

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    const nativeEl = this.el.nativeElement as HTMLElement;
    const focusable = Array.from(
      nativeEl.querySelectorAll('a, button, [tabindex="0"]')
    ) as HTMLElement[];
    const current = document.activeElement as HTMLElement;
    const index = focusable.indexOf(current);
    if (index === -1) return;

    let next: number | null = null;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = (index + 1) % focusable.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = (index - 1 + focusable.length) % focusable.length;
        break;
      default:
        return;
    }

    event.preventDefault();
    focusable[next].focus();
  }
}
