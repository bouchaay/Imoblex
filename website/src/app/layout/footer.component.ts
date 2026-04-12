import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NewsletterService } from '../shared/services/newsletter.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  private readonly newsletterService = inject(NewsletterService);

  currentYear = new Date().getFullYear();

  // Modal
  showModal = signal(false);
  sending = signal(false);
  error = signal('');
  success = signal(false);

  formData = {
    email: '',
    city: '',
    transactionType: 'BOTH',
    minBudget: null as number | null,
    maxBudget: null as number | null,
    propertyTypes: [] as string[],
    gdprConsent: false,
  };

  propertyTypeOptions = [
    { value: 'APARTMENT', label: 'Appartement' },
    { value: 'HOUSE', label: 'Maison' },
    { value: 'VILLA', label: 'Villa' },
    { value: 'STUDIO', label: 'Studio' },
    { value: 'LOFT', label: 'Loft' },
    { value: 'LAND', label: 'Terrain' },
    { value: 'COMMERCIAL', label: 'Local commercial' },
  ];

  openModal(): void {
    this.showModal.set(true);
    this.success.set(false);
    this.error.set('');
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  togglePropertyType(val: string): void {
    const idx = this.formData.propertyTypes.indexOf(val);
    if (idx >= 0) this.formData.propertyTypes.splice(idx, 1);
    else this.formData.propertyTypes.push(val);
  }

  submitSubscription(): void {
    if (this.sending()) return;
    this.error.set('');
    this.sending.set(true);

    this.newsletterService.subscribe({
      email: this.formData.email,
      city: this.formData.city || undefined,
      transactionType: this.formData.transactionType,
      minBudget: this.formData.minBudget ?? undefined,
      maxBudget: this.formData.maxBudget ?? undefined,
      propertyTypes: this.formData.propertyTypes.length > 0 ? this.formData.propertyTypes.join(',') : undefined,
      gdprConsent: this.formData.gdprConsent,
    }).subscribe({
      next: () => {
        this.sending.set(false);
        this.success.set(true);
      },
      error: () => {
        this.sending.set(false);
        this.error.set('Une erreur est survenue. Veuillez réessayer.');
      }
    });
  }

  // Keep all existing properties
  socialLinks = [
    { name: 'Facebook', url: 'https://facebook.com', icon: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' },
    { name: 'Instagram', url: 'https://instagram.com', icon: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z' },
    { name: 'LinkedIn', url: 'https://linkedin.com', icon: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z' },
  ];

  serviceLinks = [
    { path: '/vente', label: 'Vente immobilière' },
    { path: '/location', label: 'Location' },
    { path: '/estimation', label: 'Estimation gratuite' },
    { path: '/simulateur-pret', label: 'Simulateur de prêt' },
    { path: '/agence', label: 'Gestion locative' },
    { path: '/contact', label: 'Nous contacter' },
  ];

  propertyLinks = [
    { path: '/vente?type=apartment', label: 'Appartements à vendre' },
    { path: '/vente?type=house', label: 'Maisons à vendre' },
    { path: '/vente?type=villa', label: 'Villas de prestige' },
    { path: '/location?type=apartment', label: 'Appartements à louer' },
    { path: '/location?type=house', label: 'Maisons à louer' },
    { path: '/vente?type=commercial', label: 'Locaux commerciaux' },
  ];

  legalLinks = [
    { path: '/mentions-legales', label: 'Mentions légales' },
    { path: '/politique-confidentialite', label: 'Confidentialité' },
    { path: '/cookies', label: 'Cookies' },
  ];
}
