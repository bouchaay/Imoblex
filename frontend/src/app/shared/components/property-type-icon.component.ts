import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyType, PROPERTY_TYPE_LABELS } from '../../core/models/enums';

@Component({
  selector: 'app-property-type-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './property-type-icon.component.html',
  styleUrls: ['./property-type-icon.component.scss']
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
      LAND: 'pi-map',
      COMMERCIAL: 'pi-shop',
      OFFICE: 'pi-briefcase',
      WAREHOUSE: 'pi-box',
      GARAGE: 'pi-car',
      PARKING: 'pi-car',
      NEW_PROGRAM: 'pi-star',
      OTHER: 'pi-ellipsis-h'
    };
    return icons[this.type] || 'pi-building';
  }

  getLabel(): string {
    return PROPERTY_TYPE_LABELS[this.type as PropertyType] || this.type;
  }
}
