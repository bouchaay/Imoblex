import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportingService } from '../../core/services/reporting.service';
import { PriceFormatterPipe } from '../../shared/pipes/price-formatter.pipe';

@Component({
  selector: 'app-reporting',
  standalone: true,
  imports: [CommonModule, PriceFormatterPipe],
  templateUrl: './reporting.component.html',
  styleUrls: ['./reporting.component.scss']
})
export class ReportingComponent {
  kpis = [
    { icon: 'pi-euro', label: 'CA ce mois', value: '68 400 €', color: '#10b981', trend: '+8%', up: true },
    { icon: 'pi-chart-line', label: 'Transactions', value: '4', color: '#1B4F72', trend: '+2', up: true },
    { icon: 'pi-users', label: 'Nouveaux contacts', value: '12', color: '#F39C12', trend: '+5', up: true },
    { icon: 'pi-building', label: 'Biens en stock', value: '48', color: '#8b5cf6', trend: '-3', up: false }
  ];

  monthlyRevenue = [
    { label: 'J', amount: 38000 }, { label: 'F', amount: 42000 }, { label: 'M', amount: 55000 },
    { label: 'A', amount: 48000 }, { label: 'M', amount: 62000 }, { label: 'J', amount: 71000 },
    { label: 'J', amount: 45000 }, { label: 'A', amount: 38000 }, { label: 'S', amount: 59000 },
    { label: 'O', amount: 67000 }, { label: 'N', amount: 52000 }, { label: 'D', amount: 65000 }
  ];

  get maxRevenue(): number { return Math.max(...this.monthlyRevenue.map(m => m.amount)); }

  propertyTypeData = [
    { label: 'Appartements', count: 18, color: '#1B4F72' },
    { label: 'Maisons', count: 12, color: '#2E86C1' },
    { label: 'Villas', count: 6, color: '#F39C12' },
    { label: 'Studios', count: 5, color: '#27AE60' },
    { label: 'Lofts', count: 4, color: '#8E44AD' },
    { label: 'Autres', count: 3, color: '#E74C3C' }
  ];

  contactTypeData = [
    { label: 'Acheteurs', count: 22, color: '#1B4F72' },
    { label: 'Vendeurs', count: 15, color: '#F39C12' },
    { label: 'Locataires', count: 10, color: '#8b5cf6' },
    { label: 'Propriétaires', count: 8, color: '#10b981' },
    { label: 'Prospects', count: 5, color: '#64748b' }
  ];

  agentPerformance = [
    { name: 'Sophie Moreau', initials: 'SM', color: '#1B4F72', transactions: 6, revenue: 72000 },
    { name: 'Pierre Laurent', initials: 'PL', color: '#F39C12', transactions: 4, revenue: 48000 },
    { name: 'Julie Bernard', initials: 'JB', color: '#10b981', transactions: 3, revenue: 36000 },
    { name: 'Thomas Martin', initials: 'TM', color: '#8b5cf6', transactions: 2, revenue: 24000 }
  ];
}
