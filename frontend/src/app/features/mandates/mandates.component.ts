import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MandateService } from '../../core/services/mandate.service';
import { Mandate } from '../../core/models/mandate.model';
import { MandateStatus, MANDATE_TYPE_LABELS } from '../../core/models/enums';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { PriceFormatterPipe } from '../../shared/pipes/price-formatter.pipe';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-mandates',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StatusBadgeComponent, PriceFormatterPipe, ConfirmDialogComponent],
  templateUrl: './mandates.component.html',
  styleUrls: ['./mandates.component.scss']
})
export class MandatesComponent implements OnInit, OnDestroy {
  private readonly mandateService = inject(MandateService);
  private readonly router = inject(Router);
  private sub?: Subscription;

  mandates = signal<Mandate[]>([]);
  filteredMandates = signal<Mandate[]>([]);
  loading = signal(true);
  activeTab = 'ALL';
  expiringCount = signal(0);
  deletingId = signal<string | null>(null);
  showDeleteDialog = signal(false);
  mandateToDelete = signal<Mandate | null>(null);

  tabs = [
    { label: 'Tous', value: 'ALL' },
    { label: 'Actifs', value: 'ACTIVE' },
    { label: 'Expirés', value: 'EXPIRED' },
    { label: 'Terminés', value: 'COMPLETED' }
  ];

  ngOnInit(): void {
    this.loadMandates();
    this.sub = this.mandateService.change$.subscribe(() => this.loadMandates());
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  loadMandates(): void {
    this.loading.set(true);
    this.mandateService.getAll().subscribe(m => {
      this.mandates.set(m);
      this.expiringCount.set(m.filter(x => x.isExpiringSoon && x.status === MandateStatus.ACTIVE).length);
      this.filterMandates();
      this.loading.set(false);
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

  editMandate(id: string): void {
    this.router.navigate(['/mandates', id, 'edit']);
  }

  requestDelete(mandate: Mandate): void {
    this.mandateToDelete.set(mandate);
    this.showDeleteDialog.set(true);
  }

  confirmDelete(): void {
    const mandate = this.mandateToDelete();
    if (!mandate) return;
    this.deletingId.set(mandate.id);
    this.showDeleteDialog.set(false);
    this.mandateService.delete(mandate.id).subscribe({
      next: () => {
        this.mandates.update(list => list.filter(m => m.id !== mandate.id));
        this.filterMandates();
        this.deletingId.set(null);
        this.mandateToDelete.set(null);
        this.mandateService.notifyChange();
      },
      error: () => {
        this.deletingId.set(null);
        this.mandateToDelete.set(null);
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteDialog.set(false);
    this.mandateToDelete.set(null);
  }
}
