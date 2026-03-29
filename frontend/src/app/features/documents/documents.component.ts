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
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
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

  downloadDoc(doc: DocItem): void {
    // Simulate download - in real app this would call the API
    const link = document.createElement('a');
    link.href = '#';
    link.download = doc.name;
    link.click();
    console.log(`Téléchargement: ${doc.name}`);
  }

  deleteDoc(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      this.documents = this.documents.filter(d => d.id !== id);
      // Update category counts
      this.categories = this.categories.map(c => ({
        ...c,
        count: c.key === 'all'
          ? this.documents.length
          : this.documents.filter(d => d.category === c.key).length
      }));
    }
  }
}
