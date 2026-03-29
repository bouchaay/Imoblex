import { Component, OnInit, AfterViewInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PropertyService } from '../../shared/services/property.service';
import { PropertyCardComponent } from '../../shared/components/property-card.component';
import { SearchBarComponent } from '../../shared/components/search-bar.component';
import { Property } from '../../shared/models/property.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, PropertyCardComponent, SearchBarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  private readonly propertyService = inject(PropertyService);

  featuredProperties = signal<Property[]>([]);

  popularSearches = [
    { label: 'Appartements Toulouse', path: '/vente?type=apartment&city=Toulouse' },
    { label: 'Maisons à vendre', path: '/vente?type=house' },
    { label: 'Villas prestige', path: '/vente?type=villa' },
    { label: 'Location Toulouse', path: '/location?city=Toulouse' },
  ];

  stats = [
    { number: '18 ans', label: "d'expérience locale" },
    { number: '+500', label: 'biens vendus / loués' },
    { number: '98%', label: 'clients satisfaits' },
    { number: '+1M', label: "habitants dans notre zone" },
  ];

  services = [
    {
      title: 'Vente immobilière',
      description: 'Accompagnement complet de l\'estimation à la signature chez le notaire.',
      icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
      link: '/vente',
      bgColor: '#EBF3FA',
      iconColor: '#1B4F72',
    },
    {
      title: 'Location',
      description: 'Gestion locative professionnelle : recherche de locataires, états des lieux, quittances.',
      icon: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z',
      link: '/location',
      bgColor: '#FEF6E7',
      iconColor: '#F39C12',
    },
    {
      title: 'Estimation gratuite',
      description: 'Évaluation précise de votre bien par nos experts du marché toulousain.',
      icon: 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z',
      link: '/estimation',
      bgColor: '#F0FDF4',
      iconColor: '#16a34a',
    },
    {
      title: 'Simulateur de prêt',
      description: 'Calculez vos mensualités et capacité d\'emprunt en temps réel.',
      icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z',
      link: '/simulateur-pret',
      bgColor: '#FDF2F8',
      iconColor: '#9333ea',
    },
  ];

  whyChooseUs = [
    {
      title: 'Expertise locale inégalée',
      description: '18 ans de présence sur le marché toulousain. Nous connaissons chaque quartier, chaque rue.',
      icon: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
    },
    {
      title: 'Réseau exclusif de vendeurs',
      description: 'Accédez à des biens off-market avant leur mise en vente publique grâce à notre réseau privilégié.',
      icon: 'M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0',
    },
    {
      title: 'Accompagnement personnalisé',
      description: 'Un conseiller dédié vous suit de A à Z, disponible 7j/7 pour répondre à toutes vos questions.',
      icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z',
    },
    {
      title: 'Transparence totale',
      description: 'Honoraires clairs, communication régulière et reporting détaillé à chaque étape de votre projet.',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    },
  ];

  testimonials = [
    {
      name: 'Marie L.',
      role: 'Vendeuse – Appartement Capitole',
      text: 'Imoblex a vendu notre appartement en 3 semaines au prix demandé. Une équipe professionnelle, disponible et de très bon conseil. Je recommande sans hésitation.',
      date: 'Novembre 2024',
    },
    {
      name: 'Pierre & Sophie M.',
      role: 'Acheteurs – Villa Colomiers',
      text: 'Nous cherchions la maison idéale depuis 6 mois. Marc chez Imoblex nous a trouvé notre coup de cœur en moins d\'un mois ! Service impeccable du début à la fin.',
      date: 'Octobre 2024',
    },
    {
      name: 'Antoine R.',
      role: 'Investisseur locatif',
      text: 'Claire m\'a accompagné dans l\'acquisition de 3 appartements à investissement. Ses conseils sur les quartiers porteurs ont été précieux. Rentabilité au rendez-vous.',
      date: 'Septembre 2024',
    },
  ];

  partners = ['Crédit Agricole', 'BNP Paribas', 'LCL', 'Société Générale', 'Banque Populaire'];

  ngOnInit(): void {
    this.propertyService.getFeaturedProperties().subscribe(props => {
      this.featuredProperties.set(props);
      // Re-observe après rendu des cartes (async data → DOM update)
      setTimeout(() => this.initScrollAnimations(), 50);
    });
  }

  ngAfterViewInit(): void {
    this.initScrollAnimations();
  }

  private initScrollAnimations(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.animate-on-scroll, .animate-on-scroll-left, .animate-on-scroll-right').forEach(el => {
      observer.observe(el);
    });
  }
}
