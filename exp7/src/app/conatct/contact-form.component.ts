import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.css'],
})
export class ContactFormComponent {
  submitted = false; // true after the user clicks "Send message"
  sent = false;      // true after a valid submission

  // Build the form model: each control has a starting value and validators.
  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
    consent: [false, Validators.requiredTrue],
  });

  constructor(private fb: FormBuilder) {}

  // Shortcut so the template can write f['email'] instead of form.controls['email'].
  get f() {
    return this.form.controls;
  }

  // Show an error once the field was touched or the form was submitted.
  showError(name: 'name' | 'email' | 'subject' | 'message' | 'consent'): boolean {
    const c = this.f[name];
    return c.invalid && (c.touched || this.submitted);
  }

  onSubmit(): void {
    this.submitted = true;
    this.sent = false;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Replace with a real request, e.g. this.http.post('/api/contact', this.form.value)
    console.log('Contact form:', this.form.value);

    this.sent = true;
    this.submitted = false;
    this.form.reset({ consent: false });
  }
}
