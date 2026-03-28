import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyType, PROPERTY_TYPE_LABELS } from '../../core/models/enums';

@Component({
  selector: 'app-property-type-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="type-icon" [title]="getLabel()">
      <i class="pi {{ getIcon() }}"></i>
      @if (showLabel) { <span>{{ getLabel() }}</span> }
    </span>
  `,
  styles: [`
    .type-icon {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      color: #64748b;
      font-size: 0.8rem;
    }
  `]
})
export class PropertyTypeIconComponent {
  @Input() type!: PropertyType | string;
  @Input() showLabel = false;

  getIcon(): string {
    const icons: Record<string, string> = {
      APARTMENT: 'pi-building',
      HOUSE: 'pi-home',
      VILLA: 'pi-sun',
      STUDIO: 'pi-inbox',
      LOFT: 'pi-box',
      DUPLEX: 'pi-copy',
      LAND: 'pi-map',
      COMMERCIAL: 'pi-shop',
      OFFICE: 'pi-briefcase',
      GARAGE: 'pi-car',
      PARKING: 'pi-car'
    };
    return icons[this.type] || 'pi-building';
  }

  getLabel(): string {
    return PROPERTY_TYPE_LABELS[this.type as PropertyType] || this.type;
  }
}
