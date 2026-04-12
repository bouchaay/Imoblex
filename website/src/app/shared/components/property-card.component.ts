import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Property } from '../models/property.model';
import { FavoritesService } from '../services/favorites.service';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './property-card.component.html',
  styleUrls: ['./property-card.component.scss']
})
export class PropertyCardComponent implements OnInit {
  @Input({ required: true }) property!: Property;
  @Output() favoriteToggled = new EventEmitter<string>();

  private readonly favService = inject(FavoritesService);
  isFav = false;

  ngOnInit(): void {
    // Auto-remove from favorites if property is no longer available
    const unavailable = this.property.status === 'sold' || this.property.status === 'rented';
    if (unavailable && this.favService.isFavorite(this.property.id)) {
      this.favService.remove(this.property.id);
    }
    this.isFav = this.favService.isFavorite(this.property.id);
  }

  toggleFavorite(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.favService.toggle(this.property.id);
    this.isFav = this.favService.isFavorite(this.property.id);
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
