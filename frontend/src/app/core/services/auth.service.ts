import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { AuthRequest, AuthResponse } from '../models/auth.model';
import { User } from '../models/user.model';
import { Role } from '../models/enums';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly TOKEN_KEY = 'imoblex_token';
  private readonly USER_KEY = 'imoblex_user';

  private currentUserSubject = new BehaviorSubject<User | null>(this.loadUserFromStorage());
  currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(!!this.loadUserFromStorage());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private readonly apiUrl = '/api';

  // Mock user for development
  private readonly mockUser: User = {
    id: '1',
    firstName: 'Sophie',
    lastName: 'Moreau',
    email: 'sophie.moreau@imoblex.fr',
    phone: '+33 1 42 68 53 21',
    mobilePhone: '+33 6 12 34 56 78',
    role: Role.MANAGER,
    avatarUrl: 'https://ui-avatars.com/api/?name=Sophie+Moreau&background=1B4F72&color=fff&size=128',
    agencyId: 'agency_1',
    agencyName: 'Imoblex Paris 8ème',
    isActive: true,
    lastLoginAt: new Date(),
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date(),
    get fullName() { return `${this.firstName} ${this.lastName}`; }
  };

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  get token(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  login(request: AuthRequest): Observable<AuthResponse> {
    // Mock login for development
    return new Observable(observer => {
      setTimeout(() => {
        if (request.email && request.password) {
          const response: AuthResponse = {
            accessToken: 'mock_jwt_token_' + Date.now(),
            refreshToken: 'mock_refresh_token',
            expiresIn: 3600,
            tokenType: 'Bearer',
            user: this.mockUser
          };
          this.handleAuthSuccess(response);
          observer.next(response);
          observer.complete();
        } else {
          observer.error({ status: 401, message: 'Identifiants invalides' });
        }
      }, 800);
    });
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.accessToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);
  }

  private loadUserFromStorage(): User | null {
    try {
      const stored = localStorage.getItem(this.USER_KEY);
      if (stored) {
        const user = JSON.parse(stored) as User;
        // Re-add the getter
        Object.defineProperty(user, 'fullName', {
          get() { return `${this.firstName} ${this.lastName}`; }
        });
        return user;
      }
    } catch {
      // ignore
    }
    return null;
  }

  hasRole(role: Role): boolean {
    return this.currentUser?.role === role;
  }

  hasAnyRole(...roles: Role[]): boolean {
    return roles.includes(this.currentUser?.role as Role);
  }
}
