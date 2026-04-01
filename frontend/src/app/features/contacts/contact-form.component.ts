import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ContactService } from '../../core/services/contact.service';
import { ContactType } from '../../core/models/enums';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly contactService = inject(ContactService);

  isSaving = false;
  isEditMode = false;
  contactId: string | null = null;
  isLoading = false;

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

  ngOnInit(): void {
    this.contactId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.contactId;

    if (this.isEditMode && this.contactId) {
      this.isLoading = true;
      this.contactService.getById(this.contactId).subscribe({
        next: contact => {
          this.form.patchValue({
            civility: contact.civility || '',
            firstName: contact.firstName,
            lastName: contact.lastName,
            type: contact.type,
            email: contact.email || '',
            mobilePhone: contact.mobilePhone || contact.phone || '',
            city: contact.address?.city || '',
            source: contact.source || ''
          });
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.router.navigate(['/contacts']);
        }
      });
    }
  }

  onSave(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSaving = true;
    const fv = this.form.value;

    const payload = {
      civility: fv.civility as any,
      firstName: fv.firstName!,
      lastName: fv.lastName!,
      type: fv.type as ContactType,
      email: fv.email || undefined,
      mobilePhone: fv.mobilePhone || undefined,
      address: { city: fv.city || undefined },
      source: fv.source || undefined
    };

    const op$ = this.isEditMode && this.contactId
      ? this.contactService.update(this.contactId, payload)
      : this.contactService.create(payload);

    op$.subscribe({
      next: () => {
        this.contactService.notifyChange();
        this.router.navigate(['/contacts']);
      },
      error: () => { this.isSaving = false; }
    });
  }
}
