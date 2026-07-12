import {
  Component, OnInit, inject, ElementRef, ViewChild, ChangeDetectionStrategy, signal
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { PlanningViewModel, GanttBar, MachineRow, TimelineTick } from './planning.viewmodel';
import { LanguageService } from '../../shared/services/language.service';
import { PlanningSummary } from '../../shared/models/planning.model';

export type { GanttBar, MachineRow, TimelineTick };

@Component({
  selector: 'app-planner-planning',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PlanningViewModel, DatePipe],
  imports: [CommonModule, FormsModule],
  template: `

    <!-- Toast -->
    <div *ngIf="vm.toast()"
         class="toast"
         [class.toast-success]="vm.toast()!.type==='success'"
         [class.toast-error]="vm.toast()!.type==='error'">
      {{ vm.toast()!.msg }}
    </div>

    <!--  RUN-OPTIONS MODAL  -->
    <div *ngIf="vm.showRunModal()" class="modal-backdrop" (click)="vm.cancelRunModal()">
      <div class="modal-box" (click)="$event.stopPropagation()">

        <div class="modal-header">
          <div class="modal-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </div>
          <div>
            <h2 class="modal-title">{{ lang.t().planningRunBtn }}</h2>
            <p class="modal-subtitle">{{ lang.t().planningModalSubtitle }}</p>
          </div>
          <button class="modal-close" (click)="vm.cancelRunModal()">✕</button>
        </div>

        <div class="modal-body">

          <!-- Start datetime -->
          <div class="section-divider">
            <label class="opt-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="17" rx="2"/>
                <path d="M3 9h18M8 2v4M16 2v4"/>
              </svg>
              {{ lang.t().planningModalStartLabel }}
            </label>
            <p class="opt-hint">{{ lang.t().planningModalStartHint }}</p>

            <div class="datetime-row">
              <div class="datetime-field">
                <input type="datetime-local" class="datetime-input"
                       [value]="vm.startDatetime()"
                       (change)="vm.startDatetime.set($any($event.target).value)"
                       [min]="minDatetime()" />
              </div>
              <button class="btn-now" (click)="vm.startDatetime.set(nowLocal())" [title]="lang.t().planningModalNow">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2.2">
                  <polyline points="23 4 23 10 17 10"/>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
                {{ lang.t().planningModalNow }}
              </button>
            </div>

            <div class="datetime-preview" *ngIf="vm.startDatetime()">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              {{ lang.t().planningModalStartPreview }} <strong>{{ formatPreview(vm.startDatetime()) }}</strong>
            </div>
          </div>

          <!-- Machine count -->
          <label class="opt-label" style="margin-top:1.1rem">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {{ lang.t().planningModalMachineLabel }}
          </label>
          <p class="opt-hint">{{ lang.t().planningModalMachineHint }}</p>

          <div class="machine-picker">
            <button *ngFor="let n of [1, 2, 3]"
                    class="mp-btn"
                    [class.mp-btn-active]="vm.maxMachinesPerOp() === n"
                    (click)="vm.setMaxMachines(asN(n))">
              <div class="mp-illustration">
                <ng-container *ngFor="let row of getIllustrationRows(n); let ri = index">
                  <div class="mp-row">
                    <span class="mp-machine-label">M{{ ri + 1 }}</span>
                    <div class="mp-bar-track">
                      <div *ngFor="let bar of row" class="mp-bar"
                           [style.left.%]="bar.left"
                           [style.width.%]="bar.width"
                           [style.background]="bar.color">
                      </div>
                    </div>
                  </div>
                </ng-container>
              </div>
              <span class="mp-count">{{ n }} {{ n > 1 ? lang.t().planningModalMachinePlural : lang.t().planningModalMachineSingular }}</span>
              <span class="mp-desc">{{ getMachineDesc(n) }}</span>
              <span class="mp-check" *ngIf="vm.maxMachinesPerOp() === n">✓</span>
            </button>
          </div>

          <div class="opt-info opt-info-neutral" *ngIf="vm.maxMachinesPerOp() === 1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ lang.t().planningModalInfo1 }}
          </div>

          <div class="opt-info" *ngIf="vm.maxMachinesPerOp() > 1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ lang.t().planningModalInfoN1 }}<strong>{{ vm.maxMachinesPerOp() }} {{ lang.t().planningModalMachinePlural }}</strong>{{ lang.t().planningModalInfoN2 }}
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" (click)="vm.cancelRunModal()">{{ lang.t().cancel }}</button>
          <button class="btn-primary" (click)="vm.confirmAndRun()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            {{ lang.t().planningRunBtn }}
          </button>
        </div>
      </div>
    </div>

    <div class="page">

      <!-- Page header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ lang.t().planningTitle }}</h1>
          <p class="page-subtitle">
            {{ lang.t().planningSubtitle }}
            <span *ngIf="vm.active()" class="badge-status"
                  [class.status-ok]="vm.active()!.statut==='optimal'"
                  [class.status-warn]="vm.active()!.statut!=='optimal'">
              {{ vm.active()!.statut | uppercase }}
            </span>
          </p>
        </div>
        <div class="header-actions">
          <ng-container *ngIf="vm.active()">
            <button class="btn-outline-green" [disabled]="vm.exportingExcel()" (click)="vm.exportExcel()">
              <span *ngIf="vm.exportingExcel()" class="spinner"></span>
              <svg *ngIf="!vm.exportingExcel()" class="btn-icon"
                   viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M8 10l4 4 4-4"/>
              </svg>
              {{ vm.exportingExcel() ? lang.t().planningExporting : 'Excel' }}
            </button>
            <button class="btn-outline-rose" [disabled]="vm.exportingPdf()" (click)="vm.exportPdf()">
              <span *ngIf="vm.exportingPdf()" class="spinner"></span>
              <svg *ngIf="!vm.exportingPdf()" class="btn-icon"
                   viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              {{ vm.exportingPdf() ? lang.t().planningExporting : 'PDF' }}
            </button>
          </ng-container>

          <button class="btn-primary" [disabled]="vm.running()" (click)="vm.run()">
            <span class="spinner" *ngIf="vm.running()"></span>
            <svg *ngIf="!vm.running()" width="15" height="15" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            {{ vm.running() ? lang.t().planningRunning : lang.t().planningRunBtn }}
          </button>
        </div>
      </div>

      <!-- KPI cards -->
      <div class="kpi-grid" *ngIf="vm.active() as p">

        <div class="kpi-card">
          <div class="kpi-icon kpi-cyan">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div class="kpi-body">
            <p class="kpi-label">{{ lang.t().planningKpiMakespan }}</p>
            <p class="kpi-value kpi-cyan-txt">{{ vm.makespanFormatted() }}</p>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon kpi-emerald">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <div class="kpi-body">
            <p class="kpi-label">{{ lang.t().planningKpiCommandes }}</p>
            <p class="kpi-value kpi-emerald-txt">{{ p.nombreCommandes }}</p>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon kpi-amber">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div class="kpi-body">
            <p class="kpi-label">{{ lang.t().planningKpiLignes }}</p>
            <p class="kpi-value kpi-amber-txt">{{ p.nombreLignes }}</p>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon kpi-violet">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <path d="M8 21h8M12 17v4"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div class="kpi-body">
            <p class="kpi-label">{{ lang.t().planningKpiMachines }}</p>
            <p class="kpi-value kpi-violet-txt">{{ vm.activeMachines() }}</p>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon kpi-red">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
            </svg>
          </div>
          <div class="kpi-body">
            <p class="kpi-label">{{ lang.t().planningKpiOnTime }}</p>
            <p class="kpi-value"
               [class.kpi-ok-txt]="vm.onTimePct() >= 80"
               [class.kpi-err-txt]="vm.onTimePct() < 80">
              {{ vm.onTimePct() }}<small>%</small>
            </p>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon kpi-blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="17" rx="2"/>
              <path d="M3 9h18M8 2v4M16 2v4"/>
            </svg>
          </div>
          <div class="kpi-body">
            <p class="kpi-label">{{ lang.t().planningKpiDebut }}</p>
            <p class="kpi-value kpi-blue-txt">{{ p.dateDebut }}</p>
          </div>
        </div>

      </div>

      <!-- ── History filter panel ───────────────────────────────────────── -->
      <div *ngIf="vm.history().length" class="filter-panel">

        <button type="button" class="filter-panel-toggle"
                (click)="historyFiltersOpen.set(!historyFiltersOpen())">
          <span class="filter-panel-title">
            <svg class="fp-icon" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            {{ lang.t().adminFilterTitle }}
            <span *ngIf="vm.activeHistoryFilterCount()" class="filter-badge">
              {{ vm.activeHistoryFilterCount() }}
            </span>
          </span>
          <svg class="fp-chevron" [class.fp-chevron-open]="historyFiltersOpen()"
               viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        <div *ngIf="historyFiltersOpen()" class="filter-panel-body">
          <div class="filter-grid">

            <div class="fp-field">
              <label class="fp-label">{{ lang.t().adminFilterDateFrom }}</label>
              <input type="date" class="fp-input"
                     [ngModel]="vm.filterDateFrom()"
                     (ngModelChange)="vm.filterDateFrom.set($event)"/>
            </div>

            <div class="fp-field">
              <label class="fp-label">{{ lang.t().adminFilterDateTo }}</label>
              <input type="date" class="fp-input"
                     [ngModel]="vm.filterDateTo()"
                     (ngModelChange)="vm.filterDateTo.set($event)"/>
            </div>

            <div class="fp-field">
              <label class="fp-label">{{ lang.t().adminFilterMakespan }}</label>
              <div class="fp-icon-wrap">
                <svg class="fp-field-icon" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <input type="number" min="0" placeholder="—" class="fp-input fp-input-icon"
                       [ngModel]="vm.filterMakespan()"
                       (ngModelChange)="vm.filterMakespan.set($event !== null && $event !== '' ? +$event : null)"/>
              </div>
            </div>

            <div class="fp-field">
              <label class="fp-label">{{ lang.t().planningHistoryPlaceholder }}</label>
              <div class="fp-select-wrap">
                <select class="fp-input fp-select" *ngIf="vm.filteredHistory().length"
                        (change)="vm.loadHistory($any($event.target).value)">
                  <option value="">{{ lang.t().planningHistoryPlaceholder }}</option>
                  <option *ngFor="let h of vm.filteredHistory()" [value]="h.id"
                          [selected]="vm.active()?.id === h.id">
                    #{{ h.id }} · {{ h.dateGeneration | date:'dd/MM/yy HH:mm' }}
                    · {{ h.makespanDays }}j
                    · {{ h.nombreCommandes }} cmd · {{ h.statut | uppercase }}
                  </option>
                </select>
                <p *ngIf="!vm.filteredHistory().length" class="fp-empty">
                  {{ lang.t().planningTableEmpty }}
                </p>
              </div>
            </div>

          </div>

          <div class="filter-footer">
            <span class="filter-count">
              <strong>{{ vm.filteredHistory().length }}</strong>
              / {{ vm.history().length }} plannings
            </span>
            <button *ngIf="vm.activeHistoryFilterCount()" class="btn-reset"
                    (click)="vm.resetHistoryFilters()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
              </svg>
              {{ lang.t().adminFilterReset }}
            </button>
          </div>
        </div>
      </div>

      <!-- ── Late-delivery notice (amber) ──────────────────────────────── -->
      <!-- Replaced the red warnings-box-error: late orders are not errors,  -->
      <!-- they are actionable scheduling warnings. Amber signals urgency    -->
      <!-- without implying a system failure.                                -->
      <div class="notice-late" *ngIf="vm.hasLateOrders()">
        <div class="notice-late-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div class="notice-late-body">
          <p class="notice-late-title">{{ lang.t().planningLateNoticeTitle }}</p>
          <p *ngFor="let w of vm.lateWarningsOnly()" class="notice-late-row">{{ w }}</p>
        </div>
      </div>

      <!-- Split / capacity warnings (yellow) -->
      <div class="warnings-box" *ngIf="vm.splitWarningsOnly().length">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <div>
          <p *ngFor="let w of vm.splitWarningsOnly()" style="margin:0 0 2px">{{ w }}</p>
        </div>
      </div>

      <!-- Empty state -->
      <div class="empty-page" *ngIf="!vm.active() && !vm.running() && !vm.errorMsg()">
        <div class="empty-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.4">
            <rect x="3" y="4" width="18" height="17" rx="2"/>
            <path d="M3 9h18M8 2v4M16 2v4M7 13h3M7 17h5"/>
          </svg>
        </div>
        <p>{{ lang.t().planningEmptyTitle }}</p>
        <span>{{ lang.t().planningEmptyHint }}</span>
      </div>

      <!-- Error (run failures only — not late-order notices) -->
      <div class="alert-error" *ngIf="vm.errorMsg()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
        </svg>
        {{ vm.errorMsg() }}
        <button class="alert-retry" (click)="vm.errorMsg.set('')">✕</button>
      </div>

      <!-- Running spinner -->
      <div class="running-card" *ngIf="vm.running()">
        <div class="pulse-ring"></div>
        <div class="running-body">
          <div class="spinner-lg"></div>
          <div>
            <p style="font-weight:700;margin:0">{{ lang.t().planningOptimizing }}</p>
            <p style="font-size:0.82rem;color:var(--text-muted);margin:3px 0 0">
              {{ lang.t().planningOptimizingDesc }}
            </p>
          </div>
        </div>
      </div>

      <!-- ══════════════════ GANTT ════════════════════════════════════════ -->
      <ng-container *ngIf="vm.active() && !vm.running()">

        <!-- Filters + zoom -->
        <div class="filters-row">
          <div class="filter-group">
            <span class="filter-lbl">{{ lang.t().planningFilterUrgence }}</span>
            <button class="fbtn" [class.active]="vm.filterUrgence()===0"
                    (click)="vm.filterUrgence.set(0)">{{ lang.t().planningFilterAll }}</button>
            <button *ngFor="let u of [1,2,3,4,5]" class="fbtn"
                    [class.active]="vm.filterUrgence()===u"
                    [style.border-left]="'3px solid '+vm.urgColor(u)"
                    (click)="vm.filterUrgence.set(u)">{{ u }}</button>
          </div>
          <div class="filter-group">
            <span class="filter-lbl">{{ lang.t().planningFilterMachine }}</span>
            <input type="text" class="search-input"
                   [placeholder]="lang.t().planningFilterMachinePlaceholder"
                   [value]="vm.filterMachine()"
                   (input)="vm.filterMachine.set($any($event.target).value)" />
          </div>
          <div class="filter-group">
            <span class="filter-lbl">{{ lang.t().planningFilterCommande }}</span>
            <input type="text" class="search-input"
                  [placeholder]="lang.t().planningFilterCommandePlaceholder"
                  [value]="vm.filterCommande()"
                  (input)="vm.filterCommande.set($any($event.target).value)" />
          </div>
          <div class="filter-group" style="margin-left:auto">
            <span class="filter-lbl">{{ lang.t().planningFilterZoom }}</span>
            <button class="zoom-btn" (click)="vm.zoomOut()">−</button>
            <span class="zoom-lbl">{{ vm.pxPerMin().toFixed(1) }}x</span>
            <button class="zoom-btn" (click)="vm.zoomIn()">+</button>
          </div>
        </div>

        <!-- Gantt container -->
        <div class="gantt-wrap">

          <div class="gantt-head">
            <div class="gantt-corner">
              <div class="corner-day">{{ lang.t().planningCornerDay }}</div>
              <div class="corner-hour">{{ lang.t().planningCornerHour }}</div>
            </div>
            <div class="gantt-head-scroll" #headScroll>
              <div class="gantt-days-row" [style.width.px]="vm.totalWidthPx()">
                <ng-container *ngFor="let d of vm.days()">
                  <div class="day-cell"
                       [style.left.px]="d.visibleX"
                       [style.width.px]="vm.dayWidthPx() - (d.visibleX - d.xPx)">
                    {{ d.label }}
                  </div>
                </ng-container>
              </div>
              <div class="gantt-hours-row" [style.width.px]="vm.totalWidthPx()">
                <ng-container *ngFor="let tick of vm.ticks()">
                  <div *ngIf="!tick.isMajor" class="hour-cell"
                       [class.hour-cell-first]="tick.isFirst"
                       [style.left.px]="tick.xPx">
                    {{ tick.label }}
                  </div>
                  <div *ngIf="tick.isMajor && tick.xPx > 0"
                       class="midnight-mark"
                       [style.left.px]="tick.xPx">
                  </div>
                </ng-container>
              </div>
            </div>
          </div>

          <div class="gantt-body-wrap">
            <div class="gantt-labels" #labelScroll>
              <ng-container *ngFor="let m of vm.visibleMachines()">
                <div class="machine-label"
                     [style.height.px]="m.heightPx"
                     [class.m-highlighted]="vm.filterMachine() && m.name.toLowerCase().includes(vm.filterMachine().toLowerCase())">
                  <span class="ml-name">{{ m.name }}</span>
                  <span class="ml-sub">{{ m.bars.length }} {{ lang.t().planningOpLabel }}</span>
                </div>
              </ng-container>
            </div>

            <div class="gantt-scroll" #ganttScroll (scroll)="onScroll($event)">
              <div class="gantt-inner"
                   [style.width.px]="vm.totalWidthPx()"
                   [style.height.px]="vm.totalHeightPx()">

                <div *ngFor="let d of vm.days()" class="day-separator"
                     [style.left.px]="d.xPx + vm.dayWidthPx()">
                </div>

                <ng-container *ngFor="let tick of vm.ticks()">
                  <div *ngIf="!tick.isMajor" class="hour-separator"
                       [style.left.px]="tick.xPx">
                  </div>
                </ng-container>

                <ng-container *ngFor="let m of vm.visibleMachines(); let mi = index">
                  <ng-container *ngFor="let bar of m.bars">
                    <div class="gbar"
                         [class.gbar-dim]="vm.isBarDimmed(bar)"
                         [class.gbar-sel]="vm.selectedBar() === bar"
                         [style.left.px]="bar.xPx"
                         [style.top.px]="vm.machineTopPx(mi) + 4 + bar.trackIdx * 36"
                         [style.width.px]="bar.wPx"
                         [style.background]="bar.color"
                         [style.border-left]="'4px solid ' + bar.urgenceColor"
                         (click)="vm.selectBar(bar)">
                      <div class="bar-title">{{ bar.row.numeroCommande }} · {{ bar.row.nomOperation }}</div>
                      <div class="bar-sub">{{ vm.pmToTime(bar.row.startPM) }}→{{ vm.pmToTime(bar.row.endPM) }}</div>
                    </div>
                  </ng-container>
                </ng-container>

              </div>
            </div>
          </div>
        </div>

        <!-- Detail panel + Table -->
        <div style="display:flex; flex-direction:column; width:100%; min-width:0;">

          <!-- Detail panel -->
          <div class="detail-panel" *ngIf="vm.selectedBar() as bar">
            <div class="dp-header">
              <div class="dp-color-stripe" [style.background]="bar.color"></div>
              <div>
                <p class="dp-cmd">{{ bar.row.numeroCommande }}</p>
                <p class="dp-op">{{ bar.row.nomOperation }}</p>
              </div>
              <button class="dp-close" (click)="vm.selectedBar.set(null)">✕</button>
            </div>
            <div class="dp-grid">
              <div class="dp-item"><span>{{ lang.t().planningDetailMachine }}</span><strong>{{ bar.row.machineName }}</strong></div>
              <div class="dp-item"><span>{{ lang.t().planningDetailStart }}</span><strong>{{ bar.row.dateStart }} {{ vm.pmToTime(bar.row.startPM) }}</strong></div>
              <div class="dp-item"><span>{{ lang.t().planningDetailEnd }}</span><strong>{{ bar.row.dateEnd }} {{ vm.pmToTime(bar.row.endPM) }}</strong></div>
              <div class="dp-item"><span>{{ lang.t().planningDetailLoad }}</span><strong>{{ bar.row.tempsChargementMinutes }} min</strong></div>
              <div class="dp-item"><span>{{ lang.t().planningDetailCycle }}</span><strong>{{ bar.row.dureeMinutes }} min</strong></div>
              <div class="dp-item"><span>{{ lang.t().planningDetailUnload }}</span><strong>{{ bar.row.tempsDecharementMinutes }} min</strong></div>
              <div class="dp-item"><span>{{ lang.t().planningDetailLot }}</span><strong>{{ bar.row.lotIdx + 1 }} / {{ bar.row.nbLots }}</strong></div>
              <div class="dp-item"><span>{{ lang.t().planningDetailPieces }}</span><strong>{{ bar.row.lotSize }}</strong></div>
              <div class="dp-item">
                <span>{{ lang.t().planningDetailUrgence }}</span>
                <strong [style.color]="bar.urgenceColor">{{ bar.row.urgence }}</strong>
              </div>
              <div class="dp-item">
                <span>{{ lang.t().planningDetailExportDate }}</span>
                <strong>
                  <span [class.export-late]="vm.isLate(bar.row.endPM, bar.row.dateExport)">{{ bar.row.dateExport }}</span>
                  <!-- Amber chip replaces the old red badge -->
                  <span *ngIf="vm.isLate(bar.row.endPM, bar.row.dateExport)" class="late-chip" style="margin-left:6px">{{ lang.t().planningLateChip }}</span>
                </strong>
              </div>
              <div class="dp-item"><span>{{ lang.t().planningDetailQty }}</span><strong>{{ bar.row.quantite }}</strong></div>
            </div>
          </div>

          <!-- Table -->
          <div class="table-section">
            <div class="section-hd">
              <span class="section-title">{{ lang.t().planningTableTitle }}</span>
              <span class="section-meta">{{ vm.filteredRows().length }} {{ lang.t().planningTableLines }}</span>
            </div>
            <div class="table-wrap">
              <div class="table-scroll-x">
                <table class="table">
                  <thead>
                    <tr>
                      <th>{{ lang.t().planningColMachine }}</th>
                      <th>{{ lang.t().planningColCommande }}</th>
                      <th>{{ lang.t().planningColOperation }}</th>
                      <th>{{ lang.t().planningColStart }}</th>
                      <th>{{ lang.t().planningColEnd }}</th>
                      <th>{{ lang.t().planningColLoad }}</th>
                      <th>{{ lang.t().planningColCycle }}</th>
                      <th>{{ lang.t().planningColUnload }}</th>
                      <th>{{ lang.t().planningColLot }}</th>
                      <th>{{ lang.t().planningColPieces }}</th>
                      <th>{{ lang.t().planningColUrgence }}</th>
                      <th>{{ lang.t().planningColExport }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let r of vm.filteredRows()"
                        [class.row-late]="vm.isLate(r.endPM, r.dateExport)">
                      <td class="td-bold">{{ r.machineName }}</td>
                      <td>
                        <div class="cmd-cell">
                          <div class="cmd-dot"
                               [style.background]="vm.cmdColor(r.numeroCommande)"
                               [style.border-left]="'3px solid '+vm.urgColor(r.urgence)">
                          </div>
                          <span class="td-mono">{{ r.numeroCommande }}</span>
                        </div>
                      </td>
                      <td>{{ r.nomOperation }}</td>
                      <td class="td-mono">{{ r.dateStart }} {{ vm.pmToTime(r.startPM) }}</td>
                      <td class="td-mono">{{ r.dateEnd }} {{ vm.pmToTime(r.endPM) }}</td>
                      <td class="td-mono" style="color:#0891B2">{{ r.tempsChargementMinutes }}m</td>
                      <td class="td-mono" style="color:#475569">{{ r.dureeMinutes }}m</td>
                      <td class="td-mono" style="color:#EA580C">{{ r.tempsDecharementMinutes }}m</td>
                      <td class="td-mono" style="color:#6366f1;font-weight:700">{{ r.lotIdx+1 }}/{{ r.nbLots }}</td>
                      <td class="td-mono">{{ r.lotSize }}</td>
                      <td>
                        <span class="urgence-badge"
                              [style.background]="vm.urgColor(r.urgence)+'22'"
                              [style.color]="vm.urgColor(r.urgence)">{{ r.urgence }}</span>
                      </td>
                      <td>
                        <!-- Export date: amber chip below date when late, no confusing red text -->
                        <div class="export-cell">
                          <span class="export-date" [class.export-late]="vm.isLate(r.endPM, r.dateExport)">
                            {{ r.dateExport }}
                          </span>
                          <span *ngIf="vm.isLate(r.endPM, r.dateExport)" class="late-chip">{{ lang.t().planningLateChip }}</span>
                        </div>
                      </td>
                    </tr>
                    <tr *ngIf="!vm.filteredRows().length">
                      <td colspan="12" class="empty-row">{{ lang.t().planningTableEmpty }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </ng-container>

    </div>
  `,
  styles: [`
    .page          { padding:1.25rem; max-width:1600px; margin:0 auto; }
    @media(min-width:640px){ .page { padding:2rem; } }

    .page-header   { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem; gap:1rem; flex-wrap:wrap; }
    .page-title    { font-size:1.35rem; font-weight:800; color:var(--text); margin:0; }
    .page-subtitle { font-size:0.85rem; color:var(--text-muted); margin:0.2rem 0 0; display:flex; align-items:center; gap:0.5rem; }
    .header-actions { display:flex; gap:0.6rem; flex-wrap:wrap; align-items:center; }

    .badge-status { font-size:0.7rem; font-weight:700; padding:2px 8px; border-radius:20px; letter-spacing:.04em; }
    .status-ok    { background:rgba(22,163,74,.15); color:#16A34A; }
    .status-warn  { background:rgba(234,179,8,.15);  color:#CA8A04; }

    /* ── KPI grid ─────────────────────────────────────────────────────── */
    .kpi-grid {
      display:grid; grid-template-columns:repeat(6, minmax(195px, 1fr));
      gap:0.75rem; margin-bottom:1.5rem;
    }
    .kpi-card {
      background:var(--surface,#fff); border:1.5px solid var(--border,#e5e7eb);
      border-radius:14px; padding:1rem 1.1rem;
      display:flex; align-items:center; gap:0.85rem; min-height:84px;
      transition:box-shadow .18s, transform .15s;
    }
    .kpi-card:hover { box-shadow:0 6px 24px rgba(0,0,0,.09); transform:translateY(-1px); }
    .kpi-icon  { width:42px; height:42px; border-radius:11px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .kpi-icon svg { width:18px; height:18px; }
    .kpi-body  { min-width:0; }
    .kpi-label { font-size:0.60rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:.07em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin:0 0 2px; }
    .kpi-value { font-size:1.50rem; font-weight:800; line-height:1.1; margin:0; color:var(--text); }
    .kpi-value small { font-size:0.8rem; font-weight:400; color:var(--text-muted); margin-left:1px; }

    .kpi-blue    { background:#eff6ff; color:#1d4ed8; }
    .kpi-violet  { background:#f5f3ff; color:#7c3aed; }
    .kpi-emerald { background:#ecfdf5; color:#059669; }
    .kpi-amber   { background:#fffbeb; color:#d97706; }
    .kpi-cyan    { background:#ecfeff; color:#0891b2; }
    .kpi-red     { background:#fff1f2; color:#dc2626; }

    .kpi-blue-txt    { color:#1d4ed8; }
    .kpi-violet-txt  { color:#7c3aed; }
    .kpi-emerald-txt { color:#059669; }
    .kpi-amber-txt   { color:#d97706; }
    .kpi-cyan-txt    { color:#0891b2; }
    .kpi-ok-txt      { color:#16a34a; }
    .kpi-err-txt     { color:#dc2626; }

    /* ── Late-delivery notice (amber — NOT red, NOT an error) ─────────── */
    .notice-late {
      display:flex; gap:0.75rem; align-items:flex-start;
      padding:0.85rem 1.1rem;
      background:#fffbeb; border:1px solid #fde68a; border-radius:10px;
      margin-bottom:0.6rem;
    }
    .notice-late-icon {
      width:30px; height:30px; border-radius:8px;
      background:#fef3c7; color:#b45309;
      display:flex; align-items:center; justify-content:center; flex-shrink:0;
    }
    .notice-late-body { flex:1; min-width:0; }
    .notice-late-title {
      font-size:0.83rem; font-weight:700; color:#92400e; margin:0 0 4px;
    }
    .notice-late-row  {
      font-size:0.79rem; color:#a16207; margin:0 0 2px; line-height:1.45;
    }

    /* ── Split/capacity warnings (yellow) ────────────────────────────── */
    .warnings-box {
      display:flex; gap:0.6rem; align-items:flex-start;
      padding:0.75rem 1rem; background:#fffbeb; border:1px solid #fcd34d;
      border-radius:8px; margin-bottom:0.5rem; color:#92400e; font-size:0.84rem;
    }

    /* ── Late-order chip ──────────────────────────────────────────────── */
    /* Replaces the old late-badge. Amber pill — clearly visible,         */
    /* clearly not an error.                                               */
    .late-chip {
      display:inline-flex; align-items:center;
      background:#fef3c7; color:#92400e; border:1px solid #fde68a;
      border-radius:20px; font-size:9px; font-weight:700;
      padding:2px 8px; white-space:nowrap; letter-spacing:.02em;
    }

    /* Export date cell */
    .export-cell  { display:flex; flex-direction:column; gap:3px; }
    .export-date  { font-family:monospace; font-size:11px; color:#94a3b8; }
    .export-late  { color:#92400e !important; font-weight:600; }

    /* Late table row: very subtle amber tint so the eye finds it fast */
    .row-late td  { background:#fffdf0 !important; }

    /* ── Buttons ──────────────────────────────────────────────────────── */
    .btn-outline-green, .btn-outline-rose {
      display:inline-flex; align-items:center; gap:0.4rem;
      padding:0.42rem 0.95rem; border-radius:9px;
      font-size:0.84rem; font-weight:600; font-family:inherit;
      cursor:pointer; transition:background .12s; border:1.5px solid;
    }
    .btn-icon { width:14px; height:14px; }
    .btn-outline-green { background:#f0fdf4; color:#15803d; border-color:#bbf7d0; }
    .btn-outline-green:hover   { background:#dcfce7; }
    .btn-outline-green:disabled { opacity:.5; cursor:not-allowed; }
    .btn-outline-rose  { background:#fff1f2; color:#be123c; border-color:#fecdd3; }
    .btn-outline-rose:hover   { background:#ffe4e6; }
    .btn-outline-rose:disabled { opacity:.5; cursor:not-allowed; }

    .btn-primary   { display:inline-flex; align-items:center; gap:0.5rem; padding:0.6rem 1.2rem; background:var(--color-primary,#013F82); color:#fff; border:none; border-radius:8px; font-size:0.88rem; font-weight:700; font-family:inherit; cursor:pointer; white-space:nowrap; }
    .btn-primary:hover    { opacity:0.88; }
    .btn-primary:disabled { opacity:0.55; cursor:not-allowed; }
    .btn-secondary { display:inline-flex; align-items:center; gap:0.5rem; padding:0.55rem 1rem; background:#e8edf4!important; color:#0F1C2E!important; border:1.5px solid #c8d4e0!important; border-radius:8px; font-size:0.85rem; font-weight:600; font-family:inherit; cursor:pointer; }
    .btn-secondary:hover:not(:disabled) { background:#d0dae6!important; }
    .btn-secondary:disabled { opacity:0.55; cursor:not-allowed; }

    .f-select { padding:0.55rem 2rem 0.55rem 0.8rem; border:1.5px solid var(--border); border-radius:8px; background:var(--surface,#fff); color:var(--text); font-size:0.855rem; font-family:inherit; outline:none; cursor:pointer; }
    .history-sel { padding:0.5rem 2rem 0.5rem 0.75rem; border:1.5px solid var(--border,#e5e7eb); border-radius:8px; background:var(--surface,#fff); color:var(--text); font-size:0.855rem; font-family:inherit; outline:none; cursor:pointer; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right .6rem center; -webkit-appearance:none; }

    /* ── Spinner ──────────────────────────────────────────────────────── */
    .spinner    { width:13px; height:13px; border:2px solid rgba(0,0,0,.15); border-top-color:currentColor; border-radius:50%; display:inline-block; animation:spin .7s linear infinite; }
    .spinner-lg { width:36px; height:36px; border:3px solid var(--border); border-top-color:var(--color-primary,#013F82); border-radius:50%; animation:spin .8s linear infinite; flex-shrink:0; }

    /* ── Toast ────────────────────────────────────────────────────────── */
    .toast { position:fixed; bottom:1.5rem; right:1.5rem; z-index:50; display:flex; align-items:center; gap:0.6rem; padding:0.8rem 1.1rem; border-radius:12px; font-size:0.85rem; font-weight:600; color:#fff; box-shadow:0 8px 24px rgba(0,0,0,.18); max-width:22rem; animation:toastIn .3s cubic-bezier(.34,1.4,.64,1); }
    .toast-success { background:#16a34a; }
    .toast-error   { background:#dc2626; }

    /* ── Empty / error ────────────────────────────────────────────────── */
    .empty-page    { display:flex; flex-direction:column; align-items:center; padding:4rem 2rem; gap:0.5rem; text-align:center; }
    .empty-icon    { width:72px; height:72px; border-radius:50%; background:var(--surface,#f9fafb); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; color:var(--text-muted); margin-bottom:0.5rem; }
    .empty-page p  { font-weight:700; color:var(--text); margin:0; font-size:1.05rem; }
    .empty-page span { font-size:0.85rem; color:var(--text-muted); }
    .alert-error   { display:flex; align-items:center; gap:0.6rem; padding:0.8rem 1rem; background:#fef2f2; border:1px solid rgba(220,38,38,.2); border-radius:8px; color:#dc2626; font-size:0.875rem; margin-bottom:1rem; }
    .alert-retry   { margin-left:auto; background:none; border:none; color:#dc2626; cursor:pointer; font-size:0.8rem; }

    /* ── Running ──────────────────────────────────────────────────────── */
    .running-card { display:flex; flex-direction:column; align-items:center; gap:1rem; padding:3rem 2rem; background:var(--surface,#fff); border:1px solid var(--border); border-radius:14px; margin-bottom:1.5rem; position:relative; overflow:hidden; }
    .pulse-ring   { position:absolute; inset:0; border-radius:14px; animation:pulse-border 2s ease-in-out infinite; }
    .running-body { display:flex; align-items:center; gap:1.25rem; }

    /* ── Filters ──────────────────────────────────────────────────────── */
    .filters-row  { display:flex; flex-wrap:wrap; gap:0.75rem; align-items:center; margin-bottom:0.85rem; }
    .filter-group { display:flex; align-items:center; gap:0.4rem; }
    .filter-lbl   { font-size:0.78rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:.04em; white-space:nowrap; }
    .fbtn         { padding:0.3rem 0.75rem; font-size:0.8rem; font-weight:600; border-radius:6px; border:1.5px solid var(--border,#e5e7eb); background:var(--surface,#fff); color:var(--text-muted); cursor:pointer; transition:all .12s; }
    .fbtn.active  { background:var(--color-primary,#013F82); color:#fff; border-color:var(--color-primary,#013F82); }
    .fbtn:hover:not(.active) { border-color:#aab8cc; }
    .zoom-btn { width:28px; height:28px; border-radius:6px; border:1.5px solid var(--border); background:var(--surface,#fff); cursor:pointer; font-size:16px; display:flex; align-items:center; justify-content:center; color:var(--text); }
    .zoom-btn:hover { border-color:var(--color-primary,#013F82); color:var(--color-primary,#013F82); }
    .zoom-lbl     { font-size:0.75rem; color:var(--text-muted); min-width:30px; text-align:center; font-family:monospace; }
    .search-input { padding:0.4rem 0.7rem; border:1.5px solid var(--border); border-radius:7px; background:var(--surface,#fff); color:var(--text); font-size:0.855rem; font-family:inherit; outline:none; width:160px; }
    .search-input:focus { border-color:var(--color-primary,#013F82); box-shadow:0 0 0 3px rgba(1,63,130,.1); }

    /* ── Gantt ────────────────────────────────────────────────────────── */
    .gantt-wrap       { background:var(--surface,#fff); border:1px solid var(--border,#e5e7eb); border-radius:12px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,.06); margin-bottom:1rem; }
    .gantt-head       { display:flex; border-bottom:2px solid #94a3b8; background:#f8fafc; }
    .gantt-corner     { width:190px; min-width:190px; border-right:2px solid #94a3b8; display:flex; flex-direction:column; }
    .corner-day       { flex:1; display:flex; align-items:center; padding:0 14px; font-size:10px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:.06em; border-bottom:1px solid #cbd5e1; }
    .corner-hour      { height:22px; display:flex; align-items:center; padding:0 14px; font-size:9px; font-weight:600; color:#94a3b8; text-transform:uppercase; letter-spacing:.05em; }
    .gantt-head-scroll { flex:1; overflow:hidden; position:relative; display:flex; flex-direction:column; }
    .gantt-days-row   { position:relative; height:32px; border-bottom:1px solid #cbd5e1; }
    .day-cell         { position:absolute; top:0; height:100%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; color:#1e293b; border-right:2px solid #94a3b8; background:#f8fafc; white-space:nowrap; overflow:hidden; letter-spacing:.02em; }
    .gantt-hours-row  { position:relative; height:22px; background:#f1f5f9; }
    .hour-cell        { position:absolute; top:0; height:100%; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:600; color:#64748b; font-family:monospace; white-space:nowrap; transform:translateX(-50%); pointer-events:none; }
    .hour-cell-first  { transform:translateX(2px) !important; justify-content:flex-start; }
    .midnight-mark    { position:absolute; top:0; bottom:0; width:2px; background:#94a3b8; opacity:.6; pointer-events:none; }
    .gantt-body-wrap  { display:flex; max-height:520px; }
    .gantt-labels     { width:190px; min-width:190px; overflow:hidden; border-right:2px solid #e2e8f0; }
    .machine-label    { display:flex; flex-direction:column; justify-content:center; padding:0 14px; border-bottom:1px solid #e2e8f0; transition:background .1s; }
    .machine-label.m-highlighted { background:#dbeafe; }
    .ml-name  { font-size:11px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:var(--text); }
    .ml-sub   { font-size:10px; color:var(--text-muted); margin-top:2px; }
    .gantt-scroll     { flex:1; overflow:auto; }
    .gantt-inner      { position:relative; }
    .day-separator    { position:absolute; top:0; width:2px; background:#94a3b8; opacity:.5; pointer-events:none; bottom:0; }
    .hour-separator   { position:absolute; top:0; width:1px; background:#cbd5e1; opacity:.35; pointer-events:none; bottom:0; }
    .gbar       { position:absolute; border-radius:4px; cursor:pointer; overflow:hidden; padding:0 5px; box-shadow:0 1px 3px rgba(0,0,0,.18); transition:filter .1s; height:30px; display:flex; flex-direction:column; justify-content:center; }
    .gbar:hover { filter:brightness(1.14); z-index:50!important; }
    .gbar-dim   { opacity:0.07; pointer-events:none; }
    .gbar-sel   { outline:2px solid #fff; outline-offset:1px; z-index:60!important; }
    .bar-title  { font-size:9px; font-weight:700; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1.3; }
    .bar-sub    { font-size:8px; color:rgba(255,255,255,.82); font-family:monospace; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

    /* ── Detail panel ─────────────────────────────────────────────────── */
    .detail-panel  { background:var(--surface,#fff); border:1px solid var(--border); border-radius:12px; padding:1rem 1.25rem; margin-bottom:1rem; animation:slideUp .18s ease; width:100%; box-sizing:border-box; display:block; }
    .dp-header     { display:flex; align-items:center; gap:0.85rem; margin-bottom:0.9rem; }
    .dp-color-stripe { width:6px; height:36px; border-radius:3px; flex-shrink:0; }
    .dp-cmd   { font-weight:800; font-size:1rem; margin:0; color:var(--text); font-family:monospace; }
    .dp-op    { font-size:0.82rem; color:var(--text-muted); margin:2px 0 0; }
    .dp-close { margin-left:auto; background:none; border:none; font-size:18px; color:var(--text-muted); cursor:pointer; }
    .dp-grid  { display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:0.6rem; }
    .dp-item  { background:var(--surface-2,#f9fafb); border-radius:8px; padding:0.5rem 0.75rem; }
    .dp-item span   { font-size:0.72rem; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:.04em; display:block; }
    .dp-item strong { font-size:0.875rem; color:var(--text); display:block; margin-top:2px; }

    /* ── Table ────────────────────────────────────────────────────────── */
    .table-section { margin-top:1rem; }
    .section-hd    { display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem; }
    .section-title { font-size:11px; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:.06em; }
    .section-meta  { font-size:11px; color:#94a3b8; }
    .table-wrap    { background:var(--surface,#fff); border:1px solid var(--border); border-radius:12px; overflow:hidden; width:100%; }
    .table-scroll-x { overflow-x:auto; }
    .table         { width:100%; border-collapse:collapse; font-size:11px; min-width:820px; }
    .table thead tr { background:var(--surface-2,#f9fafb); border-bottom:2px solid var(--border); }
    .table th { padding:8px 12px; text-align:left; font-size:10px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:.04em; white-space:nowrap; }
    .table td { padding:7px 10px; border-bottom:1px solid #f1f5f9; color:var(--text); vertical-align:middle; white-space:nowrap; }
    .table tbody tr:last-child td { border-bottom:none; }
    .table tbody tr:hover td { background:var(--surface-2,#f9fafb); }
    .td-bold  { font-weight:700; }
    .td-mono  { font-family:monospace; }
    .cmd-cell { display:flex; align-items:center; gap:6px; }
    .cmd-dot  { width:10px; height:10px; border-radius:2px; flex-shrink:0; }
    .urgence-badge { display:inline-flex; align-items:center; justify-content:center; min-width:24px; height:24px; padding:0 6px; border-radius:12px; font-size:0.78rem; font-weight:700; }
    .empty-row { text-align:center; padding:3rem; color:var(--text-muted); font-size:0.9rem; }

    /* ── Modal ────────────────────────────────────────────────────────── */
    .modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,.45); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:1000; animation:fadeIn .2s ease; }
    .modal-box      { background:var(--surface,#fff); border-radius:16px; box-shadow:0 24px 64px rgba(0,0,0,.22); width:560px; max-width:95vw; animation:slideUp .22s cubic-bezier(.34,1.3,.64,1); }
    .modal-header   { display:flex; align-items:center; gap:0.85rem; padding:1.25rem 1.5rem 0; }
    .modal-icon     { width:40px; height:40px; border-radius:10px; background:var(--color-primary,#013F82); color:#fff; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .modal-title    { font-size:1.1rem; font-weight:800; margin:0; color:var(--text); }
    .modal-subtitle { font-size:0.8rem; color:var(--text-muted); margin:2px 0 0; }
    .modal-close    { margin-left:auto; background:none; border:none; font-size:18px; color:var(--text-muted); cursor:pointer; line-height:1; padding:0.25rem; border-radius:4px; }
    .modal-close:hover { background:var(--surface-2,#f1f5f9); }
    .modal-body     { padding:1.25rem 1.5rem; }
    .modal-footer   { display:flex; justify-content:flex-end; gap:0.6rem; padding:1rem 1.5rem; border-top:1px solid var(--border,#e5e7eb); }

    .section-divider { padding-bottom:1.1rem; margin-bottom:1.1rem; border-bottom:1px solid var(--border,#e5e7eb); }
    .datetime-row   { display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap; }
    .datetime-field { flex:1; min-width:0; }
    .datetime-input { width:100%; padding:0.55rem 0.8rem; border:1.5px solid var(--border,#e5e7eb); border-radius:8px; background:var(--surface,#fff); color:var(--text); font-size:0.9rem; font-family:inherit; outline:none; transition:border-color .15s, box-shadow .15s; box-sizing:border-box; }
    .datetime-input:focus { border-color:var(--color-primary,#013F82); box-shadow:0 0 0 3px rgba(1,63,130,.12); }
    .btn-now { display:inline-flex; align-items:center; gap:0.35rem; padding:0.52rem 0.9rem; border:1.5px solid var(--border,#e5e7eb); border-radius:8px; background:var(--surface,#fff); color:var(--text-muted); font-size:0.8rem; font-weight:600; font-family:inherit; cursor:pointer; white-space:nowrap; transition:border-color .12s, color .12s, background .12s; }
    .btn-now:hover { border-color:var(--color-primary,#013F82); color:var(--color-primary,#013F82); background:#eff6ff; }
    .datetime-preview { display:flex; align-items:center; gap:0.4rem; margin-top:0.55rem; font-size:0.78rem; color:var(--text-muted); }
    .datetime-preview strong { color:var(--color-primary,#013F82); font-weight:700; }
    .opt-label { display:flex; align-items:center; gap:0.4rem; font-size:0.82rem; font-weight:700; color:var(--text); text-transform:uppercase; letter-spacing:.05em; margin-bottom:0.35rem; }
    .opt-hint  { font-size:0.82rem; color:var(--text-muted); margin:0 0 1rem; line-height:1.5; }
    .machine-picker { display:grid; grid-template-columns:repeat(3,1fr); gap:0.65rem; margin-bottom:1rem; }
    .mp-btn { position:relative; display:flex; flex-direction:column; align-items:center; gap:0.45rem; padding:0.85rem 0.6rem 0.75rem; border:2px solid var(--border,#e5e7eb); border-radius:12px; background:var(--surface,#fff); cursor:pointer; font-family:inherit; transition:all .15s; text-align:center; }
    .mp-btn:hover  { border-color:#94a3b8; background:var(--surface-2,#f9fafb); }
    .mp-btn-active { border-color:var(--color-primary,#013F82) !important; background:#EEF3FB !important; }
    .mp-count { font-size:0.85rem; font-weight:800; color:var(--text); }
    .mp-desc  { font-size:0.73rem; color:var(--text-muted); line-height:1.3; }
    .mp-check { position:absolute; top:6px; right:8px; font-size:0.8rem; font-weight:800; color:var(--color-primary,#013F82); }
    .mp-illustration { width:100%; display:flex; flex-direction:column; gap:3px; padding:4px 0; }
    .mp-row { display:flex; align-items:center; gap:4px; height:12px; }
    .mp-machine-label { font-size:8px; font-weight:700; color:#64748b; width:16px; flex-shrink:0; text-align:right; }
    .mp-bar-track { flex:1; position:relative; height:8px; background:#f1f5f9; border-radius:3px; overflow:hidden; }
    .mp-bar { position:absolute; top:1px; height:6px; border-radius:2px; opacity:0.85; }
    .opt-info { display:flex; align-items:flex-start; gap:0.5rem; background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:0.65rem 0.85rem; font-size:0.8rem; color:#1e40af; line-height:1.5; }
    .opt-info-neutral { background:#f8fafc; border-color:#e2e8f0; color:#475569; }
    .opt-info svg { flex-shrink:0; margin-top:1px; }

    /* ── History filter panel ─────────────────────────────────────────── */
    .filter-panel { background:var(--surface,#fff); border:1.5px solid var(--border,#e5e7eb); border-radius:12px; margin-bottom:1rem; overflow:hidden; }
    .filter-panel-toggle { width:100%; display:flex; justify-content:space-between; align-items:center; padding:0.75rem 1.1rem; background:none; border:none; cursor:pointer; font-family:inherit; }
    .filter-panel-toggle:hover { background:var(--surface-2,#f9fafb); }
    .filter-panel-title { display:flex; align-items:center; gap:0.5rem; font-size:0.83rem; font-weight:700; color:var(--text); text-transform:uppercase; letter-spacing:.05em; }
    .fp-icon { width:14px; height:14px; color:var(--text-muted); flex-shrink:0; }
    .filter-badge { background:var(--color-primary,#013F82); color:#fff; border-radius:20px; font-size:0.7rem; font-weight:700; padding:1px 7px; line-height:1.6; }
    .fp-chevron { width:16px; height:16px; color:var(--text-muted); transition:transform .2s; flex-shrink:0; }
    .fp-chevron-open { transform:rotate(180deg); }
    .filter-panel-body { border-top:1px solid var(--border,#e5e7eb); padding:1rem 1.1rem; }
    .filter-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(200px,1fr)); gap:0.75rem; margin-bottom:0.85rem; }
    .fp-field { display:flex; flex-direction:column; gap:0.3rem; }
    .fp-label { font-size:0.72rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:.04em; }
    .fp-input { padding:0.45rem 0.75rem; border:1.5px solid var(--border,#e5e7eb); border-radius:8px; background:var(--surface,#fff); color:var(--text); font-size:0.84rem; font-family:inherit; outline:none; width:100%; box-sizing:border-box; }
    .fp-input:focus { border-color:var(--color-primary,#013F82); box-shadow:0 0 0 3px rgba(1,63,130,.1); }
    .fp-icon-wrap { position:relative; }
    .fp-field-icon { position:absolute; left:0.55rem; top:50%; transform:translateY(-50%); width:13px; height:13px; color:var(--text-muted); pointer-events:none; }
    .fp-input-icon { padding-left:2rem; }
    .fp-select-wrap { position:relative; }
    .fp-select { -webkit-appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right .6rem center; padding-right:2rem; cursor:pointer; }
    .fp-empty { font-size:0.8rem; color:var(--text-muted); margin:0; padding:0.45rem 0.75rem; border:1.5px dashed var(--border,#e5e7eb); border-radius:8px; }
    .filter-footer { display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border,#e5e7eb); padding-top:0.75rem; }
    .filter-count { font-size:0.8rem; color:var(--text-muted); }
    .filter-count strong { color:var(--text); font-weight:700; }
    .btn-reset { display:inline-flex; align-items:center; gap:0.35rem; padding:0.38rem 0.85rem; border:1.5px solid var(--border,#e5e7eb); border-radius:7px; background:var(--surface,#fff); color:var(--text-muted); font-size:0.8rem; font-weight:600; font-family:inherit; cursor:pointer; transition:all .12s; }
    .btn-reset svg { width:12px; height:12px; }
    .btn-reset:hover { border-color:#dc2626; color:#dc2626; background:#fff1f2; }

    @keyframes spin          { to { transform:rotate(360deg); } }
    @keyframes fadeIn        { from{opacity:0} to{opacity:1} }
    @keyframes slideUp       { from{transform:translateY(8px);opacity:0} to{transform:translateY(0);opacity:1} }
    @keyframes toastIn       { from{transform:translateY(12px) scale(.95);opacity:0} to{transform:none;opacity:1} }
    @keyframes pulse-border  { 0%,100%{box-shadow:0 0 0 0 rgba(1,63,130,.2)} 50%{box-shadow:0 0 0 12px rgba(1,63,130,.05)} }
  `]
})
export class PlannerPlanningComponent implements OnInit {

  readonly vm   = inject(PlanningViewModel);
  readonly lang = inject(LanguageService);
  private datePipe = inject(DatePipe);

  historyFiltersOpen = signal(true);

  @ViewChild('ganttScroll') ganttScrollEl!: ElementRef<HTMLDivElement>;
  @ViewChild('headScroll')  headScrollEl!:  ElementRef<HTMLDivElement>;
  @ViewChild('labelScroll') labelScrollEl!: ElementRef<HTMLDivElement>;

  ngOnInit(): void { this.vm.loadInitial(); }

  onScroll(e: Event): void {
    const sc = e.target as HTMLDivElement;
    if (this.headScrollEl?.nativeElement)
      this.headScrollEl.nativeElement.scrollLeft = sc.scrollLeft;
    if (this.labelScrollEl?.nativeElement)
      this.labelScrollEl.nativeElement.scrollTop = sc.scrollTop;
  }

  trackTick(_: number, t: { xPx: number }) { return t.xPx; }

  asN(n: number): 1 | 2 | 3 { return n as 1 | 2 | 3; }

  nowLocal(): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
           `T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }

  minDatetime(): string { return this.nowLocal(); }

  formatPreview(dt: string): string {
    if (!dt) return '';
    try {
      const d      = new Date(dt);
      const locale = this.lang.lang() === 'fr' ? 'fr-FR' : 'en-GB';
      const pad    = (n: number) => String(n).padStart(2, '0');
      const datePart = d.toLocaleDateString(locale, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
      const timePart = `${pad(d.getHours())}h${pad(d.getMinutes())}`;
      const at = this.lang.lang() === 'fr' ? 'à' : 'at';
      return `${datePart} ${at} ${timePart}`;
    } catch { return dt; }
  }

  historyLabel(h: PlanningSummary): string {
    const date  = this.datePipe.transform(h.dateGeneration, 'dd/MM HH:mm') ?? '';
    const ms    = this.formatMakespanDays(h.makespanDays);
    const msStr = ms ? ` — ${ms}` : '';
    return `${date}${msStr} — ${h.nombreCommandes} cmd`;
  }

  getIllustrationRows(n: number): { left: number; width: number; color: string }[][] {
    const COLORS = ['#1D4ED8', '#B91C1C', '#15803D'];
    return Array.from({ length: n }, (_, i) => {
      const w = 100 / n;
      return [{ left: i * w, width: w - 2, color: COLORS[i] }];
    });
  }

  getMachineDesc(n: number): string {
    if (n === 1) return this.lang.t().planningMachineDesc1;
    if (n === 2) return this.lang.t().planningMachineDesc2;
    return this.lang.t().planningMachineDesc3;
  }

  formatMakespanDays(days: number): string {
    if (!days || days <= 0) return '';
    const t        = this.lang.t();
    const totalMin = Math.round(days * 1440);
    const d = Math.floor(totalMin / 1440);
    const h = Math.floor((totalMin % 1440) / 60);
    const m = totalMin % 60;
    if (d > 0 && h > 0) return `${d}${t.planningKpiMakespanDay} ${h}${t.planningKpiMakespanHour}`;
    if (d > 0)           return `${d}${t.planningKpiMakespanDay}`;
    if (h > 0 && m > 0)  return `${h}${t.planningKpiMakespanHour} ${m}min`;
    if (h > 0)            return `${h}${t.planningKpiMakespanHour}`;
    return `${m}min`;
  }
}
