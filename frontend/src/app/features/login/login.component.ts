import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <!-- Left panel - branding -->
      <div class="login-left">
        <div class="login-left-content">
          <div class="brand-logo">
            <div class="brand-icon">
              <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                <path d="M16 3L3 14h4v15h7v-9h4v9h7V14h4L16 3z" fill="#F39C12"/>
              </svg>
            </div>
            <div class="brand-text">
              <span class="brand-name">IMOBLEX</span>
              <span class="brand-tagline">Excellence Immobilière</span>
            </div>
          </div>

          <div class="hero-content">
            <h1 class="hero-title">Gérez votre agence<br/>avec <span class="highlight">élégance</span></h1>
            <p class="hero-desc">Plateforme CRM complète pour les professionnels de l'immobilier. Mandats, biens, contacts et transactions en un seul endroit.</p>

            <div class="features-list">
              @for (feature of features; track feature.icon) {
                <div class="feature-item">
                  <div class="feature-icon-wrap">
                    <i class="pi {{ feature.icon }}"></i>
                  </div>
                  <span>{{ feature.text }}</span>
                </div>
              }
            </div>
          </div>

          <div class="stats-row">
            @for (stat of stats; track stat.label) {
              <div class="stat-card">
                <span class="stat-value">{{ stat.value }}</span>
                <span class="stat-label">{{ stat.label }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Decorative shapes -->
        <div class="deco-circle deco-1"></div>
        <div class="deco-circle deco-2"></div>
        <div class="deco-circle deco-3"></div>
      </div>

      <!-- Right panel - form -->
      <div class="login-right">
        <div class="login-form-wrapper">
          <!-- Mobile logo -->
          <div class="mobile-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 3L3 14h4v15h7v-9h4v9h7V14h4L16 3z" fill="#F39C12"/>
            </svg>
            <span class="brand-name-mobile">IMOBLEX</span>
          </div>

          <div class="form-header">
            <h2 class="form-title">Bon retour !</h2>
            <p class="form-subtitle">Connectez-vous à votre espace de gestion</p>
          </div>

          @if (errorMessage()) {
            <div class="error-alert">
              <i class="pi pi-exclamation-circle"></i>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <form class="login-form" (ngSubmit)="onSubmit()" #form="ngForm">
            <div class="form-group">
              <label class="form-label">Adresse email</label>
              <div class="input-wrapper">
                <i class="pi pi-envelope input-icon"></i>
                <input
                  type="email"
                  name="email"
                  [(ngModel)]="credentials.email"
                  required
                  email
                  placeholder="votre@email.fr"
                  class="form-input"
                  [class.input-error]="form.submitted && !credentials.email"
                  autocomplete="email"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <span>Mot de passe</span>
                <a href="#" class="forgot-link" (click)="$event.preventDefault()">Mot de passe oublié ?</a>
              </label>
              <div class="input-wrapper">
                <i class="pi pi-lock input-icon"></i>
                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  name="password"
                  [(ngModel)]="credentials.password"
                  required
                  placeholder="••••••••"
                  class="form-input"
                  [class.input-error]="form.submitted && !credentials.password"
                  autocomplete="current-password"
                />
                <button type="button" class="toggle-password" (click)="showPassword.set(!showPassword())">
                  <i class="pi" [class.pi-eye]="!showPassword()" [class.pi-eye-slash]="showPassword()"></i>
                </button>
              </div>
            </div>

            <div class="form-options">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="credentials.rememberMe" name="rememberMe" />
                <span class="checkbox-custom"></span>
                <span>Se souvenir de moi</span>
              </label>
            </div>

            <button
              type="submit"
              class="submit-btn"
              [class.loading]="isLoading()"
              [disabled]="isLoading()"
            >
              @if (isLoading()) {
                <span class="spinner"></span>
                <span>Connexion en cours...</span>
              } @else {
                <i class="pi pi-sign-in"></i>
                <span>Se connecter</span>
              }
            </button>
          </form>

          <!-- Demo credentials hint -->
          <div class="demo-hint">
            <i class="pi pi-info-circle"></i>
            <div>
              <strong>Démo :</strong> Entrez n'importe quel email et mot de passe pour accéder.
            </div>
          </div>

          <p class="login-footer">
            © 2024 Imoblex — Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    * { box-sizing: border-box; }

    .login-page {
      display: flex;
      min-height: 100vh;
      background: #f8fafc;
    }

    /* Left panel */
    .login-left {
      flex: 1;
      background: linear-gradient(145deg, #0f1f3d 0%, #1B2744 40%, #1B4F72 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      padding: 3rem;
    }

    @media (max-width: 900px) {
      .login-left { display: none; }
      .login-right { width: 100%; }
    }

    .login-left-content {
      position: relative;
      z-index: 2;
      max-width: 480px;
      width: 100%;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      margin-bottom: 4rem;
    }

    .brand-icon {
      width: 56px; height: 56px;
      background: rgba(243,156,18,0.15);
      border: 1px solid rgba(243,156,18,0.3);
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
    }

    .brand-name {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 800;
      font-size: 1.5rem;
      color: #ffffff;
      letter-spacing: 0.1em;
      display: block;
    }

    .brand-tagline {
      font-size: 0.75rem;
      color: rgba(255,255,255,0.4);
      letter-spacing: 0.05em;
      display: block;
    }

    .hero-title {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 2.8rem;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.15;
      margin: 0 0 1rem;
    }

    .highlight {
      color: #F39C12;
      position: relative;
    }

    .hero-desc {
      font-size: 1rem;
      color: rgba(255,255,255,0.55);
      line-height: 1.65;
      margin: 0 0 2.5rem;
    }

    .features-list {
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
      margin-bottom: 3rem;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      color: rgba(255,255,255,0.75);
      font-size: 0.9rem;
    }

    .feature-icon-wrap {
      width: 36px; height: 36px;
      background: rgba(243,156,18,0.12);
      border: 1px solid rgba(243,156,18,0.2);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      color: #F39C12;
      flex-shrink: 0;
      font-size: 0.85rem;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .stat-card {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 1rem;
      text-align: center;
    }

    .stat-value {
      display: block;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 1.5rem;
      font-weight: 800;
      color: #F39C12;
    }

    .stat-label {
      display: block;
      font-size: 0.72rem;
      color: rgba(255,255,255,0.4);
      margin-top: 2px;
    }

    /* Decorative circles */
    .deco-circle {
      position: absolute;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.05);
    }
    .deco-1 { width: 400px; height: 400px; top: -100px; right: -150px; }
    .deco-2 { width: 250px; height: 250px; bottom: 50px; right: 80px; border-color: rgba(243,156,18,0.1); }
    .deco-3 { width: 150px; height: 150px; bottom: 200px; left: -50px; border-color: rgba(255,255,255,0.08); }

    /* Right panel */
    .login-right {
      width: 480px;
      min-width: 480px;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem 2.5rem;
      box-shadow: -4px 0 40px rgba(0,0,0,0.06);
    }

    @media (max-width: 900px) {
      .login-right { width: 100%; min-width: 0; }
    }

    .login-form-wrapper {
      width: 100%;
      max-width: 380px;
    }

    .mobile-logo {
      display: none;
      align-items: center;
      gap: 0.625rem;
      margin-bottom: 2rem;
      justify-content: center;
    }

    @media (max-width: 900px) {
      .mobile-logo { display: flex; }
    }

    .brand-name-mobile {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 800;
      font-size: 1.2rem;
      color: #1B4F72;
      letter-spacing: 0.1em;
    }

    .form-header { margin-bottom: 2rem; }

    .form-title {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 1.75rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 0.5rem;
    }

    .form-subtitle {
      font-size: 0.9rem;
      color: #64748b;
      margin: 0;
    }

    /* Error alert */
    .error-alert {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      background: rgba(239,68,68,0.08);
      border: 1px solid rgba(239,68,68,0.2);
      border-radius: 10px;
      padding: 0.75rem 1rem;
      color: #dc2626;
      font-size: 0.875rem;
      margin-bottom: 1.25rem;
    }

    /* Form */
    .login-form { display: flex; flex-direction: column; gap: 1.125rem; }

    .form-group { display: flex; flex-direction: column; gap: 0.4rem; }

    .form-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #374151;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .forgot-link {
      font-size: 0.78rem;
      color: #1B4F72;
      text-decoration: none;
      font-weight: 500;
    }
    .forgot-link:hover { text-decoration: underline; }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 0.875rem;
      color: #94a3b8;
      font-size: 0.9rem;
      pointer-events: none;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem 2.75rem 0.75rem 2.75rem;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      font-size: 0.9rem;
      color: #1e293b;
      background: #f8fafc;
      outline: none;
      transition: all 0.2s;
      font-family: inherit;
    }

    .form-input:focus {
      border-color: #1B4F72;
      background: #fff;
      box-shadow: 0 0 0 3px rgba(27,79,114,0.1);
    }

    .form-input::placeholder { color: #cbd5e1; }

    .form-input.input-error { border-color: #ef4444; }

    .toggle-password {
      position: absolute;
      right: 0.875rem;
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 4px;
      font-size: 0.9rem;
    }
    .toggle-password:hover { color: #475569; }

    .form-options { margin-top: -0.25rem; }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-size: 0.85rem;
      color: #475569;
    }

    .checkbox-label input[type="checkbox"] { display: none; }

    .checkbox-custom {
      width: 18px; height: 18px;
      border: 1.5px solid #cbd5e1;
      border-radius: 4px;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.15s;
      flex-shrink: 0;
    }

    .checkbox-label input:checked + .checkbox-custom {
      background: #1B4F72;
      border-color: #1B4F72;
    }

    .checkbox-label input:checked + .checkbox-custom::after {
      content: '✓';
      color: #fff;
      font-size: 0.7rem;
      font-weight: 700;
    }

    .submit-btn {
      width: 100%;
      padding: 0.875rem;
      background: linear-gradient(135deg, #1B4F72 0%, #2E86C1 100%);
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s;
      margin-top: 0.5rem;
      font-family: inherit;
    }

    .submit-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #164469 0%, #2478ab 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 20px rgba(27,79,114,0.35);
    }

    .submit-btn:active { transform: translateY(0); }
    .submit-btn:disabled { opacity: 0.75; cursor: not-allowed; }

    .submit-btn.loading { background: #64748b; }

    .spinner {
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Demo hint */
    .demo-hint {
      display: flex;
      gap: 0.625rem;
      background: rgba(27,79,114,0.06);
      border: 1px solid rgba(27,79,114,0.12);
      border-radius: 10px;
      padding: 0.75rem 1rem;
      font-size: 0.8rem;
      color: #475569;
      margin-top: 1.5rem;
      line-height: 1.45;
    }

    .demo-hint i { color: #1B4F72; margin-top: 1px; flex-shrink: 0; }

    .login-footer {
      text-align: center;
      color: #94a3b8;
      font-size: 0.75rem;
      margin-top: 2rem;
    }
  `]
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  credentials = { email: '', password: '', rememberMe: false };
  isLoading = signal(false);
  showPassword = signal(false);
  errorMessage = signal('');

  features = [
    { icon: 'pi-building', text: 'Gestion complète de vos biens immobiliers' },
    { icon: 'pi-file-edit', text: 'Suivi des mandats et leur renouvellement' },
    { icon: 'pi-chart-line', text: 'Pipeline de transactions en temps réel' },
    { icon: 'pi-calendar', text: 'Agenda et planification des visites' }
  ];

  stats = [
    { value: '2,400+', label: 'Agences' },
    { value: '98%', label: 'Satisfaction' },
    { value: '45k+', label: 'Biens gérés' }
  ];

  onSubmit(): void {
    this.errorMessage.set('');
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage.set('Veuillez remplir tous les champs.');
      return;
    }
    this.isLoading.set(true);
    this.authService.login(this.credentials).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.errorMessage.set('Identifiants incorrects. Veuillez réessayer.');
        this.isLoading.set(false);
      }
    });
  }
}
