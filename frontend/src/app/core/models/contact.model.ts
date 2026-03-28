import { ContactType, PropertyType, TransactionType } from './enums';
import { User } from './user.model';

export interface SearchCriteria {
  transactionType?: TransactionType;
  propertyTypes?: PropertyType[];
  minBudget?: number;
  maxBudget?: number;
  minSurface?: number;
  maxSurface?: number;
  minRooms?: number;
  maxRooms?: number;
  cities?: string[];
  departments?: string[];
  hasParking?: boolean;
  hasGarden?: boolean;
  hasPool?: boolean;
  notes?: string;
}

export interface ContactInteraction {
  id: string;
  contactId: string;
  type: 'call' | 'email' | 'visit' | 'meeting' | 'note';
  date: Date;
  subject?: string;
  notes: string;
  agentId: string;
  agent?: User;
  propertyId?: string;
}

export interface Contact {
  id: string;
  reference: string;
  civility?: 'M' | 'Mme' | 'Dr' | 'Me';
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  type: ContactType;
  types?: ContactType[];
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  company?: string;
  searchCriteria?: SearchCriteria;
  assignedAgent?: User;
  agentId?: string;
  source?: string;
  rating?: number;
  isVip?: boolean;
  gdprConsent?: boolean;
  gdprConsentDate?: Date;
  notes?: string;
  tags?: string[];
  interactions?: ContactInteraction[];
  interactionCount?: number;
  lastInteractionAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
