import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
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

  property = signal<Property | null>(null);
  similarProperties = signal<Property[]>([]);
  notFound = signal(false);
  currentPhotoIndex = signal(0);
  showFullDescription = signal(false);

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
  }

  formatPrice(): string {
    const p = this.property()!;
    const formatted = new Intl.NumberFormat('fr-FR', {
      style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
    }).format(p.price);
    return p.transactionType === 'rent' ? `${formatted}/mois` : formatted;
  }
}
