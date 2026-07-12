import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../shared/services/language.service';
import { ForgotPasswordViewModel } from './forgot-password.viewmodel';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  providers: [ForgotPasswordViewModel],
  template: `
    <div class="auth-form-container">
      <ng-container *ngIf="vm.sent(); else formView">
        <div class="success-state">
          <div class="success-icon-wrap">
            <div class="success-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </div>
          <h2 class="form-title">{{ t().resetSent }}</h2>
          <p class="form-subtitle">{{ t().resetSentDesc }}</p>
          <p class="sent-email">{{ vm.sentEmail() }}</p>
          <a routerLink="/auth/login" class="submit-btn" style="display:block; text-align:center; margin-top:2rem; text-decoration:none;">
            {{ t().backToLogin }}
          </a>
        </div>
      </ng-container>

      <ng-template #formView>
        <div class="form-header">
          <div class="form-icon-header">
            <div class="form-icon-circle">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
              </svg>
            </div>
          </div>
          <h2 class="form-title">{{ t().forgotTitle }}</h2>
          <p class="form-subtitle">{{ t().forgotDesc }}</p>
        </div>

        <form [formGroup]="vm.form" (ngSubmit)="vm.submit()" class="auth-form">
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
            <span class="field-error" *ngIf="vm.isInvalid('email')">Adresse e-mail invalide</span>
          </div>

          <button type="submit" class="submit-btn" [disabled]="vm.isLoading() || vm.form.invalid">
            <span *ngIf="!vm.isLoading()">{{ t().sendReset }}</span>
            <span *ngIf="vm.isLoading()" class="loading-wrap">
              <span class="spinner"></span>
              Envoi en cours...
            </span>
          </button>
        </form>

        <div class="back-link-wrap">
          <a routerLink="/auth/login" class="back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            {{ t().backToLogin }}
          </a>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`:host { display: contents; }`]
})
export class ForgotPasswordComponent {
  vm = inject(ForgotPasswordViewModel);
  t = inject(LanguageService).t;
}
