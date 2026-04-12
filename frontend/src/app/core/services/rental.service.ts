import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { RentalLease, RentalPayment, RentalLeaseRequest, RentalPaymentRequest } from '../models/rental.model';

@Injectable({ providedIn: 'root' })
export class RentalService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/rental`;

  private readonly _change$ = new Subject<void>();
  readonly change$ = this._change$.asObservable();

  getAllLeases(status?: string): Observable<RentalLease[]> {
    const url = status ? `${this.base}/leases?status=${status}` : `${this.base}/leases`;
    return this.http.get<RentalLease[]>(url);
  }

  getLeaseById(id: string): Observable<RentalLease> {
    return this.http.get<RentalLease>(`${this.base}/leases/${id}`);
  }

  getLeasesByTenant(tenantId: string): Observable<RentalLease[]> {
    return this.http.get<RentalLease[]>(`${this.base}/leases/by-tenant/${tenantId}`);
  }

  getLeasesByProperty(propertyId: string): Observable<RentalLease[]> {
    return this.http.get<RentalLease[]>(`${this.base}/leases/by-property/${propertyId}`);
  }

  createLease(req: RentalLeaseRequest): Observable<RentalLease> {
    return this.http.post<RentalLease>(`${this.base}/leases`, req).pipe(
      map(res => { this._change$.next(); return res; })
    );
  }

  updateLease(id: string, req: RentalLeaseRequest): Observable<RentalLease> {
    return this.http.put<RentalLease>(`${this.base}/leases/${id}`, req).pipe(
      map(res => { this._change$.next(); return res; })
    );
  }

  terminateLease(id: string): Observable<RentalLease> {
    return this.http.patch<RentalLease>(`${this.base}/leases/${id}/terminate`, {}).pipe(
      map(res => { this._change$.next(); return res; })
    );
  }

  getPayments(leaseId: string): Observable<RentalPayment[]> {
    return this.http.get<RentalPayment[]>(`${this.base}/leases/${leaseId}/payments`);
  }

  addPayment(leaseId: string, req: RentalPaymentRequest): Observable<RentalPayment> {
    return this.http.post<RentalPayment>(`${this.base}/leases/${leaseId}/payments`, req).pipe(
      map(res => { this._change$.next(); return res; })
    );
  }

  updatePayment(paymentId: string, req: RentalPaymentRequest): Observable<RentalPayment> {
    return this.http.put<RentalPayment>(`${this.base}/payments/${paymentId}`, req).pipe(
      map(res => { this._change$.next(); return res; })
    );
  }

  deletePayment(paymentId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/payments/${paymentId}`).pipe(
      map(() => { this._change$.next(); })
    );
  }

  generateQuittance(paymentId: string): Observable<RentalPayment> {
    return this.http.patch<RentalPayment>(`${this.base}/payments/${paymentId}/quittance`, {});
  }
}
