import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'priceFormatter',
  standalone: true
})
export class PriceFormatterPipe implements PipeTransform {
  transform(value: number | undefined | null, currency = '€', isRental = false): string {
    if (value === undefined || value === null) return '—';
    const formatted = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
    if (isRental) return `${formatted} ${currency}/mois`;
    return `${formatted} ${currency}`;
  }
}
