import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mandate-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="form-page">
      <div class="page-header">
        <a routerLink="/mandates" class="breadcrumb-link"><i class="pi pi-arrow-left"></i> Mandats</a>
      </div>
      <div class="card">
        <h2 class="card-title">Nouveau mandat</h2>
        <div class="form-grid">
          <div class="form-group"><label class="form-label">Type de mandat *</label>
            <select class="form-input"><option>Exclusif</option><option>Simple</option><option>Semi-exclusif</option></select></div>
          <div class="form-group"><label class="form-label">Bien immobilier *</label>
            <input type="text" class="form-input" placeholder="Rechercher un bien..." /></div>
          <div class="form-group"><label class="form-label">Mandant *</label>
            <input type="text" class="form-input" placeholder="Rechercher un contact..." /></div>
          <div class="form-group"><label class="form-label">Prix mandat *</label>
            <input type="number" class="form-input" placeholder="350000" /></div>
          <div class="form-group"><label class="form-label">Commission (%)</label>
            <input type="number" class="form-input" placeholder="5" step="0.5" /></div>
          <div class="form-group"><label class="form-label">Date de début *</label>
            <input type="date" class="form-input" /></div>
          <div class="form-group"><label class="form-label">Date de fin *</label>
            <input type="date" class="form-input" /></div>
        </div>
        <div class="form-actions">
          <button class="btn-secondary" routerLink="/mandates">Annuler</button>
          <button class="btn-primary" routerLink="/mandates"><i class="pi pi-check"></i> Créer le mandat</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-page { max-width: 700px; margin: 0 auto; }
    .page-header { margin-bottom: 1.25rem; }
    .breadcrumb-link { display: inline-flex; align-items: center; gap: 0.4rem; color: #1B4F72; text-decoration: none; font-size: 0.875rem; font-weight: 500; }
    .card { background: #fff; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
    .card-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.1rem; font-weight: 700; color: #1e293b; margin: 0 0 1.5rem; }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.35rem; }
    .form-label { font-size: 0.82rem; font-weight: 600; color: #374151; }
    .form-input { padding: 0.625rem 0.875rem; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.875rem; outline: none; background: #f8fafc; font-family: inherit; }
    .form-input:focus { border-color: #1B4F72; }
    .form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; }
    .btn-primary { display: flex; align-items: center; gap: 0.4rem; background: #1B4F72; color: #fff; border: none; padding: 0.625rem 1.25rem; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; text-decoration: none; }
    .btn-secondary { display: flex; align-items: center; background: #fff; color: #475569; border: 1.5px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.875rem; cursor: pointer; text-decoration: none; }
  `]
})
export class MandateFormComponent {}
