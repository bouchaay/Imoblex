import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RentalService } from '../../../core/services/rental.service';
import { AgencySettingsService } from '../../../core/services/agency-settings.service';
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
  private readonly agencySettingsService = inject(AgencySettingsService);
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
  agencyLogoUrl = signal<string | null>(null);
  agencySignatureUrl = signal<string | null>(null);

  today = new Date();

  MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadLease(id);
    this.agencySettingsService.get().subscribe(s => {
      if (s.logoPath) this.agencyLogoUrl.set(s.logoPath);
      if (s.signatureImagePath) this.agencySignatureUrl.set(s.signatureImagePath);
    });
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
    const p = this.quittancePayment()!;
    const l = this.lease()!;
    const month = this.MONTHS[p.paymentMonth - 1] + ' ' + p.paymentYear;
    const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    const logoHtml = this.agencyLogoUrl()
      ? `<img src="${this.agencyLogoUrl()}" class="logo" alt="Logo" />`
      : '';
    const sigHtml = this.agencySignatureUrl()
      ? `<img src="${this.agencySignatureUrl()}" class="sig-img" alt="Signature" />`
      : `<div class="sig-blank"></div>`;

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>Quittance de loyer – ${month}</title>
  <style>
    @page { size: A4 portrait; margin: 1.5cm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Helvetica, Arial, sans-serif; font-size: 11pt; color: #1a2332; background: white; }

    .header { text-align: center; border-bottom: 3px solid #1B4F72; padding-bottom: 1rem; margin-bottom: 1.5rem; }
    .logo { max-height: 60px; max-width: 200px; object-fit: contain; display: block; margin: 0 auto 0.8rem; }
    h1 { font-size: 14pt; font-weight: 800; letter-spacing: 0.1em; color: #1B4F72; margin-bottom: 0.3rem; }
    .subtitle { font-size: 10pt; color: #64748b; }

    .row { display: flex; justify-content: space-between; padding: 0.4rem 0; font-size: 10.5pt; }
    .row .label { color: #64748b; font-weight: 600; min-width: 180px; }
    .divider { border: none; border-top: 1px solid #e5e7eb; margin: 0.8rem 0; }
    .total { font-size: 11.5pt; font-weight: 700; }

    .text { font-size: 10pt; color: #374151; font-style: italic; line-height: 1.7; margin: 1.2rem 0; }

    .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 2.5rem; }
    .date { font-size: 9.5pt; color: #94a3b8; }
    .sig-block { text-align: center; }
    .sig-label { font-size: 9pt; color: #64748b; margin-bottom: 0.4rem; }
    .sig-img { max-height: 80px; max-width: 180px; object-fit: contain; display: block; }
    .sig-blank { width: 160px; height: 60px; border-bottom: 1px solid #94a3b8; }
  </style>
</head>
<body>
  <div class="header">
    ${logoHtml}
    <h1>QUITTANCE DE LOYER</h1>
    <div class="subtitle">${month}</div>
  </div>

  <div class="row"><span class="label">Bailleur :</span><span>${l.landlordName || 'N/A'}</span></div>
  <div class="row"><span class="label">Locataire :</span><span>${l.tenantName}</span></div>
  <div class="row"><span class="label">Bien loué :</span><span>${l.propertyAddress}, ${l.propertyCity}</span></div>
  <hr class="divider"/>
  <div class="row"><span class="label">Loyer hors charges :</span><span>${l.rentAmount.toFixed(2).replace('.', ',')} €</span></div>
  <div class="row"><span class="label">Charges :</span><span>${l.chargesAmount.toFixed(2).replace('.', ',')} €</span></div>
  <div class="row total"><span class="label">Total perçu :</span><span>${p.paidAmount.toFixed(2).replace('.', ',')} €</span></div>
  <hr class="divider"/>

  <p class="text">
    Je soussigné(e) ${l.landlordName || 'le(la) bailleur(euse)'}, donne quittance à ${l.tenantName}
    pour la somme de <strong>${p.paidAmount.toFixed(2).replace('.', ',')} €</strong>
    au titre du loyer et des charges du logement désigné ci-dessus pour la période du mois de ${month}.
  </p>

  <div class="footer">
    <div class="date">Fait le ${today}</div>
    <div class="sig-block">
      <div class="sig-label">Signature du mandataire</div>
      ${sigHtml}
    </div>
  </div>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=800,height=1000');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  }

  goBack(): void {
    this.router.navigate(['/rental']);
  }
}
