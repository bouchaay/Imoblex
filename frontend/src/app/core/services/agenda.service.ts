import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Appointment } from '../models/appointment.model';
import { AppointmentType } from '../models/enums';
import { MOCK_APPOINTMENTS } from '../mock/mock-data';

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
  private readonly apiUrl = '/api/appointments';

  private readonly TYPE_MAP: Record<string, AppointmentType> = {
    VISIT: AppointmentType.VISIT,
    ESTIMATION: AppointmentType.ESTIMATION,
    COMPROMIS_SIGNATURE: AppointmentType.SIGNING,
    RENTAL_SIGNING: AppointmentType.SIGNING,
    SIGNING: AppointmentType.SIGNING,
    MEETING: AppointmentType.MEETING,
    PHONE_CALL: AppointmentType.PHONE_CALL,
    NOTARY: AppointmentType.NOTARY
  };

  private readonly STATUS_MAP: Record<string, string> = {
    PLANNED: 'scheduled',
    SCHEDULED: 'scheduled',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    RESCHEDULED: 'rescheduled'
  };

  getAll(start?: Date, end?: Date): Observable<Appointment[]> {
    if (start && end) {
      const params = new HttpParams()
        .set('start', start.toISOString())
        .set('end', end.toISOString());
      return this.http.get<ApiResponse<BackendAppointmentResponse[]>>(`${this.apiUrl}/range`, { params }).pipe(
        map(r => r.data.map(a => this.mapAppointment(a))),
        catchError(() => of(MOCK_APPOINTMENTS))
      );
    }
    const params = new HttpParams().set('page', '0').set('size', '200');
    return this.http.get<PageResponse<BackendAppointmentResponse>>(this.apiUrl, { params }).pipe(
      map(r => r.content.length > 0 ? r.content.map(a => this.mapAppointment(a)) : MOCK_APPOINTMENTS),
      catchError(() => of(MOCK_APPOINTMENTS))
    );
  }

  getById(id: string): Observable<Appointment> {
    return this.http.get<ApiResponse<BackendAppointmentResponse>>(`${this.apiUrl}/${id}`).pipe(
      map(r => this.mapAppointment(r.data)),
      catchError(() => of(MOCK_APPOINTMENTS.find(a => a.id === id) ?? null as any))
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
      catchError(() => of(MOCK_APPOINTMENTS.slice(0, limit).sort((a, b) => a.startDate.getTime() - b.startDate.getTime())))
    );
  }

  private mapAppointment(a: BackendAppointmentResponse): Appointment {
    return {
      id: a.id,
      title: a.title,
      type: this.TYPE_MAP[a.type] || AppointmentType.MEETING,
      startDate: new Date(a.startAt),
      endDate: new Date(a.endAt),
      allDay: false,
      location: a.location,
      notes: a.notes || '',
      status: (this.STATUS_MAP[a.status] || 'scheduled') as 'scheduled' | 'completed' | 'cancelled' | 'rescheduled',
      propertyId: a.propertyId,
      contactId: a.contactId,
      agentId: a.agentId || '',
      reminderMinutes: 30,
      isConfirmed: a.confirmed || false,
      createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
      updatedAt: a.updatedAt ? new Date(a.updatedAt) : new Date()
    };
  }

  private mapToRequest(data: Partial<Appointment>): any {
    return {
      title: data.title,
      type: data.type,
      startAt: data.startDate instanceof Date
        ? (data.startDate as Date).toISOString()
        : data.startDate,
      endAt: data.endDate instanceof Date
        ? (data.endDate as Date).toISOString()
        : data.endDate,
      location: data.location,
      notes: data.notes,
      propertyId: data.propertyId,
      contactId: data.contactId,
      agentId: data.agentId
    };
  }
}
