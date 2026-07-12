import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../shared/services/language.service';
import { LoginViewModel } from './login.viewmodel';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  providers: [LoginViewModel],
  template: `
    <div class="auth-form-container">
      <div class="form-header">
        <h2 class="form-title">{{ t().welcomeBack }}</h2>
        <p class="form-subtitle">{{ t().signInDesc }}</p>
      </div>

      <div class="alert-error" *ngIf="vm.error()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ vm.error() }}
      </div>

      <form [formGroup]="vm.form" (ngSubmit)="vm.submit()" class="auth-form">
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
          <div class="field-label-row">
            <label class="field-label">{{ t().passwordLabel }}</label>
            <a routerLink="/auth/forgot-password" class="forgot-link">{{ t().forgotPassword }}</a>
          </div>
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
              <svg *ngIf="!vm.showPwd()" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              <svg *ngIf="vm.showPwd()" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>

        </div>

        <!-- Remember -->
        <div class="remember-row">
          <label class="checkbox-label">
            <input type="checkbox" formControlName="rememberMe" class="checkbox-input"/>
            <span class="checkbox-custom"></span>
            <span>{{ t().rememberMe }}</span>
          </label>
        </div>

        <button type="submit" class="submit-btn" [disabled]="vm.isLoading() || vm.form.invalid">
          <span *ngIf="!vm.isLoading()">{{ t().signIn }}</span>
          <span *ngIf="vm.isLoading()" class="loading-wrap">
            <span class="spinner"></span>
            {{ t().signingIn }}
          </span>
        </button>
      </form>

      <p class="auth-redirect">
        {{ t().noAccount }}
        <a routerLink="/auth/signup" class="auth-link">{{ t().createAccount }}</a>
      </p>
    </div>
  `,
  styles: [`
    :host { display: contents; }
  `]
})
export class LoginComponent {
  vm = inject(LoginViewModel);
  t  = inject(LanguageService).t;
}
