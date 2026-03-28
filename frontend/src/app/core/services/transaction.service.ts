import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Transaction, TransactionStep } from '../models/transaction.model';
import { TransactionType, TransactionStatus } from '../models/enums';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private mockTransactions: Transaction[] = this.generateMockTransactions();

  getAll(): Observable<Transaction[]> {
    return of(this.mockTransactions).pipe(delay(300));
  }

  getById(id: string): Observable<Transaction> {
    return of(this.mockTransactions.find(t => t.id === id) || this.mockTransactions[0]).pipe(delay(200));
  }

  create(data: Partial<Transaction>): Observable<Transaction> {
    const t = { ...this.mockTransactions[0], ...data, id: 'tx_' + Date.now(), createdAt: new Date(), updatedAt: new Date() } as Transaction;
    this.mockTransactions.unshift(t);
    return of(t).pipe(delay(400));
  }

  update(id: string, data: Partial<Transaction>): Observable<Transaction> {
    const idx = this.mockTransactions.findIndex(t => t.id === id);
    if (idx >= 0) this.mockTransactions[idx] = { ...this.mockTransactions[idx], ...data };
    return of(this.mockTransactions[idx >= 0 ? idx : 0]).pipe(delay(300));
  }

  delete(id: string): Observable<void> {
    this.mockTransactions = this.mockTransactions.filter(t => t.id !== id);
    return of(undefined).pipe(delay(300));
  }

  private generateMockTransactions(): Transaction[] {
    const statuses = Object.values(TransactionStatus);
    const pipelineStatuses = [
      TransactionStatus.VISIT,
      TransactionStatus.OFFER,
      TransactionStatus.NEGOTIATION,
      TransactionStatus.COMPROMIS,
      TransactionStatus.FINANCEMENT
    ];

    return Array.from({ length: 15 }, (_, i) => {
      const status = pipelineStatuses[i % pipelineStatuses.length];
      const agreedPrice = Math.floor(Math.random() * 700000) + 150000;
      return {
        id: `tx_${i + 1}`,
        reference: `TRX-${10000 + i}`,
        type: i % 4 === 0 ? TransactionType.RENTAL : TransactionType.SALE,
        status,
        propertyId: `prop_${i + 1}`,
        buyerId: `contact_${i + 1}`,
        sellerId: `contact_${i + 5}`,
        agentId: '1',
        offerPrice: agreedPrice - 10000,
        agreedPrice,
        agencyFees: Math.round(agreedPrice * 0.04),
        notaryFees: Math.round(agreedPrice * 0.075),
        steps: this.buildSteps(status, i),
        offerDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        notes: '',
        commissionAmount: Math.round(agreedPrice * 0.04),
        commissionPercent: 4,
        isCommissionPaid: status === TransactionStatus.COMPLETED,
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      };
    });
  }

  private buildSteps(currentStatus: TransactionStatus, seed: number): TransactionStep[] {
    const pipeline = [
      TransactionStatus.VISIT,
      TransactionStatus.OFFER,
      TransactionStatus.NEGOTIATION,
      TransactionStatus.COMPROMIS,
      TransactionStatus.FINANCEMENT,
      TransactionStatus.ACTE
    ];
    const currentIdx = pipeline.indexOf(currentStatus);
    return pipeline.map((s, i) => ({
      id: `step_${seed}_${i}`,
      transactionId: `tx_${seed + 1}`,
      status: s,
      label: s,
      isCompleted: i < currentIdx,
      isCurrent: i === currentIdx,
      completedAt: i < currentIdx ? new Date(Date.now() - (currentIdx - i) * 7 * 24 * 60 * 60 * 1000) : undefined
    }));
  }
}
