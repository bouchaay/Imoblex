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
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
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
