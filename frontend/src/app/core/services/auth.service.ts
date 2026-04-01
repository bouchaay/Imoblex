import { environment } from '../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User } from '../models/user.model';
import { Role } from '../models/enums';

interface LoginRequest {
  agencyCode: string;
  username: string;
  password: string;
}

interface BackendUserResponse {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobile?: string;
  avatarUrl?: string;
  title?: string;
  role: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

interface BackendAuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: BackendUserResponse;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly TOKEN_KEY = 'imoblex_token';
  private readonly USER_KEY = 'imoblex_user';
  private readonly apiUrl = environment.apiUrl;

  private currentUserSubject = new BehaviorSubject<User | null>(this.loadUserFromStorage());
  currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(!!this.loadUserFromStorage());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  get currentUser(): User | null { return this.currentUserSubject.value; }
  get isAuthenticated(): boolean { return this.isAuthenticatedSubject.value; }
  get token(): string | null { return localStorage.getItem(this.TOKEN_KEY); }

  login(request: LoginRequest): Observable<BackendAuthResponse> {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    return this.http.post<ApiResponse<BackendAuthResponse>>(`${this.apiUrl}/auth/login`, request).pipe(
      map(response => {
        const auth = response.data;
        const user = this.mapUser(auth.user);
        this.handleAuthSuccess(auth.accessToken, user);
        return auth;
      }),
      catchError(err => {
        const message = err.error?.message || 'Identifiants invalides.';
        return throwError(() => ({ status: err.status, message }));
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/auth/change-password`, {
      currentPassword, newPassword, confirmPassword: newPassword
    }).pipe(
      map(() => undefined as void),
      catchError(err => throwError(() => ({
        status: err.status,
        message: err.error?.message || 'Erreur lors du changement de mot de passe'
      })))
    );
  }

  private mapUser(u: BackendUserResponse): User {
    return {
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      mobilePhone: u.mobile,
      role: u.role as Role,
      avatarUrl: u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.firstName + '+' + u.lastName)}&background=1B4F72&color=fff&size=128`,
      agencyName: 'Imoblex',
      isActive: u.enabled,
      lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt) : new Date(),
      createdAt: new Date(u.createdAt),
      updatedAt: new Date(u.updatedAt),
      get fullName() { return `${this.firstName} ${this.lastName}`; }
    };
  }

  private handleAuthSuccess(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  private loadUserFromStorage(): User | null {
    try {
      const stored = localStorage.getItem(this.USER_KEY);
      if (stored) {
        const user = JSON.parse(stored) as User;
        Object.defineProperty(user, 'fullName', {
          get() { return `${this.firstName} ${this.lastName}`; },
          configurable: true
        });
        return user;
      }
    } catch { /* ignore */ }
    return null;
  }

  hasRole(role: Role): boolean { return this.currentUser?.role === role; }
  hasAnyRole(...roles: Role[]): boolean { return roles.includes(this.currentUser?.role as Role); }
}
