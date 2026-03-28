import { TransactionType, TransactionStatus } from './enums';
import { Property } from './property.model';
import { Contact } from './contact.model';
import { User } from './user.model';

export interface TransactionStep {
  id: string;
  transactionId: string;
  status: TransactionStatus;
  label: string;
  completedAt?: Date;
  dueDate?: Date;
  notes?: string;
  documents?: string[];
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface Transaction {
  id: string;
  reference: string;
  type: TransactionType;
  status: TransactionStatus;
  property?: Property;
  propertyId: string;
  buyer?: Contact;
  buyerId?: string;
  seller?: Contact;
  sellerId?: string;
  tenant?: Contact;
  tenantId?: string;
  landlord?: Contact;
  landlordId?: string;
  agent?: User;
  agentId: string;
  offerPrice?: number;
  agreedPrice?: number;
  agencyFees?: number;
  notaryFees?: number;
  steps: TransactionStep[];
  offerDate?: Date;
  compromisDate?: Date;
  actDate?: Date;
  entryDate?: Date;
  notes?: string;
  commissionAmount?: number;
  commissionPercent?: number;
  isCommissionPaid?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
