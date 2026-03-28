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
  template: `
    <div class="properties-page">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Biens immobiliers</h1>
          <p class="page-subtitle">{{ totalItems() }} bien{{ totalItems() > 1 ? 's' : '' }} trouvé{{ totalItems() > 1 ? 's' : '' }}</p>
        </div>
        <button class="btn-primary" routerLink="/properties/new">
          <i class="pi pi-plus"></i> Ajouter un bien
        </button>
      </div>

      <div class="properties-layout">
        <!-- Sidebar filters -->
        <aside class="filters-sidebar" [class.open]="filterSidebarOpen()">
          <div class="filters-header">
            <h3>Filtres</h3>
            <button class="reset-btn" (click)="resetFilters()">Réinitialiser</button>
          </div>

          <!-- Transaction type -->
          <div class="filter-section">
            <label class="filter-label">Type de transaction</label>
            <div class="radio-group">
              <label class="radio-item" [class.active]="!filters.transactionType" (click)="setTransactionType(null)">
                Tous
              </label>
              <label class="radio-item" [class.active]="filters.transactionType === 'SALE'" (click)="setTransactionType('SALE')">
                Vente
              </label>
              <label class="radio-item" [class.active]="filters.transactionType === 'RENTAL'" (click)="setTransactionType('RENTAL')">
                Location
              </label>
            </div>
          </div>

          <!-- Status filter -->
          <div class="filter-section">
            <label class="filter-label">Statut</label>
            <div class="checkbox-filters">
              @for (status of statusOptions; track status.value) {
                <label class="check-item">
                  <input type="checkbox" [checked]="isStatusSelected(status.value)"
                    (change)="toggleStatus(status.value)" />
                  <span class="status-dot-small" [style.background]="status.color"></span>
                  {{ status.label }}
                </label>
              }
            </div>
          </div>

          <!-- Property type filter -->
          <div class="filter-section">
            <label class="filter-label">Type de bien</label>
            <div class="checkbox-filters">
              @for (type of typeOptions; track type.value) {
                <label class="check-item">
                  <input type="checkbox" [checked]="isTypeSelected(type.value)"
                    (change)="toggleType(type.value)" />
                  <i class="pi {{ type.icon }}"></i>
                  {{ type.label }}
                </label>
              }
            </div>
          </div>

          <!-- Price range -->
          <div class="filter-section">
            <label class="filter-label">Prix</label>
            <div class="range-inputs">
              <input type="number" [(ngModel)]="filters.minPrice" placeholder="Min €"
                class="range-input" (ngModelChange)="applyFilters()" />
              <span>—</span>
              <input type="number" [(ngModel)]="filters.maxPrice" placeholder="Max €"
                class="range-input" (ngModelChange)="applyFilters()" />
            </div>
          </div>

          <!-- Surface -->
          <div class="filter-section">
            <label class="filter-label">Surface (m²)</label>
            <div class="range-inputs">
              <input type="number" [(ngModel)]="filters.minSurface" placeholder="Min"
                class="range-input" (ngModelChange)="applyFilters()" />
              <span>—</span>
              <input type="number" [(ngModel)]="filters.maxSurface" placeholder="Max"
                class="range-input" (ngModelChange)="applyFilters()" />
            </div>
          </div>

          <button class="apply-filters-btn" (click)="applyFilters()">
            <i class="pi pi-search"></i> Appliquer
          </button>
        </aside>

        <!-- Main content -->
        <div class="properties-main">
          <!-- Toolbar -->
          <div class="toolbar">
            <div class="toolbar-left">
              <button class="filter-toggle-btn" (click)="filterSidebarOpen.set(!filterSidebarOpen())">
                <i class="pi pi-filter"></i>
                Filtres
                @if (activeFilterCount() > 0) {
                  <span class="filter-badge">{{ activeFilterCount() }}</span>
                }
              </button>

              <div class="search-box">
                <i class="pi pi-search"></i>
                <input
                  type="text"
                  [(ngModel)]="filters.query"
                  (input)="applyFilters()"
                  placeholder="Rechercher par référence, titre, ville..."
                  class="search-input"
                />
              </div>
            </div>

            <div class="toolbar-right">
              <select class="sort-select" [(ngModel)]="sortBy" (ngModelChange)="applyFilters()">
                <option value="createdAt_desc">Plus récents</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
                <option value="surface_desc">Surface décroissante</option>
              </select>

              <div class="view-toggle">
                <button
                  class="view-btn"
                  [class.active]="viewMode() === 'grid'"
                  (click)="viewMode.set('grid')"
                  title="Vue grille"
                >
                  <i class="pi pi-th-large"></i>
                </button>
                <button
                  class="view-btn"
                  [class.active]="viewMode() === 'list'"
                  (click)="viewMode.set('list')"
                  title="Vue liste"
                >
                  <i class="pi pi-list"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Properties grid/list -->
          @if (isLoading()) {
            <div class="loading-grid">
              @for (n of [1,2,3,4,5,6]; track n) {
                <div class="skeleton-card">
                  <div class="skeleton-photo skeleton-anim"></div>
                  <div class="skeleton-content">
                    <div class="skeleton-line skeleton-anim" style="width:60%; height:20px"></div>
                    <div class="skeleton-line skeleton-anim" style="width:90%; height:14px; margin-top:8px"></div>
                    <div class="skeleton-line skeleton-anim" style="width:40%; height:14px; margin-top:6px"></div>
                  </div>
                </div>
              }
            </div>
          } @else if (properties().length === 0) {
            <div class="empty-state">
              <i class="pi pi-building"></i>
              <h3>Aucun bien trouvé</h3>
              <p>Modifiez vos filtres ou ajoutez un nouveau bien</p>
              <button class="btn-primary" routerLink="/properties/new">
                <i class="pi pi-plus"></i> Ajouter un bien
              </button>
            </div>
          } @else {
            <div class="properties-grid" [class.list-view]="viewMode() === 'list'">
              @for (property of properties(); track property.id) {
                <app-property-card
                  [property]="property"
                  [viewMode]="viewMode()"
                  (edit)="onEdit($event)"
                  (delete)="onDeleteRequest($event)"
                  (togglePublish)="onTogglePublish($event)"
                ></app-property-card>
              }
            </div>

            <!-- Pagination -->
            @if (totalPages() > 1) {
              <div class="pagination">
                <button class="page-btn" [disabled]="currentPage() === 1" (click)="goToPage(currentPage() - 1)">
                  <i class="pi pi-chevron-left"></i>
                </button>
                @for (page of getPages(); track page) {
                  <button
                    class="page-btn"
                    [class.active]="page === currentPage()"
                    [class.ellipsis]="page === -1"
                    [disabled]="page === -1"
                    (click)="page !== -1 && goToPage(page)"
                  >
                    {{ page === -1 ? '...' : page }}
                  </button>
                }
                <button class="page-btn" [disabled]="currentPage() === totalPages()" (click)="goToPage(currentPage() + 1)">
                  <i class="pi pi-chevron-right"></i>
                </button>
              </div>
            }
          }
        </div>
      </div>
    </div>

    <!-- Confirm delete dialog -->
    <app-confirm-dialog
      [(visible)]="showDeleteDialog"
      title="Supprimer le bien ?"
      [message]="'Voulez-vous vraiment supprimer le bien ' + (propertyToDelete()?.reference || '') + ' ? Cette action est irréversible.'"
      confirmLabel="Supprimer"
      type="danger"
      (confirm)="confirmDelete()"
    ></app-confirm-dialog>
  `,
  styles: [`
    .properties-page { animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap;
    }
    .page-title {
      font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.5rem;
      font-weight: 800; color: #0f172a; margin: 0 0 0.2rem;
    }
    .page-subtitle { font-size: 0.875rem; color: #64748b; margin: 0; }

    .btn-primary {
      display: flex; align-items: center; gap: 0.4rem;
      background: #1B4F72; color: #fff; border: none;
      padding: 0.625rem 1.125rem; border-radius: 8px;
      font-size: 0.875rem; font-weight: 600; cursor: pointer;
      transition: all 0.2s; white-space: nowrap;
    }
    .btn-primary:hover { background: #164469; }

    /* Layout */
    .properties-layout { display: flex; gap: 1.25rem; }

    /* Filters sidebar */
    .filters-sidebar {
      width: 240px; min-width: 240px;
      background: #fff; border-radius: 12px;
      padding: 1.25rem; box-shadow: 0 1px 4px rgba(0,0,0,0.06);
      height: fit-content; position: sticky; top: 1.5rem;
    }

    @media (max-width: 1100px) {
      .filters-sidebar {
        display: none; position: fixed; left: 0; top: 64px; bottom: 0;
        z-index: 50; border-radius: 0; overflow-y: auto;
      }
      .filters-sidebar.open { display: block; }
    }

    .filters-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 1rem;
    }
    .filters-header h3 { font-size: 0.9rem; font-weight: 700; color: #1e293b; margin: 0; }
    .reset-btn {
      background: none; border: none; color: #1B4F72; font-size: 0.78rem;
      cursor: pointer; font-weight: 500;
    }
    .reset-btn:hover { text-decoration: underline; }

    .filter-section { margin-bottom: 1.25rem; padding-bottom: 1.25rem; border-bottom: 1px solid #f1f5f9; }

    .filter-label { display: block; font-size: 0.78rem; font-weight: 700; color: #374151; margin-bottom: 0.625rem; text-transform: uppercase; letter-spacing: 0.05em; }

    .radio-group { display: flex; gap: 4px; }
    .radio-item {
      flex: 1; text-align: center; padding: 5px 4px; border-radius: 6px;
      border: 1.5px solid #e2e8f0; font-size: 0.75rem; font-weight: 500;
      color: #475569; cursor: pointer; transition: all 0.15s;
    }
    .radio-item.active { background: #1B4F72; border-color: #1B4F72; color: #fff; }

    .checkbox-filters { display: flex; flex-direction: column; gap: 0.5rem; }
    .check-item {
      display: flex; align-items: center; gap: 0.5rem;
      font-size: 0.8rem; color: #475569; cursor: pointer;
    }
    .check-item input { width: 14px; height: 14px; accent-color: #1B4F72; }
    .check-item i { font-size: 0.75rem; color: #94a3b8; }
    .status-dot-small { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

    .range-inputs { display: flex; align-items: center; gap: 0.5rem; }
    .range-input {
      flex: 1; padding: 5px 8px; border: 1.5px solid #e2e8f0;
      border-radius: 6px; font-size: 0.78rem; outline: none; min-width: 0;
    }
    .range-input:focus { border-color: #1B4F72; }

    .apply-filters-btn {
      width: 100%; padding: 0.625rem; background: #1B4F72; color: #fff;
      border: none; border-radius: 8px; font-size: 0.85rem; font-weight: 600;
      cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.4rem;
      transition: all 0.2s;
    }
    .apply-filters-btn:hover { background: #164469; }

    /* Main */
    .properties-main { flex: 1; min-width: 0; }

    /* Toolbar */
    .toolbar {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 1.25rem; gap: 1rem; flex-wrap: wrap;
    }
    .toolbar-left, .toolbar-right { display: flex; align-items: center; gap: 0.75rem; }

    .filter-toggle-btn {
      display: flex; align-items: center; gap: 0.4rem;
      background: #fff; border: 1.5px solid #e2e8f0;
      padding: 0.5rem 0.875rem; border-radius: 8px;
      font-size: 0.85rem; font-weight: 500; color: #475569; cursor: pointer;
      transition: all 0.2s;
    }
    .filter-toggle-btn:hover { border-color: #1B4F72; color: #1B4F72; }

    .filter-badge {
      background: #1B4F72; color: #fff; font-size: 0.65rem; font-weight: 700;
      width: 18px; height: 18px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
    }

    .search-box {
      display: flex; align-items: center; gap: 0.5rem;
      background: #fff; border: 1.5px solid #e2e8f0;
      border-radius: 8px; padding: 0 0.75rem;
      transition: border-color 0.2s;
    }
    .search-box:focus-within { border-color: #1B4F72; }
    .search-box i { color: #94a3b8; font-size: 0.85rem; }
    .search-input { border: none; outline: none; font-size: 0.875rem; padding: 0.5rem 0; min-width: 200px; }

    .sort-select {
      border: 1.5px solid #e2e8f0; border-radius: 8px;
      padding: 0.5rem 0.75rem; font-size: 0.85rem; color: #475569;
      background: #fff; outline: none; cursor: pointer;
    }
    .sort-select:focus { border-color: #1B4F72; }

    .view-toggle {
      display: flex; border: 1.5px solid #e2e8f0; border-radius: 8px; overflow: hidden;
    }
    .view-btn {
      padding: 0.5rem 0.75rem; border: none; background: #fff;
      color: #94a3b8; cursor: pointer; transition: all 0.15s; font-size: 0.85rem;
    }
    .view-btn.active { background: #1B4F72; color: #fff; }

    /* Grid */
    .properties-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
    }
    .properties-grid.list-view {
      grid-template-columns: 1fr;
    }

    /* Loading skeletons */
    .loading-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
    }
    .skeleton-card { background: #fff; border-radius: 14px; overflow: hidden; }
    .skeleton-photo { height: 200px; background: #f1f5f9; }
    .skeleton-content { padding: 1rem; }
    .skeleton-line { border-radius: 6px; background: #f1f5f9; height: 14px; margin-bottom: 0; }
    .skeleton-anim { animation: shimmer 1.5s infinite; }
    @keyframes shimmer {
      0% { background-color: #f1f5f9; }
      50% { background-color: #e2e8f0; }
      100% { background-color: #f1f5f9; }
    }

    /* Empty state */
    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      gap: 0.75rem; padding: 4rem 2rem; text-align: center;
      background: #fff; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    .empty-state i { font-size: 3rem; color: #cbd5e1; }
    .empty-state h3 { font-size: 1.1rem; font-weight: 700; color: #374151; margin: 0; }
    .empty-state p { font-size: 0.875rem; color: #64748b; margin: 0; }

    /* Pagination */
    .pagination {
      display: flex; justify-content: center; gap: 4px; margin-top: 1.5rem;
    }
    .page-btn {
      width: 36px; height: 36px; border: 1.5px solid #e2e8f0;
      border-radius: 8px; background: #fff; font-size: 0.85rem;
      color: #475569; cursor: pointer; transition: all 0.15s;
      display: flex; align-items: center; justify-content: center;
    }
    .page-btn:hover:not(:disabled) { border-color: #1B4F72; color: #1B4F72; }
    .page-btn.active { background: #1B4F72; border-color: #1B4F72; color: #fff; }
    .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .page-btn.ellipsis { border: none; background: none; cursor: default; }
  `]
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
