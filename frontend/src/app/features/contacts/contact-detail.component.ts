import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ContactService } from '../../core/services/contact.service';
import { PropertyService } from '../../core/services/property.service';
import { MandateService } from '../../core/services/mandate.service';
import { RentalService } from '../../core/services/rental.service';
import { Contact } from '../../core/models/contact.model';
import { Property } from '../../core/models/property.model';
import { Mandate } from '../../core/models/mandate.model';
import { RentalLease } from '../../core/models/rental.model';
import { CONTACT_TYPE_LABELS, ContactType, TransactionType } from '../../core/models/enums';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { EntityDocumentsComponent } from '../../shared/components/entity-documents/entity-documents.component';

@Component({
  selector: 'app-contact-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, EntityDocumentsComponent],
  templateUrl: './contact-detail.component.html',
  styleUrls: ['./contact-detail.component.scss']
})
export class ContactDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly contactService = inject(ContactService);
  private readonly propertyService = inject(PropertyService);
  private readonly mandateService = inject(MandateService);
  private readonly rentalService = inject(RentalService);

  contact = signal<Contact | null>(null);
  relatedProperties = signal<Property[]>([]);
  relatedMandates = signal<Mandate[]>([]);
  relatedLeases = signal<RentalLease[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;

    this.contactService.getById(id).subscribe({
      next: (contact) => {
        this.contact.set(contact);
        const isTenant = contact.type === ContactType.TENANT;
        const isLandlord = contact.type === ContactType.LANDLORD;

        if (isTenant) {
          forkJoin({
            leases: this.rentalService.getLeasesByTenant(contact.id).pipe(catchError(() => of([])))
          }).subscribe(({ leases }) => {
            this.relatedLeases.set(leases);
            this.isLoading.set(false);
          });
        } else if (isLandlord) {
          forkJoin({
            leases: this.rentalService.getLeasesByTenant(contact.id).pipe(catchError(() => of([]))),
            properties: this.propertyService.getAll({ page: 0, pageSize: 100 }).pipe(
              map(r => r.items.filter(p => p.ownerId === contact.id)),
              catchError(() => of([]))
            )
          }).subscribe(({ leases, properties }) => {
            this.relatedLeases.set(leases);
            this.relatedProperties.set(properties);
            this.isLoading.set(false);
          });
        } else {
          forkJoin({
            properties: this.propertyService.getAll({ page: 0, pageSize: 100 }).pipe(
              map(r => r.items.filter(p => p.ownerId === contact.id)),
              catchError(() => of([]))
            ),
            mandates: this.mandateService.getAll().pipe(
              map(list => list.filter(m => m.mandatorId === contact.id)),
              catchError(() => of([]))
            )
          }).subscribe(({ properties, mandates }) => {
            this.relatedProperties.set(properties);
            this.relatedMandates.set(mandates);
            this.isLoading.set(false);
          });
        }
      },
      error: () => this.isLoading.set(false)
    });
  }

  getTypeLabel(type: ContactType): string { return CONTACT_TYPE_LABELS[type] || type; }

  getAvatarColor(): string {
    const colors = ['#1B4F72', '#2E86C1', '#F39C12', '#27AE60', '#8E44AD', '#E74C3C'];
    const c = this.contact();
    if (!c) return colors[0];
    return colors[(c.firstName.charCodeAt(0) + c.lastName.charCodeAt(0)) % colors.length];
  }

  getMandateTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      SIMPLE: 'Simple', EXCLUSIVE: 'Exclusif', SEMI_EXCLUSIVE: 'Semi-exclusif', CO_EXCLUSIVE: 'Co-exclusif'
    };
    return labels[type] || type;
  }

  getMandateStatusColor(status: string): string {
    const colors: Record<string, string> = {
      ACTIVE: '#22c55e', EXPIRED: '#ef4444', TERMINATED: '#94a3b8',
      SUSPENDED: '#f59e0b', COMPLETED: '#3b82f6'
    };
    return colors[status] || '#94a3b8';
  }

  isRental(t: TransactionType): boolean { return t === TransactionType.RENTAL || t === TransactionType.SEASONAL_RENTAL; }

  isTenant(): boolean {
    return this.contact()?.type === ContactType.TENANT;
  }

  isLandlord(): boolean {
    return this.contact()?.type === ContactType.LANDLORD;
  }

  getLeaseStatusLabel(s: string): string {
    const labels: Record<string, string> = {
      ACTIVE: 'Actif', PENDING: 'En attente', TERMINATED: 'Résilié',
      SUSPENDED: 'Suspendu', UNPAID: 'Impayé'
    };
    return labels[s] || s;
  }

  getLeaseStatusClass(s: string): string {
    const cls: Record<string, string> = {
      ACTIVE: 'lease-active', PENDING: 'lease-pending',
      TERMINATED: 'lease-terminated', SUSPENDED: 'lease-suspended', UNPAID: 'lease-unpaid'
    };
    return cls[s] || '';
  }

  getLeaseTypeLabel(t: string): string {
    const labels: Record<string, string> = {
      UNFURNISHED: 'Non meublé', FURNISHED: 'Meublé', SEASONAL: 'Saisonnier', OTHER: 'Autre'
    };
    return labels[t] || t;
  }

  edit(): void { this.router.navigate(['/contacts', this.contact()!.id, 'edit']); }
}
