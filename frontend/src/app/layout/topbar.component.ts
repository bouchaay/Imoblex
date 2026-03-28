import { Component, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';

interface Notification {
  id: string;
  type: 'mandate' | 'contact' | 'transaction' | 'appointment';
  title: string;
  message: string;
  time: Date;
  read: boolean;
  icon: string;
  iconColor: string;
}

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <header class="topbar">
      <!-- Left side -->
      <div class="topbar-left">
        <button class="menu-btn" (click)="toggleSidebar.emit()">
          <i class="pi pi-bars"></i>
        </button>

        <!-- Breadcrumb / page title placeholder -->
        <div class="topbar-search">
          <i class="pi pi-search search-icon"></i>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (keyup.enter)="onSearch()"
            placeholder="Rechercher biens, contacts, mandats..."
            class="search-input"
          />
          @if (searchQuery) {
            <button class="clear-search" (click)="searchQuery = ''">
              <i class="pi pi-times"></i>
            </button>
          }
          <span class="search-shortcut">⌘K</span>
        </div>
      </div>

      <!-- Right side -->
      <div class="topbar-right">

        <!-- Quick action button -->
        <div class="quick-actions">
          <button class="action-btn primary-btn" (click)="showActionMenu = !showActionMenu">
            <i class="pi pi-plus"></i>
            <span>Nouveau</span>
            <i class="pi pi-chevron-down" style="font-size:0.65rem"></i>
          </button>

          @if (showActionMenu) {
            <div class="dropdown-menu action-dropdown">
              <a routerLink="/properties/new" class="dropdown-item" (click)="showActionMenu = false">
                <i class="pi pi-building"></i> Nouveau bien
              </a>
              <a routerLink="/mandates/new" class="dropdown-item" (click)="showActionMenu = false">
                <i class="pi pi-file-edit"></i> Nouveau mandat
              </a>
              <a routerLink="/contacts/new" class="dropdown-item" (click)="showActionMenu = false">
                <i class="pi pi-user-plus"></i> Nouveau contact
              </a>
            </div>
          }
        </div>

        <!-- Notifications -->
        <div class="notif-wrapper">
          <button class="icon-btn" (click)="showNotifications = !showNotifications">
            <i class="pi pi-bell"></i>
            @if (unreadCount > 0) {
              <span class="notif-badge">{{ unreadCount }}</span>
            }
          </button>

          @if (showNotifications) {
            <div class="dropdown-menu notif-dropdown">
              <div class="dropdown-header">
                <span>Notifications</span>
                <button class="mark-all-btn" (click)="markAllRead()">Tout lire</button>
              </div>
              <div class="notif-list">
                @for (notif of notifications; track notif.id) {
                  <div class="notif-item" [class.unread]="!notif.read" (click)="readNotification(notif)">
                    <div class="notif-icon-wrap" [style.background]="notif.iconColor + '20'">
                      <i class="pi {{ notif.icon }}" [style.color]="notif.iconColor"></i>
                    </div>
                    <div class="notif-content">
                      <div class="notif-title">{{ notif.title }}</div>
                      <div class="notif-msg">{{ notif.message }}</div>
                      <div class="notif-time">{{ getTimeAgo(notif.time) }}</div>
                    </div>
                    @if (!notif.read) {
                      <div class="notif-dot"></div>
                    }
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <!-- User menu -->
        <div class="user-menu-wrapper">
          <button class="user-menu-btn" (click)="showUserMenu = !showUserMenu">
            <img
              [src]="(authService.currentUser$ | async)?.avatarUrl"
              alt="Avatar"
              class="topbar-avatar"
            />
            <div class="user-info-topbar">
              <span class="user-name-topbar">{{ (authService.currentUser$ | async)?.firstName }}</span>
            </div>
            <i class="pi pi-chevron-down" style="font-size:0.65rem; color:#94a3b8"></i>
          </button>

          @if (showUserMenu) {
            <div class="dropdown-menu user-dropdown">
              <div class="user-dropdown-header">
                <img [src]="(authService.currentUser$ | async)?.avatarUrl" alt="Avatar" class="dropdown-avatar" />
                <div>
                  <div class="dropdown-user-name">
                    {{ (authService.currentUser$ | async)?.firstName }} {{ (authService.currentUser$ | async)?.lastName }}
                  </div>
                  <div class="dropdown-user-email">{{ (authService.currentUser$ | async)?.email }}</div>
                </div>
              </div>
              <div class="dropdown-divider"></div>
              <a routerLink="/settings" class="dropdown-item" (click)="showUserMenu = false">
                <i class="pi pi-user"></i> Mon profil
              </a>
              <a routerLink="/settings" class="dropdown-item" (click)="showUserMenu = false">
                <i class="pi pi-cog"></i> Paramètres
              </a>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item logout-item" (click)="logout()">
                <i class="pi pi-sign-out"></i> Déconnexion
              </button>
            </div>
          }
        </div>
      </div>
    </header>

    <!-- Click outside overlay -->
    @if (showNotifications || showUserMenu || showActionMenu) {
      <div class="overlay-dismiss" (click)="closeAll()"></div>
    }
  `,
  styles: [`
    .topbar {
      height: 64px;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
      position: sticky;
      top: 0;
      z-index: 20;
      gap: 1rem;
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 1;
    }

    .menu-btn {
      background: none;
      border: none;
      color: #64748b;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      font-size: 1.1rem;
      transition: all 0.2s;
      display: flex;
    }
    .menu-btn:hover { background: #f1f5f9; color: #1B4F72; }

    .topbar-search {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      padding: 0 0.75rem;
      max-width: 440px;
      width: 100%;
      transition: border-color 0.2s;
    }
    .topbar-search:focus-within {
      border-color: #1B4F72;
      background: #fff;
    }

    .search-icon { color: #94a3b8; font-size: 0.85rem; }

    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      outline: none;
      font-size: 0.875rem;
      color: #1e293b;
      padding: 0.5rem 0;
    }
    .search-input::placeholder { color: #94a3b8; }

    .clear-search {
      background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 0.75rem; padding: 2px;
    }
    .search-shortcut {
      font-size: 0.7rem; color: #cbd5e1; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; white-space: nowrap;
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* Quick actions */
    .quick-actions { position: relative; }

    .action-btn {
      display: flex; align-items: center; gap: 0.4rem;
      background: #1B4F72; color: #fff; border: none;
      padding: 0.5rem 0.875rem; border-radius: 8px;
      font-size: 0.875rem; font-weight: 500; cursor: pointer;
      transition: all 0.2s; white-space: nowrap;
    }
    .action-btn:hover { background: #164469; }

    .icon-btn {
      background: none; border: none; color: #64748b;
      cursor: pointer; padding: 8px; border-radius: 8px;
      font-size: 1.05rem; position: relative; transition: all 0.2s;
      display: flex;
    }
    .icon-btn:hover { background: #f1f5f9; color: #1B4F72; }

    .notif-badge {
      position: absolute; top: 3px; right: 3px;
      background: #ef4444; color: #fff; font-size: 0.6rem;
      font-weight: 700; width: 16px; height: 16px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
    }

    /* Dropdown shared styles */
    .dropdown-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.12);
      z-index: 100;
      min-width: 200px;
      overflow: hidden;
    }

    .dropdown-header {
      padding: 0.875rem 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f1f5f9;
      font-weight: 600;
      font-size: 0.875rem;
      color: #1e293b;
    }

    .mark-all-btn {
      background: none; border: none; color: #1B4F72;
      font-size: 0.75rem; cursor: pointer; font-weight: 500;
    }
    .mark-all-btn:hover { text-decoration: underline; }

    .dropdown-item {
      display: flex; align-items: center; gap: 0.625rem;
      padding: 0.625rem 1rem; color: #334155; font-size: 0.875rem;
      cursor: pointer; transition: background 0.15s; text-decoration: none;
      width: 100%;
    }
    .dropdown-item:hover { background: #f8fafc; color: #1B4F72; }
    .dropdown-item i { font-size: 0.9rem; color: #64748b; width: 16px; }

    .dropdown-divider { height: 1px; background: #f1f5f9; margin: 4px 0; }

    .logout-item { color: #ef4444; border: none; background: none; font-family: inherit; }
    .logout-item:hover { background: #fef2f2; }
    .logout-item i { color: #ef4444; }

    /* Notifications */
    .notif-wrapper { position: relative; }
    .notif-dropdown { width: 360px; }

    .notif-list { max-height: 320px; overflow-y: auto; }

    .notif-item {
      display: flex; align-items: flex-start; gap: 0.75rem;
      padding: 0.875rem 1rem; cursor: pointer; transition: background 0.15s;
      position: relative;
    }
    .notif-item:hover { background: #f8fafc; }
    .notif-item.unread { background: #f0f7ff; }

    .notif-icon-wrap {
      width: 36px; height: 36px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .notif-icon-wrap i { font-size: 0.9rem; }

    .notif-content { flex: 1; }
    .notif-title { font-size: 0.82rem; font-weight: 600; color: #1e293b; }
    .notif-msg { font-size: 0.78rem; color: #64748b; margin-top: 2px; }
    .notif-time { font-size: 0.7rem; color: #94a3b8; margin-top: 4px; }

    .notif-dot {
      width: 8px; height: 8px; background: #1B4F72;
      border-radius: 50%; flex-shrink: 0; margin-top: 4px;
    }

    /* User menu */
    .user-menu-wrapper { position: relative; }

    .user-menu-btn {
      display: flex; align-items: center; gap: 0.5rem;
      background: none; border: 1.5px solid #e2e8f0;
      padding: 4px 10px 4px 4px; border-radius: 100px;
      cursor: pointer; transition: all 0.2s;
    }
    .user-menu-btn:hover { border-color: #1B4F72; background: #f8fafc; }

    .topbar-avatar {
      width: 30px; height: 30px; border-radius: 50%; object-fit: cover;
    }

    .user-info-topbar { display: flex; flex-direction: column; }
    .user-name-topbar { font-size: 0.82rem; font-weight: 600; color: #1e293b; }

    .user-dropdown { width: 260px; }

    .user-dropdown-header {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 1rem; border-bottom: 1px solid #f1f5f9;
    }
    .dropdown-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
    .dropdown-user-name { font-size: 0.875rem; font-weight: 600; color: #1e293b; }
    .dropdown-user-email { font-size: 0.75rem; color: #94a3b8; }

    /* Action dropdown */
    .action-dropdown { min-width: 180px; padding: 6px; }
    .action-dropdown .dropdown-item { border-radius: 6px; }

    .overlay-dismiss {
      position: fixed; inset: 0; z-index: 99;
    }
  `]
})
export class TopbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  searchQuery = '';
  showNotifications = false;
  showUserMenu = false;
  showActionMenu = false;

  notifications: Notification[] = [
    { id: '1', type: 'mandate', title: 'Mandat expirant', message: 'Le mandat MND-10001 expire dans 5 jours', time: new Date(Date.now() - 1000 * 60 * 30), read: false, icon: 'pi-file-edit', iconColor: '#ef4444' },
    { id: '2', type: 'contact', title: 'Nouveau contact', message: 'Jean Dupont a soumis une demande via le site', time: new Date(Date.now() - 1000 * 60 * 90), read: false, icon: 'pi-user', iconColor: '#1B4F72' },
    { id: '3', type: 'appointment', title: 'Rappel rendez-vous', message: 'Visite appartement Paris 8 dans 1h', time: new Date(Date.now() - 1000 * 60 * 120), read: false, icon: 'pi-calendar', iconColor: '#3b82f6' },
    { id: '4', type: 'transaction', title: 'Compromis signé', message: 'Transaction TRX-10003 : compromis signé', time: new Date(Date.now() - 1000 * 60 * 60 * 3), read: true, icon: 'pi-check-circle', iconColor: '#10b981' },
  ];

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/properties'], { queryParams: { q: this.searchQuery } });
      this.searchQuery = '';
    }
  }

  markAllRead(): void {
    this.notifications.forEach(n => n.read = true);
  }

  readNotification(notif: Notification): void {
    notif.read = true;
    this.showNotifications = false;
  }

  getTimeAgo(date: Date): string {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `Il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${Math.floor(hours / 24)}j`;
  }

  closeAll(): void {
    this.showNotifications = false;
    this.showUserMenu = false;
    this.showActionMenu = false;
  }

  logout(): void {
    this.authService.logout();
  }
}
