import { Component, Input, OnInit, signal, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService, DocItem } from '../../../core/services/document.service';

const ALL_TYPE_CATEGORIES: Record<string, { key: string; label: string; icon: string; color: string }[]> = {
  property: [
    { key: 'PHOTO',       label: 'Photo',            icon: 'pi-image',     color: '#8b5cf6' },
    { key: 'DPE',         label: 'DPE',              icon: 'pi-bolt',      color: '#10b981' },
    { key: 'DIAGNOSTIC',  label: 'Diagnostic',       icon: 'pi-clipboard', color: '#F39C12' },
    { key: 'PLAN',        label: 'Plan',             icon: 'pi-map',       color: '#3b82f6' },
    { key: 'INVOICE',     label: 'Facture / Devis',  icon: 'pi-receipt',   color: '#ef4444' },
    { key: 'OTHER',       label: 'Autre',            icon: 'pi-file',      color: '#64748b' },
  ],
  mandate: [
    { key: 'MANDATE',     label: 'Mandat',           icon: 'pi-file-edit', color: '#1B4F72' },
    { key: 'COMPROMIS',   label: 'Compromis',        icon: 'pi-file',      color: '#F39C12' },
    { key: 'ACTE',        label: 'Acte de vente',    icon: 'pi-verified',  color: '#10b981' },
    { key: 'INVOICE',     label: 'Facture',          icon: 'pi-receipt',   color: '#ef4444' },
    { key: 'OTHER',       label: 'Autre',            icon: 'pi-file',      color: '#64748b' },
  ],
  contact_tenant: [
    { key: 'BAIL',        label: 'Contrat de bail',  icon: 'pi-file-edit', color: '#1B4F72' },
    { key: 'QUITTANCE',   label: 'Quittance',        icon: 'pi-receipt',   color: '#10b981' },
    { key: 'ETAT_LIEUX',  label: 'État des lieux',   icon: 'pi-list-check',color: '#F39C12' },
    { key: 'CAUTION',     label: 'Caution / Garant', icon: 'pi-shield',    color: '#8b5cf6' },
    { key: 'ID',          label: 'Pièce d\'identité',icon: 'pi-id-card',   color: '#3b82f6' },
    { key: 'REVENUS',     label: 'Justif. revenus',  icon: 'pi-euro',      color: '#f59e0b' },
    { key: 'OTHER',       label: 'Autre',            icon: 'pi-file',      color: '#64748b' },
  ],
  contact_landlord: [
    { key: 'BAIL',        label: 'Contrat de bail',  icon: 'pi-file-edit', color: '#1B4F72' },
    { key: 'TITRE',       label: 'Titre de propriété',icon: 'pi-building', color: '#10b981' },
    { key: 'ETAT_LIEUX',  label: 'État des lieux',   icon: 'pi-list-check',color: '#F39C12' },
    { key: 'ID',          label: 'Pièce d\'identité',icon: 'pi-id-card',   color: '#3b82f6' },
    { key: 'INVOICE',     label: 'Facture',          icon: 'pi-receipt',   color: '#ef4444' },
    { key: 'OTHER',       label: 'Autre',            icon: 'pi-file',      color: '#64748b' },
  ],
  contact: [
    { key: 'ID',          label: 'Pièce d\'identité',icon: 'pi-id-card',   color: '#3b82f6' },
    { key: 'REVENUS',     label: 'Justif. revenus',  icon: 'pi-euro',      color: '#f59e0b' },
    { key: 'COMPROMIS',   label: 'Compromis',        icon: 'pi-file',      color: '#F39C12' },
    { key: 'INVOICE',     label: 'Facture',          icon: 'pi-receipt',   color: '#ef4444' },
    { key: 'OTHER',       label: 'Autre',            icon: 'pi-file',      color: '#64748b' },
  ],
};

@Component({
  selector: 'app-entity-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entity-documents.component.html',
  styleUrls: ['./entity-documents.component.scss']
})
export class EntityDocumentsComponent implements OnInit {
  @Input({ required: true }) entityType!: 'property' | 'mandate' | 'contact';
  @Input({ required: true }) entityId!: string;
  @Input() entitySubtype?: string; // e.g. 'TENANT', 'LANDLORD' for contacts

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  private readonly docService = inject(DocumentService);

  documents = signal<DocItem[]>([]);
  loading = signal(true);

  showUploadDialog = signal(false);
  uploadType = 'OTHER';
  uploadFiles: File[] = [];
  uploading = signal(false);

  showDeleteDialog = signal(false);
  docToDelete = signal<DocItem | null>(null);
  deleting = signal(false);

  get typeCategories() {
    const key = this.entityType === 'contact' && this.entitySubtype
      ? `contact_${this.entitySubtype.toLowerCase()}`
      : this.entityType;
    return ALL_TYPE_CATEGORIES[key] ?? ALL_TYPE_CATEGORIES['contact'];
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    const params = { [this.entityType + 'Id']: this.entityId } as any;
    this.docService.getAll(params).subscribe({
      next: docs => { this.documents.set(docs); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  getIcon(doc: DocItem) { return this.docService.getIcon(doc.type, doc.mimeType); }
  formatSize(b?: number) { return this.docService.formatSize(b); }
  getTypeLabel(key: string) {
    const all = Object.values(ALL_TYPE_CATEGORIES).flat();
    return all.find(t => t.key === key)?.label ?? key;
  }

  triggerFileInput(): void { this.fileInputRef.nativeElement.click(); }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.uploadFiles = Array.from(input.files ?? []);
  }

  doUpload(): void {
    if (!this.uploadFiles.length || this.uploading()) return;
    this.uploading.set(true);
    const opts = { [this.entityType + 'Id']: this.entityId } as any;
    const uploads = this.uploadFiles.map(f =>
      this.docService.upload(f, this.uploadType, opts).toPromise()
    );
    Promise.all(uploads).then(() => {
      this.uploading.set(false);
      this.showUploadDialog.set(false);
      this.uploadFiles = [];
      this.fileInputRef.nativeElement.value = '';
      this.docService.notifyChange();
      this.load();
    }).catch(() => this.uploading.set(false));
  }

  askDelete(doc: DocItem, event: Event): void {
    event.stopPropagation();
    this.docToDelete.set(doc);
    this.showDeleteDialog.set(true);
  }

  confirmDelete(): void {
    const doc = this.docToDelete();
    if (!doc || this.deleting()) return;
    this.deleting.set(true);
    this.docService.delete(doc.id).subscribe({
      next: () => {
        this.documents.update(list => list.filter(d => d.id !== doc.id));
        this.docService.notifyChange();
        this.showDeleteDialog.set(false);
        this.docToDelete.set(null);
        this.deleting.set(false);
      },
      error: () => this.deleting.set(false)
    });
  }

  cancelDelete(): void {
    this.showDeleteDialog.set(false);
    this.docToDelete.set(null);
  }

  download(doc: DocItem, event: Event): void {
    event.stopPropagation();
    const a = document.createElement('a');
    a.href = doc.fileUrl;
    a.download = doc.name;
    a.target = '_blank';
    a.click();
  }
}
