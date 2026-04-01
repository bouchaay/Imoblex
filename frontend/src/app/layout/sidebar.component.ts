import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter, merge } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { PropertyService } from '../core/services/property.service';

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
export class SidebarComponent implements OnInit {
  @Input() collapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  readonly authService = inject(AuthService);
  private readonly propertyService = inject(PropertyService);
  private readonly router = inject(Router);

  navGroups: NavGroup[] = [
    {
      title: 'Principal',
      items: [
        { label: 'Tableau de bord', icon: 'pi-home', route: '/dashboard' },
        { label: 'Biens', icon: 'pi-building', route: '/properties' },
        { label: 'Mandats', icon: 'pi-file-edit', route: '/mandates' },
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

  ngOnInit(): void {
    this.loadPropertyCount();

    merge(
      this.propertyService.change$,
      this.router.events.pipe(filter(e => e instanceof NavigationEnd))
    ).subscribe(() => this.loadPropertyCount());
  }

  private loadPropertyCount(): void {
    this.propertyService.getAll({ page: 0, pageSize: 1 }).subscribe({
      next: page => {
        const item = this.navGroups[0].items.find(i => i.route === '/properties');
        if (item) item.badge = page.total;
      },
      error: () => {}
    });
  }

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
