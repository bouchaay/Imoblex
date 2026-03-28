import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyStatus, MandateStatus, TransactionStatus, PROPERTY_STATUS_LABELS, TRANSACTION_STATUS_LABELS } from '../../core/models/enums';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge" [style]="getBadgeStyle()">
      <span class="status-dot"></span>
      {{ getLabel() }}
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 10px;
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
    }
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }
  `]
})
export class StatusBadgeComponent {
  @Input() status!: PropertyStatus | MandateStatus | TransactionStatus | string;
  @Input() type: 'property' | 'mandate' | 'transaction' = 'property';

  getLabel(): string {
    if (this.type === 'property') {
      return PROPERTY_STATUS_LABELS[this.status as PropertyStatus] || this.status;
    }
    if (this.type === 'transaction') {
      return TRANSACTION_STATUS_LABELS[this.status as TransactionStatus] || this.status;
    }
    const mandateLabels: Record<string, string> = {
      ACTIVE: 'Actif', EXPIRED: 'Expiré', CANCELLED: 'Annulé',
      SUSPENDED: 'Suspendu', COMPLETED: 'Terminé'
    };
    return mandateLabels[this.status] || this.status;
  }

  getBadgeStyle(): string {
    const configs: Record<string, { bg: string; color: string }> = {
      AVAILABLE: { bg: 'rgba(16,185,129,0.12)', color: '#059669' },
      UNDER_OFFER: { bg: 'rgba(245,158,11,0.12)', color: '#d97706' },
      SOLD: { bg: 'rgba(239,68,68,0.12)', color: '#dc2626' },
      RENTED: { bg: 'rgba(139,92,246,0.12)', color: '#7c3aed' },
      OFF_MARKET: { bg: 'rgba(107,114,128,0.12)', color: '#4b5563' },
      DRAFT: { bg: 'rgba(156,163,175,0.12)', color: '#6b7280' },
      ACTIVE: { bg: 'rgba(16,185,129,0.12)', color: '#059669' },
      EXPIRED: { bg: 'rgba(239,68,68,0.12)', color: '#dc2626' },
      CANCELLED: { bg: 'rgba(107,114,128,0.12)', color: '#4b5563' },
      COMPLETED: { bg: 'rgba(59,130,246,0.12)', color: '#2563eb' },
      COMPROMIS: { bg: 'rgba(245,158,11,0.12)', color: '#d97706' },
      FINANCEMENT: { bg: 'rgba(59,130,246,0.12)', color: '#2563eb' },
      VISIT: { bg: 'rgba(16,185,129,0.12)', color: '#059669' },
      OFFER: { bg: 'rgba(243,156,18,0.12)', color: '#d97706' },
      NEGOTIATION: { bg: 'rgba(239,68,68,0.12)', color: '#dc2626' },
      ACTE: { bg: 'rgba(16,185,129,0.18)', color: '#047857' }
    };
    const cfg = configs[this.status] || { bg: 'rgba(107,114,128,0.1)', color: '#4b5563' };
    return `background: ${cfg.bg}; color: ${cfg.color};`;
  }
}
