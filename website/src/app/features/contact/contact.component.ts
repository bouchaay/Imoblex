import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb.component';
import { LeadService } from '../../shared/services/lead.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BreadcrumbComponent],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  private readonly leadService = inject(LeadService);

  submitted = signal(false);
  sending = signal(false);
  error = signal('');
  showToast = signal(false);

  formData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    propertyRef: '',
    message: '',
    gdpr: false,
  };

  subjects = [
    'Demande d\'information sur un bien',
    'Estimation de mon bien',
    'Mise en vente de mon bien',
    'Mise en location de mon bien',
    'Gestion locative',
    'Visite d\'un bien',
    'Simulateur de prêt',
    'Autre demande',
  ];

  contactDetails = [
    {
      label: 'Adresse',
      value: '22 Rue Hyères, 31500 Toulouse',
      icon: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
      link: null,
    },
    {
      label: 'Téléphone',
      value: '05.61.61.57.38 / 06.81.76.30.94',
      icon: 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z',
      link: 'tel:+33561615738',
    },
    {
      label: 'Email',
      value: 'contact@imoblex.fr',
      icon: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z',
      link: 'mailto:contact@imoblex.fr',
    },
    {
      label: 'Carte professionnelle',
      value: 'Délivrée par la CCI Toulouse – SARL ANDRADE ALEIXO',
      icon: 'M20 6h-2.18c.07-.44.18-.88.18-1.3C18 2.12 15.88 0 13.3 0c-1.3 0-2.4.5-3.2 1.3L9 2.4l-1.1-1.1C7 .5 5.9 0 4.7 0 2.12 0 0 2.12 0 4.7c0 3.13 2.2 5.65 5.6 8.93L9 16.9l3.4-3.27C15.8 10.36 18 7.84 18 4.7c0 .41-.05.83-.12 1.3H20c1.1 0 2 .9 2 2V19c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-5h2v5h16V8z',
      link: null,
    },
  ];

  openingHours = [
    { day: 'Lundi',    hours: '09h00 – 19h30', open: true },
    { day: 'Mardi',    hours: '09h00 – 19h30', open: true },
    { day: 'Mercredi', hours: '09h00 – 19h30', open: true },
    { day: 'Jeudi',    hours: '09h00 – 19h30', open: true },
    { day: 'Vendredi', hours: '09h00 – 19h30', open: true },
    { day: 'Samedi',   hours: '09h30 – 19h00', open: true },
    { day: 'Dimanche', hours: 'Fermé',          open: false },
  ];

  onSubmit(): void {
    if (this.sending()) return;
    this.sending.set(true);
    this.error.set('');

    const messageParts = [
      this.formData.subject ? `Sujet : ${this.formData.subject}` : '',
      this.formData.message ? this.formData.message : '',
    ].filter(Boolean);

    this.leadService.submit({
      firstName: this.formData.firstName,
      lastName: this.formData.lastName,
      email: this.formData.email,
      phone: this.formData.phone || undefined,
      message: messageParts.join('\n\n'),
      propertyReference: this.formData.propertyRef || undefined,
      formType: 'CONTACT',
      gdprConsent: this.formData.gdpr,
    }).subscribe({
      next: () => {
        this.sending.set(false);
        this.submitted.set(true);
        this.showToast.set(true);
        setTimeout(() => this.showToast.set(false), 5000);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: () => {
        this.sending.set(false);
        this.error.set('Une erreur est survenue. Veuillez réessayer ou nous contacter par téléphone.');
      },
    });
  }

  reset(): void {
    this.submitted.set(false);
    this.formData = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      subject: '',
      propertyRef: '',
      message: '',
      gdpr: false,
    };
  }
}
