import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MandateService } from './mandate.service';
import { AgendaService } from './agenda.service';
import { LeadService } from './lead.service';

export interface AppNotification {
  id: string;
  type: 'mandate' | 'lead' | 'appointment' | 'storage';
  title: string;
  message: string;
  time: Date;
  read: boolean;
  icon: string;
  iconColor: string;
  route?: string;
  queryParams?: any;
}

const STORAGE_KEY = 'imoblex_notif_read';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly mandateService = inject(MandateService);
  private readonly agendaService = inject(AgendaService);
  private readonly leadService = inject(LeadService);
  private readonly router = inject(Router);

  notifications = signal<AppNotification[]>([]);
  lastChecked = signal<Date>(new Date());

  private readIds: Set<string> = this.loadReadIds();

  get unreadCount(): number {
    return this.notifications().filter(n => !n.read).length;
  }

  refresh(): void {
    const today = new Date();
    const in15Days = new Date(today); in15Days.setDate(today.getDate() + 15);
    const todayStr = today.toISOString().split('T')[0];

    forkJoin({
      mandates: this.mandateService.getAll().pipe(catchError(() => of([]))),
      appointments: this.agendaService.getAll().pipe(catchError(() => of([]))),
      leads: this.leadService.getActive().pipe(catchError(() => of([]))),
    }).subscribe(({ mandates, appointments, leads }) => {
      const notifs: AppNotification[] = [];

      // 1. Mandats expirant dans ≤ 15 jours (1 notif par mandat, une fois par jour)
      const expiringMandates = (mandates as any[]).filter(m => {
        if (!m.endDate) return false;
        const end = new Date(m.endDate);
        return end >= today && end <= in15Days;
      });

      expiringMandates.forEach((m: any) => {
        const daysLeft = Math.ceil((new Date(m.endDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const id = `mandate-exp-${m.id}-${todayStr}`;
        notifs.push({
          id,
          type: 'mandate',
          title: 'Mandat expirant',
          message: `${m.reference || m.id} expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`,
          time: new Date(),
          read: this.readIds.has(id),
          icon: 'pi-file-edit',
          iconColor: daysLeft <= 7 ? '#ef4444' : '#f59e0b',
          route: `/mandates/${m.id}`,
        });
      });

      // 2. Formulaires non lus
      const unreadLeads = leads.filter((l: any) => l.status === 'UNREAD');
      unreadLeads.forEach((l: any) => {
        const id = `lead-${l.id}`;
        notifs.push({
          id,
          type: 'lead',
          title: 'Nouveau formulaire',
          message: `${l.firstName} ${l.lastName} — ${this.formTypeLabel(l.formType)}`,
          time: new Date(l.createdAt),
          read: this.readIds.has(id),
          icon: 'pi-inbox',
          iconColor: '#3b82f6',
          route: '/leads',
          queryParams: { id: l.id },
        });
      });

      // 3. RDV du jour
      const todayApts = (appointments as any[]).filter(a => {
        const d = new Date(a.startDate);
        return d.toISOString().split('T')[0] === todayStr && a.status === 'scheduled';
      });
      todayApts.forEach(a => {
        const id = `apt-${a.id}-${todayStr}`;
        notifs.push({
          id,
          type: 'appointment',
          title: 'RDV aujourd\'hui',
          message: `${a.title} à ${new Date(a.startDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
          time: new Date(a.startDate),
          read: this.readIds.has(id),
          icon: 'pi-calendar',
          iconColor: '#8b5cf6',
          route: '/agenda',
        });
      });

      // 4. Stockage (vérification via navigator.storage)
      this.checkStorage(notifs);

      // Trier: non lus d'abord, puis par date desc
      notifs.sort((a, b) => {
        if (a.read !== b.read) return a.read ? 1 : -1;
        return b.time.getTime() - a.time.getTime();
      });

      this.notifications.set(notifs);
      this.lastChecked.set(new Date());
    });
  }

  markRead(notif: AppNotification): void {
    notif.read = true;
    this.readIds.add(notif.id);
    this.saveReadIds();
    this.notifications.update(list => [...list]);
    if (notif.route) {
      this.router.navigate([notif.route], notif.queryParams ? { queryParams: notif.queryParams } : {});
    }
  }

  markAllRead(): void {
    this.notifications().forEach(n => {
      n.read = true;
      this.readIds.add(n.id);
    });
    this.saveReadIds();
    this.notifications.update(list => [...list]);
  }

  private checkStorage(notifs: AppNotification[]): void {
    if (!navigator.storage?.estimate) return;
    navigator.storage.estimate().then(({ usage = 0, quota = 0 }) => {
      if (quota === 0) return;
      const pct = (usage / quota) * 100;
      if (pct >= 80) {
        const id = `storage-${new Date().toISOString().split('T')[0]}`;
        notifs.push({
          id,
          type: 'storage',
          title: 'Stockage limité',
          message: `${Math.round(pct)}% de l'espace utilisé — pensez à libérer de la place`,
          time: new Date(),
          read: this.readIds.has(id),
          icon: 'pi-database',
          iconColor: '#f59e0b',
          route: '/settings',
        });
        this.notifications.update(list => [...list]);
      }
    });
  }

  private formTypeLabel(type: string): string {
    const m: Record<string, string> = { CONTACT: 'Contact général', ESTIMATION: 'Estimation', PROPERTY_INQUIRY: 'Renseignement bien' };
    return m[type] ?? type;
  }

  private loadReadIds(): Set<string> {
    try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); }
    catch { return new Set(); }
  }

  private saveReadIds(): void {
    // Ne garder que les 200 derniers IDs lus pour éviter un localStorage trop lourd
    const arr = Array.from(this.readIds).slice(-200);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }
}
