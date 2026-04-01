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
  templateUrl: './property-card.component.html',
  styleUrls: ['./property-card.component.scss']
})
export class PropertyCardComponent {
  @Input() property!: Property;
  @Input() viewMode: 'grid' | 'list' = 'grid';
  @Output() edit = new EventEmitter<Property>();
  @Output() delete = new EventEmitter<Property>();
  @Output() togglePublish = new EventEmitter<Property>();
  @Output() createMandate = new EventEmitter<Property>();

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
  onCreateMandate(): void { this.createMandate.emit(this.property); }
}
