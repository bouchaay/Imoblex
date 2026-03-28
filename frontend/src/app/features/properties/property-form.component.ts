import { Component, inject, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from '../../core/services/property.service';
import { PropertyType, PropertyStatus, TransactionType, DpeClass, PROPERTY_TYPE_LABELS, DPE_COLORS } from '../../core/models/enums';
import { DpeBadgeComponent } from '../../shared/components/dpe-badge.component';

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, DpeBadgeComponent],
  template: `
    <div class="form-page">
      <!-- Header -->
      <div class="page-header">
        <div class="breadcrumb">
          <a routerLink="/properties" class="breadcrumb-link">
            <i class="pi pi-arrow-left"></i> Biens
          </a>
          <span>/</span>
          <span>{{ isEdit ? 'Modifier le bien' : 'Nouveau bien' }}</span>
        </div>
        <div class="header-actions">
          <button type="button" class="btn-secondary" routerLink="/properties">Annuler</button>
          <button type="button" class="btn-primary" (click)="onSave()" [disabled]="isSaving()">
            @if (isSaving()) {
              <span class="spinner-sm"></span> Enregistrement...
            } @else {
              <i class="pi pi-save"></i> {{ isEdit ? 'Mettre à jour' : 'Créer le bien' }}
            }
          </button>
        </div>
      </div>

      <!-- Step indicators -->
      <div class="steps-bar">
        @for (step of steps; track step.id; let i = $index) {
          <div class="step" [class.active]="currentStep() === i" [class.completed]="currentStep() > i"
            (click)="goToStep(i)">
            <div class="step-number">
              @if (currentStep() > i) { <i class="pi pi-check"></i> } @else { {{ i + 1 }} }
            </div>
            <span class="step-label">{{ step.label }}</span>
          </div>
          @if (i < steps.length - 1) { <div class="step-divider" [class.completed]="currentStep() > i"></div> }
        }
      </div>

      <!-- Form content -->
      <div class="form-content" [formGroup]="form">

        <!-- Step 0: Informations générales -->
        @if (currentStep() === 0) {
          <div class="step-panel animate-fade">
            <div class="form-grid-2">
              <div class="card form-card">
                <h3 class="card-section-title">Type de bien</h3>
                <div class="type-selector">
                  @for (type of propertyTypes; track type.value) {
                    <div class="type-option"
                      [class.selected]="form.get('type')?.value === type.value"
                      (click)="form.get('type')?.setValue(type.value)">
                      <i class="pi {{ type.icon }}"></i>
                      <span>{{ type.label }}</span>
                    </div>
                  }
                </div>
              </div>

              <div class="card form-card">
                <h3 class="card-section-title">Transaction</h3>
                <div class="transaction-toggle">
                  <div class="toggle-option"
                    [class.selected]="form.get('transactionType')?.value === 'SALE'"
                    (click)="form.get('transactionType')?.setValue('SALE')">
                    <i class="pi pi-home"></i>
                    <span>Vente</span>
                  </div>
                  <div class="toggle-option"
                    [class.selected]="form.get('transactionType')?.value === 'RENTAL'"
                    (click)="form.get('transactionType')?.setValue('RENTAL')">
                    <i class="pi pi-key"></i>
                    <span>Location</span>
                  </div>
                </div>

                <div class="form-group" style="margin-top: 1.5rem">
                  <label class="form-label required">Titre de l'annonce *</label>
                  <input type="text" formControlName="title" class="form-input" placeholder="Ex: Appartement 3P lumineux - Paris 8ème" />
                </div>

                <div class="form-group">
                  <label class="form-label required">Prix *</label>
                  <div class="input-with-suffix">
                    <input type="number" formControlName="price" class="form-input" placeholder="350000" />
                    <span class="input-suffix">€{{ form.get('transactionType')?.value === 'RENTAL' ? '/mois' : '' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="card form-card">
              <h3 class="card-section-title">Description</h3>
              <textarea formControlName="description" class="form-textarea" rows="5"
                placeholder="Décrivez le bien en détail : état, atouts, environnement..."></textarea>
            </div>
          </div>
        }

        <!-- Step 1: Localisation -->
        @if (currentStep() === 1) {
          <div class="step-panel animate-fade">
            <div class="form-grid-2">
              <div class="card form-card">
                <h3 class="card-section-title">Adresse</h3>
                <div class="form-group">
                  <label class="form-label">Numéro et rue</label>
                  <input type="text" formControlName="street" class="form-input" placeholder="14 Avenue Foch" />
                </div>
                <div class="form-group">
                  <label class="form-label required">Ville *</label>
                  <input type="text" formControlName="city" class="form-input" placeholder="Paris" />
                </div>
                <div class="form-grid-2-sm">
                  <div class="form-group">
                    <label class="form-label required">Code postal *</label>
                    <input type="text" formControlName="postalCode" class="form-input" placeholder="75008" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Département</label>
                    <input type="text" formControlName="department" class="form-input" placeholder="Paris" />
                  </div>
                </div>
              </div>

              <div class="card form-card">
                <h3 class="card-section-title">Coordonnées GPS</h3>
                <div class="map-placeholder">
                  <i class="pi pi-map-marker"></i>
                  <span>Entrez l'adresse pour géolocaliser automatiquement</span>
                </div>
                <div class="form-grid-2-sm" style="margin-top:1rem">
                  <div class="form-group">
                    <label class="form-label">Latitude</label>
                    <input type="number" formControlName="latitude" class="form-input" placeholder="48.8566" step="0.0001" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Longitude</label>
                    <input type="number" formControlName="longitude" class="form-input" placeholder="2.3522" step="0.0001" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- Step 2: Détails -->
        @if (currentStep() === 2) {
          <div class="step-panel animate-fade">
            <div class="form-grid-2">
              <div class="card form-card">
                <h3 class="card-section-title">Surfaces et pièces</h3>
                <div class="form-grid-3">
                  <div class="form-group">
                    <label class="form-label required">Surface *</label>
                    <div class="input-with-suffix">
                      <input type="number" formControlName="surface" class="form-input" placeholder="75" />
                      <span class="input-suffix">m²</span>
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label required">Pièces *</label>
                    <input type="number" formControlName="rooms" class="form-input" placeholder="3" min="1" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Chambres</label>
                    <input type="number" formControlName="bedrooms" class="form-input" placeholder="2" min="0" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Salle de bains</label>
                    <input type="number" formControlName="bathrooms" class="form-input" placeholder="1" min="0" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Étage</label>
                    <input type="number" formControlName="floor" class="form-input" placeholder="3" min="0" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Année construction</label>
                    <input type="number" formControlName="constructionYear" class="form-input" placeholder="1980" />
                  </div>
                </div>
              </div>

              <div class="card form-card">
                <h3 class="card-section-title">Équipements</h3>
                <div class="amenities-checkboxes">
                  @for (amenity of amenityOptions; track amenity.key) {
                    <label class="amenity-check">
                      <input type="checkbox" [formControlName]="amenity.key" />
                      <span class="check-custom"></span>
                      <i class="pi {{ amenity.icon }}"></i>
                      {{ amenity.label }}
                    </label>
                  }
                </div>
              </div>
            </div>

            <!-- DPE Selector -->
            <div class="card form-card">
              <h3 class="card-section-title">Diagnostic de Performance Énergétique (DPE)</h3>
              <div class="dpe-selector">
                @for (cls of dpeClasses; track cls) {
                  <div class="dpe-option"
                    [class.selected]="form.get('dpe')?.value === cls"
                    [style.border-color]="form.get('dpe')?.value === cls ? getDpeColor(cls) : 'transparent'"
                    (click)="form.get('dpe')?.setValue(cls)">
                    <div class="dpe-block" [style.background]="getDpeColor(cls)">
                      <span>{{ cls }}</span>
                    </div>
                    <span class="dpe-label">{{ getDpeLabel(cls) }}</span>
                  </div>
                }
              </div>
            </div>
          </div>
        }

        <!-- Step 3: Photos -->
        @if (currentStep() === 3) {
          <div class="step-panel animate-fade">
            <div class="card form-card">
              <h3 class="card-section-title">Photos du bien</h3>
              <p class="section-hint">Ajoutez des photos de qualité pour maximiser l'attractivité de votre annonce.</p>

              <!-- Drop zone -->
              <div class="dropzone"
                [class.dragover]="isDragging()"
                (dragover)="$event.preventDefault(); isDragging.set(true)"
                (dragleave)="isDragging.set(false)"
                (drop)="onDrop($event)"
                (click)="fileInput.click()">
                <i class="pi pi-cloud-upload"></i>
                <div class="dropzone-text">
                  <strong>Glissez vos photos ici</strong>
                  <span>ou cliquez pour parcourir</span>
                </div>
                <span class="dropzone-hint">JPG, PNG, WEBP — Max 10 Mo par photo</span>
              </div>
              <input #fileInput type="file" multiple accept="image/*" (change)="onFilesSelected($event)" style="display:none" />

              <!-- Photo previews -->
              @if (photoFiles().length > 0) {
                <div class="photo-grid">
                  @for (photo of photoFiles(); track photo.name; let i = $index) {
                    <div class="photo-preview-item" [class.primary]="i === 0">
                      <img [src]="photo.preview" [alt]="photo.name" />
                      <div class="photo-preview-overlay">
                        @if (i === 0) { <span class="primary-badge">Photo principale</span> }
                        <button class="remove-photo-btn" (click)="removePhoto(i)">
                          <i class="pi pi-times"></i>
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }

        <!-- Step 4: Publication -->
        @if (currentStep() === 4) {
          <div class="step-panel animate-fade">
            <div class="card form-card">
              <h3 class="card-section-title">Options de publication</h3>

              <div class="publish-options">
                <div class="publish-option" [class.selected]="publishOption() === 'draft'" (click)="publishOption.set('draft')">
                  <div class="pub-icon"><i class="pi pi-file"></i></div>
                  <div class="pub-info">
                    <div class="pub-title">Sauvegarder en brouillon</div>
                    <div class="pub-desc">Le bien sera visible uniquement en back-office</div>
                  </div>
                  <div class="pub-radio" [class.checked]="publishOption() === 'draft'"></div>
                </div>
                <div class="publish-option" [class.selected]="publishOption() === 'publish'" (click)="publishOption.set('publish')">
                  <div class="pub-icon pub-icon-green"><i class="pi pi-eye"></i></div>
                  <div class="pub-info">
                    <div class="pub-title">Publier immédiatement</div>
                    <div class="pub-desc">Le bien sera visible sur tous les portails connectés</div>
                  </div>
                  <div class="pub-radio" [class.checked]="publishOption() === 'publish'"></div>
                </div>
              </div>

              <!-- Summary -->
              <div class="publish-summary">
                <h4>Récapitulatif</h4>
                <div class="summary-grid">
                  <div><span>Titre :</span> {{ form.get('title')?.value || '—' }}</div>
                  <div><span>Type :</span> {{ getTypeLabel(form.get('type')?.value) }}</div>
                  <div><span>Prix :</span> {{ form.get('price')?.value ? (form.get('price')!.value | number:'1.0-0':'fr') + ' €' : '—' }}</div>
                  <div><span>Ville :</span> {{ form.get('city')?.value || '—' }}</div>
                  <div><span>Surface :</span> {{ form.get('surface')?.value ? form.get('surface')!.value + ' m²' : '—' }}</div>
                  <div><span>Pièces :</span> {{ form.get('rooms')?.value || '—' }}</div>
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Navigation buttons -->
      <div class="form-nav">
        @if (currentStep() > 0) {
          <button type="button" class="btn-secondary" (click)="goToStep(currentStep() - 1)">
            <i class="pi pi-chevron-left"></i> Précédent
          </button>
        } @else {
          <div></div>
        }
        <div class="nav-right">
          @if (currentStep() < steps.length - 1) {
            <button type="button" class="btn-primary" (click)="goToStep(currentStep() + 1)">
              Suivant <i class="pi pi-chevron-right"></i>
            </button>
          } @else {
            <button type="button" class="btn-success" (click)="onSave()" [disabled]="isSaving()">
              @if (isSaving()) {
                <span class="spinner-sm"></span> Enregistrement...
              } @else {
                <i class="pi pi-check"></i> Confirmer
              }
            </button>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-page { max-width: 1000px; margin: 0 auto; animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade { animation: fadeIn 0.25s ease; }

    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
    .breadcrumb { display: flex; align-items: center; gap: 0.75rem; font-size: 0.875rem; color: #64748b; }
    .breadcrumb-link { display: flex; align-items: center; gap: 0.4rem; color: #1B4F72; text-decoration: none; font-weight: 500; }
    .header-actions { display: flex; gap: 0.75rem; }

    .btn-primary { display: flex; align-items: center; gap: 0.4rem; background: #1B4F72; color: #fff; border: none; padding: 0.625rem 1.125rem; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-primary:hover:not(:disabled) { background: #164469; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { display: flex; align-items: center; gap: 0.4rem; background: #fff; color: #475569; border: 1.5px solid #e2e8f0; padding: 0.625rem 1.125rem; border-radius: 8px; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s; text-decoration: none; }
    .btn-secondary:hover { border-color: #cbd5e1; background: #f8fafc; }
    .btn-success { display: flex; align-items: center; gap: 0.4rem; background: #10b981; color: #fff; border: none; padding: 0.625rem 1.25rem; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-success:hover:not(:disabled) { background: #059669; }
    .btn-success:disabled { opacity: 0.6; cursor: not-allowed; }

    /* Steps bar */
    .steps-bar {
      display: flex; align-items: center; margin-bottom: 1.5rem;
      background: #fff; padding: 1rem 1.5rem; border-radius: 12px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    .step {
      display: flex; align-items: center; gap: 0.5rem;
      cursor: pointer; transition: all 0.2s; flex-shrink: 0;
    }
    .step-number {
      width: 28px; height: 28px; border-radius: 50%;
      background: #e2e8f0; color: #64748b;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.78rem; font-weight: 700; transition: all 0.2s;
    }
    .step.active .step-number { background: #1B4F72; color: #fff; }
    .step.completed .step-number { background: #10b981; color: #fff; }
    .step-label { font-size: 0.82rem; font-weight: 500; color: #94a3b8; }
    .step.active .step-label { color: #1B4F72; font-weight: 600; }
    .step.completed .step-label { color: #10b981; }
    .step-divider { flex: 1; height: 2px; background: #e2e8f0; margin: 0 0.75rem; min-width: 20px; }
    .step-divider.completed { background: #10b981; }

    /* Form content */
    .form-content { margin-bottom: 1.5rem; }
    .step-panel { display: flex; flex-direction: column; gap: 1.25rem; }

    .card { background: #fff; border-radius: 12px; padding: 1.25rem; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
    .form-card { }
    .card-section-title { font-size: 0.95rem; font-weight: 700; color: #1e293b; margin: 0 0 1.125rem; }
    .section-hint { font-size: 0.82rem; color: #64748b; margin: -0.5rem 0 1rem; }

    .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
    @media (max-width: 768px) { .form-grid-2 { grid-template-columns: 1fr; } }
    .form-grid-2-sm { display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem; }
    .form-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.875rem; }
    @media (max-width: 768px) { .form-grid-3 { grid-template-columns: repeat(2, 1fr); } }

    .form-group { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 0.875rem; }
    .form-group:last-child { margin-bottom: 0; }
    .form-label { font-size: 0.82rem; font-weight: 600; color: #374151; }
    .form-label.required::after { content: ' *'; color: #ef4444; }
    .form-input {
      padding: 0.625rem 0.875rem; border: 1.5px solid #e2e8f0; border-radius: 8px;
      font-size: 0.875rem; color: #1e293b; outline: none; transition: all 0.2s; width: 100%;
      background: #f8fafc; box-sizing: border-box; font-family: inherit;
    }
    .form-input:focus { border-color: #1B4F72; background: #fff; box-shadow: 0 0 0 3px rgba(27,79,114,0.08); }
    .form-textarea {
      padding: 0.75rem; border: 1.5px solid #e2e8f0; border-radius: 8px;
      font-size: 0.875rem; color: #1e293b; outline: none; width: 100%; resize: vertical;
      background: #f8fafc; font-family: inherit; transition: all 0.2s;
    }
    .form-textarea:focus { border-color: #1B4F72; background: #fff; box-shadow: 0 0 0 3px rgba(27,79,114,0.08); }

    .input-with-suffix { display: flex; align-items: center; }
    .input-with-suffix .form-input { border-radius: 8px 0 0 8px; flex: 1; }
    .input-suffix { background: #f1f5f9; border: 1.5px solid #e2e8f0; border-left: none; padding: 0.625rem 0.75rem; border-radius: 0 8px 8px 0; font-size: 0.85rem; color: #64748b; white-space: nowrap; }

    /* Type selector */
    .type-selector { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.625rem; }
    .type-option {
      display: flex; flex-direction: column; align-items: center; gap: 0.4rem;
      padding: 0.875rem 0.5rem; border: 1.5px solid #e2e8f0; border-radius: 10px;
      cursor: pointer; transition: all 0.15s; font-size: 0.78rem; color: #64748b; font-weight: 500;
    }
    .type-option i { font-size: 1.1rem; }
    .type-option:hover { border-color: #1B4F72; color: #1B4F72; background: rgba(27,79,114,0.04); }
    .type-option.selected { border-color: #1B4F72; background: rgba(27,79,114,0.08); color: #1B4F72; }

    /* Transaction toggle */
    .transaction-toggle { display: grid; grid-template-columns: 1fr 1fr; gap: 0.625rem; }
    .toggle-option {
      display: flex; flex-direction: column; align-items: center; gap: 0.4rem;
      padding: 1rem; border: 1.5px solid #e2e8f0; border-radius: 10px;
      cursor: pointer; transition: all 0.15s; font-size: 0.85rem; color: #64748b;
    }
    .toggle-option i { font-size: 1.25rem; }
    .toggle-option:hover { border-color: #1B4F72; color: #1B4F72; }
    .toggle-option.selected { border-color: #1B4F72; background: rgba(27,79,114,0.08); color: #1B4F72; font-weight: 600; }

    /* Map placeholder */
    .map-placeholder {
      height: 160px; background: #f1f5f9; border: 2px dashed #cbd5e1;
      border-radius: 10px; display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 0.5rem;
      color: #94a3b8; font-size: 0.85rem;
    }
    .map-placeholder i { font-size: 2rem; }

    /* DPE selector */
    .dpe-selector { display: flex; gap: 0.625rem; flex-wrap: wrap; }
    .dpe-option {
      display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
      padding: 0.75rem; border: 2px solid transparent; border-radius: 10px;
      cursor: pointer; transition: all 0.2s; min-width: 64px;
    }
    .dpe-option:hover { background: #f8fafc; }
    .dpe-option.selected { background: rgba(27,79,114,0.04); }
    .dpe-block {
      width: 40px; height: 40px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-weight: 800; font-size: 1rem;
    }
    .dpe-label { font-size: 0.65rem; color: #64748b; text-align: center; }

    /* Amenities */
    .amenities-checkboxes { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .amenity-check {
      display: flex; align-items: center; gap: 0.5rem;
      font-size: 0.82rem; color: #475569; cursor: pointer;
    }
    .amenity-check input { display: none; }
    .check-custom {
      width: 18px; height: 18px; border: 1.5px solid #cbd5e1; border-radius: 4px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.15s;
    }
    .amenity-check input:checked + .check-custom { background: #1B4F72; border-color: #1B4F72; }
    .amenity-check input:checked + .check-custom::after { content: '✓'; color: #fff; font-size: 0.7rem; font-weight: 700; }
    .amenity-check i { font-size: 0.8rem; color: #94a3b8; }

    /* Dropzone */
    .dropzone {
      border: 2px dashed #cbd5e1; border-radius: 12px; padding: 2.5rem;
      display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
      cursor: pointer; transition: all 0.2s; background: #fafbfc;
    }
    .dropzone:hover, .dropzone.dragover { border-color: #1B4F72; background: rgba(27,79,114,0.03); }
    .dropzone i { font-size: 2.5rem; color: #94a3b8; }
    .dropzone-text { text-align: center; }
    .dropzone-text strong { display: block; font-size: 0.9rem; color: #374151; }
    .dropzone-text span { font-size: 0.8rem; color: #94a3b8; }
    .dropzone-hint { font-size: 0.72rem; color: #b0bec5; }

    .photo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-top: 1rem; }
    .photo-preview-item {
      position: relative; border-radius: 10px; overflow: hidden;
      aspect-ratio: 4/3; border: 2px solid transparent;
    }
    .photo-preview-item.primary { border-color: #F39C12; }
    .photo-preview-item img { width: 100%; height: 100%; object-fit: cover; }
    .photo-preview-overlay {
      position: absolute; inset: 0; background: rgba(0,0,0,0.3);
      opacity: 0; transition: opacity 0.2s;
      display: flex; align-items: flex-start; justify-content: flex-end; padding: 6px;
    }
    .photo-preview-item:hover .photo-preview-overlay { opacity: 1; }
    .primary-badge {
      position: absolute; bottom: 6px; left: 6px;
      background: #F39C12; color: #fff; font-size: 0.65rem; font-weight: 700;
      padding: 2px 8px; border-radius: 100px;
    }
    .remove-photo-btn {
      width: 24px; height: 24px; background: rgba(239,68,68,0.9);
      border: none; border-radius: 50%; color: #fff; cursor: pointer;
      display: flex; align-items: center; justify-content: center; font-size: 0.7rem;
    }

    /* Publication */
    .publish-options { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; }
    .publish-option {
      display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem;
      border: 2px solid #e2e8f0; border-radius: 12px; cursor: pointer; transition: all 0.15s;
    }
    .publish-option:hover { border-color: #1B4F72; }
    .publish-option.selected { border-color: #1B4F72; background: rgba(27,79,114,0.04); }
    .pub-icon {
      width: 44px; height: 44px; border-radius: 10px;
      background: rgba(100,116,139,0.1); display: flex; align-items: center;
      justify-content: center; font-size: 1.1rem; color: #64748b; flex-shrink: 0;
    }
    .pub-icon-green { background: rgba(16,185,129,0.1); color: #10b981; }
    .pub-info { flex: 1; }
    .pub-title { font-size: 0.9rem; font-weight: 600; color: #1e293b; }
    .pub-desc { font-size: 0.78rem; color: #64748b; }
    .pub-radio {
      width: 20px; height: 20px; border-radius: 50%;
      border: 2px solid #cbd5e1; flex-shrink: 0; transition: all 0.15s;
    }
    .pub-radio.checked { border-color: #1B4F72; background: #1B4F72; border-width: 5px; }

    .publish-summary { background: #f8fafc; border-radius: 10px; padding: 1rem; }
    .publish-summary h4 { font-size: 0.85rem; font-weight: 700; color: #374151; margin: 0 0 0.75rem; }
    .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
    .summary-grid div { font-size: 0.82rem; color: #475569; }
    .summary-grid span { font-weight: 600; color: #1e293b; }

    /* Form nav */
    .form-nav {
      display: flex; justify-content: space-between; align-items: center;
      padding-top: 1.25rem; border-top: 1px solid #e2e8f0;
    }
    .nav-right { display: flex; gap: 0.75rem; }

    .spinner-sm {
      width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class PropertyFormComponent implements OnInit {
  @Input() id?: string;
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly propertyService = inject(PropertyService);

  form!: FormGroup;
  currentStep = signal(0);
  isSaving = signal(false);
  isDragging = signal(false);
  publishOption = signal<'draft' | 'publish'>('draft');
  photoFiles = signal<{ name: string; preview: string }[]>([]);
  isEdit = false;

  steps = [
    { id: 0, label: 'Informations' },
    { id: 1, label: 'Localisation' },
    { id: 2, label: 'Détails' },
    { id: 3, label: 'Photos' },
    { id: 4, label: 'Publication' }
  ];

  propertyTypes = Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
    icon: this.getTypeIcon(value)
  }));

  amenityOptions = [
    { key: 'hasParking', label: 'Parking', icon: 'pi-car' },
    { key: 'hasGarage', label: 'Garage', icon: 'pi-car' },
    { key: 'hasGarden', label: 'Jardin', icon: 'pi-map' },
    { key: 'hasPool', label: 'Piscine', icon: 'pi-droplet' },
    { key: 'hasBalcony', label: 'Balcon', icon: 'pi-external-link' },
    { key: 'hasTerrace', label: 'Terrasse', icon: 'pi-home' },
    { key: 'hasElevator', label: 'Ascenseur', icon: 'pi-sort-alt' },
    { key: 'hasCellar', label: 'Cave', icon: 'pi-inbox' }
  ];

  dpeClasses = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  ngOnInit(): void {
    const routeId = this.id || this.route.snapshot.paramMap.get('id');
    this.isEdit = !!routeId && !this.route.snapshot.url.some(s => s.path === 'new');

    this.form = this.fb.group({
      type: ['APARTMENT', Validators.required],
      transactionType: ['SALE', Validators.required],
      title: ['', [Validators.required, Validators.minLength(10)]],
      description: [''],
      price: [null, [Validators.required, Validators.min(1)]],
      street: [''],
      city: ['', Validators.required],
      postalCode: [''],
      department: [''],
      latitude: [null],
      longitude: [null],
      surface: [null, [Validators.required, Validators.min(1)]],
      rooms: [null, Validators.required],
      bedrooms: [null],
      bathrooms: [null],
      floor: [null],
      constructionYear: [null],
      dpe: [null],
      hasParking: [false],
      hasGarage: [false],
      hasGarden: [false],
      hasPool: [false],
      hasBalcony: [false],
      hasTerrace: [false],
      hasElevator: [false],
      hasCellar: [false]
    });

    if (this.isEdit && routeId) {
      this.propertyService.getById(routeId).subscribe(p => {
        this.form.patchValue({
          type: p.type, transactionType: p.transactionType,
          title: p.title, description: p.description, price: p.price,
          street: p.address.street, city: p.address.city,
          postalCode: p.address.postalCode,
          latitude: p.address.latitude, longitude: p.address.longitude,
          surface: p.features.surface, rooms: p.features.rooms,
          bedrooms: p.features.bedrooms, bathrooms: p.features.bathrooms,
          floor: p.features.floor, constructionYear: p.features.constructionYear,
          dpe: p.dpe,
          hasParking: p.features.hasParking, hasGarage: p.features.hasGarage,
          hasGarden: p.features.hasGarden, hasPool: p.features.hasPool,
          hasBalcony: p.features.hasBalcony, hasTerrace: p.features.hasTerrace,
          hasElevator: p.features.hasElevator, hasCellar: p.features.hasCellar
        });
      });
    }
  }

  goToStep(step: number): void {
    this.currentStep.set(Math.max(0, Math.min(step, this.steps.length - 1)));
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const files = event.dataTransfer?.files;
    if (files) this.processFiles(files);
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) this.processFiles(input.files);
  }

  processFiles(files: FileList): void {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.photoFiles.update(photos => [...photos, { name: file.name, preview: e.target?.result as string }]);
      };
      reader.readAsDataURL(file);
    });
  }

  removePhoto(index: number): void {
    this.photoFiles.update(photos => photos.filter((_, i) => i !== index));
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    const fv = this.form.value;
    const data: any = {
      type: fv.type,
      transactionType: fv.transactionType,
      title: fv.title,
      description: fv.description,
      price: fv.price,
      address: { street: fv.street, city: fv.city, postalCode: fv.postalCode, country: 'France', latitude: fv.latitude, longitude: fv.longitude },
      features: { surface: fv.surface, rooms: fv.rooms, bedrooms: fv.bedrooms, bathrooms: fv.bathrooms, floor: fv.floor, constructionYear: fv.constructionYear, hasParking: fv.hasParking, hasGarage: fv.hasGarage, hasGarden: fv.hasGarden, hasPool: fv.hasPool, hasBalcony: fv.hasBalcony, hasTerrace: fv.hasTerrace, hasElevator: fv.hasElevator, hasCellar: fv.hasCellar, isGroundFloor: false },
      dpe: fv.dpe,
      isPublished: this.publishOption() === 'publish',
      status: this.publishOption() === 'publish' ? PropertyStatus.AVAILABLE : PropertyStatus.DRAFT,
      photos: []
    };

    const op = this.isEdit
      ? this.propertyService.update(this.route.snapshot.paramMap.get('id')!, data)
      : this.propertyService.create(data);

    op.subscribe(() => {
      this.router.navigate(['/properties']);
    });
  }

  getDpeColor(cls: string): string {
    return DPE_COLORS[cls as DpeClass] || '#9ca3af';
  }

  getDpeLabel(cls: string): string {
    const labels: Record<string, string> = { A: 'Très bon', B: 'Bon', C: 'Assez bon', D: 'Moyen', E: 'Médiocre', F: 'Mauvais', G: 'Très mauvais' };
    return labels[cls] || '';
  }

  getTypeLabel(type: string): string {
    return PROPERTY_TYPE_LABELS[type as PropertyType] || type;
  }

  private getTypeIcon(type: string): string {
    const icons: Record<string, string> = { APARTMENT: 'pi-building', HOUSE: 'pi-home', VILLA: 'pi-sun', STUDIO: 'pi-inbox', LOFT: 'pi-box', DUPLEX: 'pi-copy', LAND: 'pi-map', COMMERCIAL: 'pi-shop', OFFICE: 'pi-briefcase', GARAGE: 'pi-car', PARKING: 'pi-car' };
    return icons[type] || 'pi-building';
  }
}
