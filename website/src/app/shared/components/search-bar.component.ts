import { Component, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PropertyService } from '../services/property.service';
import { TransactionType, PropertyType } from '../models/property.model';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-bar w-full max-w-4xl mx-auto">
      <!-- Tabs -->
      <div class="flex border-b border-gray-100">
        <button
          class="search-tab flex-1 text-center"
          [class.active]="activeTab() === 'sale'"
          (click)="setTab('sale')">
          <svg class="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          Acheter
        </button>
        <button
          class="search-tab flex-1 text-center"
          [class.active]="activeTab() === 'rent'"
          (click)="setTab('rent')">
          <svg class="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
          Louer
        </button>
      </div>

      <!-- Filters row -->
      <div class="flex flex-col sm:flex-row gap-0 p-2">
        <!-- City -->
        <div class="flex-1 px-3 py-3 border-r border-gray-100">
          <label class="block text-xs text-gray-400 font-medium mb-1">Ville</label>
          <input
            type="text"
            [(ngModel)]="searchCity"
            placeholder="Toulouse, Blagnac, Colomiers..."
            class="w-full text-sm text-gray-700 outline-none placeholder-gray-400 bg-transparent">
        </div>

        <!-- Type -->
        <div class="flex-1 px-3 py-3 border-r border-gray-100">
          <label class="block text-xs text-gray-400 font-medium mb-1">Type de bien</label>
          <select [(ngModel)]="selectedType" class="w-full text-sm text-gray-700 outline-none bg-transparent">
            <option value="">Tous les biens</option>
            @for (type of propertyTypes; track type.value) {
              <option [value]="type.value">{{ type.label }}</option>
            }
          </select>
        </div>

        <!-- Budget -->
        <div class="flex-1 px-3 py-3">
          <label class="block text-xs text-gray-400 font-medium mb-1">Budget max</label>
          <select [(ngModel)]="maxBudget" class="w-full text-sm text-gray-700 outline-none bg-transparent">
            <option value="">Sans limite</option>
            @for (budget of budgetOptions; track budget.value) {
              <option [value]="budget.value">{{ budget.label }}</option>
            }
          </select>
        </div>

        <!-- Search button -->
        <div class="p-2">
          <button
            (click)="onSearch()"
            class="h-full btn-primary rounded-xl px-8 whitespace-nowrap text-sm">
            <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            Rechercher
          </button>
        </div>
      </div>
    </div>
  `
})
export class SearchBarComponent {
  private readonly router = inject(Router);
  private readonly propertyService = inject(PropertyService);

  @Output() searchSubmitted = new EventEmitter<void>();

  activeTab = signal<TransactionType>('sale');
  searchCity = '';
  selectedType = '';
  maxBudget = '';

  propertyTypes = this.propertyService.getPropertyTypes();

  saleBudgets = [
    { value: '100000', label: '100 000 €' },
    { value: '200000', label: '200 000 €' },
    { value: '300000', label: '300 000 €' },
    { value: '400000', label: '400 000 €' },
    { value: '500000', label: '500 000 €' },
    { value: '750000', label: '750 000 €' },
    { value: '1000000', label: '1 000 000 €' },
  ];

  rentBudgets = [
    { value: '500', label: '500 €/mois' },
    { value: '800', label: '800 €/mois' },
    { value: '1200', label: '1 200 €/mois' },
    { value: '1800', label: '1 800 €/mois' },
    { value: '2500', label: '2 500 €/mois' },
    { value: '4000', label: '4 000 €/mois' },
  ];

  get budgetOptions() {
    return this.activeTab() === 'sale' ? this.saleBudgets : this.rentBudgets;
  }

  setTab(tab: TransactionType): void {
    this.activeTab.set(tab);
    this.maxBudget = '';
  }

  onSearch(): void {
    const path = this.activeTab() === 'sale' ? '/vente' : '/location';
    const queryParams: Record<string, string> = {};
    if (this.searchCity) queryParams['city'] = this.searchCity;
    if (this.selectedType) queryParams['type'] = this.selectedType;
    if (this.maxBudget) queryParams['maxPrice'] = this.maxBudget;
    this.router.navigate([path], { queryParams });
    this.searchSubmitted.emit();
  }
}
