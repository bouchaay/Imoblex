import { Component, inject, OnInit, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DocumentService, DocItem } from '../../core/services/document.service';
import { StorageService } from '../../core/services/storage.service';

type FilterMode = 'all' | 'personal' | 'type' | 'folder';

const TYPE_CATEGORIES = [
  { key: 'MANDATE',   label: 'Mandats',    icon: 'pi-file-edit', color: '#1B4F72' },
  { key: 'COMPROMIS', label: 'Compromis',  icon: 'pi-file',      color: '#F39C12' },
  { key: 'DPE',       label: 'DPE',        icon: 'pi-bolt',      color: '#10b981' },
  { key: 'PHOTO',     label: 'Photos',     icon: 'pi-image',     color: '#8b5cf6' },
  { key: 'INVOICE',   label: 'Factures',   icon: 'pi-receipt',   color: '#ef4444' },
  { key: 'OTHER',     label: 'Autres',     icon: 'pi-file',      color: '#64748b' },
];

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  private readonly docService = inject(DocumentService);
  readonly storageService = inject(StorageService);

  documents = signal<DocItem[]>([]);
  folders = signal<string[]>([]);
  loading = signal(true);
  uploading = signal(false);

  viewMode: 'grid' | 'list' = 'grid';
  searchQuery = '';
  filterMode: FilterMode = 'all';
  activeTypeKey = '';
  activeFolder = '';

  selectedDoc = signal<DocItem | null>(null);

  // Upload dialog
  showUploadDialog = signal(false);
  uploadType = 'OTHER';
  uploadFolder = '';
  uploadFiles: File[] = [];

  // New folder dialog
  showFolderDialog = signal(false);
  newFolderName = '';

  // Delete doc dialog
  showDeleteDialog = signal(false);
  docToDelete = signal<DocItem | null>(null);
  deleting = signal(false);

  // Delete folder dialog
  folderToDelete = signal<string | null>(null);
  deletingFolder = signal(false);

  readonly typeCategories = TYPE_CATEGORIES;

  ngOnInit(): void {
    this.load();
    this.storageService.refresh();
  }

  load(): void {
    this.loading.set(true);
    const params: any = {};
    if (this.filterMode === 'personal') params.personal = true;
    else if (this.filterMode === 'type') params.type = this.activeTypeKey;
    else if (this.filterMode === 'folder') params.folder = this.activeFolder;

    this.docService.getAll(params).subscribe({
      next: docs => { this.documents.set(docs); this.loading.set(false); },
      error: () => this.loading.set(false)
    });

    this.docService.getFolders().subscribe(f => this.folders.set(f));
  }

  setFilter(mode: FilterMode, key = ''): void {
    this.filterMode = mode;
    if (mode === 'type') this.activeTypeKey = key;
    else if (mode === 'folder') this.activeFolder = key;
    this.load();
  }

  get filteredDocs(): DocItem[] {
    if (!this.searchQuery.trim()) return this.documents();
    const q = this.searchQuery.toLowerCase();
    return this.documents().filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.type.toLowerCase().includes(q) ||
      d.propertyReference?.toLowerCase().includes(q) ||
      d.contactName?.toLowerCase().includes(q)
    );
  }

  getDocIcon(doc: DocItem) { return this.docService.getIcon(doc.type, doc.mimeType); }
  formatSize(b?: number) { return this.docService.formatSize(b); }

  openUploadDialog(): void { this.showUploadDialog.set(true); }
  triggerFileInput(): void { this.fileInputRef.nativeElement.click(); }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.uploadFiles = Array.from(input.files ?? []);
  }

  doUpload(): void {
    if (!this.uploadFiles.length || this.uploading()) return;
    this.uploading.set(true);
    const uploads = this.uploadFiles.map(f =>
      this.docService.upload(f, this.uploadType, { folderPath: this.uploadFolder || undefined }).toPromise()
    );
    Promise.all(uploads).then(() => {
      this.uploading.set(false);
      this.showUploadDialog.set(false);
      this.uploadFiles = [];
      this.fileInputRef.nativeElement.value = '';
      this.docService.notifyChange();
      this.storageService.refresh();
      this.load();
    }).catch(() => this.uploading.set(false));
  }

  createFolder(): void {
    const name = this.newFolderName.trim();
    if (!name) return;
    this.docService.createFolder(name).subscribe({
      next: () => {
        this.showFolderDialog.set(false);
        this.newFolderName = '';
        this.docService.getFolders().subscribe(f => {
          this.folders.set(f);
          this.setFilter('folder', name);
        });
      }
    });
  }

  delete(doc: DocItem, event: Event): void {
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
        if (this.selectedDoc()?.id === doc.id) this.selectedDoc.set(null);
        this.docService.notifyChange();
        this.storageService.refresh();
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

  deleteFolder(folder: string, event: Event): void {
    event.stopPropagation();
    this.folderToDelete.set(folder);
  }

  confirmDeleteFolder(): void {
    const folder = this.folderToDelete();
    if (!folder || this.deletingFolder()) return;
    this.deletingFolder.set(true);
    this.docService.deleteFolder(folder).subscribe({
      next: () => {
        this.folders.update(list => list.filter(f => f !== folder));
        if (this.activeFolder === folder) this.setFilter('all');
        this.folderToDelete.set(null);
        this.deletingFolder.set(false);
      },
      error: () => this.deletingFolder.set(false)
    });
  }

  cancelDeleteFolder(): void {
    this.folderToDelete.set(null);
  }

  download(doc: DocItem, event: Event): void {
    event.stopPropagation();
    const a = document.createElement('a');
    a.href = doc.fileUrl;
    a.download = doc.name;
    a.target = '_blank';
    a.click();
  }

  getTypeLabel(key: string): string {
    return TYPE_CATEGORIES.find(t => t.key === key)?.label ?? key;
  }
}
