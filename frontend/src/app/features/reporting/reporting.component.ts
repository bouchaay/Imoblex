import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportingService, ReportingStats } from '../../core/services/reporting.service';

const MONTH_LABELS = ['J','F','M','A','M','J','J','A','S','O','N','D'];

const TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'Appartements', HOUSE: 'Maisons', VILLA: 'Villas',
  STUDIO: 'Studios', LOFT: 'Lofts', LAND: 'Terrains',
  COMMERCIAL: 'Commercial', GARAGE: 'Garages', OTHER: 'Autres'
};

const TYPE_COLORS: string[] = [
  '#1B4F72','#2E86C1','#F39C12','#27AE60','#8E44AD','#E74C3C','#16A085','#D35400','#7F8C8D'
];

const CONTACT_LABELS: Record<string, string> = {
  BUYER: 'Acheteurs', SELLER: 'Vendeurs', TENANT: 'Locataires',
  LANDLORD: 'Propriétaires', PROSPECT: 'Prospects', OTHER: 'Autres'
};

const CONTACT_COLORS: string[] = [
  '#1B4F72','#F39C12','#8b5cf6','#10b981','#64748b','#E74C3C'
];

const AGENT_COLORS: string[] = [
  '#1B4F72','#F39C12','#10b981','#8b5cf6','#E74C3C','#2E86C1','#27AE60'
];

@Component({
  selector: 'app-reporting',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reporting.component.html',
  styleUrls: ['./reporting.component.scss']
})
export class ReportingComponent implements OnInit {
  private readonly reportingService = inject(ReportingService);

  loading = signal(true);
  private _stats = signal<ReportingStats | null>(null);

  ngOnInit(): void {
    this.reportingService.getReportingStats().subscribe(s => {
      this._stats.set(s);
      this.loading.set(false);
    });
  }

  get kpis() {
    const s = this._stats();
    return [
      {
        icon: 'pi-euro',
        label: 'CA total',
        value: this.formatPrice(s?.revenueTotal ?? 0),
        color: '#10b981'
      },
      {
        icon: 'pi-check-circle',
        label: 'Transactions conclues',
        value: String(s?.transactionsCompleted ?? 0),
        color: '#1B4F72'
      },
      {
        icon: 'pi-users',
        label: 'Contacts',
        value: String(s?.totalContacts ?? 0),
        color: '#F39C12'
      },
      {
        icon: 'pi-building',
        label: 'Biens en stock',
        value: String(s?.totalProperties ?? 0),
        color: '#8b5cf6'
      }
    ];
  }

  get monthlyRevenue() {
    const raw = this._stats()?.monthlyRevenue ?? new Array(12).fill(0);
    return MONTH_LABELS.map((label, i) => ({ label, amount: raw[i] ?? 0 }));
  }

  get maxRevenue(): number {
    const vals = this.monthlyRevenue.map(m => m.amount);
    return Math.max(...vals, 1);
  }

  get propertyTypeData() {
    const items = this._stats()?.propertyTypes ?? [];
    return items.map((item, i) => ({
      label: TYPE_LABELS[item.type] ?? item.type,
      count: item.count,
      color: TYPE_COLORS[i % TYPE_COLORS.length]
    }));
  }

  get totalProperties(): number {
    return this._stats()?.totalProperties ?? 0;
  }

  get donutGradient(): string {
    const items = this.propertyTypeData;
    if (!items.length) return 'conic-gradient(#e2e8f0 0% 100%)';
    const total = items.reduce((s, i) => s + i.count, 0);
    if (!total) return 'conic-gradient(#e2e8f0 0% 100%)';
    let cumulative = 0;
    const stops = items.map(item => {
      const pct = (item.count / total) * 100;
      const start = cumulative;
      cumulative += pct;
      return `${item.color} ${start.toFixed(1)}% ${cumulative.toFixed(1)}%`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  }

  get contactTypeData() {
    const items = this._stats()?.contactTypes ?? [];
    return items.map((item, i) => ({
      label: CONTACT_LABELS[item.type] ?? item.type,
      count: item.count,
      color: CONTACT_COLORS[i % CONTACT_COLORS.length]
    }));
  }

  get maxContactCount(): number {
    return Math.max(...this.contactTypeData.map(c => c.count), 1);
  }

  get agentPerformance() {
    const items = this._stats()?.agentPerformance ?? [];
    const maxRev = Math.max(...items.map(a => a.revenue), 1);
    return items.map((a, i) => ({
      name: `${a.firstName} ${a.lastName}`.trim(),
      initials: ((a.firstName?.[0] ?? '') + (a.lastName?.[0] ?? '')).toUpperCase(),
      avatarUrl: a.avatarUrl,
      color: AGENT_COLORS[i % AGENT_COLORS.length],
      transactions: a.transactionCount,
      revenue: a.revenue,
      barPct: (a.revenue / maxRev) * 100
    }));
  }

  formatPrice(value: number): string {
    if (!value) return '0 €';
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1).replace('.', ',') + ' M€';
    if (value >= 1_000) return Math.round(value / 1_000) + ' k€';
    return value.toLocaleString('fr-FR') + ' €';
  }
}
