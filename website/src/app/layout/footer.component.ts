import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  newsletterEmail = '';
  subscribed = signal(false);

  socialLinks = [
    {
      name: 'Facebook',
      url: 'https://facebook.com',
      icon: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z'
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com',
      icon: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com',
      icon: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z'
    },
  ];

  serviceLinks = [
    { path: '/vente', label: 'Vente immobilière' },
    { path: '/location', label: 'Location' },
    { path: '/estimation', label: 'Estimation gratuite' },
    { path: '/simulateur-pret', label: 'Simulateur de prêt' },
    { path: '/agence', label: "Gestion locative" },
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

  subscribeNewsletter(): void {
    if (this.newsletterEmail && this.newsletterEmail.includes('@')) {
      this.subscribed.set(true);
      this.newsletterEmail = '';
      setTimeout(() => this.subscribed.set(false), 4000);
    }
  }
}
