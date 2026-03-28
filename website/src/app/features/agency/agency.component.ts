import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-agency',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Hero -->
    <div class="relative min-h-96 flex items-end overflow-hidden">
      <div class="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1400&q=80"
             alt="Agence Imoblex Toulouse" class="w-full h-full object-cover">
        <div class="absolute inset-0" style="background: linear-gradient(135deg, rgba(27,39,68,0.85) 0%, rgba(27,79,114,0.6) 100%);"></div>
      </div>
      <div class="relative container-fluid pb-16 pt-36 text-white">
        <span class="section-label">À propos</span>
        <h1 class="text-display text-white mb-4">L'agence Imoblex</h1>
        <p class="text-white/80 text-lg max-w-xl">Votre partenaire immobilier de confiance à Toulouse depuis 2006.</p>
      </div>
    </div>

    <!-- About section -->
    <section class="section-padding bg-background">
      <div class="container-fluid">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div class="animate-on-scroll">
            <span class="section-label">Notre histoire</span>
            <h2 class="section-title">18 ans d'excellence immobilière</h2>
            <div class="section-divider"></div>
            <div class="space-y-4 text-gray-600 leading-relaxed">
              <p>Fondée en 2006 par des professionnels passionnés de l'immobilier toulousain, Imoblex s'est imposée comme l'une des agences immobilières de référence en Haute-Garonne.</p>
              <p>Notre connaissance intime du territoire – de l'hyper-centre au grand Toulouse – nous permet d'offrir à nos clients des conseils avisés et personnalisés, basés sur des données réelles du marché.</p>
              <p>Aujourd'hui, notre équipe de 8 conseillers spécialisés accompagne chaque année plus de 200 familles, investisseurs et entrepreneurs dans leurs projets immobiliers.</p>
            </div>

            <div class="grid grid-cols-3 gap-4 mt-8">
              @for (stat of agencyStats; track stat.label) {
                <div class="text-center p-4 bg-white rounded-xl shadow-card">
                  <div class="font-heading font-bold text-2xl text-accent">{{ stat.value }}</div>
                  <div class="text-xs text-gray-500 mt-1">{{ stat.label }}</div>
                </div>
              }
            </div>
          </div>

          <div class="animate-on-scroll-right">
            <div class="grid grid-cols-2 gap-4">
              <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80"
                   alt="Imoblex bureau" class="rounded-2xl shadow-card w-full h-52 object-cover">
              <img src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&q=80"
                   alt="Imoblex équipe" class="rounded-2xl shadow-card w-full h-52 object-cover mt-8">
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Values -->
    <section class="section-padding bg-white">
      <div class="container-fluid">
        <div class="text-center mb-12 animate-on-scroll">
          <span class="section-label">Ce qui nous anime</span>
          <h2 class="section-title">Nos valeurs</h2>
          <div class="section-divider mx-auto"></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (value of values; track value.title; let i = $index) {
            <div class="text-center p-6 animate-on-scroll" [class]="'delay-' + ((i + 1) * 100)">
              <div class="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" [style.background]="value.bg">
                <svg class="w-8 h-8" [style.color]="value.color" fill="currentColor" viewBox="0 0 24 24">
                  <path [attr.d]="value.icon"/>
                </svg>
              </div>
              <h3 class="font-heading font-bold text-primary mb-2">{{ value.title }}</h3>
              <p class="text-gray-500 text-sm leading-relaxed">{{ value.description }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Team -->
    <section class="section-padding bg-background">
      <div class="container-fluid">
        <div class="text-center mb-12 animate-on-scroll">
          <span class="section-label">Qui sommes-nous</span>
          <h2 class="section-title">Notre équipe</h2>
          <div class="section-divider mx-auto"></div>
          <p class="text-gray-500 max-w-xl mx-auto">
            Des professionnels passionnés, experts du marché immobilier toulousain.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (agent of team; track agent.name; let i = $index) {
            <div class="team-card animate-on-scroll" [class]="'delay-' + ((i % 4) * 100 + 100)">
              <div class="relative overflow-hidden" style="height: 260px;">
                <img [src]="agent.photo" [alt]="agent.name" class="team-photo" style="height: 260px;">
                <!-- Overlay on hover -->
                <div class="absolute inset-0 bg-primary/80 opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
                  <a [href]="phoneHref(agent.phone)" class="text-white text-sm hover:text-accent transition-colors">📞 {{ agent.phone }}</a>
                  <a [href]="'mailto:' + agent.email" class="text-white text-sm hover:text-accent transition-colors">✉️ {{ agent.email }}</a>
                </div>
              </div>
              <div class="team-info">
                <h3 class="font-heading font-bold text-primary">{{ agent.name }}</h3>
                <p class="text-accent text-sm font-medium mb-2">{{ agent.role }}</p>
                <p class="text-gray-400 text-xs">{{ agent.specialty }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Partners -->
    <section class="section-padding bg-white">
      <div class="container-fluid">
        <div class="text-center mb-10 animate-on-scroll">
          <span class="section-label">Réseau de confiance</span>
          <h2 class="section-title">Nos partenaires</h2>
          <div class="section-divider mx-auto"></div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-center">
          @for (partner of partners; track partner.name) {
            <div class="flex items-center justify-center h-16 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer">
              <div class="text-gray-500 font-bold text-sm text-center">{{ partner.name }}</div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Map / Location -->
    <section class="section-padding bg-background">
      <div class="container-fluid">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="animate-on-scroll">
            <span class="section-label">Nous trouver</span>
            <h2 class="section-title">Notre agence</h2>
            <div class="section-divider"></div>
            <div class="space-y-4">
              @for (info of contactInfo; track info.label) {
                <div class="flex items-start gap-4 p-4 bg-white rounded-xl shadow-card">
                  <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path [attr.d]="info.icon"/>
                    </svg>
                  </div>
                  <div>
                    <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">{{ info.label }}</p>
                    <p class="text-gray-700 font-medium text-sm mt-0.5">{{ info.value }}</p>
                  </div>
                </div>
              }
            </div>
            <div class="mt-6 flex gap-3">
              <a routerLink="/contact" class="btn-primary text-sm">Nous contacter</a>
              <a routerLink="/estimation" class="btn-outline text-sm">Estimation gratuite</a>
            </div>
          </div>

          <div class="animate-on-scroll-right">
            <div id="agency-map" class="w-full rounded-2xl overflow-hidden shadow-premium bg-blue-50 flex items-center justify-center" style="height: 400px;">
              <div class="text-center text-gray-400">
                <svg class="w-12 h-12 mx-auto mb-2 text-primary/20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <p class="font-semibold text-gray-500">15 Rue de la République</p>
                <p class="text-sm text-gray-400">31000 Toulouse</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Banner -->
    <section class="py-20 bg-gradient-to-br from-dark to-primary">
      <div class="container-fluid text-center animate-on-scroll">
        <h2 class="text-headline text-white mb-4">Prêt à nous confier votre projet ?</h2>
        <p class="text-white/70 mb-8 max-w-xl mx-auto">Nos experts sont à votre disposition pour vous accompagner dans toutes les étapes de votre projet immobilier.</p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a routerLink="/estimation" class="btn-accent px-8 py-4 text-base rounded-xl">Estimation gratuite</a>
          <a routerLink="/contact" class="btn-outline-white px-8 py-4 text-base rounded-xl">Nous contacter</a>
        </div>
      </div>
    </section>
  `,
  styles: [`:host { display: block; }`]
})
export class AgencyComponent implements AfterViewInit {
  agencyStats = [
    { value: '18 ans', label: 'd\'expérience' },
    { value: '+500', label: 'biens vendus' },
    { value: '98%', label: 'satisfaction' },
  ];

  values = [
    {
      title: 'Expertise',
      description: 'Connaissance approfondie du marché immobilier toulousain et des quartiers.',
      icon: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
      bg: '#EBF3FA', color: '#1B4F72',
    },
    {
      title: 'Transparence',
      description: 'Honoraires clairs, communication honnête à chaque étape de votre projet.',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      bg: '#FEF6E7', color: '#F39C12',
    },
    {
      title: 'Disponibilité',
      description: 'Un conseiller dédié, joignable 7j/7, pour répondre à toutes vos questions.',
      icon: 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z',
      bg: '#F0FDF4', color: '#16a34a',
    },
    {
      title: 'Résultats',
      description: 'Plus de 500 transactions réussies, un délai de vente moyen de 45 jours.',
      icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
      bg: '#FDF2F8', color: '#9333ea',
    },
  ];

  team = [
    {
      name: 'Sophie Martin',
      role: 'Directrice & Fondatrice',
      specialty: 'Hyper-centre, Capitole, Saint-Étienne',
      phone: '05 61 00 00 01',
      email: 'sophie@imoblex.fr',
      photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b0ee?w=400&q=80',
    },
    {
      name: 'Marc Dupont',
      role: 'Conseiller Senior',
      specialty: 'Villas, biens de prestige, Haute-Garonne',
      phone: '05 61 00 00 02',
      email: 'marc@imoblex.fr',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    },
    {
      name: 'Claire Rousseau',
      role: 'Conseillère Immobilière',
      specialty: 'Saint-Cyprien, Carmes, Garonne',
      phone: '05 61 00 00 03',
      email: 'claire@imoblex.fr',
      photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
    },
    {
      name: 'Thomas Bernard',
      role: 'Gestion Locative',
      specialty: 'Investissement, Gestion de patrimoine',
      phone: '05 61 00 00 04',
      email: 'thomas@imoblex.fr',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    },
  ];

  partners = [
    { name: 'Crédit Agricole' },
    { name: 'BNP Paribas' },
    { name: 'Caisse d\'Épargne' },
    { name: 'LCL' },
    { name: 'Notaires 31' },
    { name: 'FNAIM' },
  ];

  contactInfo = [
    {
      label: 'Adresse',
      value: '15 Rue de la République, 31000 Toulouse',
      icon: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
    },
    {
      label: 'Téléphone',
      value: '05 61 00 00 00',
      icon: 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z',
    },
    {
      label: 'Email',
      value: 'contact@imoblex.fr',
      icon: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z',
    },
    {
      label: 'Horaires',
      value: 'Lun–Ven : 9h–18h30 | Sam : 9h–13h',
      icon: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z',
    },
  ];

  phoneHref(phone: string): string {
    return 'tel:' + phone.replace(/\s/g, '');
  }

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.animate-on-scroll, .animate-on-scroll-left, .animate-on-scroll-right').forEach(el => observer.observe(el));
  }
}
