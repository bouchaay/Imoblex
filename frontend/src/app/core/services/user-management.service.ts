import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ManagedUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  title?: string;
  role: 'ADMIN' | 'USER';
  avatarUrl?: string;
  enabled: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface CreateUserPayload {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'USER';
  title?: string;
  phone?: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  title?: string;
  role?: 'ADMIN' | 'USER';
  newPassword?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  getAll(): Observable<ManagedUser[]> {
    return this.http.get<ApiResponse<ManagedUser[]>>(this.apiUrl).pipe(
      map(r => r.data)
    );
  }

  create(payload: CreateUserPayload): Observable<ManagedUser> {
    return this.http.post<ApiResponse<ManagedUser>>(this.apiUrl, payload).pipe(
      map(r => r.data)
    );
  }

  update(id: string, payload: UpdateUserPayload): Observable<ManagedUser> {
    return this.http.put<ApiResponse<ManagedUser>>(`${this.apiUrl}/${id}`, payload).pipe(
      map(r => r.data)
    );
  }

  disable(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  enable(id: string): Observable<ManagedUser> {
    return this.http.post<ApiResponse<ManagedUser>>(`${this.apiUrl}/${id}/enable`, {}).pipe(
      map(r => r.data)
    );
  }

  deletePermanent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/permanent`);
  }
}
