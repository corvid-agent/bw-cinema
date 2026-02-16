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
    const cols = this.getGridColumns(nativeEl);

    switch (event.key) {
      case 'ArrowRight':
        next = index + 1 < focusable.length ? index + 1 : index;
        break;
      case 'ArrowLeft':
        next = index - 1 >= 0 ? index - 1 : index;
        break;
      case 'ArrowDown':
        next = index + cols < focusable.length ? index + cols : index;
        break;
      case 'ArrowUp':
        next = index - cols >= 0 ? index - cols : index;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = focusable.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    focusable[next].focus();
  }

  /** Detect the number of columns in the grid by comparing item positions. */
  private getGridColumns(container: HTMLElement): number {
    const grid = container.querySelector('.grid, [role="list"]') as HTMLElement | null;
    if (!grid) return 1;
    const items = Array.from(grid.children) as HTMLElement[];
    if (items.length < 2) return 1;

    const firstTop = items[0].getBoundingClientRect().top;
    for (let i = 1; i < items.length; i++) {
      if (items[i].getBoundingClientRect().top !== firstTop) return i;
    }
    return items.length;
  }
}
