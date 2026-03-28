import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface DashboardStats {
  totalProperties: number;
  availableProperties: number;
  propertiesUnderOffer: number;
  totalMandates: number;
  activeMandates: number;
  expiringMandates: number;
  totalTransactions: number;
  transactionsInProgress: number;
  completedThisMonth: number;
  revenueThisMonth: number;
  revenueThisYear: number;
  totalContacts: number;
  newContactsThisMonth: number;
  upcomingAppointments: number;
  conversionRate: number;
}

export interface ChartData {
  labels: string[];
  datasets: { label: string; data: number[]; backgroundColor?: string | string[]; borderColor?: string; tension?: number }[];
}

@Injectable({ providedIn: 'root' })
export class ReportingService {

  getDashboardStats(): Observable<DashboardStats> {
    return of({
      totalProperties: 48,
      availableProperties: 24,
      propertiesUnderOffer: 8,
      totalMandates: 20,
      activeMandates: 14,
      expiringMandates: 3,
      totalTransactions: 15,
      transactionsInProgress: 9,
      completedThisMonth: 4,
      revenueThisMonth: 68400,
      revenueThisYear: 542000,
      totalContacts: 60,
      newContactsThisMonth: 12,
      upcomingAppointments: 8,
      conversionRate: 23.5
    }).pipe(delay(300));
  }

  getPropertiesByTypeChart(): Observable<ChartData> {
    return of({
      labels: ['Appartements', 'Maisons', 'Villas', 'Studios', 'Lofts', 'Terrains'],
      datasets: [{
        label: 'Nombre de biens',
        data: [18, 12, 6, 5, 4, 3],
        backgroundColor: [
          '#1B4F72', '#2E86C1', '#5DADE2', '#85C1E9', '#AED6F1', '#D6EAF8'
        ]
      }]
    }).pipe(delay(200));
  }

  getTransactionsPipelineChart(): Observable<ChartData> {
    return of({
      labels: ['Visite', 'Offre', 'Négociation', 'Compromis', 'Financement', 'Acte'],
      datasets: [{
        label: 'Transactions',
        data: [8, 5, 4, 3, 2, 1],
        backgroundColor: '#1B4F72',
        borderColor: '#1B4F72'
      }]
    }).pipe(delay(200));
  }

  getRevenueChart(): Observable<ChartData> {
    return of({
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
      datasets: [
        {
          label: 'Commissions (€)',
          data: [38000, 42000, 55000, 48000, 62000, 71000, 45000, 38000, 59000, 67000, 52000, 65000],
          borderColor: '#1B4F72',
          backgroundColor: 'rgba(27,79,114,0.1)',
          tension: 0.4
        },
        {
          label: 'Objectif (€)',
          data: [50000, 50000, 50000, 50000, 50000, 50000, 50000, 50000, 50000, 50000, 50000, 50000],
          borderColor: '#F39C12',
          backgroundColor: 'rgba(243,156,18,0.05)',
          tension: 0
        }
      ]
    }).pipe(delay(200));
  }

  getContactsByTypeChart(): Observable<ChartData> {
    return of({
      labels: ['Acheteurs', 'Vendeurs', 'Locataires', 'Propriétaires', 'Prospects'],
      datasets: [{
        label: 'Contacts',
        data: [22, 15, 10, 8, 5],
        backgroundColor: ['#1B4F72', '#2E86C1', '#F39C12', '#27AE60', '#8E44AD']
      }]
    }).pipe(delay(200));
  }
}
