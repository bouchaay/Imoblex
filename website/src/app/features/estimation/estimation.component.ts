import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

type PropertyType = 'apartment' | 'house' | 'villa' | 'studio' | 'loft' | 'land' | 'commercial';

interface StepConfig {
  title: string;
  subtitle: string;
}

@Component({
  selector: 'app-estimation',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- Hero -->
    <div class="bg-gradient-to-br from-dark to-primary pt-28 pb-16">
      <div class="container-fluid text-center text-white">
        <span class="inline-block bg-accent/20 text-accent px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
          Service gratuit & sans engagement
        </span>
        <h1 class="text-display text-white mb-4">Estimation gratuite</h1>
        <p class="text-white/70 max-w-xl mx-auto text-lg">
          Obtenez une estimation précise de votre bien immobilier à Toulouse et en Haute-Garonne en quelques minutes.
        </p>
      </div>
    </div>

    <div class="container-fluid py-12 max-w-3xl">

      @if (!submitted()) {
        <!-- Step progress -->
        <div class="flex items-center justify-center mb-10">
          @for (step of steps; track step.title; let i = $index; let last = $last) {
            <div class="flex items-center">
              <div class="flex flex-col items-center">
                <div class="step-indicator"
                     [class.step-active]="currentStep() === i + 1"
                     [class.step-done]="currentStep() > i + 1"
                     [class.step-pending]="currentStep() < i + 1">
                  @if (currentStep() > i + 1) {
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  } @else {
                    {{ i + 1 }}
                  }
                </div>
                <span class="text-xs mt-1 text-gray-500 hidden sm:block">{{ step.title }}</span>
              </div>
              @if (!last) {
                <div class="w-16 sm:w-24 h-0.5 mx-2 transition-colors duration-300"
                     [class.bg-primary]="currentStep() > i + 1"
                     [class.bg-gray-200]="currentStep() <= i + 1"></div>
              }
            </div>
          }
        </div>

        <!-- Progress bar -->
        <div class="w-full bg-gray-100 rounded-full h-1.5 mb-8">
          <div class="bg-accent h-1.5 rounded-full transition-all duration-500" [style.width]="progressPercent() + '%'"></div>
        </div>

        <!-- Step card -->
        <div class="bg-white rounded-2xl shadow-premium p-8">
          <h2 class="font-heading font-bold text-2xl text-primary mb-2">{{ steps[currentStep() - 1].title }}</h2>
          <p class="text-gray-500 mb-8">{{ steps[currentStep() - 1].subtitle }}</p>

          <!-- STEP 1: Property type -->
          @if (currentStep() === 1) {
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
              @for (type of propertyTypes; track type.value) {
                <button
                  class="flex flex-col items-center p-5 rounded-xl border-2 transition-all hover:-translate-y-0.5"
                  [class.border-primary]="formData.propertyType === type.value"
                  [class.bg-primary]="formData.propertyType === type.value"
                  [class.text-white]="formData.propertyType === type.value"
                  [class.border-gray-200]="formData.propertyType !== type.value"
                  [class.text-gray-600]="formData.propertyType !== type.value"
                  (click)="formData.propertyType = type.value; nextStep()">
                  <svg class="w-8 h-8 mb-3" fill="currentColor" viewBox="0 0 24 24">
                    <path [attr.d]="type.icon"/>
                  </svg>
                  <span class="font-semibold text-sm text-center">{{ type.label }}</span>
                </button>
              }
            </div>
          }

          <!-- STEP 2: Address -->
          @if (currentStep() === 2) {
            <div class="space-y-5">
              <div class="form-group">
                <label class="form-label">Adresse du bien *</label>
                <input type="text" [(ngModel)]="formData.address" class="form-input" placeholder="15 Rue de la Paix">
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                  <label class="form-label">Code postal *</label>
                  <input type="text" [(ngModel)]="formData.postalCode" class="form-input" placeholder="31000">
                </div>
                <div class="form-group">
                  <label class="form-label">Ville *</label>
                  <input type="text" [(ngModel)]="formData.city" class="form-input" placeholder="Toulouse">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Étage (si appartement)</label>
                <input type="number" [(ngModel)]="formData.floor" class="form-input" placeholder="ex : 3">
              </div>
            </div>
          }

          <!-- STEP 3: Details -->
          @if (currentStep() === 3) {
            <div class="space-y-5">
              <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                  <label class="form-label">Surface habitable (m²) *</label>
                  <input type="number" [(ngModel)]="formData.area" class="form-input" placeholder="75">
                </div>
                <div class="form-group">
                  <label class="form-label">Nombre de pièces *</label>
                  <select [(ngModel)]="formData.rooms" class="form-input">
                    <option value="">Sélectionner</option>
                    @for (r of [1,2,3,4,5,6,7]; track r) {
                      <option [value]="r">{{ r }}{{ r === 7 ? '+' : '' }} pièce{{ r > 1 ? 's' : '' }}</option>
                    }
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                  <label class="form-label">Nombre de chambres</label>
                  <select [(ngModel)]="formData.bedrooms" class="form-input">
                    <option value="">Sélectionner</option>
                    @for (b of [0,1,2,3,4,5]; track b) {
                      <option [value]="b">{{ b === 0 ? 'Studio' : b + ' chambre' + (b > 1 ? 's' : '') }}</option>
                    }
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Année de construction</label>
                  <input type="number" [(ngModel)]="formData.yearBuilt" class="form-input" placeholder="ex : 1985">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">État général du bien</label>
                <div class="grid grid-cols-3 gap-3">
                  @for (state of propertyStates; track state.value) {
                    <button
                      class="p-3 rounded-lg border-2 text-sm font-medium transition-all text-center"
                      [class.border-primary]="formData.condition === state.value"
                      [class.bg-primary]="formData.condition === state.value"
                      [class.text-white]="formData.condition === state.value"
                      [class.border-gray-200]="formData.condition !== state.value"
                      [class.text-gray-600]="formData.condition !== state.value"
                      (click)="formData.condition = state.value">
                      {{ state.label }}
                    </button>
                  }
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Atouts du bien (sélectionnez tout ce qui s'applique)</label>
                <div class="grid grid-cols-2 gap-2">
                  @for (feature of propertyFeatures; track feature) {
                    <label class="filter-checkbox bg-gray-50 rounded-lg p-3">
                      <input type="checkbox" [(ngModel)]="feature.checked">
                      {{ feature.label }}
                    </label>
                  }
                </div>
              </div>
            </div>
          }

          <!-- STEP 4: Contact info -->
          @if (currentStep() === 4) {
            <div class="space-y-5">
              <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                  <label class="form-label">Prénom *</label>
                  <input type="text" [(ngModel)]="formData.firstName" class="form-input" placeholder="Jean">
                </div>
                <div class="form-group">
                  <label class="form-label">Nom *</label>
                  <input type="text" [(ngModel)]="formData.lastName" class="form-input" placeholder="Dupont">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Email *</label>
                <input type="email" [(ngModel)]="formData.email" class="form-input" placeholder="jean.dupont@email.fr">
              </div>
              <div class="form-group">
                <label class="form-label">Téléphone *</label>
                <input type="tel" [(ngModel)]="formData.phone" class="form-input" placeholder="06 00 00 00 00">
              </div>
              <div class="form-group">
                <label class="form-label">Quel est votre projet ?</label>
                <select [(ngModel)]="formData.project" class="form-input">
                  <option value="">Sélectionner</option>
                  <option value="sell">Je souhaite vendre</option>
                  <option value="rent">Je souhaite mettre en location</option>
                  <option value="info">Je me renseigne simplement</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Commentaires additionnels</label>
                <textarea [(ngModel)]="formData.notes" rows="3" class="form-input resize-none" placeholder="Informations complémentaires sur votre bien..."></textarea>
              </div>
              <div class="flex items-start gap-2">
                <input type="checkbox" [(ngModel)]="formData.gdpr" id="est-gdpr" class="mt-1 w-4 h-4">
                <label for="est-gdpr" class="text-xs text-gray-500">
                  J'accepte que mes données soient traitées par Imoblex pour ma demande d'estimation.
                  <a href="/politique-confidentialite" class="text-primary hover:underline">En savoir plus</a>
                </label>
              </div>
            </div>
          }

          <!-- Navigation buttons -->
          <div class="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              (click)="prevStep()"
              [class.invisible]="currentStep() === 1"
              class="btn-outline text-sm py-2.5 px-6">
              ← Retour
            </button>

            @if (currentStep() < 4) {
              @if (currentStep() !== 1) {
                <button (click)="nextStep()" class="btn-primary text-sm py-2.5 px-8">
                  Continuer →
                </button>
              }
            } @else {
              <button (click)="submitForm()" class="btn-accent text-sm py-3 px-8">
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
                Obtenir mon estimation
              </button>
            }
          </div>
        </div>

        <!-- Trust indicators -->
        <div class="mt-8 grid grid-cols-3 gap-4 text-center text-sm text-gray-500">
          @for (trust of trustItems; track trust.label) {
            <div class="flex flex-col items-center gap-2">
              <svg class="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 24 24">
                <path [attr.d]="trust.icon"/>
              </svg>
              <span>{{ trust.label }}</span>
            </div>
          }
        </div>

      } @else {
        <!-- Success state -->
        <div class="text-center py-16 bg-white rounded-2xl shadow-premium">
          <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-12 h-12 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </div>
          <h2 class="font-heading font-bold text-3xl text-primary mb-3">Demande reçue !</h2>
          <p class="text-gray-600 max-w-md mx-auto mb-4 leading-relaxed">
            Merci <strong>{{ formData.firstName }}</strong> ! Votre demande d'estimation a bien été enregistrée.
          </p>
          <div class="inline-flex items-center gap-2 bg-accent/10 text-accent px-6 py-3 rounded-xl font-semibold mb-8">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
            </svg>
            Un agent vous contacte sous 24h ouvrées
          </div>
          <div class="flex justify-center gap-4">
            <a routerLink="/" class="btn-outline text-sm">Retour à l'accueil</a>
            <a routerLink="/vente" class="btn-primary text-sm">Voir nos biens</a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class EstimationComponent {
  currentStep = signal(1);
  submitted = signal(false);

  progressPercent = computed(() => ((this.currentStep() - 1) / (this.steps.length - 1)) * 100);

  formData = {
    propertyType: '' as PropertyType | '',
    address: '',
    postalCode: '',
    city: '',
    floor: null as number | null,
    area: null as number | null,
    rooms: '',
    bedrooms: '',
    yearBuilt: null as number | null,
    condition: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    project: '',
    notes: '',
    gdpr: false,
  };

  steps: StepConfig[] = [
    { title: 'Type de bien', subtitle: 'Quel type de bien souhaitez-vous faire estimer ?' },
    { title: 'Localisation', subtitle: 'Où se situe votre bien ?' },
    { title: 'Caractéristiques', subtitle: 'Décrivez les caractéristiques de votre bien.' },
    { title: 'Vos coordonnées', subtitle: 'Pour vous envoyer votre estimation personnalisée.' },
  ];

  propertyTypes = [
    { value: 'apartment' as PropertyType, label: 'Appartement', icon: 'M17 11V3H7v4H3v14h8v-4h2v4h8V11h-4zM7 19H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5v-2h2v2zm4 4H9v-2h2v2zm0-4H9v-2h2v2zm0-4H9V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2z' },
    { value: 'house' as PropertyType, label: 'Maison', icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' },
    { value: 'villa' as PropertyType, label: 'Villa', icon: 'M12 3L2 12h3v9h14v-9h3L12 3zm0 7c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z' },
    { value: 'studio' as PropertyType, label: 'Studio', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z' },
    { value: 'loft' as PropertyType, label: 'Loft', icon: 'M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z' },
    { value: 'land' as PropertyType, label: 'Terrain', icon: 'M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2z' },
    { value: 'commercial' as PropertyType, label: 'Local commercial', icon: 'M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z' },
  ];

  propertyStates = [
    { value: 'new', label: '✨ Neuf / Rénové' },
    { value: 'good', label: '👍 Bon état' },
    { value: 'refresh', label: '🔨 À rafraîchir' },
  ];

  propertyFeatures = [
    { label: 'Balcon / Terrasse', checked: false },
    { label: 'Jardin', checked: false },
    { label: 'Parking / Garage', checked: false },
    { label: 'Piscine', checked: false },
    { label: 'Ascenseur', checked: false },
    { label: 'Gardien', checked: false },
    { label: 'Vue dégagée', checked: false },
    { label: 'Lumineux', checked: false },
  ];

  trustItems = [
    { label: 'Estimation gratuite', icon: 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z' },
    { label: 'Sans engagement', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { label: 'Réponse sous 24h', icon: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z' },
  ];

  nextStep(): void {
    if (this.currentStep() < this.steps.length) {
      this.currentStep.update(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  submitForm(): void {
    console.log('Estimation form submitted:', this.formData);
    this.submitted.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
