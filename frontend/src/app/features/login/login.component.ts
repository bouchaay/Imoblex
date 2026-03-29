import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
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
        this.errorMessage.set(err?.message || 'Identifiants incorrects. Vérifiez votre email et mot de passe.');
        this.isLoading.set(false);
      }
    });
  }
}
