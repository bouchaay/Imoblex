import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MandateService } from '../../core/services/mandate.service';
import { Mandate } from '../../core/models/mandate.model';
import { MANDATE_TYPE_LABELS, MandateStatus } from '../../core/models/enums';

@Component({
  selector: 'app-mandate-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mandate-detail.component.html',
  styleUrls: ['./mandate-detail.component.scss']
})
export class MandateDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly mandateService = inject(MandateService);

  mandate = signal<Mandate | null>(null);
  isLoading = signal(true);
  notFound = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.mandateService.getById(id).subscribe({
      next: m => { this.mandate.set(m); this.isLoading.set(false); },
      error: () => { this.notFound.set(true); this.isLoading.set(false); }
    });
  }

  edit(): void { this.router.navigate(['/mandates', this.mandate()!.id, 'edit']); }

  getMandateTypeLabel(type: string): string {
    return MANDATE_TYPE_LABELS[type as keyof typeof MANDATE_TYPE_LABELS] || type;
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      ACTIVE: '#22c55e', EXPIRED: '#ef4444', TERMINATED: '#94a3b8',
      SUSPENDED: '#f59e0b', COMPLETED: '#3b82f6'
    };
    return map[status] || '#94a3b8';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      ACTIVE: 'Actif', EXPIRED: 'Expiré', TERMINATED: 'Résilié',
      SUSPENDED: 'Suspendu', COMPLETED: 'Terminé'
    };
    return map[status] || status;
  }

  getTransactionLabel(t: string): string {
    const map: Record<string, string> = {
      SALE: 'Vente', RENTAL: 'Location', SEASONAL_RENTAL: 'Location saisonnière', VIAGER: 'Viager'
    };
    return map[t] || t;
  }
}
