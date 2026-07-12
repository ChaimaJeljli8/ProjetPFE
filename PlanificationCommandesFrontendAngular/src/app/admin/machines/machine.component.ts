import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MachineViewModel } from './machine.viewmodel';
import { LanguageService } from '../../shared/services/language.service';

@Component({
  selector: 'app-machine',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [MachineViewModel],
  template: `

    <!-- ── Toast  -->
    <div *ngIf="vm.toast()"
         class="toast"
         [class.toast-success]="vm.toast()!.type === 'success'"
         [class.toast-error]="vm.toast()!.type === 'error'">
      <svg *ngIf="vm.toast()!.type === 'success'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      <svg *ngIf="vm.toast()!.type === 'error'"   width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
      {{ vm.toast()!.msg }}
    </div>

    <div class="page">

      <!-- ── Page Header  -->
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ t().machinesTitle }}</h1>
          <p class="page-subtitle">
            {{ vm.totalMachines() }} {{ vm.totalMachines() !== 1 ? t().machinesTotal_plural : t().machinesTotal }}
          </p>
        </div>
        <button class="btn-primary" (click)="vm.openCreateModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {{ t().addMachine }}
        </button>
      </div>

      <!-- ── Stats Cards  -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-label">{{ t().statTotal }}</span>
            <div class="stat-icon" style="background: rgba(1,63,130,0.1)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--color-primary)">
                <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
              </svg>
            </div>
          </div>
          <p class="stat-value">{{ vm.totalMachines() }}</p>
        </div>

        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-label" style="color:#059669">Fonctionnels</span>
            <div class="stat-icon" style="background:rgba(5,150,105,0.1)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </div>
          <p class="stat-value" style="color:#059669">{{ vm.countByStatut('Fonctionnel') }}</p>
        </div>

        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-label" style="color:#dc2626">Non fonctionnels</span>
            <div class="stat-icon" style="background:rgba(220,38,38,0.1)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
            </div>
          </div>
          <p class="stat-value" style="color:#dc2626">{{ vm.countByStatut('Non fonctionnel') }}</p>
        </div>
      </div>

      <!-- ── Search & Filters  -->
      <div class="filters-row">
        <div class="search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text"
                 class="search-input"
                 [placeholder]="t().searchMachines"
                 [value]="vm.searchTerm()"
                 (input)="vm.searchTerm.set($any($event.target).value)"/>
        </div>

        <select class="filter-select"
                [value]="vm.filterStatut()"
                (change)="vm.filterStatut.set($any($event.target).value)">
          <option value="">{{ t().allStatuts }}</option>
          <option *ngFor="let s of vm.machineStatuts" [value]="s">{{ s }}</option>
        </select>
      </div>

      <!-- ── API Error Banner  -->
      <div class="alert-error" *ngIf="vm.errorMessage() && !vm.isModalOpen()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ vm.errorMessage() }}
        <button class="alert-retry" (click)="vm.loadMachines()">Réessayer</button>
      </div>

      <!-- ── Loading  -->
      <div class="loading-center" *ngIf="vm.isLoading() && vm.isEmpty()">
        <span class="spinner-lg"></span>
      </div>

      <!-- ── Empty State  -->
      <div class="empty-page" *ngIf="!vm.isLoading() && vm.isEmpty() && !vm.errorMessage()">
        <div class="empty-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <p>{{ t().noMachinesTitle }}</p>
        <span>{{ t().noMachinesDesc }}</span>
        <button class="btn-primary" (click)="vm.openCreateModal()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {{ t().addMachine }}
        </button>
      </div>

      <!-- ── Table  -->
      <div class="table-wrap" *ngIf="!vm.isEmpty()">

        <div class="table-loading" *ngIf="vm.isLoading()">
          <span class="spinner-lg"></span>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>{{ t().colMachine }}</th>
              <th>{{ t().colCapacity }}</th>
              <th>{{ t().colOperations }}</th>
              <th>{{ t().colStatut }}</th>
              <th>{{ t().colActions }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let machine of vm.filteredMachines()">

              <td>
                <div class="machine-cell">
                  <div class="machine-avatar">{{ machine.nomMachine.slice(0,2).toUpperCase() }}</div>
                  <div>
                    <div class="machine-name">{{ machine.nomMachine }}</div>
                  </div>
                </div>
              </td>

              <td>
                <span class="cell-value">{{ machine.capaciteMax }}</span>
                <span class="cell-unit">u/h</span>
              </td>

              <!-- Operations displayed as tags -->
              <td class="ops-cell">
                <div class="ops-tags" *ngIf="machine.operations">
                  <span class="op-tag" *ngFor="let op of machine.operations!.split(',')">
                    {{ op.trim() }}
                  </span>
                </div>
                <span *ngIf="!machine.operations" style="color:var(--border)">—</span>
              </td>

              <td>
                <span class="status-badge" [ngClass]="vm.getStatutClass(machine.statut)">
                  <span class="status-dot"
                        [class.dot-green]="machine.statut === 'Fonctionnel'"
                        [class.dot-red]="machine.statut === 'Non fonctionnel'"></span>
                  {{ machine.statut }}
                </span>
              </td>

              <td>
                <div class="action-row">
                  <button class="btn-icon" [title]="t().saveBtn" (click)="vm.openEditModal(machine)">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button class="btn-icon btn-icon-danger" [title]="t().deleteBtn" (click)="vm.requestDelete(machine.id!)">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              </td>

            </tr>

            <tr *ngIf="vm.filteredMachines().length === 0 && !vm.isLoading()">
              <td colspan="5" class="empty-row">{{ t().noSearchResult }}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div><!-- /page -->


    <!-- ═══════════════════════════════════════════════════════════
         MODAL: Create / Edit Machine
    ═══════════════════════════════════════════════════════════ -->
    <div class="modal-backdrop" *ngIf="vm.isModalOpen()" (click)="vm.closeModal()">
      <div class="modal" (click)="$event.stopPropagation()">

        <div class="modal-header">
          <div>
            <h3>{{ vm.isEditing() ? t().editMachineTitle : t().newMachineTitle }}</h3>
            <p class="modal-subtitle">
              {{ vm.isEditing() ? t().editMachineDesc : t().newMachineDesc }}
            </p>
          </div>
          <button class="modal-close" (click)="vm.closeModal()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Modal error -->
        <div class="modal-alert-error" *ngIf="vm.modalError()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ vm.modalError() }}
        </div>

        <form (ngSubmit)="vm.saveMachine()" class="modal-form">

          <!-- Nom machine -->
          <div class="field-group">
            <label class="f-label">{{ t().fieldNomMachine }} <span class="f-required">*</span></label>
            <input type="text" class="f-input"
                   [ngModel]="vm.editingMachine().nomMachine"
                   (ngModelChange)="vm.updateEditingField('nomMachine', $event)"
                   name="nomMachine" required placeholder="Ex: Machine Lavage Stone #1"/>
          </div>

          <!-- Statut + Capacité -->
          <div class="field-row">
            <div class="field-group">
              <label class="f-label">{{ t().fieldStatut }} <span class="f-required">*</span></label>
              <select class="f-input f-select"
                      [ngModel]="vm.editingMachine().statut"
                      (ngModelChange)="vm.updateEditingField('statut', $event)"
                      name="statut" required>
                <option *ngFor="let s of vm.machineStatuts" [value]="s">{{ s }}</option>
              </select>
            </div>
            <div class="field-group">
              <label class="f-label">{{ t().fieldCapacity }} <span class="f-hint">(u/h)</span> <span class="f-required">*</span></label>
              <input type="number" class="f-input"
                     [ngModel]="vm.editingMachine().capaciteMax"
                     (ngModelChange)="vm.updateEditingField('capaciteMax', +$event)"
                     name="capaciteMax" required min="1"/>
            </div>
          </div>

          <!-- Operations — checkboxes ─────────────────────────────────── -->
          <div class="field-group">
            <label class="f-label">
              {{ t().fieldOperations }} <span class="f-required">*</span>
              <span class="f-hint"> — sélectionnez les opérations supportées</span>
            </label>

            <!-- Loading state while ops are being fetched -->
            <div class="ops-loading" *ngIf="vm.availableOperations().length === 0">
              <span class="spinner-sm"></span>
              <span>Chargement des opérations…</span>
            </div>

            <div class="ops-checkbox-grid" *ngIf="vm.availableOperations().length > 0">
              <label class="ops-checkbox-item"
                     *ngFor="let op of vm.availableOperations()"
                     [class.ops-checkbox-item--checked]="vm.isOpChecked(op)">
                <input type="checkbox"
                       class="ops-checkbox-native"
                       [checked]="vm.isOpChecked(op)"
                       (change)="vm.toggleOp(op)"/>
                <span class="ops-checkbox-box">
                  <svg *ngIf="vm.isOpChecked(op)" width="11" height="11" viewBox="0 0 24 24"
                       fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
                <span class="ops-checkbox-label">{{ op }}</span>
              </label>
            </div>

            <!-- Summary of selected ops -->
            <div class="ops-selection-summary" *ngIf="vm.checkedOps().size > 0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {{ vm.checkedOps().size }} opération{{ vm.checkedOps().size > 1 ? 's' : '' }} sélectionnée{{ vm.checkedOps().size > 1 ? 's' : '' }}
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" (click)="vm.closeModal()">{{ t().cancel }}</button>
            <button type="submit" class="btn-primary">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {{ vm.isEditing() ? t().updateBtn : t().createMachineBtn }}
            </button>
          </div>

        </form>
      </div>
    </div>


    <!-- ═══════════════════════════════════════════════════════════
         MODAL: Delete Confirmation
    ═══════════════════════════════════════════════════════════ -->
    <div class="modal-backdrop" *ngIf="vm.confirmDeleteId() !== null" (click)="vm.cancelDelete()">
      <div class="modal modal-sm" (click)="$event.stopPropagation()">
        <div class="delete-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
          </svg>
        </div>
        <h3>{{ t().deleteMachineTitle }}</h3>
        <p>{{ t().deleteMachineDesc }}</p>
        <div class="modal-actions" style="justify-content:center">
          <button class="btn-secondary" (click)="vm.cancelDelete()">{{ t().cancel }}</button>
          <button class="btn-danger-solid" (click)="vm.confirmDelete()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            </svg>
            {{ t().deleteBtn }}
          </button>
        </div>
      </div>
    </div>

  `,
  styles: [`
    /* ── Page ─────────────────────────────────────────────────────────── */
    .page { padding: 1.5rem; max-width: 1200px; margin: 0 auto; min-height: 100vh; }

    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.75rem; flex-wrap: wrap; gap: 1rem; }
    .page-title  { font-size: 1.75rem; font-weight: 700; margin: 0 0 0.25rem; color: var(--text, #111827); }
    .page-subtitle { font-size: 0.9rem; color: var(--text-muted, #6b7280); margin: 0; }

    /* ── Stats ─────────────────────────────────────────────────────────── */
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    @media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }

    .stat-card     { background: var(--surface, #fff); border: 1px solid var(--border, #e5e7eb); border-radius: 14px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .stat-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.85rem; }
    .stat-label    { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted, #6b7280); }
    .stat-icon     { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; }
    .stat-value    { font-size: 2rem; font-weight: 800; margin: 0; line-height: 1; color: var(--text, #111827); }

    /* ── Filters ───────────────────────────────────────────────────────── */
    .filters-row { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1.25rem; }
    .search-wrap { position: relative; display: flex; align-items: center; flex: 1; min-width: 220px; }
    .search-wrap svg { position: absolute; left: 0.9rem; pointer-events: none; color: var(--text-muted, #9ca3af); }
    .search-input { width: 100%; padding: 0.65rem 0.9rem 0.65rem 2.5rem; border: 1.5px solid var(--border, #e5e7eb); border-radius: 10px; background: var(--surface, #fff); color: var(--text, #111827); font-size: 0.9rem; font-family: inherit; outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
    .search-input:focus { border-color: var(--color-primary, #013F82); box-shadow: 0 0 0 3px rgba(1,63,130,0.1); }
    .search-input::placeholder { color: var(--text-muted, #9ca3af); }
    .filter-select { padding: 0.65rem 2.4rem 0.65rem 0.9rem; border: 1.5px solid var(--border, #e5e7eb); border-radius: 10px; background: var(--surface, #fff); color: var(--text, #111827); font-size: 0.88rem; font-family: inherit; outline: none; cursor: pointer; appearance: none; min-width: 150px; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.75rem center; }
    .filter-select:focus { border-color: var(--color-primary, #013F82); box-shadow: 0 0 0 3px rgba(1,63,130,0.1); }

    /* ── Alert ─────────────────────────────────────────────────────────── */
    .alert-error  { display: flex; align-items: center; gap: 0.6rem; padding: 0.85rem 1rem; background: #fef2f2; border: 1px solid rgba(220,38,38,0.2); border-radius: 10px; color: #dc2626; font-size: 0.875rem; font-weight: 500; margin-bottom: 1.25rem; }
    .alert-retry  { margin-left: auto; background: none; border: none; cursor: pointer; color: #dc2626; font-size: 0.875rem; font-weight: 600; text-decoration: underline; font-family: inherit; }

    /* ── Loading ───────────────────────────────────────────────────────── */
    .loading-center { display: flex; align-items: center; justify-content: center; padding: 5rem 0; }
    .spinner-lg { display: inline-block; width: 36px; height: 36px; border: 3px solid var(--border, #e5e7eb); border-top-color: var(--color-primary, #013F82); border-radius: 50%; animation: spin 0.7s linear infinite; }
    .spinner-sm { display: inline-block; width: 16px; height: 16px; border: 2px solid var(--border, #e5e7eb); border-top-color: var(--color-primary, #013F82); border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Empty ─────────────────────────────────────────────────────────── */
    .empty-page { text-align: center; padding: 5rem 1rem; background: var(--surface, #fff); border: 1px solid var(--border, #e5e7eb); border-radius: 14px; }
    .empty-icon { width: 68px; height: 68px; border-radius: 16px; background: rgba(1,63,130,0.07); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; color: var(--color-primary, #013F82); }
    .empty-page p    { margin: 0 0 0.4rem; font-size: 1rem; font-weight: 600; color: var(--text, #111827); }
    .empty-page span { display: block; font-size: 0.88rem; color: var(--text-muted, #6b7280); margin-bottom: 1.75rem; }
    .empty-row { text-align: center; padding: 3rem 1rem; color: var(--text-muted, #6b7280); font-size: 0.9rem; }

    /* ── Table ─────────────────────────────────────────────────────────── */
    .table-wrap    { position: relative; overflow-x: auto; background: var(--surface, #fff); border: 1px solid var(--border, #e5e7eb); border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .table-loading { position: absolute; inset: 0; background: var(--surface-overlay, rgba(255,255,255,0.75)); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; z-index: 10; border-radius: 14px; }
    .table         { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
    .table thead   { background: var(--surface-alt, #f9fafb); border-bottom: 2px solid var(--border, #e5e7eb); }
    .table th      { text-align: left; padding: 0.95rem 1.25rem; font-weight: 600; color: var(--text-muted, #6b7280); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.07em; white-space: nowrap; }
    .table td      { padding: 1rem 1.25rem; border-top: 1px solid var(--border, #e5e7eb); color: var(--text, #111827); vertical-align: middle; }
    .table tbody tr { transition: background 0.12s; }
    .table tbody tr:hover { background: var(--surface-alt, #f9fafb); }

    .machine-cell   { display: flex; align-items: center; gap: 0.75rem; }
    .machine-avatar { width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, var(--color-primary, #013F82), var(--color-primary-dark, #012D5E)); color: #fff; font-size: 0.68rem; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; text-transform: uppercase; }
    .machine-name   { font-weight: 600; font-size: 0.875rem; color: var(--text, #111827); line-height: 1.3; }
    .cell-value     { font-weight: 600; font-size: 0.88rem; color: var(--text, #111827); }
    .cell-unit      { font-size: 0.75rem; color: var(--text-muted, #6b7280); margin-left: 2px; }
    .ops-cell       { max-width: 220px; }

    /* Op tags in table cell */
    .ops-tags { display: flex; flex-wrap: wrap; gap: 0.3rem; }
    .op-tag   { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 20px; font-size: 0.72rem; font-weight: 600; background: rgba(1,63,130,0.08); color: var(--color-primary, #013F82); border: 1px solid rgba(1,63,130,0.15); white-space: nowrap; }

    /* ── Badges ─────────────────────────────────────────────────────────── */
    .status-badge { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.75rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; white-space: nowrap; }
    .status-dot   { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
    .dot-green    { background: #22c55e; }
    .dot-red      { background: #ef4444; }

    /* ── Actions ─────────────────────────────────────────────────────────── */
    .action-row { display: flex; gap: 0.4rem; align-items: center; }
    .btn-icon   { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; padding: 0; background: var(--surface-alt, #f3f4f6); border: 1px solid transparent; border-radius: 6px; color: var(--text-muted, #6b7280); cursor: pointer; transition: all 0.14s; }
    .btn-icon:hover { background: var(--border, #e5e7eb); color: var(--text, #374151); }
    .btn-icon-danger:hover { background: rgba(220,38,38,0.1); color: #dc2626; border-color: rgba(220,38,38,0.2); }

    /* ── Shared buttons ──────────────────────────────────────────────────── */
    .btn-primary      { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.2rem; background: var(--color-primary, #013F82); color: #fff; border: none; border-radius: 8px; font-size: 0.88rem; font-weight: 600; font-family: inherit; cursor: pointer; transition: opacity 0.15s, transform 0.1s; white-space: nowrap; }
    .btn-primary:hover  { opacity: 0.88; }
    .btn-primary:active { transform: scale(0.98); }
    .btn-secondary    { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.1rem; background: #e8edf4 !important; color: #0F1C2E !important; border: 1.5px solid #c8d4e0 !important; border-radius: 8px; font-size: 0.88rem; font-weight: 600; font-family: inherit; cursor: pointer; transition: background 0.14s; }
    .btn-secondary:hover { background: #d0dae6 !important; }
    .btn-danger-solid { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.1rem; background: #dc2626; color: #fff; border: none; border-radius: 8px; font-size: 0.88rem; font-weight: 600; font-family: inherit; cursor: pointer; transition: opacity 0.14s; }
    .btn-danger-solid:hover { opacity: 0.88; }

    /* ── Toast ───────────────────────────────────────────────────────────── */
    .toast         { position: fixed; bottom: 2rem; right: 2rem; display: flex; align-items: center; gap: 0.6rem; padding: 0.75rem 1.15rem; border-radius: 10px; font-size: 0.875rem; font-weight: 500; z-index: 9999; box-shadow: 0 8px 32px rgba(0,0,0,0.18); animation: toastIn 0.3s cubic-bezier(0.34,1.4,0.64,1); max-width: 340px; }
    .toast-success { background: #16a34a; color: #fff; }
    .toast-error   { background: #dc2626; color: #fff; }
    @keyframes toastIn { from { transform: translateY(12px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }

    /* ── Modal ────────────────────────────────────────────────────────────── */
    .modal-backdrop { position: fixed !important; inset: 0 !important; width: 100vw !important; height: 100vh !important; background: rgba(0,0,0,0.5) !important; display: flex !important; align-items: center !important; justify-content: center !important; z-index: 99999 !important; padding: 1rem; animation: fadeIn 0.15s ease; overflow: auto; pointer-events: all !important; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .modal    { position: relative !important; background: var(--surface, #fff) !important; border-radius: 14px; width: 100%; max-width: 580px; max-height: 90vh; overflow-y: auto; padding: 1.75rem; box-shadow: 0 20px 60px rgba(0,0,0,0.3); border: 1px solid var(--border, #e5e7eb); animation: slideUp 0.2s cubic-bezier(0.34,1.2,0.64,1); }
    .modal-sm { max-width: 380px; text-align: center; }
    @keyframes slideUp { from { transform: translateY(16px) scale(0.97); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }

    .modal-header    { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .modal-header h3 { font-size: 1.1rem; font-weight: 700; margin: 0; color: var(--text); }
    .modal-subtitle  { font-size: 0.8rem; color: var(--text-muted); margin: 0.3rem 0 0; }
    .modal-close     { background: #e8edf4 !important; border: 1.5px solid #c8d4e0 !important; cursor: pointer; color: #374151 !important; padding: 6px; border-radius: 8px; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; flex-shrink: 0; transition: all 0.14s; }
    .modal-close:hover { background: #d0dae6 !important; }
    .modal-form    { display: flex; flex-direction: column; gap: 1rem; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 0.6rem; margin-top: 0.5rem; padding-top: 1rem; border-top: 1px solid var(--border, #e5e7eb); }

    .delete-icon  { width: 56px; height: 56px; border-radius: 50%; background: rgba(220,38,38,0.1); color: #dc2626; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; }
    .modal-sm h3  { font-size: 1.05rem; font-weight: 700; margin: 0 0 0.4rem; color: var(--text); }
    .modal-sm p   { color: var(--text-muted); font-size: 0.88rem; margin: 0 0 1.5rem; }

    /* ── Form fields ──────────────────────────────────────────────────────── */
    .field-group { display: flex; flex-direction: column; gap: 0.35rem; }
    .field-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    @media (max-width: 480px) { .field-row { grid-template-columns: 1fr; } }

    .f-label    { font-size: 0.81rem; font-weight: 600; color: var(--text); letter-spacing: 0.01em; display: flex; align-items: center; gap: 0.3rem; flex-wrap: wrap; }
    .f-hint     { font-size: 0.72rem; color: var(--text-muted); font-weight: 400; }
    .f-required { color: #dc2626; font-size: 0.85rem; font-weight: 700; }

    .f-input { width: 100%; padding: 0.6rem 0.85rem; border: 1.5px solid var(--border, #e5e7eb); border-radius: 8px; background: var(--surface, #fff); color: var(--text); font-size: 0.875rem; font-family: inherit; outline: none; transition: border-color 0.15s, box-shadow 0.15s; appearance: none; -webkit-appearance: none; }
    .f-input::placeholder { color: var(--text-muted, #9ca3af); }
    .f-input:focus { border-color: var(--color-primary, #013F82); box-shadow: 0 0 0 3px rgba(1,63,130,0.12); }
    .f-select { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.75rem center; padding-right: 2.25rem; cursor: pointer; }

    /* ── Operations loading state ────────────────────────────────────────── */
    .ops-loading {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 1rem;
      color: var(--text-muted, #6b7280);
      font-size: 0.85rem;
      background: var(--surface-alt, #f9fafb);
      border: 1.5px solid var(--border, #e5e7eb);
      border-radius: 10px;
    }

    /* ── Operations checkbox grid ────────────────────────────────────────── */
    .ops-checkbox-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 0.5rem;
      padding: 0.75rem;
      background: var(--surface-alt, #f9fafb);
      border: 1.5px solid var(--border, #e5e7eb);
      border-radius: 10px;
    }

    .ops-checkbox-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      border: 1.5px solid var(--border, #e5e7eb);
      background: var(--surface, #fff);
      cursor: pointer;
      transition: border-color 0.14s, background 0.14s, box-shadow 0.14s;
      user-select: none;
    }
    .ops-checkbox-item:hover {
      border-color: rgba(1,63,130,0.35);
      background: rgba(1,63,130,0.03);
    }
    .ops-checkbox-item--checked {
      border-color: var(--color-primary, #013F82);
      background: rgba(1,63,130,0.06);
      box-shadow: 0 0 0 2px rgba(1,63,130,0.1);
    }

    .ops-checkbox-native { display: none; }

    .ops-checkbox-box {
      width: 18px; height: 18px; flex-shrink: 0;
      border: 2px solid var(--border, #d1d5db);
      border-radius: 5px;
      background: var(--surface, #fff);
      display: flex; align-items: center; justify-content: center;
      transition: border-color 0.14s, background 0.14s;
      color: #fff;
    }
    .ops-checkbox-item--checked .ops-checkbox-box {
      border-color: var(--color-primary, #013F82);
      background: var(--color-primary, #013F82);
    }

    .ops-checkbox-label {
      font-size: 0.845rem;
      font-weight: 500;
      color: var(--text, #111827);
    }
    .ops-checkbox-item--checked .ops-checkbox-label {
      font-weight: 600;
      color: var(--color-primary, #013F82);
    }

    .ops-selection-summary {
      display: inline-flex; align-items: center; gap: 0.35rem;
      font-size: 0.78rem; font-weight: 600;
      color: #059669;
      margin-top: 0.15rem;
    }

    /* ── Modal error ──────────────────────────────────────────────────────── */
    .modal-alert-error { display: flex; align-items: flex-start; gap: 0.6rem; padding: 0.8rem 1rem; background: #fef2f2; border: 1px solid rgba(220,38,38,0.25); border-radius: 8px; color: #dc2626; font-size: 0.845rem; font-weight: 500; line-height: 1.45; margin-bottom: 0.25rem; animation: toastIn 0.2s ease; }
  `]
})
export class MachineComponent implements OnInit {
  vm = inject(MachineViewModel);
  t  = inject(LanguageService).t;

  ngOnInit(): void {
    this.vm.loadOperations(); // ← fetch ops list from backend first
    this.vm.loadMachines();
  }
}
