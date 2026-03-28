import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="breadcrumb" aria-label="Fil d'Ariane">
      @for (item of items; track item.label; let last = $last) {
        @if (!last && item.path) {
          <a [routerLink]="item.path">{{ item.label }}</a>
          <span class="separator">›</span>
        } @else {
          <span class="current">{{ item.label }}</span>
        }
      }
    </nav>
  `
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
}
