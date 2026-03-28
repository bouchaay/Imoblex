import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DpeClass } from '../models/property.model';

interface DpeLevel {
  class: DpeClass;
  color: string;
  max: number;
  label: string;
}

@Component({
  selector: 'app-dpe-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dpe-display">
      <h4 class="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">{{ title }}</h4>
      <div class="space-y-1.5">
        @for (level of levels; track level.class) {
          <div class="flex items-center gap-2">
            <div
              class="dpe-bar flex-shrink-0 transition-all duration-300"
              [ngClass]="'dpe-' + level.class"
              [style.width]="getBarWidth(level)"
              [class.ring-2]="activeClass === level.class"
              [class.ring-offset-2]="activeClass === level.class"
              [class.ring-gray-400]="activeClass === level.class"
              [class.scale-105]="activeClass === level.class">
              {{ level.class }}
            </div>
            <span class="text-xs text-gray-500">{{ level.label }}</span>
            @if (activeClass === level.class && value) {
              <span class="text-xs font-bold text-gray-700">{{ value }} {{ unit }}</span>
            }
          </div>
        }
      </div>
      @if (activeClass) {
        <div class="mt-3 flex items-center gap-2">
          <div class="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold" [ngClass]="'dpe-' + activeClass">
            {{ activeClass }}
          </div>
          <span class="text-sm text-gray-600">Classe {{ activeClass }}{{ value ? ' – ' + value + ' ' + unit : '' }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .dpe-bar {
      min-width: 32px;
      height: 24px;
      border-radius: 0 4px 4px 0;
      display: flex;
      align-items: center;
      padding: 0 8px;
      font-size: 12px;
      font-weight: 700;
      color: white;
    }
    .dpe-D { color: #333; }
  `]
})
export class DpeDisplayComponent {
  @Input() activeClass?: DpeClass;
  @Input() value?: number;
  @Input() unit = 'kWh/m²/an';
  @Input() title = 'DPE';

  levels: DpeLevel[] = [
    { class: 'A', color: '#00A651', max: 50, label: '≤ 50' },
    { class: 'B', color: '#57B944', max: 90, label: '51 – 90' },
    { class: 'C', color: '#9DCE44', max: 150, label: '91 – 150' },
    { class: 'D', color: '#FFEC00', max: 230, label: '151 – 230' },
    { class: 'E', color: '#F7941D', max: 330, label: '231 – 330' },
    { class: 'F', color: '#F15A29', max: 450, label: '331 – 450' },
    { class: 'G', color: '#ED1C24', max: 999, label: '> 450' },
  ];

  getBarWidth(level: DpeLevel): string {
    const widths: Record<DpeClass, string> = {
      'A': '40%',
      'B': '50%',
      'C': '60%',
      'D': '70%',
      'E': '80%',
      'F': '90%',
      'G': '100%',
    };
    return widths[level.class];
  }
}
