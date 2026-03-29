import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-form.component.html'
})
export class ContactFormComponent {
  @Input() title = '';
  @Input() submitLabel = '';
  @Input() showPropertyRef = false;
  @Input() propertyRefPlaceholder = '';
  @Input() messagePlaceholder = '';

  submitted = signal(false);

  formData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    propertyRef: '',
    message: '',
    gdpr: false,
  };

  onSubmit(): void {
    // In production: send to API
    console.log('Form submitted:', this.formData);
    this.submitted.set(true);
  }

  reset(): void {
    this.submitted.set(false);
    this.formData = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      propertyRef: '',
      message: '',
      gdpr: false,
    };
  }
}
