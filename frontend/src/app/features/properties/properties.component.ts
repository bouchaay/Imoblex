import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../core/services/property.service';
import { Property, PropertySearchRequest } from '../../core/models/property.model';
import { PropertyType, PropertyStatus, TransactionType, PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS } from '../../core/models/enums';
import { PropertyCardComponent } from './property-card.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PropertyCardComponent, ConfirmDialogComponent],
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.scss']
})
export class PropertiesComponent implements OnInit {
  private readonly propertyService = inject(PropertyService);
  private readonly router = inject(Router);

  properties = signal<Property[]>([]);
  totalItems = signal(0);
  totalPages = signal(1);
  currentPage = signal(1);
  isLoading = signal(false);
  viewMode = signal<'grid' | 'list'>('grid');
  filterSidebarOpen = signal(false);
  showDeleteDialog = false;
  propertyToDelete = signal<Property | null>(null);

  filters: PropertySearchRequest = {
    query: '',
    status: [],
    type: [],
    pageSize: 12
  };

  sortBy = 'createdAt_desc';

  statusOptions = [
    { value: PropertyStatus.AVAILABLE, label: 'Disponible', color: '#10b981' },
    { value: PropertyStatus.UNDER_OFFER, label: 'Sous offre', color: '#f59e0b' },
    { value: PropertyStatus.SOLD, label: 'Vendu', color: '#ef4444' },
    { value: PropertyStatus.RENTED, label: 'Loué', color: '#8b5cf6' },
    { value: PropertyStatus.OFF_MARKET, label: 'Hors marché', color: '#6b7280' }
  ];

  typeOptions = [
    { value: PropertyType.APARTMENT, label: 'Appartement', icon: 'pi-building' },
    { value: PropertyType.HOUSE, label: 'Maison', icon: 'pi-home' },
    { value: PropertyType.VILLA, label: 'Villa', icon: 'pi-sun' },
    { value: PropertyType.STUDIO, label: 'Studio', icon: 'pi-inbox' },
    { value: PropertyType.LOFT, label: 'Loft', icon: 'pi-box' },
    { value: PropertyType.LAND, label: 'Terrain', icon: 'pi-map' }
  ];

  ngOnInit(): void { this.applyFilters(); }

  applyFilters(): void {
    this.isLoading.set(true);
    const [sortField, sortOrder] = this.sortBy.split('_');
    const req = { ...this.filters, page: this.currentPage(), sortBy: sortField, sortOrder: sortOrder as 'asc' | 'desc' };
    this.propertyService.getAll(req).subscribe(res => {
      this.properties.set(res.items);
      this.totalItems.set(res.total);
      this.totalPages.set(res.totalPages);
      this.isLoading.set(false);
    });
  }

  activeFilterCount(): number {
    let count = 0;
    if (this.filters.status?.length) count++;
    if (this.filters.type?.length) count++;
    if (this.filters.transactionType) count++;
    if (this.filters.minPrice || this.filters.maxPrice) count++;
    if (this.filters.minSurface || this.filters.maxSurface) count++;
    return count;
  }

  isStatusSelected(s: PropertyStatus): boolean {
    return this.filters.status?.includes(s) || false;
  }

  isTypeSelected(t: PropertyType): boolean {
    return this.filters.type?.includes(t) || false;
  }

  toggleStatus(s: PropertyStatus): void {
    const arr = [...(this.filters.status || [])];
    const idx = arr.indexOf(s);
    if (idx >= 0) arr.splice(idx, 1); else arr.push(s);
    this.filters.status = arr;
    this.applyFilters();
  }

  toggleType(t: PropertyType): void {
    const arr = [...(this.filters.type || [])];
    const idx = arr.indexOf(t);
    if (idx >= 0) arr.splice(idx, 1); else arr.push(t);
    this.filters.type = arr;
    this.applyFilters();
  }

  setTransactionType(t: string | null): void {
    this.filters.transactionType = t as TransactionType | undefined;
    this.applyFilters();
  }

  resetFilters(): void {
    this.filters = { query: '', status: [], type: [], pageSize: 12 };
    this.sortBy = 'createdAt_desc';
    this.currentPage.set(1);
    this.applyFilters();
  }

  goToPage(p: number): void {
    this.currentPage.set(p);
    this.applyFilters();
  }

  getPages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: number[] = [1];
    if (current > 3) pages.push(-1);
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push(-1);
    pages.push(total);
    return pages;
  }

  onEdit(p: Property): void {
    this.router.navigate(['/properties', p.id, 'edit']);
  }

  onDeleteRequest(p: Property): void {
    this.propertyToDelete.set(p);
    this.showDeleteDialog = true;
  }

  confirmDelete(): void {
    const p = this.propertyToDelete();
    if (p) {
      this.propertyService.delete(p.id).subscribe(() => {
        this.applyFilters();
        this.propertyToDelete.set(null);
      });
    }
  }

  onTogglePublish(p: Property): void {
    this.propertyService.togglePublish(p.id, !p.isPublished).subscribe(() => {
      this.applyFilters();
    });
  }
}
