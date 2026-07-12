import { Injectable, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

function passwordMatch(ctrl: AbstractControl) {
  const p = ctrl.get('password')?.value;
  const c = ctrl.get('confirmPassword')?.value;
  return p === c ? null : { mismatch: true };
}

@Injectable()
export class SignupViewModel {
  private fb          = inject(FormBuilder);
  private router      = inject(Router);
  private authService = inject(AuthService);

  isLoading = this.authService.isLoading.asReadonly();
  error     = this.authService.error.asReadonly();
  showPwd   = signal(false);

  form: FormGroup = this.fb.group({
    firstName:       ['', Validators.required],
    lastName:        ['', Validators.required],
    email:           ['', [Validators.required, Validators.email]],
    password:        ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordMatch });

  /** Individual rule checks — used by the template checklist */
  get requirements() {
    const p: string = this.form.get('password')?.value || '';
    return {
      length:  p.length >= 8,
      upper:   /[A-Z]/.test(p),
      digit:   /\d/.test(p),
      special: /[^A-Za-z0-9]/.test(p),
    };
  }

  /** 0–4 score, capped to 3 for the three-bar display */
  get strength(): number {
    const r = this.requirements;
    const score = [r.length, r.upper, r.digit, r.special].filter(Boolean).length;
    // 0-1 met → weak(1), 2-3 met → medium(2), all 4 met → strong(3)
    if (score === 0) return 0;
    if (score === 1) return 1;
    if (score <= 3)  return 2;
    return 3;
  }

  /** Strength label key — resolved in the template via t() */
  get strengthKey(): 'pwdWeak' | 'pwdMedium' | 'pwdStrong' | '' {
    return (['', 'pwdWeak', 'pwdMedium', 'pwdStrong'] as const)[this.strength] || '';
  }

  togglePasswordVisibility(): void { this.showPwd.update(v => !v); }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  async submit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const success = await this.authService.signup({
      ...this.form.value,
      role: 'operator',
    });
    if (success) this.router.navigate(['/auth/login']);
  }
}
