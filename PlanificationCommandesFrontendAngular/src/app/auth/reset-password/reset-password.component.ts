import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../shared/services/language.service';
import { ResetPasswordViewModel } from './reset-password.viewmodel'

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  providers: [ResetPasswordViewModel],
  template: `
    <div class="auth-form-container">

      <!--  Invalid / expired link  -->
      <ng-container *ngIf="!vm.tokenValid()">
        <div class="success-state">
          <div class="success-icon-wrap">
            <div class="error-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9"  y1="9" x2="15" y2="15"/>
              </svg>
            </div>
          </div>
          <h2 class="form-title">{{ t().resetInvalidTitle }}</h2>
          <p class="form-subtitle">{{ t().resetInvalidDesc }}</p>
          <a routerLink="/auth/forgot-password" class="submit-btn"
             style="display:block; text-align:center; margin-top:2rem; text-decoration:none;">
            {{ t().requestNewLink }}
          </a>
        </div>
      </ng-container>

      <!-- ── Success ─────────────────────────────────────────────────────── -->
      <ng-container *ngIf="vm.tokenValid() && vm.done()">
        <div class="success-state">
          <div class="success-icon-wrap">
            <div class="success-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </div>
          <h2 class="form-title">{{ t().resetSuccessTitle }}</h2>
          <p class="form-subtitle">{{ t().resetSuccessDesc }}</p>
          <button class="submit-btn" style="margin-top:2rem; width:100%;"
                  (click)="vm.goToLogin()">
            {{ t().backToLogin }}
          </button>
        </div>
      </ng-container>

      <!-- ── Form ────────────────────────────────────────────────────────── -->
      <ng-container *ngIf="vm.tokenValid() && !vm.done()">

        <!-- Header -->
        <div class="form-header">
          <div class="form-icon-header">
            <div class="form-icon-circle">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
              </svg>
            </div>
          </div>
          <h2 class="form-title">{{ t().resetTitle }}</h2>
          <p class="form-subtitle">{{ t().resetDesc }}</p>
        </div>

        <!-- Server error -->
        <div class="alert-error" *ngIf="vm.error()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8"  x2="12"   y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ vm.error() }}
        </div>

        <form [formGroup]="vm.form" (ngSubmit)="vm.submit()" class="auth-form">

          <!-- New password -->
          <div class="field-group">
            <label class="field-label">{{ t().newPasswordLabel }}</label>
            <div class="field-wrap">
              <span class="field-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input [type]="vm.showPwd() ? 'text' : 'password'"
                     class="field-input"
                     [class.error]="vm.isInvalid('newPassword')"
                     [placeholder]="t().newPasswordPlaceholder"
                     formControlName="newPassword"/>
              <button type="button" class="field-eye"
                      (click)="vm.togglePasswordVisibility()">
                <!-- eye-off -->
                <svg *ngIf="!vm.showPwd()" width="16" height="16"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <!-- eye -->
                <svg *ngIf="vm.showPwd()" width="16" height="16"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8
                           a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12
                           4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07
                           a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>

            <!-- Strength meter -->
            <div class="password-strength"
                 *ngIf="vm.form.get('newPassword')?.value">
              <div class="strength-bars">
                <div class="s-bar"
                     [class.active]="vm.strength >= 1"
                     [class.weak]="vm.strength === 1"
                     [class.medium]="vm.strength === 2"
                     [class.strong]="vm.strength >= 3"></div>
                <div class="s-bar"
                     [class.active]="vm.strength >= 2"
                     [class.medium]="vm.strength === 2"
                     [class.strong]="vm.strength >= 3"></div>
                <div class="s-bar"
                     [class.active]="vm.strength >= 3"
                     [class.strong]="vm.strength >= 3"></div>
              </div>
              <span class="strength-label"
                    [class.weak-text]="vm.strength === 1"
                    [class.medium-text]="vm.strength === 2"
                    [class.strong-text]="vm.strength >= 3">
                {{ vm.strengthLabel }}
              </span>
            </div>

            <span class="field-error" *ngIf="vm.isInvalid('newPassword')">
              Minimum 8 caractères, une majuscule et un chiffre
            </span>
          </div>

          <!-- Confirm password -->
          <div class="field-group">
            <label class="field-label">{{ t().confirmPassword }}</label>
            <div class="field-wrap">
              <span class="field-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input [type]="vm.showPwd() ? 'text' : 'password'"
                     class="field-input"
                     [class.error]="vm.form.errors?.['mismatch'] &&
                                    vm.form.get('confirmPassword')?.touched"
                     [placeholder]="t().confirmPasswordPlaceholder"
                     formControlName="confirmPassword"/>
            </div>
            <span class="field-error"
                  *ngIf="vm.form.errors?.['mismatch'] &&
                         vm.form.get('confirmPassword')?.touched">
              Les mots de passe ne correspondent pas
            </span>
          </div>

          <!-- Requirements hint -->
          <ul class="pwd-rules">
            <li [class.ok]="vm.ruleMinLength">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Minimum 8 caractères
            </li>
            <li [class.ok]="vm.ruleUppercase">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Au moins une majuscule
            </li>
            <li [class.ok]="vm.ruleDigit">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Au moins un chiffre
            </li>
          </ul>

          <button type="submit" class="submit-btn"
                  [disabled]="vm.isLoading() || vm.form.invalid">
            <span *ngIf="!vm.isLoading()">{{ t().resetPassword }}</span>
            <span *ngIf="vm.isLoading()" class="loading-wrap">
              <span class="spinner"></span>
              Réinitialisation...
            </span>
          </button>

        </form>

        <div class="back-link-wrap">
          <a routerLink="/auth/login" class="back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            {{ t().backToLogin }}
          </a>
        </div>

      </ng-container>
    </div>
  `,
  styles: [`
    :host { display: contents; }

    /* ── Requirement list  */
    .pwd-rules {
      list-style: none; padding: 0; margin: 0.25rem 0 1rem;
      display: flex; flex-direction: column; gap: 0.35rem;
    }
    .pwd-rules li {
      display: flex; align-items: center; gap: 0.45rem;
      font-size: 0.78rem; color: var(--text-muted, rgba(0,0,0,0.45));
      transition: color 0.2s;
    }
    .pwd-rules li svg { opacity: 0.3; transition: opacity 0.2s; }
    .pwd-rules li.ok {
      color: #97C009;
    }
    .pwd-rules li.ok svg { opacity: 1; stroke: #97C009; }

    /* ── Error icon (invalid-link screen) ────────────────────────────────── */
    .error-icon {
      width: 72px; height: 72px; border-radius: 50%;
      background: rgba(239,68,68,0.1); color: #ef4444;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 1.5rem;
    }
    .success-icon {
      width: 72px; height: 72px; border-radius: 50%;
      background: rgba(151,192,9,0.12); color: #97C009;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 1.5rem;
    }
    .success-state { text-align: center; padding: 1rem 0; }
  `]
})
export class ResetPasswordComponent implements OnInit {
  vm = inject(ResetPasswordViewModel);
  t  = inject(LanguageService).t;

  ngOnInit(): void {
    this.vm.init();
  }
}
