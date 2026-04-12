import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgendaService } from '../../core/services/agenda.service';
import { AuthService } from '../../core/services/auth.service';
import { ContactService } from '../../core/services/contact.service';
import { Appointment } from '../../core/models/appointment.model';
import { Contact } from '../../core/models/contact.model';
import { AppointmentType } from '../../core/models/enums';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  appointments: Appointment[];
}

interface WeekHour {
  hour: number;
  label: string;
}

interface WeekDay {
  date: Date;
  isToday: boolean;
  label: string;
  dayNum: string;
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
  private readonly authService = inject(AuthService);
  private readonly contactService = inject(ContactService);

  appointments = signal<Appointment[]>([]);
  viewMode = signal<'month' | 'week' | 'list'>('month');
  currentDate = signal(new Date());
  selectedAppointment = signal<Appointment | null>(null);
  showNewDialog = signal(false);
  showEditDialog = signal(false);
  isCancelling = signal(false);

  newApt  = { title: '', type: 'VISIT', date: '', startTime: '10:00', endTime: '11:00', location: '', contactId: '', contactName: '' };
  editApt = { title: '', type: 'VISIT', date: '', startTime: '10:00', endTime: '11:00', location: '', notes: '', contactId: '', contactName: '' };

  // Contact search
  contactSearchQuery = signal('');
  contactResults = signal<Contact[]>([]);
  showContactDropdown = signal(false);
  private contactSearchTimer: any;

  dayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  calendarDays = signal<CalendarDay[]>([]);
  weekDays = signal<WeekDay[]>([]);
  groupedAppointments = signal<{ dateLabel: string; appointments: Appointment[] }[]>([]);

  currentMonthLabel = signal('');
  weekLabel = signal('');

  readonly weekHours: WeekHour[] = Array.from({ length: 13 }, (_, i) => ({
    hour: i + 8,
    label: `${(i + 8).toString().padStart(2, '0')}:00`
  }));

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.agendaService.getAll().subscribe(apts => {
      this.appointments.set(apts);
      this.buildCalendar();
      this.buildWeekView();
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

  buildWeekView(): void {
    const date = this.currentDate();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    // Find Monday of current week
    const dayOfWeek = date.getDay(); // 0=Sun
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(date);
    monday.setDate(date.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const days: WeekDay[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const isToday = d.getTime() === today.getTime();
      const apts = this.appointments().filter(a => {
        const ad = new Date(a.startDate);
        ad.setHours(0, 0, 0, 0);
        return ad.getTime() === d.getTime();
      });
      days.push({
        date: d,
        isToday,
        label: dayNames[i],
        dayNum: d.getDate().toString(),
        appointments: apts
      });
    }
    this.weekDays.set(days);

    const end = new Date(monday);
    end.setDate(monday.getDate() + 6);
    this.weekLabel.set(
      `${monday.getDate()} – ${end.getDate()} ${end.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
    );
  }

  getAptTopPct(apt: Appointment): number {
    const start = new Date(apt.startDate);
    const h = start.getHours() + start.getMinutes() / 60;
    return Math.max(0, (h - 8) / 13 * 100);
  }

  getAptHeightPct(apt: Appointment): number {
    const start = new Date(apt.startDate);
    const end = new Date(apt.endDate);
    const dur = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return Math.max(2, dur / 13 * 100);
  }

  prevPeriod(): void {
    const d = this.currentDate();
    if (this.viewMode() === 'week') {
      this.currentDate.set(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7));
      this.buildWeekView();
    } else {
      this.currentDate.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
      this.buildCalendar();
      this.updateMonthLabel();
    }
  }

  nextPeriod(): void {
    const d = this.currentDate();
    if (this.viewMode() === 'week') {
      this.currentDate.set(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7));
      this.buildWeekView();
    } else {
      this.currentDate.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
      this.buildCalendar();
      this.updateMonthLabel();
    }
  }

  prevMonth(): void { this.prevPeriod(); }
  nextMonth(): void { this.nextPeriod(); }

  goToToday(): void {
    this.currentDate.set(new Date());
    this.buildCalendar();
    this.buildWeekView();
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

  openEditDialog(): void {
    const apt = this.selectedAppointment();
    if (!apt) return;
    const start = new Date(apt.startDate);
    const end = new Date(apt.endDate);
    const pad = (n: number) => n.toString().padStart(2, '0');
    this.editApt = {
      title:       apt.title,
      type:        apt.type,
      date:        `${start.getFullYear()}-${pad(start.getMonth()+1)}-${pad(start.getDate())}`,
      startTime:   `${pad(start.getHours())}:${pad(start.getMinutes())}`,
      endTime:     `${pad(end.getHours())}:${pad(end.getMinutes())}`,
      location:    apt.location || '',
      notes:       apt.notes || '',
      contactId:   apt.contactId || '',
      contactName: ''
    };
    // Charger le nom du contact si existant
    if (apt.contactId) {
      this.contactService.getById(apt.contactId).subscribe(c => {
        this.editApt.contactName = `${c.firstName} ${c.lastName}`;
      });
    }
    this.showEditDialog.set(true);
  }

  saveEditAppointment(): void {
    const apt = this.selectedAppointment();
    if (!apt || !this.editApt.title || !this.editApt.date) return;
    const [sh, sm] = this.editApt.startTime.split(':').map(Number);
    const [eh, em] = this.editApt.endTime.split(':').map(Number);
    const startDate = new Date(this.editApt.date); startDate.setHours(sh, sm);
    const endDate   = new Date(this.editApt.date); endDate.setHours(eh, em);

    this.agendaService.update(apt.id, {
      title:     this.editApt.title,
      type:      this.editApt.type as AppointmentType,
      startDate, endDate,
      location:  this.editApt.location || undefined,
      notes:     this.editApt.notes || undefined,
      contactId: this.editApt.contactId || undefined,
      agentId:   apt.agentId
    }).subscribe({
      next: updated => {
        this.showEditDialog.set(false);
        this.selectedAppointment.set(updated);
        this.agendaService.notifyChange();
        this.loadAppointments();
      },
      error: () => {}
    });
  }

  cancelAppointment(): void {
    const apt = this.selectedAppointment();
    if (!apt || this.isCancelling()) return;
    this.isCancelling.set(true);
    this.agendaService.update(apt.id, { ...apt, status: 'cancelled' }).subscribe({
      next: updated => {
        this.selectedAppointment.set(updated);
        this.isCancelling.set(false);
        this.agendaService.notifyChange();
        this.loadAppointments();
      },
      error: () => this.isCancelling.set(false)
    });
  }

  saveNewAppointment(): void {
    if (!this.newApt.title || !this.newApt.date) return;
    const [sh, sm] = this.newApt.startTime.split(':').map(Number);
    const startDate = new Date(this.newApt.date); startDate.setHours(sh, sm);
    const endDate   = new Date(this.newApt.date);
    if (this.newApt.endTime) {
      const [eh, em] = this.newApt.endTime.split(':').map(Number);
      endDate.setHours(eh, em);
    } else {
      endDate.setHours(sh + 1, sm);
    }

    this.agendaService.create({
      title: this.newApt.title,
      type: this.newApt.type as AppointmentType,
      startDate, endDate,
      location:  this.newApt.location || undefined,
      contactId: this.newApt.contactId || undefined,
      status: 'scheduled',
      isConfirmed: false,
      agentId: this.authService.currentUser?.id ?? ''
    }).subscribe(() => {
      this.showNewDialog.set(false);
      this.newApt = { title: '', type: 'VISIT', date: '', startTime: '10:00', endTime: '11:00', location: '', contactId: '', contactName: '' };
      this.contactResults.set([]);
      this.agendaService.notifyChange();
      this.loadAppointments();
    });
  }

  // ── Contact search ───────────────────────────────────────────────
  onContactInput(query: string, target: 'new' | 'edit'): void {
    if (target === 'new') this.newApt.contactName = query;
    else this.editApt.contactName = query;
    clearTimeout(this.contactSearchTimer);
    if (!query.trim()) { this.contactResults.set([]); this.showContactDropdown.set(false); return; }
    this.contactSearchTimer = setTimeout(() => {
      this.contactService.getAll({ query, page: 0, pageSize: 8 }).subscribe(r => {
        this.contactResults.set(r.items);
        this.showContactDropdown.set(r.items.length > 0);
      });
    }, 250);
  }

  selectContact(contact: Contact, target: 'new' | 'edit'): void {
    const name = `${contact.firstName} ${contact.lastName}`;
    if (target === 'new') { this.newApt.contactId = contact.id; this.newApt.contactName = name; }
    else { this.editApt.contactId = contact.id; this.editApt.contactName = name; }
    this.contactResults.set([]);
    this.showContactDropdown.set(false);
  }

  clearContact(target: 'new' | 'edit'): void {
    if (target === 'new') { this.newApt.contactId = ''; this.newApt.contactName = ''; }
    else { this.editApt.contactId = ''; this.editApt.contactName = ''; }
    this.contactResults.set([]);
  }
  // ─────────────────────────────────────────────────────────────────

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
