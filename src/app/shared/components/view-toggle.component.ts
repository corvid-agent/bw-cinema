import { Component, ChangeDetectionStrategy, model } from '@angular/core';

export type ViewMode = 'grid' | 'list';

@Component({
  selector: 'app-view-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="view-toggle" role="radiogroup" aria-label="View mode">
      <button
        class="view-toggle__btn"
        [class.active]="mode() === 'grid'"
        (click)="mode.set('grid')"
        [attr.aria-pressed]="mode() === 'grid'"
        aria-label="Grid view"
        title="Grid view"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
      </button>
      <button
        class="view-toggle__btn"
        [class.active]="mode() === 'list'"
        (click)="mode.set('list')"
        [attr.aria-pressed]="mode() === 'list'"
        aria-label="List view"
        title="List view"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
      </button>
    </div>
  `,
  styles: [`
    .view-toggle {
      display: flex;
      gap: 2px;
      background-color: var(--bg-surface);
      border-radius: var(--radius);
      padding: 3px;
    }
    .view-toggle__btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 36px;
      min-width: 40px;
      min-height: 36px;
      padding: 0;
      border: none;
      background: none;
      color: var(--text-tertiary);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.2s;
    }
    .view-toggle__btn:hover { color: var(--text-primary); }
    .view-toggle__btn.active {
      color: var(--accent-gold);
      background-color: var(--bg-raised);
    }
  `],
})
export class ViewToggleComponent {
  readonly mode = model<ViewMode>('grid');
}
