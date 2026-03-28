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

// --- Mock data for development ---
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
    id: '1',
    reference: 'IMB-2024-001',
    title: 'Appartement lumineux - Capitole',
    description: `Superbe appartement entièrement rénové situé au cœur de Toulouse, à deux pas du Capitole. Lumineux et spacieux, il offre une belle vue sur les toits de la Ville Rose.\n\nCet appartement de caractère dispose d'une entrée avec placards, un vaste séjour traversant de 35m², une cuisine équipée ouverte, deux chambres spacieuses, une salle de bains et des toilettes séparées.\n\nParquet en chêne, double vitrage, gardien, ascenseur et cave complètent ce bien d'exception. Idéalement situé à proximité des commerces, transports et restaurants.`,
    type: 'apartment',
    transactionType: 'sale',
    status: 'active',
    price: 385000,
    pricePerSqm: 6417,
    area: 60,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    floor: 4,
    totalFloors: 6,
    location: {
      address: '12 Rue Saint-Rome',
      addressVisible: true,
      city: 'Toulouse',
      postalCode: '31000',
      district: 'Capitole',
      lat: 43.6043,
      lng: 1.4437,
    },
    photos: [MOCK_PHOTOS[0], MOCK_PHOTOS[1], MOCK_PHOTOS[2], MOCK_PHOTOS[3]],
    dpe: 'C',
    ges: 'D',
    dpeValue: 148,
    gesValue: 32,
    features: ['Ascenseur', 'Gardien', 'Cave', 'Parquet', 'Double vitrage'],
    amenities: ['Métro à 5min', 'Commerces à 2min', 'Capitole à 10min à pied'],
    isNew: true,
    isExclusive: true,
    isFeatured: true,
    isPriceReduced: false,
    publishedAt: new Date('2024-11-15'),
    updatedAt: new Date('2024-11-20'),
    agent: { id: 'a1', name: 'Sophie Martin', phone: '05 61 00 00 01', email: 'sophie@imoblex.fr' },
  },
  {
    id: '2',
    reference: 'IMB-2024-002',
    title: 'Villa contemporaine avec piscine',
    description: `Magnifique villa contemporaine de 180m² sur un terrain de 800m² entièrement clôturé avec piscine chauffée. Construite en 2018, elle offre des prestations haut de gamme.\n\nRez-de-chaussée : vaste séjour/salle à manger de 60m² avec cuisine ouverte entièrement équipée, dressing, chambre parentale avec salle de bains privative, toilettes. Étage : 3 chambres, salle de bains, bureau.\n\nDouble garage, piscine 10x5m chauffée, terrasse couverte, système domotique, panneaux solaires.`,
    type: 'villa',
    transactionType: 'sale',
    status: 'active',
    price: 895000,
    pricePerSqm: 4972,
    area: 180,
    landArea: 800,
    rooms: 7,
    bedrooms: 4,
    bathrooms: 3,
    location: {
      addressVisible: false,
      city: 'Toulouse',
      postalCode: '31400',
      district: 'Rangueil',
      lat: 43.5672,
      lng: 1.4621,
    },
    photos: [MOCK_PHOTOS[5], MOCK_PHOTOS[6], MOCK_PHOTOS[7], MOCK_PHOTOS[0]],
    dpe: 'B',
    ges: 'A',
    dpeValue: 85,
    gesValue: 12,
    features: ['Piscine', 'Garage double', 'Domotique', 'Panneaux solaires', 'Terrasse', 'Jardin'],
    amenities: ['Écoles à 5min', 'Accès A61 à 10min'],
    isNew: false,
    isExclusive: true,
    isFeatured: true,
    isPriceReduced: false,
    publishedAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-11-18'),
    agent: { id: 'a2', name: 'Marc Dupont', phone: '05 61 00 00 02', email: 'marc@imoblex.fr' },
  },
  {
    id: '3',
    reference: 'IMB-2024-003',
    title: 'Studio meublé - Université Paul Sabatier',
    description: `Studio entièrement meublé et équipé, idéal pour étudiant ou investissement locatif. Lumineux, bien agencé, en parfait état.\n\nSitué à 5 minutes à pied de l'Université Paul Sabatier et du métro Rangueil.`,
    type: 'studio',
    transactionType: 'rent',
    status: 'active',
    price: 590,
    charges: 60,
    area: 22,
    rooms: 1,
    bedrooms: 0,
    bathrooms: 1,
    floor: 2,
    totalFloors: 4,
    location: {
      addressVisible: true,
      city: 'Toulouse',
      postalCode: '31400',
      district: 'Rangueil',
      lat: 43.5601,
      lng: 1.4691,
    },
    photos: [MOCK_PHOTOS[3], MOCK_PHOTOS[4]],
    dpe: 'D',
    ges: 'D',
    dpeValue: 210,
    gesValue: 45,
    features: ['Meublé', 'Équipé', 'Double vitrage'],
    amenities: ['Métro à 5min', 'Université à 5min'],
    isNew: false,
    isExclusive: false,
    isFeatured: false,
    isPriceReduced: false,
    publishedAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-10'),
    agent: { id: 'a1', name: 'Sophie Martin', phone: '05 61 00 00 01', email: 'sophie@imoblex.fr' },
  },
  {
    id: '4',
    reference: 'IMB-2024-004',
    title: 'Maison de ville - Saint-Cyprien',
    description: `Charmante maison de ville toulousaine de 130m² entièrement rénovée avec goût dans le quartier prisé de Saint-Cyprien. Matériaux nobles, prestations soignées.\n\nRdc : séjour-cuisine 50m², wc. 1er : 2 chambres, salle de bains. 2ème : chambre parentale + salle d'eau + terrasse 20m². Cour privative 40m².`,
    type: 'house',
    transactionType: 'sale',
    status: 'active',
    price: 620000,
    pricePerSqm: 4769,
    area: 130,
    landArea: 40,
    rooms: 5,
    bedrooms: 3,
    bathrooms: 2,
    location: {
      address: '8 Rue des Fontaines',
      addressVisible: true,
      city: 'Toulouse',
      postalCode: '31300',
      district: 'Saint-Cyprien',
      lat: 43.5987,
      lng: 1.4298,
    },
    photos: [MOCK_PHOTOS[6], MOCK_PHOTOS[7], MOCK_PHOTOS[0], MOCK_PHOTOS[1]],
    dpe: 'C',
    ges: 'C',
    dpeValue: 175,
    gesValue: 28,
    features: ['Terrasse', 'Cour privative', 'Cave', 'Rénovée', 'Parquet'],
    amenities: ['Garonne à 5min', 'Commerces à 2min', 'Accès métro'],
    isNew: true,
    isExclusive: false,
    isFeatured: true,
    isPriceReduced: true,
    publishedAt: new Date('2024-09-20'),
    updatedAt: new Date('2024-11-22'),
    agent: { id: 'a3', name: 'Claire Rousseau', phone: '05 61 00 00 03', email: 'claire@imoblex.fr' },
  },
  {
    id: '5',
    reference: 'IMB-2024-005',
    title: 'Appartement T4 - Les Minimes',
    description: `Bel appartement familial de 90m² au 3ème étage avec ascenseur dans une résidence récente sécurisée. Très bien entretenu, lumineux et calme.\n\nComprend : entrée, séjour 30m², cuisine équipée, 3 chambres, 2 salles d'eau, toilettes séparées. Balcon filant de 12m², parking privatif et cave.`,
    type: 'apartment',
    transactionType: 'sale',
    status: 'active',
    price: 295000,
    pricePerSqm: 3278,
    area: 90,
    rooms: 4,
    bedrooms: 3,
    bathrooms: 2,
    floor: 3,
    totalFloors: 5,
    location: {
      addressVisible: false,
      city: 'Toulouse',
      postalCode: '31200',
      district: 'Les Minimes',
      lat: 43.6321,
      lng: 1.4489,
    },
    photos: [MOCK_PHOTOS[2], MOCK_PHOTOS[3], MOCK_PHOTOS[4]],
    dpe: 'C',
    ges: 'C',
    dpeValue: 155,
    gesValue: 29,
    features: ['Ascenseur', 'Parking', 'Cave', 'Balcon', 'Interphone'],
    amenities: ['Canal du Midi à 10min', 'Écoles à 5min'],
    isNew: false,
    isExclusive: false,
    isFeatured: false,
    isPriceReduced: true,
    publishedAt: new Date('2024-08-15'),
    updatedAt: new Date('2024-11-05'),
    agent: { id: 'a2', name: 'Marc Dupont', phone: '05 61 00 00 02', email: 'marc@imoblex.fr' },
  },
  {
    id: '6',
    reference: 'IMB-2024-006',
    title: 'Loft industriel - Compans-Caffarelli',
    description: `Magnifique loft de caractère de 95m² entièrement refait dans le style industriel chic. Hauts plafonds de 3.5m, verrières, matériaux bruts associés à un confort moderne.\n\nVaste espace de vie de 60m² ouvert sur cuisine américaine, 1 chambre avec mezzanine, salle de bains design, terrasse de 15m².`,
    type: 'loft',
    transactionType: 'sale',
    status: 'active',
    price: 450000,
    pricePerSqm: 4737,
    area: 95,
    rooms: 2,
    bedrooms: 1,
    bathrooms: 1,
    floor: 5,
    totalFloors: 6,
    location: {
      addressVisible: true,
      city: 'Toulouse',
      postalCode: '31000',
      district: 'Compans-Caffarelli',
      lat: 43.6128,
      lng: 1.4282,
    },
    photos: [MOCK_PHOTOS[4], MOCK_PHOTOS[5], MOCK_PHOTOS[6]],
    dpe: 'D',
    ges: 'D',
    dpeValue: 220,
    gesValue: 52,
    features: ['Terrasse', 'Verrière', 'Hauts plafonds', 'Ascenseur'],
    amenities: ['Métro à 3min', 'Cité de l\'espace à 15min'],
    isNew: true,
    isExclusive: true,
    isFeatured: true,
    isPriceReduced: false,
    publishedAt: new Date('2024-11-10'),
    updatedAt: new Date('2024-11-21'),
    agent: { id: 'a3', name: 'Claire Rousseau', phone: '05 61 00 00 03', email: 'claire@imoblex.fr' },
  },
  {
    id: '7',
    reference: 'IMB-2024-007',
    title: 'Appartement T2 - Carmes',
    description: `Charmant appartement de 48m² situé dans une maison de maître du quartier des Carmes. Beaux volumes, cachet préservé avec parquet ancien et moulures.`,
    type: 'apartment',
    transactionType: 'rent',
    status: 'active',
    price: 980,
    charges: 80,
    area: 48,
    rooms: 2,
    bedrooms: 1,
    bathrooms: 1,
    floor: 2,
    totalFloors: 3,
    location: {
      addressVisible: false,
      city: 'Toulouse',
      postalCode: '31000',
      district: 'Carmes',
      lat: 43.5988,
      lng: 1.4476,
    },
    photos: [MOCK_PHOTOS[1], MOCK_PHOTOS[2]],
    dpe: 'E',
    ges: 'E',
    dpeValue: 260,
    gesValue: 55,
    features: ['Parquet', 'Moulures', 'Cave'],
    amenities: ['Marché des Carmes à 2min', 'Garonne à 10min'],
    isNew: true,
    isExclusive: false,
    isFeatured: false,
    isPriceReduced: false,
    publishedAt: new Date('2024-11-18'),
    updatedAt: new Date('2024-11-18'),
    agent: { id: 'a1', name: 'Sophie Martin', phone: '05 61 00 00 01', email: 'sophie@imoblex.fr' },
  },
  {
    id: '8',
    reference: 'IMB-2024-008',
    title: 'Maison familiale - Colomiers',
    description: `Belle maison de 160m² avec jardin de 500m² dans un quartier résidentiel calme de Colomiers. Proche des écoles et commerces, idéale pour famille.`,
    type: 'house',
    transactionType: 'sale',
    status: 'active',
    price: 520000,
    pricePerSqm: 3250,
    area: 160,
    landArea: 500,
    rooms: 6,
    bedrooms: 4,
    bathrooms: 2,
    location: {
      addressVisible: false,
      city: 'Colomiers',
      postalCode: '31770',
      lat: 43.6108,
      lng: 1.3372,
    },
    photos: [MOCK_PHOTOS[7], MOCK_PHOTOS[0], MOCK_PHOTOS[1]],
    dpe: 'B',
    ges: 'B',
    dpeValue: 90,
    gesValue: 15,
    features: ['Jardin', 'Garage', 'Piscine', 'Terrasse', 'Pompe à chaleur'],
    amenities: ['Écoles à 5min', 'Commerces à 3min', 'Airbus à 10min'],
    isNew: false,
    isExclusive: false,
    isFeatured: true,
    isPriceReduced: false,
    publishedAt: new Date('2024-10-15'),
    updatedAt: new Date('2024-11-01'),
    agent: { id: 'a2', name: 'Marc Dupont', phone: '05 61 00 00 02', email: 'marc@imoblex.fr' },
  },
];

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = '/api/public';
  private readonly useMockData = true; // Set to false when API is ready

  getFeaturedProperties(): Observable<Property[]> {
    if (this.useMockData) {
      return of(MOCK_PROPERTIES.filter(p => p.isFeatured).slice(0, 6));
    }
    return this.http.get<Property[]>(`${this.apiBase}/properties/featured`).pipe(
      catchError(() => of([]))
    );
  }

  searchProperties(params: PropertySearchParams): Observable<PropertySearchResult> {
    if (this.useMockData) {
      return of(this.mockSearch(params));
    }
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => httpParams = httpParams.append(key, v));
        } else {
          httpParams = httpParams.set(key, String(value));
        }
      }
    });
    return this.http.get<PropertySearchResult>(`${this.apiBase}/properties`, { params: httpParams }).pipe(
      catchError(() => of({ properties: [], total: 0, page: 1, limit: 12, totalPages: 0 }))
    );
  }

  getPropertyById(id: string): Observable<Property | null> {
    if (this.useMockData) {
      const prop = MOCK_PROPERTIES.find(p => p.id === id) ?? null;
      return of(prop);
    }
    return this.http.get<Property>(`${this.apiBase}/properties/${id}`).pipe(
      catchError(() => of(null))
    );
  }

  getSimilarProperties(id: string, type: TransactionType): Observable<Property[]> {
    if (this.useMockData) {
      return of(MOCK_PROPERTIES.filter(p => p.id !== id && p.transactionType === type).slice(0, 3));
    }
    return this.http.get<Property[]>(`${this.apiBase}/properties/${id}/similar`).pipe(
      catchError(() => of([]))
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
    const paginated = filtered.slice(start, start + limit);

    return {
      properties: paginated,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    };
  }
}
