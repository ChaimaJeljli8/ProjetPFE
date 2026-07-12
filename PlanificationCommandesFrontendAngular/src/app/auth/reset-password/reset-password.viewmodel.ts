import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

function passwordMatch(ctrl: AbstractControl) {
  const p = ctrl.get('newPassword')?.value;
  const c = ctrl.get('confirmPassword')?.value;
  return p === c ? null : { mismatch: true };
}

@Injectable()
export class ResetPasswordViewModel implements OnDestroy {
  private fb     = inject(FormBuilder);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private auth   = inject(AuthService);

  isLoading = this.auth.isLoading.asReadonly();
  error     = this.auth.error.asReadonly();

  showPwd     = signal(false);
  done        = signal(false);
  tokenValid  = signal(true);

  private email = '';
  private token = '';

  form: FormGroup = this.fb.group(
    {
      newPassword:     ['', [Validators.required, Validators.minLength(8),
                             Validators.pattern(/(?=.*[A-Z])(?=.*\d)/)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatch }
  );

  init(): void {
    // Extract from URL (email only, token goes to sessionStorage)
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
    const urlToken = this.route.snapshot.queryParamMap.get('token') ?? '';

    if (!this.email || !urlToken) {
      this.tokenValid.set(false);
      return;
    }

    // Move token to sessionStorage & clean URL immediately
    this.token = urlToken;
    sessionStorage.setItem('resetToken', urlToken);

    // Remove token from URL bar (browser history)
    window.history.replaceState(
      {},
      document.title,
      `${window.location.pathname}?email=${encodeURIComponent(this.email)}`
    );
  }

  get pwdValue(): string {
    return this.form.get('newPassword')?.value || '';
  }

  get ruleMinLength(): boolean {
    return this.pwdValue.length >= 8;
  }

  get ruleUppercase(): boolean {
    return /[A-Z]/.test(this.pwdValue);
  }

  get ruleDigit(): boolean {
    return /\d/.test(this.pwdValue);
  }

  get strength(): number {
    const p = this.pwdValue;
    let s = 0;
    if (p.length >= 8)                        s++;
    if (/[A-Z]/.test(p) && /\d/.test(p))     s++;
    if (/[^A-Za-z0-9]/.test(p))              s++;
    return s;
  }

  get strengthLabel(): string {
    return ['', 'Faible', 'Moyen', 'Fort'][this.strength] || '';
  }

  togglePasswordVisibility(): void {
    this.showPwd.update(v => !v);
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  async submit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const success = await this.auth.resetPassword(
      this.email,
      this.token,
      this.form.value.newPassword
    );

    if (success) {
      this.done.set(true);
    }
  }

  goToLogin(): void {
    sessionStorage.removeItem('resetToken');
    this.router.navigate(['/auth/login']);
  }

  // Cleanup on component destroy
  ngOnDestroy(): void {
    sessionStorage.removeItem('resetToken');
  }
}
