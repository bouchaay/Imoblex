import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ContactService } from '../../core/services/contact.service';
import { ContactType, TransactionType, PropertyType } from '../../core/models/enums';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly contactService = inject(ContactService);

  isSaving = false;

  form = this.fb.group({
    civility: [''],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    type: ['BUYER', Validators.required],
    email: ['', Validators.email],
    mobilePhone: [''],
    city: [''],
    source: ['']
  });

  onSave(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSaving = true;
    const fv = this.form.value;
    this.contactService.create({
      civility: fv.civility as any,
      firstName: fv.firstName!,
      lastName: fv.lastName!,
      type: fv.type as ContactType,
      email: fv.email || undefined,
      mobilePhone: fv.mobilePhone || undefined,
      address: { city: fv.city || undefined },
      source: fv.source || undefined
    }).subscribe(() => this.router.navigate(['/contacts']));
  }
}
