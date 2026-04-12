import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MandateService } from '../../core/services/mandate.service';
import { PropertyService } from '../../core/services/property.service';
import { ContactService } from '../../core/services/contact.service';
import { AuthService } from '../../core/services/auth.service';
import { MandateCategory, MandateType, MandateStatus } from '../../core/models/enums';
import { Property } from '../../core/models/property.model';
import { Contact } from '../../core/models/contact.model';

@Component({
  selector: 'app-mandate-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './mandate-form.component.html',
  styleUrls: ['./mandate-form.component.scss']
})
export class MandateFormComponent implements OnInit {
  private readonly mandateService = inject(MandateService);
  private readonly propertyService = inject(PropertyService);
  private readonly contactService = inject(ContactService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // État
  loading = signal(false);
  loadingData = signal(true);
  isSaving = signal(false);
  errorMessage = signal('');
  editId = signal<string | null>(null);

  // Données pour les dropdowns
  properties = signal<Property[]>([]);
  contacts = signal<Contact[]>([]);

  // Recherche dans les dropdowns
  propertySearch = signal('');
  contactSearch = signal('');
  showPropertyDropdown = signal(false);
  showContactDropdown = signal(false);

  // Bien et contact sélectionnés (pour l'affichage)
  selectedProperty = signal<Property | null>(null);
  selectedContact = signal<Contact | null>(null);

  // Options catégorie
  categoryOptions = [
    { value: MandateCategory.GERANCE, label: 'Gérance', desc: 'Mandat de gestion locative' },
    { value: MandateCategory.VENTE,   label: 'Vente',   desc: 'Mandat de vente immobilière' }
  ];

  // Formulaire
  formData = {
    category: MandateCategory.GERANCE as MandateCategory,
    type: '' as MandateType | '',
    status: MandateStatus.ACTIVE as MandateStatus,
    propertyId: '',
    mandatorId: '',
    price: 0,
    feeType: 'percent' as 'percent' | 'amount' | 'text',
    agencyFeesPercentInput: 5,
    agencyFeesAmountInput: null as number | null,
    agencyFeesTextInput: '',
    agencyFeesPercent: 5,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    maxDurationYears: 3,
    renewalDate: '',
    signedAtPlace: '',
    notes: ''
  };

  // Options
  typeOptions = [
    { value: MandateType.SIMPLE,        label: 'Simple',       desc: 'Le propriétaire peut mandater plusieurs agences' },
    { value: MandateType.EXCLUSIVE,     label: 'Exclusif',     desc: 'Mandat exclusif confié à votre agence' },
    { value: MandateType.SEMI_EXCLUSIVE,label: 'Semi-exclusif',desc: 'Agence exclusive + vente en direct autorisée' },
    { value: MandateType.CO_EXCLUSIVE,  label: 'Co-exclusif',  desc: 'Exclusivité partagée entre plusieurs agences' }
  ];

  statusOptions = [
    { value: MandateStatus.ACTIVE,    label: 'Actif',    color: '#10b981' },
    { value: MandateStatus.EXPIRED,   label: 'Expiré',   color: '#ef4444' },
    { value: MandateStatus.CANCELLED, label: 'Annulé',   color: '#6b7280' },
    { value: MandateStatus.COMPLETED, label: 'Terminé',  color: '#3b82f6' }
  ];

  // Biens filtrés
  filteredProperties = computed(() => {
    const q = this.propertySearch().toLowerCase();
    if (!q) return this.properties().slice(0, 10);
    return this.properties().filter(p =>
      p.title?.toLowerCase().includes(q) ||
      p.address?.street?.toLowerCase().includes(q) ||
      p.address?.city?.toLowerCase().includes(q) ||
      p.reference?.toLowerCase().includes(q)
    ).slice(0, 10);
  });

  // Contacts filtrés
  filteredContacts = computed(() => {
    const q = this.contactSearch().toLowerCase();
    if (!q) return this.contacts().slice(0, 10);
    return this.contacts().filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q)
    ).slice(0, 10);
  });

  isEdit = computed(() => !!this.editId());

  isValid(): boolean {
    return !!(
      this.formData.type &&
      this.formData.price > 0 &&
      this.formData.startDate &&
      this.formData.endDate
    );
  }

  ngOnInit(): void {
    // Charger biens et contacts en parallèle
    this.propertyService.getAll({ page: 0, pageSize: 200 }).subscribe(page => {
      this.properties.set(page.items);
    });
    this.contactService.getAll({ pageSize: 200 }).subscribe(result => {
      this.contacts.set(result.items);
    });

    // Pré-remplissage depuis query params (ex : depuis une carte bien)
    const qp = this.route.snapshot.queryParamMap;
    const qPropertyId = qp.get('propertyId');
    const qPropertyLabel = qp.get('propertyLabel');
    const qPrice = qp.get('price');
    const qMandatorId = qp.get('mandatorId');
    const qMandatorLabel = qp.get('mandatorLabel');

    if (qPropertyId) {
      this.formData.propertyId = qPropertyId;
      this.propertySearch.set(qPropertyLabel || qPropertyId);
    }
    if (qPrice) {
      this.formData.price = +qPrice;
    }
    if (qMandatorId) {
      this.formData.mandatorId = qMandatorId;
      this.contactSearch.set(qMandatorLabel || qMandatorId);
    }

    // Mode édition ?
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(id);
      this.mandateService.getById(id).subscribe({
        next: m => {
          const feeType = m.agencyFeesText ? 'text' : m.agencyFeeAmount ? 'amount' : 'percent';
          this.formData = {
            category: m.category || MandateCategory.GERANCE,
            type: m.type,
            status: m.status,
            propertyId: m.propertyId,
            mandatorId: m.mandatorId,
            price: m.price,
            feeType: feeType as 'percent' | 'amount' | 'text',
            agencyFeesPercentInput: m.agencyFeePercent || 5,
            agencyFeesAmountInput: m.agencyFeeAmount || null,
            agencyFeesTextInput: m.agencyFeesText || '',
            agencyFeesPercent: m.agencyFeePercent,
            startDate: m.startDate instanceof Date
              ? m.startDate.toISOString().split('T')[0]
              : String(m.startDate),
            endDate: m.endDate instanceof Date
              ? m.endDate.toISOString().split('T')[0]
              : String(m.endDate),
            maxDurationYears: m.maxDurationYears ?? 3,
            renewalDate: m.renewalDate instanceof Date
              ? m.renewalDate.toISOString().split('T')[0]
              : '',
            signedAtPlace: m.signedAtPlace || '',
            notes: m.notes || ''
          };
          // Pré-charger les libellés
          if (m.propertyReference || m.propertyAddress) {
            this.propertySearch.set(m.propertyReference || m.propertyAddress || '');
          }
          if (m.mandatorName) {
            this.contactSearch.set(m.mandatorName);
          }
          this.loadingData.set(false);
        },
        error: () => {
          this.errorMessage.set('Impossible de charger le mandat.');
          this.loadingData.set(false);
        }
      });
    } else {
      this.loadingData.set(false);
    }
  }

  // Sélection d'un bien
  propertyLabel(p: Property): string {
    const addr = p.address ? `${p.address.street || ''}, ${p.address.city || ''}`.trim().replace(/^,\s*/, '') : '';
    return `${p.reference ? '[' + p.reference + '] ' : ''}${p.title || addr}`;
  }

  selectProperty(p: Property): void {
    this.formData.propertyId = p.id;
    this.propertySearch.set(this.propertyLabel(p));
    this.selectedProperty.set(p);
    this.showPropertyDropdown.set(false);
    // Pré-remplir le prix depuis le bien
    if (p.price && !this.formData.price) {
      this.formData.price = p.price;
    }
  }

  clearProperty(): void {
    this.formData.propertyId = '';
    this.propertySearch.set('');
    this.selectedProperty.set(null);
  }

  // Sélection d'un contact
  selectContact(c: Contact): void {
    this.formData.mandatorId = c.id;
    this.contactSearch.set(`${c.firstName} ${c.lastName}${c.email ? ' — ' + c.email : ''}`);
    this.selectedContact.set(c);
    this.showContactDropdown.set(false);
  }

  clearContact(): void {
    this.formData.mandatorId = '';
    this.contactSearch.set('');
    this.selectedContact.set(null);
  }

  onPropertySearchFocus(): void { this.showPropertyDropdown.set(true); }
  onContactSearchFocus(): void { this.showContactDropdown.set(true); }

  onPropertySearchBlur(): void {
    setTimeout(() => this.showPropertyDropdown.set(false), 200);
  }
  onContactSearchBlur(): void {
    setTimeout(() => this.showContactDropdown.set(false), 200);
  }

  onSave(): void {
    if (!this.isValid()) {
      this.errorMessage.set('Veuillez remplir tous les champs obligatoires (type, prix, dates).');
      return;
    }
    if (new Date(this.formData.endDate) <= new Date(this.formData.startDate)) {
      this.errorMessage.set('La date de fin doit être postérieure à la date de début.');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    const payload: any = {
      category: this.formData.category,
      type: this.formData.type as MandateType,
      status: this.formData.status,
      agentId: this.authService.currentUser?.id,
      price: this.formData.price,
      // honoraires — transmis tels quels à mapToRequest()
      feeType: this.formData.feeType,
      agencyFeesPercentInput: this.formData.agencyFeesPercentInput,
      agencyFeesAmountInput: this.formData.agencyFeesAmountInput,
      agencyFeesTextInput: this.formData.agencyFeesTextInput,
      startDate: new Date(this.formData.startDate),
      endDate: new Date(this.formData.endDate),
      renewalDate: this.formData.renewalDate ? new Date(this.formData.renewalDate) : undefined,
      propertyId: this.formData.propertyId || undefined,
      mandatorId: this.formData.mandatorId || undefined,
      signedAtPlace: this.formData.signedAtPlace || undefined,
      maxDurationYears: this.formData.maxDurationYears || 3,
      notes: this.formData.notes || undefined
    };

    const op = this.isEdit()
      ? this.mandateService.update(this.editId()!, payload)
      : this.mandateService.create(payload);

    op.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.mandateService.notifyChange();
        this.router.navigate(['/mandates']);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(err?.error?.message || 'Erreur lors de la sauvegarde du mandat.');
      }
    });
  }
}
