import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

export type LeadStatus = 'UNREAD' | 'READ' | 'ARCHIVED';

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message?: string;
  propertyReference?: string;
  source: string;
  formType: string;
  status: LeadStatus;
  archived: boolean;
  gdprConsent: boolean;
  readAt?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class LeadService {
  private readonly http = inject(HttpClient);
  private readonly _change = new Subject<void>();
  readonly change$ = this._change.asObservable();

  getActive(): Observable<Lead[]> {
    return this.http.get<Lead[]>('/api/leads');
  }

  getArchived(): Observable<Lead[]> {
    return this.http.get<Lead[]>('/api/leads/archives');
  }

  countUnread(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>('/api/leads/count-unread');
  }

  markRead(id: string): Observable<Lead> {
    return this.http.patch<Lead>(`/api/leads/${id}/read`, {});
  }

  archive(id: string): Observable<Lead> {
    return this.http.patch<Lead>(`/api/leads/${id}/archive`, {});
  }

  unarchive(id: string): Observable<Lead> {
    return this.http.patch<Lead>(`/api/leads/${id}/unarchive`, {});
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/leads/${id}`);
  }

  notifyChange(): void { this._change.next(); }
}
