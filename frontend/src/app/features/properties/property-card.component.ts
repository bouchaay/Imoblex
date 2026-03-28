import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Property } from '../../core/models/property.model';
import { TransactionType, PROPERTY_TYPE_LABELS } from '../../core/models/enums';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { DpeBadgeComponent } from '../../shared/components/dpe-badge.component';
import { PriceFormatterPipe } from '../../shared/pipes/price-formatter.pipe';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusBadgeComponent, DpeBadgeComponent, PriceFormatterPipe],
  template: `
    <div class="property-card" [class.list-view]="viewMode === 'list'">
      <!-- Photo section -->
      <div class="card-photo" [routerLink]="['/properties', property.id]">
        <img
          [src]="property.photos[0]?.url || 'https://via.placeholder.com/400x250/f1f5f9/94a3b8?text=Pas+de+photo'"
          [alt]="property.title"
          class="photo-img"
          loading="lazy"
        />
        <!-- Overlay badges -->
        <div class="photo-top-badges">
          <app-status-badge [status]="property.status"></app-status-badge>
          @if (property.transactionType === TransactionType.RENTAL) {
            <span class="rental-badge">Location</span>
          }
        </div>
        @if (!property.isPublished) {
          <div class="unpublished-overlay">
            <i class="pi pi-eye-slash"></i>
            <span>Non publié</span>
          </div>
        }
        <div class="photo-hover-actions">
          <button class="photo-action-btn" (click)="$event.preventDefault(); onEdit()" title="Modifier">
            <i class="pi pi-pencil"></i>
          </button>
          <button class="photo-action-btn" (click)="$event.preventDefault(); onDelete()" title="Supprimer">
            <i class="pi pi-trash"></i>
          </button>
        </div>
      </div>

      <!-- Content section -->
      <div class="card-content">
        <div class="card-top">
          <!-- Price -->
          <div class="price-block">
            <span class="price-main">
              {{ property.price | priceFormatter:'€':isRental }}
            </span>
            @if (!isRental && property.pricePerSqm) {
              <span class="price-sqm">{{ property.pricePerSqm | priceFormatter }}/m²</span>
            }
          </div>
          <!-- DPE -->
          @if (property.dpe) {
            <app-dpe-badge [dpe]="property.dpe"></app-dpe-badge>
          }
        </div>

        <!-- Title & ref -->
        <a [routerLink]="['/properties', property.id]" class="card-title-link">
          <h3 class="card-title">{{ property.title }}</h3>
        </a>
        <div class="card-address">
          <i class="pi pi-map-marker"></i>
          {{ property.address.streetNumber }} {{ property.address.street }}, {{ property.address.city }}
        </div>

        <!-- Features row -->
        <div class="features-row">
          <span class="feature-chip">
            <i class="pi pi-th-large"></i>
            {{ property.features.rooms }} pièce{{ property.features.rooms > 1 ? 's' : '' }}
          </span>
          <span class="feature-chip">
            <i class="pi pi-moon"></i>
            {{ property.features.bedrooms }} ch.
          </span>
          <span class="feature-chip">
            <i class="pi pi-expand"></i>
            {{ property.features.surface }} m²
          </span>
          @if (property.features.landSurface) {
            <span class="feature-chip">
              <i class="pi pi-map"></i>
              {{ property.features.landSurface }} m² terrain
            </span>
          }
        </div>

        <!-- Footer -->
        <div class="card-footer">
          <div class="card-meta">
            <span class="card-ref">{{ property.reference }}</span>
            @if (property.visitCount) {
              <span class="card-visits">
                <i class="pi pi-eye"></i> {{ property.visitCount }}
              </span>
            }
          </div>
          <div class="card-actions">
            <button
              class="action-icon-btn"
              [class.published]="property.isPublished"
              (click)="onTogglePublish()"
              [title]="property.isPublished ? 'Dépublier' : 'Publier'"
            >
              <i class="pi" [class.pi-eye]="!property.isPublished" [class.pi-eye-slash]="property.isPublished"></i>
            </button>
            <button class="action-icon-btn edit" (click)="onEdit()" title="Modifier">
              <i class="pi pi-pencil"></i>
            </button>
            <button class="action-icon-btn delete" (click)="onDelete()" title="Supprimer">
              <i class="pi pi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .property-card {
      background: #fff;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
      transition: box-shadow 0.25s, transform 0.25s;
      cursor: default;
    }
    .property-card:hover {
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      transform: translateY(-3px);
    }

    /* List view */
    .property-card.list-view {
      display: flex; flex-direction: row;
    }
    .list-view .card-photo {
      width: 220px; min-width: 220px; height: 100%;
    }
    .list-view .photo-img { height: 140px; }

    /* Photo */
    .card-photo {
      position: relative; overflow: hidden; cursor: pointer;
    }
    .photo-img {
      width: 100%; height: 200px; object-fit: cover;
      transition: transform 0.4s ease; display: block;
    }
    .property-card:hover .photo-img { transform: scale(1.04); }

    .photo-top-badges {
      position: absolute; top: 10px; left: 10px;
      display: flex; gap: 6px; flex-wrap: wrap;
    }

    .rental-badge {
      font-size: 0.68rem; font-weight: 700;
      background: rgba(139,92,246,0.9); color: #fff;
      padding: 3px 8px; border-radius: 100px;
    }

    .unpublished-overlay {
      position: absolute; inset: 0;
      background: rgba(0,0,0,0.45);
      display: flex; align-items: center; justify-content: center;
      gap: 0.5rem; color: rgba(255,255,255,0.9);
      font-size: 0.85rem; font-weight: 600;
    }

    .photo-hover-actions {
      position: absolute; top: 10px; right: 10px;
      display: flex; gap: 4px;
      opacity: 0; transition: opacity 0.2s;
    }
    .property-card:hover .photo-hover-actions { opacity: 1; }

    .photo-action-btn {
      width: 30px; height: 30px; border-radius: 7px;
      background: rgba(255,255,255,0.9); border: none;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      font-size: 0.78rem; color: #374151; transition: all 0.15s;
    }
    .photo-action-btn:hover { background: #fff; }

    /* Content */
    .card-content { padding: 1rem; }

    .card-top {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 0.5rem;
    }

    .price-block { display: flex; flex-direction: column; }
    .price-main { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.2rem; font-weight: 800; color: #1B4F72; }
    .price-sqm { font-size: 0.72rem; color: #94a3b8; }

    .card-title-link { text-decoration: none; }
    .card-title {
      font-size: 0.875rem; font-weight: 700; color: #1e293b;
      margin: 0 0 0.35rem; line-height: 1.3;
      display: -webkit-box; -webkit-line-clamp: 2;
      -webkit-box-orient: vertical; overflow: hidden;
    }
    .card-title:hover { color: #1B4F72; }

    .card-address {
      font-size: 0.75rem; color: #64748b;
      display: flex; align-items: center; gap: 4px; margin-bottom: 0.75rem;
    }
    .card-address i { font-size: 0.7rem; color: #94a3b8; }

    /* Features */
    .features-row {
      display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 0.875rem;
    }

    .feature-chip {
      display: flex; align-items: center; gap: 4px;
      background: #f8fafc; border: 1px solid #e2e8f0;
      padding: 2px 8px; border-radius: 100px;
      font-size: 0.72rem; color: #475569; font-weight: 500;
    }
    .feature-chip i { font-size: 0.65rem; color: #94a3b8; }

    /* Footer */
    .card-footer {
      display: flex; justify-content: space-between; align-items: center;
      padding-top: 0.75rem; border-top: 1px solid #f1f5f9;
    }

    .card-meta { display: flex; align-items: center; gap: 0.75rem; }
    .card-ref { font-size: 0.7rem; color: #94a3b8; font-family: monospace; }
    .card-visits { font-size: 0.7rem; color: #94a3b8; display: flex; align-items: center; gap: 3px; }

    .card-actions { display: flex; gap: 4px; }

    .action-icon-btn {
      width: 28px; height: 28px; border-radius: 6px;
      border: 1.5px solid #e2e8f0; background: #fff;
      cursor: pointer; display: flex; align-items: center;
      justify-content: center; font-size: 0.75rem;
      color: #64748b; transition: all 0.15s;
    }
    .action-icon-btn:hover { border-color: #cbd5e1; background: #f8fafc; color: #1B4F72; }
    .action-icon-btn.published { color: #10b981; border-color: rgba(16,185,129,0.3); }
    .action-icon-btn.edit:hover { color: #1B4F72; border-color: #1B4F72; }
    .action-icon-btn.delete:hover { color: #ef4444; border-color: #ef4444; background: #fef2f2; }
  `]
})
export class PropertyCardComponent {
  @Input() property!: Property;
  @Input() viewMode: 'grid' | 'list' = 'grid';
  @Output() edit = new EventEmitter<Property>();
  @Output() delete = new EventEmitter<Property>();
  @Output() togglePublish = new EventEmitter<Property>();

  readonly TransactionType = TransactionType;

  get isRental(): boolean {
    return this.property.transactionType === TransactionType.RENTAL;
  }

  getTypeLabel(type: string): string {
    return PROPERTY_TYPE_LABELS[type as keyof typeof PROPERTY_TYPE_LABELS] || type;
  }

  onEdit(): void { this.edit.emit(this.property); }
  onDelete(): void { this.delete.emit(this.property); }
  onTogglePublish(): void { this.togglePublish.emit(this.property); }
}
