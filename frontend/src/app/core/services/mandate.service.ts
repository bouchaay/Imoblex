import { environment } from '../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Mandate } from '../models/mandate.model';
import { MandateCategory, MandateType, MandateStatus, TransactionType } from '../models/enums';

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
  category?: string;
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
  agencyFeesText?: string;
  feesChargedTo?: string;
  maxDurationYears?: number;
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
  private readonly apiUrl = `${environment.apiUrl}/mandates`;

  private readonly _change$ = new Subject<void>();
  readonly change$ = this._change$.asObservable();
  notifyChange(): void { this._change$.next(); }

  getAll(): Observable<Mandate[]> {
    const params = new HttpParams()
      .set('page', '0')
      .set('size', '100')
      .set('sortBy', 'createdAt')
      .set('sortDir', 'DESC');
    return this.http.get<PageResponse<BackendMandateResponse>>(this.apiUrl, { params }).pipe(
      map(r => r.content.map(m => this.mapMandate(m))),
      catchError(() => of([]))
    );
  }

  getCount(): Observable<number> {
    const params = new HttpParams().set('page', '0').set('size', '1');
    return this.http.get<PageResponse<BackendMandateResponse>>(this.apiUrl, { params }).pipe(
      map(r => r.totalElements),
      catchError(() => of(0))
    );
  }

  getById(id: string): Observable<Mandate> {
    return this.http.get<ApiResponse<BackendMandateResponse>>(`${this.apiUrl}/${id}`).pipe(
      map(r => this.mapMandate(r.data))
    );
  }

  create(data: Partial<Mandate> & { notes?: string; signedAtPlace?: string }): Observable<Mandate> {
    return this.http.post<ApiResponse<BackendMandateResponse>>(this.apiUrl, this.mapToRequest(data)).pipe(
      map(r => this.mapMandate(r.data))
    );
  }

  update(id: string, data: Partial<Mandate> & { notes?: string; signedAtPlace?: string }): Observable<Mandate> {
    return this.http.put<ApiResponse<BackendMandateResponse>>(`${this.apiUrl}/${id}`, this.mapToRequest(data)).pipe(
      map(r => this.mapMandate(r.data))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  downloadDocument(id: string, signed = true, remiseDate?: string, blank = false): Observable<Blob> {
    const params: Record<string, string> = { signed: signed.toString(), blank: blank.toString() };
    if (remiseDate) params['remiseDate'] = remiseDate;
    return this.http.get(`${this.apiUrl}/${id}/document`, { params, responseType: 'blob' });
  }

  getExpiringMandates(days = 30): Observable<Mandate[]> {
    return this.http.get<ApiResponse<BackendMandateResponse[]>>(`${this.apiUrl}/expiring`, {
      params: new HttpParams().set('days', days.toString())
    }).pipe(
      map(r => r.data.map(m => this.mapMandate(m))),
      catchError(() => of([]))
    );
  }

  private mapMandate(m: BackendMandateResponse): Mandate {
    const endDate = m.endDate ? new Date(m.endDate) : new Date();
    const daysRemaining = Math.round((endDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
    return {
      id: m.id,
      reference: m.mandateNumber || `MND-${m.id.substring(0, 8).toUpperCase()}`,
      category: (m.category as MandateCategory) || MandateCategory.GERANCE,
      type: m.type as MandateType,
      status: m.status as MandateStatus,
      transactionType: TransactionType.RENTAL, // défini par le bien lié
      propertyId: m.propertyId || '',
      propertyReference: m.propertyReference,
      propertyAddress: m.propertyAddress,
      mandatorId: m.mandatorId || '',
      mandatorName: m.mandatorName,
      agentId: m.agentId || '',
      agentName: m.agentName,
      price: m.agreedPrice || 0,
      agencyFeePercent: m.agencyFeesPercent || 0,
      agencyFeeAmount: m.agencyFees || 0,
      agencyFeesText: m.agencyFeesText,
      startDate: m.startDate ? new Date(m.startDate) : new Date(),
      endDate,
      renewalDate: m.renewalDate ? new Date(m.renewalDate) : undefined,
      signedAt: m.signedAt ? new Date(m.signedAt) : undefined,
      signedAtPlace: m.signedAtPlace,
      notes: m.notes,
      maxDurationYears: m.maxDurationYears,
      isRenewable: true,
      renewalCount: 0,
      daysRemaining,
      isExpiringSoon: m.expiringSoon || (daysRemaining > 0 && daysRemaining <= 15),
      createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
      updatedAt: m.updatedAt ? new Date(m.updatedAt) : new Date()
    };
  }

  private mapToRequest(data: Partial<Mandate> & { notes?: string; signedAtPlace?: string; maxDurationYears?: number }): any {
    return {
      category: data.category,
      type: data.type,
      status: data.status,
      propertyId: data.propertyId || undefined,
      mandatorId: data.mandatorId || undefined,
      agentId: data.agentId || undefined,
      agreedPrice: data.price,
      agencyFeesPercent: (data as any).feeType === 'percent' ? (data as any).agencyFeesPercentInput : undefined,
      agencyFees: (data as any).feeType === 'amount' ? (data as any).agencyFeesAmountInput : undefined,
      agencyFeesText: (data as any).feeType === 'text' ? (data as any).agencyFeesTextInput : undefined,
      startDate: data.startDate instanceof Date
        ? (data.startDate as Date).toISOString().split('T')[0]
        : data.startDate,
      endDate: data.endDate instanceof Date
        ? (data.endDate as Date).toISOString().split('T')[0]
        : data.endDate,
      renewalDate: data.renewalDate instanceof Date
        ? (data.renewalDate as Date).toISOString().split('T')[0]
        : data.renewalDate,
      maxDurationYears: data.maxDurationYears,
      notes: data.notes,
      signedAtPlace: data.signedAtPlace
    };
  }
}
