import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgendaService } from '../../core/services/agenda.service';
import { Appointment } from '../../core/models/appointment.model';
import { AppointmentType } from '../../core/models/enums';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  appointments: Appointment[];
}

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.scss']
})
export class AgendaComponent implements OnInit {
  private readonly agendaService = inject(AgendaService);

  appointments = signal<Appointment[]>([]);
  viewMode = signal<'month' | 'week' | 'list'>('month');
  currentDate = signal(new Date());
  selectedAppointment = signal<Appointment | null>(null);
  showNewDialog = signal(false);

  newApt = { title: '', type: 'VISIT', date: '', time: '10:00', location: '' };

  dayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  calendarDays = signal<CalendarDay[]>([]);
  groupedAppointments = signal<{ dateLabel: string; appointments: Appointment[] }[]>([]);

  currentMonthLabel = signal('');

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.agendaService.getAll().subscribe(apts => {
      this.appointments.set(apts);
      this.buildCalendar();
      this.buildGroupedList();
      this.updateMonthLabel();
    });
  }

  buildCalendar(): void {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Start from Monday
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const days: CalendarDay[] = [];
    for (let i = startDay; i > 0; i--) {
      const d = new Date(year, month, 1 - i);
      days.push({ date: d, isCurrentMonth: false, isToday: false, appointments: [] });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      const isToday = d.getTime() === today.getTime();
      const apts = this.appointments().filter(a => {
        const ad = new Date(a.startDate);
        return ad.getFullYear() === year && ad.getMonth() === month && ad.getDate() === i;
      });
      days.push({ date: d, isCurrentMonth: true, isToday, appointments: apts });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, isCurrentMonth: false, isToday: false, appointments: [] });
    }
    this.calendarDays.set(days);
  }

  buildGroupedList(): void {
    const apts = [...this.appointments()].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    const groups: Record<string, Appointment[]> = {};
    apts.forEach(a => {
      const key = new Date(a.startDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(a);
    });
    this.groupedAppointments.set(Object.entries(groups).map(([dateLabel, appointments]) => ({ dateLabel, appointments })));
  }

  updateMonthLabel(): void {
    const d = this.currentDate();
    this.currentMonthLabel.set(d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }));
  }

  prevMonth(): void {
    const d = this.currentDate();
    this.currentDate.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
    this.buildCalendar();
    this.updateMonthLabel();
  }

  nextMonth(): void {
    const d = this.currentDate();
    this.currentDate.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
    this.buildCalendar();
    this.updateMonthLabel();
  }

  goToToday(): void {
    this.currentDate.set(new Date());
    this.buildCalendar();
    this.updateMonthLabel();
  }

  selectDay(day: CalendarDay): void {
    if (day.appointments.length === 1) {
      this.selectedAppointment.set(day.appointments[0]);
    }
  }

  selectAppointment(apt: Appointment): void {
    this.selectedAppointment.set(apt);
  }

  openNewAppointment(): void {
    this.showNewDialog.set(true);
  }

  saveNewAppointment(): void {
    if (!this.newApt.title || !this.newApt.date) return;
    const [h, m] = this.newApt.time.split(':').map(Number);
    const startDate = new Date(this.newApt.date);
    startDate.setHours(h, m);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    this.agendaService.create({
      title: this.newApt.title,
      type: this.newApt.type as AppointmentType,
      startDate,
      endDate,
      location: this.newApt.location,
      status: 'scheduled',
      isConfirmed: false,
      agentId: '1'
    }).subscribe(() => {
      this.showNewDialog.set(false);
      this.newApt = { title: '', type: 'VISIT', date: '', time: '10:00', location: '' };
      this.loadAppointments();
    });
  }

  getEventColor(type: string): string {
    const colors: Record<string, string> = {
      VISIT: '#1B4F72', MEETING: '#8b5cf6', ESTIMATION: '#F39C12',
      SIGNING: '#10b981', NOTARY: '#ef4444', PHONE_CALL: '#3b82f6'
    };
    return colors[type] || '#64748b';
  }

  getEventStyle(type: string): string {
    const color = this.getEventColor(type);
    return `background: ${color}20; color: ${color};`;
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      VISIT: 'Visite', MEETING: 'Réunion', ESTIMATION: 'Estimation',
      SIGNING: 'Signature', NOTARY: 'Notaire', PHONE_CALL: 'Appel'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      scheduled: 'Planifié', completed: 'Terminé', cancelled: 'Annulé', rescheduled: 'Reporté'
    };
    return labels[status] || status;
  }
}
