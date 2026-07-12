import { Injectable, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Injectable()
export class LoginViewModel {
  private fb     = inject(FormBuilder);
  private router = inject(Router);
  private auth   = inject(AuthService);

  isLoading = signal(false);
  error     = signal<string | null>(null);
  showPwd   = signal(false);

  private readonly REDIRECT_MAP: Record<string, string> = {
    Admin:                    '/admin/users',
    PlanificationResponsable: '/machines',
    Worker:                   '/worker',
  };

  form: FormGroup = this.fb.group({
    email:      ['', [Validators.required, Validators.email]],
    password:   ['', Validators.required],
    rememberMe: [false],
  });

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  togglePasswordVisibility(): void { this.showPwd.update(v => !v); }

  async submit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      const ok = await this.auth.login({
        email:      this.form.value.email,
        password:   this.form.value.password,
        rememberMe: this.form.value.rememberMe,
      });

      if (!ok) {
        this.error.set(this.auth.error() ?? 'Email ou mot de passe incorrect.');
        return;
      }

      const role = this.auth.currentUser()?.role ?? '';
      this.router.navigate([this.REDIRECT_MAP[role] ?? '/auth/login']);
    } catch {
      this.error.set('Impossible de contacter le serveur.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
