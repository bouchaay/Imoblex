import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DpeClass, DPE_COLORS } from '../../core/models/enums';

@Component({
  selector: 'app-dpe-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dpe-badge.component.html',
  styleUrls: ['./dpe-badge.component.scss']
})
export class DpeBadgeComponent {
  @Input() dpe!: DpeClass | string;

  getColor(): string {
    return DPE_COLORS[this.dpe as DpeClass] || '#9ca3af';
  }
}
