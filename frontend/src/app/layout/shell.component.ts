import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar.component';
import { TopbarComponent } from './topbar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="shell-wrapper" [class.sidebar-collapsed]="sidebarCollapsed()">
      <!-- Sidebar -->
      <app-sidebar
        [collapsed]="sidebarCollapsed()"
        (toggleCollapse)="toggleSidebar()"
      ></app-sidebar>

      <!-- Main content area -->
      <div class="main-area">
        <!-- Topbar -->
        <app-topbar
          (toggleSidebar)="toggleSidebar()"
        ></app-topbar>

        <!-- Page content -->
        <main class="page-content">
          <div class="content-wrapper animate-fade-in">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>

      <!-- Mobile overlay -->
      @if (!sidebarCollapsed()) {
        <div
          class="mobile-overlay lg:hidden"
          (click)="toggleSidebar()"
        ></div>
      }
    </div>
  `,
  styles: [`
    .shell-wrapper {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: #f1f5f9;
    }

    .main-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: margin-left 0.3s ease;
    }

    .page-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .content-wrapper {
      padding: 1.5rem;
      min-height: calc(100vh - 64px);
    }

    .mobile-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 30;
    }

    @media (max-width: 1024px) {
      .main-area {
        margin-left: 0 !important;
      }
    }
  `]
})
export class ShellComponent {
  sidebarCollapsed = signal(false);

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }
}
