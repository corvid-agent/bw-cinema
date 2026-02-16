import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-toast-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toasts" aria-live="polite">
      @for (toast of notifications.toasts(); track toast.id) {
        <div class="toast" [class]="'toast--' + toast.type" role="alert">
          <span>{{ toast.message }}</span>
          <button class="toast__close" (click)="notifications.dismiss(toast.id)" aria-label="Dismiss">&times;</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toasts {
      position: fixed;
      bottom: var(--space-lg);
      right: var(--space-lg);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      max-width: 360px;
    }
    .toast {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-md);
      padding: var(--space-md);
      border-radius: var(--radius);
      font-size: 0.95rem;
      animation: slideIn 0.3s ease;
    }
    .toast--info { background-color: var(--bg-raised); border: 1px solid var(--color-info); color: var(--text-primary); }
    .toast--success { background-color: var(--bg-raised); border: 1px solid var(--color-success); color: var(--text-primary); }
    .toast--error { background-color: var(--bg-raised); border: 1px solid var(--color-error); color: var(--text-primary); }
    .toast__close {
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 1.3rem;
      cursor: pointer;
      padding: 0;
      min-height: 32px;
      min-width: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `],
})
export class ToastContainerComponent {
  protected readonly notifications = inject(NotificationService);
}
