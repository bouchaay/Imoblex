import { Component, Input, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeadService } from '../services/lead.service';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-form.component.html'
})
export class ContactFormComponent implements OnInit {
  @Input() title = '';
  @Input() submitLabel = '';
  @Input() showPropertyRef = false;
  @Input() propertyRefPlaceholder = '';

  // Setter so the ref updates reactively when the parent changes property (e.g. clicking a similar property)
  @Input()
  set prefilledPropertyRef(val: string) {
    this._prefilledPropertyRef = val;
    if (val) {
      this.formData.propertyRef = val;
    }
  }
  get prefilledPropertyRef(): string { return this._prefilledPropertyRef; }
  private _prefilledPropertyRef = '';

  @Input() phoneRequired = false;
  @Input() messagePlaceholder = '';
  @Input() formType = 'CONTACT';

  private readonly leadService = inject(LeadService);

  submitted = signal(false);
  sending = signal(false);
  error = signal('');

  formData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    propertyRef: '',
    message: '',
    gdpr: false,
  };

  ngOnInit(): void {
    // propertyRef is already set reactively via the setter above
  }

  onSubmit(): void {
    if (this.sending()) return;
    this.sending.set(true);
    this.error.set('');

    this.leadService.submit({
      firstName: this.formData.firstName,
      lastName: this.formData.lastName,
      email: this.formData.email,
      phone: this.formData.phone || undefined,
      message: this.formData.message || undefined,
      propertyReference: this.formData.propertyRef || undefined,
      formType: this.formType,
      gdprConsent: this.formData.gdpr,
    }).subscribe({
      next: () => {
        this.sending.set(false);
        this.submitted.set(true);
      },
      error: () => {
        this.sending.set(false);
        this.error.set('Une erreur est survenue. Veuillez réessayer.');
      }
    });
  }

  reset(): void {
    this.submitted.set(false);
    this.error.set('');
    this.formData = {
      firstName: '', lastName: '', email: '',
      phone: '', propertyRef: '', message: '', gdpr: false,
    };
  }
}
