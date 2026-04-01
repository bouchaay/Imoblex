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
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
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
    this.closeAll();
    this.authService.logout();
  }
}
