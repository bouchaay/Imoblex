import { Role } from './enums';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
  role: Role;
  avatarUrl?: string;
  agencyId?: string;
  agencyName?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  readonly fullName?: string;
}

export interface UserProfile extends Omit<User, 'fullName'> {
  preferences?: {
    language: string;
    theme: 'light' | 'dark';
    notifications: {
      email: boolean;
      push: boolean;
      mandateExpiry: boolean;
      newContact: boolean;
      appointmentReminder: boolean;
    };
  };
}
