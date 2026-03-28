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
  template: `
    @if (contact()) {
      <div class="detail-page">
        <div class="page-header">
          <a routerLink="/contacts" class="breadcrumb-link"><i class="pi pi-arrow-left"></i> Contacts</a>
        </div>
        <div class="contact-hero card">
          <div class="avatar-large" [style.background]="getAvatarColor()">
            {{ contact()!.firstName[0] }}{{ contact()!.lastName[0] }}
          </div>
          <div class="hero-info">
            <h1 class="hero-name">{{ contact()!.civility }} {{ contact()!.firstName }} {{ contact()!.lastName }}</h1>
            <div class="hero-meta">
              <span class="type-badge-lg">{{ getTypeLabel(contact()!.type) }}</span>
              @if (contact()!.isVip) { <span class="vip-badge-lg">⭐ VIP</span> }
            </div>
            <div class="hero-contacts">
              @if (contact()!.email) { <a [href]="'mailto:' + contact()!.email" class="contact-link"><i class="pi pi-envelope"></i> {{ contact()!.email }}</a> }
              @if (contact()!.mobilePhone) { <a [href]="'tel:' + contact()!.mobilePhone" class="contact-link"><i class="pi pi-phone"></i> {{ contact()!.mobilePhone }}</a> }
            </div>
          </div>
          <div class="hero-actions">
            <button class="btn-primary"><i class="pi pi-phone"></i> Appeler</button>
            <button class="btn-secondary"><i class="pi pi-envelope"></i> Email</button>
          </div>
        </div>

        <div class="detail-grid">
          <div class="detail-main">
            @if (contact()!.searchCriteria) {
              <div class="card">
                <h3 class="card-title">Critères de recherche</h3>
                <div class="criteria-grid">
                  <div class="criterion"><span>Budget max</span><strong>{{ contact()!.searchCriteria!.maxBudget?.toLocaleString('fr-FR') }} €</strong></div>
                  <div class="criterion"><span>Surface min</span><strong>{{ contact()!.searchCriteria!.minSurface }} m²</strong></div>
                  <div class="criterion"><span>Pièces min</span><strong>{{ contact()!.searchCriteria!.minRooms }}</strong></div>
                  <div class="criterion"><span>Villes</span><strong>{{ contact()!.searchCriteria!.cities?.join(', ') || '—' }}</strong></div>
                </div>
              </div>
            }
            <div class="card">
              <h3 class="card-title">Historique des interactions</h3>
              <div class="empty-state-small">
                <i class="pi pi-clock"></i>
                <span>Aucune interaction enregistrée</span>
              </div>
            </div>
          </div>
          <div class="detail-sidebar">
            <div class="card">
              <h3 class="card-title">Informations</h3>
              <div class="info-list">
                <div class="info-row"><span>Référence</span><span>{{ contact()!.reference }}</span></div>
                <div class="info-row"><span>Source</span><span>{{ contact()!.source || '—' }}</span></div>
                <div class="info-row"><span>Interactions</span><span>{{ contact()!.interactionCount || 0 }}</span></div>
                <div class="info-row"><span>Créé le</span><span>{{ contact()!.createdAt | date:'dd/MM/yyyy' }}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .detail-page { animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .page-header { margin-bottom: 1.25rem; }
    .breadcrumb-link { display: inline-flex; align-items: center; gap: 0.4rem; color: #1B4F72; text-decoration: none; font-size: 0.875rem; font-weight: 500; }
    .card { background: #fff; border-radius: 12px; padding: 1.25rem; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
    .contact-hero { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
    .avatar-large { width: 72px; height: 72px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; color: #fff; flex-shrink: 0; }
    .hero-info { flex: 1; }
    .hero-name { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.4rem; font-weight: 800; color: #1e293b; margin: 0 0 0.35rem; }
    .hero-meta { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
    .type-badge-lg { background: rgba(27,79,114,0.1); color: #1B4F72; font-size: 0.8rem; font-weight: 600; padding: 4px 12px; border-radius: 100px; }
    .vip-badge-lg { background: rgba(243,156,18,0.12); color: #d97706; font-size: 0.8rem; font-weight: 600; padding: 4px 12px; border-radius: 100px; }
    .hero-contacts { display: flex; gap: 1rem; flex-wrap: wrap; }
    .contact-link { display: flex; align-items: center; gap: 0.4rem; font-size: 0.875rem; color: #475569; text-decoration: none; }
    .contact-link:hover { color: #1B4F72; }
    .hero-actions { display: flex; gap: 0.75rem; margin-left: auto; }
    .btn-primary { display: flex; align-items: center; gap: 0.4rem; background: #1B4F72; color: #fff; border: none; padding: 0.625rem 1.125rem; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; }
    .btn-secondary { display: flex; align-items: center; gap: 0.4rem; background: #fff; color: #475569; border: 1.5px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.875rem; cursor: pointer; }
    .detail-grid { display: grid; grid-template-columns: 1fr 300px; gap: 1.25rem; }
    @media (max-width: 1100px) { .detail-grid { grid-template-columns: 1fr; } }
    .detail-main, .detail-sidebar { display: flex; flex-direction: column; gap: 1.25rem; }
    .card-title { font-size: 0.95rem; font-weight: 700; color: #1e293b; margin: 0 0 1rem; }
    .criteria-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
    .criterion { background: #f8fafc; border-radius: 8px; padding: 0.75rem; }
    .criterion span { display: block; font-size: 0.72rem; color: #94a3b8; margin-bottom: 2px; }
    .criterion strong { font-size: 0.9rem; color: #1e293b; }
    .info-list { display: flex; flex-direction: column; }
    .info-row { display: flex; justify-content: space-between; padding: 0.625rem 0; border-bottom: 1px solid #f8fafc; font-size: 0.85rem; }
    .info-row span:first-child { color: #64748b; }
    .info-row span:last-child { font-weight: 600; color: #1e293b; }
    .empty-state-small { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 2rem; color: #94a3b8; font-size: 0.875rem; }
    .empty-state-small i { font-size: 1.5rem; color: #cbd5e1; }
  `]
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
