import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  Property,
  PropertySearchParams,
  PropertySearchResult,
  PropertyType,
  TransactionType
} from '../models/property.model';

// ─── Backend response types ───────────────────────────────────────────────────

interface BackendPropertyResponse {
  id: string;
  reference: string;
  transactionType: string;
  propertyType: string;
  status: string;
  address?: string;
  addressComplement?: string;
  city?: string;
  postalCode?: string;
  department?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  addressVisible?: boolean;
  price?: number;
  pricePerSqm?: number;
  rentCharges?: number;
  rentDeposit?: number;
  agencyFees?: number;
  chargesIncluded?: boolean;
  livingArea?: number;
  totalArea?: number;
  landArea?: number;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  toilets?: number;
  floor?: number;
  totalFloors?: number;
  description?: string;
  shortDescription?: string;
  elevator?: boolean;
  balcony?: boolean;
  terrace?: boolean;
  garden?: boolean;
  parking?: boolean;
  garage?: boolean;
  cellar?: boolean;
  pool?: boolean;
  fireplace?: boolean;
  airConditioning?: boolean;
  furnished?: boolean;
  dpeClass?: string;
  gesClass?: string;
  dpeValue?: number;
  gesValue?: number;
  photos?: Array<{ id: string; url: string; thumbnailUrl?: string; caption?: string; position?: number }>;
  publishedWebsite?: boolean;
  publishedAt?: string;
  agentId?: string;
  agentName?: string;
  agentPhone?: string;
  agentEmail?: string;
  createdAt?: string;
  updatedAt?: string;
  viewCount?: number;
  visitCount?: number;
}

interface BackendPageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

interface BackendApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ─── Mock data (fallback) ─────────────────────────────────────────────────────

const MOCK_PHOTOS = [
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
  'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
];

const MOCK_PROPERTIES: Property[] = [
  {
    id: '1', reference: 'IMB-2024-001', title: 'Appartement lumineux - Capitole',
    description: `Superbe appartement entièrement rénové situé au cœur de Toulouse, à deux pas du Capitole. Lumineux et spacieux, il offre une belle vue sur les toits de la Ville Rose.`,
    type: 'apartment', transactionType: 'sale', status: 'active',
    price: 385000, pricePerSqm: 6417, area: 60, rooms: 3, bedrooms: 2, bathrooms: 1, floor: 4, totalFloors: 6,
    location: { address: '12 Rue Saint-Rome', addressVisible: true, city: 'Toulouse', postalCode: '31000', district: 'Capitole', lat: 43.6043, lng: 1.4437 },
    photos: [MOCK_PHOTOS[0], MOCK_PHOTOS[1], MOCK_PHOTOS[2], MOCK_PHOTOS[3]],
    dpe: 'C', ges: 'D', dpeValue: 148, gesValue: 32,
    features: ['Ascenseur', 'Gardien', 'Cave', 'Parquet', 'Double vitrage'],
    amenities: ['Métro à 5min', 'Commerces à 2min', 'Capitole à 10min à pied'],
    isNew: true, isExclusive: true, isFeatured: true, isPriceReduced: false,
    publishedAt: new Date('2024-11-15'), updatedAt: new Date('2024-11-20'),
    agent: { id: 'a1', name: 'Imoblex', phone: '05.61.61.57.38', email: 'contact@imoblex.fr' }
  },
  {
    id: '2', reference: 'IMB-2024-002', title: 'Villa contemporaine avec piscine',
    description: `Magnifique villa contemporaine de 180m² sur un terrain de 800m² entièrement clôturé avec piscine chauffée.`,
    type: 'villa', transactionType: 'sale', status: 'active',
    price: 895000, pricePerSqm: 4972, area: 180, landArea: 800, rooms: 7, bedrooms: 4, bathrooms: 3,
    location: { addressVisible: false, city: 'Toulouse', postalCode: '31400', district: 'Rangueil', lat: 43.5672, lng: 1.4621 },
    photos: [MOCK_PHOTOS[5], MOCK_PHOTOS[6], MOCK_PHOTOS[7], MOCK_PHOTOS[0]],
    dpe: 'B', ges: 'A', dpeValue: 85, gesValue: 12,
    features: ['Piscine', 'Garage double', 'Domotique', 'Panneaux solaires', 'Terrasse', 'Jardin'],
    amenities: ['Écoles à 5min', 'Accès A61 à 10min'],
    isNew: false, isExclusive: true, isFeatured: true, isPriceReduced: false,
    publishedAt: new Date('2024-10-01'), updatedAt: new Date('2024-11-18'),
    agent: { id: 'a2', name: 'Imoblex', phone: '06.81.76.30.94', email: 'contact@imoblex.fr' }
  },
  {
    id: '3', reference: 'IMB-2024-003', title: 'Studio meublé - Université Paul Sabatier',
    description: `Studio entièrement meublé et équipé, idéal pour étudiant ou investissement locatif.`,
    type: 'studio', transactionType: 'rent', status: 'active',
    price: 590, charges: 60, area: 22, rooms: 1, bedrooms: 0, bathrooms: 1, floor: 2, totalFloors: 4,
    location: { addressVisible: true, city: 'Toulouse', postalCode: '31400', district: 'Rangueil', lat: 43.5601, lng: 1.4691 },
    photos: [MOCK_PHOTOS[3], MOCK_PHOTOS[4]],
    dpe: 'D', ges: 'D', dpeValue: 210, gesValue: 45,
    features: ['Meublé', 'Équipé', 'Double vitrage'],
    amenities: ['Métro à 5min', 'Université à 5min'],
    isNew: false, isExclusive: false, isFeatured: false, isPriceReduced: false,
    publishedAt: new Date('2024-11-01'), updatedAt: new Date('2024-11-10'),
    agent: { id: 'a1', name: 'Imoblex', phone: '05.61.61.57.38', email: 'contact@imoblex.fr' }
  },
  {
    id: '4', reference: 'IMB-2024-004', title: 'Maison de ville - Saint-Cyprien',
    description: `Charmante maison de ville toulousaine de 130m² entièrement rénovée avec goût dans le quartier prisé de Saint-Cyprien.`,
    type: 'house', transactionType: 'sale', status: 'active',
    price: 620000, pricePerSqm: 4769, area: 130, landArea: 40, rooms: 5, bedrooms: 3, bathrooms: 2,
    location: { address: '8 Rue des Fontaines', addressVisible: true, city: 'Toulouse', postalCode: '31300', district: 'Saint-Cyprien', lat: 43.5987, lng: 1.4298 },
    photos: [MOCK_PHOTOS[6], MOCK_PHOTOS[7], MOCK_PHOTOS[0], MOCK_PHOTOS[1]],
    dpe: 'C', ges: 'C', dpeValue: 175, gesValue: 28,
    features: ['Terrasse', 'Cour privative', 'Cave', 'Rénovée', 'Parquet'],
    amenities: ['Garonne à 5min', 'Commerces à 2min'],
    isNew: true, isExclusive: false, isFeatured: true, isPriceReduced: true,
    publishedAt: new Date('2024-09-20'), updatedAt: new Date('2024-11-22'),
    agent: { id: 'a3', name: 'Imoblex', phone: '05.61.61.57.38', email: 'contact@imoblex.fr' }
  },
  {
    id: '5', reference: 'IMB-2024-005', title: 'Appartement T4 - Les Minimes',
    description: `Bel appartement familial de 90m² au 3ème étage avec ascenseur dans une résidence récente sécurisée.`,
    type: 'apartment', transactionType: 'sale', status: 'active',
    price: 295000, pricePerSqm: 3278, area: 90, rooms: 4, bedrooms: 3, bathrooms: 2, floor: 3, totalFloors: 5,
    location: { addressVisible: false, city: 'Toulouse', postalCode: '31200', district: 'Les Minimes', lat: 43.6321, lng: 1.4489 },
    photos: [MOCK_PHOTOS[2], MOCK_PHOTOS[3], MOCK_PHOTOS[4]],
    dpe: 'C', ges: 'C', dpeValue: 155, gesValue: 29,
    features: ['Ascenseur', 'Parking', 'Cave', 'Balcon', 'Interphone'],
    amenities: ['Canal du Midi à 10min', 'Écoles à 5min'],
    isNew: false, isExclusive: false, isFeatured: false, isPriceReduced: true,
    publishedAt: new Date('2024-08-15'), updatedAt: new Date('2024-11-05'),
    agent: { id: 'a2', name: 'Imoblex', phone: '06.81.76.30.94', email: 'contact@imoblex.fr' }
  },
  {
    id: '6', reference: 'IMB-2024-006', title: 'Loft industriel - Compans-Caffarelli',
    description: `Magnifique loft de caractère de 95m² entièrement refait dans le style industriel chic.`,
    type: 'loft', transactionType: 'sale', status: 'active',
    price: 450000, pricePerSqm: 4737, area: 95, rooms: 2, bedrooms: 1, bathrooms: 1, floor: 5, totalFloors: 6,
    location: { addressVisible: true, city: 'Toulouse', postalCode: '31000', district: 'Compans-Caffarelli', lat: 43.6128, lng: 1.4282 },
    photos: [MOCK_PHOTOS[4], MOCK_PHOTOS[5], MOCK_PHOTOS[6]],
    dpe: 'D', ges: 'D', dpeValue: 220, gesValue: 52,
    features: ['Terrasse', 'Verrière', 'Hauts plafonds', 'Ascenseur'],
    amenities: ['Métro à 3min'],
    isNew: true, isExclusive: true, isFeatured: true, isPriceReduced: false,
    publishedAt: new Date('2024-11-10'), updatedAt: new Date('2024-11-21'),
    agent: { id: 'a3', name: 'Imoblex', phone: '05.61.61.57.38', email: 'contact@imoblex.fr' }
  },
  {
    id: '7', reference: 'IMB-2024-007', title: 'Appartement T2 - Carmes',
    description: `Charmant appartement de 48m² situé dans une maison de maître du quartier des Carmes.`,
    type: 'apartment', transactionType: 'rent', status: 'active',
    price: 980, charges: 80, area: 48, rooms: 2, bedrooms: 1, bathrooms: 1, floor: 2, totalFloors: 3,
    location: { addressVisible: false, city: 'Toulouse', postalCode: '31000', district: 'Carmes', lat: 43.5988, lng: 1.4476 },
    photos: [MOCK_PHOTOS[1], MOCK_PHOTOS[2]],
    dpe: 'E', ges: 'E', dpeValue: 260, gesValue: 55,
    features: ['Parquet', 'Moulures', 'Cave'],
    amenities: ['Marché des Carmes à 2min', 'Garonne à 10min'],
    isNew: true, isExclusive: false, isFeatured: false, isPriceReduced: false,
    publishedAt: new Date('2024-11-18'), updatedAt: new Date('2024-11-18'),
    agent: { id: 'a1', name: 'Imoblex', phone: '05.61.61.57.38', email: 'contact@imoblex.fr' }
  },
  {
    id: '8', reference: 'IMB-2024-008', title: 'Maison familiale - Colomiers',
    description: `Belle maison de 160m² avec jardin de 500m² dans un quartier résidentiel calme de Colomiers.`,
    type: 'house', transactionType: 'sale', status: 'active',
    price: 520000, pricePerSqm: 3250, area: 160, landArea: 500, rooms: 6, bedrooms: 4, bathrooms: 2,
    location: { addressVisible: false, city: 'Colomiers', postalCode: '31770', lat: 43.6108, lng: 1.3372 },
    photos: [MOCK_PHOTOS[7], MOCK_PHOTOS[0], MOCK_PHOTOS[1]],
    dpe: 'B', ges: 'B', dpeValue: 90, gesValue: 15,
    features: ['Jardin', 'Garage', 'Piscine', 'Terrasse', 'Pompe à chaleur'],
    amenities: ['Écoles à 5min', 'Commerces à 3min', 'Airbus à 10min'],
    isNew: false, isExclusive: false, isFeatured: true, isPriceReduced: false,
    publishedAt: new Date('2024-10-15'), updatedAt: new Date('2024-11-01'),
    agent: { id: 'a2', name: 'Imoblex', phone: '06.81.76.30.94', email: 'contact@imoblex.fr' }
  },
];

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = '/api/public';
  private readonly useMockData = false; // Set to true to use mock data

  private readonly TYPE_MAP: Record<string, PropertyType> = {
    APARTMENT: 'apartment', HOUSE: 'house', VILLA: 'villa', STUDIO: 'studio',
    LOFT: 'loft', DUPLEX: 'loft', LAND: 'land', COMMERCIAL: 'commercial',
    OFFICE: 'commercial', GARAGE: 'parking', PARKING: 'parking'
  };

  private readonly TYPE_LABELS: Record<string, string> = {
    APARTMENT: 'Appartement', HOUSE: 'Maison', VILLA: 'Villa', STUDIO: 'Studio',
    LOFT: 'Loft', DUPLEX: 'Duplex', LAND: 'Terrain', COMMERCIAL: 'Local commercial',
    OFFICE: 'Bureau', GARAGE: 'Garage', PARKING: 'Parking'
  };

  getFeaturedProperties(): Observable<Property[]> {
    if (this.useMockData) {
      return of(MOCK_PROPERTIES.filter(p => p.isFeatured).slice(0, 6));
    }
    const params = new HttpParams()
      .set('publicSearch', 'true')
      .set('page', '0')
      .set('size', '6')
      .set('sortBy', 'createdAt')
      .set('sortDir', 'DESC');
    return this.http.get<BackendPageResponse<BackendPropertyResponse>>(`${this.apiBase}/properties`, { params }).pipe(
      map(r => r.content.map(p => this.mapBackendProperty(p))),
      catchError(() => of(MOCK_PROPERTIES.filter(p => p.isFeatured).slice(0, 6)))
    );
  }

  searchProperties(params: PropertySearchParams): Observable<PropertySearchResult> {
    if (this.useMockData) {
      return of(this.mockSearch(params));
    }

    let httpParams = new HttpParams().set('publicSearch', 'true');

    if (params.type) {
      httpParams = httpParams.set('transactionType', params.type === 'sale' ? 'SALE' : 'RENTAL');
    }
    if (params.propertyTypes?.length) {
      const backendType = this.toBackendType(params.propertyTypes[0]);
      if (backendType) httpParams = httpParams.set('propertyType', backendType);
    }
    if (params.city) httpParams = httpParams.set('city', params.city);
    if (params.minPrice !== undefined) httpParams = httpParams.set('priceMin', params.minPrice.toString());
    if (params.maxPrice !== undefined) httpParams = httpParams.set('priceMax', params.maxPrice.toString());
    if (params.minArea !== undefined) httpParams = httpParams.set('areaMin', params.minArea.toString());
    if (params.maxArea !== undefined) httpParams = httpParams.set('areaMax', params.maxArea.toString());
    if (params.minRooms !== undefined) httpParams = httpParams.set('roomsMin', params.minRooms.toString());
    if (params.features?.includes('Parking') || params.features?.includes('Garage')) httpParams = httpParams.set('hasParking', 'true');
    if (params.features?.includes('Jardin')) httpParams = httpParams.set('hasGarden', 'true');
    if (params.features?.includes('Piscine')) httpParams = httpParams.set('hasPool', 'true');
    if (params.features?.includes('Ascenseur')) httpParams = httpParams.set('hasElevator', 'true');
    if (params.features?.includes('Balcon')) httpParams = httpParams.set('hasBalcony', 'true');
    if (params.features?.includes('Cave')) httpParams = httpParams.set('hasCellar', 'true');
    if (params.minBedrooms !== undefined) httpParams = httpParams.set('bedroomsMin', params.minBedrooms.toString());

    const page = Math.max(0, (params.page ?? 1) - 1);
    const size = params.limit ?? 12;
    httpParams = httpParams.set('page', page.toString()).set('size', size.toString());

    // Sort
    if (params.sortBy === 'price_asc') {
      httpParams = httpParams.set('sortBy', 'price').set('sortDir', 'ASC');
    } else if (params.sortBy === 'price_desc') {
      httpParams = httpParams.set('sortBy', 'price').set('sortDir', 'DESC');
    } else if (params.sortBy === 'area_desc') {
      httpParams = httpParams.set('sortBy', 'livingArea').set('sortDir', 'DESC');
    } else {
      httpParams = httpParams.set('sortBy', 'createdAt').set('sortDir', 'DESC');
    }

    return this.http.get<BackendPageResponse<BackendPropertyResponse>>(`${this.apiBase}/properties`, { params: httpParams }).pipe(
      map(r => ({
        properties: r.content.map(p => this.mapBackendProperty(p)),
        total: r.totalElements,
        page: r.page + 1,
        limit: r.size,
        totalPages: r.totalPages
      })),
      catchError(() => of(this.mockSearch(params)))
    );
  }

  getPropertyById(id: string): Observable<Property | null> {
    if (this.useMockData) {
      return of(MOCK_PROPERTIES.find(p => p.id === id) ?? null);
    }
    return this.http.get<BackendApiResponse<BackendPropertyResponse>>(`${this.apiBase}/properties/${id}`).pipe(
      map(r => this.mapBackendProperty(r.data)),
      catchError(() => of(MOCK_PROPERTIES.find(p => p.id === id) ?? null))
    );
  }

  getSimilarProperties(id: string, type: TransactionType): Observable<Property[]> {
    if (this.useMockData) {
      return of(MOCK_PROPERTIES.filter(p => p.id !== id && p.transactionType === type).slice(0, 3));
    }
    const params = new HttpParams()
      .set('publicSearch', 'true')
      .set('transactionType', type === 'sale' ? 'SALE' : 'RENTAL')
      .set('page', '0')
      .set('size', '4');
    return this.http.get<BackendPageResponse<BackendPropertyResponse>>(`${this.apiBase}/properties`, { params }).pipe(
      map(r => r.content
        .map(p => this.mapBackendProperty(p))
        .filter(p => p.id !== id)
        .slice(0, 3)
      ),
      catchError(() => of(MOCK_PROPERTIES.filter(p => p.id !== id && p.transactionType === type).slice(0, 3)))
    );
  }

  getPropertyTypes(): { value: PropertyType; label: string }[] {
    return [
      { value: 'apartment', label: 'Appartement' },
      { value: 'house', label: 'Maison' },
      { value: 'villa', label: 'Villa' },
      { value: 'studio', label: 'Studio' },
      { value: 'loft', label: 'Loft' },
      { value: 'commercial', label: 'Local commercial' },
      { value: 'land', label: 'Terrain' },
      { value: 'parking', label: 'Parking/Garage' },
    ];
  }

  formatPrice(price: number, transactionType: TransactionType): string {
    const formatted = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);
    return transactionType === 'rent' ? `${formatted}/mois` : formatted;
  }

  getPropertyTypeLabel(type: PropertyType): string {
    return this.getPropertyTypes().find(t => t.value === type)?.label ?? type;
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private mapBackendProperty(p: BackendPropertyResponse): Property {
    const typeKey = p.propertyType?.toUpperCase() || 'APARTMENT';
    const frontendType: PropertyType = this.TYPE_MAP[typeKey] || 'apartment';

    const txType = p.transactionType?.toUpperCase();
    const transactionType: TransactionType = (txType === 'SALE') ? 'sale' : 'rent';

    const statusMap: Record<string, Property['status']> = {
      AVAILABLE: 'active', DRAFT: 'active', OFF_MARKET: 'active',
      SOLD: 'sold', RENTED: 'rented', UNDER_OFFER: 'under_offer'
    };
    const status = statusMap[p.status?.toUpperCase() || ''] ?? 'active';

    const typeLabel = this.TYPE_LABELS[typeKey] || typeKey;
    const title = [typeLabel, p.rooms ? `${p.rooms} pièces` : null, p.city].filter(Boolean).join(' - ');

    // Build features array from booleans
    const features: string[] = [];
    if (p.elevator) features.push('Ascenseur');
    if (p.parking || p.garage) features.push('Parking');
    if (p.garden) features.push('Jardin');
    if (p.pool) features.push('Piscine');
    if (p.balcony) features.push('Balcon');
    if (p.terrace) features.push('Terrasse');
    if (p.cellar) features.push('Cave');
    if (p.furnished) features.push('Meublé');
    if (p.fireplace) features.push('Cheminée');
    if (p.airConditioning) features.push('Climatisation');

    const publishedDate = p.publishedAt ? new Date(p.publishedAt) : new Date(p.createdAt || Date.now());
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const isNew = publishedDate > thirtyDaysAgo;

    return {
      id: p.id,
      reference: p.reference,
      title,
      description: p.description || p.shortDescription || '',
      type: frontendType,
      transactionType,
      status,
      price: p.price || 0,
      pricePerSqm: p.pricePerSqm,
      area: p.livingArea || 0,
      landArea: p.landArea,
      rooms: p.rooms || 1,
      bedrooms: p.bedrooms || 0,
      bathrooms: p.bathrooms || 0,
      floor: p.floor,
      totalFloors: p.totalFloors,
      location: {
        address: p.addressVisible ? p.address : undefined,
        addressVisible: p.addressVisible || false,
        city: p.city || '',
        postalCode: p.postalCode || '',
        district: p.department,
        lat: p.latitude || 0,
        lng: p.longitude || 0
      },
      photos: (p.photos || []).map(ph => ph.url),
      dpe: p.dpeClass as Property['dpe'],
      ges: p.gesClass as Property['ges'],
      dpeValue: p.dpeValue,
      gesValue: p.gesValue,
      features,
      amenities: [],
      isNew,
      isExclusive: false,
      isFeatured: false,
      isPriceReduced: false,
      charges: p.rentCharges,
      publishedAt: publishedDate,
      updatedAt: new Date(p.updatedAt || p.createdAt || Date.now()),
      agent: p.agentName ? {
        id: p.agentId || '',
        name: p.agentName,
        phone: p.agentPhone || '',
        email: p.agentEmail || ''
      } : undefined
    };
  }

  private toBackendType(frontendType: PropertyType): string | null {
    const map: Record<PropertyType, string> = {
      apartment: 'APARTMENT', house: 'HOUSE', villa: 'VILLA', studio: 'STUDIO',
      loft: 'LOFT', commercial: 'COMMERCIAL', land: 'LAND', parking: 'PARKING'
    };
    return map[frontendType] || null;
  }

  private mockSearch(params: PropertySearchParams): PropertySearchResult {
    let filtered = [...MOCK_PROPERTIES];
    if (params.type) filtered = filtered.filter(p => p.transactionType === params.type);
    if (params.city) filtered = filtered.filter(p => p.location.city.toLowerCase().includes(params.city!.toLowerCase()));
    if (params.propertyTypes?.length) filtered = filtered.filter(p => params.propertyTypes!.includes(p.type));
    if (params.minPrice !== undefined) filtered = filtered.filter(p => p.price >= params.minPrice!);
    if (params.maxPrice !== undefined) filtered = filtered.filter(p => p.price <= params.maxPrice!);
    if (params.minArea !== undefined) filtered = filtered.filter(p => p.area >= params.minArea!);
    if (params.maxArea !== undefined) filtered = filtered.filter(p => p.area <= params.maxArea!);
    if (params.minRooms !== undefined) filtered = filtered.filter(p => p.rooms >= params.minRooms!);

    if (params.sortBy === 'price_asc') filtered.sort((a, b) => a.price - b.price);
    else if (params.sortBy === 'price_desc') filtered.sort((a, b) => b.price - a.price);
    else if (params.sortBy === 'area_desc') filtered.sort((a, b) => b.area - a.area);
    else filtered.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

    const page = params.page ?? 1;
    const limit = params.limit ?? 12;
    const start = (page - 1) * limit;

    return {
      properties: filtered.slice(start, start + limit),
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    };
  }
}
