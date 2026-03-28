import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Appointment } from '../models/appointment.model';
import { AppointmentType } from '../models/enums';

@Injectable({ providedIn: 'root' })
export class AgendaService {
  private mockAppointments: Appointment[] = this.generateMockAppointments();

  getAll(start?: Date, end?: Date): Observable<Appointment[]> {
    let items = [...this.mockAppointments];
    if (start) items = items.filter(a => new Date(a.startDate) >= start);
    if (end) items = items.filter(a => new Date(a.startDate) <= end);
    return of(items).pipe(delay(250));
  }

  getById(id: string): Observable<Appointment> {
    return of(this.mockAppointments.find(a => a.id === id) || this.mockAppointments[0]).pipe(delay(200));
  }

  create(data: Partial<Appointment>): Observable<Appointment> {
    const apt = { ...this.mockAppointments[0], ...data, id: 'apt_' + Date.now(), createdAt: new Date(), updatedAt: new Date() } as Appointment;
    this.mockAppointments.push(apt);
    return of(apt).pipe(delay(300));
  }

  update(id: string, data: Partial<Appointment>): Observable<Appointment> {
    const idx = this.mockAppointments.findIndex(a => a.id === id);
    if (idx >= 0) this.mockAppointments[idx] = { ...this.mockAppointments[idx], ...data };
    return of(this.mockAppointments[idx >= 0 ? idx : 0]).pipe(delay(300));
  }

  delete(id: string): Observable<void> {
    this.mockAppointments = this.mockAppointments.filter(a => a.id !== id);
    return of(undefined).pipe(delay(300));
  }

  getUpcoming(limit = 5): Observable<Appointment[]> {
    const now = new Date();
    return of(
      this.mockAppointments
        .filter(a => new Date(a.startDate) >= now && a.status === 'scheduled')
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, limit)
    ).pipe(delay(200));
  }

  private generateMockAppointments(): Appointment[] {
    const apptTypes = [AppointmentType.VISIT, AppointmentType.MEETING, AppointmentType.ESTIMATION, AppointmentType.SIGNING, AppointmentType.NOTARY];
    const titles = ['Visite appartement', 'Estimation bien', 'Signature mandat', 'Réunion équipe', 'RDV notaire', 'Remise de clés'];
    const now = new Date();

    return Array.from({ length: 20 }, (_, i) => {
      const daysOffset = i < 10 ? i * 2 - 5 : i - 10;
      const startDate = new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000);
      startDate.setHours(9 + (i % 8), 0, 0, 0);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      return {
        id: `apt_${i + 1}`,
        title: titles[i % titles.length],
        type: apptTypes[i % apptTypes.length],
        startDate,
        endDate,
        allDay: false,
        location: `${i + 1} Avenue Foch, Paris`,
        notes: '',
        status: daysOffset < 0 ? 'completed' : 'scheduled' as 'scheduled' | 'completed',
        propertyId: `prop_${i + 1}`,
        contactId: `contact_${i + 1}`,
        agentId: '1',
        reminderMinutes: 30,
        isConfirmed: Math.random() > 0.3,
        createdAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      };
    });
  }
}
