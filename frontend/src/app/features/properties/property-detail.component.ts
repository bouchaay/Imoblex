import { Component, inject, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { PropertyService } from '../../core/services/property.service';
import { Property } from '../../core/models/property.model';
import { PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS, TransactionType } from '../../core/models/enums';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { DpeBadgeComponent } from '../../shared/components/dpe-badge.component';
import { PriceFormatterPipe } from '../../shared/pipes/price-formatter.pipe';
import { EntityDocumentsComponent } from '../../shared/components/entity-documents/entity-documents.component';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusBadgeComponent, DpeBadgeComponent, PriceFormatterPipe, EntityDocumentsComponent],
  templateUrl: './property-detail.component.html',
  styleUrls: ['./property-detail.component.scss']
})
export class PropertyDetailComponent implements OnInit {
  @Input() id!: string;
  private readonly route = inject(ActivatedRoute);
  private readonly propertyService = inject(PropertyService);
  readonly TransactionType = TransactionType;

  property = signal<Property | null>(null);
  activePhotoIndex = signal(0);
  lightboxOpen = signal(false);

  ngOnInit(): void {
    const id = this.id || this.route.snapshot.paramMap.get('id')!;
    this.propertyService.getById(id).subscribe(p => this.property.set(p));
  }

  getTypeLabel(type: string): string {
    return PROPERTY_TYPE_LABELS[type as keyof typeof PROPERTY_TYPE_LABELS] || type;
  }

  getTransportBadgeClass(type: string): string {
    const map: Record<string, string> = {
      METRO: 'badge-metro', BUS: 'badge-bus', TRAM: 'badge-tram',
      RER: 'badge-rer', TRAIN: 'badge-train', OTHER: 'badge-other'
    };
    return map[type] ?? 'badge-other';
  }

  getTransportIconPath(type: string): string {
    switch (type) {
      case 'METRO':
        return 'M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2.23l2-2H14l2 2H18v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zm0 14c-.83 0-1.5-.67-1.5-1.5S11.17 13 12 13s1.5.67 1.5 1.5S12.83 16 12 16zm5-7H7V6h10v3z';
      case 'BUS':
        return 'M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z';
      case 'TRAM':
        return 'M19 16.5c0 .83-.51 1.5-1.27 1.96-.1.06-.21.09-.33.09H6.6c-.12 0-.23-.03-.33-.09C5.51 18 5 17.33 5 16.5V8c0-3 3.75-3 7-3s7 0 7 3v8.5zm-9.5.5c.83 0 1.5-.67 1.5-1.5S10.33 14 9.5 14 8 14.67 8 15.5 8.67 17 9.5 17zm5 0c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm1-6H8V8h7.5v3zm3-5l-1.5-1.5h-11L5.5 6H3v2h18V6h-2.5z';
      case 'RER':
        return 'M4 15.5C4 17.43 5.57 19 7.5 19L6 20.5V21h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V5c0-3.5-3.58-4-8-4s-8 .5-8 4v10.5zm8 .5c-.83 0-1.5-.67-1.5-1.5S11.17 13 12 13s1.5.67 1.5 1.5S12.83 16 12 16zm-5-9h10v4H7V7z';
      case 'TRAIN':
        return 'M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2.23l2-2H14l2 2H18v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zm0 14c-.83 0-1.5-.67-1.5-1.5S11.17 13 12 13s1.5.67 1.5 1.5S12.83 16 12 16zm-5-9h10v4H7V7z';
      default:
        return 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z';
    }
  }

  getTransportLabel(type: string): string {
    const map: Record<string, string> = {
      METRO: 'Métro', BUS: 'Bus', TRAM: 'Tramway', RER: 'RER', TRAIN: 'Train', OTHER: 'Transport'
    };
    return map[type] ?? type;
  }

  getShopEmoji(type: string): string {
    const map: Record<string, string> = {
      SUPERMARKET: '🛒', BAKERY: '🥖', PHARMACY: '💊', SCHOOL: '🏫',
      KINDERGARTEN: '🧒', PARK: '🌳', RESTAURANT: '🍽️', BANK: '🏦',
      HOSPITAL: '🏥', OTHER: '📍'
    };
    return map[type] ?? '📍';
  }

  getShopLabel(type: string): string {
    const map: Record<string, string> = {
      SUPERMARKET: 'Supermarché', BAKERY: 'Boulangerie', PHARMACY: 'Pharmacie',
      SCHOOL: 'École', KINDERGARTEN: 'Crèche / Maternelle', PARK: 'Parc / Jardin',
      RESTAURANT: 'Restaurant / Café', BANK: 'Banque', HOSPITAL: 'Hôpital / Clinique', OTHER: 'Commerce'
    };
    return map[type] ?? type;
  }
}
