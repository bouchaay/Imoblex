import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <footer class="bg-dark text-white">

      <!-- Newsletter strip -->
      <div class="bg-primary py-10">
        <div class="container-fluid">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 class="font-heading font-bold text-xl text-white">Alertes immobilières personnalisées</h3>
              <p class="text-white/70 text-sm mt-1">Recevez les nouveaux biens correspondant à vos critères</p>
            </div>
            <div class="flex w-full md:w-auto gap-0 max-w-md">
              <input
                type="email"
                [(ngModel)]="newsletterEmail"
                placeholder="Votre adresse email"
                class="newsletter-input flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-l-lg text-white placeholder-white/50 outline-none focus:border-accent text-sm min-w-0">
              <button
                (click)="subscribeNewsletter()"
                class="bg-accent hover:bg-accent-600 text-white font-semibold px-6 py-3 rounded-r-lg transition-colors whitespace-nowrap text-sm">
                S'inscrire
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main footer -->
      <div class="container-fluid py-16">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          <!-- Brand column -->
          <div class="lg:col-span-1">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
              </div>
              <span class="font-heading font-bold text-2xl">Imoblex</span>
            </div>
            <p class="text-white/60 text-sm leading-relaxed mb-6">
              Votre expert immobilier à Toulouse depuis 18 ans. Vente, location, estimation et gestion de patrimoine en Haute-Garonne.
            </p>

            <!-- Social links -->
            <div class="flex gap-3">
              @for (social of socialLinks; track social.name) {
                <a [href]="social.url" target="_blank" rel="noopener noreferrer"
                   class="w-9 h-9 rounded-lg bg-white/10 hover:bg-accent flex items-center justify-center transition-colors"
                   [attr.aria-label]="social.name">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path [attr.d]="social.icon"/>
                  </svg>
                </a>
              }
            </div>
          </div>

          <!-- Services -->
          <div>
            <h4 class="font-heading font-semibold text-white mb-5 text-sm uppercase tracking-widest">Nos services</h4>
            <ul class="space-y-3">
              @for (link of serviceLinks; track link.path) {
                <li>
                  <a [routerLink]="link.path" class="text-white/60 hover:text-accent text-sm transition-colors flex items-center gap-2">
                    <span class="text-accent">›</span> {{ link.label }}
                  </a>
                </li>
              }
            </ul>
          </div>

          <!-- Properties -->
          <div>
            <h4 class="font-heading font-semibold text-white mb-5 text-sm uppercase tracking-widest">Biens immobiliers</h4>
            <ul class="space-y-3">
              @for (link of propertyLinks; track link.path) {
                <li>
                  <a [routerLink]="link.path" class="text-white/60 hover:text-accent text-sm transition-colors flex items-center gap-2">
                    <span class="text-accent">›</span> {{ link.label }}
                  </a>
                </li>
              }
            </ul>
          </div>

          <!-- Contact -->
          <div>
            <h4 class="font-heading font-semibold text-white mb-5 text-sm uppercase tracking-widest">Contact</h4>
            <ul class="space-y-4">
              <li class="flex items-start gap-3">
                <svg class="w-4 h-4 text-accent mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span class="text-white/60 text-sm">15 Rue de la République<br>31000 Toulouse</span>
              </li>
              <li class="flex items-center gap-3">
                <svg class="w-4 h-4 text-accent flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
                <a href="tel:+33561000000" class="text-white/60 hover:text-accent text-sm transition-colors">05 61 00 00 00</a>
              </li>
              <li class="flex items-center gap-3">
                <svg class="w-4 h-4 text-accent flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <a href="mailto:contact@imoblex.fr" class="text-white/60 hover:text-accent text-sm transition-colors">contact&#64;imoblex.fr</a>
              </li>
              <li class="flex items-start gap-3">
                <svg class="w-4 h-4 text-accent mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
                </svg>
                <span class="text-white/60 text-sm">Lun-Ven : 9h – 18h30<br>Sam : 9h – 13h</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="border-t border-white/10 py-6">
        <div class="container-fluid flex flex-col md:flex-row items-center justify-between gap-4">
          <p class="text-white/40 text-sm">
            © {{ currentYear }} Imoblex. Tous droits réservés. Carte professionnelle n° XXXXX délivrée par la CCI Toulouse.
          </p>
          <div class="flex items-center gap-6">
            @for (link of legalLinks; track link.label) {
              <a [routerLink]="link.path" class="text-white/40 hover:text-white/70 text-xs transition-colors">
                {{ link.label }}
              </a>
            }
          </div>
        </div>
      </div>
    </footer>

    @if (subscribed()) {
      <div class="toast toast-success">
        <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        <div>
          <p class="font-semibold text-sm text-gray-800">Inscription confirmée !</p>
          <p class="text-xs text-gray-500">Vous recevrez nos alertes immobilières.</p>
        </div>
      </div>
    }
  `,
  styles: [`:host { display: block; }`]
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
