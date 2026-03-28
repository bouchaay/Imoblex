import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Contact } from '../models/contact.model';
import { ContactType, PropertyType, TransactionType } from '../models/enums';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private mockContacts: Contact[] = this.generateMockContacts();

  getAll(filters?: Partial<{ query: string; type: ContactType; page: number; pageSize: number }>): Observable<{ items: Contact[]; total: number }> {
    let items = [...this.mockContacts];
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      items = items.filter(c =>
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q)
      );
    }
    if (filters?.type) {
      items = items.filter(c => c.type === filters.type || c.types?.includes(filters.type as ContactType));
    }
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 20;
    const start = (page - 1) * pageSize;
    return of({ items: items.slice(start, start + pageSize), total: items.length }).pipe(delay(250));
  }

  getById(id: string): Observable<Contact> {
    const contact = this.mockContacts.find(c => c.id === id) || this.mockContacts[0];
    return of(contact).pipe(delay(200));
  }

  create(data: Partial<Contact>): Observable<Contact> {
    const newContact: Contact = {
      ...this.mockContacts[0],
      ...data,
      id: 'contact_' + Date.now(),
      reference: 'CTT-' + Math.floor(Math.random() * 90000 + 10000),
      createdAt: new Date(),
      updatedAt: new Date(),
      interactions: []
    } as Contact;
    this.mockContacts.unshift(newContact);
    return of(newContact).pipe(delay(400));
  }

  update(id: string, data: Partial<Contact>): Observable<Contact> {
    const index = this.mockContacts.findIndex(c => c.id === id);
    if (index >= 0) {
      this.mockContacts[index] = { ...this.mockContacts[index], ...data, updatedAt: new Date() };
    }
    return of(this.mockContacts[index >= 0 ? index : 0]).pipe(delay(300));
  }

  delete(id: string): Observable<void> {
    this.mockContacts = this.mockContacts.filter(c => c.id !== id);
    return of(undefined).pipe(delay(300));
  }

  private generateMockContacts(): Contact[] {
    const firstNames = ['Jean', 'Marie', 'Pierre', 'Sophie', 'Thomas', 'Isabelle', 'Luc', 'Camille', 'François', 'Julie', 'Nicolas', 'Emma', 'Antoine', 'Laure', 'Mathieu'];
    const lastNames = ['Martin', 'Dubois', 'Leroy', 'Bernard', 'Moreau', 'Simon', 'Laurent', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier', 'Morel'];
    const types = [ContactType.BUYER, ContactType.SELLER, ContactType.TENANT, ContactType.LANDLORD, ContactType.PROSPECT];
    const cities = ['Paris', 'Boulogne', 'Neuilly', 'Levallois', 'Vincennes'];

    return Array.from({ length: 60 }, (_, i) => {
      const type = types[i % types.length];
      const fn = firstNames[i % firstNames.length];
      const ln = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
      return {
        id: `contact_${i + 1}`,
        reference: `CTT-${10000 + i}`,
        civility: i % 3 === 0 ? 'M' : 'Mme' as 'M' | 'Mme',
        firstName: fn,
        lastName: ln,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@email.fr`,
        phone: `+33 1 ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)}`,
        mobilePhone: `+33 6 ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)}`,
        type,
        types: [type],
        address: {
          city: cities[i % cities.length],
          postalCode: `750${Math.floor(i % 20 + 1).toString().padStart(2, '0')}`,
          country: 'France'
        },
        company: i % 5 === 0 ? 'Entreprise SAS' : undefined,
        searchCriteria: type === ContactType.BUYER || type === ContactType.TENANT ? {
          transactionType: type === ContactType.TENANT ? TransactionType.RENTAL : TransactionType.SALE,
          propertyTypes: [PropertyType.APARTMENT, PropertyType.HOUSE],
          minBudget: 200000 + i * 5000,
          maxBudget: 600000 + i * 10000,
          minSurface: 40,
          maxSurface: 120,
          minRooms: 2,
          cities: [cities[i % cities.length]]
        } : undefined,
        agentId: '1',
        source: ['Site web', 'Recommandation', 'Portail', 'Agence'][i % 4],
        rating: Math.floor(Math.random() * 5) + 1,
        isVip: i % 10 === 0,
        gdprConsent: true,
        gdprConsentDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        notes: '',
        tags: [],
        interactions: [],
        interactionCount: Math.floor(Math.random() * 15),
        lastInteractionAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000)
      };
    });
  }
}
