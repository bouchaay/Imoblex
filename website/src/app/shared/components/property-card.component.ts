import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Property } from '../models/property.model';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './property-card.component.html',
  styleUrls: ['./property-card.component.scss']
})
export class PropertyCardComponent {
  @Input({ required: true }) property!: Property;
  @Output() favoriteToggled = new EventEmitter<string>();

  isFavorite = signal(false);

  toggleFavorite(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isFavorite.update(v => !v);
    this.favoriteToggled.emit(this.property.id);
  }

  formatPrice(): string {
    const formatted = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(this.property.price);
    return this.property.transactionType === 'rent' ? `${formatted}/mois` : formatted;
  }

  getTypeLabel(): string {
    const labels: Record<string, string> = {
      apartment: 'Appartement',
      house: 'Maison',
      villa: 'Villa',
      studio: 'Studio',
      loft: 'Loft',
      commercial: 'Local commercial',
      land: 'Terrain',
      parking: 'Parking',
    };
    return labels[this.property.type] ?? this.property.type;
  }
}
