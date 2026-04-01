import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'properties',
        loadComponent: () =>
          import('./features/properties/properties.component').then(m => m.PropertiesComponent)
      },
      {
        path: 'properties/new',
        loadComponent: () =>
          import('./features/properties/property-form.component').then(m => m.PropertyFormComponent)
      },
      {
        path: 'properties/:id',
        loadComponent: () =>
          import('./features/properties/property-detail.component').then(m => m.PropertyDetailComponent)
      },
      {
        path: 'properties/:id/edit',
        loadComponent: () =>
          import('./features/properties/property-form.component').then(m => m.PropertyFormComponent)
      },
      {
        path: 'mandates',
        loadComponent: () =>
          import('./features/mandates/mandates.component').then(m => m.MandatesComponent)
      },
      {
        path: 'mandates/new',
        loadComponent: () =>
          import('./features/mandates/mandate-form.component').then(m => m.MandateFormComponent)
      },
      {
        path: 'mandates/:id',
        loadComponent: () =>
          import('./features/mandates/mandate-detail.component').then(m => m.MandateDetailComponent)
      },
      {
        path: 'mandates/:id/edit',
        loadComponent: () =>
          import('./features/mandates/mandate-form.component').then(m => m.MandateFormComponent)
      },
      {
        path: 'contacts',
        loadComponent: () =>
          import('./features/contacts/contacts.component').then(m => m.ContactsComponent)
      },
      {
        path: 'contacts/new',
        loadComponent: () =>
          import('./features/contacts/contact-form.component').then(m => m.ContactFormComponent)
      },
      {
        path: 'contacts/:id/edit',
        loadComponent: () =>
          import('./features/contacts/contact-form.component').then(m => m.ContactFormComponent)
      },
      {
        path: 'contacts/:id',
        loadComponent: () =>
          import('./features/contacts/contact-detail.component').then(m => m.ContactDetailComponent)
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('./features/transactions/transactions.component').then(m => m.TransactionsComponent)
      },
      {
        path: 'agenda',
        loadComponent: () =>
          import('./features/agenda/agenda.component').then(m => m.AgendaComponent)
      },
      {
        path: 'documents',
        loadComponent: () =>
          import('./features/documents/documents.component').then(m => m.DocumentsComponent)
      },
      {
        path: 'reporting',
        loadComponent: () =>
          import('./features/reporting/reporting.component').then(m => m.ReportingComponent)
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings.component').then(m => m.SettingsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
