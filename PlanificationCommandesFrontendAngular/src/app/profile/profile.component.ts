import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileViewModel } from './profile.viewmodel';
import { LanguageService } from '../shared/services/language.service';
import { AuthService } from '../shared/services/auth.service';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [ProfileViewModel],
  template: `
    <div class="page">

      <!-- ── Toast  -->
      <div class="toast" *ngIf="vm.toast()"
           [class.toast-success]="vm.toast()!.type === 'success'"
           [class.toast-error]="vm.toast()!.type === 'error'">
        <svg *ngIf="vm.toast()!.type === 'success'" width="16" height="16" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <svg *ngIf="vm.toast()!.type === 'error'" width="16" height="16" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        {{ vm.toast()!.msg }}
      </div>

      <!-- ── Back to dashboard  -->
      <div class="page-topbar">
        <button class="btn-back" (click)="goBack()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          {{ t().dashboardNav }}
        </button>
      </div>

      <div class="profile-layout">

        <!-- ── Sidebar  -->
        <div class="profile-sidebar">

          <!-- Avatar card -->
          <div class="avatar-card">
            <div class="big-avatar-wrap">
              <!-- Photo if set -->
              <img *ngIf="vm.photoPreview()" [src]="vm.photoPreview()!" class="big-avatar-img" alt="Photo de profil"/>
              <!-- Initials fallback -->
              <div *ngIf="!vm.photoPreview()" class="big-avatar-initials">
                {{ vm.currentUser()?.firstName?.charAt(0) }}{{ vm.currentUser()?.lastName?.charAt(0) }}
              </div>
            </div>
            <h2 class="avatar-name">{{ vm.currentUser()?.firstName }} {{ vm.currentUser()?.lastName }}</h2>
            <p class="avatar-email">{{ vm.currentUser()?.email }}</p>
            <span class="role-badge" [class]="'role-' + (vm.currentUser()?.role?.toLowerCase() ?? '')">
              {{ t()['role_' + vm.currentUser()?.role] || vm.currentUser()?.role }}
            </span>
          </div>

          <!-- Tab nav -->
          <nav class="profile-nav">
            <button class="nav-item" [class.active]="vm.activeTab() === 'info'"
                    (click)="vm.activeTab.set('info')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              {{ t().profileInfoTab }}
            </button>
            <button class="nav-item" [class.active]="vm.activeTab() === 'password'"
                    (click)="vm.activeTab.set('password')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              {{ t().profilePasswordTab }}
            </button>
          </nav>
        </div>

        <!-- ── Content  -->
        <div class="profile-content">

          <!-- ════ Info tab  -->
          <div class="panel" *ngIf="vm.activeTab() === 'info'">
            <div class="panel-header">
              <h3>{{ t().profileInfoTab }}</h3>
              <p>{{ t().profileInfoDesc }}</p>
            </div>

            <form [formGroup]="vm.profileForm" (ngSubmit)="vm.submitProfile()" class="form-body">

              <!-- Photo upload section -->
              <div class="photo-section">
                <p class="photo-label">{{ t().photoLabel }}</p>

                <div class="photo-row">
                  <!-- Current / preview photo -->
                  <div class="photo-thumb">
                    <img *ngIf="vm.photoPreview()" [src]="vm.photoPreview()!" alt="Aperçu"/>
                    <div *ngIf="!vm.photoPreview()" class="photo-thumb-placeholder">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                  </div>

                  <!-- Drop zone -->
                  <div class="drop-zone"
                       [class.dragging]="vm.isDragging()"
                       (dragover)="$event.preventDefault(); vm.isDragging.set(true)"
                       (dragleave)="vm.isDragging.set(false)"
                       (drop)="vm.onDrop($event)">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <p class="drop-text">
                      {{ t().dragDropPhoto }}
                      <label class="drop-link">
                        {{ t().browsePhoto }}
                        <input type="file" accept="image/jpeg,image/png,image/webp"
                               class="file-input-hidden"
                               (change)="vm.onFileInputChange($event)"/>
                      </label>
                    </p>
                    <p class="drop-hint">JPG, PNG, WEBP · max 2 Mo</p>
                  </div>

                  <!-- Remove button -->
                  <button type="button" class="btn-remove-photo"
                          *ngIf="vm.photoPreview()"
                          (click)="vm.removePhoto()"
                          [title]="t().removePhoto">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    </svg>
                    {{ t().removePhoto }}
                  </button>
                </div>
              </div>

              <div class="divider-light"></div>

              <!-- Name fields -->
              <div class="field-row">
                <div class="field-group">
                  <label class="field-label">{{ t().firstNameLabel }}</label>
                  <div class="field-wrap">
                    <span class="field-icon">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                    </span>
                    <input type="text" class="field-input"
                           [class.error]="vm.isInvalid(vm.profileForm, 'firstName')"
                           formControlName="firstName"/>
                  </div>
                  <span class="field-error" *ngIf="vm.isInvalid(vm.profileForm, 'firstName')">Requis</span>
                </div>

                <div class="field-group">
                  <label class="field-label">{{ t().lastNameLabel }}</label>
                  <div class="field-wrap">
                    <span class="field-icon">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                    </span>
                    <input type="text" class="field-input"
                           [class.error]="vm.isInvalid(vm.profileForm, 'lastName')"
                           formControlName="lastName"/>
                  </div>
                  <span class="field-error" *ngIf="vm.isInvalid(vm.profileForm, 'lastName')">Requis</span>
                </div>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn-primary" [disabled]="vm.isLoading()">
                  <span *ngIf="!vm.isLoading()">{{ t().saveBtn }}</span>
                  <span *ngIf="vm.isLoading()" class="loading-wrap"><span class="spinner"></span></span>
                </button>
              </div>
            </form>
          </div>

          <!--  Password tab  -->
          <div class="panel" *ngIf="vm.activeTab() === 'password'">
            <div class="panel-header">
              <h3>{{ t().profilePasswordTab }}</h3>
              <p>{{ t().profilePasswordDesc }}</p>
            </div>

            <form [formGroup]="vm.passwordForm" (ngSubmit)="vm.submitPassword()" class="form-body form-single">

              <div class="field-group">
                <label class="field-label">{{ t().currentPasswordLabel }}</label>
                <div class="field-wrap">
                  <span class="field-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input [type]="vm.showPwd() ? 'text' : 'password'" class="field-input"
                         [class.error]="vm.isInvalid(vm.passwordForm, 'currentPassword')"
                         [placeholder]="t().passwordPlaceholder"
                         formControlName="currentPassword"/>
                  <button type="button" class="field-eye" (click)="vm.togglePwd()">
                    <svg *ngIf="!vm.showPwd()" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    <svg *ngIf="vm.showPwd()"  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  </button>
                </div>
                <span class="field-error" *ngIf="vm.isInvalid(vm.passwordForm, 'currentPassword')">Requis</span>
              </div>

              <div class="field-group">
                <label class="field-label">{{ t().newPasswordLabel }}</label>
                <div class="field-wrap">
                  <span class="field-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input [type]="vm.showPwd() ? 'text' : 'password'" class="field-input"
                         [class.error]="vm.isInvalid(vm.passwordForm, 'newPassword')"
                         [placeholder]="t().newPasswordPlaceholder"
                         formControlName="newPassword"/>
                </div>
                <div class="password-strength" *ngIf="vm.passwordForm.get('newPassword')?.value">
                  <div class="strength-bars">
                    <div class="s-bar" [class.active]="vm.strength >= 1" [class.weak]="vm.strength === 1" [class.medium]="vm.strength === 2" [class.strong]="vm.strength >= 3"></div>
                    <div class="s-bar" [class.active]="vm.strength >= 2" [class.medium]="vm.strength === 2" [class.strong]="vm.strength >= 3"></div>
                    <div class="s-bar" [class.active]="vm.strength >= 3" [class.strong]="vm.strength >= 3"></div>
                  </div>
                  <span class="strength-label"
                        [class.weak-text]="vm.strength===1"
                        [class.medium-text]="vm.strength===2"
                        [class.strong-text]="vm.strength>=3">
                    {{ vm.strengthLabel }}
                  </span>
                </div>
                <span class="field-error" *ngIf="vm.isInvalid(vm.passwordForm, 'newPassword')">
                  Minimum 8 car., 1 majuscule, 1 chiffre
                </span>
              </div>

              <div class="field-group">
                <label class="field-label">{{ t().confirmPassword }}</label>
                <div class="field-wrap">
                  <span class="field-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input [type]="vm.showPwd() ? 'text' : 'password'" class="field-input"
                         [class.error]="vm.passwordForm.errors?.['mismatch'] && vm.passwordForm.get('confirmPassword')?.touched"
                         [placeholder]="t().confirmPasswordPlaceholder"
                         formControlName="confirmPassword"/>
                </div>
                <span class="field-error"
                      *ngIf="vm.passwordForm.errors?.['mismatch'] && vm.passwordForm.get('confirmPassword')?.touched">
                  Les mots de passe ne correspondent pas
                </span>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn-primary" [disabled]="vm.isLoading()">
                  <span *ngIf="!vm.isLoading()">{{ t().changePasswordBtn }}</span>
                  <span *ngIf="vm.isLoading()" class="loading-wrap"><span class="spinner"></span></span>
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: contents; }

    .page { padding: 2rem; max-width: 960px; margin: 0 auto; }

    /* ── Back bar  */
    .page-topbar { margin-bottom: 1.25rem; }

    .btn-back {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 0.45rem 0.9rem;
      background: var(--surface-alt, #f0f4f9);
      border: 1.5px solid var(--border, #e2e8f0);
      border-radius: 8px;
      color: var(--text-muted, #64748b);
      font-size: 0.85rem; font-weight: 600; font-family: inherit;
      cursor: pointer; transition: all 0.15s;
    }
    .btn-back:hover {
      background: var(--border, #e2e8f0);
      color: var(--text, #0f1c2e);
    }

    /* ── Layout  */
    .profile-layout {
      display: grid;
      grid-template-columns: 240px 1fr;
      gap: 1.5rem;
      align-items: start;
    }
    @media (max-width: 680px) { .profile-layout { grid-template-columns: 1fr; } }

    /* ── Sidebar  */
    .profile-sidebar { display: flex; flex-direction: column; gap: 0.75rem; }

    .avatar-card {
      background: var(--bg-card);
      border: 1.5px solid var(--border);
      border-radius: 14px;
      padding: 1.5rem;
      text-align: center;
    }

    .big-avatar-wrap {
      width: 80px; height: 80px;
      border-radius: 50%;
      margin: 0 auto 0.85rem;
      overflow: hidden;
      border: 2.5px solid var(--border);
    }
    .big-avatar-img     { width: 100%; height: 100%; object-fit: cover; }
    .big-avatar-initials {
      width: 100%; height: 100%;
      background: var(--color-primary);
      color: #fff;
      font-size: 1.5rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      text-transform: uppercase;
    }

    .avatar-name  { font-size: 1rem; font-weight: 700; margin: 0 0 0.25rem; }
    .avatar-email { font-size: 0.78rem; color: var(--text-muted); margin: 0 0 0.75rem; word-break: break-all; }

    .role-badge { padding: 0.2rem 0.75rem; border-radius: 20px; font-size: 0.72rem; font-weight: 600; display: inline-block; }
    .role-admin                    { background: rgba(239,68,68,0.1);  color: #dc2626; }
    .role-planificationresponsable { background: rgba(59,130,246,0.1); color: #2563eb; }
    .role-worker                   { background: rgba(34,197,94,0.1);  color: #16a34a; }

    .profile-nav {
      background: var(--bg-card);
      border: 1.5px solid var(--border);
      border-radius: 14px;
      overflow: hidden;
    }
    .nav-item {
      width: 100%; display: flex; align-items: center; gap: 0.65rem;
      padding: 0.8rem 1rem; border: none; background: transparent;
      color: var(--text-muted); font-size: 0.88rem; font-weight: 500;
      cursor: pointer; transition: all 0.15s; text-align: left;
    }
    .nav-item:hover  { background: var(--bg-hover); color: var(--text); }
    .nav-item.active { background: var(--bg-hover); color: var(--color-primary); font-weight: 600; border-left: 3px solid var(--color-primary); }

    /*  Panel  */
    .panel {
      background: var(--bg-card);
      border: 1.5px solid var(--border);
      border-radius: 14px;
      padding: 1.75rem;
    }
    .panel-header { margin-bottom: 1.5rem; }
    .panel-header h3 { font-size: 1.05rem; font-weight: 700; margin: 0 0 0.3rem; }
    .panel-header p  { font-size: 0.85rem; color: var(--text-muted); margin: 0; }

    /* ── Form layout ────────────────────────────────────────────────────── */
    .form-body        { display: flex; flex-direction: column; gap: 1.25rem; }
    .field-row        { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-actions     { display: flex; justify-content: flex-end; margin-top: 0.25rem; }
    @media (max-width: 480px) { .field-row { grid-template-columns: 1fr; } }

    /* ── Photo section ──────────────────────────────────────────────────── */
    .photo-section { display: flex; flex-direction: column; gap: 0.6rem; }
    .photo-label   { font-size: 0.82rem; font-weight: 600; color: var(--text); margin: 0; }

    .photo-row { display: flex; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }

    .photo-thumb {
      width: 64px; height: 64px; border-radius: 50%;
      overflow: hidden; flex-shrink: 0;
      border: 2px solid var(--border);
    }
    .photo-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .photo-thumb-placeholder {
      width: 100%; height: 100%;
      background: var(--bg-hover);
      display: flex; align-items: center; justify-content: center;
      color: var(--text-muted);
    }

    .drop-zone {
      flex: 1; min-width: 180px;
      border: 2px dashed var(--border);
      border-radius: 10px;
      padding: 0.9rem 1rem;
      display: flex; flex-direction: column; align-items: center; gap: 0.3rem;
      text-align: center; cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
      color: var(--text-muted);
    }
    .drop-zone.dragging { border-color: var(--color-primary); background: rgba(42,95,158,0.05); }
    .drop-text  { font-size: 0.82rem; margin: 0; }
    .drop-hint  { font-size: 0.72rem; color: var(--text-muted); margin: 0; }
    .drop-link  { color: var(--color-primary); font-weight: 600; cursor: pointer; margin-left: 0.25rem; }
    .file-input-hidden { display: none; }

    .btn-remove-photo {
      display: flex; align-items: center; gap: 0.4rem;
      padding: 0.35rem 0.75rem;
      background: rgba(239,68,68,0.08);
      color: #dc2626;
      border: 1px solid rgba(239,68,68,0.25);
      border-radius: 7px;
      font-size: 0.78rem; font-weight: 500;
      cursor: pointer; transition: all 0.15s;
      align-self: flex-end;
    }
    .btn-remove-photo:hover { background: rgba(239,68,68,0.15); }

    .divider-light { border: none; border-top: 1px solid var(--border); margin: 0.25rem 0; }

    /*  Buttons  */
    .btn-primary {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.65rem 1.3rem;
      background: var(--color-primary); color: #fff;
      border: none; border-radius: 8px;
      font-size: 0.88rem; font-weight: 600;
      cursor: pointer; transition: opacity 0.2s;
    }
    .btn-primary:hover:not(:disabled) { opacity: 0.9; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    /*  Toast  */
    .toast {
      position: fixed; bottom: 2rem; right: 2rem;
      display: flex; align-items: center; gap: 0.6rem;
      padding: 0.8rem 1.2rem; border-radius: 10px;
      font-size: 0.88rem; font-weight: 500; z-index: 2000;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      animation: slideUp 0.3s ease;
    }
    .toast-success { background: #16a34a; color: #fff; }
    .toast-error   { background: #dc2626; color: #fff; }
    @keyframes slideUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `]
})
export class ProfileComponent implements OnInit {
  vm     = inject(ProfileViewModel);
  t      = inject(LanguageService).t;
  private router = inject(Router);
  private auth   = inject(AuthService);

  ngOnInit() { this.vm.load(); }

  goBack(): void {
    const roleMap: Record<string, string> = {
      Admin:                    '/admin/machines',
      PlanificationResponsable: '/planner/machines',
      Worker:                   '/worker',
    };
    const role = this.auth.currentUser()?.role ?? '';
    this.router.navigate([roleMap[role] ?? '/']);
  }
}
