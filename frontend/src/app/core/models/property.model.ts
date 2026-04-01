import { PropertyType, PropertyStatus, DpeClass, TransactionType } from './enums';
import { User } from './user.model';

export interface PropertyPhoto {
  id: string;
  url: string;
  thumbnailUrl: string;
  caption?: string;
  isPrimary: boolean;
  order: number;
  uploadedAt: Date;
}

export interface PropertyAddress {
  street: string;
  streetNumber?: string;
  city: string;
  postalCode: string;
  department?: string;
  region?: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface PropertyFeatures {
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  toilets?: number;
  surface: number;
  landSurface?: number;
  floor?: number;
  totalFloors?: number;
  constructionYear?: number;
  hasParking: boolean;
  hasGarage: boolean;
  hasGarden: boolean;
  hasPool: boolean;
  hasBalcony: boolean;
  hasTerrace: boolean;
  hasCellar: boolean;
  hasElevator: boolean;
  isGroundFloor: boolean;
  orientation?: string;
  heatingType?: string;
  heatingEnergy?: string;
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
  monthlyCharges?: number;
  agencyFees?: number;
  agencyFeesIncluded: boolean;
  address: PropertyAddress;
  features: PropertyFeatures;
  dpe?: DpeClass;
  ges?: DpeClass;
  photos: PropertyPhoto[];
  tags?: string[];
  isPublished: boolean;
  publishedAt?: Date;
  assignedAgent?: User;
  agentId?: string;
  ownerId?: string;
  ownerName?: string;
  createdAt: Date;
  updatedAt: Date;
  visitCount?: number;
  favoriteCount?: number;
  notes?: string;
}

export interface PropertySearchRequest {
  query?: string;
  type?: PropertyType[];
  status?: PropertyStatus[];
  transactionType?: TransactionType;
  minPrice?: number;
  maxPrice?: number;
  minSurface?: number;
  maxSurface?: number;
  minRooms?: number;
  maxRooms?: number;
  city?: string;
  postalCode?: string;
  agentId?: string;
  isPublished?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PropertySearchResponse {
  items: Property[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
