import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RentalService } from '../../../core/services/rental.service';
import { RentalLease, RentalPayment, RentalPaymentRequest } from '../../../core/models/rental.model';

@Component({
  selector: 'app-rental-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './rental-detail.component.html',
  styleUrls: ['./rental-detail.component.scss']
})
export class RentalDetailComponent implements OnInit {
  private readonly rentalService = inject(RentalService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  lease = signal<RentalLease | null>(null);
  payments = signal<RentalPayment[]>([]);
  loading = signal(true);
  showTerminateModal = signal(false);
  terminating = signal(false);

  // Payment modal
  showPaymentModal = signal(false);
  editingPayment = signal<RentalPayment | null>(null);
  savingPayment = signal(false);
  paymentError = signal('');

  paymentForm: RentalPaymentRequest = {
    paymentMonth: new Date().getMonth() + 1,
    paymentYear: new Date().getFullYear(),
    expectedAmount: 0,
    paidAmount: 0,
  };

  // Delete payment modal
  showDeletePaymentModal = signal(false);
  paymentToDelete = signal<RentalPayment | null>(null);
  deletingPayment = signal(false);

  // Quittance modal
  showQuittanceModal = signal(false);
  quittancePayment = signal<RentalPayment | null>(null);

  today = new Date();

  MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadLease(id);
  }

  loadLease(id: string): void {
    this.loading.set(true);
    this.rentalService.getLeaseById(id).subscribe({
      next: (lease) => {
        this.lease.set(lease);
        this.loadPayments(id);
      },
      error: () => this.loading.set(false)
    });
  }

  loadPayments(leaseId: string): void {
    this.rentalService.getPayments(leaseId).subscribe({
      next: (payments) => {
        this.payments.set(payments);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openNewPayment(): void {
    const lease = this.lease();
    if (!lease) return;
    this.editingPayment.set(null);
    this.paymentForm = {
      paymentMonth: new Date().getMonth() + 1,
      paymentYear: new Date().getFullYear(),
      expectedAmount: lease.totalRent,
      paidAmount: lease.totalRent,
    };
    this.paymentError.set('');
    this.showPaymentModal.set(true);
  }

  openEditPayment(p: RentalPayment): void {
    this.editingPayment.set(p);
    this.paymentForm = {
      paymentMonth: p.paymentMonth,
      paymentYear: p.paymentYear,
      expectedAmount: p.expectedAmount,
      paidAmount: p.paidAmount,
      paymentDate: p.paymentDate,
      dueDate: p.dueDate,
      paymentMethod: p.paymentMethod,
      reference: p.reference,
      notes: p.notes,
    };
    this.paymentError.set('');
    this.showPaymentModal.set(true);
  }

  savePayment(): void {
    if (this.savingPayment()) return;
    this.savingPayment.set(true);
    this.paymentError.set('');
    const lease = this.lease();
    if (!lease) return;

    const editing = this.editingPayment();
    const obs = editing
      ? this.rentalService.updatePayment(editing.id, this.paymentForm)
      : this.rentalService.addPayment(lease.id, this.paymentForm);

    obs.subscribe({
      next: () => {
        this.savingPayment.set(false);
        this.showPaymentModal.set(false);
        this.loadPayments(lease.id);
        // Reload lease for updated stats
        this.rentalService.getLeaseById(lease.id).subscribe(l => this.lease.set(l));
      },
      error: () => {
        this.savingPayment.set(false);
        this.paymentError.set('Erreur lors de la sauvegarde. Vérifiez qu\'un paiement pour ce mois n\'existe pas déjà.');
      }
    });
  }

  deletePayment(p: RentalPayment): void {
    this.paymentToDelete.set(p);
    this.showDeletePaymentModal.set(true);
  }

  confirmDeletePayment(): void {
    const p = this.paymentToDelete();
    const lease = this.lease();
    if (!p || !lease || this.deletingPayment()) return;
    this.deletingPayment.set(true);
    this.rentalService.deletePayment(p.id).subscribe({
      next: () => {
        this.deletingPayment.set(false);
        this.showDeletePaymentModal.set(false);
        this.paymentToDelete.set(null);
        this.loadPayments(lease.id);
        this.rentalService.getLeaseById(lease.id).subscribe(l => this.lease.set(l));
      },
      error: () => this.deletingPayment.set(false)
    });
  }

  cancelDeletePayment(): void {
    this.showDeletePaymentModal.set(false);
    this.paymentToDelete.set(null);
  }

  openQuittance(p: RentalPayment): void {
    this.quittancePayment.set(p);
    this.showQuittanceModal.set(true);
  }

  markQuittanceGenerated(p: RentalPayment): void {
    this.rentalService.generateQuittance(p.id).subscribe({
      next: () => {
        const lease = this.lease();
        if (lease) this.loadPayments(lease.id);
        this.showQuittanceModal.set(false);
      }
    });
  }

  openTerminate(): void { this.showTerminateModal.set(true); }
  cancelTerminate(): void { this.showTerminateModal.set(false); }

  confirmTerminate(): void {
    const lease = this.lease();
    if (!lease || this.terminating()) return;
    this.terminating.set(true);
    this.rentalService.terminateLease(lease.id).subscribe({
      next: (updated) => {
        this.terminating.set(false);
        this.showTerminateModal.set(false);
        this.lease.set(updated);
      },
      error: () => this.terminating.set(false)
    });
  }

  getStatusLabel(s: string): string {
    const labels: Record<string, string> = {
      ACTIVE: 'Actif', PENDING: 'En attente', TERMINATED: 'Résilié',
      SUSPENDED: 'Suspendu', UNPAID: 'Impayé'
    };
    return labels[s] || s;
  }

  getStatusClass(s: string): string {
    const cls: Record<string, string> = {
      ACTIVE: 'status-active', PENDING: 'status-pending',
      TERMINATED: 'status-terminated', SUSPENDED: 'status-suspended',
      UNPAID: 'status-unpaid'
    };
    return cls[s] || '';
  }

  getPaymentStatusClass(s: string): string {
    const cls: Record<string, string> = {
      PAID: 'pay-paid', PARTIAL: 'pay-partial', PENDING: 'pay-pending',
      LATE: 'pay-late', UNPAID: 'pay-unpaid'
    };
    return cls[s] || '';
  }

  getPaymentStatusLabel(s: string): string {
    const labels: Record<string, string> = {
      PAID: 'Payé', PARTIAL: 'Partiel', PENDING: 'En attente',
      LATE: 'En retard', UNPAID: 'Impayé'
    };
    return labels[s] || s;
  }

  getMethodLabel(m?: string): string {
    const labels: Record<string, string> = {
      TRANSFER: 'Virement', CASH: 'Espèces', CHECK: 'Chèque',
      DIRECT_DEBIT: 'Prélèvement', OTHER: 'Autre'
    };
    return m ? (labels[m] || m) : '—';
  }

  getTypeLabel(t: string): string {
    const labels: Record<string, string> = {
      UNFURNISHED: 'Non meublé', FURNISHED: 'Meublé',
      SEASONAL: 'Saisonnier', OTHER: 'Autre'
    };
    return labels[t] || t;
  }

  getPaidPercent(lease: RentalLease): number {
    if (!lease.totalPayments) return 0;
    return Math.round((lease.paidPayments / lease.totalPayments) * 100);
  }

  printQuittance(): void {
    window.print();
  }

  goBack(): void {
    this.router.navigate(['/rental']);
  }
}
