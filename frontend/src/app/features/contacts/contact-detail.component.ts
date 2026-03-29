import { Component, inject, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ContactService } from '../../core/services/contact.service';
import { Contact } from '../../core/models/contact.model';
import { CONTACT_TYPE_LABELS, ContactType } from '../../core/models/enums';

@Component({
  selector: 'app-contact-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './contact-detail.component.html',
  styleUrls: ['./contact-detail.component.scss']
})
export class ContactDetailComponent implements OnInit {
  @Input() id!: string;
  private readonly route = inject(ActivatedRoute);
  private readonly contactService = inject(ContactService);
  contact = signal<Contact | null>(null);

  ngOnInit(): void {
    const id = this.id || this.route.snapshot.paramMap.get('id')!;
    this.contactService.getById(id).subscribe(c => this.contact.set(c));
  }

  getTypeLabel(type: ContactType): string { return CONTACT_TYPE_LABELS[type] || type; }
  getAvatarColor(): string {
    const colors = ['#1B4F72', '#2E86C1', '#F39C12', '#27AE60', '#8E44AD', '#E74C3C'];
    const c = this.contact();
    if (!c) return colors[0];
    return colors[(c.firstName.charCodeAt(0) + c.lastName.charCodeAt(0)) % colors.length];
  }
}
