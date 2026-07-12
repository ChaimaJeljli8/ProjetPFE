import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecetteViewModel } from './recette.viewmodel';
import { LanguageService } from '../../shared/services/language.service';

@Component({
  selector: 'app-recette',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [RecetteViewModel],
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

      <!-- ── Page Header ──────────────────────────────────────────────────── -->
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ t().recettesTitle }}</h1>
          <p class="page-subtitle">
            {{ vm.totalRecettes() }}
            {{ vm.totalRecettes() !== 1 ? t().recettesSubtitle_plural : t().recettesSubtitle }}
          </p>
        </div>
        <button class="btn-primary" (click)="vm.openCreateModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {{ t().addRecette }}
        </button>
      </div>

      <!-- ── Stats Cards ──────────────────────────────────────────────────── -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-label">{{ t().statTotalRecettes }}</span>
            <div class="stat-icon" style="background:rgba(1,63,130,0.1)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary,#013F82)" stroke-width="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
          </div>
          <p class="stat-value">{{ vm.totalRecettes() }}</p>
        </div>
        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-label" style="color:#059669">{{ t().statTotalOps }}</span>
            <div class="stat-icon" style="background:rgba(5,150,105,0.1)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
          </div>
          <p class="stat-value" style="color:#059669">{{ vm.totalOps() }}</p>
        </div>
        <div class="stat-card">
          <div class="stat-card-top">
            <span class="stat-label" style="color:#7c3aed">{{ t().statAvgDuration }}</span>
            <div class="stat-icon" style="background:rgba(124,58,237,0.1)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
          </div>
          <p class="stat-value" style="color:#7c3aed">
            {{ vm.avgDuration() }}<span style="font-size:1rem;font-weight:400"> {{ t().statAvgDurationUnit }}</span>
          </p>
        </div>
      </div>

      <!-- ── Search ───────────────────────────────────────────────────────── -->
      <div class="filters-row">
        <div class="search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" class="search-input"
                 [placeholder]="t().searchRecettes"
                 [value]="vm.searchTerm()"
                 (input)="vm.searchTerm.set($any($event.target).value)"/>
        </div>
      </div>

      <!-- ── API Error ─────────────────────────────────────────────────────── -->
      <div class="alert-error" *ngIf="vm.errorMessage() && !vm.isModalOpen()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ vm.errorMessage() }}
        <button class="alert-retry" (click)="vm.loadAll()">Réessayer</button>
      </div>

      <!-- ── Loading ──────────────────────────────────────────────────────── -->
      <div class="loading-center" *ngIf="vm.isLoading() && vm.isEmpty()">
        <span class="spinner-lg"></span>
      </div>

      <!-- ── Empty State ──────────────────────────────────────────────────── -->
      <div class="empty-page" *ngIf="!vm.isLoading() && vm.isEmpty() && !vm.errorMessage()">
        <div class="empty-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
        </div>
        <p>{{ t().noRecettesTitle }}</p>
        <span>{{ t().noRecettesDesc }}</span>
        <button class="btn-primary" (click)="vm.openCreateModal()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {{ t().addRecette }}
        </button>
      </div>

      <!-- ── Cards Grid ────────────────────────────────────────────────────── -->
      <div class="recettes-grid" *ngIf="!vm.isEmpty()">

        <div class="grid-loading" *ngIf="vm.isLoading()">
          <span class="spinner-lg"></span>
        </div>

        <div class="recette-card" *ngFor="let r of vm.filteredRecettes()">

          <div class="rc-header">
            <div class="rc-avatar">{{ r.nomRecette.slice(0,2).toUpperCase() }}</div>
            <div class="rc-title-group">
              <div class="rc-name">{{ r.nomRecette }}</div>
            </div>
            <div class="rc-actions">
              <button class="btn-icon" [title]="t().editRecetteTitle" (click)="vm.openEditModal(r)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button class="btn-icon btn-icon-danger" [title]="t().deleteRecetteTitle" (click)="vm.requestDelete(r.id)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="rc-badges">
            <span class="rc-badge rc-badge-blue">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              {{ r.nombreOperations }} {{ t().badgeOps }}
            </span>
            <span class="rc-badge rc-badge-purple">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {{ r.dureeTotaleMinutes }} {{ t().badgeDuration }}
            </span>
          </div>

          <div class="rc-ops">
            <div class="rc-op" *ngFor="let op of r.operations">
              <div class="rc-op-ordre">{{ op.ordre }}</div>
              <div class="rc-op-info">
                <span class="rc-op-name">{{ op.nomOperation }}</span>
                <span class="rc-op-meta">
                  ⚙ {{ op.dureeMinutes }}m
                  · ↑ {{ op.tempsChargementMinutes }}m
                  · ↓ {{ op.tempsDecharementMinutes }}m
                  · Lot: {{ op.quantiteLot }}
                </span>
              </div>
              <div class="rc-op-dur">{{ op.dureeMinutes }}<small>m</small></div>
            </div>
          </div>

        </div>

        <div class="no-result" *ngIf="vm.filteredRecettes().length === 0 && !vm.isEmpty()">
          {{ t().noSearchResultRecette }}
        </div>

      </div>

    </div><!-- /page -->


    <!-- ══════════════════════════════════════════════════════════════════════
         MODAL: Create / Edit Recette
    ══════════════════════════════════════════════════════════════════════════ -->
    <div class="modal-backdrop"
         *ngIf="vm.isModalOpen()"
         (click)="$event.target === $event.currentTarget && vm.closeModal()">
      <div class="modal modal-lg">

        <div class="modal-header">
          <div>
            <h3>{{ vm.isEditing() ? t().editRecetteTitle : t().newRecetteTitle }}</h3>
            <p class="modal-subtitle">
              {{ vm.isEditing() ? t().editRecetteSubtitle : t().newRecetteSubtitle }}
            </p>
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

        <div class="modal-form">

          <!-- Nom de recette -->
          <div class="field-group">
            <label class="f-label">
              {{ t().fieldNomRecette }} <span class="f-required">*</span>
              <span class="f-hint"> — code unique, ex: 33115</span>
            </label>
            <input class="f-input" type="text"
                   [placeholder]="t().fieldNomRecettePlaceholder"
                   [value]="vm.formNom()"
                   (input)="vm.formNom.set($any($event.target).value)"/>
          </div>

          <!-- Operations section -->
          <div class="ops-section">
            <div class="ops-section-header">
              <span class="f-label">{{ t().opsSequenceLabel }} <span class="f-required">*</span></span>
              <button class="btn-add-op" type="button" (click)="vm.addOp()">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                {{ t().addOpBtn }}
              </button>
            </div>

            <!-- Column headers -->
            <div class="ops-col-headers" *ngIf="vm.formOps().length > 0">
              <div class="op-col-ordre">#</div>
              <div class="op-col-name">{{ t().fieldOperation }}</div>
              <div class="op-col-sm">{{ t().fieldDureeMin }}</div>
              <div class="op-col-sm">{{ t().fieldQteLot }}</div>
              <div class="op-col-sm">{{ t().fieldChargementMin }}</div>
              <div class="op-col-sm">{{ t().fieldDecharementMin }}</div>
              <div class="op-col-btn"></div>
            </div>

            <div class="ops-form-list">

              <div class="op-form-row" *ngFor="let op of vm.formOps(); let i = index"
                   [class.confirm-pending]="vm.confirmRemoveOpIndex() === i">

                <div class="op-form-ordre">{{ op.ordre }}</div>

                <!-- Nom opération — liste déroulante (populated from backend) -->
                <div class="field-group op-field-name">
                  <select
                    class="f-input f-input-sm f-select-op"
                    [(ngModel)]="op.nomOperation"
                    (ngModelChange)="vm.updateOp(i, 'nomOperation', $event)">

                    <option [ngValue]="''">— choisir —</option>

                    <!-- Loading fallback while ops are being fetched -->
                    <option *ngIf="vm.availableOperations().length === 0" disabled>
                      Chargement…
                    </option>

                    <option
                      *ngFor="let opName of vm.availableOperations()"
                      [ngValue]="opName">
                      {{ opName }}
                    </option>
                  </select>
                </div>

                <!-- Durée -->
                <div class="field-group op-field-sm">
                  <input class="f-input f-input-sm" type="number" min="1" placeholder="30"
                         [value]="op.dureeMinutes || ''"
                         (change)="vm.updateOp(i, 'dureeMinutes', +$any($event.target).value)"/>
                </div>

                <!-- Quantité lot -->
                <div class="field-group op-field-sm">
                  <input class="f-input f-input-sm" type="number" min="1" placeholder="60"
                         [value]="op.quantiteLot || ''"
                         (change)="vm.updateOp(i, 'quantiteLot', +$any($event.target).value)"/>
                </div>

                <!-- Temps de chargement -->
                <div class="field-group op-field-sm">
                  <input class="f-input f-input-sm" type="number" min="0" placeholder="0"
                         title="Temps pour charger pièces, produits chimiques, eau, etc."
                         [value]="op.tempsChargementMinutes"
                         (change)="vm.updateOp(i, 'tempsChargementMinutes', +$any($event.target).value)"/>
                </div>

                <!-- Temps de déchargement -->
                <div class="field-group op-field-sm">
                  <input class="f-input f-input-sm" type="number" min="0" placeholder="0"
                         title="Temps pour vider la machine, évacuer l'eau, retirer les pièces, etc."
                         [value]="op.tempsDecharementMinutes"
                         (change)="vm.updateOp(i, 'tempsDecharementMinutes', +$any($event.target).value)"/>
                </div>

                <!-- Remove button + floating confirm dialog -->
                <div class="op-remove-wrap">
                  <button class="btn-remove-op" type="button"
                          [disabled]="vm.formOps().length === 1"
                          (click)="vm.requestRemoveOp(i)" [title]="t().removeOpTitle">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                    </svg>
                  </button>

                  <div class="op-confirm-dialog" *ngIf="vm.confirmRemoveOpIndex() === i">
                    <div class="op-confirm-dialog-top">
                      <div class="op-confirm-dialog-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                        </svg>
                      </div>
                      <p class="op-confirm-dialog-title">{{ t().removeOpTitle }}</p>
                    </div>
                    <p class="op-confirm-dialog-desc">{{ t().confirmRemoveOpLabel }}</p>
                    <div class="op-confirm-dialog-actions">
                      <button class="op-confirm-btn-cancel" type="button" (click)="vm.cancelRemoveOp()">
                        {{ t().confirmRemoveOpNo }}
                      </button>
                      <button class="op-confirm-btn-delete" type="button" (click)="vm.confirmRemoveOp()">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                        {{ t().confirmRemoveOpYes }}
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              <div class="ops-empty" *ngIf="vm.formOps().length === 0">
                {{ t().opsEmptyHint }}
              </div>
            </div>
          </div>

        </div>

        <div class="modal-actions">
          <button class="btn-secondary" (click)="vm.closeModal()">{{ t().cancel }}</button>
          <button class="btn-primary" (click)="vm.save()">
            {{ vm.isEditing() ? t().updateRecetteBtn : t().createRecetteBtn }}
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
        <h3>{{ t().deleteRecetteTitle }}</h3>
        <p>{{ t().deleteRecetteDesc }}</p>
        <div class="modal-actions" style="justify-content:center">
          <button class="btn-secondary" (click)="vm.cancelDelete()">{{ t().cancel }}</button>
          <button class="btn-danger-solid" (click)="vm.confirmDelete()">{{ t().deleteBtn }}</button>
        </div>
      </div>
    </div>

  `,
  styles: [`
    .page          { padding: 1.25rem; max-width: 1300px; margin: 0 auto; }
    @media (min-width: 640px) { .page { padding: 2rem; } }
    .page-header   { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.75rem; gap: 1rem; flex-wrap: wrap; }
    .page-title    { font-size: 1.25rem; font-weight: 700; color: var(--text); margin: 0; }
    @media (min-width: 480px) { .page-title { font-size: 1.5rem; } }
    .page-subtitle { font-size: 0.85rem; color: var(--text-muted); margin: 0.25rem 0 0; }

    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin-bottom: 1.5rem; }
    @media (min-width: 700px) { .stats-grid { grid-template-columns: repeat(3, 1fr); gap: 1rem; } }
    .stat-card     { background: var(--surface,#fff); border: 1px solid var(--border,#e5e7eb); border-radius: 12px; padding: 1rem 1.2rem; }
    .stat-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .stat-label    { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); }
    .stat-icon     { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .stat-value    { font-size: 1.6rem; font-weight: 700; color: var(--text); margin: 0; }

    .filters-row  { display: flex; gap: 0.75rem; margin-bottom: 1.25rem; }
    .search-wrap  { position: relative; display: flex; align-items: center; flex: 1; min-width: 220px; }
    .search-wrap svg { position: absolute; left: 0.75rem; color: var(--text-muted); pointer-events: none; }
    .search-input { width: 100%; padding: 0.55rem 0.85rem 0.55rem 2.25rem; border: 1.5px solid var(--border,#e5e7eb); border-radius: 8px; background: var(--surface,#fff); color: var(--text); font-size: 0.875rem; font-family: inherit; outline: none; }
    .search-input:focus { border-color: var(--color-primary,#013F82); box-shadow: 0 0 0 3px rgba(1,63,130,0.1); }

    .alert-error  { display: flex; align-items: center; gap: 0.6rem; padding: 0.8rem 1rem; background: #fef2f2; border: 1px solid rgba(220,38,38,0.2); border-radius: 8px; color: #dc2626; font-size: 0.875rem; margin-bottom: 1rem; }
    .alert-retry  { margin-left: auto; background: none; border: 1px solid #dc2626; color: #dc2626; border-radius: 6px; padding: 0.25rem 0.6rem; font-size: 0.8rem; cursor: pointer; font-family: inherit; }

    .loading-center { display: flex; justify-content: center; padding: 4rem; }
    .spinner-lg     { width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--color-primary,#013F82); border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-page { display: flex; flex-direction: column; align-items: center; padding: 4rem 2rem; gap: 0.6rem; text-align: center; }
    .empty-icon { width: 64px; height: 64px; border-radius: 50%; background: var(--surface,#f9fafb); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--text-muted); margin-bottom: 0.5rem; }
    .empty-page p    { font-weight: 600; color: var(--text); margin: 0; }
    .empty-page span { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem; }

    .recettes-grid { position: relative; display: grid; grid-template-columns: 1fr; gap: 1rem; }
    @media (min-width: 600px)  { .recettes-grid { grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); } }
    .grid-loading  { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.7); z-index: 10; border-radius: 12px; }

    .recette-card       { background: var(--surface,#fff); border: 1px solid var(--border,#e5e7eb); border-radius: 12px; padding: 1.1rem 1.2rem; display: flex; flex-direction: column; gap: 0.85rem; transition: box-shadow 0.15s; }
    .recette-card:hover { box-shadow: 0 4px 18px rgba(0,0,0,0.08); }

    .rc-header      { display: flex; align-items: flex-start; gap: 0.75rem; }
    .rc-avatar      { width: 38px; height: 38px; border-radius: 9px; flex-shrink: 0; background: rgba(1,63,130,0.1); color: var(--color-primary,#013F82); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; }
    .rc-title-group { flex: 1; min-width: 0; }
    .rc-name        { font-weight: 700; font-size: 0.95rem; color: var(--text); }
    .rc-actions     { display: flex; gap: 0.35rem; flex-shrink: 0; }

    .rc-badges    { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .rc-badge     { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.2rem 0.55rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
    .rc-badge-blue   { background: rgba(37,99,235,0.1);  color: #2563eb; }
    .rc-badge-purple { background: rgba(124,58,237,0.1); color: #7c3aed; }

    .rc-ops     { display: flex; flex-direction: column; gap: 0.35rem; }
    .rc-op      { display: flex; align-items: center; gap: 0.6rem; padding: 0.5rem 0.6rem; background: var(--surface-2,#f9fafb); border-radius: 8px; border: 1px solid var(--border,#e5e7eb); }
    .rc-op-ordre{ width: 22px; height: 22px; border-radius: 50%; background: rgba(1,63,130,0.1); color: var(--color-primary,#013F82); display: flex; align-items: center; justify-content: center; font-size: 0.68rem; font-weight: 700; flex-shrink: 0; }
    .rc-op-info { flex: 1; min-width: 0; }
    .rc-op-name { font-weight: 600; font-size: 0.825rem; color: var(--text); display: block; }
    .rc-op-meta { font-size: 0.73rem; color: var(--text-muted); margin-top: 0.1rem; display: block; }
    .rc-op-dur  { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); white-space: nowrap; }
    .rc-op-dur small { font-size: 0.65rem; font-weight: 400; }

    .no-result { text-align: center; padding: 3rem; color: var(--text-muted); font-size: 0.9rem; grid-column: 1/-1; }

    .btn-primary      { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.2rem; background: var(--color-primary,#013F82); color: #fff; border: none; border-radius: 8px; font-size: 0.88rem; font-weight: 600; font-family: inherit; cursor: pointer; transition: opacity 0.15s; white-space: nowrap; }
    .btn-primary:hover { opacity: 0.88; }
    .btn-secondary    { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.1rem; background: #e8edf4 !important; color: #0F1C2E !important; border: 1.5px solid #c8d4e0 !important; border-radius: 8px; font-size: 0.88rem; font-weight: 600; font-family: inherit; cursor: pointer; }
    .btn-secondary:hover { background: #d0dae6 !important; }
    .btn-danger-solid { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.1rem; background: #dc2626; color: #fff; border: none; border-radius: 8px; font-size: 0.88rem; font-weight: 600; font-family: inherit; cursor: pointer; }
    .btn-danger-solid:hover { opacity: 0.88; }
    .btn-icon { width: 32px; height: 32px; border-radius: 7px; border: 1.5px solid var(--border,#e5e7eb); background: var(--surface,#fff); color: var(--text-muted); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.14s; }
    .btn-icon:hover { border-color: var(--color-primary,#013F82); color: var(--color-primary,#013F82); background: rgba(1,63,130,0.05); }
    .btn-icon-danger:hover { border-color: #dc2626; color: #dc2626; background: rgba(220,38,38,0.06); }

    .toast { position: fixed; bottom: 2rem; right: 2rem; display: flex; align-items: center; gap: 0.6rem; padding: 0.75rem 1.15rem; border-radius: 10px; font-size: 0.875rem; font-weight: 500; z-index: 9999; box-shadow: 0 8px 32px rgba(0,0,0,0.18); animation: toastIn 0.3s cubic-bezier(0.34,1.4,0.64,1); max-width: 340px; }
    .toast-success { background: #16a34a; color: #fff; }
    .toast-error   { background: #dc2626; color: #fff; }
    @keyframes toastIn { from { transform: translateY(12px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }

    .modal-backdrop { position: fixed !important; inset: 0 !important; width: 100vw !important; height: 100vh !important; background: rgba(0,0,0,0.55) !important; display: flex !important; align-items: center !important; justify-content: center !important; z-index: 99999 !important; padding: 1.25rem; animation: fadeIn 0.15s ease; overflow: auto; pointer-events: all !important; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .modal    { position: relative !important; background: var(--surface,#fff) !important; border-radius: 16px; width: 100%; max-width: 520px; max-height: 92vh; overflow-y: auto; padding: 2rem; box-shadow: 0 24px 64px rgba(0,0,0,0.28); border: 1px solid var(--border,#e5e7eb); animation: slideUp 0.22s cubic-bezier(0.34,1.2,0.64,1); }
    .modal-lg { max-width: min(1100px, 96vw); width: min(1100px, 96vw); max-height: 92vh; padding: 2.25rem 2.5rem; display: flex; flex-direction: column; }
    .modal-sm { max-width: 400px; text-align: center; }
    @keyframes slideUp { from { transform: translateY(18px) scale(0.97); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }

    .modal-lg .modal-form { flex: 1; overflow-y: auto; min-height: 0; }

    .modal-header    { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.75rem; gap: 1rem; }
    .modal-header h3 { font-size: 1.25rem; font-weight: 700; margin: 0; color: var(--text); }
    .modal-subtitle  { font-size: 0.85rem; color: var(--text-muted); margin: 0.35rem 0 0; }
    .modal-close     { background: #e8edf4 !important; border: 1.5px solid #c8d4e0 !important; cursor: pointer; color: #374151 !important; padding: 7px; border-radius: 9px; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; flex-shrink: 0; transition: background 0.14s; }
    .modal-close:hover { background: #d0dae6 !important; }

    .modal-form    { display: flex; flex-direction: column; gap: 1.25rem; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 0.7rem; margin-top: 0.75rem; padding-top: 1.1rem; border-top: 1px solid var(--border,#e5e7eb); flex-shrink: 0; }

    .delete-icon { width: 60px; height: 60px; border-radius: 50%; background: rgba(220,38,38,0.1); color: #dc2626; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.1rem; }
    .modal-sm h3 { font-size: 1.1rem; font-weight: 700; margin: 0 0 0.5rem; color: var(--text); }
    .modal-sm p  { color: var(--text-muted); font-size: 0.9rem; margin: 0 0 1.6rem; }

    .modal-alert-error { display: flex; align-items: flex-start; gap: 0.65rem; padding: 0.9rem 1.1rem; background: #fef2f2; border: 1px solid rgba(220,38,38,0.25); border-radius: 9px; color: #dc2626; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem; animation: toastIn 0.2s ease; }

    .field-group { display: flex; flex-direction: column; gap: 0.4rem; }
    .f-label    { font-size: 0.845rem; font-weight: 600; color: var(--text); letter-spacing: 0.01em; display: flex; align-items: center; gap: 0.3rem; flex-wrap: wrap; }
    .f-hint     { font-size: 0.75rem; color: var(--text-muted); font-weight: 400; }
    .f-required { color: #dc2626; font-size: 0.85rem; font-weight: 700; }
    .f-input { width: 100%; padding: 0.65rem 0.95rem; border: 1.5px solid var(--border,#e5e7eb); border-radius: 9px; background: var(--surface,#fff); color: var(--text); font-size: 0.9rem; font-family: inherit; outline: none; transition: border-color 0.15s, box-shadow 0.15s; appearance: none; -webkit-appearance: none; box-sizing: border-box; }
    .f-input::placeholder { color: var(--text-muted,#9ca3af); }
    .f-input:focus    { border-color: var(--color-primary,#013F82); box-shadow: 0 0 0 3px rgba(1,63,130,0.12); }
    .f-input:disabled { opacity: 0.45; cursor: not-allowed; }
    .f-input-sm { padding: 0.5rem 0.75rem; font-size: 0.855rem; }

    .f-select-op {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.6rem center;
      padding-right: 2rem;
      cursor: pointer;
    }

    .ops-section        { display: flex; flex-direction: column; gap: 0.75rem; }
    .ops-section-header { display: flex; justify-content: space-between; align-items: center; }
    .btn-add-op { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.9rem; font-size: 0.835rem; font-weight: 600; background: rgba(1,63,130,0.07); color: var(--color-primary,#013F82); border: 1px solid rgba(1,63,130,0.2); border-radius: 8px; font-family: inherit; cursor: pointer; transition: background 0.14s; }
    .btn-add-op:hover { background: rgba(1,63,130,0.13); }

    .ops-col-headers {
      display: grid;
      grid-template-columns: 32px 1fr 110px 110px 110px 110px 36px;
      gap: 0.65rem;
      padding: 0 1rem;
      align-items: center;
    }
    .ops-col-headers > * { font-size: 0.74rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }

    .ops-form-list { display: flex; flex-direction: column; gap: 0.55rem; max-height: 420px; overflow-y: auto; padding: 2px 2px 4px; }
    .op-form-row {
      display: grid;
      grid-template-columns: 32px 1fr 110px 110px 110px 110px 36px;
      gap: 0.65rem;
      align-items: center;
      padding: 0.8rem 1rem;
      background: var(--surface-2,#f9fafb);
      border: 1.5px solid var(--border,#e5e7eb);
      border-radius: 11px;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .op-form-row:hover { border-color: rgba(1,63,130,0.2); box-shadow: 0 2px 8px rgba(1,63,130,0.06); }
    .op-form-row.confirm-pending { border-color: rgba(220,38,38,0.35); background: #fff8f8; box-shadow: 0 2px 10px rgba(220,38,38,0.1); }

    .op-form-ordre { width: 32px; height: 32px; border-radius: 50%; background: rgba(1,63,130,0.1); color: var(--color-primary,#013F82); display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; flex-shrink: 0; }
    .op-field-name { min-width: 0; }
    .op-field-sm   { min-width: 0; }

    .btn-remove-op { width: 36px; height: 36px; border-radius: 8px; border: 1.5px solid var(--border,#e5e7eb); background: var(--surface,#fff); color: var(--text-muted); display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all 0.14s; }
    .btn-remove-op:hover:not(:disabled) { border-color: #dc2626; color: #dc2626; background: rgba(220,38,38,0.06); }
    .btn-remove-op:disabled { opacity: 0.35; cursor: not-allowed; }

    .op-remove-wrap { position: relative; display: flex; align-items: center; justify-content: center; }

    .op-confirm-dialog { position: fixed; z-index: 100000; width: 260px; background: #fff; border: 1.5px solid rgba(220,38,38,0.35); border-radius: 14px; box-shadow: 0 12px 40px rgba(0,0,0,0.18); padding: 1.1rem 1.15rem 1rem; animation: dialogPop 0.2s cubic-bezier(0.34,1.4,0.64,1); transform: translateX(-50%); }
    @keyframes dialogPop { from { opacity:0; transform:translateX(-50%) translateY(-8px) scale(0.94); } to { opacity:1; transform:translateX(-50%) translateY(0) scale(1); } }

    .op-confirm-dialog-top    { display: flex; align-items: center; gap: 0.7rem; margin-bottom: 0.5rem; }
    .op-confirm-dialog-icon   { width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0; background: rgba(220,38,38,0.1); display: flex; align-items: center; justify-content: center; }
    .op-confirm-dialog-title  { font-size: 0.875rem; font-weight: 700; color: #111827; margin: 0; }
    .op-confirm-dialog-desc   { font-size: 0.78rem; color: #6b7280; margin: 0 0 0.85rem; line-height: 1.45; padding-left: 0.1rem; }
    .op-confirm-dialog-actions{ display: flex; gap: 0.5rem; }
    .op-confirm-btn-cancel  { flex: 1; padding: 0.45rem 0.6rem; font-size: 0.8rem; font-weight: 600; font-family: inherit; background: #f3f4f6; color: #374151; border: 1.5px solid #d1d5db; border-radius: 8px; cursor: pointer; transition: background 0.13s; }
    .op-confirm-btn-cancel:hover { background: #e5e7eb; }
    .op-confirm-btn-delete  { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 0.35rem; padding: 0.45rem 0.6rem; font-size: 0.8rem; font-weight: 600; font-family: inherit; background: #dc2626; color: #fff; border: none; border-radius: 8px; cursor: pointer; transition: opacity 0.13s; }
    .op-confirm-btn-delete:hover { opacity: 0.88; }

    .ops-empty { text-align: center; padding: 2rem; color: var(--text-muted); font-size: 0.88rem; border: 1.5px dashed var(--border,#e5e7eb); border-radius: 10px; }
  `]
})
export class RecetteComponent implements OnInit {
  vm = inject(RecetteViewModel);
  t  = inject(LanguageService).t;

  ngOnInit(): void {
    this.vm.loadOperations(); // ← fetch ops list from backend first
    this.vm.loadAll();
  }
}
