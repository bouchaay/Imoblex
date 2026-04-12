import { Component, OnInit, OnDestroy, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as L from 'leaflet';
import { PropertyService } from '../../shared/services/property.service';
import { FavoritesService } from '../../shared/services/favorites.service';
import { PropertyCardComponent } from '../../shared/components/property-card.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb.component';
import { Property, PropertySearchParams, TransactionType, PropertyType } from '../../shared/models/property.model';

type ViewMode = 'grid' | 'list' | 'map';
type SortOption = 'date_desc' | 'price_asc' | 'price_desc' | 'area_desc';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PropertyCardComponent, BreadcrumbComponent],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
  private readonly propertyService = inject(PropertyService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  transactionType = signal<TransactionType>('sale');
  showFavoritesOnly = signal(false);
  properties = signal<Property[]>([]);
  allFetchedProperties = signal<Property[]>([]);
  totalResults = signal(0);
  currentPage = signal(1);
  totalPages = signal(1);
  loading = signal(true);
  currentView = signal<ViewMode>('grid');
  sortBy: SortOption = 'date_desc';

  get favoritesCount(): number { return this.favoritesService.count(); }

  private map: L.Map | null = null;
  private markers: L.Layer[] = [];

  constructor() {
    effect(() => {
      const view = this.currentView();
      if (view === 'map') {
        setTimeout(() => this.initMap(), 50);
      } else {
        this.destroyMap();
      }
    });
    // Refresh markers when properties change
    effect(() => {
      const props = this.properties();
      if (this.map && props.length >= 0) {
        this.updateMarkers();
      }
    });
  }

  // Filter values
  minPrice: number | null = null;
  maxPrice: number | null = null;
  minArea: number | null = null;
  maxArea: number | null = null;
  minRooms: number | null = null;
  cityFilter = '';

  propertyTypes = [
    { value: 'apartment' as PropertyType, label: 'Appartement', checked: false },
    { value: 'house' as PropertyType, label: 'Maison', checked: false },
    { value: 'villa' as PropertyType, label: 'Villa', checked: false },
    { value: 'studio' as PropertyType, label: 'Studio', checked: false },
    { value: 'commercial' as PropertyType, label: 'Local commercial', checked: false },
    { value: 'land' as PropertyType, label: 'Terrain', checked: false },
    { value: 'parking' as PropertyType, label: 'Parking / Garage', checked: false },
  ];

  amenityFilters = [
    { label: 'Balcon / Terrasse', checked: false },
    { label: 'Jardin', checked: false },
    { label: 'Parking / Garage', checked: false },
    { label: 'Piscine', checked: false },
    { label: 'Ascenseur', checked: false },
    { label: 'Cave', checked: false },
  ];

  viewModes = [
    { mode: 'grid' as ViewMode, label: 'Grille', icon: 'M4 6h4v4H4zm0 7h4v4H4zm7-7h4v4h-4zm0 7h4v4h-4zm7-7h4v4h-4zm0 7h4v4h-4z' },
    { mode: 'list' as ViewMode, label: 'Liste', icon: 'M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z' },
    { mode: 'map' as ViewMode, label: 'Carte', icon: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z' },
  ];

  breadcrumbs = computed(() => [
    { label: 'Accueil', path: '/' },
    { label: this.transactionType() === 'sale' ? 'Vente' : 'Location' },
  ]);

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });

  ngOnInit(): void {
    // Read route data and query params
    this.route.data.subscribe(data => {
      if (data['transactionType']) {
        this.transactionType.set(data['transactionType']);
      }
    });

    this.route.queryParamMap.subscribe(params => {
      // Reset all property-type checkboxes before applying new params
      this.propertyTypes.forEach(t => t.checked = false);

      const propertyType = params.get('propertyType') as PropertyType | null;
      if (propertyType) {
        const found = this.propertyTypes.find(t => t.value === propertyType);
        if (found) found.checked = true;
      }

      this.cityFilter = params.get('city') ?? '';
      const maxPrice = params.get('maxPrice');
      this.maxPrice = maxPrice ? +maxPrice : null;
      this.applyFilters();
    });
  }

  setTransactionType(type: TransactionType): void {
    this.transactionType.set(type);
    this.showFavoritesOnly.set(false);
    this.currentPage.set(1);
    this.applyFilters();
    this.router.navigate([type === 'sale' ? '/vente' : '/location']);
  }

  toggleFavorites(): void {
    this.showFavoritesOnly.update(v => !v);
    this.currentPage.set(1);
    this.applyFilters();
  }

  setView(mode: ViewMode): void {
    this.currentView.set(mode);
  }

  setMinRooms(rooms: number): void {
    this.minRooms = this.minRooms === rooms ? null : rooms;
    this.applyFilters();
  }

  applyFilters(): void {
    this.loading.set(true);

    if (this.showFavoritesOnly()) {
      const ids = this.favoritesService.getFavoriteIds();
      if (ids.length === 0) {
        this.properties.set([]);
        this.totalResults.set(0);
        this.totalPages.set(1);
        this.loading.set(false);
        return;
      }
      // Load each favorited property directly by ID — reliable regardless of pagination
      forkJoin(
        ids.map(id => this.propertyService.getPropertyById(id).pipe(catchError(() => of(null))))
      ).subscribe(results => {
        const favProps = results.filter((p): p is Property => p !== null);
        this.properties.set(favProps);
        this.totalResults.set(favProps.length);
        this.totalPages.set(1);
        this.loading.set(false);
      });
      return;
    }

    const selectedTypes = this.propertyTypes.filter(t => t.checked).map(t => t.value);
    const params: PropertySearchParams = {
      type: this.transactionType(),
      propertyTypes: selectedTypes.length > 0 ? selectedTypes : undefined,
      city: this.cityFilter || undefined,
      minPrice: this.minPrice ?? undefined,
      maxPrice: this.maxPrice ?? undefined,
      minArea: this.minArea ?? undefined,
      maxArea: this.maxArea ?? undefined,
      minRooms: this.minRooms ?? undefined,
      sortBy: this.sortBy,
      page: this.currentPage(),
      limit: 12,
    };

    this.propertyService.searchProperties(params).subscribe(result => {
      this.properties.set(result.properties);
      this.totalResults.set(result.total);
      this.totalPages.set(result.totalPages);
      this.loading.set(false);
    });
  }

  resetFilters(): void {
    this.minPrice = null;
    this.maxPrice = null;
    this.minArea = null;
    this.maxArea = null;
    this.minRooms = null;
    this.cityFilter = '';
    this.propertyTypes.forEach(t => t.checked = false);
    this.amenityFilters.forEach(f => f.checked = false);
    this.currentPage.set(1);
    this.applyFilters();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.applyFilters();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  formatPrice(property: Property): string {
    const formatted = new Intl.NumberFormat('fr-FR', {
      style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
    }).format(property.price);
    return property.transactionType === 'rent' ? `${formatted}/mois` : formatted;
  }

  private initMap(): void {
    const el = document.getElementById('search-map');
    if (!el || this.map) return;

    this.map = L.map(el, { zoomControl: true }).setView([46.6, 2.2], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(this.map);

    this.updateMarkers();
  }

  private updateMarkers(): void {
    if (!this.map) return;
    this.markers.forEach(m => this.map!.removeLayer(m));
    this.markers = [];

    const withCoords = this.properties().filter(p => p.location?.lat && p.location?.lng);
    withCoords.forEach(property => {
      const priceLabel = this.formatPrice(property);
      const icon = L.divIcon({
        html: `
          <div class="map-marker-wrap">
            <div class="map-price-badge">
              <span class="map-price-dot"></span>
              ${priceLabel}
            </div>
            <div class="map-marker-arrow"></div>
          </div>`,
        className: '',
        iconAnchor: [52, 44]
      });

      const photo = property.photos?.[0] ?? '';
      const popup = `
        <div style="width:200px;font-family:sans-serif">
          ${photo ? `<img src="${photo}" style="width:100%;height:110px;object-fit:cover;border-radius:8px;margin-bottom:10px;display:block">` : ''}
          <div style="font-size:11px;color:#64748b;font-weight:500;margin-bottom:2px;text-transform:uppercase;letter-spacing:.5px">${property.type ?? ''}</div>
          <div style="font-size:13px;font-weight:700;color:#1B4F72;margin-bottom:4px;line-height:1.3">${property.title}</div>
          <div style="font-size:15px;font-weight:800;color:#e67e22;margin-bottom:6px">${priceLabel}</div>
          <div style="font-size:11px;color:#94a3b8;margin-bottom:10px">${property.area} m² · ${property.rooms} pièce${property.rooms > 1 ? 's' : ''}</div>
          <button data-nav-id="${property.id}" style="width:100%;text-align:center;background:linear-gradient(135deg,#1B4F72,#2471a3);color:#fff;padding:8px;border-radius:8px;font-size:12px;font-weight:600;border:none;cursor:pointer;letter-spacing:.3px">Voir le bien →</button>
        </div>`;

      const marker = L.marker([property.location.lat, property.location.lng], { icon })
        .addTo(this.map!)
        .bindPopup(popup, { maxWidth: 220 });

      marker.on('popupopen', () => {
        setTimeout(() => {
          const btn = document.querySelector(`[data-nav-id="${property.id}"]`);
          btn?.addEventListener('click', () => this.router.navigate(['/bien', property.id]));
        }, 0);
      });

      this.markers.push(marker);
    });

    if (withCoords.length > 0) {
      const group = L.featureGroup(this.markers as L.Marker[]);
      this.map.fitBounds(group.getBounds().pad(0.2));
    }
  }

  private destroyMap(): void {
    if (this.map) { this.map.remove(); this.map = null; this.markers = []; }
  }

  ngOnDestroy(): void { this.destroyMap(); }
}
