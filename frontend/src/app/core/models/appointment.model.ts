import { AppointmentType } from './enums';
import { Property } from './property.model';
import { Contact } from './contact.model';
import { User } from './user.model';

export interface Appointment {
  id: string;
  title: string;
  type: AppointmentType;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  location?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  property?: Property;
  propertyId?: string;
  propertyReference?: string;
  contact?: Contact;
  contactId?: string;
  contactName?: string;
  agent?: User;
  agentId: string;
  agentName?: string;
  attendees?: string[];
  reminderMinutes?: number;
  isConfirmed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
