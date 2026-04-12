import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RentalService } from '../../core/services/rental.service';
import { RentalLease, LeaseStatus } from '../../core/models/rental.model';

@Component({
  selector: 'app-rental',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './rental.component.html',
  styleUrls: ['./rental.component.scss']
})
export class RentalComponent implements OnInit {
  private readonly rentalService = inject(RentalService);
  private readonly router = inject(Router);

  leases = signal<RentalLease[]>([]);
  loading = signal(true);
  search = signal('');
  statusFilter = signal<string>('ALL');
  typeFilter = signal<string>('ALL');

  filtered = computed(() => {
    let list = this.leases();
    const q = this.search().toLowerCase();
    if (q) list = list.filter(l =>
      l.tenantName.toLowerCase().includes(q) ||
      l.propertyAddress.toLowerCase().includes(q) ||
      l.propertyCity.toLowerCase().includes(q) ||
      l.propertyReference.toLowerCase().includes(q)
    );
    if (this.statusFilter() !== 'ALL') list = list.filter(l => l.status === this.statusFilter());
    if (this.typeFilter() !== 'ALL') list = list.filter(l => l.leaseType === this.typeFilter());
    return list;
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.rentalService.getAllLeases().subscribe({
      next: (data) => { this.leases.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  getStatusLabel(s: LeaseStatus): string {
    const labels: Record<string, string> = {
      ACTIVE: 'Actif', PENDING: 'En attente', TERMINATED: 'Résilié',
      SUSPENDED: 'Suspendu', UNPAID: 'Impayé'
    };
    return labels[s] || s;
  }

  getStatusClass(s: LeaseStatus): string {
    const cls: Record<string, string> = {
      ACTIVE: 'status-active', PENDING: 'status-pending',
      TERMINATED: 'status-terminated', SUSPENDED: 'status-suspended',
      UNPAID: 'status-unpaid'
    };
    return cls[s] || '';
  }

  getTypeLabel(t: string): string {
    const labels: Record<string, string> = {
      UNFURNISHED: 'Non meublé', FURNISHED: 'Meublé',
      SEASONAL: 'Saisonnier', OTHER: 'Autre'
    };
    return labels[t] || t;
  }

  getPaymentStatusClass(s?: string): string {
    const cls: Record<string, string> = {
      PAID: 'pay-paid', PARTIAL: 'pay-partial', PENDING: 'pay-pending',
      LATE: 'pay-late', UNPAID: 'pay-unpaid'
    };
    return s ? (cls[s] || '') : '';
  }

  getPaymentStatusLabel(s?: string): string {
    const labels: Record<string, string> = {
      PAID: 'Payé', PARTIAL: 'Partiel', PENDING: 'En attente',
      LATE: 'En retard', UNPAID: 'Impayé'
    };
    return s ? (labels[s] || s) : '—';
  }

  openDetail(id: string): void {
    this.router.navigate(['/rental', id]);
  }

  setStatusFilter(val: string): void {
    this.statusFilter.set(val);
  }

  newLease(): void {
    this.router.navigate(['/rental/new']);
  }
}
