import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Mandate } from '../models/mandate.model';
import { MandateType, MandateStatus, TransactionType } from '../models/enums';

@Injectable({ providedIn: 'root' })
export class MandateService {
  private mockMandates: Mandate[] = this.generateMockMandates();

  getAll(): Observable<Mandate[]> {
    return of(this.mockMandates).pipe(delay(300));
  }

  getById(id: string): Observable<Mandate> {
    return of(this.mockMandates.find(m => m.id === id) || this.mockMandates[0]).pipe(delay(200));
  }

  create(data: Partial<Mandate>): Observable<Mandate> {
    const mandate = { ...this.mockMandates[0], ...data, id: 'mandate_' + Date.now(), createdAt: new Date(), updatedAt: new Date() } as Mandate;
    this.mockMandates.unshift(mandate);
    return of(mandate).pipe(delay(400));
  }

  update(id: string, data: Partial<Mandate>): Observable<Mandate> {
    const idx = this.mockMandates.findIndex(m => m.id === id);
    if (idx >= 0) this.mockMandates[idx] = { ...this.mockMandates[idx], ...data, updatedAt: new Date() };
    return of(this.mockMandates[idx >= 0 ? idx : 0]).pipe(delay(300));
  }

  delete(id: string): Observable<void> {
    this.mockMandates = this.mockMandates.filter(m => m.id !== id);
    return of(undefined).pipe(delay(300));
  }

  getExpiringMandates(days = 30): Observable<Mandate[]> {
    const now = new Date();
    const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return of(this.mockMandates.filter(m =>
      m.status === MandateStatus.ACTIVE && new Date(m.endDate) <= cutoff
    )).pipe(delay(200));
  }

  private generateMockMandates(): Mandate[] {
    const types = [MandateType.EXCLUSIVE, MandateType.SIMPLE, MandateType.SEMI_EXCLUSIVE];
    const statuses = [MandateStatus.ACTIVE, MandateStatus.ACTIVE, MandateStatus.ACTIVE, MandateStatus.EXPIRED, MandateStatus.COMPLETED];
    return Array.from({ length: 20 }, (_, i) => {
      const startDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + (Math.random() * 60 + 30) * 24 * 60 * 60 * 1000);
      const daysRemaining = Math.round((endDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
      const status = statuses[i % statuses.length];
      return {
        id: `mandate_${i + 1}`,
        reference: `MND-${10000 + i}`,
        type: types[i % types.length],
        status,
        transactionType: i % 3 === 0 ? TransactionType.RENTAL : TransactionType.SALE,
        propertyId: `prop_${i + 1}`,
        mandatorId: `contact_${i + 1}`,
        agentId: '1',
        price: Math.floor(Math.random() * 800000) + 150000,
        agencyFeePercent: [3, 4, 5, 6][i % 4],
        agencyFeeAmount: 0,
        startDate,
        endDate,
        signedAt: startDate,
        isRenewable: Math.random() > 0.4,
        renewalCount: Math.floor(Math.random() * 3),
        daysRemaining,
        isExpiringSoon: daysRemaining > 0 && daysRemaining <= 15,
        createdAt: startDate,
        updatedAt: new Date()
      };
    });
  }
}
