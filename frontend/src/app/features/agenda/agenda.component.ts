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
  template: `
    <div class="agenda-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Agenda</h1>
          <p class="page-subtitle">{{ currentMonthLabel() }}</p>
        </div>
        <div class="header-actions">
          <div class="view-toggle">
            <button [class.active]="viewMode() === 'month'" (click)="viewMode.set('month')">Mois</button>
            <button [class.active]="viewMode() === 'week'" (click)="viewMode.set('week')">Semaine</button>
            <button [class.active]="viewMode() === 'list'" (click)="viewMode.set('list')">Liste</button>
          </div>
          <button class="btn-primary" (click)="openNewAppointment()">
            <i class="pi pi-plus"></i> Nouveau RDV
          </button>
        </div>
      </div>

      <!-- Calendar navigation -->
      <div class="cal-nav">
        <button class="nav-btn" (click)="prevMonth()"><i class="pi pi-chevron-left"></i></button>
        <button class="today-btn" (click)="goToToday()">Aujourd'hui</button>
        <button class="nav-btn" (click)="nextMonth()"><i class="pi pi-chevron-right"></i></button>
        <h2 class="month-title">{{ currentMonthLabel() }}</h2>
      </div>

      @if (viewMode() === 'month') {
        <!-- Month grid -->
        <div class="calendar-wrapper card">
          <!-- Day headers -->
          <div class="cal-header">
            @for (day of dayLabels; track day) {
              <div class="cal-header-cell">{{ day }}</div>
            }
          </div>

          <!-- Day cells -->
          <div class="cal-grid">
            @for (day of calendarDays(); track day.date.toISOString()) {
              <div class="cal-cell"
                [class.other-month]="!day.isCurrentMonth"
                [class.today]="day.isToday"
                [class.has-events]="day.appointments.length > 0"
                (click)="selectDay(day)">
                <div class="cal-day-num">{{ day.date.getDate() }}</div>
                <div class="cal-events">
                  @for (apt of day.appointments.slice(0, 3); track apt.id) {
                    <div class="cal-event" [style]="getEventStyle(apt.type)" (click)="$event.stopPropagation(); selectAppointment(apt)">
                      <span>{{ apt.startDate | date:'HH:mm' }} {{ apt.title }}</span>
                    </div>
                  }
                  @if (day.appointments.length > 3) {
                    <div class="cal-event more">+{{ day.appointments.length - 3 }} autres</div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }

      @if (viewMode() === 'list') {
        <!-- List view -->
        <div class="appointments-list-view">
          @for (group of groupedAppointments(); track group.dateLabel) {
            <div class="apt-group">
              <div class="apt-group-header">
                <span class="apt-group-date">{{ group.dateLabel }}</span>
                <span class="apt-group-count">{{ group.appointments.length }} RDV</span>
              </div>
              @for (apt of group.appointments; track apt.id) {
                <div class="apt-list-item card" (click)="selectAppointment(apt)">
                  <div class="apt-time-col">
                    <span class="apt-time-start">{{ apt.startDate | date:'HH:mm' }}</span>
                    <span class="apt-time-end">{{ apt.endDate | date:'HH:mm' }}</span>
                  </div>
                  <div class="apt-type-indicator" [style.background]="getEventColor(apt.type)"></div>
                  <div class="apt-details">
                    <div class="apt-name">{{ apt.title }}</div>
                    @if (apt.location) {
                      <div class="apt-location"><i class="pi pi-map-marker"></i> {{ apt.location }}</div>
                    }
                  </div>
                  <div class="apt-status-badge" [class]="'status-' + apt.status">{{ getStatusLabel(apt.status) }}</div>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Appointment detail drawer -->
      @if (selectedAppointment()) {
        <div class="apt-drawer-overlay" (click)="selectedAppointment.set(null)">
          <div class="apt-drawer" (click)="$event.stopPropagation()">
            <div class="drawer-header">
              <h3>{{ selectedAppointment()!.title }}</h3>
              <button class="close-btn" (click)="selectedAppointment.set(null)"><i class="pi pi-times"></i></button>
            </div>
            <div class="drawer-body">
              <div class="drawer-field"><i class="pi pi-calendar"></i> {{ selectedAppointment()!.startDate | date:'EEEE d MMMM':'':'fr' }}</div>
              <div class="drawer-field"><i class="pi pi-clock"></i> {{ selectedAppointment()!.startDate | date:'HH:mm' }} — {{ selectedAppointment()!.endDate | date:'HH:mm' }}</div>
              @if (selectedAppointment()!.location) {
                <div class="drawer-field"><i class="pi pi-map-marker"></i> {{ selectedAppointment()!.location }}</div>
              }
              <div class="drawer-field">
                <i class="pi pi-tag"></i>
                <span class="apt-type-chip" [style]="getEventStyle(selectedAppointment()!.type)">{{ getTypeLabel(selectedAppointment()!.type) }}</span>
              </div>
              <div class="drawer-actions">
                <button class="btn-primary"><i class="pi pi-pencil"></i> Modifier</button>
                <button class="btn-danger"><i class="pi pi-times-circle"></i> Annuler le RDV</button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- New appointment dialog -->
      @if (showNewDialog()) {
        <div class="apt-drawer-overlay" (click)="showNewDialog.set(false)">
          <div class="apt-drawer" (click)="$event.stopPropagation()">
            <div class="drawer-header">
              <h3>Nouveau rendez-vous</h3>
              <button class="close-btn" (click)="showNewDialog.set(false)"><i class="pi pi-times"></i></button>
            </div>
            <div class="drawer-body">
              <div class="form-group">
                <label class="form-label">Titre</label>
                <input type="text" [(ngModel)]="newApt.title" class="form-input" placeholder="Visite appartement..." />
              </div>
              <div class="form-group">
                <label class="form-label">Type</label>
                <select [(ngModel)]="newApt.type" class="form-input">
                  <option value="VISIT">Visite</option>
                  <option value="MEETING">Réunion</option>
                  <option value="ESTIMATION">Estimation</option>
                  <option value="SIGNING">Signature</option>
                  <option value="NOTARY">Notaire</option>
                </select>
              </div>
              <div class="form-grid-2">
                <div class="form-group">
                  <label class="form-label">Date</label>
                  <input type="date" [(ngModel)]="newApt.date" class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">Heure</label>
                  <input type="time" [(ngModel)]="newApt.time" class="form-input" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Lieu</label>
                <input type="text" [(ngModel)]="newApt.location" class="form-input" placeholder="Adresse..." />
              </div>
              <div class="drawer-actions">
                <button class="btn-secondary" (click)="showNewDialog.set(false)">Annuler</button>
                <button class="btn-primary" (click)="saveNewAppointment()"><i class="pi pi-check"></i> Créer</button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .agenda-page { animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem; }
    .page-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 0 0 0.2rem; }
    .page-subtitle { font-size: 0.875rem; color: #64748b; margin: 0; text-transform: capitalize; }
    .header-actions { display: flex; gap: 0.75rem; align-items: center; }

    .view-toggle { display: flex; border: 1.5px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    .view-toggle button { padding: 0.4rem 0.875rem; border: none; background: #fff; font-size: 0.82rem; font-weight: 500; color: #64748b; cursor: pointer; transition: all 0.15s; }
    .view-toggle button.active { background: #1B4F72; color: #fff; }

    .btn-primary { display: flex; align-items: center; gap: 0.4rem; background: #1B4F72; color: #fff; border: none; padding: 0.625rem 1.125rem; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; }
    .btn-secondary { display: flex; align-items: center; gap: 0.4rem; background: #fff; color: #475569; border: 1.5px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.875rem; cursor: pointer; }
    .btn-danger { display: flex; align-items: center; gap: 0.4rem; background: #fef2f2; color: #dc2626; border: 1.5px solid #fecaca; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.875rem; cursor: pointer; }

    .cal-nav { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
    .nav-btn { width: 36px; height: 36px; border: 1.5px solid #e2e8f0; background: #fff; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #475569; transition: all 0.15s; }
    .nav-btn:hover { border-color: #1B4F72; color: #1B4F72; }
    .today-btn { padding: 0.4rem 0.875rem; border: 1.5px solid #e2e8f0; background: #fff; border-radius: 8px; font-size: 0.82rem; font-weight: 500; color: #475569; cursor: pointer; transition: all 0.15s; }
    .today-btn:hover { border-color: #1B4F72; color: #1B4F72; }
    .month-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.1rem; font-weight: 700; color: #1e293b; margin: 0; text-transform: capitalize; }

    .card { background: #fff; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
    .calendar-wrapper { overflow: hidden; }

    .cal-header { display: grid; grid-template-columns: repeat(7, 1fr); border-bottom: 1px solid #f1f5f9; }
    .cal-header-cell { padding: 0.75rem; text-align: center; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }

    .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); }

    .cal-cell {
      min-height: 110px; border-right: 1px solid #f8fafc; border-bottom: 1px solid #f8fafc;
      padding: 0.5rem; cursor: pointer; transition: background 0.15s;
    }
    .cal-cell:hover { background: #f8fafc; }
    .cal-cell:nth-child(7n) { border-right: none; }
    .cal-cell.other-month { background: #fafbfc; }
    .cal-cell.other-month .cal-day-num { color: #cbd5e1; }
    .cal-cell.today { background: rgba(27,79,114,0.03); }
    .cal-cell.today .cal-day-num { background: #1B4F72; color: #fff; }

    .cal-day-num {
      width: 26px; height: 26px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.82rem; font-weight: 600; color: #374151;
      margin-bottom: 4px;
    }

    .cal-events { display: flex; flex-direction: column; gap: 2px; }
    .cal-event {
      font-size: 0.65rem; font-weight: 500; padding: 2px 6px;
      border-radius: 4px; white-space: nowrap; overflow: hidden;
      text-overflow: ellipsis; cursor: pointer; transition: opacity 0.15s;
    }
    .cal-event:hover { opacity: 0.85; }
    .cal-event.more { background: #f1f5f9; color: #64748b; }

    /* List view */
    .appointments-list-view { display: flex; flex-direction: column; gap: 1.25rem; }
    .apt-group-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .apt-group-date { font-size: 0.85rem; font-weight: 700; color: #374151; text-transform: capitalize; }
    .apt-group-count { font-size: 0.75rem; color: #94a3b8; }

    .apt-list-item {
      display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem;
      cursor: pointer; transition: box-shadow 0.15s; margin-bottom: 0.5rem;
    }
    .apt-list-item:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.1); }

    .apt-time-col { display: flex; flex-direction: column; align-items: center; width: 44px; }
    .apt-time-start { font-size: 0.875rem; font-weight: 700; color: #1e293b; }
    .apt-time-end { font-size: 0.72rem; color: #94a3b8; }

    .apt-type-indicator { width: 4px; height: 40px; border-radius: 2px; flex-shrink: 0; }

    .apt-details { flex: 1; }
    .apt-name { font-size: 0.875rem; font-weight: 600; color: #1e293b; }
    .apt-location { font-size: 0.75rem; color: #64748b; margin-top: 2px; display: flex; align-items: center; gap: 3px; }

    .apt-status-badge { font-size: 0.72rem; font-weight: 600; padding: 3px 10px; border-radius: 100px; }
    .status-scheduled { background: rgba(59,130,246,0.1); color: #2563eb; }
    .status-completed { background: rgba(16,185,129,0.1); color: #059669; }
    .status-cancelled { background: rgba(107,114,128,0.1); color: #4b5563; }

    /* Drawer */
    .apt-drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 200; display: flex; justify-content: flex-end; }
    .apt-drawer { width: 380px; background: #fff; height: 100%; box-shadow: -4px 0 30px rgba(0,0,0,0.15); display: flex; flex-direction: column; }
    .drawer-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; }
    .drawer-header h3 { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0; }
    .close-btn { background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 1rem; padding: 4px; border-radius: 4px; }
    .close-btn:hover { background: #f1f5f9; color: #475569; }
    .drawer-body { flex: 1; padding: 1.5rem; display: flex; flex-direction: column; gap: 0.875rem; }
    .drawer-field { display: flex; align-items: center; gap: 0.75rem; font-size: 0.875rem; color: #475569; }
    .drawer-field i { color: #94a3b8; width: 16px; }
    .apt-type-chip { padding: 3px 10px; border-radius: 100px; font-size: 0.78rem; font-weight: 600; }
    .drawer-actions { display: flex; gap: 0.75rem; margin-top: 1rem; }

    .form-group { display: flex; flex-direction: column; gap: 0.35rem; }
    .form-label { font-size: 0.82rem; font-weight: 600; color: #374151; }
    .form-input { padding: 0.625rem 0.875rem; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.875rem; outline: none; background: #f8fafc; font-family: inherit; }
    .form-input:focus { border-color: #1B4F72; background: #fff; }
    .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  `]
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
