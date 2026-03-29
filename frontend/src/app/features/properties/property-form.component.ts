import { Component, inject, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from '../../core/services/property.service';
import { PropertyType, PropertyStatus, TransactionType, DpeClass, PROPERTY_TYPE_LABELS, DPE_COLORS } from '../../core/models/enums';
import { DpeBadgeComponent } from '../../shared/components/dpe-badge.component';

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

  form!: FormGroup;
  currentStep = signal(0);
  isSaving = signal(false);
  isDragging = signal(false);
  publishOption = signal<'draft' | 'publish'>('draft');
  photoFiles = signal<{ name: string; preview: string }[]>([]);
  isEdit = false;

  steps = [
    { id: 0, label: 'Informations' },
    { id: 1, label: 'Localisation' },
    { id: 2, label: 'Détails' },
    { id: 3, label: 'Photos' },
    { id: 4, label: 'Publication' }
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

    this.form = this.fb.group({
      type: ['APARTMENT', Validators.required],
      transactionType: ['SALE', Validators.required],
      title: ['', [Validators.required, Validators.minLength(10)]],
      description: [''],
      price: [null, [Validators.required, Validators.min(1)]],
      street: [''],
      city: ['', Validators.required],
      postalCode: [''],
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
      hasCellar: [false]
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
          hasElevator: p.features.hasElevator, hasCellar: p.features.hasCellar
        });
      });
    }
  }

  goToStep(step: number): void {
    this.currentStep.set(Math.max(0, Math.min(step, this.steps.length - 1)));
  }

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
        this.photoFiles.update(photos => [...photos, { name: file.name, preview: e.target?.result as string }]);
      };
      reader.readAsDataURL(file);
    });
  }

  removePhoto(index: number): void {
    this.photoFiles.update(photos => photos.filter((_, i) => i !== index));
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    const fv = this.form.value;
    const data: any = {
      type: fv.type,
      transactionType: fv.transactionType,
      title: fv.title,
      description: fv.description,
      price: fv.price,
      address: { street: fv.street, city: fv.city, postalCode: fv.postalCode, country: 'France', latitude: fv.latitude, longitude: fv.longitude },
      features: { surface: fv.surface, rooms: fv.rooms, bedrooms: fv.bedrooms, bathrooms: fv.bathrooms, floor: fv.floor, constructionYear: fv.constructionYear, hasParking: fv.hasParking, hasGarage: fv.hasGarage, hasGarden: fv.hasGarden, hasPool: fv.hasPool, hasBalcony: fv.hasBalcony, hasTerrace: fv.hasTerrace, hasElevator: fv.hasElevator, hasCellar: fv.hasCellar, isGroundFloor: false },
      dpe: fv.dpe,
      isPublished: this.publishOption() === 'publish',
      status: this.publishOption() === 'publish' ? PropertyStatus.AVAILABLE : PropertyStatus.DRAFT,
      photos: []
    };

    const op = this.isEdit
      ? this.propertyService.update(this.route.snapshot.paramMap.get('id')!, data)
      : this.propertyService.create(data);

    op.subscribe(() => {
      this.router.navigate(['/properties']);
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
    const icons: Record<string, string> = { APARTMENT: 'pi-building', HOUSE: 'pi-home', VILLA: 'pi-sun', STUDIO: 'pi-inbox', LOFT: 'pi-box', DUPLEX: 'pi-copy', LAND: 'pi-map', COMMERCIAL: 'pi-shop', OFFICE: 'pi-briefcase', GARAGE: 'pi-car', PARKING: 'pi-car' };
    return icons[type] || 'pi-building';
  }
}
