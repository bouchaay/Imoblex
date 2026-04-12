import { Component, inject, signal, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { StorageService } from '../../core/services/storage.service';
import { AgencySettingsService } from '../../core/services/agency-settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  readonly authService = inject(AuthService);
  readonly storageService = inject(StorageService);
  private readonly http = inject(HttpClient);
  private readonly agencySettingsService = inject(AgencySettingsService);

  @ViewChild('avatarInput') avatarInput!: ElementRef<HTMLInputElement>;
  @ViewChild('signatureInput') signatureInput!: ElementRef<HTMLInputElement>;
  @ViewChild('logoInput') logoInput!: ElementRef<HTMLInputElement>;

  activeSection = 'profile';

  // Profile feedback
  profileLoading = signal(false);
  profileMessage = signal('');
  profileSuccess = signal(false);

  // Security feedback
  securityLoading = signal(false);
  securityMessage = signal('');
  securitySuccess = signal(false);

  // Agency feedback
  agencyLoading = signal(false);
  agencyMessage = signal('');
  agencySuccess = signal(false);
  signatureUploading = signal(false);
  signaturePreviewUrl = signal<string | null>(null);
  logoUploading = signal(false);
  logoPreviewUrl = signal<string | null>(null);

  // Notifications feedback
  notifLoading = signal(false);
  notifMessage = signal('');
  notifSuccess = signal(false);

  profileForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    mobile: '',
    title: '',
    role: '',
    avatarUrl: ''
  };

  agencyForm = {
    name: '',
    representativeName: '',
    address: '',
    city: '',
    postalCode: '',
    email: '',
    phone: '',
    website: '',
    siret: '',
    professionalCardNumber: '',
    prefecture: '',
    guaranteeAmount: '',
    guaranteeInsurer: ''
  };

  securityForm = {
    current: '',
    newPwd: '',
    confirm: ''
  };

  navItems = [
    { key: 'profile',       label: 'Profil',         icon: 'pi-user'     },
    { key: 'agency',        label: 'Agence',          icon: 'pi-building' },
    { key: 'storage',       label: 'Stockage',        icon: 'pi-database' },
    { key: 'notifications', label: 'Notifications',   icon: 'pi-bell'     },
    { key: 'security',      label: 'Sécurité',        icon: 'pi-lock'     }
  ];

  notificationOptions = [
    { key: 'mandate_expiry', label: 'Expiration de mandats',   desc: 'Alerte 15 jours avant la date d\'expiration',           email: true,  push: true  },
    { key: 'new_contact',    label: 'Nouveau contact',          desc: 'Notifié lors d\'une nouvelle demande entrante',         email: true,  push: false },
    { key: 'appointment',    label: 'Rappels rendez-vous',      desc: 'Rappel 30 minutes avant chaque rendez-vous',            email: false, push: true  },
    { key: 'transaction',    label: 'Étapes transaction',       desc: 'Notification lors d\'une mise à jour de transaction',   email: true,  push: true  }
  ];

  ngOnInit(): void {
    this.storageService.refresh();

    // Load agency settings from API
    this.agencySettingsService.get().subscribe(s => {
      if (s.signatureImagePath) this.signaturePreviewUrl.set(s.signatureImagePath);
      if (s.logoPath) this.logoPreviewUrl.set(s.logoPath);
      this.agencyForm = {
        name: s.name || '',
        representativeName: s.representativeName || '',
        address: s.address || '',
        city: s.city || '',
        postalCode: s.postalCode || '',
        email: s.email || '',
        phone: s.phone || '',
        website: s.website || '',
        siret: s.siret || '',
        professionalCardNumber: s.professionalCardNumber || '',
        prefecture: s.prefecture || '',
        guaranteeAmount: s.guaranteeAmount || '',
        guaranteeInsurer: s.guaranteeInsurer || ''
      };
    });

    // Load user profile into form
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.profileForm = {
          firstName:  user.firstName    || '',
          lastName:   user.lastName     || '',
          email:      user.email        || '',
          phone:      user.phone        || '',
          mobile:     user.mobilePhone  || '',
          title:      (user as any).title || '',
          role:       user.role         || '',
          avatarUrl:  user.avatarUrl    || ''
        };
      }
    });

    // Restore saved notification preferences
    try {
      const saved = localStorage.getItem('imoblex_notif_prefs');
      if (saved) {
        const prefs = JSON.parse(saved) as Record<string, { email: boolean; push: boolean }>;
        this.notificationOptions.forEach(n => {
          if (prefs[n.key] !== undefined) {
            n.email = prefs[n.key].email;
            n.push  = prefs[n.key].push;
          }
        });
      }
    } catch { /* ignore */ }
  }

  // ── Avatar ────────────────────────────────────────────────────────────────

  triggerAvatarUpload(): void {
    this.avatarInput.nativeElement.click();
  }

  onAvatarSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      this.profileSuccess.set(false);
      this.profileMessage.set('L\'image ne doit pas dépasser 2 Mo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const SIZE = 256;
        canvas.width  = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext('2d')!;
        const side = Math.min(img.width, img.height);
        const ox = (img.width  - side) / 2;
        const oy = (img.height - side) / 2;
        ctx.drawImage(img, ox, oy, side, side, 0, 0, SIZE, SIZE);
        this.profileForm.avatarUrl = canvas.toDataURL('image/jpeg', 0.82);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    // Reset input so selecting the same file again triggers the event
    (event.target as HTMLInputElement).value = '';
  }

  // ── Profile ───────────────────────────────────────────────────────────────

  saveProfile(): void {
    const user = this.authService.currentUser;
    if (!user) return;

    if (!this.profileForm.firstName.trim() || !this.profileForm.lastName.trim()) {
      this.profileSuccess.set(false);
      this.profileMessage.set('Le prénom et le nom sont obligatoires.');
      return;
    }

    this.profileLoading.set(true);
    this.profileMessage.set('');

    this.http.put<any>(`/api/users/${user.id}`, {
      firstName: this.profileForm.firstName.trim(),
      lastName:  this.profileForm.lastName.trim(),
      phone:     this.profileForm.phone  || null,
      mobile:    this.profileForm.mobile || null,
      title:     this.profileForm.title  || null,
      avatarUrl: this.profileForm.avatarUrl || null
    }).subscribe({
      next: () => {
        this.profileLoading.set(false);
        this.profileSuccess.set(true);
        this.profileMessage.set('Profil mis à jour avec succès.');
        setTimeout(() => this.profileMessage.set(''), 5000);

        // Propagate changes to topbar / avatar immediately
        this.authService.updateCurrentUser({
          firstName:   this.profileForm.firstName.trim(),
          lastName:    this.profileForm.lastName.trim(),
          phone:       this.profileForm.phone  || undefined,
          mobilePhone: this.profileForm.mobile || undefined,
          avatarUrl:   this.profileForm.avatarUrl || user.avatarUrl
        });
      },
      error: (err) => {
        this.profileLoading.set(false);
        this.profileSuccess.set(false);
        this.profileMessage.set(err?.error?.message || 'Erreur lors de la mise à jour du profil.');
      }
    });
  }

  // ── Agency ────────────────────────────────────────────────────────────────

  saveAgency(): void {
    this.agencyLoading.set(true);
    this.agencyMessage.set('');
    this.agencySettingsService.update(this.agencyForm).subscribe({
      next: () => {
        this.agencyLoading.set(false);
        this.agencySuccess.set(true);
        this.agencyMessage.set('Paramètres de l\'agence enregistrés.');
        setTimeout(() => this.agencyMessage.set(''), 4000);
      },
      error: () => {
        this.agencyLoading.set(false);
        this.agencySuccess.set(false);
        this.agencyMessage.set('Erreur lors de la sauvegarde des paramètres.');
      }
    });
  }

  // ── Signature upload ──────────────────────────────────────────────────────

  triggerSignatureUpload(): void {
    this.signatureInput.nativeElement.click();
  }

  onSignatureSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // Prévisualisation locale immédiate
    const reader = new FileReader();
    reader.onload = (e) => this.signaturePreviewUrl.set(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload vers le backend
    this.signatureUploading.set(true);
    this.agencySettingsService.uploadSignature(file).subscribe({
      next: (s) => {
        this.signatureUploading.set(false);
        if (s.signatureImagePath) this.signaturePreviewUrl.set(s.signatureImagePath);
        this.agencySuccess.set(true);
        this.agencyMessage.set('Signature uploadée avec succès.');
        setTimeout(() => this.agencyMessage.set(''), 4000);
      },
      error: () => {
        this.signatureUploading.set(false);
        this.agencySuccess.set(false);
        this.agencyMessage.set('Erreur lors de l\'upload de la signature.');
      }
    });
    (event.target as HTMLInputElement).value = '';
  }

  // ── Logo upload ───────────────────────────────────────────────────────────

  triggerLogoUpload(): void {
    this.logoInput.nativeElement.click();
  }

  onLogoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => this.logoPreviewUrl.set(e.target?.result as string);
    reader.readAsDataURL(file);

    this.logoUploading.set(true);
    this.agencySettingsService.uploadLogo(file).subscribe({
      next: (s) => {
        this.logoUploading.set(false);
        if (s.logoPath) this.logoPreviewUrl.set(s.logoPath);
        this.agencySuccess.set(true);
        this.agencyMessage.set('Logo uploadé avec succès.');
        setTimeout(() => this.agencyMessage.set(''), 4000);
      },
      error: () => {
        this.logoUploading.set(false);
        this.agencySuccess.set(false);
        this.agencyMessage.set('Erreur lors de l\'upload du logo.');
      }
    });
    (event.target as HTMLInputElement).value = '';
  }

  // ── Notifications ─────────────────────────────────────────────────────────

  saveNotifications(): void {
    const prefs = this.notificationOptions.reduce((acc, n) => {
      (acc as any)[n.key] = { email: n.email, push: n.push };
      return acc;
    }, {} as Record<string, { email: boolean; push: boolean }>);
    localStorage.setItem('imoblex_notif_prefs', JSON.stringify(prefs));
    this.notifSuccess.set(true);
    this.notifMessage.set('Préférences de notifications enregistrées.');
    setTimeout(() => this.notifMessage.set(''), 4000);
  }

  // ── Password ──────────────────────────────────────────────────────────────

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
        setTimeout(() => this.securityMessage.set(''), 5000);
      },
      error: (err) => {
        this.securityLoading.set(false);
        this.securitySuccess.set(false);
        this.securityMessage.set(err?.message || 'Mot de passe actuel incorrect.');
      }
    });
  }
}
