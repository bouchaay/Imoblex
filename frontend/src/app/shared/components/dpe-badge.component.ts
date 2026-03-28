import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DpeClass, DPE_COLORS } from '../../core/models/enums';

@Component({
  selector: 'app-dpe-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="dpe-badge" [style.background]="getColor()" [style.color]="'#fff'" [title]="'DPE classe ' + dpe">
      {{ dpe }}
    </span>
  `,
  styles: [`
    .dpe-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 800;
      letter-spacing: 0;
    }
  `]
})
export class DpeBadgeComponent {
  @Input() dpe!: DpeClass | string;

  getColor(): string {
    return DPE_COLORS[this.dpe as DpeClass] || '#9ca3af';
  }
}
