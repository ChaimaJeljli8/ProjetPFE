import { Injectable, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';

@Injectable()
export class ForgotPasswordViewModel {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  isLoading = this.authService.isLoading.asReadonly();
  sent = signal(false);
  sentEmail = signal('');

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  async submit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const email = this.form.value.email;
    this.sentEmail.set(email);
    await this.authService.sendPasswordReset(email);
    this.sent.set(true);
  }
}
