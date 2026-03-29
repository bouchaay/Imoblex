import { Component, OnInit, AfterViewInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../shared/services/property.service';
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
export class SearchComponent implements OnInit {
  private readonly propertyService = inject(PropertyService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  transactionType = signal<TransactionType>('sale');
  properties = signal<Property[]>([]);
  totalResults = signal(0);
  currentPage = signal(1);
  totalPages = signal(1);
  loading = signal(true);
  currentView = signal<ViewMode>('grid');
  sortBy: SortOption = 'date_desc';

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
    { value: 'loft' as PropertyType, label: 'Loft', checked: false },
    { value: 'commercial' as PropertyType, label: 'Local commercial', checked: false },
    { value: 'land' as PropertyType, label: 'Terrain', checked: false },
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
      const type = params.get('type') as TransactionType;
      if (type === 'sale' || type === 'rent') this.transactionType.set(type);
      this.cityFilter = params.get('city') ?? '';
      const maxPrice = params.get('maxPrice');
      if (maxPrice) this.maxPrice = +maxPrice;
      this.applyFilters();
    });
  }

  setTransactionType(type: TransactionType): void {
    this.transactionType.set(type);
    this.currentPage.set(1);
    this.applyFilters();
    this.router.navigate([type === 'sale' ? '/vente' : '/location']);
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
}
