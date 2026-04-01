import { MandateType, MandateStatus, TransactionType } from './enums';
import { Property } from './property.model';
import { Contact } from './contact.model';
import { User } from './user.model';

export interface Mandate {
  id: string;
  reference: string;
  type: MandateType;
  status: MandateStatus;
  transactionType: TransactionType;
  property?: Property;
  propertyId: string;
  propertyReference?: string;
  propertyAddress?: string;
  mandator?: Contact;
  mandatorId: string;
  mandatorName?: string;
  agent?: User;
  agentId: string;
  agentName?: string;
  price: number;
  agencyFeePercent: number;
  agencyFeeAmount: number;
  startDate: Date;
  endDate: Date;
  renewalDate?: Date;
  exclusivityEndDate?: Date;
  signedAt?: Date;
  signedAtPlace?: string;
  notes?: string;
  conditions?: string;
  isRenewable: boolean;
  renewalCount: number;
  createdAt: Date;
  updatedAt: Date;
  daysRemaining?: number;
  isExpiringSoon?: boolean;
}
