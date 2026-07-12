import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminUsersViewModel } from './admin-users.viewmodel';
import { LanguageService } from '../../shared/services/language.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [AdminUsersViewModel],
  template: `
    <div class="page">

      <!-- Toast -->
      <div class="toast" *ngIf="vm.toast()"
           [class.toast-success]="vm.toast()!.type === 'success'"
           [class.toast-error]="vm.toast()!.type === 'error'">
        <svg *ngIf="vm.toast()!.type === 'success'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <svg *ngIf="vm.toast()!.type === 'error'"   width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        {{ vm.toast()!.msg }}
      </div>

      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ t().adminUsersTitle }}</h1>
          <p class="page-subtitle">{{ vm.users().length }} {{ t().usersTotal }}</p>
          <!-- Debug: Show modal state removed -->
        </div>
        <button class="btn-primary" (click)="vm.openCreate()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          {{ t().addUser }}
        </button>
      </div>

      <!-- Search -->
      <div class="search-bar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text"
               id="user-search"
               name="userSearch"
               [placeholder]="t().searchUsers"
               [value]="vm.searchQuery()"
               (input)="vm.searchQuery.set($any($event.target).value)"
               class="search-input"/>
      </div>

      <!-- API Error banner -->
      <div class="alert-error" *ngIf="vm.error() && !vm.modalMode()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {{ vm.error() }}
      </div>

      <!-- Loading spinner (first load) -->
      <div class="loading-center" *ngIf="vm.isLoading() && vm.users().length === 0">
        <span class="spinner-lg"></span>
      </div>

      <!-- Empty state (loaded but no users) -->
      <div class="empty-page" *ngIf="!vm.isLoading() && vm.users().length === 0 && !vm.error()">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <p>Aucun utilisateur trouvé.</p>
      </div>

      <!-- Table -->
      <div class="table-wrap" *ngIf="vm.users().length > 0">
        <!-- Refresh overlay -->
        <div class="table-loading" *ngIf="vm.isLoading()">
          <span class="spinner-lg"></span>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>{{ t().nameCol }}</th>
              <th>{{ t().emailCol }}</th>
              <th>{{ t().roleCol }}</th>
              <th>{{ t().statusCol }}</th>
              <th>{{ t().actionsCol }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of vm.filteredUsers()">
              <td>
                <div class="user-cell">
                  <div class="avatar">
                    <img *ngIf="user.profilePhoto" [src]="user.profilePhoto" alt="" class="avatar-img"/>
                    <span *ngIf="!user.profilePhoto">{{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}</span>
                  </div>
                  <span class="user-name-text">{{ user.firstName }} {{ user.lastName }}</span>
                </div>
              </td>
              <td class="text-muted">{{ user.email }}</td>
              <td>
                <span class="role-badge" [class]="'role-' + user.role.toLowerCase()">
                  {{ t()['role_' + user.role] || user.role }}
                </span>
              </td>
              <td>
                <span class="status-badge" [class.status-active]="user.isActive" [class.status-inactive]="!user.isActive">
                  {{ user.isActive ? t().activeStatus : t().inactiveStatus }}
                </span>
              </td>
              <td>
                <div class="action-row">
                  <button class="btn-icon" [title]="t().saveBtn" (click)="vm.openEdit(user)">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="btn-icon" title="Envoyer un email de réinitialisation du mot de passe" (click)="vm.sendReset(user.id)">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
                  </button>
                  <button class="btn-icon btn-danger" [title]="t().deleteBtn" (click)="vm.requestDelete(user.id)">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Search error (no results) -->
        <div class="no-results-state"
            *ngIf="vm.filteredUsers().length === 0 && vm.searchQuery() && !vm.isLoading()">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
          <p>{{ t().noUserFound }} <strong>« {{ vm.searchQuery() }} »</strong></p>
          <button class="btn-secondary" (click)="vm.searchQuery.set('')">
            {{ t()['clearSearch'] || 'Effacer la recherche' }}
          </button>
        </div>
      </div>

      <!-- ── Create / Edit Modal ──────────────────────────────────────────── -->
      <div class="modal-backdrop" *ngIf="vm.modalMode()"
           (click)="vm.closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ vm.modalMode() === 'create' ? t().createUserTitle : t().editUserTitle }}</h3>
            <button class="modal-close" (click)="vm.closeModal()"
                    style="color:#374151;background:#e8edf4;border:1.5px solid #c8d4e0;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <form [formGroup]="vm.form" (ngSubmit)="vm.submit()" class="modal-form" novalidate>
            <!-- novalidate = cette option indique que les données du formulaire (saisie) ne doivent pas être validées
                    lors de leur soumission. -->

            <!-- Name row -->
            <div class="field-row">
              <div class="field-group">
                <label class="f-label" for="firstName">{{ t().firstNameLabel }}</label>
                <input type="text"
                       id="firstName"
                       name="firstName"
                       autocomplete="given-name"
                       class="f-input"
                       [class.f-error]="vm.isInvalid('firstName')"
                       formControlName="firstName"
                       placeholder="Jean"/>
                <span class="f-err-msg" *ngIf="vm.isInvalid('firstName')">{{ t().firstNameLabel }} {{ t().passwordMin6.includes('6') ? 'requis' : 'required' }}</span>
              </div>
              <div class="field-group">
                <label class="f-label" for="lastName">{{ t().lastNameLabel }}</label>
                <input type="text"
                       id="lastName"
                       name="lastName"
                       autocomplete="family-name"
                       class="f-input"
                       [class.f-error]="vm.isInvalid('lastName')"
                       formControlName="lastName"
                       placeholder="Dupont"/>
                <span class="f-err-msg" *ngIf="vm.isInvalid('lastName')">{{ t().lastNameLabel }} requis</span>
              </div>
            </div>

            <!-- Email -->
            <div class="field-group">
              <label class="f-label" for="email">{{ t().emailLabel }}</label>
              <input type="email"
                     id="email"
                     name="email"
                     autocomplete="email"
                     class="f-input"
                     [class.f-error]="vm.isInvalid('email')"
                     formControlName="email"
                     placeholder="jean@example.com"/>
              <span class="f-err-msg" *ngIf="vm.isInvalid('email')">{{ t().emailInvalid }}</span>
            </div>

            <!-- Role + Status row -->
            <div class="field-row">
              <div class="field-group">
                <label class="f-label" for="role">{{ t().roleLabel }}</label>
                <select id="role"
                        name="role"
                        autocomplete="off"
                        class="f-input f-select"
                        formControlName="role">
                  <option value="Admin">{{ t().role_Admin }}</option>
                  <option value="PlanificationResponsable">{{ t().role_PlanificationResponsable }}</option>
                  <option value="Worker">{{ t().role_Worker }}</option>
                </select>
              </div>
              <div class="field-group" *ngIf="vm.modalMode() === 'edit'">
                <label class="f-label" for="isActive">{{ t().statusLabel }}</label>
                <select id="isActive"
                        name="isActive"
                        autocomplete="off"
                        class="f-input f-select"
                        formControlName="isActive">
                  <option [value]="true">{{ t().activeStatus }}</option>
                  <option [value]="false">{{ t().inactiveStatus }}</option>
                </select>
              </div>
            </div>

            <!-- Password fields: only shown when creating a new user -->
            <div class="field-row" *ngIf="vm.modalMode() === 'create'">
              <div class="field-group">
                <label class="f-label" for="password">{{ t().passwordLabel }}</label>
                <input type="password"
                       id="password"
                       name="password"
                       autocomplete="new-password"
                       class="f-input"
                       [class.f-error]="vm.isInvalid('password')"
                       formControlName="password"
                       placeholder="••••••••"/>
                <span class="f-err-msg" *ngIf="vm.isInvalid('password')">{{ t().passwordMin6 || 'Minimum 8 caractères' }}</span>
              </div>
              <div class="field-group">
                <label class="f-label" for="confirmPassword">{{ t().confirmPassword }}</label>
                <input type="password"
                       id="confirmPassword"
                       name="confirmPassword"
                       autocomplete="new-password"
                       class="f-input"
                       [class.f-error]="vm.isInvalid('confirmPassword') || vm.form.errors?.['mismatch']"
                       formControlName="confirmPassword"
                       placeholder="••••••••"/>
                <span class="f-err-msg" *ngIf="vm.form.errors?.['mismatch']">{{ t()['passwordMismatch'] || 'Les mots de passe ne correspondent pas' }}</span>
              </div>
            </div>

            <!-- Edit mode: password is changed via the reset email button in the table -->
            <div class="reset-hint" *ngIf="vm.modalMode() === 'edit'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Pour modifier le mot de passe, utilisez le bouton
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;vertical-align:middle"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
              dans le tableau — un email de réinitialisation sera envoyé à l'utilisateur.
            </div>

            <!-- API error inside modal -->
            <div class="modal-api-error" *ngIf="vm.error() && vm.modalMode()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {{ vm.error() }}
            </div>

            <!-- Buttons -->
            <div class="modal-actions">

              <button type="submit" class="btn-primary" [disabled]="vm.isLoading()">
                <span class="spinner-sm" *ngIf="vm.isLoading()"></span>
                {{ vm.isLoading() ? t()['saving'] : t().saveBtn }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ── Delete Confirmation Modal ────────────────────────────────────── -->
      <div class="modal-backdrop" *ngIf="vm.confirmDeleteId()"
           (click)="vm.cancelDelete()">
        <div class="modal modal-sm" (click)="$event.stopPropagation()">
          <div class="delete-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </div>
          <h3>{{ t()['deleteUserTitle'] || 'Supprimer utilisateur' }}</h3>
          <p>{{ t()['deleteUserConfirm'] || 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?' }}</p>

          <div class="modal-api-error" *ngIf="vm.error()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {{ vm.error() }}
          </div>

          <div class="modal-actions">
            <button class="btn-secondary" (click)="vm.cancelDelete()" [disabled]="vm.isLoading()"
                    style="color:#0F1C2E;background:#e8edf4;border:1.5px solid #c8d4e0;">
              {{ t()['cancelBtn'] }} <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>

            </button>
            <button class="btn-danger-solid" (click)="vm.confirmDelete()" [disabled]="vm.isLoading()">
              <span class="spinner-sm" *ngIf="vm.isLoading()"></span>
              {{ vm.isLoading() ? t()['deleting'] : t().deleteBtn }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ── Global page container ────────────────────────────────────────── */
    .page {
      padding: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
      min-height: 100vh;
    }

    /* ── Page header ──────────────────────────────────────────────────── */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .page-title {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0 0 0.25rem;
      color: var(--text, #111827);
    }
    .page-subtitle {
      font-size: 0.9rem;
      color: var(--text-muted, #6b7280);
      margin: 0;
    }

    /* ── Search bar ───────────────────────────────────────────────────── */
    .search-bar {
      position: relative;
      display: flex;
      align-items: center;
      margin-bottom: 1.25rem;
    }
    .search-bar svg {
      position: absolute;
      left: 0.9rem;
      pointer-events: none;
      color: var(--text-muted, #9ca3af);
    }
    .search-input {
      width: 100%;
      padding: 0.65rem 0.9rem 0.65rem 2.5rem;
      border: 1.5px solid var(--border, #e5e7eb);
      border-radius: 10px;
      background: var(--surface, #fff);
      color: var(--text, #111827);
      font-size: 0.9rem;
      font-family: inherit;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .search-input:focus {
      border-color: var(--color-primary, #2563eb);
      box-shadow: 0 0 0 3px var(--color-primary-ring, rgba(37,99,235,0.12));
    }
    .search-input::placeholder {
      color: var(--text-faint, #9ca3af);
    }

    /* ── Alerts ───────────────────────────────────────────────────────── */
    .alert-error {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.85rem 1rem;
      background: var(--color-danger-bg, #fef2f2);
      border: 1px solid var(--color-danger-light, rgba(220,38,38,0.2));
      border-radius: 10px;
      color: var(--color-danger, #dc2626);
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 1rem;
    }

    /* ── Loading states ───────────────────────────────────────────────── */
    .loading-center {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4rem 0;
    }
    .spinner-lg {
      display: inline-block;
      width: 36px;
      height: 36px;
      border: 3px solid var(--border, #e5e7eb);
      border-top-color: var(--color-primary, #2563eb);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    .spinner-sm {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* ── Empty state ──────────────────────────────────────────────────── */
    .no-results-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 0.75rem; padding: 2.5rem 1rem; text-align: center;
      color: var(--text-muted, #6b7280);
    }
    .no-results-state p { margin: 0; font-size: 0.9rem; }
    .no-results-state strong { color: var(--text, #111827); }

    .empty-page {
      text-align: center;
      padding: 4rem 1rem;
      color: var(--text-muted, #6b7280);
    }
    .empty-page svg {
      margin-bottom: 1rem;
      color: var(--text-faint, #9ca3af);
    }
    .empty-page p {
      margin: 0;
      font-size: 0.95rem;
    }

    /* ── Table container ──────────────────────────────────────────────── */
    .table-wrap {
      position: relative;
      overflow-x: auto;
      background: var(--surface, #fff);
      border: 1px solid var(--border, #e5e7eb);
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .table-loading {
      position: absolute;
      inset: 0;
      background: var(--surface-overlay, rgba(255,255,255,0.7));
      backdrop-filter: blur(2px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      border-radius: 12px;
    }

    /* ── Table ────────────────────────────────────────────────────────── */
    .table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.88rem;
    }
    .table thead {
      background: var(--surface-alt, #f9fafb);
      border-bottom: 1px solid var(--border, #e5e7eb);
    }
    .table th {
      text-align: left;
      padding: 0.9rem 1rem;
      font-weight: 600;
      color: var(--text, #374151);
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .table td {
      padding: 1rem;
      border-top: 1px solid var(--border, #e5e7eb);
      color: var(--text, #111827);
      vertical-align: middle;
    }
    .table tbody tr {
      transition: background 0.12s;
    }
    .table tbody tr:hover {
      background: var(--surface-alt, #f9fafb);
    }

    /* ── Table cells ──────────────────────────────────────────────────── */
    .user-cell {
      display: flex;
      align-items: center;
      gap: 0.7rem;
    }
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-primary, #2563eb), var(--color-primary-dark, #1d4ed8));
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      flex-shrink: 0;
      overflow: hidden;
    }
    .avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: inherit;
    display: block;
  }
    .user-name-text {
      font-weight: 600;
      color: var(--text, #111827);
    }
    .text-muted {
      color: var(--text-muted, #6b7280) !important;
    }

    /* ── Badges ───────────────────────────────────────────────────────── */
    .role-badge, .status-badge {
      display: inline-block;
      padding: 0.35rem 0.7rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: capitalize;
      white-space: nowrap;
    }
    .role-admin {
      background: var(--color-danger-light, rgba(220,38,38,0.1));
      color: var(--color-danger, #dc2626);
    }
    .role-planificationresponsable {
      background: var(--color-warning-light, rgba(245,158,11,0.1));
      color: var(--color-warning, #f59e0b);
    }
    .role-worker {
      background: var(--color-info-light, rgba(37,99,235,0.1));
      color: var(--color-info, #2563eb);
    }
    .status-active {
      background: var(--color-success-light, rgba(22,163,74,0.1));
      color: var(--color-success, #16a34a);
    }
    .status-inactive {
      background: var(--bg-subtle, #f3f4f6);
      color: var(--text-muted, #6b7280);
    }

    /* ── Action buttons ───────────────────────────────────────────────── */
    .action-row {
      display: flex;
      gap: 0.4rem;
      align-items: center;
    }
    .btn-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      padding: 0;
      background: var(--surface-alt, #f3f4f6);
      border: 1px solid transparent;
      border-radius: 6px;
      color: var(--text-muted, #6b7280);
      cursor: pointer;
      transition: all 0.14s;
    }
    .btn-icon:hover {
      background: var(--border, #e5e7eb);
      color: var(--text, #374151);
      border-color: var(--border, #e5e7eb);
    }
    .btn-icon.btn-danger:hover {
      background: rgba(220,38,38,0.1);
      color: #dc2626;
      border-color: rgba(220,38,38,0.2);
    }

    /* ── Empty search state ───────────────────────────────────────────── */
    .empty-state {
      text-align: center;
      padding: 2.5rem 1rem;
      color: var(--text-muted, #6b7280);
      font-size: 0.9rem;
      margin: 0;
    }

    /* ── Spinner (small) ──────────────────────────────────────────────── */
    .spinner-sm {
      display: inline-block; width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
      border-radius: 50%; animation: spin 0.6s linear infinite;
    }
    .spinner-lg {
      display: inline-block; width: 28px; height: 28px;
      border: 2.5px solid var(--border); border-top-color: var(--color-primary);
      border-radius: 50%; animation: spin 0.65s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Modal - Use ::ng-deep to override any encapsulation ─────────── */
    :host ::ng-deep .modal-backdrop,
    .modal-backdrop {
      position: fixed !important;
      inset: 0 !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: rgba(0,0,0,0.5) !important;
      display: flex !important;
      visibility: visible !important;
      opacity: 1 !important;
      align-items: center !important;
      justify-content: center !important;
      z-index: 99999 !important;
      padding: 1rem;
      animation: fadeIn 0.15s ease;
      overflow: auto;
      pointer-events: all !important;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    :host ::ng-deep .modal,
    .modal {
      position: relative !important;
      background: var(--surface, #ffffff) !important;
      border-radius: 14px;
      width: 100%;
      max-width: 520px;
      padding: 1.75rem;
      box-shadow: 0 20px 60px rgba(0,0,0,0.35);
      border: 1px solid var(--border, #e5e7eb);
      animation: slideUp 0.2s cubic-bezier(0.34,1.2,0.64,1);
      z-index: 100000 !important;
      margin: auto;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
    @keyframes slideUp {
      from { transform: translateY(16px) scale(0.97); opacity: 0; }
      to   { transform: translateY(0)    scale(1);    opacity: 1; }
    }
    .modal-sm { max-width: 380px; text-align: center; }

    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 1.5rem;
    }
    .modal-header h3 { font-size: 1.1rem; font-weight: 700; margin: 0; color: var(--text); }
    button.modal-close, .modal-close {
      background: #e8edf4 !important;
      border: 1.5px solid #c8d4e0 !important;
      cursor: pointer;
      color: #374151 !important;
      padding: 6px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      transition: all 0.14s;
      width: 34px;
      height: 34px;
      justify-content: center;
      flex-shrink: 0;
    }
    button.modal-close:hover, .modal-close:hover {
      background: #d0dae6 !important;
      color: #0F1C2E !important;
      border-color: #9aabbc !important;
    }

    .modal-form { display: flex; flex-direction: column; gap: 1rem; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 0.6rem; margin-top: 0.25rem; }

    .modal-api-error {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.65rem 0.9rem;
      background: var(--color-danger-bg, #fef2f2);
      color: var(--color-danger, #dc2626);
      border: 1px solid var(--color-danger-light, rgba(220,38,38,0.2));
      border-radius: 8px; font-size: 0.83rem; font-weight: 500;
    }

    /* Delete modal specifics */
    .delete-icon {
      width: 56px; height: 56px; border-radius: 50%;
      background: var(--color-danger-light, rgba(220,38,38,0.1));
      color: var(--color-danger, #dc2626);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 1rem;
    }
    .modal-sm h3 { font-size: 1.05rem; font-weight: 700; margin: 0 0 0.4rem; color: var(--text); }
    .modal-sm p  { color: var(--text-muted); font-size: 0.88rem; margin: 0 0 1.5rem; }

    /* ── Form fields (scoped, no icon indent) ────────────────────────── */
    .field-group { display: flex; flex-direction: column; gap: 0.35rem; }
    .field-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    @media (max-width: 480px) { .field-row { grid-template-columns: 1fr; } }

    .f-label {
      font-size: 0.81rem; font-weight: 600;
      color: var(--text); letter-spacing: 0.01em;
      display: flex; align-items: center; gap: 0.3rem;
    }
    .f-hint { font-size: 0.72rem; color: var(--text-muted); font-weight: 400; }

    .f-input {
      width: 100%;
      padding: 0.6rem 0.8rem;
      border: 1.5px solid var(--border);
      border-radius: 8px;
      background: var(--surface, #fff);
      color: var(--text);
      font-size: 0.875rem;
      font-family: inherit;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
      appearance: none; -webkit-appearance: none;
    }
    .f-input::placeholder { color: var(--text-faint, #9ca3af); }
    .f-input:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-ring, rgba(37,99,235,0.15));
    }
    .f-input.f-error {
      border-color: var(--color-danger, #dc2626);
      box-shadow: 0 0 0 3px rgba(220,38,38,0.1);
    }
    .f-select {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      padding-right: 2.25rem;
      cursor: pointer;
    }
    .f-err-msg { font-size: 0.75rem; color: var(--color-danger, #dc2626); font-weight: 500; }

    .reset-hint {
      display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;
      padding: 0.65rem 0.9rem;
      background: var(--surface-alt, #f0f4f9);
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 8px;
      font-size: 0.82rem; color: var(--text-muted, #64748b);
      line-height: 1.5;
    }

    /* ── Shared buttons ──────────────────────────────────────────────── */
    .btn-primary {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.6rem 1.2rem;
      background: var(--color-primary, #2563eb); color: #fff;
      border: none; border-radius: 8px;
      font-size: 0.88rem; font-weight: 600; font-family: inherit;
      cursor: pointer; transition: opacity 0.15s, transform 0.1s;
      white-space: nowrap;
    }
    .btn-primary:hover:not(:disabled) { opacity: 0.88; }
    .btn-primary:active:not(:disabled) { transform: scale(0.98); }
    .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

    button.btn-secondary, .btn-secondary {
      padding: 0.6rem 1.1rem;
      background: #e8edf4 !important;
      color: #0F1C2E !important;
      border: 1.5px solid #c8d4e0 !important;
      border-radius: 8px;
      font-size: 0.88rem; font-weight: 600; font-family: inherit;
      cursor: pointer; transition: background 0.14s, color 0.14s;
      display: inline-flex; align-items: center;
    }
    button.btn-secondary:hover:not(:disabled), .btn-secondary:hover:not(:disabled) {
      background: #d0dae6 !important;
      color: #0F1C2E !important;
    }
    button.btn-secondary:disabled, .btn-secondary:disabled { opacity: 0.55; cursor: not-allowed; }

    .btn-danger-solid {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.6rem 1.1rem;
      background: var(--color-danger, #dc2626); color: #fff;
      border: none; border-radius: 8px;
      font-size: 0.88rem; font-weight: 600; font-family: inherit;
      cursor: pointer; transition: opacity 0.14s;
    }
    .btn-danger-solid:hover:not(:disabled) { opacity: 0.88; }
    .btn-danger-solid:disabled { opacity: 0.55; cursor: not-allowed; }

    /* ── Toast ───────────────────────────────────────────────────────── */
    .toast {
      position: fixed; bottom: 2rem; right: 2rem;
      display: flex; align-items: center; gap: 0.6rem;
      padding: 0.75rem 1.15rem; border-radius: 10px;
      font-size: 0.875rem; font-weight: 500; z-index: 9999;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      animation: toastIn 0.3s cubic-bezier(0.34,1.4,0.64,1);
      max-width: 340px;
    }
    .toast-success { background: var(--color-success, #16a34a); color: #fff; }
    .toast-error   { background: var(--color-danger, #dc2626);  color: #fff; }
    @keyframes toastIn {
      from { transform: translateY(12px) scale(0.95); opacity: 0; }
      to   { transform: translateY(0)    scale(1);    opacity: 1; }
    }
  `]
})
export class AdminUsersComponent implements OnInit {
  vm = inject(AdminUsersViewModel);
  t  = inject(LanguageService).t;

  ngOnInit() { this.vm.load(); }
}
