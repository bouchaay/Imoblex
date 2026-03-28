import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Property, PropertySearchRequest, PropertySearchResponse, PropertyPhoto } from '../models/property.model';
import { PropertyType, PropertyStatus, TransactionType, DpeClass } from '../models/enums';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/properties';

  private mockProperties: Property[] = this.generateMockProperties();

  getAll(request: PropertySearchRequest = {}): Observable<PropertySearchResponse> {
    let items = [...this.mockProperties];

    if (request.query) {
      const q = request.query.toLowerCase();
      items = items.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.address.city.toLowerCase().includes(q) ||
        p.reference.toLowerCase().includes(q)
      );
    }
    if (request.status?.length) {
      items = items.filter(p => request.status!.includes(p.status));
    }
    if (request.type?.length) {
      items = items.filter(p => request.type!.includes(p.type));
    }
    if (request.transactionType) {
      items = items.filter(p => p.transactionType === request.transactionType);
    }
    if (request.minPrice) items = items.filter(p => p.price >= request.minPrice!);
    if (request.maxPrice) items = items.filter(p => p.price <= request.maxPrice!);

    const page = request.page || 1;
    const pageSize = request.pageSize || 12;
    const start = (page - 1) * pageSize;
    const paginated = items.slice(start, start + pageSize);

    return of({
      items: paginated,
      total: items.length,
      page,
      pageSize,
      totalPages: Math.ceil(items.length / pageSize)
    }).pipe(delay(300));
  }

  getById(id: string): Observable<Property> {
    const property = this.mockProperties.find(p => p.id === id) || this.mockProperties[0];
    return of(property).pipe(delay(200));
  }

  create(data: Partial<Property>): Observable<Property> {
    const newProperty: Property = {
      ...this.mockProperties[0],
      ...data,
      id: 'prop_' + Date.now(),
      reference: 'IMB-' + Math.floor(Math.random() * 90000 + 10000),
      createdAt: new Date(),
      updatedAt: new Date()
    } as Property;
    this.mockProperties.unshift(newProperty);
    return of(newProperty).pipe(delay(500));
  }

  update(id: string, data: Partial<Property>): Observable<Property> {
    const index = this.mockProperties.findIndex(p => p.id === id);
    if (index >= 0) {
      this.mockProperties[index] = { ...this.mockProperties[index], ...data, updatedAt: new Date() };
    }
    return of(this.mockProperties[index >= 0 ? index : 0]).pipe(delay(400));
  }

  delete(id: string): Observable<void> {
    this.mockProperties = this.mockProperties.filter(p => p.id !== id);
    return of(undefined).pipe(delay(300));
  }

  uploadPhotos(id: string, files: File[]): Observable<PropertyPhoto[]> {
    const photos: PropertyPhoto[] = files.map((f, i) => ({
      id: 'photo_' + Date.now() + i,
      url: URL.createObjectURL(f),
      thumbnailUrl: URL.createObjectURL(f),
      caption: f.name,
      isPrimary: i === 0,
      order: i,
      uploadedAt: new Date()
    }));
    return of(photos).pipe(delay(1000));
  }

  togglePublish(id: string, publish: boolean): Observable<Property> {
    return this.update(id, {
      isPublished: publish,
      publishedAt: publish ? new Date() : undefined,
      status: publish ? PropertyStatus.AVAILABLE : PropertyStatus.OFF_MARKET
    });
  }

  private generateMockProperties(): Property[] {
    const cities = ['Paris 8ème', 'Paris 16ème', 'Neuilly-sur-Seine', 'Boulogne-Billancourt', 'Levallois-Perret', 'Courbevoie', 'Vincennes', 'Saint-Cloud'];
    const streets = ['Avenue Foch', 'Rue de Rivoli', 'Boulevard Haussmann', 'Avenue Montaigne', 'Rue du Faubourg Saint-Honoré', 'Avenue Victor Hugo'];
    const types = [PropertyType.APARTMENT, PropertyType.HOUSE, PropertyType.VILLA, PropertyType.STUDIO, PropertyType.LOFT];
    const statuses = [PropertyStatus.AVAILABLE, PropertyStatus.UNDER_OFFER, PropertyStatus.SOLD, PropertyStatus.RENTED];
    const dpes = [DpeClass.A, DpeClass.B, DpeClass.C, DpeClass.D, DpeClass.E];

    const photos = [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1560185127-6a82a5a34a7f?w=800',
      'https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=800',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800'
    ];

    return Array.from({ length: 48 }, (_, i) => {
      const type = types[i % types.length];
      const status = statuses[i % statuses.length];
      const city = cities[i % cities.length];
      const isRental = i % 3 === 0;
      const rooms = Math.floor(Math.random() * 5) + 1;
      const surface = Math.floor(Math.random() * 120) + 30;
      const price = isRental
        ? Math.floor(Math.random() * 3000) + 800
        : Math.floor(Math.random() * 1500000) + 250000;

      return {
        id: `prop_${i + 1}`,
        reference: `IMB-${10000 + i}`,
        title: `${type === PropertyType.APARTMENT ? 'Appartement' : type === PropertyType.HOUSE ? 'Maison' : type === PropertyType.STUDIO ? 'Studio' : 'Bien'} ${rooms} pièces - ${city}`,
        description: `Magnifique ${type === PropertyType.APARTMENT ? 'appartement' : 'bien'} situé au coeur de ${city}. Ce bien d'exception offre des prestations haut de gamme avec des matériaux nobles. Idéalement situé à proximité des commerces et transports.`,
        type,
        transactionType: isRental ? TransactionType.RENTAL : TransactionType.SALE,
        status,
        price,
        pricePerSqm: Math.round(price / surface),
        monthlyCharges: isRental ? Math.floor(Math.random() * 200) + 50 : undefined,
        agencyFees: isRental ? Math.floor(price * 0.8) : Math.floor(price * 0.03),
        agencyFeesIncluded: Math.random() > 0.5,
        address: {
          street: streets[i % streets.length],
          streetNumber: `${i + 1}`,
          city,
          postalCode: `750${Math.floor(Math.random() * 20 + 1).toString().padStart(2, '0')}`,
          department: 'Île-de-France',
          region: 'Île-de-France',
          country: 'France',
          latitude: 48.8566 + (Math.random() - 0.5) * 0.1,
          longitude: 2.3522 + (Math.random() - 0.5) * 0.1
        },
        features: {
          rooms,
          bedrooms: Math.max(1, rooms - 1),
          bathrooms: Math.ceil(rooms / 2),
          toilets: rooms > 2 ? 2 : 1,
          surface,
          landSurface: type === PropertyType.HOUSE ? surface * 3 : undefined,
          floor: type === PropertyType.APARTMENT ? Math.floor(Math.random() * 8) + 1 : undefined,
          totalFloors: type === PropertyType.APARTMENT ? Math.floor(Math.random() * 8) + 4 : undefined,
          constructionYear: Math.floor(Math.random() * 70) + 1950,
          hasParking: Math.random() > 0.4,
          hasGarage: type === PropertyType.HOUSE,
          hasGarden: type !== PropertyType.STUDIO,
          hasPool: type === PropertyType.VILLA,
          hasBalcony: Math.random() > 0.5,
          hasTerrace: Math.random() > 0.6,
          hasCellar: Math.random() > 0.4,
          hasElevator: type === PropertyType.APARTMENT && Math.random() > 0.3,
          isGroundFloor: false,
          orientation: ['Sud', 'Nord', 'Est', 'Ouest', 'Sud-Est', 'Sud-Ouest'][i % 6],
          heatingType: ['Central', 'Individuel', 'Électrique'][i % 3],
          heatingEnergy: ['Gaz', 'Électricité', 'Pompe à chaleur'][i % 3]
        },
        dpe: dpes[i % dpes.length],
        ges: dpes[(i + 1) % dpes.length],
        photos: [{
          id: `photo_${i}_1`,
          url: photos[i % photos.length],
          thumbnailUrl: photos[i % photos.length],
          isPrimary: true,
          order: 0,
          uploadedAt: new Date()
        }],
        tags: ['Lumineux', 'Calme', 'Vue dégagée'].slice(0, Math.floor(Math.random() * 3) + 1),
        isPublished: status !== PropertyStatus.DRAFT,
        publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        agentId: '1',
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000),
        visitCount: Math.floor(Math.random() * 50),
        favoriteCount: Math.floor(Math.random() * 20),
        notes: ''
      };
    });
  }
}
