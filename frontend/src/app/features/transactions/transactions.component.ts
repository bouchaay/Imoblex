import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TransactionService } from '../../core/services/transaction.service';
import { Transaction } from '../../core/models/transaction.model';
import { TransactionStatus, TRANSACTION_STATUS_LABELS } from '../../core/models/enums';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { PriceFormatterPipe } from '../../shared/pipes/price-formatter.pipe';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusBadgeComponent, PriceFormatterPipe],
  template: `
    <div class="transactions-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Transactions</h1>
          <p class="page-subtitle">{{ transactions().length }} transactions en cours</p>
        </div>
        <button class="btn-primary"><i class="pi pi-plus"></i> Nouvelle transaction</button>
      </div>

      <!-- Pipeline Kanban -->
      <div class="pipeline-board">
        @for (stage of pipelineStages; track stage.status) {
          <div class="pipeline-col">
            <div class="col-header" [style.border-top-color]="stage.color">
              <span class="col-title">{{ stage.label }}</span>
              <span class="col-count">{{ getStageTransactions(stage.status).length }}</span>
            </div>
            <div class="col-body">
              @for (tx of getStageTransactions(stage.status); track tx.id) {
                <div class="tx-card">
                  <div class="tx-ref">{{ tx.reference }}</div>
                  <div class="tx-price">{{ tx.agreedPrice | priceFormatter }}</div>
                  <div class="tx-commission">Commission: {{ tx.commissionAmount | priceFormatter }}</div>
                  <div class="tx-progress">
                    <div class="progress-bar" [style.width.%]="getProgress(tx.status)" [style.background]="stage.color"></div>
                  </div>
                  <div class="tx-actions">
                    <button class="tx-action-btn"><i class="pi pi-eye"></i></button>
                    <button class="tx-action-btn"><i class="pi pi-arrow-right"></i></button>
                  </div>
                </div>
              }
              @if (getStageTransactions(stage.status).length === 0) {
                <div class="col-empty"><i class="pi pi-inbox"></i></div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .transactions-page { animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .page-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 0 0 0.2rem; }
    .page-subtitle { font-size: 0.875rem; color: #64748b; margin: 0; }
    .btn-primary { display: flex; align-items: center; gap: 0.4rem; background: #1B4F72; color: #fff; border: none; padding: 0.625rem 1.125rem; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; }
    .pipeline-board { display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 1rem; }
    .pipeline-col { min-width: 220px; width: 220px; flex-shrink: 0; }
    .col-header { background: #fff; border-radius: 10px 10px 0 0; padding: 0.875rem 1rem; display: flex; justify-content: space-between; align-items: center; border-top: 3px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
    .col-title { font-size: 0.82rem; font-weight: 700; color: #374151; }
    .col-count { background: #f1f5f9; color: #64748b; font-size: 0.7rem; font-weight: 700; padding: 1px 8px; border-radius: 100px; }
    .col-body { background: #f8fafc; border-radius: 0 0 10px 10px; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.625rem; min-height: 300px; }
    .tx-card { background: #fff; border-radius: 8px; padding: 0.875rem; box-shadow: 0 1px 3px rgba(0,0,0,0.06); cursor: pointer; transition: box-shadow 0.2s; }
    .tx-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .tx-ref { font-size: 0.7rem; font-family: monospace; color: #94a3b8; margin-bottom: 4px; }
    .tx-price { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1rem; font-weight: 800; color: #1B4F72; }
    .tx-commission { font-size: 0.72rem; color: #64748b; margin-bottom: 0.625rem; }
    .tx-progress { height: 3px; background: #f1f5f9; border-radius: 2px; overflow: hidden; margin-bottom: 0.625rem; }
    .progress-bar { height: 100%; border-radius: 2px; transition: width 0.5s ease; }
    .tx-actions { display: flex; gap: 4px; justify-content: flex-end; }
    .tx-action-btn { width: 26px; height: 26px; border: 1px solid #e2e8f0; background: #fff; border-radius: 5px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; color: #64748b; }
    .tx-action-btn:hover { border-color: #1B4F72; color: #1B4F72; }
    .col-empty { display: flex; align-items: center; justify-content: center; height: 80px; color: #cbd5e1; font-size: 1.25rem; }
  `]
})
export class TransactionsComponent implements OnInit {
  private readonly txService = inject(TransactionService);
  transactions = signal<Transaction[]>([]);

  pipelineStages = [
    { status: TransactionStatus.VISIT, label: 'Visite', color: '#1B4F72' },
    { status: TransactionStatus.OFFER, label: 'Offre', color: '#F39C12' },
    { status: TransactionStatus.NEGOTIATION, label: 'Négociation', color: '#ef4444' },
    { status: TransactionStatus.COMPROMIS, label: 'Compromis', color: '#8b5cf6' },
    { status: TransactionStatus.FINANCEMENT, label: 'Financement', color: '#3b82f6' },
    { status: TransactionStatus.ACTE, label: 'Acte', color: '#10b981' }
  ];

  ngOnInit(): void {
    this.txService.getAll().subscribe(txs => this.transactions.set(txs));
  }

  getStageTransactions(status: TransactionStatus): Transaction[] {
    return this.transactions().filter(t => t.status === status);
  }

  getProgress(status: TransactionStatus): number {
    const prog: Record<string, number> = {
      [TransactionStatus.VISIT]: 15, [TransactionStatus.OFFER]: 30,
      [TransactionStatus.NEGOTIATION]: 45, [TransactionStatus.COMPROMIS]: 60,
      [TransactionStatus.FINANCEMENT]: 75, [TransactionStatus.ACTE]: 90,
      [TransactionStatus.COMPLETED]: 100
    };
    return prog[status] || 0;
  }
}
