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
  templateUrl: './property-detail.component.html',
  styleUrls: ['./property-detail.component.scss']
})
export class PropertyDetailComponent implements OnInit {
  @Input() id!: string;
  private readonly route = inject(ActivatedRoute);
  private readonly propertyService = inject(PropertyService);
  readonly TransactionType = TransactionType;

  property = signal<Property | null>(null);
  activePhotoIndex = signal(0);
  lightboxOpen = signal(false);

  ngOnInit(): void {
    const id = this.id || this.route.snapshot.paramMap.get('id')!;
    this.propertyService.getById(id).subscribe(p => this.property.set(p));
  }

  getTypeLabel(type: string): string {
    return PROPERTY_TYPE_LABELS[type as keyof typeof PROPERTY_TYPE_LABELS] || type;
  }
}
