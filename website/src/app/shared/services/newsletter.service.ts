import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NewsletterSubscribePayload {
  email: string;
  city?: string;
  transactionType?: string;
  minBudget?: number;
  maxBudget?: number;
  propertyTypes?: string;
  gdprConsent: boolean;
}

@Injectable({ providedIn: 'root' })
export class NewsletterService {
  private readonly http = inject(HttpClient);

  subscribe(payload: NewsletterSubscribePayload): Observable<{ status: string }> {
    return this.http.post<{ status: string }>('/public/newsletter/subscribe', payload);
  }
}
