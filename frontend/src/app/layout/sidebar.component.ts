import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  badgeColor?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed">
      <!-- Logo area -->
      <div class="sidebar-logo">
        <div class="logo-icon">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <path d="M16 3L3 14h4v15h7v-9h4v9h7V14h4L16 3z" fill="#F39C12"/>
            <rect x="12" y="18" width="8" height="11" rx="1" fill="rgba(255,255,255,0.15)"/>
          </svg>
        </div>
        @if (!collapsed) {
          <div class="logo-text">
            <span class="logo-name">IMOBLEX</span>
            <span class="logo-subtitle">Back-Office CRM</span>
          </div>
        }
        <button class="collapse-btn" (click)="toggleCollapse.emit()">
          <i class="pi" [class.pi-chevron-left]="!collapsed" [class.pi-chevron-right]="collapsed"></i>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        @for (group of navGroups; track group.title) {
          <div class="nav-group">
            @if (!collapsed) {
              <span class="nav-group-title">{{ group.title }}</span>
            }
            @for (item of group.items; track item.route) {
              <a
                [routerLink]="item.route"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
                class="nav-item"
                [title]="collapsed ? item.label : ''"
              >
                <i class="pi {{ item.icon }} nav-icon"></i>
                @if (!collapsed) {
                  <span class="nav-label">{{ item.label }}</span>
                  @if (item.badge) {
                    <span class="nav-badge" [style.background]="item.badgeColor || '#F39C12'">
                      {{ item.badge }}
                    </span>
                  }
                } @else if (item.badge) {
                  <span class="nav-badge-dot" [style.background]="item.badgeColor || '#F39C12'"></span>
                }
              </a>
            }
          </div>
        }
      </nav>

      <!-- User profile at bottom -->
      <div class="sidebar-footer">
        <div class="user-card" [class.collapsed]="collapsed">
          <img
            [src]="(authService.currentUser$ | async)?.avatarUrl || 'https://ui-avatars.com/api/?name=User&background=1B4F72&color=fff'"
            alt="Avatar"
            class="user-avatar"
          />
          @if (!collapsed) {
            <div class="user-info">
              <span class="user-name">{{ (authService.currentUser$ | async)?.firstName }} {{ (authService.currentUser$ | async)?.lastName }}</span>
              <span class="user-role">{{ getRoleLabel((authService.currentUser$ | async)?.role) }}</span>
            </div>
            <button class="logout-btn" (click)="logout()" title="Déconnexion">
              <i class="pi pi-sign-out"></i>
            </button>
          }
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      min-width: 260px;
      background: #1B2744;
      display: flex;
      flex-direction: column;
      height: 100vh;
      box-shadow: 4px 0 20px rgba(0,0,0,0.15);
      transition: width 0.3s ease, min-width 0.3s ease;
      overflow: hidden;
      z-index: 40;
    }

    .sidebar.collapsed {
      width: 72px;
      min-width: 72px;
    }

    /* Logo */
    .sidebar-logo {
      display: flex;
      align-items: center;
      padding: 1.25rem 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.07);
      gap: 0.75rem;
      min-height: 72px;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      background: rgba(243,156,18,0.15);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .logo-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .logo-name {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 800;
      font-size: 1.05rem;
      color: #ffffff;
      letter-spacing: 0.08em;
      line-height: 1;
    }

    .logo-subtitle {
      font-size: 0.65rem;
      color: rgba(255,255,255,0.4);
      font-weight: 400;
      margin-top: 2px;
      letter-spacing: 0.03em;
    }

    .collapse-btn {
      width: 28px;
      height: 28px;
      border: 1px solid rgba(255,255,255,0.15);
      background: rgba(255,255,255,0.05);
      border-radius: 6px;
      color: rgba(255,255,255,0.5);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.2s;
      font-size: 0.7rem;
    }

    .collapse-btn:hover {
      background: rgba(255,255,255,0.12);
      color: #fff;
    }

    /* Navigation */
    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 0;
      scrollbar-width: none;
    }

    .sidebar-nav::-webkit-scrollbar { display: none; }

    .nav-group {
      margin-bottom: 0.5rem;
      padding: 0 0.75rem;
    }

    .nav-group-title {
      display: block;
      font-size: 0.65rem;
      font-weight: 600;
      color: rgba(255,255,255,0.3);
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 0.5rem 0.5rem 0.35rem;
      margin-bottom: 0.25rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 0.75rem;
      border-radius: 8px;
      color: rgba(255,255,255,0.6);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 2px;
      transition: all 0.15s ease;
      cursor: pointer;
      position: relative;
      white-space: nowrap;
      overflow: hidden;
    }

    .nav-item:hover {
      background: rgba(255,255,255,0.07);
      color: rgba(255,255,255,0.9);
    }

    .nav-item.active {
      background: linear-gradient(135deg, rgba(243,156,18,0.2), rgba(243,156,18,0.1));
      color: #ffffff;
      border-left: 3px solid #F39C12;
      padding-left: calc(0.75rem - 3px);
    }

    .nav-item.active .nav-icon {
      color: #F39C12;
    }

    .nav-icon {
      font-size: 1.05rem;
      width: 20px;
      text-align: center;
      flex-shrink: 0;
    }

    .nav-label {
      flex: 1;
    }

    .nav-badge {
      font-size: 0.65rem;
      font-weight: 700;
      color: #fff;
      padding: 1px 6px;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
    }

    .nav-badge-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      position: absolute;
      top: 6px;
      right: 6px;
    }

    /* Footer */
    .sidebar-footer {
      padding: 1rem 0.75rem;
      border-top: 1px solid rgba(255,255,255,0.07);
    }

    .user-card {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.625rem;
      border-radius: 10px;
      background: rgba(255,255,255,0.05);
    }

    .user-card.collapsed {
      justify-content: center;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(243,156,18,0.4);
      flex-shrink: 0;
    }

    .user-info {
      flex: 1;
      overflow: hidden;
    }

    .user-name {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      display: block;
      font-size: 0.68rem;
      color: rgba(255,255,255,0.4);
    }

    .logout-btn {
      background: none;
      border: none;
      color: rgba(255,255,255,0.4);
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: all 0.2s;
      font-size: 0.9rem;
    }

    .logout-btn:hover {
      color: #F39C12;
      background: rgba(243,156,18,0.1);
    }
  `]
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  readonly authService = inject(AuthService);

  navGroups: NavGroup[] = [
    {
      title: 'Principal',
      items: [
        { label: 'Tableau de bord', icon: 'pi-home', route: '/dashboard' },
        { label: 'Biens', icon: 'pi-building', route: '/properties', badge: 8 },
        { label: 'Mandats', icon: 'pi-file-edit', route: '/mandates', badge: 3, badgeColor: '#ef4444' },
        { label: 'Contacts', icon: 'pi-users', route: '/contacts' }
      ]
    },
    {
      title: 'Gestion',
      items: [
        { label: 'Transactions', icon: 'pi-chart-line', route: '/transactions' },
        { label: 'Agenda', icon: 'pi-calendar', route: '/agenda', badge: 2, badgeColor: '#3b82f6' },
        { label: 'Documents', icon: 'pi-folder', route: '/documents' }
      ]
    },
    {
      title: 'Analyse',
      items: [
        { label: 'Statistiques', icon: 'pi-chart-bar', route: '/reporting' },
        { label: 'Paramètres', icon: 'pi-cog', route: '/settings' }
      ]
    }
  ];

  getRoleLabel(role?: string): string {
    const labels: Record<string, string> = {
      ADMIN: 'Administrateur',
      MANAGER: 'Directeur d\'agence',
      AGENT: 'Négociateur',
      ASSISTANT: 'Assistant(e)'
    };
    return labels[role || ''] || role || '';
  }

  logout(): void {
    this.authService.logout();
  }
}
