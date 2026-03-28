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
  template: `
    <div class="dashboard">
      <!-- Page header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Tableau de bord</h1>
          <p class="page-subtitle">Bienvenue sur Imoblex — {{ today | date:'EEEE d MMMM yyyy':'':'fr' }}</p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary">
            <i class="pi pi-download"></i> Rapport mensuel
          </button>
          <button class="btn-primary" routerLink="/properties/new">
            <i class="pi pi-plus"></i> Nouveau bien
          </button>
        </div>
      </div>

      <!-- KPI Cards -->
      @if (stats()) {
        <div class="kpi-grid">
          @for (kpi of kpiCards(); track kpi.label) {
            <div class="kpi-card" [style.border-top-color]="kpi.color">
              <div class="kpi-top">
                <div class="kpi-icon-wrap" [style.background]="kpi.color + '15'">
                  <i class="pi {{ kpi.icon }}" [style.color]="kpi.color"></i>
                </div>
                <div class="kpi-trend" [class.trend-up]="kpi.trend > 0" [class.trend-down]="kpi.trend < 0">
                  <i class="pi" [class.pi-arrow-up]="kpi.trend > 0" [class.pi-arrow-down]="kpi.trend < 0" [class.pi-minus]="kpi.trend === 0"></i>
                  <span>{{ kpi.trendLabel }}</span>
                </div>
              </div>
              <div class="kpi-value">{{ kpi.value }}</div>
              <div class="kpi-label">{{ kpi.label }}</div>
              @if (kpi.subLabel) {
                <div class="kpi-sublabel">{{ kpi.subLabel }}</div>
              }
            </div>
          }
        </div>
      }

      <!-- Main content grid -->
      <div class="dashboard-grid">

        <!-- Left column -->
        <div class="dashboard-left">

          <!-- Properties by type chart (simulated) -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">
                <i class="pi pi-chart-pie"></i>
                Répartition des biens
              </h3>
              <a routerLink="/properties" class="card-link">Voir tout</a>
            </div>
            <div class="property-types-list">
              @for (item of propertyTypeStats; track item.label) {
                <div class="type-row">
                  <div class="type-info">
                    <span class="type-dot" [style.background]="item.color"></span>
                    <span class="type-name">{{ item.label }}</span>
                  </div>
                  <div class="type-bar-wrap">
                    <div class="type-bar" [style.width.%]="item.pct" [style.background]="item.color"></div>
                  </div>
                  <span class="type-count">{{ item.count }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Transaction pipeline -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">
                <i class="pi pi-chart-line"></i>
                Pipeline Transactions
              </h3>
              <a routerLink="/transactions" class="card-link">Voir tout</a>
            </div>
            <div class="pipeline-list">
              @for (step of pipelineSteps; track step.label) {
                <div class="pipeline-step">
                  <div class="pipeline-label-area">
                    <span class="pipeline-dot" [style.background]="step.color"></span>
                    <span class="pipeline-label">{{ step.label }}</span>
                  </div>
                  <div class="pipeline-bar-wrap">
                    <div class="pipeline-bar" [style.width.%]="step.pct" [style.background]="step.color"></div>
                  </div>
                  <span class="pipeline-count">{{ step.count }}</span>
                  <span class="pipeline-amount">{{ step.amount | priceFormatter }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Revenue trend (simulated chart) -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">
                <i class="pi pi-chart-bar"></i>
                Commissions 2024
              </h3>
              <div class="legend-row">
                <span class="legend-item"><span class="legend-dot" style="background:#1B4F72"></span>Réel</span>
                <span class="legend-item"><span class="legend-dot" style="background:#F39C12"></span>Objectif</span>
              </div>
            </div>
            <div class="chart-bars">
              @for (month of monthlyData; track month.label) {
                <div class="chart-col">
                  <div class="chart-bar-group">
                    <div class="chart-bar-target" [style.height.px]="month.target / 1200" title="Objectif: {{ month.target | priceFormatter }}"></div>
                    <div class="chart-bar-real" [style.height.px]="month.real / 1200" [class.over-target]="month.real > month.target" title="Réel: {{ month.real | priceFormatter }}"></div>
                  </div>
                  <span class="chart-label">{{ month.label }}</span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Right column -->
        <div class="dashboard-right">

          <!-- Upcoming appointments -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">
                <i class="pi pi-calendar"></i>
                Prochains rendez-vous
              </h3>
              <a routerLink="/agenda" class="card-link">Agenda</a>
            </div>
            @if (upcomingAppointments().length === 0) {
              <div class="empty-state-small">
                <i class="pi pi-calendar-times"></i>
                <span>Aucun RDV à venir</span>
              </div>
            } @else {
              <div class="appointments-list">
                @for (apt of upcomingAppointments(); track apt.id) {
                  <div class="appointment-item">
                    <div class="apt-date-col">
                      <span class="apt-day">{{ apt.startDate | date:'d' }}</span>
                      <span class="apt-month">{{ apt.startDate | date:'MMM':'':'fr' }}</span>
                    </div>
                    <div class="apt-info">
                      <div class="apt-title">{{ apt.title }}</div>
                      <div class="apt-meta">
                        <i class="pi pi-clock"></i>
                        {{ apt.startDate | date:'HH:mm' }}
                        @if (apt.location) { — {{ apt.location }} }
                      </div>
                    </div>
                    <div class="apt-type-badge" [style]="getAptTypeStyle(apt.type)">
                      {{ getAptTypeLabel(apt.type) }}
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Expiring mandates -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">
                <i class="pi pi-exclamation-triangle" style="color:#f59e0b"></i>
                Mandats à renouveler
              </h3>
              <a routerLink="/mandates" class="card-link">Voir tout</a>
            </div>
            <div class="mandate-alerts">
              @for (m of expiringMandates; track m.id) {
                <div class="mandate-alert-item" [class.urgent]="m.days <= 7">
                  <div class="mandate-alert-info">
                    <span class="mandate-ref">{{ m.ref }}</span>
                    <span class="mandate-addr">{{ m.address }}</span>
                  </div>
                  <div class="mandate-days" [class.urgent]="m.days <= 7">
                    {{ m.days }}j
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Recent activity -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">
                <i class="pi pi-history"></i>
                Activité récente
              </h3>
            </div>
            <div class="activity-feed">
              @for (activity of recentActivity; track activity.id) {
                <div class="activity-item">
                  <div class="activity-icon" [style.background]="activity.color + '15'" [style.color]="activity.color">
                    <i class="pi {{ activity.icon }}"></i>
                  </div>
                  <div class="activity-content">
                    <div class="activity-text" [innerHTML]="activity.text"></div>
                    <div class="activity-time">{{ activity.time }}</div>
                  </div>
                </div>
              }
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { animation: fadeIn 0.3s ease; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 1.75rem; flex-wrap: wrap; gap: 1rem;
    }

    .page-title {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 1.6rem; font-weight: 800; color: #0f172a; margin: 0 0 0.25rem;
    }

    .page-subtitle { font-size: 0.875rem; color: #64748b; margin: 0; text-transform: capitalize; }

    .header-actions { display: flex; gap: 0.75rem; }

    .btn-primary {
      display: flex; align-items: center; gap: 0.4rem;
      background: #1B4F72; color: #fff; border: none;
      padding: 0.625rem 1.125rem; border-radius: 8px;
      font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
    }
    .btn-primary:hover { background: #164469; }

    .btn-secondary {
      display: flex; align-items: center; gap: 0.4rem;
      background: #fff; color: #475569;
      border: 1.5px solid #e2e8f0;
      padding: 0.625rem 1.125rem; border-radius: 8px;
      font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s;
    }
    .btn-secondary:hover { background: #f8fafc; border-color: #cbd5e1; }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    @media (max-width: 1200px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 600px) { .kpi-grid { grid-template-columns: 1fr; } }

    .kpi-card {
      background: #fff;
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
      border-top: 3px solid transparent;
      transition: box-shadow 0.2s, transform 0.2s;
    }
    .kpi-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.1); transform: translateY(-2px); }

    .kpi-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.875rem; }

    .kpi-icon-wrap {
      width: 44px; height: 44px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.1rem;
    }

    .kpi-trend {
      display: flex; align-items: center; gap: 3px;
      font-size: 0.75rem; font-weight: 600;
      padding: 2px 8px; border-radius: 100px;
      background: rgba(0,0,0,0.05); color: #64748b;
    }
    .trend-up { background: rgba(16,185,129,0.1); color: #059669; }
    .trend-down { background: rgba(239,68,68,0.1); color: #dc2626; }

    .kpi-value {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 2rem; font-weight: 800; color: #0f172a; line-height: 1; margin-bottom: 4px;
    }

    .kpi-label { font-size: 0.85rem; font-weight: 600; color: #374151; }
    .kpi-sublabel { font-size: 0.75rem; color: #94a3b8; margin-top: 2px; }

    /* Dashboard grid */
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 1.25rem;
    }

    @media (max-width: 1300px) { .dashboard-grid { grid-template-columns: 1fr; } }

    .dashboard-left, .dashboard-right { display: flex; flex-direction: column; gap: 1.25rem; }

    /* Card */
    .card {
      background: #fff;
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }

    .card-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 1.25rem;
    }

    .card-title {
      font-size: 0.9rem; font-weight: 700; color: #1e293b;
      display: flex; align-items: center; gap: 0.5rem; margin: 0;
    }
    .card-title i { color: #1B4F72; }

    .card-link { font-size: 0.78rem; color: #1B4F72; text-decoration: none; font-weight: 500; }
    .card-link:hover { text-decoration: underline; }

    /* Property types */
    .property-types-list { display: flex; flex-direction: column; gap: 0.75rem; }

    .type-row { display: flex; align-items: center; gap: 0.75rem; }
    .type-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .type-info { display: flex; align-items: center; gap: 0.5rem; width: 110px; flex-shrink: 0; }
    .type-name { font-size: 0.8rem; color: #475569; }
    .type-bar-wrap { flex: 1; height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; }
    .type-bar { height: 100%; border-radius: 3px; transition: width 0.6s ease; }
    .type-count { font-size: 0.8rem; font-weight: 600; color: #374151; width: 24px; text-align: right; }

    /* Pipeline */
    .pipeline-list { display: flex; flex-direction: column; gap: 0.875rem; }

    .pipeline-step { display: flex; align-items: center; gap: 0.75rem; }
    .pipeline-label-area { display: flex; align-items: center; gap: 0.5rem; width: 120px; flex-shrink: 0; }
    .pipeline-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .pipeline-label { font-size: 0.78rem; color: #475569; }
    .pipeline-bar-wrap { flex: 1; height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; }
    .pipeline-bar { height: 100%; border-radius: 3px; }
    .pipeline-count { font-size: 0.78rem; font-weight: 700; color: #1e293b; width: 20px; text-align: center; }
    .pipeline-amount { font-size: 0.72rem; color: #94a3b8; width: 80px; text-align: right; white-space: nowrap; }

    /* Chart bars */
    .chart-bars {
      display: flex; align-items: flex-end; gap: 4px; height: 100px; padding-top: 1rem;
    }

    .chart-col {
      flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px;
    }

    .chart-bar-group {
      display: flex; align-items: flex-end; gap: 2px; position: relative;
    }

    .chart-bar-target {
      width: 8px; background: rgba(243,156,18,0.3); border-radius: 2px 2px 0 0;
    }

    .chart-bar-real {
      width: 8px; background: #1B4F72; border-radius: 2px 2px 0 0;
    }
    .chart-bar-real.over-target { background: #10b981; }

    .chart-label { font-size: 0.65rem; color: #94a3b8; }

    .legend-row { display: flex; gap: 1rem; }
    .legend-item { display: flex; align-items: center; gap: 4px; font-size: 0.72rem; color: #64748b; }
    .legend-dot { width: 8px; height: 8px; border-radius: 2px; }

    /* Appointments */
    .appointments-list { display: flex; flex-direction: column; gap: 0.625rem; }

    .appointment-item {
      display: flex; align-items: center; gap: 0.875rem;
      padding: 0.75rem; border-radius: 10px;
      background: #f8fafc; border: 1px solid #f1f5f9;
      transition: border-color 0.15s;
    }
    .appointment-item:hover { border-color: #e2e8f0; }

    .apt-date-col {
      width: 36px; text-align: center; flex-shrink: 0;
      background: #1B4F72; border-radius: 8px; padding: 4px 2px;
    }
    .apt-day { display: block; font-size: 1rem; font-weight: 800; color: #fff; line-height: 1; }
    .apt-month { display: block; font-size: 0.55rem; color: rgba(255,255,255,0.7); text-transform: uppercase; }

    .apt-info { flex: 1; }
    .apt-title { font-size: 0.82rem; font-weight: 600; color: #1e293b; }
    .apt-meta { font-size: 0.72rem; color: #94a3b8; margin-top: 2px; display: flex; align-items: center; gap: 3px; }

    .apt-type-badge {
      font-size: 0.68rem; font-weight: 600;
      padding: 2px 8px; border-radius: 100px; white-space: nowrap;
    }

    .empty-state-small {
      display: flex; flex-direction: column; align-items: center;
      gap: 0.5rem; padding: 2rem; color: #94a3b8; font-size: 0.875rem;
    }
    .empty-state-small i { font-size: 2rem; color: #cbd5e1; }

    /* Mandate alerts */
    .mandate-alerts { display: flex; flex-direction: column; gap: 0.5rem; }

    .mandate-alert-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.75rem; border-radius: 8px; border: 1px solid #fef3c7;
      background: #fffbeb;
    }
    .mandate-alert-item.urgent { border-color: #fecaca; background: #fef2f2; }

    .mandate-ref { font-size: 0.82rem; font-weight: 700; color: #1e293b; display: block; }
    .mandate-addr { font-size: 0.72rem; color: #64748b; }

    .mandate-days {
      font-size: 0.78rem; font-weight: 800;
      background: rgba(245,158,11,0.15); color: #d97706;
      padding: 2px 8px; border-radius: 100px; white-space: nowrap;
    }
    .mandate-days.urgent { background: rgba(239,68,68,0.1); color: #dc2626; }

    /* Activity feed */
    .activity-feed { display: flex; flex-direction: column; }

    .activity-item {
      display: flex; gap: 0.75rem; padding: 0.75rem 0;
      border-bottom: 1px solid #f8fafc;
    }
    .activity-item:last-child { border-bottom: none; }

    .activity-icon {
      width: 34px; height: 34px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.8rem; flex-shrink: 0;
    }

    .activity-text { font-size: 0.8rem; color: #374151; line-height: 1.4; }
    .activity-time { font-size: 0.7rem; color: #94a3b8; margin-top: 3px; }
  `]
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
