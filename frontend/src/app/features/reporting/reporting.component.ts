import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportingService } from '../../core/services/reporting.service';
import { PriceFormatterPipe } from '../../shared/pipes/price-formatter.pipe';

@Component({
  selector: 'app-reporting',
  standalone: true,
  imports: [CommonModule, PriceFormatterPipe],
  template: `
    <div class="reporting-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Statistiques & Reporting</h1>
          <p class="page-subtitle">Vue d'ensemble de la performance de l'agence</p>
        </div>
        <div class="header-actions">
          <select class="period-select">
            <option>Ce mois</option>
            <option>Ce trimestre</option>
            <option>Cette année</option>
          </select>
          <button class="btn-primary"><i class="pi pi-download"></i> Exporter</button>
        </div>
      </div>

      <!-- KPI Summary cards -->
      <div class="kpi-summary">
        @for (kpi of kpis; track kpi.label) {
          <div class="kpi-card" [style.border-top-color]="kpi.color">
            <div class="kpi-icon" [style.background]="kpi.color + '15'" [style.color]="kpi.color">
              <i class="pi {{ kpi.icon }}"></i>
            </div>
            <div class="kpi-data">
              <div class="kpi-val">{{ kpi.value }}</div>
              <div class="kpi-label">{{ kpi.label }}</div>
            </div>
            <div class="kpi-trend" [class.up]="kpi.up">
              <i class="pi" [class.pi-arrow-up]="kpi.up" [class.pi-arrow-down]="!kpi.up"></i>
              {{ kpi.trend }}
            </div>
          </div>
        }
      </div>

      <!-- Charts section -->
      <div class="charts-grid">
        <!-- Revenue bar chart (simulated) -->
        <div class="card chart-card">
          <h3 class="chart-title">Commissions mensuelles (€)</h3>
          <div class="bar-chart">
            @for (month of monthlyRevenue; track month.label) {
              <div class="bar-col">
                <div class="bar-tooltip">{{ month.amount.toLocaleString('fr-FR') }} €</div>
                <div class="bar-fill" [style.height.%]="(month.amount / maxRevenue) * 100" [style.background]="month.amount >= 50000 ? '#10b981' : '#1B4F72'"></div>
                <div class="bar-label">{{ month.label }}</div>
              </div>
            }
          </div>
        </div>

        <!-- Property types donut (simulated) -->
        <div class="card chart-card">
          <h3 class="chart-title">Biens par type</h3>
          <div class="donut-chart">
            <div class="donut-center">
              <span class="donut-total">48</span>
              <span class="donut-label">biens</span>
            </div>
          </div>
          <div class="donut-legend">
            @for (item of propertyTypeData; track item.label) {
              <div class="legend-item">
                <span class="legend-dot" [style.background]="item.color"></span>
                <span class="legend-label">{{ item.label }}</span>
                <span class="legend-value">{{ item.count }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Contacts by type -->
        <div class="card chart-card">
          <h3 class="chart-title">Contacts par profil</h3>
          <div class="horizontal-bars">
            @for (item of contactTypeData; track item.label) {
              <div class="h-bar-row">
                <span class="h-bar-label">{{ item.label }}</span>
                <div class="h-bar-track">
                  <div class="h-bar-fill" [style.width.%]="(item.count / 25) * 100" [style.background]="item.color"></div>
                </div>
                <span class="h-bar-count">{{ item.count }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Agent performance -->
        <div class="card chart-card">
          <h3 class="chart-title">Performance équipe</h3>
          <div class="agent-list">
            @for (agent of agentPerformance; track agent.name) {
              <div class="agent-row">
                <div class="agent-avatar" [style.background]="agent.color">{{ agent.initials }}</div>
                <div class="agent-info">
                  <div class="agent-name">{{ agent.name }}</div>
                  <div class="agent-stats">{{ agent.transactions }} transactions • {{ agent.revenue.toLocaleString('fr-FR') }} €</div>
                </div>
                <div class="agent-bar-wrap">
                  <div class="agent-bar" [style.width.%]="(agent.revenue / 80000) * 100"></div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reporting-page { animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
    .page-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 0 0 0.2rem; }
    .page-subtitle { font-size: 0.875rem; color: #64748b; margin: 0; }
    .header-actions { display: flex; gap: 0.75rem; align-items: center; }
    .period-select { border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 0.5rem 0.875rem; font-size: 0.875rem; outline: none; background: #fff; }
    .btn-primary { display: flex; align-items: center; gap: 0.4rem; background: #1B4F72; color: #fff; border: none; padding: 0.625rem 1.125rem; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; }
    .kpi-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    @media (max-width: 1100px) { .kpi-summary { grid-template-columns: repeat(2, 1fr); } }
    .kpi-card { background: #fff; border-radius: 12px; padding: 1.125rem; box-shadow: 0 1px 4px rgba(0,0,0,0.06); border-top: 3px solid transparent; display: flex; align-items: center; gap: 0.875rem; }
    .kpi-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
    .kpi-data { flex: 1; }
    .kpi-val { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.4rem; font-weight: 800; color: #1e293b; line-height: 1; }
    .kpi-label { font-size: 0.78rem; color: #64748b; margin-top: 2px; }
    .kpi-trend { font-size: 0.72rem; font-weight: 600; display: flex; align-items: center; gap: 2px; padding: 2px 8px; border-radius: 100px; background: rgba(239,68,68,0.1); color: #dc2626; }
    .kpi-trend.up { background: rgba(16,185,129,0.1); color: #059669; }
    .charts-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; }
    @media (max-width: 1100px) { .charts-grid { grid-template-columns: 1fr; } }
    .card { background: #fff; border-radius: 12px; padding: 1.25rem; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
    .chart-title { font-size: 0.9rem; font-weight: 700; color: #1e293b; margin: 0 0 1.25rem; }
    .bar-chart { display: flex; align-items: flex-end; gap: 6px; height: 120px; }
    .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; position: relative; }
    .bar-col:hover .bar-tooltip { display: block; }
    .bar-tooltip { display: none; position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background: #1e293b; color: #fff; font-size: 0.65rem; padding: 3px 6px; border-radius: 4px; white-space: nowrap; z-index: 10; }
    .bar-fill { width: 100%; border-radius: 4px 4px 0 0; transition: height 0.5s ease; min-height: 4px; }
    .bar-label { font-size: 0.65rem; color: #94a3b8; }
    .donut-chart { width: 120px; height: 120px; margin: 0 auto 1rem; background: conic-gradient(#1B4F72 0% 37%, #2E86C1 37% 62%, #F39C12 62% 75%, #27AE60 75% 87%, #8E44AD 87% 97%, #E74C3C 97% 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative; }
    .donut-chart::after { content: ''; position: absolute; width: 70px; height: 70px; background: #fff; border-radius: 50%; }
    .donut-center { position: relative; z-index: 1; text-align: center; }
    .donut-total { display: block; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.2rem; font-weight: 800; color: #1e293b; }
    .donut-label { display: block; font-size: 0.65rem; color: #94a3b8; }
    .donut-legend { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
    .legend-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; color: #475569; }
    .legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .legend-value { margin-left: auto; font-weight: 700; color: #1e293b; }
    .horizontal-bars { display: flex; flex-direction: column; gap: 0.875rem; }
    .h-bar-row { display: flex; align-items: center; gap: 0.75rem; }
    .h-bar-label { width: 90px; font-size: 0.78rem; color: #475569; flex-shrink: 0; }
    .h-bar-track { flex: 1; height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
    .h-bar-fill { height: 100%; border-radius: 4px; transition: width 0.5s ease; }
    .h-bar-count { width: 24px; text-align: right; font-size: 0.78rem; font-weight: 700; color: #1e293b; }
    .agent-list { display: flex; flex-direction: column; gap: 0.875rem; }
    .agent-row { display: flex; align-items: center; gap: 0.75rem; }
    .agent-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.78rem; font-weight: 700; color: #fff; flex-shrink: 0; }
    .agent-info { flex: 1; }
    .agent-name { font-size: 0.82rem; font-weight: 600; color: #1e293b; }
    .agent-stats { font-size: 0.72rem; color: #94a3b8; }
    .agent-bar-wrap { width: 80px; height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; }
    .agent-bar { height: 100%; background: #1B4F72; border-radius: 3px; transition: width 0.5s ease; }
  `]
})
export class ReportingComponent {
  kpis = [
    { icon: 'pi-euro', label: 'CA ce mois', value: '68 400 €', color: '#10b981', trend: '+8%', up: true },
    { icon: 'pi-chart-line', label: 'Transactions', value: '4', color: '#1B4F72', trend: '+2', up: true },
    { icon: 'pi-users', label: 'Nouveaux contacts', value: '12', color: '#F39C12', trend: '+5', up: true },
    { icon: 'pi-building', label: 'Biens en stock', value: '48', color: '#8b5cf6', trend: '-3', up: false }
  ];

  monthlyRevenue = [
    { label: 'J', amount: 38000 }, { label: 'F', amount: 42000 }, { label: 'M', amount: 55000 },
    { label: 'A', amount: 48000 }, { label: 'M', amount: 62000 }, { label: 'J', amount: 71000 },
    { label: 'J', amount: 45000 }, { label: 'A', amount: 38000 }, { label: 'S', amount: 59000 },
    { label: 'O', amount: 67000 }, { label: 'N', amount: 52000 }, { label: 'D', amount: 65000 }
  ];

  get maxRevenue(): number { return Math.max(...this.monthlyRevenue.map(m => m.amount)); }

  propertyTypeData = [
    { label: 'Appartements', count: 18, color: '#1B4F72' },
    { label: 'Maisons', count: 12, color: '#2E86C1' },
    { label: 'Villas', count: 6, color: '#F39C12' },
    { label: 'Studios', count: 5, color: '#27AE60' },
    { label: 'Lofts', count: 4, color: '#8E44AD' },
    { label: 'Autres', count: 3, color: '#E74C3C' }
  ];

  contactTypeData = [
    { label: 'Acheteurs', count: 22, color: '#1B4F72' },
    { label: 'Vendeurs', count: 15, color: '#F39C12' },
    { label: 'Locataires', count: 10, color: '#8b5cf6' },
    { label: 'Propriétaires', count: 8, color: '#10b981' },
    { label: 'Prospects', count: 5, color: '#64748b' }
  ];

  agentPerformance = [
    { name: 'Sophie Moreau', initials: 'SM', color: '#1B4F72', transactions: 6, revenue: 72000 },
    { name: 'Pierre Laurent', initials: 'PL', color: '#F39C12', transactions: 4, revenue: 48000 },
    { name: 'Julie Bernard', initials: 'JB', color: '#10b981', transactions: 3, revenue: 36000 },
    { name: 'Thomas Martin', initials: 'TM', color: '#8b5cf6', transactions: 2, revenue: 24000 }
  ];
}
