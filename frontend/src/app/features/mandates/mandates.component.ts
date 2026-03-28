import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MandateService } from '../../core/services/mandate.service';
import { Mandate } from '../../core/models/mandate.model';
import { MandateStatus, MANDATE_TYPE_LABELS } from '../../core/models/enums';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { PriceFormatterPipe } from '../../shared/pipes/price-formatter.pipe';

@Component({
  selector: 'app-mandates',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StatusBadgeComponent, PriceFormatterPipe],
  template: `
    <div class="mandates-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Mandats</h1>
          <p class="page-subtitle">{{ mandates().length }} mandats</p>
        </div>
        <button class="btn-primary" routerLink="/mandates/new">
          <i class="pi pi-plus"></i> Nouveau mandat
        </button>
      </div>

      <!-- Alert bar for expiring mandates -->
      @if (expiringCount() > 0) {
        <div class="alert-bar">
          <i class="pi pi-exclamation-triangle"></i>
          <span><strong>{{ expiringCount() }} mandat{{ expiringCount() > 1 ? 's' : '' }}</strong> expire{{ expiringCount() > 1 ? 'nt' : '' }} dans moins de 15 jours</span>
          <button class="alert-filter-btn" (click)="filterExpiring()">Voir</button>
        </div>
      }

      <!-- Status tabs -->
      <div class="status-tabs">
        @for (tab of tabs; track tab.value) {
          <button class="tab-btn" [class.active]="activeTab === tab.value" (click)="setTab(tab.value)">
            {{ tab.label }}
            <span class="tab-count">{{ getTabCount(tab.value) }}</span>
          </button>
        }
      </div>

      <!-- Mandate cards grid -->
      <div class="mandates-grid">
        @for (mandate of filteredMandates(); track mandate.id) {
          <div class="mandate-card" [class.expiring]="mandate.isExpiringSoon">
            <div class="mandate-card-top">
              <div class="mandate-ref">{{ mandate.reference }}</div>
              <app-status-badge [status]="mandate.status" type="mandate"></app-status-badge>
            </div>

            <div class="mandate-type-badge">
              <i class="pi pi-file-edit"></i>
              {{ getMandateTypeLabel(mandate.type) }}
            </div>

            <div class="mandate-price">{{ mandate.price | priceFormatter }}</div>
            <div class="mandate-fees">
              Commission: {{ mandate.agencyFeePercent }}% — {{ mandate.agencyFeeAmount > 0 ? (mandate.agencyFeeAmount | priceFormatter) : (mandate.price * mandate.agencyFeePercent / 100 | priceFormatter) }}
            </div>

            <div class="mandate-dates">
              <div class="date-item">
                <span>Début</span>
                <strong>{{ mandate.startDate | date:'dd/MM/yyyy' }}</strong>
              </div>
              <div class="date-separator"><i class="pi pi-arrow-right"></i></div>
              <div class="date-item">
                <span>Fin</span>
                <strong [class.text-red]="mandate.isExpiringSoon">{{ mandate.endDate | date:'dd/MM/yyyy' }}</strong>
              </div>
            </div>

            @if (mandate.daysRemaining !== undefined && mandate.status === 'ACTIVE') {
              <div class="days-remaining" [class.urgent]="(mandate.daysRemaining || 0) <= 7" [class.warning]="(mandate.daysRemaining || 0) <= 15 && (mandate.daysRemaining || 0) > 7">
                @if ((mandate.daysRemaining || 0) < 0) {
                  <i class="pi pi-exclamation-circle"></i> Expiré
                } @else {
                  <i class="pi pi-clock"></i> {{ mandate.daysRemaining }}j restants
                }
              </div>
            }

            <div class="mandate-card-footer">
              <button class="action-btn-sm"><i class="pi pi-pencil"></i></button>
              <button class="action-btn-sm"><i class="pi pi-refresh"></i></button>
              <button class="action-btn-sm danger"><i class="pi pi-times"></i></button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .mandates-page { animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem; }
    .page-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 0 0 0.2rem; }
    .page-subtitle { font-size: 0.875rem; color: #64748b; margin: 0; }
    .btn-primary { display: flex; align-items: center; gap: 0.4rem; background: #1B4F72; color: #fff; border: none; padding: 0.625rem 1.125rem; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; }
    .alert-bar { display: flex; align-items: center; gap: 0.75rem; background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.2); border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 1rem; color: #dc2626; font-size: 0.875rem; }
    .alert-bar i { flex-shrink: 0; }
    .alert-bar span { flex: 1; }
    .alert-filter-btn { background: #ef4444; color: #fff; border: none; padding: 3px 10px; border-radius: 6px; font-size: 0.78rem; cursor: pointer; font-weight: 600; }
    .status-tabs { display: flex; gap: 4px; margin-bottom: 1.25rem; border-bottom: 2px solid #f1f5f9; }
    .tab-btn { padding: 0.625rem 1rem; background: none; border: none; font-size: 0.875rem; font-weight: 500; color: #64748b; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; display: flex; align-items: center; gap: 0.4rem; transition: all 0.15s; }
    .tab-btn.active { color: #1B4F72; border-bottom-color: #1B4F72; }
    .tab-count { background: #f1f5f9; color: #64748b; font-size: 0.7rem; font-weight: 700; padding: 1px 6px; border-radius: 100px; }
    .tab-btn.active .tab-count { background: rgba(27,79,114,0.1); color: #1B4F72; }
    .mandates-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
    .mandate-card { background: #fff; border-radius: 12px; padding: 1.25rem; box-shadow: 0 1px 4px rgba(0,0,0,0.06); border-top: 3px solid #e2e8f0; transition: box-shadow 0.2s, transform 0.2s; }
    .mandate-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.1); transform: translateY(-2px); }
    .mandate-card.expiring { border-top-color: #ef4444; }
    .mandate-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .mandate-ref { font-size: 0.78rem; font-family: monospace; color: #94a3b8; }
    .mandate-type-badge { display: flex; align-items: center; gap: 0.4rem; font-size: 0.82rem; font-weight: 600; color: #1B4F72; background: rgba(27,79,114,0.08); padding: 4px 10px; border-radius: 100px; margin-bottom: 0.75rem; width: fit-content; }
    .mandate-price { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.2rem; font-weight: 800; color: #1e293b; margin-bottom: 4px; }
    .mandate-fees { font-size: 0.75rem; color: #64748b; margin-bottom: 0.875rem; }
    .mandate-dates { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; }
    .date-item { flex: 1; }
    .date-item span { display: block; font-size: 0.68rem; color: #94a3b8; }
    .date-item strong { font-size: 0.82rem; color: #374151; }
    .text-red { color: #dc2626; }
    .date-separator { color: #cbd5e1; font-size: 0.7rem; }
    .days-remaining { font-size: 0.78rem; font-weight: 600; display: flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 100px; width: fit-content; background: rgba(16,185,129,0.1); color: #059669; margin-bottom: 0.875rem; }
    .days-remaining.warning { background: rgba(245,158,11,0.12); color: #d97706; }
    .days-remaining.urgent { background: rgba(239,68,68,0.1); color: #dc2626; }
    .mandate-card-footer { display: flex; gap: 4px; padding-top: 0.75rem; border-top: 1px solid #f8fafc; }
    .action-btn-sm { width: 30px; height: 30px; border: 1.5px solid #e2e8f0; background: #fff; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.78rem; color: #64748b; transition: all 0.15s; }
    .action-btn-sm:hover { border-color: #1B4F72; color: #1B4F72; }
    .action-btn-sm.danger:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }
  `]
})
export class MandatesComponent implements OnInit {
  private readonly mandateService = inject(MandateService);
  mandates = signal<Mandate[]>([]);
  filteredMandates = signal<Mandate[]>([]);
  activeTab = 'ALL';
  expiringCount = signal(0);

  tabs = [
    { label: 'Tous', value: 'ALL' },
    { label: 'Actifs', value: 'ACTIVE' },
    { label: 'Expirés', value: 'EXPIRED' },
    { label: 'Terminés', value: 'COMPLETED' }
  ];

  ngOnInit(): void {
    this.mandateService.getAll().subscribe(m => {
      this.mandates.set(m);
      this.expiringCount.set(m.filter(x => x.isExpiringSoon && x.status === MandateStatus.ACTIVE).length);
      this.filterMandates();
    });
  }

  setTab(tab: string): void { this.activeTab = tab; this.filterMandates(); }

  filterMandates(): void {
    const all = this.mandates();
    this.filteredMandates.set(this.activeTab === 'ALL' ? all : all.filter(m => m.status === this.activeTab));
  }

  filterExpiring(): void { this.setTab('ACTIVE'); }

  getTabCount(tab: string): number {
    if (tab === 'ALL') return this.mandates().length;
    return this.mandates().filter(m => m.status === tab).length;
  }

  getMandateTypeLabel(type: string): string {
    return MANDATE_TYPE_LABELS[type as keyof typeof MANDATE_TYPE_LABELS] || type;
  }
}
