import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Mandate } from '../models/mandate.model';
import { MandateType, MandateStatus, TransactionType } from '../models/enums';
import { MOCK_MANDATES } from '../mock/mock-data';

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

interface BackendMandateResponse {
  id: string;
  mandateNumber: string;
  type: string;
  status: string;
  propertyId?: string;
  propertyReference?: string;
  propertyAddress?: string;
  mandatorId?: string;
  mandatorName?: string;
  agentId?: string;
  agentName?: string;
  agreedPrice?: number;
  agencyFees?: number;
  agencyFeesPercent?: number;
  feesChargedTo?: string;
  startDate?: string;
  endDate?: string;
  renewalDate?: string;
  signedAt?: string;
  signedAtPlace?: string;
  notes?: string;
  expired?: boolean;
  expiringSoon?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class MandateService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/mandates';

  getAll(): Observable<Mandate[]> {
    const params = new HttpParams()
      .set('page', '0')
      .set('size', '100')
      .set('sortBy', 'createdAt')
      .set('sortDir', 'DESC');
    return this.http.get<PageResponse<BackendMandateResponse>>(this.apiUrl, { params }).pipe(
      map(r => r.content.length > 0 ? r.content.map(m => this.mapMandate(m)) : MOCK_MANDATES),
      catchError(() => of(MOCK_MANDATES))
    );
  }

  getById(id: string): Observable<Mandate> {
    return this.http.get<ApiResponse<BackendMandateResponse>>(`${this.apiUrl}/${id}`).pipe(
      map(r => this.mapMandate(r.data)),
      catchError(() => of(MOCK_MANDATES.find(m => m.id === id) ?? null as any))
    );
  }

  create(data: Partial<Mandate>): Observable<Mandate> {
    return this.http.post<ApiResponse<BackendMandateResponse>>(this.apiUrl, this.mapToRequest(data)).pipe(
      map(r => this.mapMandate(r.data))
    );
  }

  update(id: string, data: Partial<Mandate>): Observable<Mandate> {
    return this.http.put<ApiResponse<BackendMandateResponse>>(`${this.apiUrl}/${id}`, this.mapToRequest(data)).pipe(
      map(r => this.mapMandate(r.data))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getExpiringMandates(days = 30): Observable<Mandate[]> {
    return this.http.get<ApiResponse<BackendMandateResponse[]>>(`${this.apiUrl}/expiring`, {
      params: new HttpParams().set('days', days.toString())
    }).pipe(
      map(r => r.data.map(m => this.mapMandate(m))),
      catchError(() => of(MOCK_MANDATES.filter(m => m.isExpiringSoon)))
    );
  }

  private mapMandate(m: BackendMandateResponse): Mandate {
    const endDate = m.endDate ? new Date(m.endDate) : new Date();
    const daysRemaining = Math.round((endDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
    return {
      id: m.id,
      reference: m.mandateNumber || `MND-${m.id.substring(0, 8).toUpperCase()}`,
      type: m.type as MandateType,
      status: m.status as MandateStatus,
      transactionType: TransactionType.SALE,
      propertyId: m.propertyId || '',
      mandatorId: m.mandatorId || '',
      agentId: m.agentId || '',
      price: m.agreedPrice || 0,
      agencyFeePercent: m.agencyFeesPercent || 0,
      agencyFeeAmount: m.agencyFees || 0,
      startDate: m.startDate ? new Date(m.startDate) : new Date(),
      endDate,
      signedAt: m.signedAt ? new Date(m.signedAt) : undefined,
      isRenewable: true,
      renewalCount: 0,
      daysRemaining,
      isExpiringSoon: m.expiringSoon || (daysRemaining > 0 && daysRemaining <= 15),
      createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
      updatedAt: m.updatedAt ? new Date(m.updatedAt) : new Date()
    };
  }

  private mapToRequest(data: Partial<Mandate>): any {
    return {
      type: data.type,
      propertyId: data.propertyId || undefined,
      mandatorId: data.mandatorId || undefined,
      agentId: data.agentId || undefined,
      agreedPrice: data.price,
      agencyFeesPercent: data.agencyFeePercent,
      startDate: data.startDate instanceof Date
        ? (data.startDate as Date).toISOString().split('T')[0]
        : data.startDate,
      endDate: data.endDate instanceof Date
        ? (data.endDate as Date).toISOString().split('T')[0]
        : data.endDate,
      notes: (data as any).notes
    };
  }
}
