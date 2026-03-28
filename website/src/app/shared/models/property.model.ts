export type PropertyType = 'apartment' | 'house' | 'villa' | 'studio' | 'loft' | 'commercial' | 'land' | 'parking';
export type TransactionType = 'sale' | 'rent';
export type DpeClass = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
export type PropertyStatus = 'active' | 'sold' | 'rented' | 'under_offer';

export interface PropertyFeature {
  icon: string;
  label: string;
}

export interface AgentInfo {
  id: string;
  name: string;
  phone: string;
  email: string;
  photo?: string;
}

export interface PropertyLocation {
  address?: string;
  addressVisible: boolean;
  city: string;
  postalCode: string;
  district?: string;
  lat: number;
  lng: number;
}

export interface Property {
  id: string;
  reference: string;
  title: string;
  description: string;
  type: PropertyType;
  transactionType: TransactionType;
  status: PropertyStatus;
  price: number;
  pricePerSqm?: number;
  charges?: number;
  fees?: string;

  // Dimensions
  area: number;
  landArea?: number;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  floor?: number;
  totalFloors?: number;

  // Location
  location: PropertyLocation;

  // Media
  photos: string[];
  virtualTourUrl?: string;

  // Energy
  dpe: DpeClass;
  ges: DpeClass;
  dpeValue?: number;
  gesValue?: number;

  // Features & Amenities
  features: string[];
  amenities: string[];

  // Flags
  isNew: boolean;
  isExclusive: boolean;
  isFeatured: boolean;
  isPriceReduced: boolean;

  // Dates
  publishedAt: Date;
  updatedAt: Date;

  // Agent
  agent?: AgentInfo;
}

export interface PropertySearchParams {
  type?: TransactionType;
  propertyTypes?: PropertyType[];
  city?: string;
  postalCode?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  minRooms?: number;
  maxRooms?: number;
  minBedrooms?: number;
  features?: string[];
  dpe?: DpeClass[];
  sortBy?: 'price_asc' | 'price_desc' | 'date_desc' | 'area_desc' | 'relevance';
  page?: number;
  limit?: number;
}

export interface PropertySearchResult {
  properties: Property[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
