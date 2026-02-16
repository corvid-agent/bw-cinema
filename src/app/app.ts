import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header.component';
import { FooterComponent } from './shared/components/footer.component';
import { ToastContainerComponent } from './shared/components/toast-container.component';
import { BackToTopComponent } from './shared/components/back-to-top.component';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ToastContainerComponent, BackToTopComponent],
  template: `
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <app-header />
    <main id="main-content">
      <router-outlet />
    </main>
    <app-footer />
    <app-toast-container />
    <app-back-to-top />
  `,
  styles: [`
    main {
      min-height: calc(100vh - 60px - 100px);
    }
  `],
})
export class App {}
