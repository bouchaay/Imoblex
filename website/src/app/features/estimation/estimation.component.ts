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
  templateUrl: './estimation.component.html',
  styleUrls: ['./estimation.component.scss']
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
