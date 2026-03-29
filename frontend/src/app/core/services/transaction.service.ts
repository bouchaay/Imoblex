import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Transaction, TransactionStep } from '../models/transaction.model';
import { TransactionType, TransactionStatus } from '../models/enums';
import { MOCK_TRANSACTIONS } from '../mock/mock-data';

interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface BackendTransactionResponse {
  id: string;
  propertyId?: string;
  propertyReference?: string;
  propertyAddress?: string;
  mandateId?: string;
  buyerId?: string;
  buyerName?: string;
  sellerId?: string;
  sellerName?: string;
  agentId?: string;
  agentName?: string;
  status: string;
  offerPrice?: number;
  agreedPrice?: number;
  agencyFees?: number;
  netSellerPrice?: number;
  offerDate?: string;
  acceptanceDate?: string;
  compromisDate?: string;
  acteDate?: string;
  completionDate?: string;
  notaryBuyer?: string;
  notarySeller?: string;
  notaryOffice?: string;
  loanCondition?: boolean;
  loanAmount?: number;
  loanDurationMonths?: number;
  loanRate?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/transactions';

  private readonly PIPELINE = [
    TransactionStatus.VISIT,
    TransactionStatus.OFFER,
    TransactionStatus.NEGOTIATION,
    TransactionStatus.COMPROMIS,
    TransactionStatus.FINANCEMENT,
    TransactionStatus.ACTE
  ];

  getAll(): Observable<Transaction[]> {
    const params = new HttpParams().set('page', '0').set('size', '100');
    return this.http.get<PageResponse<BackendTransactionResponse>>(this.apiUrl, { params }).pipe(
      map(r => r.content.length > 0 ? r.content.map(t => this.mapTransaction(t)) : MOCK_TRANSACTIONS),
      catchError(() => of(MOCK_TRANSACTIONS))
    );
  }

  getById(id: string): Observable<Transaction> {
    return this.http.get<ApiResponse<BackendTransactionResponse>>(`${this.apiUrl}/${id}`).pipe(
      map(r => this.mapTransaction(r.data)),
      catchError(() => of(MOCK_TRANSACTIONS.find(t => t.id === id) ?? null as any))
    );
  }

  create(data: Partial<Transaction>): Observable<Transaction> {
    return this.http.post<ApiResponse<BackendTransactionResponse>>(this.apiUrl, data).pipe(
      map(r => this.mapTransaction(r.data))
    );
  }

  update(id: string, data: Partial<Transaction>): Observable<Transaction> {
    return this.http.put<ApiResponse<BackendTransactionResponse>>(`${this.apiUrl}/${id}`, data).pipe(
      map(r => this.mapTransaction(r.data))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private mapTransaction(t: BackendTransactionResponse): Transaction {
    const currentIdx = this.PIPELINE.indexOf(t.status as TransactionStatus);
    const steps: TransactionStep[] = this.PIPELINE.map((s, i) => ({
      id: `step_${t.id}_${i}`,
      transactionId: t.id,
      status: s,
      label: s,
      isCompleted: i < currentIdx,
      isCurrent: i === currentIdx,
      completedAt: i < currentIdx
        ? new Date(Date.now() - (currentIdx - i) * 7 * 24 * 60 * 60 * 1000)
        : undefined
    }));

    return {
      id: t.id,
      reference: `TRX-${t.id.substring(0, 8).toUpperCase()}`,
      type: TransactionType.SALE,
      status: t.status as TransactionStatus,
      propertyId: t.propertyId || '',
      buyerId: t.buyerId,
      sellerId: t.sellerId,
      agentId: t.agentId || '',
      offerPrice: t.offerPrice,
      agreedPrice: t.agreedPrice || 0,
      agencyFees: t.agencyFees,
      notaryFees: t.agreedPrice ? Math.round(t.agreedPrice * 0.075) : undefined,
      steps,
      offerDate: t.offerDate ? new Date(t.offerDate) : undefined,
      compromisDate: t.compromisDate ? new Date(t.compromisDate) : undefined,
      actDate: t.acteDate ? new Date(t.acteDate) : undefined,
      notes: t.notes || '',
      commissionAmount: t.agencyFees,
      commissionPercent: t.agreedPrice && t.agencyFees
        ? Math.round((t.agencyFees / t.agreedPrice) * 100)
        : 4,
      isCommissionPaid: t.status === TransactionStatus.COMPLETED,
      createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
      updatedAt: t.updatedAt ? new Date(t.updatedAt) : new Date()
    };
  }
}
