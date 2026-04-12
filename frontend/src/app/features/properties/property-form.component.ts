import { Component, inject, OnInit, signal, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Observable, switchMap, of, forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { PropertyService } from '../../core/services/property.service';
import { ContactService } from '../../core/services/contact.service';
import { PropertyType, PropertyStatus, TransactionType, DpeClass, PROPERTY_TYPE_LABELS, DPE_COLORS } from '../../core/models/enums';
import { DpeBadgeComponent } from '../../shared/components/dpe-badge.component';
import { Contact } from '../../core/models/contact.model';
import { PropertyTransport, PropertyShop } from '../../core/models/property.model';

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, DpeBadgeComponent],
  templateUrl: './property-form.component.html',
  styleUrls: ['./property-form.component.scss']
})
export class PropertyFormComponent implements OnInit {
  @Input() id?: string;
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly propertyService = inject(PropertyService);
  private readonly contactService = inject(ContactService);
  private readonly http = inject(HttpClient);

  form!: FormGroup;
  currentStep = signal(0);
  isSaving = signal(false);
  isDragging = signal(false);
  selectedStatus = signal<PropertyStatus>(PropertyStatus.DRAFT);
  photoFiles = signal<{ file?: File; name: string; preview: string; existingId?: string }[]>([]);

  statusOptions = [
    { value: PropertyStatus.DRAFT,       label: 'Brouillon',    desc: 'Visible uniquement en back-office',          color: '#9ca3af', icon: 'pi-file' },
    { value: PropertyStatus.AVAILABLE,   label: 'Disponible',   desc: 'Bien disponible à la vente ou location',     color: '#22c55e', icon: 'pi-check-circle' },
    { value: PropertyStatus.UNDER_OFFER, label: 'Sous offre',   desc: 'Une offre est en cours de négociation',      color: '#f59e0b', icon: 'pi-clock' },
    { value: PropertyStatus.SOLD,        label: 'Vendu',        desc: 'Le bien a été vendu',                        color: '#ef4444', icon: 'pi-times-circle' },
    { value: PropertyStatus.RENTED,      label: 'Loué',         desc: 'Le bien est actuellement loué',              color: '#a855f7', icon: 'pi-home' },
    { value: PropertyStatus.OFF_MARKET,  label: 'Hors marché',  desc: 'Le bien n\'est plus sur le marché',          color: '#6b7280', icon: 'pi-ban' },
  ];
  deletedPhotoIds = signal<string[]>([]);
  saveError = signal<string | null>(null);
  isEdit = false;

  // Proximity signals
  transports = signal<PropertyTransport[]>([]);
  shops = signal<PropertyShop[]>([]);
  isGeocoding = signal(false);
  geocodeError = signal<string | null>(null);

  // Propriétaire / contact associé
  contacts = signal<Contact[]>([]);
  ownerSearch = signal('');
  showOwnerDropdown = signal(false);
  selectedOwner = signal<Contact | null>(null);
  ownerId = signal<string>('');

  filteredContacts = computed(() => {
    const q = this.ownerSearch().toLowerCase();
    if (!q) return this.contacts().slice(0, 8);
    return this.contacts().filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q)
    ).slice(0, 8);
  });

  // Champs requis par étape (pour naviguer vers l'étape en erreur)
  private readonly stepFields: string[][] = [
    ['type', 'transactionType', 'title', 'price'],
    ['street', 'city', 'postalCode'],
    ['surface', 'rooms'],
    [],
    []
  ];

  steps = [
    { id: 0, label: 'Informations' },
    { id: 1, label: 'Localisation' },
    { id: 2, label: 'Détails' },
    { id: 3, label: 'Photos' },
    { id: 4, label: 'Publication' },
    { id: 5, label: 'Proximité' }
  ];

  propertyTypes = Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
    icon: this.getTypeIcon(value)
  }));

  amenityOptions = [
    { key: 'hasParking', label: 'Parking', icon: 'pi-car' },
    { key: 'hasGarage', label: 'Garage', icon: 'pi-car' },
    { key: 'hasGarden', label: 'Jardin', icon: 'pi-map' },
    { key: 'hasPool', label: 'Piscine', icon: 'pi-droplet' },
    { key: 'hasBalcony', label: 'Balcon', icon: 'pi-external-link' },
    { key: 'hasTerrace', label: 'Terrasse', icon: 'pi-home' },
    { key: 'hasElevator', label: 'Ascenseur', icon: 'pi-sort-alt' },
    { key: 'hasCellar', label: 'Cave', icon: 'pi-inbox' }
  ];

  dpeClasses = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  ngOnInit(): void {
    const routeId = this.id || this.route.snapshot.paramMap.get('id');
    this.isEdit = !!routeId && !this.route.snapshot.url.some(s => s.path === 'new');

    // Charger les contacts pour le sélecteur propriétaire
    this.contactService.getAll({ pageSize: 200 }).subscribe(r => this.contacts.set(r.items));

    this.form = this.fb.group({
      type: ['APARTMENT', Validators.required],
      transactionType: ['SALE', Validators.required],
      title: ['', [Validators.required, Validators.minLength(10)]],
      description: [''],
      price: [null, [Validators.required, Validators.min(1)]],
      street: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      department: [''],
      latitude: [null],
      longitude: [null],
      surface: [null, [Validators.required, Validators.min(1)]],
      rooms: [null, Validators.required],
      bedrooms: [null],
      bathrooms: [null],
      floor: [null],
      constructionYear: [null],
      dpe: [null],
      hasParking: [false],
      hasGarage: [false],
      hasGarden: [false],
      hasPool: [false],
      hasBalcony: [false],
      hasTerrace: [false],
      hasElevator: [false],
      hasCellar: [false],
      furnished: [null],
      availableFrom: [null]
    });

    if (this.isEdit && routeId) {
      this.propertyService.getById(routeId).subscribe(p => {
        this.form.patchValue({
          type: p.type, transactionType: p.transactionType,
          title: p.title, description: p.description, price: p.price,
          street: p.address.street, city: p.address.city,
          postalCode: p.address.postalCode,
          latitude: p.address.latitude, longitude: p.address.longitude,
          surface: p.features.surface, rooms: p.features.rooms,
          bedrooms: p.features.bedrooms, bathrooms: p.features.bathrooms,
          floor: p.features.floor, constructionYear: p.features.constructionYear,
          dpe: p.dpe,
          hasParking: p.features.hasParking, hasGarage: p.features.hasGarage,
          hasGarden: p.features.hasGarden, hasPool: p.features.hasPool,
          hasBalcony: p.features.hasBalcony, hasTerrace: p.features.hasTerrace,
          hasElevator: p.features.hasElevator, hasCellar: p.features.hasCellar,
          furnished: p.features.furnished ?? null
        });
        // Restaurer le statut
        if (p.status) this.selectedStatus.set(p.status as PropertyStatus);
        // Restaurer le propriétaire
        if (p.ownerId) {
          this.ownerId.set(p.ownerId);
          if (p.ownerName) this.ownerSearch.set(p.ownerName);
        }
        // Charger les photos existantes
        const existingPhotos = [...(p.photos || [])]
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map(photo => ({
            name: photo.url.split('/').pop() || 'photo',
            preview: photo.url,
            existingId: photo.id
          }));
        this.photoFiles.set(existingPhotos);
        // Charger transports et commerces
        if (p.transports && p.transports.length > 0) {
          this.transports.set([...p.transports]);
        }
        if (p.shops && p.shops.length > 0) {
          this.shops.set([...p.shops]);
        }
        // Charger la date de disponibilité
        if (p.availableFrom) {
          this.form.patchValue({ availableFrom: p.availableFrom });
        }
      });
    }
  }

  goToStep(step: number): void {
    this.currentStep.set(Math.max(0, Math.min(step, this.steps.length - 1)));
  }

  selectOwner(c: Contact): void {
    this.ownerId.set(c.id);
    this.ownerSearch.set(`${c.firstName} ${c.lastName}${c.email ? ' — ' + c.email : ''}`);
    this.selectedOwner.set(c);
    this.showOwnerDropdown.set(false);
  }

  clearOwner(): void {
    this.ownerId.set('');
    this.ownerSearch.set('');
    this.selectedOwner.set(null);
  }

  onOwnerFocus(): void { this.showOwnerDropdown.set(true); }
  onOwnerBlur(): void { setTimeout(() => this.showOwnerDropdown.set(false), 200); }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const files = event.dataTransfer?.files;
    if (files) this.processFiles(files);
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) this.processFiles(input.files);
  }

  processFiles(files: FileList): void {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.photoFiles.update(photos => [...photos, { file, name: file.name, preview: e.target?.result as string }]);
      };
      reader.readAsDataURL(file);
    });
  }

  get hasExistingPhoto(): boolean {
    return this.photoFiles().some(p => !!p.existingId);
  }

  removePhoto(index: number): void {
    const photo = this.photoFiles()[index];
    if (photo.existingId) {
      this.deletedPhotoIds.update(ids => [...ids, photo.existingId!]);
    }
    this.photoFiles.update(photos => photos.filter((_, i) => i !== index));
  }

  movePhotoUp(index: number): void {
    if (index === 0) return;
    this.photoFiles.update(photos => {
      const arr = [...photos];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr;
    });
  }

  movePhotoDown(index: number): void {
    this.photoFiles.update(photos => {
      if (index >= photos.length - 1) return photos;
      const arr = [...photos];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr;
    });
  }

  onSave(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      // Naviguer vers la première étape avec des erreurs
      const errorStep = this.stepFields.findIndex(fields =>
        fields.some(f => this.form.get(f)?.invalid)
      );
      if (errorStep >= 0) this.currentStep.set(errorStep);
      this.saveError.set('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    this.saveError.set(null);
    this.isSaving.set(true);
    const fv = this.form.value;
    const data: any = {
      type: fv.type,
      transactionType: fv.transactionType,
      title: fv.title,
      description: fv.description,
      price: fv.price,
      address: { street: fv.street, city: fv.city, postalCode: fv.postalCode, country: 'France', latitude: fv.latitude, longitude: fv.longitude },
      features: { surface: fv.surface, rooms: fv.rooms, bedrooms: fv.bedrooms, bathrooms: fv.bathrooms, floor: fv.floor, constructionYear: fv.constructionYear, hasParking: fv.hasParking, hasGarage: fv.hasGarage, hasGarden: fv.hasGarden, hasPool: fv.hasPool, hasBalcony: fv.hasBalcony, hasTerrace: fv.hasTerrace, hasElevator: fv.hasElevator, hasCellar: fv.hasCellar, isGroundFloor: false, furnished: fv.furnished },
      dpe: fv.dpe,
      isPublished: this.selectedStatus() === PropertyStatus.AVAILABLE,
      status: this.selectedStatus(),
      ownerId: this.ownerId() || undefined,
      photos: [],
      availableFrom: fv.availableFrom || undefined,
      transports: this.transports().length > 0 ? this.transports() : undefined,
      shops: this.shops().length > 0 ? this.shops() : undefined
    };

    const editId = this.id || this.route.snapshot.paramMap.get('id')!;
    const op = this.isEdit
      ? this.propertyService.update(editId, data)
      : this.propertyService.create(data);

    const newFiles = this.photoFiles().filter(p => !!p.file).map(p => p.file!);
    const toDelete = this.deletedPhotoIds();

    op.pipe(
      switchMap(property => {
        const tasks: Observable<any>[] = [
          ...toDelete.map(pid => this.propertyService.deletePhoto(property.id, pid)),
          ...(newFiles.length > 0 ? [this.propertyService.uploadPhotos(property.id, newFiles)] : [])
        ];
        return tasks.length > 0 ? forkJoin(tasks) : of(null);
      })
    ).subscribe({
      next: () => this.router.navigate(['/properties']),
      error: () => this.isSaving.set(false)
    });
  }

  addTransport(): void {
    this.transports.update(list => [...list, { type: 'METRO', line: '', name: '', distanceMeters: undefined, walkingMinutes: undefined, displayOrder: list.length }]);
  }

  removeTransport(index: number): void {
    this.transports.update(list => list.filter((_, i) => i !== index));
  }

  addShop(): void {
    this.shops.update(list => [...list, { type: 'SUPERMARKET', name: '', distanceMeters: undefined, walkingMinutes: undefined, displayOrder: list.length }]);
  }

  removeShop(index: number): void {
    this.shops.update(list => list.filter((_, i) => i !== index));
  }

  geocodeAddress(): void {
    const street = this.form.get('street')?.value?.trim();
    const city = this.form.get('city')?.value?.trim();
    const postalCode = this.form.get('postalCode')?.value?.trim();

    if (!street && !city) {
      this.geocodeError.set('Saisissez au moins la rue ou la ville');
      return;
    }

    this.isGeocoding.set(true);
    this.geocodeError.set(null);

    const q = [street, city].filter(Boolean).join(' ');
    let url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=1`;
    if (postalCode) url += `&postcode=${encodeURIComponent(postalCode)}`;

    this.http.get<any>(url).subscribe({
      next: res => {
        this.isGeocoding.set(false);
        const feature = res?.features?.[0];
        if (!feature) {
          this.geocodeError.set('Adresse introuvable, vérifiez les champs');
          return;
        }
        const [lng, lat] = feature.geometry.coordinates;
        this.form.patchValue({ latitude: +lat.toFixed(6), longitude: +lng.toFixed(6) });
      },
      error: () => {
        this.isGeocoding.set(false);
        this.geocodeError.set('Erreur de géocodage, réessayez');
      }
    });
  }

  getDpeColor(cls: string): string {
    return DPE_COLORS[cls as DpeClass] || '#9ca3af';
  }

  getDpeLabel(cls: string): string {
    const labels: Record<string, string> = { A: 'Très bon', B: 'Bon', C: 'Assez bon', D: 'Moyen', E: 'Médiocre', F: 'Mauvais', G: 'Très mauvais' };
    return labels[cls] || '';
  }

  getTypeLabel(type: string): string {
    return PROPERTY_TYPE_LABELS[type as PropertyType] || type;
  }

  private getTypeIcon(type: string): string {
    const icons: Record<string, string> = { APARTMENT: 'pi-building', HOUSE: 'pi-home', VILLA: 'pi-sun', STUDIO: 'pi-inbox', LAND: 'pi-map', COMMERCIAL: 'pi-shop', OFFICE: 'pi-briefcase', WAREHOUSE: 'pi-box', PARKING: 'pi-car', GARAGE: 'pi-car', NEW_PROGRAM: 'pi-star', OTHER: 'pi-ellipsis-h' };
    return icons[type] || 'pi-building';
  }
}
