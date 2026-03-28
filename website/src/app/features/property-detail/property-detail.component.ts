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
  template: `
    @if (property()) {
      <div class="bg-primary pt-24 pb-4">
        <div class="container-fluid">
          <app-breadcrumb [items]="breadcrumbs()" />
        </div>
      </div>

      <!-- Gallery -->
      <div class="bg-black relative" style="height: 60vh; min-height: 400px;">
        <div class="flex h-full gap-1">
          <!-- Main photo -->
          <div class="flex-1 relative overflow-hidden cursor-pointer" (click)="openGallery(0)">
            <img
              [src]="property()!.photos[currentPhotoIndex()]"
              [alt]="property()!.title"
              class="w-full h-full object-cover transition-all duration-500 hover:scale-105">
            <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
          </div>

          <!-- Thumbnail strip (desktop) -->
          @if (property()!.photos.length > 1) {
            <div class="hidden lg:flex flex-col gap-1 w-52">
              @for (photo of property()!.photos.slice(1, 4); track photo; let i = $index) {
                <div class="flex-1 relative overflow-hidden cursor-pointer" (click)="openGallery(i + 1)">
                  <img [src]="photo" [alt]="property()!.title + ' photo ' + (i + 2)"
                       class="w-full h-full object-cover hover:scale-105 transition-transform duration-300">
                  @if (i === 2 && property()!.photos.length > 4) {
                    <div class="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold">
                      +{{ property()!.photos.length - 4 }} photos
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>

        <!-- Nav buttons -->
        <button class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors" (click)="prevPhoto()">
          <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <button class="absolute right-60 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors lg:right-56" (click)="nextPhoto()">
          <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>

        <!-- Photo counter -->
        <div class="absolute bottom-4 left-4 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
          {{ currentPhotoIndex() + 1 }} / {{ property()!.photos.length }}
        </div>

        <!-- Status ribbons -->
        <div class="absolute top-4 left-4 flex gap-2">
          @if (property()!.isNew) {
            <span class="ribbon ribbon-new">Nouveau</span>
          }
          @if (property()!.isExclusive) {
            <span class="ribbon ribbon-exclusive">Exclusif</span>
          }
        </div>
      </div>

      <!-- Content -->
      <div class="container-fluid py-8">
        <div class="flex gap-8 items-start">

          <!-- Left column: Details -->
          <div class="flex-1 min-w-0">

            <!-- Header -->
            <div class="mb-6">
              <div class="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 class="text-headline text-primary mb-1">{{ property()!.title }}</h1>
                  <div class="flex items-center gap-2 text-gray-500 text-sm">
                    <svg class="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    {{ property()!.location.addressVisible && property()!.location.address ? property()!.location.address + ', ' : '' }}
                    {{ property()!.location.city }} {{ property()!.location.postalCode }}
                    {{ property()!.location.district ? ' – ' + property()!.location.district : '' }}
                  </div>
                </div>
                <div class="flex gap-2">
                  <span class="text-xs px-3 py-1.5 rounded-full font-semibold bg-blue-50 text-blue-700">
                    Réf. {{ property()!.reference }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Key features grid -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              @for (feature of keyFeatures(); track feature.label) {
                <div class="bg-white rounded-xl p-4 shadow-card text-center">
                  <svg class="w-6 h-6 text-primary mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path [attr.d]="feature.icon"/>
                  </svg>
                  <div class="font-heading font-bold text-primary text-lg">{{ feature.value }}</div>
                  <div class="text-gray-400 text-xs">{{ feature.label }}</div>
                </div>
              }
            </div>

            <!-- Description -->
            <div class="bg-white rounded-xl shadow-card p-6 mb-6">
              <h2 class="font-heading font-bold text-primary text-lg mb-4">Description</h2>
              <div class="text-gray-600 leading-relaxed whitespace-pre-line text-sm">
                {{ showFullDescription() ? property()!.description : property()!.description.slice(0, 300) + '...' }}
              </div>
              @if (property()!.description.length > 300) {
                <button (click)="showFullDescription.set(!showFullDescription())" class="text-accent text-sm font-semibold mt-3 hover:underline">
                  {{ showFullDescription() ? 'Voir moins' : 'Lire la suite' }}
                </button>
              }
            </div>

            <!-- Amenities grid -->
            <div class="bg-white rounded-xl shadow-card p-6 mb-6">
              <h2 class="font-heading font-bold text-primary text-lg mb-4">Équipements & prestations</h2>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                @for (item of property()!.features; track item) {
                  <div class="flex items-center gap-2 text-sm text-gray-600">
                    <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    {{ item }}
                  </div>
                }
              </div>
            </div>

            <!-- DPE/GES -->
            <div class="bg-white rounded-xl shadow-card p-6 mb-6">
              <h2 class="font-heading font-bold text-primary text-lg mb-6">Diagnostics énergétiques</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <app-dpe-display
                  [activeClass]="property()!.dpe"
                  [value]="property()!.dpeValue"
                  title="DPE – Consommation énergétique"
                  unit="kWh/m²/an" />
                <app-dpe-display
                  [activeClass]="property()!.ges"
                  [value]="property()!.gesValue"
                  title="GES – Émissions CO₂"
                  unit="kg CO₂/m²/an" />
              </div>
              <p class="text-xs text-gray-400 mt-4">
                * Les diagnostics de performance énergétique sont fournis à titre indicatif. Ils ont été réalisés selon la réglementation en vigueur.
              </p>
            </div>

            <!-- Map -->
            <div class="bg-white rounded-xl shadow-card p-6 mb-6">
              <h2 class="font-heading font-bold text-primary text-lg mb-4">
                Localisation
                @if (!property()!.location.addressVisible) {
                  <span class="text-sm font-normal text-gray-400 ml-2">(adresse exacte communiquée sur demande)</span>
                }
              </h2>
              <div id="detail-map" class="w-full rounded-xl overflow-hidden bg-blue-50 flex items-center justify-center" style="height: 300px;">
                <div class="text-center text-gray-400">
                  <svg class="w-10 h-10 mx-auto mb-2 text-primary/20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <p class="text-sm">{{ property()!.location.city }}{{ property()!.location.district ? ' – ' + property()!.location.district : '' }}</p>
                  @if (!property()!.location.addressVisible) {
                    <p class="text-xs mt-1 text-orange-400">Zone approximative affichée</p>
                  }
                </div>
              </div>
            </div>

            <!-- Similar properties -->
            @if (similarProperties().length > 0) {
              <div class="mb-6">
                <h2 class="font-heading font-bold text-primary text-lg mb-4">Biens similaires</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  @for (p of similarProperties(); track p.id) {
                    <app-property-card [property]="p" />
                  }
                </div>
              </div>
            }
          </div>

          <!-- Right column: sticky price card -->
          <div class="w-80 flex-shrink-0 hidden lg:block">
            <div class="bg-white rounded-2xl shadow-premium p-6 sticky top-24">
              <!-- Price -->
              <div class="text-center mb-6 pb-6 border-b border-gray-100">
                <div class="text-3xl font-heading font-bold text-primary mb-1">
                  {{ formatPrice() }}
                </div>
                @if (property()!.pricePerSqm) {
                  <div class="text-sm text-gray-400">{{ property()!.pricePerSqm | number:'1.0-0' }} €/m²</div>
                }
                @if (property()!.transactionType === 'rent' && property()!.charges) {
                  <div class="text-sm text-gray-400 mt-1">+ {{ property()!.charges | number:'1.0-0' }} € de charges</div>
                }
              </div>

              <!-- Quick stats -->
              <div class="grid grid-cols-3 gap-3 mb-6 text-center">
                <div>
                  <div class="font-bold text-primary text-lg">{{ property()!.area }}</div>
                  <div class="text-xs text-gray-400">m²</div>
                </div>
                <div>
                  <div class="font-bold text-primary text-lg">{{ property()!.rooms }}</div>
                  <div class="text-xs text-gray-400">pièces</div>
                </div>
                <div>
                  <div class="font-bold text-primary text-lg">{{ property()!.bedrooms }}</div>
                  <div class="text-xs text-gray-400">chambres</div>
                </div>
              </div>

              <!-- Contact form (compact) -->
              <app-contact-form
                title="Demande d'information"
                submitLabel="Envoyer ma demande"
                [showPropertyRef]="true"
                [propertyRefPlaceholder]="property()!.reference"
                messagePlaceholder="Je souhaite avoir plus d'informations sur ce bien..." />

              <!-- Call button -->
              @if (property()!.agent) {
                <div class="mt-4 pt-4 border-t border-gray-100">
                  <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                      {{ property()!.agent!.name.charAt(0) }}
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-gray-800">{{ property()!.agent!.name }}</p>
                      <p class="text-xs text-gray-400">Conseiller Imoblex</p>
                    </div>
                  </div>
                  <a [href]="phoneHref(property()!.agent!.phone)" class="btn-outline w-full text-sm py-2.5 text-center">
                    <svg class="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                    </svg>
                    {{ property()!.agent!.phone }}
                  </a>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    } @else if (notFound()) {
      <div class="min-h-screen flex items-center justify-center pt-20">
        <div class="text-center">
          <div class="text-6xl mb-4">🏠</div>
          <h1 class="font-heading font-bold text-2xl text-primary mb-2">Bien introuvable</h1>
          <p class="text-gray-500 mb-6">Ce bien n'existe pas ou a été retiré de la vente.</p>
          <a routerLink="/vente" class="btn-primary">Voir tous les biens</a>
        </div>
      </div>
    } @else {
      <div class="min-h-screen flex items-center justify-center pt-20">
        <div class="flex flex-col items-center gap-4">
          <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p class="text-gray-500">Chargement du bien...</p>
        </div>
      </div>
    }
  `,
  styles: [`:host { display: block; }`]
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
