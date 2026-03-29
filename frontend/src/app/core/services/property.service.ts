import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Property, PropertySearchRequest, PropertySearchResponse, PropertyPhoto } from '../models/property.model';
import { PropertyType, PropertyStatus, TransactionType, DpeClass } from '../models/enums';
import { MOCK_PROPERTIES } from '../mock/mock-data';

interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

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
  parkingSpaces?: number;
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
  furnished?: boolean;
  accessible?: boolean;
  heatingType?: string;
  heatingEnergy?: string;
  dpeClass?: string;
  gesClass?: string;
  dpeValue?: number;
  gesValue?: number;
  photos?: Array<{ id: string; url: string; thumbnailUrl?: string; caption?: string; position?: number }>;
  publishedWebsite?: boolean;
  publishedAt?: string;
  agentId?: string;
  agentName?: string;
  createdAt?: string;
  updatedAt?: string;
  viewCount?: number;
  visitCount?: number;
}

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/properties';

  private readonly TYPE_LABELS: Record<string, string> = {
    APARTMENT: 'Appartement', HOUSE: 'Maison', VILLA: 'Villa', STUDIO: 'Studio',
    LOFT: 'Loft', DUPLEX: 'Duplex', LAND: 'Terrain', COMMERCIAL: 'Local commercial',
    OFFICE: 'Bureau', GARAGE: 'Garage', PARKING: 'Parking'
  };

  getAll(request: PropertySearchRequest = {}): Observable<PropertySearchResponse> {
    const page = Math.max(0, (request.page || 1) - 1);
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', (request.pageSize || 12).toString())
      .set('sortBy', request.sortBy || 'createdAt')
      .set('sortDir', request.sortOrder || 'DESC');

    if (request.query) params = params.set('keyword', request.query);
    if (request.transactionType) params = params.set('transactionType', request.transactionType);
    if (request.type?.length === 1) params = params.set('propertyType', request.type[0]);
    if (request.status?.length === 1) params = params.set('status', request.status[0]);
    if (request.city) params = params.set('city', request.city);
    if (request.postalCode) params = params.set('postalCode', request.postalCode);
    if (request.minPrice) params = params.set('priceMin', request.minPrice.toString());
    if (request.maxPrice) params = params.set('priceMax', request.maxPrice.toString());
    if (request.minSurface) params = params.set('areaMin', request.minSurface.toString());
    if (request.maxSurface) params = params.set('areaMax', request.maxSurface.toString());
    if (request.minRooms) params = params.set('roomsMin', request.minRooms.toString());
    if (request.agentId) params = params.set('agentId', request.agentId);

    return this.http.get<PageResponse<BackendPropertyResponse>>(this.apiUrl, { params }).pipe(
      map(response => ({
        items: response.content.map(p => this.mapProperty(p)),
        total: response.totalElements,
        page: response.page + 1,
        pageSize: response.size,
        totalPages: response.totalPages
      })),
      catchError(() => of({ items: MOCK_PROPERTIES, total: MOCK_PROPERTIES.length, page: 1, pageSize: 12, totalPages: 1 }))
    );
  }

  getById(id: string): Observable<Property> {
    return this.http.get<ApiResponse<BackendPropertyResponse>>(`${this.apiUrl}/${id}`).pipe(
      map(r => this.mapProperty(r.data)),
      catchError(() => of(MOCK_PROPERTIES.find(p => p.id === id) ?? null as any))
    );
  }

  create(data: Partial<Property>): Observable<Property> {
    return this.http.post<ApiResponse<BackendPropertyResponse>>(this.apiUrl, this.mapToRequest(data)).pipe(
      map(r => this.mapProperty(r.data))
    );
  }

  update(id: string, data: Partial<Property>): Observable<Property> {
    return this.http.put<ApiResponse<BackendPropertyResponse>>(`${this.apiUrl}/${id}`, this.mapToRequest(data)).pipe(
      map(r => this.mapProperty(r.data))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadPhotos(id: string, files: File[]): Observable<PropertyPhoto[]> {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    return this.http.post<ApiResponse<PropertyPhoto[]>>(`${this.apiUrl}/${id}/photos`, formData).pipe(
      map(r => r.data),
      catchError(() => {
        const photos: PropertyPhoto[] = files.map((f, i) => ({
          id: 'photo_' + Date.now() + i,
          url: URL.createObjectURL(f),
          thumbnailUrl: URL.createObjectURL(f),
          caption: f.name,
          isPrimary: i === 0,
          order: i,
          uploadedAt: new Date()
        }));
        return of(photos);
      })
    );
  }

  togglePublish(id: string, publish: boolean): Observable<Property> {
    return this.http.patch<ApiResponse<BackendPropertyResponse>>(`${this.apiUrl}/${id}/publish`, {}).pipe(
      map(r => this.mapProperty(r.data))
    );
  }

  private mapProperty(p: BackendPropertyResponse): Property {
    const typeLabel = this.TYPE_LABELS[p.propertyType] || p.propertyType;
    const title = [typeLabel, p.rooms ? `${p.rooms} pièces` : null, p.city]
      .filter(Boolean).join(' - ');

    return {
      id: p.id,
      reference: p.reference,
      title,
      description: p.description || '',
      type: p.propertyType as PropertyType,
      transactionType: p.transactionType as TransactionType,
      status: p.status as PropertyStatus,
      price: p.price || 0,
      pricePerSqm: p.pricePerSqm,
      monthlyCharges: p.rentCharges,
      agencyFees: p.agencyFees,
      agencyFeesIncluded: p.chargesIncluded || false,
      address: {
        street: p.address || '',
        city: p.city || '',
        postalCode: p.postalCode || '',
        department: p.department,
        region: p.region,
        country: 'France',
        latitude: p.latitude,
        longitude: p.longitude
      },
      features: {
        rooms: p.rooms || 1,
        bedrooms: p.bedrooms || 0,
        bathrooms: p.bathrooms || 0,
        toilets: p.toilets,
        surface: p.livingArea || 0,
        landSurface: p.landArea,
        floor: p.floor,
        totalFloors: p.totalFloors,
        constructionYear: undefined,
        hasParking: p.parking || false,
        hasGarage: p.garage || false,
        hasGarden: p.garden || false,
        hasPool: p.pool || false,
        hasBalcony: p.balcony || false,
        hasTerrace: p.terrace || false,
        hasCellar: p.cellar || false,
        hasElevator: p.elevator || false,
        isGroundFloor: p.floor === 0,
        heatingType: p.heatingType,
        heatingEnergy: p.heatingEnergy
      },
      dpe: p.dpeClass as DpeClass,
      ges: p.gesClass as DpeClass,
      photos: (p.photos || []).map((ph, i) => ({
        id: ph.id,
        url: ph.url,
        thumbnailUrl: ph.thumbnailUrl || ph.url,
        caption: ph.caption,
        isPrimary: i === 0,
        order: ph.position ?? i,
        uploadedAt: new Date()
      })),
      tags: [],
      isPublished: p.publishedWebsite || false,
      publishedAt: p.publishedAt ? new Date(p.publishedAt) : undefined,
      agentId: p.agentId,
      createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
      updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      visitCount: p.visitCount || 0,
      favoriteCount: 0,
      notes: ''
    };
  }

  private mapToRequest(data: Partial<Property>): any {
    return {
      transactionType: data.transactionType,
      propertyType: data.type,
      status: data.status,
      address: data.address?.street,
      city: data.address?.city,
      postalCode: data.address?.postalCode,
      department: data.address?.department,
      region: data.address?.region,
      latitude: data.address?.latitude,
      longitude: data.address?.longitude,
      price: data.price,
      pricePerSqm: data.pricePerSqm,
      rentCharges: data.monthlyCharges,
      agencyFees: data.agencyFees,
      chargesIncluded: data.agencyFeesIncluded,
      livingArea: data.features?.surface,
      landArea: data.features?.landSurface,
      rooms: data.features?.rooms,
      bedrooms: data.features?.bedrooms,
      bathrooms: data.features?.bathrooms,
      toilets: data.features?.toilets,
      floor: data.features?.floor,
      totalFloors: data.features?.totalFloors,
      description: data.description,
      elevator: data.features?.hasElevator,
      balcony: data.features?.hasBalcony,
      terrace: data.features?.hasTerrace,
      garden: data.features?.hasGarden,
      parking: data.features?.hasParking,
      garage: data.features?.hasGarage,
      cellar: data.features?.hasCellar,
      pool: data.features?.hasPool,
      dpeClass: data.dpe,
      gesClass: data.ges,
      publishedWebsite: data.isPublished
    };
  }
}
