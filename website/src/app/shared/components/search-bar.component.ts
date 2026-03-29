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
  templateUrl: './search-bar.component.html'
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
