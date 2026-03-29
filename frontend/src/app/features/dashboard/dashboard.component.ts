import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReportingService, DashboardStats } from '../../core/services/reporting.service';
import { AgendaService } from '../../core/services/agenda.service';
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

  today = new Date();
  stats = signal<DashboardStats | null>(null);
  upcomingAppointments = signal<Appointment[]>([]);
  kpiCards = signal<any[]>([]);

  propertyTypeStats = [
    { label: 'Appartements', count: 18, pct: 75, color: '#1B4F72' },
    { label: 'Maisons', count: 12, pct: 50, color: '#2E86C1' },
    { label: 'Villas', count: 6, pct: 25, color: '#F39C12' },
    { label: 'Studios', count: 5, pct: 21, color: '#27AE60' },
    { label: 'Lofts', count: 4, pct: 17, color: '#8E44AD' },
    { label: 'Terrains', count: 3, pct: 13, color: '#E74C3C' }
  ];

  pipelineSteps = [
    { label: 'Visite', count: 8, pct: 100, color: '#1B4F72', amount: 2400000 },
    { label: 'Offre', count: 5, pct: 63, color: '#2E86C1', amount: 1500000 },
    { label: 'Négociation', count: 4, pct: 50, color: '#F39C12', amount: 1200000 },
    { label: 'Compromis', count: 3, pct: 38, color: '#27AE60', amount: 900000 },
    { label: 'Financement', count: 2, pct: 25, color: '#8E44AD', amount: 600000 },
    { label: 'Acte', count: 1, pct: 13, color: '#10b981', amount: 350000 }
  ];

  monthlyData = [
    { label: 'J', real: 38000, target: 50000 },
    { label: 'F', real: 42000, target: 50000 },
    { label: 'M', real: 55000, target: 50000 },
    { label: 'A', real: 48000, target: 50000 },
    { label: 'M', real: 62000, target: 50000 },
    { label: 'J', real: 71000, target: 50000 },
    { label: 'J', real: 45000, target: 50000 },
    { label: 'A', real: 38000, target: 50000 },
    { label: 'S', real: 59000, target: 50000 },
    { label: 'O', real: 67000, target: 50000 },
    { label: 'N', real: 52000, target: 50000 },
    { label: 'D', real: 65000, target: 50000 }
  ];

  expiringMandates = [
    { id: '1', ref: 'MND-10002', address: '14 Av. Victor Hugo, Paris 16', days: 5 },
    { id: '2', ref: 'MND-10007', address: '3 Rue de Rivoli, Paris 1', days: 11 },
    { id: '3', ref: 'MND-10015', address: '22 Bd Haussmann, Paris 9', days: 18 }
  ];

  recentActivity = [
    { id: '1', icon: 'pi-user-plus', color: '#1B4F72', text: '<strong>Nouveau contact</strong> — Marie Laurent ajoutée comme acheteuse', time: 'Il y a 15 min' },
    { id: '2', icon: 'pi-file-edit', color: '#F39C12', text: '<strong>Mandat signé</strong> — MND-10023 exclusif signé pour 3 mois', time: 'Il y a 45 min' },
    { id: '3', icon: 'pi-building', color: '#10b981', text: '<strong>Bien publié</strong> — Appartement 3P Paris 8ème mis en ligne', time: 'Il y a 2h' },
    { id: '4', icon: 'pi-check-circle', color: '#8b5cf6', text: '<strong>Transaction finalisée</strong> — TRX-10008 acte signé chez notaire', time: 'Il y a 4h' },
    { id: '5', icon: 'pi-calendar', color: '#3b82f6', text: '<strong>Visite programmée</strong> — Thomas Bernard demain à 10h30', time: 'Il y a 6h' }
  ];

  ngOnInit(): void {
    this.reportingService.getDashboardStats().subscribe(s => {
      this.stats.set(s);
      this.kpiCards.set([
        {
          icon: 'pi-building',
          label: 'Biens actifs',
          value: s.totalProperties,
          color: '#1B4F72',
          subLabel: `${s.availableProperties} disponibles`,
          trend: 12,
          trendLabel: '+12% ce mois'
        },
        {
          icon: 'pi-file-edit',
          label: 'Mandats actifs',
          value: s.activeMandates,
          color: '#F39C12',
          subLabel: `${s.expiringMandates} expirant bientôt`,
          trend: -2,
          trendLabel: '-2 vs mois dernier'
        },
        {
          icon: 'pi-chart-line',
          label: 'Transactions en cours',
          value: s.transactionsInProgress,
          color: '#8b5cf6',
          subLabel: `${s.completedThisMonth} finalisées ce mois`,
          trend: 3,
          trendLabel: '+3 ce mois'
        },
        {
          icon: 'pi-euro',
          label: 'CA ce mois',
          value: s.revenueThisMonth.toLocaleString('fr-FR') + ' €',
          color: '#10b981',
          subLabel: `Taux conv. ${s.conversionRate}%`,
          trend: 8,
          trendLabel: '+8% vs N-1'
        }
      ]);
    });

    this.agendaService.getUpcoming(5).subscribe(apts => {
      this.upcomingAppointments.set(apts);
    });
  }

  getAptTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      VISIT: 'Visite',
      MEETING: 'Réunion',
      ESTIMATION: 'Estimation',
      SIGNING: 'Signature',
      NOTARY: 'Notaire',
      PHONE_CALL: 'Appel'
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
