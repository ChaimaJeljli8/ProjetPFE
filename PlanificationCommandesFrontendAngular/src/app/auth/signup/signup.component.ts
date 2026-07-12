import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../shared/services/language.service';
import { SignupViewModel } from './signup.viewmodel';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  providers: [SignupViewModel],
  template: `
    <div class="auth-form-container">
      <div class="form-header">
        <h2 class="form-title">{{ t().signupTitle }}</h2>
        <p class="form-subtitle">{{ t().signupDesc }}</p>
      </div>

      <!-- Server errors -->
      <div class="alert-error" *ngIf="vm.error()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>{{ vm.error() }}</span>
      </div>

      <form [formGroup]="vm.form" (ngSubmit)="vm.submit()" class="auth-form">

        <!-- First / Last name -->
        <div class="field-row">
          <div class="field-group">
            <label class="field-label">{{ t().firstNameLabel }}</label>
            <div class="field-wrap">
              <span class="field-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <input type="text" class="field-input" [class.error]="vm.isInvalid('firstName')"
                formControlName="firstName" placeholder="Jean"/>
            </div>
            <span class="field-error" *ngIf="vm.isInvalid('firstName')">Requis</span>
          </div>
          <div class="field-group">
            <label class="field-label">{{ t().lastNameLabel }}</label>
            <div class="field-wrap">
              <span class="field-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <input type="text" class="field-input" [class.error]="vm.isInvalid('lastName')"
                formControlName="lastName" placeholder="Dupont"/>
            </div>
            <span class="field-error" *ngIf="vm.isInvalid('lastName')">Requis</span>
          </div>
        </div>

        <!-- Email -->
        <div class="field-group">
          <label class="field-label">{{ t().emailLabel }}</label>
          <div class="field-wrap">
            <span class="field-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </span>
            <input type="email" class="field-input" [class.error]="vm.isInvalid('email')"
              [placeholder]="t().emailPlaceholder" formControlName="email"/>
          </div>
          <span class="field-error" *ngIf="vm.isInvalid('email')">{{ t().emailInvalid }}</span>
        </div>

        <!-- Password -->
        <div class="field-group">
          <label class="field-label">{{ t().passwordLabel }}</label>
          <div class="field-wrap">
            <span class="field-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </span>
            <input [type]="vm.showPwd() ? 'text' : 'password'" class="field-input"
              [class.error]="vm.isInvalid('password')" [placeholder]="t().passwordPlaceholder"
              formControlName="password"/>
            <button type="button" class="field-eye" (click)="vm.togglePasswordVisibility()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>

          <!-- Password requirements checklist (shown once the user starts typing) -->
          <div class="pwd-reqs"
               *ngIf="vm.form.get('password')?.dirty || vm.form.get('password')?.touched">

            <div class="req-row" [class.met]="vm.requirements.length">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline *ngIf="vm.requirements.length"  points="20 6 9 17 4 12"/>
                <circle   *ngIf="!vm.requirements.length" cx="12" cy="12" r="9"/>
              </svg>
              {{ t().pwdReqLength }}
            </div>

            <div class="req-row" [class.met]="vm.requirements.upper">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline *ngIf="vm.requirements.upper"  points="20 6 9 17 4 12"/>
                <circle   *ngIf="!vm.requirements.upper" cx="12" cy="12" r="9"/>
              </svg>
              {{ t().pwdReqUpper }}
            </div>

            <div class="req-row" [class.met]="vm.requirements.digit">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline *ngIf="vm.requirements.digit"  points="20 6 9 17 4 12"/>
                <circle   *ngIf="!vm.requirements.digit" cx="12" cy="12" r="9"/>
              </svg>
              {{ t().pwdReqDigit }}
            </div>

            <div class="req-row" [class.met]="vm.requirements.special">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline *ngIf="vm.requirements.special"  points="20 6 9 17 4 12"/>
                <circle   *ngIf="!vm.requirements.special" cx="12" cy="12" r="9"/>
              </svg>
              {{ t().pwdReqSpecial }}
            </div>

            <!-- Strength bars -->
            <div class="password-strength" *ngIf="vm.form.get('password')?.value">
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
                {{ vm.strengthKey ? t()[vm.strengthKey] : '' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Confirm Password -->
        <div class="field-group">
          <label class="field-label">{{ t().confirmPassword }}</label>
          <div class="field-wrap">
            <span class="field-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </span>
            <input [type]="vm.showPwd() ? 'text' : 'password'" class="field-input"
              [class.error]="vm.form.errors?.['mismatch'] && vm.form.get('confirmPassword')?.touched"
              [placeholder]="t().confirmPasswordPlaceholder" formControlName="confirmPassword"/>
          </div>
          <span class="field-error"
                *ngIf="vm.form.errors?.['mismatch'] && vm.form.get('confirmPassword')?.touched">
            Les mots de passe ne correspondent pas
          </span>
        </div>

        <button type="submit" class="submit-btn" [disabled]="vm.isLoading()">
          <span *ngIf="!vm.isLoading()">{{ t().createAccount }}</span>
          <span *ngIf="vm.isLoading()" class="loading-wrap">
            <span class="spinner"></span>Création du compte...
          </span>
        </button>
      </form>

      <p class="auth-redirect">
        {{ t().alreadyAccount }}
        <a routerLink="/auth/login" class="auth-link">{{ t().login }}</a>
      </p>
    </div>
  `,
  styles: [`
    :host { display: contents; }

    /* Password requirement checklist */
    .pwd-reqs {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin-top: 8px;
    }

    .req-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #9ca3af;        /* unmet — muted gray */
      transition: color 0.2s ease;
    }

    .req-row svg {
      flex-shrink: 0;
      stroke: currentColor;
    }

    .req-row.met {
      color: #22c55e;        /* met — green */
    }

    /* Strength bars sit inside .pwd-reqs so they share the same reveal logic */
    .password-strength {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 6px;
    }
  `]
})
export class SignupComponent {
  vm = inject(SignupViewModel);
  t  = inject(LanguageService).t;
}
