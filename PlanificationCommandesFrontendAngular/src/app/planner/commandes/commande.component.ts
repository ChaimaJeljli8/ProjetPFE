import { Component, OnInit, ViewChild, ElementRef, HostListener, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommandeViewModel } from './commande.viewmodel';

@Component({
  selector: 'app-commande',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  providers: [CommandeViewModel],
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
          <h1 class="page-title">{{ vm.t().commandesTitle }}</h1>
          <p class="page-subtitle">
            {{ vm.totalCommandes() }} {{ vm.totalCommandes() !== 1 ? vm.t().commandesSubtitle_plural : vm.t().commandesSubtitle }}
          </p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" (click)="vm.openImportModal()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            {{ vm.t().importCsv }}
          </button>
          <button class="btn-primary" (click)="vm.openCreateModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            {{ vm.t().addCommande }}
          </button>
        </div>
      </div>

      <!-- ── Stats Cards ──────────────────────────────────────────────────── -->
      <div class="stats-grid">

        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-label">{{ vm.t().statTotal }}</span>
            <div class="stat-icon" style="background:rgba(1,63,130,0.1)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary,#013F82)" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
          </div>
          <p class="stat-value">{{ vm.totalCommandes() }}</p>
        </div>

        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-label" style="color:#d97706">{{ vm.t().statPending }}</span>
            <div class="stat-icon" style="background:rgba(217,119,6,0.1)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
          </div>
          <p class="stat-value" style="color:#d97706">{{ vm.countByStatut('En attente') }}</p>
        </div>

        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-label" style="color:#2563eb">{{ vm.t().statInProgress }}</span>
            <div class="stat-icon" style="background:rgba(37,99,235,0.1)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            </div>
          </div>
          <p class="stat-value" style="color:#2563eb">{{ vm.countByStatut('En cours') }}</p>
        </div>

        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-label" style="color:#dc2626">{{ vm.t().statUrgence1 }}</span>
            <div class="stat-icon" style="background:rgba(220,38,38,0.1)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
          </div>
          <p class="stat-value" style="color:#dc2626">{{ vm.countUrgence1() }}</p>
        </div>

      </div>

      <!-- ── Search & Filters ─────────────────────────────────────────────── -->
      <div class="filters-row">

        <div class="search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" class="search-input"
                 placeholder="{{ vm.t().searchCommandes }}"
                 [value]="vm.searchTerm()"
                 (input)="vm.searchTerm.set($any($event.target).value)"/>
        </div>

        <!-- Urgence filter: free number input -->
        <div class="filter-num-wrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          </svg>
          <input type="number" min="1" class="filter-num-input"
                 placeholder="{{ vm.t().filterUrgencePlaceholder }}"
                 [value]="vm.filterUrgence()"
                 (input)="vm.filterUrgence.set($any($event.target).value)"
                 (change)="vm.filterUrgence.set($any($event.target).value)"/>
          <button class="filter-num-clear"
                  *ngIf="vm.filterUrgence()"
                  (click)="vm.filterUrgence.set('')" title="{{ vm.t().cancel }}">✕</button>
        </div>

        <select class="filter-select"
                [value]="vm.filterStatut()"
                (change)="vm.filterStatut.set($any($event.target).value)">
          <option value="">{{ vm.t().filterAllStatuts }}</option>
          <option *ngFor="let s of vm.statutOptions" [value]="s">{{ s }}</option>
        </select>

        <select class="filter-select"
                [value]="vm.filterRecetteId()"
                (change)="vm.filterRecetteId.set($any($event.target).value)">
          <option value="">{{ vm.t().filterAllRecettes }}</option>
          <option *ngFor="let r of vm.recettes()" [value]="r.id">{{ r.nomRecette }}</option>
        </select>

      </div>

      <!-- ── API Error ─────────────────────────────────────────────────────── -->
      <div class="alert-error" *ngIf="vm.errorMessage() && !vm.isModalOpen()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ vm.errorMessage() }}
        <button class="alert-retry" (click)="vm.loadAll()">{{ vm.t().retryBtn }}</button>
      </div>

      <!-- ── Loading ──────────────────────────────────────────────────────── -->
      <div class="loading-center" *ngIf="vm.isLoading() && vm.isEmpty()">
        <span class="spinner-lg"></span>
      </div>

      <!-- ── Empty State ──────────────────────────────────────────────────── -->
      <div class="empty-page" *ngIf="!vm.isLoading() && vm.isEmpty() && !vm.errorMessage()">
        <div class="empty-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <p>{{ vm.t().noCommandesTitle }}</p>
        <span>{{ vm.t().noCommandesDesc }}</span>
        <button class="btn-primary" (click)="vm.openCreateModal()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {{ vm.t().addCommande }}
        </button>
      </div>

      <!-- ── Table ────────────────────────────────────────────────────────── -->
      <div class="table-wrap" *ngIf="!vm.isEmpty()">

        <div class="table-loading" *ngIf="vm.isLoading()">
          <span class="spinner-lg"></span>
        </div>

        <div class="table-scroll">
          <table class="table">
            <thead>
              <tr>
                <th>{{ vm.t().colNumeroCommande }}</th>
                <th>{{ vm.t().colDateExport }}</th>
                <th>{{ vm.t().colUrgence }}</th>
                <th>{{ vm.t().colQuantite }}</th>
                <th>{{ vm.t().colRecette }}</th>
                <th>{{ vm.t().colStatut }}</th>
                <th>{{ vm.t().colActions }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of vm.filteredCommandes()">

                <td>
                  <div class="machine-cell">
                    <div class="machine-avatar">{{ c.numeroCommande.slice(0,2) }}</div>
                    <div class="machine-name">{{ c.numeroCommande }}</div>
                  </div>
                </td>

                <td><span class="cell-value">{{ c.dateExport | date:'dd/MM/yyyy HH:mm' }}</span></td>

                <!-- Urgence: plain number badge, colour shifts with value -->
                <td>
                  <span class="urgence-badge" [class.u-low]="c.urgence === 1" [class.u-med]="c.urgence > 1 && c.urgence <= 3" [class.u-high]="c.urgence > 3">
                    {{ c.urgence }}
                  </span>
                </td>

                <td>
                  <span class="cell-value">{{ c.quantite }}</span>
                  <span class="cell-unit">u</span>
                </td>

                <td>
                  <button class="btn-recette" (click)="vm.openViewRecette(c.recetteId)">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    {{ c.nomRecette ?? vm.recetteName(c.recetteId) }}
                  </button>
                </td>

                <td>
                  <span class="status-badge" [ngClass]="vm.getStatutClass(c.statut)">
                    <span class="status-dot"
                          [class.dot-orange]="c.statut === 'En attente'"
                          [class.dot-blue]="c.statut === 'En cours'"
                          [class.dot-green]="c.statut === 'Terminé'"
                          [class.dot-red]="c.statut === 'Annulé'"></span>
                    {{ c.statut }}
                  </span>
                </td>

                <td>
                  <div class="action-row">
                    <button class="btn-icon" title="{{ vm.t().saveBtn }}" (click)="vm.openEditModal(c)">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button class="btn-icon btn-icon-danger" title="{{ vm.t().deleteBtn }}" (click)="vm.requestDelete(c.id)">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  </div>
                </td>

              </tr>

              <tr *ngIf="vm.filteredCommandes().length === 0 && !vm.isEmpty()">
                <td colspan="7" class="empty-row">{{ vm.t().noCommandesSearchResult }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div><!-- /page -->


    <!-- ══════════════════════════════════════════════════════════════════════
         MODAL: Create / Edit Commande
    ══════════════════════════════════════════════════════════════════════════ -->
    <div class="modal-backdrop"
         *ngIf="vm.modalMode() === 'create' || vm.modalMode() === 'edit'"
         (click)="$event.target === $event.currentTarget && vm.closeModal()">
      <div class="modal">

        <div class="modal-header">
          <div>
            <h3>{{ vm.modalMode() === 'edit' ? vm.t().editCommandeTitle : vm.t().createCommandeTitle }}</h3>
            <p class="modal-subtitle">{{ vm.modalMode() === 'edit' ? vm.t().editCommandeSubtitle : vm.t().createCommandeSubtitle }}</p>
          </div>
          <button class="modal-close" (click)="vm.closeModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-alert-error" *ngIf="vm.modalError()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ vm.modalError() }}
        </div>

        <div class="modal-form">

          <div class="field-row">
            <div class="field-group">
              <label class="f-label">{{ vm.t().fieldNumeroCommande }} <span class="f-required">*</span></label>
              <input class="f-input" type="text" placeholder="{{ vm.t().fieldNumeroCommandePlaceholder }}"
                     [value]="vm.form().numeroCommande"
                     (input)="vm.updateForm('numeroCommande', $any($event.target).value)"/>
            </div>
            <div class="field-group" style="position:relative">
              <label class="f-label">{{ vm.t().fieldDateExport }} <span class="f-required">*</span></label>

              <!-- Trigger button -->
              <button type="button" class="f-input dt-trigger"
                      (click)="toggleDatePicker($event)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;color:var(--color-primary,#013F82)">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span style="flex:1;text-align:left;color:var(--text)">
                  {{ vm.form().dateExport ? formatDisplayDate(vm.form().dateExport) : 'Sélectionner une date et heure' }}
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--text-muted)">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              <!-- Calendar dropdown -->
              <div class="dt-picker" *ngIf="datePickerOpen" (click)="$event.stopPropagation()">

                <!-- Month navigation -->
                <div class="dt-nav">
                  <button type="button" class="dt-nav-btn" (click)="prevMonth()">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  <span class="dt-month-label">{{ monthLabel }}</span>
                  <button type="button" class="dt-nav-btn" (click)="nextMonth()">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>

                <!-- Day-of-week headers -->
                <div class="dt-weekdays">
                  <span *ngFor="let d of weekDays">{{ d }}</span>
                </div>

                <!-- Day grid -->
                <div class="dt-grid">
                  <button type="button" *ngFor="let cell of calendarCells"
                          class="dt-cell"
                          [class.dt-other-month]="cell.otherMonth"
                          [class.dt-today]="cell.isToday"
                          [class.dt-selected]="cell.isSelected"
                          [class.dt-past]="cell.isPast"
                          [disabled]="cell.isPast"
                          (click)="selectDay(cell.date)">
                    {{ cell.day }}
                  </button>
                </div>

                <!-- Time picker -->
                <div class="dt-time-row">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--text-muted);flex-shrink:0">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span class="dt-time-label">Heure :</span>
                  <select class="dt-time-select" [ngModel]="pickerHour" (ngModelChange)="setHour($event)">
                    <option *ngFor="let h of hours" [value]="h">{{ h | number:'2.0-0' }}h</option>
                  </select>
                  <span class="dt-time-sep">:</span>
                  <select class="dt-time-select" [ngModel]="pickerMinute" (ngModelChange)="setMinute($event)">
                    <option *ngFor="let m of minutes" [value]="m">{{ m | number:'2.0-0' }}</option>
                  </select>
                </div>

                <!-- Confirm / Clear -->
                <div class="dt-footer">
                  <button type="button" class="dt-clear-btn" (click)="clearDate()">Effacer</button>
                  <button type="button" class="dt-confirm-btn" (click)="confirmDate()">Confirmer</button>
                </div>

              </div>
            </div>
          </div>

          <div class="field-row">
            <!-- Urgence: free numeric input, any positive integer -->
            <div class="field-group">
              <label class="f-label">
                {{ vm.t().fieldUrgence }} <span class="f-required">*</span>
                <span class="f-hint"> {{ vm.t().fieldUrgenceHint }}</span>
              </label>
              <input class="f-input" type="number" min="1" step="1" placeholder="{{ vm.t().fieldNumeroCommandePlaceholder }}"
                     [value]="vm.form().urgence"
                     (input)="vm.updateForm('urgence', +$any($event.target).value)"/>
            </div>
            <div class="field-group">
              <label class="f-label">{{ vm.t().fieldQuantite }} <span class="f-required">*</span></label>
              <input class="f-input" type="number" min="1" placeholder="{{ vm.t().fieldQuantitePlaceholder }}"
                     [value]="vm.form().quantite"
                     (input)="vm.updateForm('quantite', +$any($event.target).value)"/>
            </div>
          </div>

          <div class="field-group">
            <label class="f-label">{{ vm.t().fieldRecette }} <span class="f-required">*</span></label>
            <select class="f-input f-select"
                    [ngModel]="vm.form().recetteId"
                    (ngModelChange)="vm.updateForm('recetteId', +$event)">
              <option [value]="0" disabled>{{ vm.t().fieldRecettePlaceholder }}</option>
              <option *ngFor="let r of vm.recettes()" [value]="r.id">
                {{ r.nomRecette }}<ng-container *ngIf="r.nombreOperations"> — {{ r.nombreOperations }} {{ vm.t().recetteOps }}</ng-container>
              </option>
            </select>
          </div>

          <div class="field-group" *ngIf="vm.modalMode() === 'edit'">
            <label class="f-label">{{ vm.t().fieldStatut }}</label>
            <select class="f-input f-select"
                    [ngModel]="vm.form().statut"
                    (ngModelChange)="vm.updateForm('statut', $event)">
              <option *ngFor="let s of vm.statutOptions" [value]="s">{{ s }}</option>
            </select>
          </div>

        </div>

        <div class="modal-actions">
          <button class="btn-secondary" (click)="vm.closeModal()">{{ vm.t().cancel }}</button>
          <button class="btn-primary" (click)="vm.save()">
            {{ vm.modalMode() === 'edit' ? vm.t().updateCommandeBtn : vm.t().createCommandeBtn }}
          </button>
        </div>

      </div>
    </div>


    <!-- ══════════════════════════════════════════════════════════════════════
         MODAL: View Recette Operations
    ══════════════════════════════════════════════════════════════════════════ -->
    <div class="modal-backdrop"
         *ngIf="vm.modalMode() === 'view-recette'"
         (click)="$event.target === $event.currentTarget && vm.closeModal()">
      <div class="modal modal-recette" *ngIf="vm.viewingRecette() as r">

        <div class="modal-header">
          <div>
            <h3>{{ r.nomRecette }}</h3>
            <p class="modal-subtitle">{{ r.nombreOperations }} {{ vm.t().recetteOps }} · {{ r.dureeTotaleMinutes }} {{ vm.t().recetteMins }}</p>
          </div>
          <button class="modal-close" (click)="vm.closeModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="ops-list">
          <div class="op-item" *ngFor="let op of r.operations">
            <div class="op-ordre">{{ op.ordre }}</div>
            <div class="op-body">
              <div class="op-name">{{ op.nomOperation }}</div>
              <div class="op-meta">
                <span title="Durée opération">⚙ {{ op.dureeMinutes }} min</span>
                <span class="op-sep">·</span>
                <span title="Chargement">↑ {{ op.tempsChargementMinutes }} min</span>
                <span class="op-sep">·</span>
                <span title="Déchargement">↓ {{ op.tempsDecharementMinutes }} min</span>
                <span class="op-sep">·</span>
                <span>Lot: {{ op.quantiteLot }}</span>
              </div>
            </div>
            <div class="op-duration">{{ op.dureeMinutes }}<small>min</small></div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-secondary" (click)="vm.closeModal()">{{ vm.t().closeBtn }}</button>
        </div>

      </div>
    </div>


    <!-- Hidden file input -->
    <input #fileInputRef type="file" accept=".csv"
           style="position:absolute;width:0;height:0;opacity:0;pointer-events:none"
           (change)="onFileInputChange($event)"/>

    <!-- ══════════════════════════════════════════════════════════════════════
         MODAL: Import CSV
    ══════════════════════════════════════════════════════════════════════════ -->
    <div class="modal-backdrop"
         *ngIf="vm.modalMode() === 'import'"
         (click)="$event.target === $event.currentTarget && vm.closeModal()">
      <div class="modal">

        <div class="modal-header">
          <div>
            <h3>{{ vm.t().importCommandesTitle }}</h3>
            <p class="modal-subtitle">{{ vm.t().importCommandesSubtitle }}</p>
          </div>
          <button class="modal-close" (click)="vm.closeModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-alert-error" *ngIf="vm.modalError()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
          </svg>
          {{ vm.modalError() }}
        </div>

        <div class="csv-hint">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {{ vm.t().csvHintColumns }}
          <code>NumeroCommande, DateExport, Urgence (entier ≥ 1), Quantite, NomRecette</code>
        </div>

        <div class="drop-zone"
             [class.has-file]="vm.importFile()"
             (dragover)="$event.preventDefault()"
             (dragleave)="onDragLeave($event)"
             (drop)="onDrop($event)">
          <ng-container *ngIf="!vm.importFile()">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--text-muted)">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span class="drop-text">{{ vm.t().dropZoneText }}</span>
            <span class="drop-or">{{ vm.t().dropZoneOr }}</span>
            <button class="btn-browse" type="button" (click)="triggerFilePicker()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              {{ vm.t().browseFiles }}
            </button>
          </ng-container>
          <ng-container *ngIf="vm.importFile() as f">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            <span style="font-size:0.875rem;font-weight:600">{{ f.name }}</span>
            <span style="font-size:0.78rem;color:var(--text-muted)">{{ (f.size / 1024).toFixed(1) }} KB</span>
            <button class="btn-change-file" type="button" (click)="triggerFilePicker()">{{ vm.t().changeFile }}</button>
          </ng-container>
        </div>

        <div class="import-result" *ngIf="vm.importResult() as result">
          <div class="import-stat ok">✓ {{ result.imported }} {{ vm.t().importedCount }}</div>
          <div class="import-stat skip" *ngIf="result.skipped > 0">⊘ {{ result.skipped }} {{ vm.t().skippedCount }}</div>
          <div class="import-errors" *ngIf="result.errors.length > 0">
            <div *ngFor="let e of result.errors" class="import-error-row">
              Ligne {{ e.row }} <span *ngIf="e.numeroCommande">({{ e.numeroCommande }})</span>: {{ e.reason }}
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-secondary" (click)="vm.closeModal()">{{ vm.t().cancel }}</button>
          <button class="btn-primary"
                  [disabled]="!vm.importFile() || vm.importLoading()"
                  (click)="vm.runImport()">
            <span class="spinner" *ngIf="vm.importLoading()"></span>
            {{ vm.importLoading() ? vm.t().importingBtn : vm.t().importBtn }}
          </button>
        </div>

      </div>
    </div>


    <!-- ══════════════════════════════════════════════════════════════════════
         MODAL: Delete Confirm
    ══════════════════════════════════════════════════════════════════════════ -->
    <div class="modal-backdrop" *ngIf="vm.confirmDeleteId() !== null">
      <div class="modal modal-sm">
        <div class="delete-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
          </svg>
        </div>
        <h3>{{ vm.t().deleteCommandeTitle }}</h3>
        <p>{{ vm.t().deleteCommandeDesc }}</p>
        <div class="modal-actions" style="justify-content:center">
          <button class="btn-secondary" (click)="vm.cancelDelete()">{{ vm.t().cancel }}</button>
          <button class="btn-danger-solid" (click)="vm.confirmDelete()">Supprimer</button>
        </div>
      </div>
    </div>

  `,
  styles: [`
    .page { padding: 1.25rem; max-width: 1300px; margin: 0 auto; }
    @media (min-width: 640px) { .page { padding: 2rem; } }

    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.75rem; gap: 1rem; flex-wrap: wrap; }
    .page-title   { font-size: 1.25rem; font-weight: 700; color: var(--text); margin: 0; }
    @media (min-width: 480px) { .page-title { font-size: 1.5rem; } }
    .page-subtitle{ font-size: 0.85rem; color: var(--text-muted); margin: 0.25rem 0 0; }
    .header-actions { display: flex; gap: 0.6rem; flex-wrap: wrap; }

    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin-bottom: 1.5rem; }
    @media (min-width: 900px) { .stats-grid { grid-template-columns: repeat(4, 1fr); gap: 1rem; } }
    .stat-card { background: var(--surface, #fff); border: 1px solid var(--border, #e5e7eb); border-radius: 12px; padding: 1rem 1.2rem; }
    .stat-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .stat-label { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); }
    .stat-icon  { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .stat-value { font-size: 1.6rem; font-weight: 700; color: var(--text); margin: 0; }

    /* ── Filters row ── */
    .filters-row { display: grid; grid-template-columns: 1fr; gap: 0.6rem; margin-bottom: 1.25rem; }
    @media (min-width: 600px)  { .filters-row { grid-template-columns: 1fr 1fr; } }
    @media (min-width: 960px)  { .filters-row { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; } }

    .search-wrap { position: relative; display: flex; align-items: center; }
    @media (min-width: 960px)  { .search-wrap { flex: 1; min-width: 200px; } }
    .search-wrap svg { position: absolute; left: 0.75rem; color: var(--text-muted); pointer-events: none; }
    .search-input { width: 100%; padding: 0.55rem 0.85rem 0.55rem 2.25rem; border: 1.5px solid var(--border, #e5e7eb); border-radius: 8px; background: var(--surface, #fff); color: var(--text); font-size: 0.875rem; font-family: inherit; outline: none; }
    .search-input:focus { border-color: var(--color-primary, #013F82); box-shadow: 0 0 0 3px rgba(1,63,130,0.1); }

    /* Urgence number filter */
    .filter-num-wrap { position: relative; display: inline-flex; align-items: center; }
    .filter-num-wrap svg { position: absolute; left: 0.65rem; color: var(--text-muted); pointer-events: none; flex-shrink: 0; }
    .filter-num-input { padding: 0.55rem 1.8rem 0.55rem 2rem; border: 1.5px solid var(--border, #e5e7eb); border-radius: 8px; background: var(--surface, #fff); color: var(--text); font-size: 0.875rem; font-family: inherit; outline: none; width: 130px; -moz-appearance: textfield; }
    .filter-num-input::-webkit-inner-spin-button,
    .filter-num-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
    .filter-num-input:focus { border-color: var(--color-primary, #013F82); box-shadow: 0 0 0 3px rgba(1,63,130,0.1); }
    .filter-num-clear { position: absolute; right: 0.45rem; background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.75rem; padding: 2px 4px; line-height: 1; border-radius: 4px; }
    .filter-num-clear:hover { background: var(--surface-2, #f3f4f6); color: var(--text); }

    .filter-select { padding: 0.55rem 2rem 0.55rem 0.85rem; border: 1.5px solid var(--border, #e5e7eb); border-radius: 8px; background: var(--surface, #fff); color: var(--text); font-size: 0.875rem; font-family: inherit; outline: none; cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.65rem center; -webkit-appearance: none; appearance: none; }

    .alert-error { display: flex; align-items: center; gap: 0.6rem; padding: 0.8rem 1rem; background: #fef2f2; border: 1px solid rgba(220,38,38,0.2); border-radius: 8px; color: #dc2626; font-size: 0.875rem; margin-bottom: 1rem; }
    .alert-retry { margin-left: auto; background: none; border: 1px solid #dc2626; color: #dc2626; border-radius: 6px; padding: 0.25rem 0.6rem; font-size: 0.8rem; cursor: pointer; font-family: inherit; }

    .loading-center { display: flex; justify-content: center; padding: 4rem; }
    .spinner-lg { width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--color-primary, #013F82); border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
    .spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-page { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 2rem; gap: 0.6rem; text-align: center; }
    .empty-icon { width: 64px; height: 64px; border-radius: 50%; background: var(--surface, #f9fafb); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--text-muted); margin-bottom: 0.5rem; }
    .empty-page p    { font-weight: 600; color: var(--text); margin: 0; }
    .empty-page span { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem; }

    .table-wrap { background: var(--surface, #fff); border: 1px solid var(--border, #e5e7eb); border-radius: 12px; overflow: hidden; position: relative; }
    .table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
    .table-loading { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.7); z-index: 10; }
    .table { width: 100%; border-collapse: collapse; min-width: 620px; }
    .table thead tr { background: var(--surface-2, #f9fafb); }
    .table th { padding: 0.75rem 0.85rem; text-align: left; font-size: 0.78rem; font-weight: 600; color: var(--text-muted); letter-spacing: 0.04em; text-transform: uppercase; border-bottom: 1px solid var(--border, #e5e7eb); white-space: nowrap; }
    .table td { padding: 0.85rem; border-bottom: 1px solid var(--border, #e5e7eb); font-size: 0.875rem; color: var(--text); vertical-align: middle; }
    .table tbody tr:last-child td { border-bottom: none; }
    .table tbody tr:hover { background: var(--surface-2, #f9fafb); }

    .machine-cell   { display: flex; align-items: center; gap: 0.65rem; }
    .machine-avatar { width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0; background: rgba(1,63,130,0.1); color: var(--color-primary, #013F82); display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 700; }
    .machine-name   { font-weight: 600; font-size: 0.875rem; }
    .cell-value { font-weight: 600; }
    .cell-unit  { font-size: 0.75rem; color: var(--text-muted); margin-left: 2px; }

    /* Urgence badge — plain number, three colour zones */
    .urgence-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 28px; height: 28px; padding: 0 6px; border-radius: 14px; font-size: 0.8rem; font-weight: 700; }
    .u-low  { background: #dc2626; color: #fff; }            /* 1 */
    .u-med  { background: #d97706; color: #fff; }            /* 2–3 */
    .u-high { background: rgba(107,114,128,0.15); color: #4b5563; } /* 4+ */

    .btn-recette { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.3rem 0.65rem; background: rgba(1,63,130,0.07); color: var(--color-primary, #013F82); border: 1px solid rgba(1,63,130,0.2); border-radius: 6px; font-size: 0.8rem; font-weight: 600; font-family: inherit; cursor: pointer; white-space: nowrap; }
    .btn-recette:hover { background: rgba(1,63,130,0.13); }

    .status-badge { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.25rem 0.65rem; border-radius: 20px; font-size: 0.775rem; font-weight: 600; white-space: nowrap; }
    .status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
    .dot-green  { background: #059669; }
    .dot-red    { background: #dc2626; }
    .dot-orange { background: #d97706; }
    .dot-blue   { background: #2563eb; }
    .statut-attente  { background: rgba(217,119,6,0.1);  color: #d97706; }
    .statut-encours  { background: rgba(37,99,235,0.1);  color: #2563eb; }
    .statut-termine  { background: rgba(5,150,105,0.1);  color: #059669; }
    .statut-annule   { background: rgba(220,38,38,0.1);  color: #dc2626; }

    .action-row { display: flex; gap: 0.4rem; align-items: center; }
    .btn-icon { width: 32px; height: 32px; border-radius: 7px; border: 1.5px solid var(--border, #e5e7eb); background: var(--surface, #fff); color: var(--text-muted); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.14s; }
    .btn-icon:hover { border-color: var(--color-primary, #013F82); color: var(--color-primary, #013F82); background: rgba(1,63,130,0.05); }
    .btn-icon-danger:hover { border-color: #dc2626; color: #dc2626; background: rgba(220,38,38,0.06); }
    .empty-row { text-align: center; padding: 3rem 1rem; color: var(--text-muted); font-size: 0.9rem; }

    .btn-primary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.2rem; background: var(--color-primary, #013F82); color: #fff; border: none; border-radius: 8px; font-size: 0.88rem; font-weight: 600; font-family: inherit; cursor: pointer; transition: opacity 0.15s, transform 0.1s; white-space: nowrap; }
    .btn-primary:hover   { opacity: 0.88; }
    .btn-primary:active  { transform: scale(0.98); }
    .btn-primary:disabled{ opacity: 0.55; cursor: not-allowed; }
    .btn-secondary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.1rem; background: #e8edf4 !important; color: #0F1C2E !important; border: 1.5px solid #c8d4e0 !important; border-radius: 8px; font-size: 0.88rem; font-weight: 600; font-family: inherit; cursor: pointer; }
    .btn-secondary:hover { background: #d0dae6 !important; }
    .btn-danger-solid { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.1rem; background: #dc2626; color: #fff; border: none; border-radius: 8px; font-size: 0.88rem; font-weight: 600; font-family: inherit; cursor: pointer; }
    .btn-danger-solid:hover { opacity: 0.88; }

    .toast { position: fixed; bottom: 2rem; right: 2rem; display: flex; align-items: center; gap: 0.6rem; padding: 0.75rem 1.15rem; border-radius: 10px; font-size: 0.875rem; font-weight: 500; z-index: 9999; box-shadow: 0 8px 32px rgba(0,0,0,0.18); animation: toastIn 0.3s cubic-bezier(0.34,1.4,0.64,1); max-width: 340px; }
    .toast-success { background: #16a34a; color: #fff; }
    .toast-error   { background: #dc2626; color: #fff; }
    @keyframes toastIn { from { transform: translateY(12px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }

    .modal-backdrop { position: fixed !important; inset: 0 !important; width: 100vw !important; height: 100vh !important; background: rgba(0,0,0,0.5) !important; display: flex !important; align-items: flex-start !important; justify-content: center !important; z-index: 99999 !important; padding: 2rem 1rem !important; animation: fadeIn 0.15s ease; overflow-y: auto !important; pointer-events: all !important; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .modal { position: relative !important; background: var(--surface, #fff) !important; border-radius: 14px; width: 100%; max-width: 580px; overflow: visible; padding: 1.75rem; box-shadow: 0 20px 60px rgba(0,0,0,0.3); border: 1px solid var(--border, #e5e7eb); animation: slideUp 0.2s cubic-bezier(0.34,1.2,0.64,1); margin: auto; }
    .modal-sm     { max-width: 380px; text-align: center; }
    .modal-recette{ max-width: 540px; }
    @keyframes slideUp { from { transform: translateY(16px) scale(0.97); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }

    .modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .modal-header h3 { font-size: 1.1rem; font-weight: 700; margin: 0; color: var(--text); }
    .modal-subtitle  { font-size: 0.8rem; color: var(--text-muted); margin: 0.3rem 0 0; }
    .modal-close { background: #e8edf4 !important; border: 1.5px solid #c8d4e0 !important; cursor: pointer; color: #374151 !important; padding: 6px; border-radius: 8px; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; flex-shrink: 0; }
    .modal-close:hover { background: #d0dae6 !important; }
    .modal-form    { display: flex; flex-direction: column; gap: 1rem; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 0.6rem; margin-top: 0.5rem; padding-top: 1rem; border-top: 1px solid var(--border, #e5e7eb); }

    .delete-icon { width: 56px; height: 56px; border-radius: 50%; background: rgba(220,38,38,0.1); color: #dc2626; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; }
    .modal-sm h3 { font-size: 1.05rem; font-weight: 700; margin: 0 0 0.4rem; color: var(--text); }
    .modal-sm p  { color: var(--text-muted); font-size: 0.88rem; margin: 0 0 1.5rem; }

    .field-group { display: flex; flex-direction: column; gap: 0.35rem; }
    .field-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    @media (max-width: 480px) { .field-row { grid-template-columns: 1fr; } }
    .f-label    { font-size: 0.81rem; font-weight: 600; color: var(--text); letter-spacing: 0.01em; }
    .f-hint     { font-size: 0.72rem; color: var(--text-muted); font-weight: 400; }
    .f-required { color: #dc2626; font-size: 0.85rem; font-weight: 700; }
    .f-input { width: 100%; padding: 0.6rem 0.85rem; border: 1.5px solid var(--border, #e5e7eb); border-radius: 8px; background: var(--surface, #fff); color: var(--text); font-size: 0.875rem; font-family: inherit; outline: none; transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box; }
    input[type="date"].f-input, input[type="datetime-local"].f-input { appearance: auto; -webkit-appearance: auto; padding-right: 0.5rem; }
    select.f-input { appearance: none; -webkit-appearance: none; }
    .f-input::placeholder { color: var(--text-muted, #9ca3af); }
    .f-input:focus { border-color: var(--color-primary, #013F82); box-shadow: 0 0 0 3px rgba(1,63,130,0.12); }
    .f-select { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.75rem center; padding-right: 2.25rem; cursor: pointer; }

    .modal-alert-error { display: flex; align-items: flex-start; gap: 0.6rem; padding: 0.8rem 1rem; background: #fef2f2; border: 1px solid rgba(220,38,38,0.25); border-radius: 8px; color: #dc2626; font-size: 0.845rem; font-weight: 500; margin-bottom: 0.25rem; animation: toastIn 0.2s ease; }

    .ops-list { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
    .op-item  { display: flex; align-items: center; gap: 0.85rem; padding: 0.75rem 1rem; background: var(--surface-2, #f9fafb); border: 1px solid var(--border, #e5e7eb); border-radius: 10px; }
    .op-ordre { width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; background: rgba(1,63,130,0.1); color: var(--color-primary, #013F82); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; }
    .op-body  { flex: 1; min-width: 0; }
    .op-name  { font-weight: 600; font-size: 0.875rem; color: var(--text); }
    .op-meta  { display: flex; align-items: center; gap: 0.4rem; font-size: 0.775rem; color: var(--text-muted); flex-wrap: wrap; margin-top: 0.2rem; }
    .op-sep   { color: var(--border); }
    .op-duration { font-size: 0.85rem; font-weight: 700; color: var(--text-muted); text-align: right; white-space: nowrap; }
    .op-duration small { font-size: 0.65rem; font-weight: 400; margin-left: 2px; }

    .csv-hint { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; font-size: 0.8rem; color: var(--text-muted); background: var(--surface-2, #f9fafb); border: 1px solid var(--border); border-radius: 8px; padding: 0.6rem 0.85rem; margin-bottom: 1rem; }
    .csv-hint code { font-size: 0.78rem; background: rgba(1,63,130,0.07); color: var(--color-primary, #013F82); padding: 0.1rem 0.35rem; border-radius: 4px; }

    .drop-zone { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; padding: 2rem 1.5rem; border: 2px dashed var(--border, #e5e7eb); border-radius: 10px; margin-bottom: 1rem; transition: border-color 0.15s, background 0.15s; text-align: center; }
    .drop-zone:hover  { border-color: #aab8cc; }
    .drop-zone.has-file { border-color: #059669; background: rgba(5,150,105,0.04); }
    .drop-text { font-size: 0.875rem; color: var(--text-muted); }
    .drop-or   { font-size: 0.78rem; color: var(--text-muted); opacity: 0.6; }
    .btn-browse { display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.5rem 1.1rem; background: var(--color-primary, #013F82); color: #fff; border: none; border-radius: 8px; font-size: 0.85rem; font-weight: 600; font-family: inherit; cursor: pointer; transition: opacity 0.15s; margin-top: 0.25rem; }
    .btn-browse:hover { opacity: 0.88; }
    .btn-change-file { margin-top: 0.35rem; font-size: 0.78rem; color: var(--text-muted); background: none; border: 1px solid var(--border); border-radius: 6px; padding: 0.2rem 0.6rem; cursor: pointer; font-family: inherit; }
    .btn-change-file:hover { border-color: var(--color-primary, #013F82); color: var(--color-primary, #013F82); }

    .import-result { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.4rem; }
    .import-stat { font-size: 0.85rem; font-weight: 600; padding: 0.5rem 0.75rem; border-radius: 7px; }
    .import-stat.ok   { background: rgba(5,150,105,0.1);  color: #059669; }
    .import-stat.skip { background: rgba(217,119,6,0.1);  color: #d97706; }
    .import-errors { display: flex; flex-direction: column; gap: 0.25rem; }
    .import-error-row { font-size: 0.8rem; color: #dc2626; padding: 0.35rem 0.6rem; background: #fef2f2; border-radius: 6px; }

    /* ── Date-time picker ── */
    .dt-trigger { display: flex; align-items: center; gap: 0.55rem; cursor: pointer; text-align: left; width: 100%; }
    .dt-trigger:hover { border-color: var(--color-primary,#013F82); }

    .dt-picker { position: absolute; top: calc(100% + 6px); left: 0; z-index: 10000; background: var(--surface,#fff); border: 1.5px solid var(--border,#e5e7eb); border-radius: 12px; box-shadow: 0 12px 40px rgba(0,0,0,0.18); padding: 1rem; width: 288px; animation: slideUp 0.18s cubic-bezier(0.34,1.2,0.64,1); }

    .dt-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
    .dt-nav-btn { width: 30px; height: 30px; border-radius: 7px; border: 1.5px solid var(--border,#e5e7eb); background: var(--surface,#fff); color: var(--text-muted); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.14s; }
    .dt-nav-btn:hover { border-color: var(--color-primary,#013F82); color: var(--color-primary,#013F82); background: rgba(1,63,130,0.05); }
    .dt-month-label { font-size: 0.9rem; font-weight: 700; color: var(--text); }

    .dt-weekdays { display: grid; grid-template-columns: repeat(7,1fr); margin-bottom: 0.3rem; }
    .dt-weekdays span { text-align: center; font-size: 0.7rem; font-weight: 700; color: var(--text-muted); padding: 0.2rem 0; text-transform: uppercase; letter-spacing: 0.04em; }

    .dt-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 2px; margin-bottom: 0.75rem; }
    .dt-cell { width: 100%; aspect-ratio: 1; border-radius: 7px; border: none; background: none; font-size: 0.82rem; font-family: inherit; color: var(--text); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.12s, color 0.12s; }
    .dt-cell:hover:not(:disabled):not(.dt-selected) { background: rgba(1,63,130,0.09); color: var(--color-primary,#013F82); }
    .dt-other-month { color: var(--text-muted); opacity: 0.45; }
    .dt-today:not(.dt-selected) { background: rgba(1,63,130,0.08); color: var(--color-primary,#013F82); font-weight: 700; }
    .dt-selected { background: var(--color-primary,#013F82) !important; color: #fff !important; font-weight: 700; }
    .dt-past { opacity: 0.3; cursor: not-allowed; }

    .dt-time-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 0; border-top: 1px solid var(--border,#e5e7eb); border-bottom: 1px solid var(--border,#e5e7eb); margin-bottom: 0.7rem; }
    .dt-time-label { font-size: 0.8rem; font-weight: 600; color: var(--text); }
    .dt-time-select { border: 1.5px solid var(--border,#e5e7eb); border-radius: 7px; padding: 0.3rem 0.5rem; font-size: 0.85rem; font-family: inherit; color: var(--text); background: var(--surface,#fff); outline: none; cursor: pointer; }
    .dt-time-select:focus { border-color: var(--color-primary,#013F82); }
    .dt-time-sep { font-weight: 700; color: var(--text-muted); }

    .dt-footer { display: flex; justify-content: space-between; align-items: center; }
    .dt-clear-btn { background: none; border: 1.5px solid var(--border,#e5e7eb); border-radius: 7px; padding: 0.38rem 0.8rem; font-size: 0.8rem; font-family: inherit; color: var(--text-muted); cursor: pointer; }
    .dt-clear-btn:hover { border-color: #dc2626; color: #dc2626; }
    .dt-confirm-btn { background: var(--color-primary,#013F82); color: #fff; border: none; border-radius: 7px; padding: 0.38rem 1rem; font-size: 0.82rem; font-weight: 600; font-family: inherit; cursor: pointer; transition: opacity 0.15s; }
    .dt-confirm-btn:hover { opacity: 0.88; }
  `]
})
export class CommandeComponent implements OnInit {
  vm = inject(CommandeViewModel);

  @ViewChild('fileInputRef') fileInputRef!: ElementRef<HTMLInputElement>;

  ngOnInit(): void { this.vm.loadAll(); }

  // ── File picker ───────────────────────────────────────────────────────────
  triggerFilePicker(): void { this.fileInputRef?.nativeElement?.click(); }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0] ?? null;
    // Pass through vm.onFileSelected — it validates extension & size and sets modalError
    this.vm.onFileSelected(file);
    // Reset the input so the same file can be re-selected after an error
    input.value = '';
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    (event.currentTarget as HTMLElement).classList.remove('drag-over');
    const file = event.dataTransfer?.files[0] ?? null;
    // vm.onFileSelected validates extension & size and sets modalError when invalid
    this.vm.onFileSelected(file);
  }

  onDragLeave(event: DragEvent): void {
    (event.currentTarget as HTMLElement).classList.remove('drag-over');
  }

  // ── Date-time picker state ────────────────────────────────────────────────
  datePickerOpen = false;

  /** Calendar cursor (year/month being displayed) */
  private cursorYear  = new Date().getFullYear();
  private cursorMonth = new Date().getMonth(); // 0-based

  /** Currently chosen date (date part only, time separate) */
  pickerDate: Date | null = null;
  pickerHour   = 8;
  pickerMinute = 0;

  readonly weekDays = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
  readonly hours    = Array.from({ length: 24 }, (_, i) => i);
  readonly minutes  = Array.from({ length: 12 }, (_, i) => i * 5);

  // ── Computed calendar data ────────────────────────────────────────────────
  get monthLabel(): string {
    return new Date(this.cursorYear, this.cursorMonth, 1)
      .toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }

  get calendarCells(): { day: number; date: Date; otherMonth: boolean; isToday: boolean; isSelected: boolean; isPast: boolean }[] {
    const today  = new Date(); today.setHours(0,0,0,0);
    const first  = new Date(this.cursorYear, this.cursorMonth, 1);
    // Monday-first: getDay() 0=Sun→6, 1=Mon→0 …
    const startOffset = (first.getDay() + 6) % 7;
    type Cell = { day: number; date: Date; otherMonth: boolean; isToday: boolean; isSelected: boolean; isPast: boolean };
    const cells: Cell[] = [];

    // Days from previous month
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = new Date(this.cursorYear, this.cursorMonth, -i);
      cells.push(this.makeCell(d, true, today));
    }
    // Days of current month
    const daysInMonth = new Date(this.cursorYear, this.cursorMonth + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(this.makeCell(new Date(this.cursorYear, this.cursorMonth, d), false, today));
    }
    // Pad to complete the last row
    while (cells.length % 7 !== 0) {
      const last = cells[cells.length - 1].date;
      const next = new Date(last); next.setDate(last.getDate() + 1);
      cells.push(this.makeCell(next, true, today));
    }
    return cells;
  }

  private makeCell(d: Date, otherMonth: boolean, today: Date) {
    const dCopy = new Date(d); dCopy.setHours(0,0,0,0);
    const selCopy = this.pickerDate ? new Date(this.pickerDate) : null;
    if (selCopy) selCopy.setHours(0,0,0,0);
    return {
      day: d.getDate(),
      date: d,
      otherMonth,
      isToday: dCopy.getTime() === today.getTime(),
      isSelected: selCopy !== null && dCopy.getTime() === selCopy.getTime(),
      isPast: dCopy < today,
    };
  }

  // ── Picker actions ────────────────────────────────────────────────────────
  toggleDatePicker(event: Event): void {
    event.stopPropagation();
    this.datePickerOpen = !this.datePickerOpen;
    if (this.datePickerOpen) this.syncFromForm();
  }

  private syncFromForm(): void {
    const raw = this.vm.form().dateExport;
    if (raw) {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        this.pickerDate   = d;
        this.pickerHour   = d.getHours();
        // snap minute to nearest 5
        this.pickerMinute = Math.round(d.getMinutes() / 5) * 5 % 60;
        this.cursorYear   = d.getFullYear();
        this.cursorMonth  = d.getMonth();
        return;
      }
    }
    const now = new Date();
    this.pickerDate   = null;
    this.pickerHour   = now.getHours();
    this.pickerMinute = Math.round(now.getMinutes() / 5) * 5 % 60;
    this.cursorYear   = now.getFullYear();
    this.cursorMonth  = now.getMonth();
  }

  prevMonth(): void {
    if (this.cursorMonth === 0) { this.cursorMonth = 11; this.cursorYear--; }
    else this.cursorMonth--;
  }

  nextMonth(): void {
    if (this.cursorMonth === 11) { this.cursorMonth = 0; this.cursorYear++; }
    else this.cursorMonth++;
  }

  selectDay(date: Date): void {
    if (date < new Date(new Date().setHours(0,0,0,0))) return;
    this.pickerDate = new Date(date);
  }

  setHour(h: number):   void { this.pickerHour   = +h; }
  setMinute(m: number): void { this.pickerMinute = +m; }

  confirmDate(): void {
    if (!this.pickerDate) return;
    const d = new Date(this.pickerDate);
    d.setHours(this.pickerHour, this.pickerMinute, 0, 0);
    // Format as "YYYY-MM-DDTHH:mm" for the viewmodel (same as datetime-local value)
    const pad = (n: number) => String(n).padStart(2, '0');
    const local = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    this.vm.updateForm('dateExport', local);
    this.datePickerOpen = false;
  }

  clearDate(): void {
    this.pickerDate = null;
    this.vm.updateForm('dateExport', '');
    this.datePickerOpen = false;
  }

  /** Format the stored ISO/local string for display in the trigger button */
  formatDisplayDate(raw: string): string {
    if (!raw) return '';
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
      + ' à '
      + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  /** Close picker when user clicks outside */
  @HostListener('document:click')
  onDocumentClick(): void { this.datePickerOpen = false; }
}
