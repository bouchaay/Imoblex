import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
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
