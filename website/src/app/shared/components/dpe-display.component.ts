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
  templateUrl: './dpe-display.component.html',
  styleUrls: ['./dpe-display.component.scss']
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
