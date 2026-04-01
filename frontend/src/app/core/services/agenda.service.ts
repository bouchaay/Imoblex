import { environment } from '../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Appointment } from '../models/appointment.model';
import { AppointmentType } from '../models/enums';

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

interface BackendAppointmentResponse {
  id: string;
  title: string;
  description?: string;
  type: string;
  startAt: string;
  endAt: string;
  agentId?: string;
  agentName?: string;
  contactId?: string;
  contactName?: string;
  propertyId?: string;
  propertyReference?: string;
  location?: string;
  confirmed?: boolean;
  reminderSent?: boolean;
  status: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class AgendaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/appointments`;

  private readonly _change$ = new Subject<void>();
  readonly change$ = this._change$.asObservable();
  notifyChange(): void { this._change$.next(); }

  // Backend enum: VISIT, MEETING, SIGNING, PHONE, OTHER
  private readonly TYPE_MAP: Record<string, AppointmentType> = {
    VISIT:   AppointmentType.VISIT,
    MEETING: AppointmentType.MEETING,
    SIGNING: AppointmentType.SIGNING,
    PHONE:   AppointmentType.PHONE_CALL,
    OTHER:   AppointmentType.MEETING
  };

  // Frontend enum → backend enum
  private readonly REVERSE_TYPE_MAP: Record<string, string> = {
    [AppointmentType.VISIT]:       'VISIT',
    [AppointmentType.MEETING]:     'MEETING',
    [AppointmentType.SIGNING]:     'SIGNING',
    [AppointmentType.PHONE_CALL]:  'PHONE',
    [AppointmentType.ESTIMATION]:  'OTHER',
    [AppointmentType.NOTARY]:      'OTHER'
  };

  // Frontend status → backend status
  private readonly REVERSE_STATUS_MAP: Record<string, string> = {
    'scheduled':   'PLANNED',
    'completed':   'DONE',
    'cancelled':   'CANCELLED',
    'rescheduled': 'PLANNED'
  };

  // Backend status: PLANNED, CONFIRMED, DONE, CANCELLED
  private readonly STATUS_MAP: Record<string, string> = {
    PLANNED:   'scheduled',
    CONFIRMED: 'scheduled',
    DONE:      'completed',
    CANCELLED: 'cancelled'
  };

  getAll(start?: Date, end?: Date): Observable<Appointment[]> {
    if (start && end) {
      const params = new HttpParams()
        .set('start', start.toISOString())
        .set('end', end.toISOString());
      return this.http.get<ApiResponse<BackendAppointmentResponse[]>>(`${this.apiUrl}/range`, { params }).pipe(
        map(r => r.data.map(a => this.mapAppointment(a))),
        catchError(() => of([]))
      );
    }
    const params = new HttpParams().set('page', '0').set('size', '200');
    return this.http.get<PageResponse<BackendAppointmentResponse>>(this.apiUrl, { params }).pipe(
      map(r => r.content.map(a => this.mapAppointment(a))),
      catchError(() => of([]))
    );
  }

  getById(id: string): Observable<Appointment> {
    return this.http.get<ApiResponse<BackendAppointmentResponse>>(`${this.apiUrl}/${id}`).pipe(
      map(r => this.mapAppointment(r.data))
    );
  }

  create(data: Partial<Appointment>): Observable<Appointment> {
    return this.http.post<ApiResponse<BackendAppointmentResponse>>(this.apiUrl, this.mapToRequest(data)).pipe(
      map(r => this.mapAppointment(r.data))
    );
  }

  update(id: string, data: Partial<Appointment>): Observable<Appointment> {
    return this.http.put<ApiResponse<BackendAppointmentResponse>>(`${this.apiUrl}/${id}`, this.mapToRequest(data)).pipe(
      map(r => this.mapAppointment(r.data))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getUpcoming(limit = 5): Observable<Appointment[]> {
    return this.http.get<ApiResponse<BackendAppointmentResponse[]>>(`${this.apiUrl}/upcoming`, {
      params: new HttpParams().set('limit', limit.toString())
    }).pipe(
      map(r => r.data.map(a => this.mapAppointment(a))),
      catchError(() => of([]))
    );
  }

  getTodayCount(): Observable<number> {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const end   = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    const params = new HttpParams()
      .set('start', start.toISOString())
      .set('end', end.toISOString());
    return this.http.get<ApiResponse<BackendAppointmentResponse[]>>(`${this.apiUrl}/range`, { params }).pipe(
      map(r => r.data.length),
      catchError(() => of(0))
    );
  }

  private mapAppointment(a: BackendAppointmentResponse): Appointment {
    return {
      id: a.id,
      title: a.title,
      type: this.TYPE_MAP[a.type] ?? AppointmentType.MEETING,
      startDate: new Date(a.startAt),
      endDate: new Date(a.endAt),
      allDay: false,
      location: a.location,
      notes: a.notes || '',
      status: (this.STATUS_MAP[a.status] || 'scheduled') as 'scheduled' | 'completed' | 'cancelled' | 'rescheduled',
      propertyId: a.propertyId,
      propertyReference: a.propertyReference,
      contactId: a.contactId,
      contactName: a.contactName,
      agentId: a.agentId || '',
      agentName: a.agentName,
      reminderMinutes: 30,
      isConfirmed: a.confirmed || false,
      createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
      updatedAt: a.updatedAt ? new Date(a.updatedAt) : new Date()
    };
  }

  private mapToRequest(data: Partial<Appointment>): any {
    return {
      title:   data.title,
      type:    this.REVERSE_TYPE_MAP[data.type ?? ''] ?? 'OTHER',
      startAt: data.startDate instanceof Date ? data.startDate.toISOString() : data.startDate,
      endAt:   data.endDate   instanceof Date ? data.endDate.toISOString()   : data.endDate,
      location:   data.location   || null,
      notes:      data.notes      || null,
      propertyId: data.propertyId || null,
      contactId:  data.contactId  || null,   // null explicite = effacer le contact
      agentId:    data.agentId,
      status:     data.status ? this.REVERSE_STATUS_MAP[data.status] : undefined
    };
  }
}
