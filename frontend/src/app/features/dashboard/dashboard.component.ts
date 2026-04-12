import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReportingService, DashboardStats } from '../../core/services/reporting.service';
import { AgendaService } from '../../core/services/agenda.service';
import { PropertyService } from '../../core/services/property.service';
import { Appointment } from '../../core/models/appointment.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { PriceFormatterPipe } from '../../shared/pipes/price-formatter.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusBadgeComponent, PriceFormatterPipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private readonly reportingService = inject(ReportingService);
  private readonly agendaService = inject(AgendaService);
  private readonly propertyService = inject(PropertyService);

  today = new Date();
  stats = signal<DashboardStats | null>(null);
  upcomingAppointments = signal<Appointment[]>([]);
  kpiCards = signal<any[]>([]);

  // Charts — données agrégées côté front à partir des stats réelles
  propertyTypeStats = signal<{ label: string; count: number; pct: number; color: string }[]>([]);
  expiringMandates = signal<{ id: string; reference: string; address: string; daysLeft: number }[]>([]);

  ngOnInit(): void {
    this.reportingService.getDashboardStats().subscribe(s => {
      this.stats.set(s);
      this.kpiCards.set([
        {
          icon: 'pi-building',
          label: 'Biens',
          value: s.totalProperties,
          color: '#1B4F72',
          subLabel: 'en portefeuille',
          trend: 0,
          trendLabel: 'total'
        },
        {
          icon: 'pi-file-edit',
          label: 'Mandats actifs',
          value: s.activeMandates,
          color: '#F39C12',
          subLabel: `${s.expiringMandates} expirant bientôt`,
          trend: s.expiringMandates > 0 ? -1 : 0,
          trendLabel: s.expiringMandates > 0 ? `${s.expiringMandates} à renouveler` : 'Aucun expirant'
        },
        {
          icon: 'pi-chart-line',
          label: 'Transactions',
          value: s.transactionsInProgress,
          color: '#8b5cf6',
          subLabel: 'en cours',
          trend: 0,
          trendLabel: 'en cours'
        },
        {
          icon: 'pi-users',
          label: 'Contacts',
          value: s.totalContacts,
          color: '#10b981',
          subLabel: s.unreadLeads > 0 ? `${s.unreadLeads} formulaire${s.unreadLeads > 1 ? 's' : ''} non lu${s.unreadLeads > 1 ? 's' : ''}` : 'Tous traités',
          trend: s.unreadLeads > 0 ? 1 : 0,
          trendLabel: s.unreadLeads > 0 ? `${s.unreadLeads} nouveau${s.unreadLeads > 1 ? 'x' : ''}` : ''
        }
      ]);

      this.expiringMandates.set(
        s.expiringMandatesList.map(m => ({
          id: m.id,
          reference: m.reference,
          address: m.address,
          daysLeft: m.daysLeft
        }))
      );
    });

    this.agendaService.getUpcoming(5).subscribe(apts => {
      this.upcomingAppointments.set(apts);
    });
  }

  getAptTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      VISIT: 'Visite', MEETING: 'Réunion', ESTIMATION: 'Estimation',
      SIGNING: 'Signature', NOTARY: 'Notaire', PHONE_CALL: 'Appel'
    };
    return labels[type] || type;
  }

  getAptTypeStyle(type: string): string {
    const styles: Record<string, string> = {
      VISIT: 'background: rgba(27,79,114,0.1); color: #1B4F72',
      MEETING: 'background: rgba(139,92,246,0.1); color: #7c3aed',
      ESTIMATION: 'background: rgba(243,156,18,0.12); color: #d97706',
      SIGNING: 'background: rgba(16,185,129,0.1); color: #059669',
      NOTARY: 'background: rgba(239,68,68,0.1); color: #dc2626',
      PHONE_CALL: 'background: rgba(59,130,246,0.1); color: #2563eb'
    };
    return styles[type] || 'background: #f1f5f9; color: #64748b';
  }
}
