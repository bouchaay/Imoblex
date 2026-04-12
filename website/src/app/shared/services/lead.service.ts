import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LeadSubmitPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message?: string;
  propertyReference?: string;
  formType?: string;
  gdprConsent: boolean;
}

@Injectable({ providedIn: 'root' })
export class LeadService {
  private readonly http = inject(HttpClient);

  submit(payload: LeadSubmitPayload): Observable<any> {
    return this.http.post('/public/leads', payload);
  }
}
