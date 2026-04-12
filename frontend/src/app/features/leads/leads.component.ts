import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Lead, LeadService } from '../../core/services/lead.service';

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './leads.component.html',
  styleUrls: ['./leads.component.scss']
})
export class LeadsComponent implements OnInit {
  private readonly leadService = inject(LeadService);
  private readonly route = inject(ActivatedRoute);

  tab = signal<'active' | 'archived'>('active');
  leads = signal<Lead[]>([]);
  loading = signal(true);
  selectedLead = signal<Lead | null>(null);
  deleting = signal<string | null>(null);
  leadToDelete = signal<Lead | null>(null);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const targetId = params['id'];
      this.load(targetId);
    });
  }

  load(autoSelectId?: string): void {
    this.loading.set(true);
    const obs = this.tab() === 'active' ? this.leadService.getActive() : this.leadService.getArchived();
    obs.subscribe({
      next: leads => {
        this.leads.set(leads);
        this.loading.set(false);
        if (autoSelectId) {
          const target = leads.find(l => l.id === autoSelectId);
          if (target) this.select(target);
        }
      },
      error: () => this.loading.set(false)
    });
  }

  setTab(t: 'active' | 'archived'): void {
    this.tab.set(t);
    this.selectedLead.set(null);
    this.load();
  }


  select(lead: Lead): void {
    this.selectedLead.set(lead);
    if (lead.status === 'UNREAD') {
      this.leadService.markRead(lead.id).subscribe(updated => {
        this.leads.update(list => list.map(l => l.id === updated.id ? updated : l));
        this.selectedLead.set(updated);
        this.leadService.notifyChange();
      });
    }
  }

  archive(lead: Lead, event: Event): void {
    event.stopPropagation();
    this.leadService.archive(lead.id).subscribe(() => {
      this.leads.update(list => list.filter(l => l.id !== lead.id));
      if (this.selectedLead()?.id === lead.id) this.selectedLead.set(null);
      this.leadService.notifyChange();
    });
  }

  unarchive(lead: Lead, event: Event): void {
    event.stopPropagation();
    this.leadService.unarchive(lead.id).subscribe(() => {
      this.leads.update(list => list.filter(l => l.id !== lead.id));
      if (this.selectedLead()?.id === lead.id) this.selectedLead.set(null);
      this.leadService.notifyChange();
    });
  }

  delete(lead: Lead, event: Event): void {
    event.stopPropagation();
    this.leadToDelete.set(lead);
  }

  confirmDelete(): void {
    const lead = this.leadToDelete();
    if (!lead) return;
    this.deleting.set(lead.id);
    this.leadToDelete.set(null);
    this.leadService.delete(lead.id).subscribe(() => {
      this.leads.update(list => list.filter(l => l.id !== lead.id));
      if (this.selectedLead()?.id === lead.id) this.selectedLead.set(null);
      this.deleting.set(null);
      this.leadService.notifyChange();
    });
  }

  cancelDelete(): void {
    this.leadToDelete.set(null);
  }

  unreadCount(): number {
    return this.leads().filter(l => l.status === 'UNREAD').length;
  }

  getFormTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      CONTACT: 'Contact général',
      ESTIMATION: 'Demande d\'estimation',
      PROPERTY_INQUIRY: 'Renseignement bien',
    };
    return labels[type] ?? type;
  }

  getSourceLabel(src: string): string {
    const labels: Record<string, string> = {
      WEBSITE: 'Site web',
      PHONE: 'Téléphone',
      EMAIL: 'Email',
    };
    return labels[src] ?? src;
  }
}
