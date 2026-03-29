import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'Imoblex - Expert Immobilier Toulouse'
  },
  {
    path: 'vente',
    loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent),
    data: { transactionType: 'sale' },
    title: 'Biens à vendre - Imoblex'
  },
  {
    path: 'location',
    loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent),
    data: { transactionType: 'rent' },
    title: 'Biens à louer - Imoblex'
  },
  {
    path: 'bien/:id',
    loadComponent: () => import('./features/property-detail/property-detail.component').then(m => m.PropertyDetailComponent),
    title: 'Détail du bien - Imoblex'
  },
  {
    path: 'estimation',
    loadComponent: () => import('./features/estimation/estimation.component').then(m => m.EstimationComponent),
    title: 'Estimation gratuite - Imoblex'
  },
  {
    path: 'simulateur-pret',
    loadComponent: () => import('./features/loan-simulator/loan-simulator.component').then(m => m.LoanSimulatorComponent),
    title: 'Simulateur de prêt - Imoblex'
  },
  {
    path: 'agence',
    loadComponent: () => import('./features/agency/agency.component').then(m => m.AgencyComponent),
    title: "L'agence - Imoblex"
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent),
    title: 'Contact - Imoblex'
  },
  {
    path: 'mentions-legales',
    loadComponent: () => import('./features/legal/legal.component').then(m => m.LegalComponent),
    title: 'Mentions légales - Imoblex'
  },
  {
    path: 'politique-confidentialite',
    loadComponent: () => import('./features/legal/legal.component').then(m => m.LegalComponent),
    title: 'Politique de confidentialité - Imoblex'
  },
  {
    path: 'cookies',
    loadComponent: () => import('./features/legal/legal.component').then(m => m.LegalComponent),
    title: 'Gestion des cookies - Imoblex'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
