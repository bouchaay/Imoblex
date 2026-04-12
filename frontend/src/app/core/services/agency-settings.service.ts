import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface AgencySettings {
  id?: string;
  name?: string;
  representativeName?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  email?: string;
  phone?: string;
  website?: string;
  siret?: string;
  professionalCardNumber?: string;
  prefecture?: string;
  guaranteeAmount?: string;
  guaranteeInsurer?: string;
  signatureImagePath?: string;
  logoPath?: string;
}

interface ApiResponse<T> { success: boolean; data: T; }

@Injectable({ providedIn: 'root' })
export class AgencySettingsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/agency-settings`;

  get(): Observable<AgencySettings> {
    return this.http.get<ApiResponse<AgencySettings>>(this.apiUrl).pipe(map(r => r.data));
  }

  update(settings: AgencySettings): Observable<AgencySettings> {
    return this.http.put<ApiResponse<AgencySettings>>(this.apiUrl, settings).pipe(map(r => r.data));
  }

  uploadSignature(file: File): Observable<AgencySettings> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<ApiResponse<AgencySettings>>(`${this.apiUrl}/signature`, form).pipe(map(r => r.data));
  }

  uploadLogo(file: File): Observable<AgencySettings> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<ApiResponse<AgencySettings>>(`${this.apiUrl}/logo`, form).pipe(map(r => r.data));
  }
}
