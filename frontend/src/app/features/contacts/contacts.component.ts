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
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
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
