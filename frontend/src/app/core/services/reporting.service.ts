import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  totalProperties: number;
  activeMandates: number;
  expiringMandates: number;
  transactionsInProgress: number;
  revenueTotal: number;
  totalContacts: number;
  unreadLeads: number;
  expiringMandatesList: { id: string; reference: string; address: string; endDate: string; daysLeft: number }[];
}

export interface ReportingStats {
  totalProperties: number;
  transactionsCompleted: number;
  revenueTotal: number;
  totalContacts: number;
  monthlyRevenue: number[];
  propertyTypes: { type: string; count: number }[];
  contactTypes: { type: string; count: number }[];
  agentPerformance: {
    agentId: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    transactionCount: number;
    revenue: number;
  }[];
}

@Injectable({ providedIn: 'root' })
export class ReportingService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/stats`;

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard`).pipe(
      catchError(() => of({
        totalProperties: 0, activeMandates: 0, expiringMandates: 0,
        transactionsInProgress: 0, revenueTotal: 0, totalContacts: 0,
        unreadLeads: 0, expiringMandatesList: []
      }))
    );
  }

  getReportingStats(): Observable<ReportingStats> {
    return this.http.get<ReportingStats>(`${this.apiUrl}/reporting`).pipe(
      catchError(() => of({
        totalProperties: 0, transactionsCompleted: 0, revenueTotal: 0,
        totalContacts: 0, monthlyRevenue: new Array(12).fill(0),
        propertyTypes: [], contactTypes: [], agentPerformance: []
      }))
    );
  }
}
