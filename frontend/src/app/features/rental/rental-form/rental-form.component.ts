import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RentalService } from '../../../core/services/rental.service';
import { ContactService } from '../../../core/services/contact.service';
import { PropertyService } from '../../../core/services/property.service';
import { RentalLeaseRequest, LeaseType, LeaseStatus, PaymentMethod } from '../../../core/models/rental.model';
import { Contact } from '../../../core/models/contact.model';
import { Property } from '../../../core/models/property.model';
import { ContactType } from '../../../core/models/enums';

@Component({
  selector: 'app-rental-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './rental-form.component.html',
  styleUrls: ['./rental-form.component.scss']
})
export class RentalFormComponent implements OnInit {
  private readonly rentalService = inject(RentalService);
  private readonly contactService = inject(ContactService);
  private readonly propertyService = inject(PropertyService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  isEditMode = signal(false);
  editId = signal<string | null>(null);
  loading = signal(true);
  saving = signal(false);
  error = signal('');

  // Dropdown data
  tenants = signal<Contact[]>([]);
  landlords = signal<Contact[]>([]);
  properties = signal<Property[]>([]);
  loadingContacts = signal(true);
  loadingProperties = signal(true);

  form: RentalLeaseRequest = {
    propertyId: '',
    tenantId: '',
    landlordId: '',
    agentId: '',
    leaseType: 'UNFURNISHED',
    status: 'ACTIVE',
    startDate: '',
    endDate: '',
    rentAmount: 0,
    chargesAmount: 0,
    depositAmount: 0,
    paymentDayOfMonth: 1,
    paymentMethod: 'TRANSFER',
    renewalDate: '',
    notes: ''
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.editId.set(id);
      this.loadExistingLease(id);
    } else {
      this.loading.set(false);
    }
    this.loadDropdowns();
  }

  private loadExistingLease(id: string): void {
    this.rentalService.getLeaseById(id).subscribe({
      next: (lease) => {
        this.form = {
          propertyId: lease.propertyId,
          tenantId: lease.tenantId,
          landlordId: lease.landlordId || '',
          agentId: lease.agentId || '',
          leaseType: lease.leaseType,
          status: lease.status,
          startDate: lease.startDate,
          endDate: lease.endDate || '',
          rentAmount: lease.rentAmount,
          chargesAmount: lease.chargesAmount,
          depositAmount: lease.depositAmount,
          paymentDayOfMonth: lease.paymentDayOfMonth,
          paymentMethod: lease.paymentMethod,
          renewalDate: lease.renewalDate || '',
          notes: lease.notes || ''
        };
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger le bail.');
        this.loading.set(false);
      }
    });
  }

  private loadDropdowns(): void {
    // Load tenants and landlords
    this.contactService.getAll({ pageSize: 200 }).subscribe({
      next: ({ items }) => {
        this.tenants.set(items.filter(c =>
          c.type === ContactType.TENANT ||
          (c.types && c.types.includes(ContactType.TENANT))
        ));
        this.landlords.set(items.filter(c =>
          c.type === ContactType.LANDLORD ||
          (c.types && c.types.includes(ContactType.LANDLORD)) ||
          c.type === ContactType.SELLER
        ));
        this.loadingContacts.set(false);
      },
      error: () => this.loadingContacts.set(false)
    });

    // Load rental properties
    this.propertyService.getAll({ pageSize: 200 }).subscribe({
      next: ({ items }) => {
        this.properties.set(items.filter(p =>
          p.status === 'AVAILABLE' || p.status === 'RENTED' ||
          (this.isEditMode() && p.id === this.form.propertyId)
        ));
        this.loadingProperties.set(false);
      },
      error: () => this.loadingProperties.set(false)
    });
  }

  get totalRent(): number {
    return (this.form.rentAmount || 0) + (this.form.chargesAmount || 0);
  }

  save(): void {
    if (this.saving()) return;

    if (!this.form.propertyId || !this.form.tenantId || !this.form.startDate || !this.form.rentAmount) {
      this.error.set('Veuillez remplir tous les champs obligatoires : bien, locataire, date de début et loyer.');
      return;
    }

    this.saving.set(true);
    this.error.set('');

    // Clean up empty optional fields
    const req: RentalLeaseRequest = {
      ...this.form,
      landlordId: this.form.landlordId || undefined,
      agentId: this.form.agentId || undefined,
      endDate: this.form.endDate || undefined,
      renewalDate: this.form.renewalDate || undefined,
      notes: this.form.notes || undefined
    };

    const obs = this.isEditMode() && this.editId()
      ? this.rentalService.updateLease(this.editId()!, req)
      : this.rentalService.createLease(req);

    obs.subscribe({
      next: (lease) => {
        this.saving.set(false);
        this.router.navigate(['/rental', lease.id]);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(
          err?.error?.message || 'Une erreur est survenue. Vérifiez les données saisies.'
        );
      }
    });
  }

  cancel(): void {
    if (this.isEditMode() && this.editId()) {
      this.router.navigate(['/rental', this.editId()]);
    } else {
      this.router.navigate(['/rental']);
    }
  }

  getPropertyLabel(p: Property): string {
    const addr = p.address?.street ? `${p.address.street}, ${p.address.city}` : p.address?.city || '';
    return `${p.reference} — ${addr}`;
  }

  getContactFullName(c: Contact): string {
    return `${c.firstName} ${c.lastName}`.trim();
  }
}
