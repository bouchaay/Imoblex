import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-page">
      <div class="page-header">
        <h1 class="page-title">Paramètres</h1>
        <p class="page-subtitle">Gestion du compte et préférences</p>
      </div>

      <div class="settings-layout">
        <!-- Settings nav -->
        <nav class="settings-nav">
          @for (item of navItems; track item.key) {
            <button class="nav-item" [class.active]="activeSection === item.key" (click)="activeSection = item.key">
              <i class="pi {{ item.icon }}"></i>
              {{ item.label }}
            </button>
          }
        </nav>

        <!-- Settings content -->
        <div class="settings-content">

          @if (activeSection === 'profile') {
            <div class="settings-card">
              <h3 class="settings-section-title">Profil utilisateur</h3>

              @if (profileMessage()) {
                <div class="alert" [class.alert-success]="profileSuccess()" [class.alert-error]="!profileSuccess()">
                  <i class="pi" [class.pi-check-circle]="profileSuccess()" [class.pi-exclamation-circle]="!profileSuccess()"></i>
                  {{ profileMessage() }}
                </div>
              }

              <div class="avatar-section">
                <img [src]="profileForm.avatarUrl || 'https://ui-avatars.com/api/?name=User&background=1B4F72&color=fff&size=128'" alt="Avatar" class="settings-avatar" />
                <div>
                  <button class="btn-secondary"><i class="pi pi-camera"></i> Changer la photo</button>
                  <p class="hint">JPG, PNG — Max 2 Mo</p>
                </div>
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Prénom</label>
                  <input type="text" class="form-input" [(ngModel)]="profileForm.firstName" name="firstName" />
                </div>
                <div class="form-group">
                  <label class="form-label">Nom</label>
                  <input type="text" class="form-input" [(ngModel)]="profileForm.lastName" name="lastName" />
                </div>
                <div class="form-group">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-input" [(ngModel)]="profileForm.email" name="email" />
                </div>
                <div class="form-group">
                  <label class="form-label">Téléphone</label>
                  <input type="tel" class="form-input" [(ngModel)]="profileForm.phone" name="phone" />
                </div>
                <div class="form-group">
                  <label class="form-label">Mobile</label>
                  <input type="tel" class="form-input" [(ngModel)]="profileForm.mobile" name="mobile" />
                </div>
                <div class="form-group">
                  <label class="form-label">Rôle</label>
                  <input type="text" class="form-input" [value]="profileForm.role" readonly style="background:#f1f5f9; color:#64748b;" />
                </div>
              </div>
              <div class="form-actions">
                <button class="btn-primary" (click)="saveProfile()" [disabled]="profileLoading()">
                  <i class="pi" [class.pi-spin]="profileLoading()" [class.pi-spinner]="profileLoading()" [class.pi-save]="!profileLoading()"></i>
                  {{ profileLoading() ? 'Enregistrement...' : 'Enregistrer' }}
                </button>
              </div>
            </div>
          }

          @if (activeSection === 'agency') {
            <div class="settings-card">
              <h3 class="settings-section-title">Informations de l'agence</h3>
              <div class="form-grid">
                <div class="form-group" style="grid-column: 1/-1">
                  <label class="form-label">Nom de l'agence</label>
                  <input type="text" class="form-input" [(ngModel)]="agencyForm.name" name="agencyName" />
                </div>
                <div class="form-group">
                  <label class="form-label">N° SIRET</label>
                  <input type="text" class="form-input" [(ngModel)]="agencyForm.siret" name="siret" placeholder="XXX XXX XXX XXXXX" />
                </div>
                <div class="form-group">
                  <label class="form-label">Carte professionnelle</label>
                  <input type="text" class="form-input" [(ngModel)]="agencyForm.proCard" name="proCard" placeholder="CPI XXXXX-XXXX" />
                </div>
                <div class="form-group">
                  <label class="form-label">Adresse</label>
                  <input type="text" class="form-input" [(ngModel)]="agencyForm.address" name="agencyAddress" placeholder="123 Rue de la Paix" />
                </div>
                <div class="form-group">
                  <label class="form-label">Ville</label>
                  <input type="text" class="form-input" [(ngModel)]="agencyForm.city" name="agencyCity" />
                </div>
                <div class="form-group">
                  <label class="form-label">Email agence</label>
                  <input type="email" class="form-input" [(ngModel)]="agencyForm.email" name="agencyEmail" />
                </div>
                <div class="form-group">
                  <label class="form-label">Téléphone agence</label>
                  <input type="tel" class="form-input" [(ngModel)]="agencyForm.phone" name="agencyPhone" />
                </div>
              </div>
              <div class="form-actions">
                <button class="btn-primary" (click)="saveAgency()">
                  <i class="pi pi-save"></i> Enregistrer
                </button>
              </div>
            </div>
          }

          @if (activeSection === 'notifications') {
            <div class="settings-card">
              <h3 class="settings-section-title">Préférences de notifications</h3>
              <div class="notif-options">
                @for (notif of notificationOptions; track notif.key) {
                  <div class="notif-row">
                    <div class="notif-info">
                      <div class="notif-label">{{ notif.label }}</div>
                      <div class="notif-desc">{{ notif.desc }}</div>
                    </div>
                    <div class="toggle-switches">
                      <label class="toggle-label">
                        <span class="toggle-name">Email</span>
                        <input type="checkbox" [(ngModel)]="notif.email" />
                        <span class="toggle-track" [class.on]="notif.email"></span>
                      </label>
                      <label class="toggle-label">
                        <span class="toggle-name">Push</span>
                        <input type="checkbox" [(ngModel)]="notif.push" />
                        <span class="toggle-track" [class.on]="notif.push"></span>
                      </label>
                    </div>
                  </div>
                }
              </div>
              <div class="form-actions" style="margin-top:1rem">
                <button class="btn-primary" (click)="saveNotifications()">
                  <i class="pi pi-save"></i> Enregistrer les préférences
                </button>
              </div>
            </div>
          }

          @if (activeSection === 'security') {
            <div class="settings-card">
              <h3 class="settings-section-title">Sécurité du compte</h3>

              @if (securityMessage()) {
                <div class="alert" [class.alert-success]="securitySuccess()" [class.alert-error]="!securitySuccess()">
                  <i class="pi" [class.pi-check-circle]="securitySuccess()" [class.pi-exclamation-circle]="!securitySuccess()"></i>
                  {{ securityMessage() }}
                </div>
              }

              <div class="form-group" style="margin-bottom:1rem">
                <label class="form-label">Mot de passe actuel</label>
                <input type="password" class="form-input" [(ngModel)]="securityForm.current" name="currentPwd" placeholder="••••••••" />
              </div>
              <div class="form-group" style="margin-bottom:1rem">
                <label class="form-label">Nouveau mot de passe</label>
                <input type="password" class="form-input" [(ngModel)]="securityForm.newPwd" name="newPwd" placeholder="••••••••" />
                <span class="hint">Minimum 8 caractères avec majuscule, chiffre et caractère spécial</span>
              </div>
              <div class="form-group" style="margin-bottom:1.5rem">
                <label class="form-label">Confirmer le nouveau mot de passe</label>
                <input type="password" class="form-input" [(ngModel)]="securityForm.confirm" name="confirmPwd" placeholder="••••••••" />
              </div>
              <div class="form-actions">
                <button class="btn-primary" (click)="savePassword()" [disabled]="securityLoading()">
                  <i class="pi" [class.pi-spin]="securityLoading()" [class.pi-spinner]="securityLoading()" [class.pi-lock]="!securityLoading()"></i>
                  {{ securityLoading() ? 'Modification...' : 'Changer le mot de passe' }}
                </button>
              </div>
            </div>
          }

        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-page { animation: fadeIn 0.3s ease; max-width: 960px; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .page-header { margin-bottom: 1.5rem; }
    .page-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 0 0 0.2rem; }
    .page-subtitle { font-size: 0.875rem; color: #64748b; margin: 0; }
    .settings-layout { display: grid; grid-template-columns: 200px 1fr; gap: 1.25rem; }
    @media (max-width: 768px) { .settings-layout { grid-template-columns: 1fr; } }
    .settings-nav { background: #fff; border-radius: 12px; padding: 0.75rem; box-shadow: 0 1px 4px rgba(0,0,0,0.06); height: fit-content; display: flex; flex-direction: column; gap: 2px; }
    .nav-item { display: flex; align-items: center; gap: 0.625rem; padding: 0.625rem 0.875rem; border-radius: 8px; border: none; background: none; font-size: 0.875rem; font-weight: 500; color: #475569; cursor: pointer; width: 100%; text-align: left; transition: all 0.15s; }
    .nav-item:hover { background: #f8fafc; }
    .nav-item.active { background: rgba(27,79,114,0.08); color: #1B4F72; font-weight: 600; }
    .nav-item i { font-size: 0.9rem; }
    .settings-card { background: #fff; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
    .settings-section-title { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0 0 1.5rem; }
    .alert { padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; }
    .alert-success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
    .alert-error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .avatar-section { display: flex; align-items: center; gap: 1.25rem; margin-bottom: 1.5rem; }
    .settings-avatar { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 2px solid #e2e8f0; }
    .hint { font-size: 0.75rem; color: #94a3b8; margin: 0.35rem 0 0; }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
    .form-group { display: flex; flex-direction: column; gap: 0.35rem; }
    .form-label { font-size: 0.82rem; font-weight: 600; color: #374151; }
    .form-input { padding: 0.625rem 0.875rem; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.875rem; outline: none; background: #f8fafc; font-family: inherit; transition: border-color 0.15s; }
    .form-input:focus { border-color: #1B4F72; background: #fff; box-shadow: 0 0 0 3px rgba(27,79,114,0.08); }
    .form-actions { display: flex; justify-content: flex-end; }
    .btn-primary { display: flex; align-items: center; gap: 0.4rem; background: #1B4F72; color: #fff; border: none; padding: 0.625rem 1.25rem; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: background 0.15s; }
    .btn-primary:hover:not(:disabled) { background: #154060; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { display: flex; align-items: center; gap: 0.4rem; background: #fff; color: #475569; border: 1.5px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.875rem; cursor: pointer; }
    .notif-options { display: flex; flex-direction: column; gap: 0; }
    .notif-row { display: flex; align-items: center; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid #f1f5f9; }
    .notif-row:last-child { border-bottom: none; }
    .notif-label { font-size: 0.875rem; font-weight: 600; color: #1e293b; }
    .notif-desc { font-size: 0.78rem; color: #64748b; margin-top: 2px; }
    .toggle-switches { display: flex; gap: 1.25rem; }
    .toggle-label { display: flex; align-items: center; gap: 0.375rem; cursor: pointer; }
    .toggle-label input { display: none; }
    .toggle-name { font-size: 0.75rem; color: #64748b; }
    .toggle-track { width: 36px; height: 20px; border-radius: 10px; background: #e2e8f0; position: relative; transition: background 0.2s; }
    .toggle-track::after { content: ''; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
    .toggle-track.on { background: #1B4F72; }
    .toggle-track.on::after { transform: translateX(16px); }
  `]
})
export class SettingsComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);

  activeSection = 'profile';

  // Signals for feedback
  profileLoading = signal(false);
  profileMessage = signal('');
  profileSuccess = signal(false);

  securityLoading = signal(false);
  securityMessage = signal('');
  securitySuccess = signal(false);

  profileForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    mobile: '',
    role: '',
    avatarUrl: ''
  };

  agencyForm = {
    name: 'Imoblex',
    siret: '',
    proCard: '',
    address: '22 Rue Hyères',
    city: 'Toulouse',
    email: 'contact@imoblex.fr',
    phone: '05.61.61.57.38'
  };

  securityForm = {
    current: '',
    newPwd: '',
    confirm: ''
  };

  navItems = [
    { key: 'profile', label: 'Profil', icon: 'pi-user' },
    { key: 'agency', label: 'Agence', icon: 'pi-building' },
    { key: 'notifications', label: 'Notifications', icon: 'pi-bell' },
    { key: 'security', label: 'Sécurité', icon: 'pi-lock' }
  ];

  notificationOptions = [
    { key: 'mandate_expiry', label: 'Expiration de mandats', desc: 'Alerte 15 jours avant la date d\'expiration', email: true, push: true },
    { key: 'new_contact', label: 'Nouveau contact', desc: 'Notifié lors d\'une nouvelle demande entrante', email: true, push: false },
    { key: 'appointment', label: 'Rappels rendez-vous', desc: 'Rappel 30 minutes avant chaque rendez-vous', email: false, push: true },
    { key: 'transaction', label: 'Étapes transaction', desc: 'Notification lors d\'une mise à jour de transaction', email: true, push: true }
  ];

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.profileForm = {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
          mobile: user.mobilePhone || '',
          role: user.role || '',
          avatarUrl: user.avatarUrl || ''
        };
      }
    });
  }

  saveProfile(): void {
    const user = this.authService.currentUser;
    if (!user) return;

    this.profileLoading.set(true);
    this.profileMessage.set('');

    this.http.put<any>(`/api/users/${user.id}`, {
      firstName: this.profileForm.firstName,
      lastName: this.profileForm.lastName,
      email: this.profileForm.email,
      phone: this.profileForm.phone,
      mobile: this.profileForm.mobile
    }).subscribe({
      next: () => {
        this.profileLoading.set(false);
        this.profileSuccess.set(true);
        this.profileMessage.set('Profil mis à jour avec succès.');
        setTimeout(() => this.profileMessage.set(''), 4000);
      },
      error: (err) => {
        this.profileLoading.set(false);
        this.profileSuccess.set(false);
        this.profileMessage.set(err?.error?.message || 'Erreur lors de la mise à jour du profil.');
      }
    });
  }

  saveAgency(): void {
    // Affiche confirmation visuelle - paramètres agence gérés côté serveur via application.yml
    alert('Paramètres de l\'agence enregistrés (simulation).');
  }

  saveNotifications(): void {
    // Enregistrement local des préférences de notification
    const prefs = this.notificationOptions.reduce((acc, n) => {
      (acc as any)[n.key] = { email: n.email, push: n.push };
      return acc;
    }, {} as Record<string, { email: boolean; push: boolean }>);
    localStorage.setItem('imoblex_notif_prefs', JSON.stringify(prefs));
    alert('Préférences de notifications enregistrées.');
  }

  savePassword(): void {
    if (!this.securityForm.current || !this.securityForm.newPwd) {
      this.securitySuccess.set(false);
      this.securityMessage.set('Veuillez renseigner le mot de passe actuel et le nouveau mot de passe.');
      return;
    }
    if (this.securityForm.newPwd !== this.securityForm.confirm) {
      this.securitySuccess.set(false);
      this.securityMessage.set('Les mots de passe ne correspondent pas.');
      return;
    }
    if (this.securityForm.newPwd.length < 8) {
      this.securitySuccess.set(false);
      this.securityMessage.set('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    this.securityLoading.set(true);
    this.securityMessage.set('');

    this.authService.changePassword(this.securityForm.current, this.securityForm.newPwd).subscribe({
      next: () => {
        this.securityLoading.set(false);
        this.securitySuccess.set(true);
        this.securityMessage.set('Mot de passe modifié avec succès.');
        this.securityForm = { current: '', newPwd: '', confirm: '' };
        setTimeout(() => this.securityMessage.set(''), 4000);
      },
      error: (err) => {
        this.securityLoading.set(false);
        this.securitySuccess.set(false);
        this.securityMessage.set(err?.message || 'Erreur lors du changement de mot de passe.');
      }
    });
  }
}
