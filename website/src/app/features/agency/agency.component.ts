import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-agency',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './agency.component.html',
  styleUrls: ['./agency.component.scss']
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
      name: 'ANDRADE ALEIXO',
      role: 'Gérant & Fondateur',
      specialty: 'Vente, Location, Gestion locative – Toulouse & Haute-Garonne',
      phone: '05.61.61.57.38',
      email: 'contact@imoblex.fr',
      photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
    },
    {
      name: 'Équipe Commerciale',
      role: 'Conseillers Immobiliers',
      specialty: 'Hyper-centre, Saint-Cyprien, Compans-Caffarelli, Rive Gauche',
      phone: '05.61.61.57.38',
      email: 'contact@imoblex.fr',
      photo: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&q=80',
    },
    {
      name: 'Pôle Location',
      role: 'Gestion Locative',
      specialty: 'Gestion de patrimoine, états des lieux, suivi locataires',
      phone: '06.81.76.30.94',
      email: 'contact@imoblex.fr',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    },
    {
      name: 'Pôle Transaction',
      role: 'Négociateurs Senior',
      specialty: 'Vente & acquisition – biens résidentiels et professionnels',
      phone: '06.81.76.30.94',
      email: 'contact@imoblex.fr',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
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
      value: '22 Rue Hyères, 31500 Toulouse',
      icon: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
    },
    {
      label: 'Téléphone',
      value: '05.61.61.57.38 / 06.81.76.30.94',
      icon: 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z',
    },
    {
      label: 'Email',
      value: 'contact@imoblex.fr',
      icon: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z',
    },
    {
      label: 'Horaires',
      value: 'Lun–Ven : 9h00–19h30 | Sam : 9h30–19h00',
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
