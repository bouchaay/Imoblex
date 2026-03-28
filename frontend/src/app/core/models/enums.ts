export enum PropertyType {
  APARTMENT = 'APARTMENT',
  HOUSE = 'HOUSE',
  VILLA = 'VILLA',
  STUDIO = 'STUDIO',
  LOFT = 'LOFT',
  DUPLEX = 'DUPLEX',
  LAND = 'LAND',
  COMMERCIAL = 'COMMERCIAL',
  OFFICE = 'OFFICE',
  GARAGE = 'GARAGE',
  PARKING = 'PARKING'
}

export enum PropertyStatus {
  AVAILABLE = 'AVAILABLE',
  UNDER_OFFER = 'UNDER_OFFER',
  SOLD = 'SOLD',
  RENTED = 'RENTED',
  OFF_MARKET = 'OFF_MARKET',
  DRAFT = 'DRAFT'
}

export enum TransactionType {
  SALE = 'SALE',
  RENTAL = 'RENTAL',
  SEASONAL_RENTAL = 'SEASONAL_RENTAL'
}

export enum ContactType {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  TENANT = 'TENANT',
  LANDLORD = 'LANDLORD',
  PROSPECT = 'PROSPECT',
  PARTNER = 'PARTNER'
}

export enum MandateType {
  EXCLUSIVE = 'EXCLUSIVE',
  SIMPLE = 'SIMPLE',
  SEMI_EXCLUSIVE = 'SEMI_EXCLUSIVE'
}

export enum MandateStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  SUSPENDED = 'SUSPENDED',
  COMPLETED = 'COMPLETED'
}

export enum TransactionStatus {
  PROSPECTION = 'PROSPECTION',
  VISIT = 'VISIT',
  OFFER = 'OFFER',
  NEGOTIATION = 'NEGOTIATION',
  COMPROMIS = 'COMPROMIS',
  FINANCEMENT = 'FINANCEMENT',
  ACTE = 'ACTE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum AppointmentType {
  VISIT = 'VISIT',
  SIGNING = 'SIGNING',
  ESTIMATION = 'ESTIMATION',
  PHONE_CALL = 'PHONE_CALL',
  MEETING = 'MEETING',
  NOTARY = 'NOTARY'
}

export enum DpeClass {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G'
}

export enum Role {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  MANAGER = 'MANAGER',
  ASSISTANT = 'ASSISTANT'
}

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  [PropertyType.APARTMENT]: 'Appartement',
  [PropertyType.HOUSE]: 'Maison',
  [PropertyType.VILLA]: 'Villa',
  [PropertyType.STUDIO]: 'Studio',
  [PropertyType.LOFT]: 'Loft',
  [PropertyType.DUPLEX]: 'Duplex',
  [PropertyType.LAND]: 'Terrain',
  [PropertyType.COMMERCIAL]: 'Local commercial',
  [PropertyType.OFFICE]: 'Bureau',
  [PropertyType.GARAGE]: 'Garage',
  [PropertyType.PARKING]: 'Parking'
};

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  [PropertyStatus.AVAILABLE]: 'Disponible',
  [PropertyStatus.UNDER_OFFER]: 'Sous offre',
  [PropertyStatus.SOLD]: 'Vendu',
  [PropertyStatus.RENTED]: 'Loué',
  [PropertyStatus.OFF_MARKET]: 'Hors marché',
  [PropertyStatus.DRAFT]: 'Brouillon'
};

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  [ContactType.BUYER]: 'Acheteur',
  [ContactType.SELLER]: 'Vendeur',
  [ContactType.TENANT]: 'Locataire',
  [ContactType.LANDLORD]: 'Propriétaire',
  [ContactType.PROSPECT]: 'Prospect',
  [ContactType.PARTNER]: 'Partenaire'
};

export const MANDATE_TYPE_LABELS: Record<MandateType, string> = {
  [MandateType.EXCLUSIVE]: 'Exclusif',
  [MandateType.SIMPLE]: 'Simple',
  [MandateType.SEMI_EXCLUSIVE]: 'Semi-exclusif'
};

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  [TransactionStatus.PROSPECTION]: 'Prospection',
  [TransactionStatus.VISIT]: 'Visite',
  [TransactionStatus.OFFER]: 'Offre',
  [TransactionStatus.NEGOTIATION]: 'Négociation',
  [TransactionStatus.COMPROMIS]: 'Compromis',
  [TransactionStatus.FINANCEMENT]: 'Financement',
  [TransactionStatus.ACTE]: 'Acte',
  [TransactionStatus.COMPLETED]: 'Finalisé',
  [TransactionStatus.CANCELLED]: 'Annulé'
};

export const DPE_COLORS: Record<DpeClass, string> = {
  [DpeClass.A]: '#009b77',
  [DpeClass.B]: '#5ec15a',
  [DpeClass.C]: '#aad048',
  [DpeClass.D]: '#f5c800',
  [DpeClass.E]: '#f39200',
  [DpeClass.F]: '#e8500a',
  [DpeClass.G]: '#cc0000'
};
