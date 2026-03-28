import { Component, inject, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { PropertyService } from '../../core/services/property.service';
import { Property } from '../../core/models/property.model';
import { PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS, TransactionType } from '../../core/models/enums';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { DpeBadgeComponent } from '../../shared/components/dpe-badge.component';
import { PriceFormatterPipe } from '../../shared/pipes/price-formatter.pipe';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusBadgeComponent, DpeBadgeComponent, PriceFormatterPipe],
  template: `
    @if (property()) {
      <div class="detail-page">
        <!-- Header -->
        <div class="detail-header">
          <div class="breadcrumb">
            <a routerLink="/properties" class="breadcrumb-link">
              <i class="pi pi-arrow-left"></i> Biens
            </a>
            <span>/</span>
            <span>{{ property()!.reference }}</span>
          </div>
          <div class="header-actions">
            <app-status-badge [status]="property()!.status"></app-status-badge>
            <button class="btn-secondary" [routerLink]="['/properties', property()!.id, 'edit']">
              <i class="pi pi-pencil"></i> Modifier
            </button>
          </div>
        </div>

        <!-- Photo gallery -->
        <div class="photo-gallery">
          <div class="main-photo">
            <img [src]="property()!.photos[0]?.url" [alt]="property()!.title" />
          </div>
        </div>

        <div class="detail-grid">
          <!-- Main info -->
          <div class="detail-main">
            <div class="card">
              <div class="prop-price-title">
                <div>
                  <div class="prop-price">{{ property()!.price | priceFormatter:'€':(property()!.transactionType === TransactionType.RENTAL) }}</div>
                  <h1 class="prop-title">{{ property()!.title }}</h1>
                  <div class="prop-address">
                    <i class="pi pi-map-marker"></i>
                    {{ property()!.address.streetNumber }} {{ property()!.address.street }}, {{ property()!.address.city }} {{ property()!.address.postalCode }}
                  </div>
                </div>
                <div class="prop-badges">
                  @if (property()!.dpe) { <app-dpe-badge [dpe]="property()!.dpe!"></app-dpe-badge> }
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="card">
              <h3 class="card-title">Description</h3>
              <p class="prop-description">{{ property()!.description }}</p>
            </div>

            <!-- Features -->
            <div class="card">
              <h3 class="card-title">Caractéristiques</h3>
              <div class="features-grid">
                <div class="feature-item">
                  <i class="pi pi-th-large"></i>
                  <span class="feat-label">Pièces</span>
                  <span class="feat-value">{{ property()!.features.rooms }}</span>
                </div>
                <div class="feature-item">
                  <i class="pi pi-moon"></i>
                  <span class="feat-label">Chambres</span>
                  <span class="feat-value">{{ property()!.features.bedrooms }}</span>
                </div>
                <div class="feature-item">
                  <i class="pi pi-expand"></i>
                  <span class="feat-label">Surface</span>
                  <span class="feat-value">{{ property()!.features.surface }} m²</span>
                </div>
                <div class="feature-item">
                  <i class="pi pi-angle-double-up"></i>
                  <span class="feat-label">Étage</span>
                  <span class="feat-value">{{ property()!.features.floor ?? 'RDC' }}</span>
                </div>
                <div class="feature-item">
                  <i class="pi pi-calendar"></i>
                  <span class="feat-label">Construction</span>
                  <span class="feat-value">{{ property()!.features.constructionYear ?? '—' }}</span>
                </div>
                <div class="feature-item">
                  <i class="pi pi-compass"></i>
                  <span class="feat-label">Orientation</span>
                  <span class="feat-value">{{ property()!.features.orientation ?? '—' }}</span>
                </div>
              </div>
              <div class="amenities-list">
                @if (property()!.features.hasParking) { <span class="amenity"><i class="pi pi-check"></i> Parking</span> }
                @if (property()!.features.hasGarage) { <span class="amenity"><i class="pi pi-check"></i> Garage</span> }
                @if (property()!.features.hasGarden) { <span class="amenity"><i class="pi pi-check"></i> Jardin</span> }
                @if (property()!.features.hasPool) { <span class="amenity"><i class="pi pi-check"></i> Piscine</span> }
                @if (property()!.features.hasBalcony) { <span class="amenity"><i class="pi pi-check"></i> Balcon</span> }
                @if (property()!.features.hasTerrace) { <span class="amenity"><i class="pi pi-check"></i> Terrasse</span> }
                @if (property()!.features.hasElevator) { <span class="amenity"><i class="pi pi-check"></i> Ascenseur</span> }
                @if (property()!.features.hasCellar) { <span class="amenity"><i class="pi pi-check"></i> Cave</span> }
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="detail-sidebar">
            <div class="card">
              <h3 class="card-title">Informations</h3>
              <div class="info-list">
                <div class="info-row">
                  <span class="info-key">Référence</span>
                  <span class="info-val">{{ property()!.reference }}</span>
                </div>
                <div class="info-row">
                  <span class="info-key">Type</span>
                  <span class="info-val">{{ getTypeLabel(property()!.type) }}</span>
                </div>
                <div class="info-row">
                  <span class="info-key">Transaction</span>
                  <span class="info-val">{{ property()!.transactionType === TransactionType.RENTAL ? 'Location' : 'Vente' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-key">Statut</span>
                  <app-status-badge [status]="property()!.status"></app-status-badge>
                </div>
                <div class="info-row">
                  <span class="info-key">Visites</span>
                  <span class="info-val">{{ property()!.visitCount ?? 0 }}</span>
                </div>
                <div class="info-row">
                  <span class="info-key">Publié le</span>
                  <span class="info-val">{{ property()!.publishedAt | date:'dd/MM/yyyy' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <div class="loading-detail">
        <div class="spinner-large"></div>
      </div>
    }
  `,
  styles: [`
    .detail-page { animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    .detail-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem;
    }
    .breadcrumb { display: flex; align-items: center; gap: 0.75rem; font-size: 0.875rem; color: #64748b; }
    .breadcrumb-link { display: flex; align-items: center; gap: 0.4rem; color: #1B4F72; text-decoration: none; font-weight: 500; }
    .breadcrumb-link:hover { text-decoration: underline; }
    .header-actions { display: flex; gap: 0.75rem; align-items: center; }

    .btn-secondary {
      display: flex; align-items: center; gap: 0.4rem;
      background: #fff; color: #475569; border: 1.5px solid #e2e8f0;
      padding: 0.5rem 1rem; border-radius: 8px;
      font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s;
    }
    .btn-secondary:hover { border-color: #1B4F72; color: #1B4F72; }

    .photo-gallery { margin-bottom: 1.5rem; }
    .main-photo { border-radius: 12px; overflow: hidden; height: 400px; }
    .main-photo img { width: 100%; height: 100%; object-fit: cover; }

    .detail-grid {
      display: grid; grid-template-columns: 1fr 300px; gap: 1.25rem;
    }
    @media (max-width: 1100px) { .detail-grid { grid-template-columns: 1fr; } }

    .detail-main, .detail-sidebar { display: flex; flex-direction: column; gap: 1.25rem; }

    .card { background: #fff; border-radius: 12px; padding: 1.25rem; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }

    .card-title { font-size: 0.95rem; font-weight: 700; color: #1e293b; margin: 0 0 1rem; }

    .prop-price-title { display: flex; justify-content: space-between; align-items: flex-start; }
    .prop-price { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.75rem; font-weight: 800; color: #1B4F72; }
    .prop-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.2rem; font-weight: 700; color: #1e293b; margin: 0.25rem 0; }
    .prop-address { font-size: 0.875rem; color: #64748b; display: flex; align-items: center; gap: 4px; }
    .prop-description { font-size: 0.875rem; color: #475569; line-height: 1.65; margin: 0; }

    .features-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1rem;
    }
    .feature-item {
      display: flex; flex-direction: column; align-items: center;
      text-align: center; padding: 0.875rem; background: #f8fafc;
      border-radius: 10px; border: 1px solid #f1f5f9;
    }
    .feature-item i { font-size: 1.1rem; color: #1B4F72; margin-bottom: 0.35rem; }
    .feat-label { font-size: 0.7rem; color: #94a3b8; }
    .feat-value { font-size: 0.875rem; font-weight: 700; color: #1e293b; }

    .amenities-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .amenity {
      display: flex; align-items: center; gap: 4px;
      background: rgba(16,185,129,0.08); color: #059669;
      padding: 4px 10px; border-radius: 100px; font-size: 0.78rem; font-weight: 500;
    }
    .amenity i { font-size: 0.7rem; }

    .info-list { display: flex; flex-direction: column; gap: 0; }
    .info-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.625rem 0; border-bottom: 1px solid #f8fafc; font-size: 0.85rem;
    }
    .info-row:last-child { border-bottom: none; }
    .info-key { color: #64748b; }
    .info-val { font-weight: 600; color: #1e293b; }

    .loading-detail { display: flex; align-items: center; justify-content: center; height: 400px; }
    .spinner-large {
      width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #1B4F72;
      border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class PropertyDetailComponent implements OnInit {
  @Input() id!: string;
  private readonly route = inject(ActivatedRoute);
  private readonly propertyService = inject(PropertyService);
  readonly TransactionType = TransactionType;

  property = signal<Property | null>(null);

  ngOnInit(): void {
    const id = this.id || this.route.snapshot.paramMap.get('id')!;
    this.propertyService.getById(id).subscribe(p => this.property.set(p));
  }

  getTypeLabel(type: string): string {
    return PROPERTY_TYPE_LABELS[type as keyof typeof PROPERTY_TYPE_LABELS] || type;
  }
}
