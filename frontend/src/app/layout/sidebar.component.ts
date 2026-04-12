import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter, merge } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { PropertyService } from '../core/services/property.service';
import { MandateService } from '../core/services/mandate.service';
import { ContactService } from '../core/services/contact.service';
import { AgendaService } from '../core/services/agenda.service';
import { LeadService } from '../core/services/lead.service';

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
  private readonly mandateService = inject(MandateService);
  private readonly contactService = inject(ContactService);
  private readonly agendaService = inject(AgendaService);
  private readonly leadService = inject(LeadService);
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
        { label: 'Locatif', icon: 'pi-key', route: '/rental' },
        { label: 'Agenda', icon: 'pi-calendar', route: '/agenda', badgeColor: '#3b82f6' },
        { label: 'Formulaires', icon: 'pi-inbox', route: '/leads', badgeColor: '#ef4444' },
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
    this.loadCounts();

    merge(
      this.propertyService.change$,
      this.mandateService.change$,
      this.contactService.change$,
      this.agendaService.change$,
      this.leadService.change$,
      this.router.events.pipe(filter(e => e instanceof NavigationEnd))
    ).subscribe(() => this.loadCounts());
  }

  private loadCounts(): void {
    this.propertyService.getAll({ page: 0, pageSize: 1 }).subscribe({
      next: page => {
        const item = this.navGroups[0].items.find(i => i.route === '/properties');
        if (item) item.badge = page.total;
      },
      error: () => {}
    });

    this.mandateService.getCount().subscribe({
      next: count => {
        const item = this.navGroups[0].items.find(i => i.route === '/mandates');
        if (item) item.badge = count;
      },
      error: () => {}
    });

    this.contactService.getCount().subscribe({
      next: count => {
        const item = this.navGroups[0].items.find(i => i.route === '/contacts');
        if (item) item.badge = count;
      },
      error: () => {}
    });

    // Badge agenda = nombre de créneaux aujourd'hui
    this.agendaService.getTodayCount().subscribe({
      next: count => {
        const item = this.navGroups[1].items.find(i => i.route === '/agenda');
        if (item) item.badge = count > 0 ? count : undefined;
      },
      error: () => {}
    });

    // Badge leads = formulaires non lus
    this.leadService.countUnread().subscribe({
      next: res => {
        const item = this.navGroups[1].items.find(i => i.route === '/leads');
        if (item) item.badge = res.count > 0 ? res.count : undefined;
      },
      error: () => {}
    });
  }

  isAdmin(): boolean {
    return this.authService.currentUser?.role === 'ADMIN';
  }

  getRoleLabel(role?: string): string {
    const labels: Record<string, string> = {
      ADMIN: 'Administrateur',
      USER: 'Collaborateur'
    };
    return labels[role || ''] || role || '';
  }

  logout(): void {
    this.authService.logout();
  }
}
