import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../core/services/contact.service';
import { Contact } from '../../core/models/contact.model';
import { ContactType, CONTACT_TYPE_LABELS } from '../../core/models/enums';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ConfirmDialogComponent],
  template: `
    <div class="contacts-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Contacts</h1>
          <p class="page-subtitle">{{ total() }} contact{{ total() > 1 ? 's' : '' }}</p>
        </div>
        <button class="btn-primary" routerLink="/contacts/new">
          <i class="pi pi-user-plus"></i> Nouveau contact
        </button>
      </div>

      <!-- Filters & search row -->
      <div class="filters-row">
        <div class="search-box">
          <i class="pi pi-search"></i>
          <input type="text" [(ngModel)]="searchQuery" (input)="onSearch()"
            placeholder="Nom, email, téléphone..." class="search-input" />
        </div>
        <div class="type-filters">
          <button class="type-filter-btn" [class.active]="!activeType" (click)="setType(null)">Tous</button>
          @for (type of contactTypes; track type.value) {
            <button class="type-filter-btn" [class.active]="activeType === type.value"
              (click)="setType(type.value)" [style.border-color]="activeType === type.value ? type.color : ''"
              [style.color]="activeType === type.value ? type.color : ''">
              {{ type.label }}
            </button>
          }
        </div>
      </div>

      <!-- Contact table -->
      @if (isLoading()) {
        <div class="table-loading">
          @for (n of [1,2,3,4,5]; track n) {
            <div class="skeleton-row skeleton-anim"></div>
          }
        </div>
      } @else if (contacts().length === 0) {
        <div class="empty-state">
          <i class="pi pi-users"></i>
          <h3>Aucun contact trouvé</h3>
          <p>Créez votre premier contact ou modifiez vos filtres</p>
          <button class="btn-primary" routerLink="/contacts/new">
            <i class="pi pi-plus"></i> Nouveau contact
          </button>
        </div>
      } @else {
        <div class="table-wrapper">
          <table class="contacts-table">
            <thead>
              <tr>
                <th>Contact</th>
                <th>Type</th>
                <th>Téléphone</th>
                <th>Source</th>
                <th>Dernière interaction</th>
                <th>Note</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (contact of contacts(); track contact.id) {
                <tr class="contact-row" (click)="viewContact(contact)">
                  <td>
                    <div class="contact-cell">
                      <div class="contact-avatar" [style.background]="getAvatarColor(contact)">
                        {{ contact.firstName[0] }}{{ contact.lastName[0] }}
                      </div>
                      <div class="contact-info">
                        <div class="contact-name">
                          {{ contact.civility }} {{ contact.firstName }} {{ contact.lastName }}
                          @if (contact.isVip) { <span class="vip-badge">VIP</span> }
                        </div>
                        <div class="contact-email">{{ contact.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="type-badge" [style]="getTypeBadgeStyle(contact.type)">
                      {{ getTypeLabel(contact.type) }}
                    </span>
                  </td>
                  <td class="phone-cell">{{ contact.mobilePhone || contact.phone || '—' }}</td>
                  <td class="source-cell">{{ contact.source || '—' }}</td>
                  <td class="date-cell">
                    {{ contact.lastInteractionAt ? (contact.lastInteractionAt | date:'dd/MM/yy') : '—' }}
                  </td>
                  <td>
                    <div class="rating-stars">
                      @for (n of [1,2,3,4,5]; track n) {
                        <i class="pi" [class.pi-star-fill]="n <= (contact.rating || 0)" [class.pi-star]="n > (contact.rating || 0)"
                          [style.color]="n <= (contact.rating || 0) ? '#F39C12' : '#cbd5e1'"></i>
                      }
                    </div>
                  </td>
                  <td>
                    <div class="row-actions" (click)="$event.stopPropagation()">
                      <button class="action-btn-sm" (click)="viewContact(contact)" title="Voir">
                        <i class="pi pi-eye"></i>
                      </button>
                      <button class="action-btn-sm" (click)="editContact(contact)" title="Modifier">
                        <i class="pi pi-pencil"></i>
                      </button>
                      <button class="action-btn-sm danger" (click)="deleteRequest(contact)" title="Supprimer">
                        <i class="pi pi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <app-confirm-dialog
      [(visible)]="showDeleteDialog"
      title="Supprimer le contact ?"
      [message]="'Voulez-vous vraiment supprimer ' + (contactToDelete()?.firstName || '') + ' ' + (contactToDelete()?.lastName || '') + ' ? Cette action est irréversible.'"
      confirmLabel="Supprimer"
      type="danger"
      (confirm)="confirmDelete()"
    ></app-confirm-dialog>
  `,
  styles: [`
    .contacts-page { animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; gap: 1rem; }
    .page-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 0 0 0.2rem; }
    .page-subtitle { font-size: 0.875rem; color: #64748b; margin: 0; }
    .btn-primary { display: flex; align-items: center; gap: 0.4rem; background: #1B4F72; color: #fff; border: none; padding: 0.625rem 1.125rem; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-primary:hover { background: #164469; }

    .filters-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
    .search-box { display: flex; align-items: center; gap: 0.5rem; background: #fff; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 0 0.75rem; min-width: 260px; }
    .search-box:focus-within { border-color: #1B4F72; }
    .search-box i { color: #94a3b8; font-size: 0.85rem; }
    .search-input { border: none; outline: none; font-size: 0.875rem; padding: 0.5rem 0; }

    .type-filters { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .type-filter-btn {
      padding: 5px 12px; border: 1.5px solid #e2e8f0; border-radius: 100px;
      font-size: 0.78rem; font-weight: 500; color: #475569; cursor: pointer;
      background: #fff; transition: all 0.15s;
    }
    .type-filter-btn:hover { background: #f8fafc; }
    .type-filter-btn.active { background: rgba(27,79,114,0.08); border-color: #1B4F72; color: #1B4F72; }

    /* Table */
    .table-wrapper { background: #fff; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); overflow: hidden; }
    .contacts-table { width: 100%; border-collapse: collapse; }
    .contacts-table thead th {
      background: #f8fafc; padding: 0.75rem 1rem; text-align: left;
      font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase;
      letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0;
    }
    .contact-row {
      border-bottom: 1px solid #f8fafc; transition: background 0.15s; cursor: pointer;
    }
    .contact-row:hover { background: #f8fafc; }
    .contact-row:last-child { border-bottom: none; }
    .contacts-table td { padding: 0.875rem 1rem; }

    .contact-cell { display: flex; align-items: center; gap: 0.75rem; }
    .contact-avatar {
      width: 38px; height: 38px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.8rem; font-weight: 700; color: #fff; flex-shrink: 0;
    }
    .contact-name { font-size: 0.875rem; font-weight: 600; color: #1e293b; display: flex; align-items: center; gap: 0.4rem; }
    .contact-email { font-size: 0.75rem; color: #94a3b8; }
    .vip-badge { font-size: 0.6rem; font-weight: 700; background: rgba(243,156,18,0.15); color: #d97706; padding: 1px 6px; border-radius: 100px; }

    .type-badge { font-size: 0.72rem; font-weight: 600; padding: 3px 10px; border-radius: 100px; }
    .phone-cell, .source-cell, .date-cell { font-size: 0.82rem; color: #64748b; }

    .rating-stars { display: flex; gap: 1px; }
    .rating-stars i { font-size: 0.75rem; }

    .row-actions { display: flex; gap: 4px; opacity: 0; transition: opacity 0.15s; }
    .contact-row:hover .row-actions { opacity: 1; }
    .action-btn-sm {
      width: 28px; height: 28px; border: 1.5px solid #e2e8f0;
      background: #fff; border-radius: 6px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.75rem; color: #64748b; transition: all 0.15s;
    }
    .action-btn-sm:hover { border-color: #1B4F72; color: #1B4F72; background: rgba(27,79,114,0.05); }
    .action-btn-sm.danger:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }

    .empty-state { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 4rem 2rem; background: #fff; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); text-align: center; }
    .empty-state i { font-size: 3rem; color: #cbd5e1; }
    .empty-state h3 { font-size: 1.1rem; font-weight: 700; color: #374151; margin: 0; }
    .empty-state p { font-size: 0.875rem; color: #64748b; margin: 0; }

    .table-loading { display: flex; flex-direction: column; gap: 0.75rem; }
    .skeleton-row { height: 64px; background: #f1f5f9; border-radius: 8px; }
    .skeleton-anim { animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background: #f1f5f9; } 50% { background: #e2e8f0; } 100% { background: #f1f5f9; } }
  `]
})
export class ContactsComponent implements OnInit {
  private readonly contactService = inject(ContactService);
  private readonly router = inject(Router);

  contacts = signal<Contact[]>([]);
  total = signal(0);
  isLoading = signal(false);
  searchQuery = '';
  activeType: ContactType | null = null;
  showDeleteDialog = false;
  contactToDelete = signal<Contact | null>(null);

  contactTypes = [
    { value: ContactType.BUYER, label: 'Acheteurs', color: '#1B4F72' },
    { value: ContactType.SELLER, label: 'Vendeurs', color: '#F39C12' },
    { value: ContactType.TENANT, label: 'Locataires', color: '#8b5cf6' },
    { value: ContactType.LANDLORD, label: 'Propriétaires', color: '#10b981' },
    { value: ContactType.PROSPECT, label: 'Prospects', color: '#6b7280' }
  ];

  ngOnInit(): void { this.loadContacts(); }

  loadContacts(): void {
    this.isLoading.set(true);
    this.contactService.getAll({ query: this.searchQuery, type: this.activeType || undefined }).subscribe(res => {
      this.contacts.set(res.items);
      this.total.set(res.total);
      this.isLoading.set(false);
    });
  }

  onSearch(): void { this.loadContacts(); }
  setType(type: ContactType | null): void { this.activeType = type; this.loadContacts(); }

  getTypeLabel(type: string): string {
    return CONTACT_TYPE_LABELS[type as ContactType] || type;
  }

  getTypeBadgeStyle(type: ContactType): string {
    const styles: Record<string, string> = {
      BUYER: 'background: rgba(27,79,114,0.1); color: #1B4F72',
      SELLER: 'background: rgba(243,156,18,0.12); color: #d97706',
      TENANT: 'background: rgba(139,92,246,0.1); color: #7c3aed',
      LANDLORD: 'background: rgba(16,185,129,0.1); color: #059669',
      PROSPECT: 'background: rgba(107,114,128,0.1); color: #4b5563',
      PARTNER: 'background: rgba(59,130,246,0.1); color: #2563eb'
    };
    return styles[type] || 'background: #f1f5f9; color: #64748b';
  }

  getAvatarColor(contact: Contact): string {
    const colors = ['#1B4F72', '#2E86C1', '#F39C12', '#27AE60', '#8E44AD', '#E74C3C'];
    const idx = (contact.firstName.charCodeAt(0) + contact.lastName.charCodeAt(0)) % colors.length;
    return colors[idx];
  }

  viewContact(c: Contact): void { this.router.navigate(['/contacts', c.id]); }
  editContact(c: Contact): void { this.router.navigate(['/contacts', c.id], { queryParams: { edit: true } }); }

  deleteRequest(c: Contact): void {
    this.contactToDelete.set(c);
    this.showDeleteDialog = true;
  }

  confirmDelete(): void {
    const c = this.contactToDelete();
    if (c) this.contactService.delete(c.id).subscribe(() => this.loadContacts());
  }
}
