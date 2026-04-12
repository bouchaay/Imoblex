import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserManagementService, ManagedUser, CreateUserPayload, UpdateUserPayload } from '../../core/services/user-management.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  private readonly userService = inject(UserManagementService);
  readonly authService = inject(AuthService);

  users = signal<ManagedUser[]>([]);
  loading = signal(false);
  saving = signal(false);
  showModal = signal(false);
  editingUser = signal<ManagedUser | null>(null);
  confirmDisableId = signal<string | null>(null);
  confirmDeleteId = signal<string | null>(null);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);

  // Form fields
  form = {
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    title: '',
    role: 'USER' as 'ADMIN' | 'USER'
  };

  // Computed stats
  totalCount   = computed(() => this.users().length);
  adminCount   = computed(() => this.users().filter(u => u.role === 'ADMIN').length);
  activeCount  = computed(() => this.users().filter(u => u.enabled).length);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.userService.getAll().subscribe({
      next: list => { this.users.set(list); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openCreate(): void {
    this.editingUser.set(null);
    this.form = { username: '', password: '', firstName: '', lastName: '', email: '', phone: '', title: '', role: 'USER' };
    this.errorMsg.set(null);
    this.showModal.set(true);
  }

  openEdit(user: ManagedUser): void {
    this.editingUser.set(user);
    this.form = {
      username: user.username,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      title: user.title || '',
      role: user.role
    };
    this.errorMsg.set(null);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingUser.set(null);
    this.errorMsg.set(null);
  }

  onSave(): void {
    this.errorMsg.set(null);
    const editing = this.editingUser();

    if (editing) {
      const payload: UpdateUserPayload = {
        firstName: this.form.firstName,
        lastName: this.form.lastName,
        phone: this.form.phone || undefined,
        title: this.form.title || undefined,
        role: this.form.role,
        newPassword: this.form.password || undefined
      };
      this.saving.set(true);
      this.userService.update(editing.id, payload).subscribe({
        next: updated => {
          this.users.update(list => list.map(u => u.id === updated.id ? updated : u));
          this.saving.set(false);
          this.closeModal();
          this.showSuccess('Utilisateur mis à jour avec succès');
        },
        error: err => {
          this.saving.set(false);
          this.errorMsg.set(err?.error?.message || 'Erreur lors de la mise à jour');
        }
      });
    } else {
      if (!this.form.username || !this.form.password || !this.form.firstName || !this.form.lastName || !this.form.email) {
        this.errorMsg.set('Veuillez remplir tous les champs obligatoires');
        return;
      }
      const payload: CreateUserPayload = {
        username: this.form.username,
        password: this.form.password,
        firstName: this.form.firstName,
        lastName: this.form.lastName,
        email: this.form.email,
        phone: this.form.phone || undefined,
        title: this.form.title || undefined,
        role: this.form.role
      };
      this.saving.set(true);
      this.userService.create(payload).subscribe({
        next: created => {
          this.users.update(list => [created, ...list]);
          this.saving.set(false);
          this.closeModal();
          this.showSuccess('Utilisateur créé avec succès');
        },
        error: err => {
          this.saving.set(false);
          this.errorMsg.set(err?.error?.message || 'Erreur lors de la création');
        }
      });
    }
  }

  requestDisable(id: string): void {
    this.confirmDisableId.set(id);
  }

  cancelDisable(): void {
    this.confirmDisableId.set(null);
  }

  confirmDisable(): void {
    const id = this.confirmDisableId();
    if (!id) return;
    this.userService.disable(id).subscribe({
      next: () => {
        this.users.update(list => list.map(u => u.id === id ? { ...u, enabled: false } : u));
        this.confirmDisableId.set(null);
        this.showSuccess('Utilisateur désactivé');
      }
    });
  }

  requestDelete(id: string): void {
    this.confirmDeleteId.set(id);
  }

  cancelDelete(): void {
    this.confirmDeleteId.set(null);
  }

  confirmDelete(): void {
    const id = this.confirmDeleteId();
    if (!id) return;
    this.userService.deletePermanent(id).subscribe({
      next: () => {
        this.users.update(list => list.filter(u => u.id !== id));
        this.confirmDeleteId.set(null);
        this.showSuccess('Utilisateur supprimé définitivement');
      }
    });
  }

  enableUser(id: string): void {
    this.userService.enable(id).subscribe({
      next: updated => {
        this.users.update(list => list.map(u => u.id === updated.id ? updated : u));
        this.showSuccess('Utilisateur réactivé');
      }
    });
  }

  isSelf(user: ManagedUser): boolean {
    return this.authService.currentUser?.id === user.id;
  }

  getRoleLabel(role: string): string {
    return role === 'ADMIN' ? 'Administrateur' : 'Collaborateur';
  }

  getInitials(user: ManagedUser): string {
    return `${user.firstName[0] || ''}${user.lastName[0] || ''}`.toUpperCase();
  }

  private showSuccess(msg: string): void {
    this.successMsg.set(msg);
    setTimeout(() => this.successMsg.set(null), 3500);
  }
}
