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
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
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
