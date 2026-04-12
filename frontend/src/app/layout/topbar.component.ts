import { Component, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { NotificationService, AppNotification } from '../core/services/notification.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  readonly authService = inject(AuthService);
  readonly notifService = inject(NotificationService);
  private readonly router = inject(Router);

  searchQuery = '';
  showNotifications = false;
  showUserMenu = false;
  showActionMenu = false;

  get notifications(): AppNotification[] { return this.notifService.notifications(); }
  get unreadCount(): number { return this.notifService.unreadCount; }

  ngOnInit(): void {
    this.notifService.refresh();
    // Rafraîchir toutes les minutes
    setInterval(() => this.notifService.refresh(), 60 * 1000);
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/properties'], { queryParams: { q: this.searchQuery } });
      this.searchQuery = '';
    }
  }

  markAllRead(): void { this.notifService.markAllRead(); }

  readNotification(notif: AppNotification): void {
    this.showNotifications = false;
    this.notifService.markRead(notif);
  }

  getTimeAgo(date: Date): string {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'À l\'instant';
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
    this.closeAll();
    this.authService.logout();
  }
}
