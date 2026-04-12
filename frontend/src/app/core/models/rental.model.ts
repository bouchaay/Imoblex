export type LeaseStatus = 'ACTIVE' | 'PENDING' | 'TERMINATED' | 'SUSPENDED' | 'UNPAID';
export type LeaseType = 'UNFURNISHED' | 'FURNISHED' | 'SEASONAL' | 'OTHER';
export type PaymentStatus = 'PAID' | 'PARTIAL' | 'PENDING' | 'LATE' | 'UNPAID';
export type PaymentMethod = 'TRANSFER' | 'CASH' | 'CHECK' | 'DIRECT_DEBIT' | 'OTHER';

export interface RentalLease {
  id: string;
  propertyId: string;
  propertyReference: string;
  propertyAddress: string;
  propertyCity: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  landlordId?: string;
  landlordName?: string;
  agentId?: string;
  agentName?: string;
  leaseType: LeaseType;
  status: LeaseStatus;
  startDate: string;
  endDate?: string;
  rentAmount: number;
  chargesAmount: number;
  totalRent: number;
  depositAmount: number;
  paymentDayOfMonth: number;
  paymentMethod: PaymentMethod;
  renewalDate?: string;
  notes?: string;
  totalPayments: number;
  paidPayments: number;
  currentMonthStatus?: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RentalPayment {
  id: string;
  leaseId: string;
  paymentMonth: number;
  paymentYear: number;
  expectedAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentDate?: string;
  dueDate?: string;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  reference?: string;
  notes?: string;
  quittanceGeneratedAt?: string;
  createdAt: string;
}

export interface RentalLeaseRequest {
  propertyId: string;
  tenantId: string;
  landlordId?: string;
  agentId?: string;
  leaseType: LeaseType;
  status: LeaseStatus;
  startDate: string;
  endDate?: string;
  rentAmount: number;
  chargesAmount: number;
  depositAmount: number;
  paymentDayOfMonth: number;
  paymentMethod: PaymentMethod;
  renewalDate?: string;
  notes?: string;
}

export interface RentalPaymentRequest {
  paymentMonth: number;
  paymentYear: number;
  expectedAmount: number;
  paidAmount: number;
  paymentDate?: string;
  dueDate?: string;
  paymentMethod?: PaymentMethod;
  reference?: string;
  notes?: string;
}
