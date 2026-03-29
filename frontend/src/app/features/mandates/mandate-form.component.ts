import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MandateService } from '../../core/services/mandate.service';
import { MandateType } from '../../core/models/enums';

@Component({
  selector: 'app-mandate-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './mandate-form.component.html',
  styleUrls: ['./mandate-form.component.scss']
})
export class MandateFormComponent {
  private readonly mandateService = inject(MandateService);
  private readonly router = inject(Router);

  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  formData = {
    type: '' as MandateType | '',
    transactionType: 'SALE',
    propertyId: '',
    mandatorId: '',
    price: 0,
    agencyFeesPercent: 5,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ''
  };

  isValid(): boolean {
    return !!(
      this.formData.type &&
      this.formData.price > 0 &&
      this.formData.startDate &&
      this.formData.endDate
    );
  }

  onSave(): void {
    if (!this.isValid()) {
      this.errorMessage.set('Veuillez remplir tous les champs obligatoires (type, prix, dates).');
      return;
    }
    if (new Date(this.formData.endDate) <= new Date(this.formData.startDate)) {
      this.errorMessage.set('La date de fin doit être postérieure à la date de début.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.mandateService.create({
      type: this.formData.type as MandateType,
      price: this.formData.price,
      agencyFeePercent: this.formData.agencyFeesPercent,
      startDate: new Date(this.formData.startDate),
      endDate: new Date(this.formData.endDate),
      propertyId: this.formData.propertyId || undefined,
      mandatorId: this.formData.mandatorId || undefined,
    } as any).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set('Mandat créé avec succès !');
        setTimeout(() => this.router.navigate(['/mandates']), 1500);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.message || 'Erreur lors de la création du mandat. Vérifiez les données saisies.');
      }
    });
  }
}
