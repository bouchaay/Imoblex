import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MandateService } from '../../core/services/mandate.service';
import { Mandate } from '../../core/models/mandate.model';
import { MandateStatus, MANDATE_TYPE_LABELS } from '../../core/models/enums';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { PriceFormatterPipe } from '../../shared/pipes/price-formatter.pipe';

@Component({
  selector: 'app-mandates',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StatusBadgeComponent, PriceFormatterPipe],
  templateUrl: './mandates.component.html',
  styleUrls: ['./mandates.component.scss']
})
export class MandatesComponent implements OnInit {
  private readonly mandateService = inject(MandateService);
  mandates = signal<Mandate[]>([]);
  filteredMandates = signal<Mandate[]>([]);
  activeTab = 'ALL';
  expiringCount = signal(0);

  tabs = [
    { label: 'Tous', value: 'ALL' },
    { label: 'Actifs', value: 'ACTIVE' },
    { label: 'Expirés', value: 'EXPIRED' },
    { label: 'Terminés', value: 'COMPLETED' }
  ];

  ngOnInit(): void {
    this.mandateService.getAll().subscribe(m => {
      this.mandates.set(m);
      this.expiringCount.set(m.filter(x => x.isExpiringSoon && x.status === MandateStatus.ACTIVE).length);
      this.filterMandates();
    });
  }

  setTab(tab: string): void { this.activeTab = tab; this.filterMandates(); }

  filterMandates(): void {
    const all = this.mandates();
    this.filteredMandates.set(this.activeTab === 'ALL' ? all : all.filter(m => m.status === this.activeTab));
  }

  filterExpiring(): void { this.setTab('ACTIVE'); }

  getTabCount(tab: string): number {
    if (tab === 'ALL') return this.mandates().length;
    return this.mandates().filter(m => m.status === tab).length;
  }

  getMandateTypeLabel(type: string): string {
    return MANDATE_TYPE_LABELS[type as keyof typeof MANDATE_TYPE_LABELS] || type;
  }
}
