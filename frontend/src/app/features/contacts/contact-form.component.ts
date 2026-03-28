import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ContactService } from '../../core/services/contact.service';
import { ContactType, TransactionType, PropertyType } from '../../core/models/enums';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="form-page">
      <div class="page-header">
        <div class="breadcrumb">
          <a routerLink="/contacts" class="breadcrumb-link"><i class="pi pi-arrow-left"></i> Contacts</a>
          <span>/</span><span>Nouveau contact</span>
        </div>
      </div>
      <div class="card" [formGroup]="form">
        <h2 class="card-title">Informations du contact</h2>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Civilité</label>
            <select formControlName="civility" class="form-input">
              <option value="">—</option>
              <option value="M">M.</option>
              <option value="Mme">Mme</option>
              <option value="Dr">Dr</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label required">Prénom *</label>
            <input type="text" formControlName="firstName" class="form-input" placeholder="Jean" />
          </div>
          <div class="form-group">
            <label class="form-label required">Nom *</label>
            <input type="text" formControlName="lastName" class="form-input" placeholder="Dupont" />
          </div>
          <div class="form-group">
            <label class="form-label required">Type *</label>
            <select formControlName="type" class="form-input">
              <option value="BUYER">Acheteur</option>
              <option value="SELLER">Vendeur</option>
              <option value="TENANT">Locataire</option>
              <option value="LANDLORD">Propriétaire</option>
              <option value="PROSPECT">Prospect</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" formControlName="email" class="form-input" placeholder="jean.dupont@email.fr" />
          </div>
          <div class="form-group">
            <label class="form-label">Téléphone mobile</label>
            <input type="tel" formControlName="mobilePhone" class="form-input" placeholder="+33 6 12 34 56 78" />
          </div>
          <div class="form-group">
            <label class="form-label">Ville</label>
            <input type="text" formControlName="city" class="form-input" placeholder="Paris" />
          </div>
          <div class="form-group">
            <label class="form-label">Source</label>
            <select formControlName="source" class="form-input">
              <option value="">Sélectionner...</option>
              <option>Site web</option>
              <option>Recommandation</option>
              <option>Portail immobilier</option>
              <option>Agence</option>
              <option>Réseau social</option>
            </select>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn-secondary" routerLink="/contacts">Annuler</button>
          <button type="button" class="btn-primary" (click)="onSave()" [disabled]="isSaving">
            @if (isSaving) { <span class="spinner-sm"></span> Enregistrement... } @else { <i class="pi pi-check"></i> Créer le contact }
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-page { max-width: 700px; margin: 0 auto; }
    .page-header { margin-bottom: 1.25rem; }
    .breadcrumb { display: flex; align-items: center; gap: 0.75rem; font-size: 0.875rem; color: #64748b; }
    .breadcrumb-link { display: flex; align-items: center; gap: 0.4rem; color: #1B4F72; text-decoration: none; font-weight: 500; }
    .card { background: #fff; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
    .card-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.1rem; font-weight: 700; color: #1e293b; margin: 0 0 1.5rem; }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
    .form-group { display: flex; flex-direction: column; gap: 0.35rem; }
    .form-label { font-size: 0.82rem; font-weight: 600; color: #374151; }
    .form-label.required::after { content: ' *'; color: #ef4444; }
    .form-input { padding: 0.625rem 0.875rem; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.875rem; color: #1e293b; outline: none; background: #f8fafc; font-family: inherit; }
    .form-input:focus { border-color: #1B4F72; background: #fff; }
    .form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; }
    .btn-primary { display: flex; align-items: center; gap: 0.4rem; background: #1B4F72; color: #fff; border: none; padding: 0.625rem 1.25rem; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { display: flex; align-items: center; gap: 0.4rem; background: #fff; color: #475569; border: 1.5px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.875rem; cursor: pointer; text-decoration: none; }
    .spinner-sm { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class ContactFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly contactService = inject(ContactService);

  isSaving = false;

  form = this.fb.group({
    civility: [''],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    type: ['BUYER', Validators.required],
    email: ['', Validators.email],
    mobilePhone: [''],
    city: [''],
    source: ['']
  });

  onSave(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSaving = true;
    const fv = this.form.value;
    this.contactService.create({
      civility: fv.civility as any,
      firstName: fv.firstName!,
      lastName: fv.lastName!,
      type: fv.type as ContactType,
      email: fv.email || undefined,
      mobilePhone: fv.mobilePhone || undefined,
      address: { city: fv.city || undefined },
      source: fv.source || undefined
    }).subscribe(() => this.router.navigate(['/contacts']));
  }
}
