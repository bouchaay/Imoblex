import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Contact } from '../models/contact.model';
import { ContactType } from '../models/enums';
import { MOCK_CONTACTS } from '../mock/mock-data';

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

interface BackendContactResponse {
  id: string;
  salutation?: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  company?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  type: string;
  status?: string;
  assignedAgent?: { id: string; firstName: string; lastName: string; };
  notes?: string;
  source?: string;
  acceptsEmail?: boolean;
  acceptsSms?: boolean;
  interactionCount?: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/contacts';

  getAll(filters?: Partial<{ query: string; type: ContactType; page: number; pageSize: number }>): Observable<{ items: Contact[]; total: number }> {
    let params = new HttpParams()
      .set('page', Math.max(0, (filters?.page || 1) - 1).toString())
      .set('size', (filters?.pageSize || 20).toString());

    if (filters?.query) params = params.set('query', filters.query);
    if (filters?.type) params = params.set('type', filters.type);

    return this.http.get<PageResponse<BackendContactResponse>>(this.apiUrl, { params }).pipe(
      map(response => ({
        items: response.content.map(c => this.mapContact(c)),
        total: response.totalElements
      })),
      catchError(() => of({ items: MOCK_CONTACTS, total: MOCK_CONTACTS.length }))
    );
  }

  getById(id: string): Observable<Contact> {
    return this.http.get<ApiResponse<BackendContactResponse>>(`${this.apiUrl}/${id}`).pipe(
      map(r => this.mapContact(r.data)),
      catchError(() => of(MOCK_CONTACTS.find(c => c.id === id) ?? null as any))
    );
  }

  create(data: Partial<Contact>): Observable<Contact> {
    return this.http.post<ApiResponse<BackendContactResponse>>(this.apiUrl, this.mapToRequest(data)).pipe(
      map(r => this.mapContact(r.data))
    );
  }

  update(id: string, data: Partial<Contact>): Observable<Contact> {
    return this.http.put<ApiResponse<BackendContactResponse>>(`${this.apiUrl}/${id}`, this.mapToRequest(data)).pipe(
      map(r => this.mapContact(r.data))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private mapContact(c: BackendContactResponse): Contact {
    return {
      id: c.id,
      reference: `CTT-${c.id.substring(0, 8).toUpperCase()}`,
      civility: (c.salutation as 'M' | 'Mme') || undefined,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      phone: c.phone,
      mobilePhone: c.mobile,
      type: c.type as ContactType,
      types: [c.type as ContactType],
      address: c.city ? {
        city: c.city,
        postalCode: c.postalCode || '',
        country: 'France'
      } : undefined,
      company: c.company,
      agentId: c.assignedAgent?.id,
      source: c.source,
      rating: 3,
      isVip: false,
      gdprConsent: c.acceptsEmail || false,
      gdprConsentDate: c.createdAt ? new Date(c.createdAt) : undefined,
      notes: c.notes || '',
      tags: [],
      interactions: [],
      interactionCount: c.interactionCount || 0,
      lastInteractionAt: undefined,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt)
    };
  }

  private mapToRequest(data: Partial<Contact>): any {
    return {
      salutation: data.civility,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      mobile: data.mobilePhone,
      type: data.type,
      company: data.company,
      notes: data.notes,
      source: data.source,
      city: data.address?.city,
      postalCode: data.address?.postalCode,
      acceptsEmail: data.gdprConsent,
      acceptsSms: data.gdprConsent
    };
  }
}
