import { Component, OnInit, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PropertyService } from '../../shared/services/property.service';
import { PropertyCardComponent } from '../../shared/components/property-card.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb.component';
import { DpeDisplayComponent } from '../../shared/components/dpe-display.component';
import { ContactFormComponent } from '../../shared/components/contact-form.component';
import { Property } from '../../shared/models/property.model';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PropertyCardComponent, BreadcrumbComponent, DpeDisplayComponent, ContactFormComponent],
  templateUrl: './property-detail.component.html',
  styleUrls: ['./property-detail.component.scss']
})
export class PropertyDetailComponent implements OnInit {
  private readonly propertyService = inject(PropertyService);
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);

  property = signal<Property | null>(null);
  similarProperties = signal<Property[]>([]);
  notFound = signal(false);
  currentPhotoIndex = signal(0);
  showFullDescription = signal(false);
  lightboxOpen = signal(false);
  lightboxIndex = signal(0);

  mapUrl = computed((): SafeResourceUrl | null => {
    const p = this.property();
    const lat = p?.location?.lat;
    const lng = p?.location?.lng;
    if (!lat || !lng) return null;
    const d = 0.008;
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-d},${lat-d},${lng+d},${lat+d}&layer=mapnik&marker=${lat},${lng}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  @HostListener('document:keydown.escape')
  onEsc(): void { this.lightboxOpen.set(false); }

  breadcrumbs = () => {
    const p = this.property();
    return [
      { label: 'Accueil', path: '/' },
      { label: p?.transactionType === 'sale' ? 'Vente' : 'Location', path: p?.transactionType === 'sale' ? '/vente' : '/location' },
      { label: p?.title ?? 'Détail du bien' },
    ];
  };

  keyFeatures = () => {
    const p = this.property();
    if (!p) return [];
    const items = [
      { label: 'Surface habitable', value: `${p.area} m²`, icon: 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-9-7l4 4H8l4-4z' },
      { label: 'Nombre de pièces', value: `${p.rooms} pièce${p.rooms > 1 ? 's' : ''}`, icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' },
      { label: 'Chambres', value: p.bedrooms > 0 ? `${p.bedrooms} chambre${p.bedrooms > 1 ? 's' : ''}` : 'Studio', icon: 'M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z' },
      { label: 'Classe DPE', value: p.dpe, icon: 'M17 8C8 10 5.9 16.17 3.82 20.96L5.71 22l1-2.3A4.49 4.49 0 008 20c4 0 4-2 8-2s4 2 8 2v-2c-4 0-4-2-8-2C10.47 16 8.09 12.24 17 8z' },
    ];
    if (p.floor !== undefined) {
      items.push({ label: 'Étage', value: `${p.floor}${p.totalFloors ? '/' + p.totalFloors : ''}`, icon: 'M4 10h3v7H4zm6.5 0h3v7h-3zM2 19h20v3H2zm15-9h3v7h-3zM12 1L2 6v2h20V6z' });
    }
    if (p.landArea) {
      items.push({ label: 'Terrain', value: `${p.landArea} m²`, icon: 'M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z' });
    }
    return items.slice(0, 4);
  };

  phoneHref(phone: string): string {
    return 'tel:' + phone.replace(/\s/g, '');
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id') ?? '';
      this.propertyService.getPropertyById(id).subscribe(prop => {
        if (prop) {
          this.property.set(prop);
          this.propertyService.getSimilarProperties(id, prop.transactionType).subscribe(similar => {
            this.similarProperties.set(similar);
          });
        } else {
          this.notFound.set(true);
        }
      });
    });
  }

  prevPhoto(): void {
    const len = this.property()!.photos.length;
    this.currentPhotoIndex.update(i => (i - 1 + len) % len);
  }

  nextPhoto(): void {
    const len = this.property()!.photos.length;
    this.currentPhotoIndex.update(i => (i + 1) % len);
  }

  openGallery(index: number): void {
    this.currentPhotoIndex.set(index);
    this.lightboxIndex.set(index);
    this.lightboxOpen.set(true);
  }

  closeLightbox(): void { this.lightboxOpen.set(false); }

  prevLightbox(): void {
    const len = this.property()!.photos.length;
    this.lightboxIndex.update(i => (i - 1 + len) % len);
  }

  nextLightbox(): void {
    const len = this.property()!.photos.length;
    this.lightboxIndex.update(i => (i + 1) % len);
  }

  getTransportBgClass(type: string): string {
    const map: Record<string, string> = {
      METRO: 'bg-blue-600', BUS: 'bg-green-600', TRAM: 'bg-purple-600',
      RER: 'bg-orange-600', TRAIN: 'bg-amber-600', OTHER: 'bg-gray-400'
    };
    return map[type] ?? 'bg-gray-400';
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

  formatPrice(): string {
    const p = this.property()!;
    const formatted = new Intl.NumberFormat('fr-FR', {
      style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
    }).format(p.price);
    return p.transactionType === 'rent' ? `${formatted}/mois` : formatted;
  }
}
