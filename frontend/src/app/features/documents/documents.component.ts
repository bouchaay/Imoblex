import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DocItem {
  id: string; name: string; type: string; size: string;
  category: string; date: Date; icon: string; iconColor: string;
}

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="documents-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Documents</h1>
          <p class="page-subtitle">Gestion documentaire de l'agence</p>
        </div>
        <button class="btn-primary"><i class="pi pi-upload"></i> Importer</button>
      </div>

      <div class="docs-layout">
        <!-- Categories sidebar -->
        <aside class="docs-sidebar">
          <div class="category-list">
            @for (cat of categories; track cat.label) {
              <div class="cat-item" [class.active]="activeCategory === cat.key" (click)="activeCategory = cat.key">
                <i class="pi {{ cat.icon }}" [style.color]="cat.color"></i>
                <span>{{ cat.label }}</span>
                <span class="cat-count">{{ cat.count }}</span>
              </div>
            }
          </div>
        </aside>

        <!-- Documents grid -->
        <div class="docs-main">
          <div class="docs-toolbar">
            <input type="text" [(ngModel)]="searchQuery" placeholder="Rechercher un document..." class="search-input" />
            <div class="view-btns">
              <button [class.active]="viewMode === 'grid'" (click)="viewMode = 'grid'"><i class="pi pi-th-large"></i></button>
              <button [class.active]="viewMode === 'list'" (click)="viewMode = 'list'"><i class="pi pi-list"></i></button>
            </div>
          </div>

          <div class="docs-grid" [class.list-mode]="viewMode === 'list'">
            @for (doc of filteredDocs; track doc.id) {
              <div class="doc-card">
                <div class="doc-icon-wrap" [style.background]="doc.iconColor + '15'">
                  <i class="pi {{ doc.icon }}" [style.color]="doc.iconColor"></i>
                </div>
                <div class="doc-info">
                  <div class="doc-name">{{ doc.name }}</div>
                  <div class="doc-meta">{{ doc.size }} • {{ doc.date | date:'dd/MM/yyyy' }}</div>
                </div>
                <div class="doc-actions">
                  <button class="doc-action-btn" title="Télécharger"><i class="pi pi-download"></i></button>
                  <button class="doc-action-btn" title="Supprimer"><i class="pi pi-trash"></i></button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .documents-page { animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .page-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 0 0 0.2rem; }
    .page-subtitle { font-size: 0.875rem; color: #64748b; margin: 0; }
    .btn-primary { display: flex; align-items: center; gap: 0.4rem; background: #1B4F72; color: #fff; border: none; padding: 0.625rem 1.125rem; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; }
    .docs-layout { display: grid; grid-template-columns: 200px 1fr; gap: 1.25rem; }
    .docs-sidebar { background: #fff; border-radius: 12px; padding: 1rem; box-shadow: 0 1px 4px rgba(0,0,0,0.06); height: fit-content; }
    .category-list { display: flex; flex-direction: column; gap: 2px; }
    .cat-item { display: flex; align-items: center; gap: 0.625rem; padding: 0.625rem 0.75rem; border-radius: 8px; cursor: pointer; font-size: 0.85rem; color: #475569; transition: all 0.15s; }
    .cat-item:hover { background: #f8fafc; }
    .cat-item.active { background: rgba(27,79,114,0.08); color: #1B4F72; font-weight: 600; }
    .cat-item i { font-size: 0.9rem; }
    .cat-item span:last-child { margin-left: auto; background: #f1f5f9; color: #64748b; font-size: 0.7rem; font-weight: 700; padding: 1px 6px; border-radius: 100px; }
    .cat-count { }
    .docs-main { }
    .docs-toolbar { display: flex; gap: 0.75rem; margin-bottom: 1rem; }
    .search-input { flex: 1; padding: 0.5rem 0.875rem; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.875rem; outline: none; background: #fff; }
    .view-btns { display: flex; border: 1.5px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    .view-btns button { padding: 0.4rem 0.625rem; border: none; background: #fff; color: #94a3b8; cursor: pointer; font-size: 0.85rem; }
    .view-btns button.active { background: #1B4F72; color: #fff; }
    .docs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.875rem; }
    .docs-grid.list-mode { grid-template-columns: 1fr; }
    .doc-card { background: #fff; border-radius: 10px; padding: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.06); display: flex; flex-direction: column; gap: 0.75rem; transition: box-shadow 0.2s; cursor: pointer; }
    .doc-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .docs-grid.list-mode .doc-card { flex-direction: row; align-items: center; gap: 1rem; }
    .doc-icon-wrap { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0; }
    .list-mode .doc-icon-wrap { width: 36px; height: 36px; font-size: 1rem; }
    .doc-info { flex: 1; }
    .doc-name { font-size: 0.82rem; font-weight: 600; color: #1e293b; }
    .doc-meta { font-size: 0.72rem; color: #94a3b8; margin-top: 2px; }
    .doc-actions { display: flex; gap: 4px; }
    .doc-action-btn { width: 28px; height: 28px; border: 1.5px solid #e2e8f0; background: #fff; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: #64748b; transition: all 0.15s; }
    .doc-action-btn:hover { border-color: #1B4F72; color: #1B4F72; }
  `]
})
export class DocumentsComponent {
  activeCategory = 'all';
  viewMode: 'grid' | 'list' = 'grid';
  searchQuery = '';

  categories = [
    { key: 'all', label: 'Tous', icon: 'pi-folder', color: '#64748b', count: 24 },
    { key: 'mandates', label: 'Mandats', icon: 'pi-file-edit', color: '#1B4F72', count: 8 },
    { key: 'compromis', label: 'Compromis', icon: 'pi-file', color: '#F39C12', count: 5 },
    { key: 'dpe', label: 'DPE', icon: 'pi-bolt', color: '#10b981', count: 6 },
    { key: 'photos', label: 'Photos', icon: 'pi-image', color: '#8b5cf6', count: 5 }
  ];

  documents: DocItem[] = [
    { id: '1', name: 'Mandat MND-10001.pdf', type: 'pdf', size: '245 Ko', category: 'mandates', date: new Date('2024-03-15'), icon: 'pi-file-pdf', iconColor: '#ef4444' },
    { id: '2', name: 'Compromis TRX-10003.pdf', type: 'pdf', size: '1.2 Mo', category: 'compromis', date: new Date('2024-03-10'), icon: 'pi-file-pdf', iconColor: '#ef4444' },
    { id: '3', name: 'DPE Appartement Paris 8.pdf', type: 'pdf', size: '890 Ko', category: 'dpe', date: new Date('2024-02-28'), icon: 'pi-bolt', iconColor: '#10b981' },
    { id: '4', name: 'Photos Villa Saint-Cloud.zip', type: 'zip', size: '45.2 Mo', category: 'photos', date: new Date('2024-03-01'), icon: 'pi-image', iconColor: '#8b5cf6' },
    { id: '5', name: 'Mandat MND-10007.pdf', type: 'pdf', size: '312 Ko', category: 'mandates', date: new Date('2024-03-18'), icon: 'pi-file-pdf', iconColor: '#ef4444' },
    { id: '6', name: 'Acte vente TRX-10001.pdf', type: 'pdf', size: '2.1 Mo', category: 'compromis', date: new Date('2024-02-15'), icon: 'pi-file-pdf', iconColor: '#ef4444' }
  ];

  get filteredDocs(): DocItem[] {
    return this.documents.filter(d => {
      const matchesCat = this.activeCategory === 'all' || d.category === this.activeCategory;
      const matchesSearch = !this.searchQuery || d.name.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }
}
