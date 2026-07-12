import {
  Component, OnInit, inject, ElementRef, ViewChild,
  ChangeDetectionStrategy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { LanguageService } from '../../shared/services/language.service';
import {
  WorkerPlanningViewModel,
  GanttBar, MachineRow, TimelineTick,
} from './worker-planning.viewmodel';

export type { GanttBar, MachineRow, TimelineTick };

@Component({
  selector: 'app-worker-planning',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [WorkerPlanningViewModel],
  imports: [CommonModule, FormsModule],
  template: `

    <!--  Toast  -->
    <div *ngIf="wvm.toast()" class="toast"
         [class.toast-success]="wvm.toast()!.type === 'success'"
         [class.toast-error]="wvm.toast()!.type === 'error'">
      <svg *ngIf="wvm.toast()!.type === 'success'" class="toast-icon"
           viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <svg *ngIf="wvm.toast()!.type === 'error'" class="toast-icon"
           viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      {{ wvm.toast()!.msg }}
    </div>

    <div class="page">

      <!--  Page header  -->
      <div class="page-header">
        <div class="page-header-text">
          <h1 class="page-title">{{ t().workerPlanningTitle }}</h1>
          <p class="page-subtitle">
            {{ t().workerPlanningSubtitle }}
            <span *ngIf="wvm.active()" class="badge-status"
                  [class.status-ok]="wvm.active()!.statut === 'optimal'"
                  [class.status-warn]="wvm.active()!.statut !== 'optimal'">
              {{ wvm.active()!.statut | uppercase }}
            </span>
          </p>
        </div>

        <div class="header-actions" *ngIf="wvm.active()">
          <button class="btn-outline-green" [disabled]="wvm.exportingExcel()"
                  (click)="wvm.exportExcel()">
            <span *ngIf="wvm.exportingExcel()" class="spinner"></span>
            <svg *ngIf="!wvm.exportingExcel()" class="btn-icon"
                 viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M8 10l4 4 4-4"/>
            </svg>
            {{ wvm.exportingExcel() ? t().planningExporting : 'Excel' }}
          </button>
          <button class="btn-outline-rose" [disabled]="wvm.exportingPdf()"
                  (click)="wvm.exportPdf()">
            <span *ngIf="wvm.exportingPdf()" class="spinner"></span>
            <svg *ngIf="!wvm.exportingPdf()" class="btn-icon"
                 viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            {{ wvm.exportingPdf() ? t().planningExporting : 'PDF' }}
          </button>
        </div>
      </div>

      <!--  KPI cards  -->
      <div class="kpi-grid">

        <div class="kpi-card">
          <div class="kpi-icon kpi-blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="17" rx="2"/>
              <path d="M3 9h18M8 2v4M16 2v4"/>
            </svg>
          </div>
          <div class="kpi-body">
            <p class="kpi-label">{{ t().workerKpiPlannings }}</p>
            <p class="kpi-value kpi-blue-txt">{{ wvm.history().length }}</p>
            <p class="kpi-sub" *ngIf="wvm.activeHistoryFilterCount()">
              {{ wvm.filteredHistory().length }} {{ t().adminFilteredLabel }}
            </p>
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
            <p class="kpi-label">{{ t().planningKpiCommandes }}</p>
            <p class="kpi-value kpi-emerald-txt">{{ wvm.active()?.nombreCommandes ?? '—' }}</p>
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
            <p class="kpi-label">{{ t().planningKpiMachines }}</p>
            <p class="kpi-value kpi-violet-txt">{{ wvm.activeMachines() || '—' }}</p>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon kpi-cyan">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div class="kpi-body">
            <p class="kpi-label">{{ t().planningKpiMakespan }}</p>
            <p class="kpi-value kpi-cyan-txt">{{ wvm.makespanFormatted() }}</p>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon kpi-amber">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div class="kpi-body">
            <p class="kpi-label">{{ t().planningKpiLignes }}</p>
            <p class="kpi-value kpi-amber-txt">{{ wvm.active()?.nombreLignes ?? '—' }}</p>
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
            <p class="kpi-label">{{ t().planningKpiOnTime }}</p>
            <p class="kpi-value"
               [class.kpi-ok-txt]="wvm.onTimePct() >= 80"
               [class.kpi-err-txt]="wvm.onTimePct() < 80">
              {{ wvm.active() ? wvm.onTimePct() + '%' : '—' }}
            </p>
          </div>
        </div>

      </div>

      <!--  History filter panel  -->
      <div *ngIf="wvm.history().length" class="filter-panel">

        <button type="button" class="filter-panel-toggle"
                (click)="historyFiltersOpen.set(!historyFiltersOpen())">
          <span class="filter-panel-title">
            <svg class="fp-icon" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            {{ t().adminFilterTitle }}
            <span *ngIf="wvm.activeHistoryFilterCount()" class="filter-badge">
              {{ wvm.activeHistoryFilterCount() }}
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
              <label class="fp-label">{{ t().adminFilterDateFrom }}</label>
              <input type="date" class="fp-input"
                     [ngModel]="wvm.filterDateFrom()"
                     (ngModelChange)="wvm.filterDateFrom.set($event)"/>
            </div>

            <div class="fp-field">
              <label class="fp-label">{{ t().adminFilterDateTo }}</label>
              <input type="date" class="fp-input"
                     [ngModel]="wvm.filterDateTo()"
                     (ngModelChange)="wvm.filterDateTo.set($event)"/>
            </div>

            <div class="fp-field">
              <label class="fp-label">{{ t().adminFilterMakespan }}</label>
              <div class="fp-icon-wrap">
                <svg class="fp-field-icon" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <input type="number" min="0" placeholder="—" class="fp-input fp-input-icon"
                       [ngModel]="wvm.filterMakespan()"
                       (ngModelChange)="wvm.filterMakespan.set($event !== null && $event !== '' ? +$event : null)"/>
              </div>
            </div>

            <div class="fp-field">
              <label class="fp-label">{{ t().planningHistoryPlaceholder }}</label>
              <div class="fp-select-wrap">
                <select class="fp-input fp-select" *ngIf="wvm.filteredHistory().length"
                        (change)="wvm.loadHistory($any($event.target).value)">
                  <option value="">{{ t().planningHistoryPlaceholder }}</option>
                  <option *ngFor="let h of wvm.filteredHistory()" [value]="h.id"
                          [selected]="wvm.active()?.id === h.id">
                    #{{ h.id }} · {{ h.dateGeneration | date:'dd/MM/yy HH:mm' }}
                    · {{ h.makespanDays }}{{ t().planningKpiMakespanUnit }}
                    · {{ h.nombreCommandes }} cmd · {{ h.statut | uppercase }}
                  </option>
                </select>
              </div>
            </div>

          </div>

          <div class="filter-footer">
            <span class="filter-count">
              <strong>{{ wvm.filteredHistory().length }}</strong>
              / {{ wvm.history().length }} {{ t().workerKpiPlannings | lowercase }}
            </span>
            <button *ngIf="wvm.activeHistoryFilterCount()" class="btn-reset"
                    (click)="wvm.resetHistoryFilters()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
              </svg>
              {{ t().adminFilterReset }}
            </button>
          </div>
        </div>
      </div>

      <!--  Empty state  -->
      <div *ngIf="!wvm.history().length && !wvm.active() && !wvm.loading()" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
            <rect x="3" y="4" width="18" height="17" rx="2"/>
            <path d="M3 9h18M8 2v4M16 2v4M7 13h3M7 17h5"/>
          </svg>
        </div>
        <p class="empty-title">{{ t().workerPlanningEmpty }}</p>
        <span class="empty-hint">{{ t().workerPlanningEmptyHint }}</span>
      </div>

      <!--  Loading skeleton  -->
      <div *ngIf="wvm.loading()" class="loading-state">
        <div class="spinner-lg"></div>
        <p>{{ t().workerPlanningLoading }}</p>
      </div>

      <!--  GANTT SECTION  -->
      <ng-container *ngIf="!wvm.loading() && wvm.active()">

        <!-- Section header -->
        <div class="section-header">
          <div class="section-title-group">
            <span class="section-label">{{ t().workerGanttTitle }}</span>
            <span class="section-meta">#{{ wvm.active()!.id }} · {{ wvm.active()!.dateDebut }}</span>
          </div>
          <span class="section-count">
            {{ wvm.active()!.nombreLignes }} {{ t().planningTableLines }}
          </span>
        </div>

        <!--  Gantt filter bar  -->
        <div class="filter-bar">

          <div class="filter-group">
            <span class="filter-lbl">{{ t().planningFilterUrgence }}</span>
            <button class="fbtn" [class.fbtn-active]="wvm.filterUrgence() === 0"
                    (click)="wvm.filterUrgence.set(0)">{{ t().planningFilterAll }}</button>
            <button *ngFor="let u of [1,2,3,4,5]" class="fbtn"
                    [class.fbtn-active]="wvm.filterUrgence() === u"
                    [style.border-color]="wvm.filterUrgence() === u ? wvm.urgColor(u) : wvm.urgColor(u) + '55'"
                    [style.color]="wvm.filterUrgence() === u ? '#fff' : wvm.urgColor(u)"
                    [style.background]="wvm.filterUrgence() === u ? wvm.urgColor(u) : 'transparent'"
                    (click)="wvm.filterUrgence.set(u)">{{ u }}</button>
          </div>

          <div class="filter-group">
            <span class="filter-lbl">{{ t().planningFilterMachine }}</span>
            <div class="search-wrap">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input type="text" class="search-input"
                     [placeholder]="t().planningFilterMachinePlaceholder"
                     [value]="wvm.filterMachine()"
                     (input)="wvm.filterMachine.set($any($event.target).value)"/>
              <button *ngIf="wvm.filterMachine()" class="search-clear"
                      (click)="wvm.filterMachine.set('')">✕</button>
            </div>
          </div>

          <div class="filter-group">
            <span class="filter-lbl">{{ t().planningFilterCommande }}</span>
            <div class="search-wrap">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input type="text" class="search-input"
                     [placeholder]="t().planningFilterCommandePlaceholder"
                     [value]="wvm.filterCommande()"
                     (input)="wvm.filterCommande.set($any($event.target).value)"/>
              <button *ngIf="wvm.filterCommande()" class="search-clear"
                      (click)="wvm.filterCommande.set('')">✕</button>
            </div>
          </div>

          <div class="filter-group ml-auto">
            <span class="filter-lbl">{{ t().planningFilterZoom }}</span>
            <button class="zoom-btn" (click)="wvm.zoomOut()">−</button>
            <span class="zoom-val">{{ wvm.pxPerMin().toFixed(1) }}x</span>
            <button class="zoom-btn" (click)="wvm.zoomIn()">+</button>
          </div>

        </div>

        <!-- Active filter chips -->
        <div *ngIf="wvm.filterUrgence() || wvm.filterMachine() || wvm.filterCommande()" class="chip-row">
          <span *ngIf="wvm.filterUrgence()" class="chip chip-blue">
            {{ t().planningFilterUrgence }} {{ wvm.filterUrgence() }}
            <button (click)="wvm.filterUrgence.set(0)">✕</button>
          </span>
          <span *ngIf="wvm.filterMachine()" class="chip chip-violet">
            {{ t().planningFilterMachine }} {{ wvm.filterMachine() }}
            <button (click)="wvm.filterMachine.set('')">✕</button>
          </span>
          <span *ngIf="wvm.filterCommande()" class="chip chip-emerald">
            {{ t().planningFilterCommande }} {{ wvm.filterCommande() }}
            <button (click)="wvm.filterCommande.set('')">✕</button>
          </span>
          <span class="chip-count">{{ wvm.filteredRows().length }} {{ t().planningTableLines }}</span>
        </div>

        <!--  Gantt chart  -->
        <div class="gantt-wrapper">

          <!-- Two-level header -->
          <div class="gantt-header">
            <div class="gantt-corner">
              <div class="gantt-corner-day">{{ t().planningCornerDay }}</div>
              <div class="gantt-corner-hour">{{ t().planningCornerHour }}</div>
            </div>
            <div class="gantt-head-scroll" #headScroll>
              <div class="gantt-day-row" [style.width.px]="wvm.totalWidthPx()">
                <ng-container *ngFor="let d of wvm.days()">
                  <div class="gantt-day-tick"
                       [style.left.px]="d.visibleX"
                       [style.width.px]="wvm.dayWidthPx() - (d.visibleX - d.xPx)">
                    {{ d.label }}
                  </div>
                </ng-container>
              </div>
              <div class="gantt-hour-row" [style.width.px]="wvm.totalWidthPx()">
                <ng-container *ngFor="let tick of wvm.ticks()">
                  <div *ngIf="!tick.isMajor" class="gantt-hour-tick"
                       [style.left.px]="tick.xPx">{{ tick.label }}</div>
                  <div *ngIf="tick.isMajor" class="gantt-hour-sep"
                       [style.left.px]="tick.xPx"></div>
                </ng-container>
              </div>
            </div>
          </div>

          <!-- Body -->
          <div class="gantt-body">
            <div class="gantt-labels" #labelScroll>
              <div *ngFor="let m of wvm.visibleMachines()" class="gantt-label-row"
                   [class.gantt-label-highlight]="wvm.filterMachine() &&
                     m.name.toLowerCase().includes(wvm.filterMachine().toLowerCase())"
                   [style.height.px]="m.heightPx">
                <span class="gantt-label-name">{{ m.name }}</span>
                <span class="gantt-label-meta">{{ m.bars.length }} {{ t().planningOpLabel }}</span>
              </div>
            </div>
            <div class="gantt-canvas" #ganttScroll (scroll)="onScroll($event)">
              <div class="gantt-canvas-inner"
                   [style.width.px]="wvm.totalWidthPx()"
                   [style.height.px]="wvm.totalHeightPx()">
                <div *ngFor="let d of wvm.days()" class="grid-line-day"
                     [style.left.px]="d.xPx"></div>
                <ng-container *ngFor="let tick of wvm.ticks()">
                  <div *ngIf="!tick.isMajor" class="grid-line-hour"
                       [style.left.px]="tick.xPx"></div>
                </ng-container>
                <ng-container *ngFor="let m of wvm.visibleMachines(); let mi = index">
                  <div *ngFor="let bar of m.bars" class="gbar"
                       [class.gbar-dimmed]="wvm.isBarDimmed(bar)"
                       [class.gbar-selected]="wvm.selectedBar() === bar"
                       [style.background]="bar.color"
                       [style.left.px]="bar.xPx"
                       [style.width.px]="bar.wPx"
                       [style.top.px]="wvm.machineTopPx(mi) + bar.trackIdx * 36 + 5"
                       [style.z-index]="wvm.selectedBar() === bar ? 60 : 10"
                       (click)="wvm.selectBar(bar)">
                    <div class="gbar-accent" [style.background]="bar.urgenceColor"></div>
                    <div class="gbar-text">
                      <div class="gbar-cmd">{{ bar.row.numeroCommande }} · {{ bar.row.nomOperation }}</div>
                      <div class="bar-sub">{{ wvm.pmToTime(bar.row.startPM) }}→{{ wvm.pmToTime(bar.row.endPM) }}</div>
                    </div>
                  </div>
                </ng-container>
              </div>
            </div>
          </div>
        </div>

        <!--  Detail panel  -->
        <div *ngIf="wvm.selectedBar() as bar" class="detail-panel">
          <div class="detail-header">
            <div class="detail-color-bar" [style.background]="bar.color"></div>
            <div>
              <p class="detail-cmd">{{ bar.row.numeroCommande }}</p>
              <p class="detail-sub">{{ bar.row.nomOperation }} — {{ bar.row.machineName }}</p>
            </div>
            <button class="detail-close" (click)="wvm.selectedBar.set(null)">✕</button>
          </div>
          <div class="detail-grid">
            <div class="dp-item"><span>{{ t().planningDetailStart }}</span><strong>{{ bar.row.dateStart }} {{ wvm.pmToTime(bar.row.startPM) }}</strong></div>
            <div class="dp-item"><span>{{ t().planningDetailEnd }}</span><strong>{{ bar.row.dateEnd }} {{ wvm.pmToTime(bar.row.endPM) }}</strong></div>
            <div class="dp-item"><span>{{ t().planningDetailLoad }}</span><strong>{{ bar.row.tempsChargementMinutes }} min</strong></div>
            <div class="dp-item"><span>{{ t().planningDetailCycle }}</span><strong>{{ bar.row.dureeMinutes }} min</strong></div>
            <div class="dp-item"><span>{{ t().planningDetailUnload }}</span><strong>{{ bar.row.tempsDecharementMinutes }} min</strong></div>
            <div class="dp-item"><span>{{ t().planningDetailLot }}</span><strong>{{ bar.row.lotIdx + 1 }} / {{ bar.row.nbLots }}</strong></div>
            <div class="dp-item"><span>{{ t().planningDetailPieces }}</span><strong>{{ bar.row.lotSize }}</strong></div>
            <div class="dp-item"><span>{{ t().planningDetailUrgence }}</span><strong [style.color]="bar.urgenceColor">{{ bar.row.urgence }}</strong></div>
            <div class="dp-item">
              <span>{{ t().planningDetailExportDate }}</span>
              <strong>
                <span [class.export-late]="wvm.isLate(bar.row.endPM, bar.row.dateExport)">{{ bar.row.dateExport }}</span>
                <span *ngIf="wvm.isLate(bar.row.endPM, bar.row.dateExport)" class="late-chip" style="margin-left:6px">{{ t().planningLateChip }}</span>
              </strong>
            </div>
            <div class="dp-item"><span>{{ t().planningDetailQty }}</span><strong>{{ bar.row.quantite }}</strong></div>
          </div>
        </div>

        <!--  Operations table  -->
        <div class="table-section">
          <div class="section-header">
            <span class="section-label">{{ t().planningTableTitle }}</span>
            <span class="section-count">{{ wvm.filteredRows().length }} {{ t().planningTableLines }}</span>
          </div>
          <div class="table-wrap">
            <div class="table-scroll-x">
              <table class="ops-table">
                <thead>
                  <tr>
                    <th class="th-sort" (click)="wvm.toggleSort('machineName')">
                      {{ t().planningColMachine }} <span class="sort-arrow">{{ sortIcon('machineName') }}</span>
                    </th>
                    <th class="th-sort" (click)="wvm.toggleSort('numeroCommande')">
                      {{ t().planningColCommande }} <span class="sort-arrow">{{ sortIcon('numeroCommande') }}</span>
                    </th>
                    <th class="th-sort" (click)="wvm.toggleSort('nomOperation')">
                      {{ t().planningColOperation }} <span class="sort-arrow">{{ sortIcon('nomOperation') }}</span>
                    </th>
                    <th class="th-sort" (click)="wvm.toggleSort('startPM')">
                      {{ t().planningColStart }} <span class="sort-arrow">{{ sortIcon('startPM') }}</span>
                    </th>
                    <th class="th-sort" (click)="wvm.toggleSort('endPM')">
                      {{ t().planningColEnd }} <span class="sort-arrow">{{ sortIcon('endPM') }}</span>
                    </th>
                    <th>{{ t().planningColLoad }}</th>
                    <th class="th-sort" (click)="wvm.toggleSort('dureeMinutes')">
                      {{ t().planningColCycle }} <span class="sort-arrow">{{ sortIcon('dureeMinutes') }}</span>
                    </th>
                    <th>{{ t().planningColUnload }}</th>
                    <th class="th-sort" (click)="wvm.toggleSort('lotIdx')">
                      {{ t().planningColLot }} <span class="sort-arrow">{{ sortIcon('lotIdx') }}</span>
                    </th>
                    <th>{{ t().planningColPieces }}</th>
                    <th class="th-sort" (click)="wvm.toggleSort('urgence')">
                      {{ t().planningColUrgence }} <span class="sort-arrow">{{ sortIcon('urgence') }}</span>
                    </th>
                    <th>{{ t().planningColExport }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let r of wvm.filteredRows()"
                      [class.row-late]="wvm.isLate(r.endPM, r.dateExport)">
                    <td class="td-bold">{{ r.machineName }}</td>
                    <td>
                      <div class="cmd-cell">
                        <div class="cmd-dot"
                             [style.background]="wvm.cmdColor(r.numeroCommande)"
                             [style.border-left]="'3px solid ' + wvm.urgColor(r.urgence)"></div>
                        <span class="mono">{{ r.numeroCommande }}</span>
                      </div>
                    </td>
                    <td>{{ r.nomOperation }}</td>
                    <td class="mono">{{ r.dateStart }} {{ wvm.pmToTime(r.startPM) }}</td>
                    <td class="mono">{{ r.dateEnd }} {{ wvm.pmToTime(r.endPM) }}</td>
                    <td class="mono td-cyan">{{ r.tempsChargementMinutes }}m</td>
                    <td class="mono td-muted">{{ r.dureeMinutes }}m</td>
                    <td class="mono td-orange">{{ r.tempsDecharementMinutes }}m</td>
                    <td class="mono td-indigo">{{ r.lotIdx + 1 }}/{{ r.nbLots }}</td>
                    <td class="mono">{{ r.lotSize }}</td>
                    <td>
                      <span class="urgence-badge"
                            [style.background]="wvm.urgColor(r.urgence) + '22'"
                            [style.color]="wvm.urgColor(r.urgence)">{{ r.urgence }}</span>
                    </td>
                    <td>
                      <div class="export-cell">
                        <span class="export-date" [class.export-late]="wvm.isLate(r.endPM, r.dateExport)">
                          {{ r.dateExport }}
                        </span>
                        <span *ngIf="wvm.isLate(r.endPM, r.dateExport)" class="late-chip">{{ t().planningLateChip }}</span>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="!wvm.filteredRows().length">
                    <td colspan="12" class="table-empty">{{ t().planningTableEmpty }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </ng-container>
    </div>
  `,
  styles: [`

  /*  Host & page    */
  :host {
    display: block;
    font-family: 'Inter', system-ui, sans-serif;
    --chevron-url: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  }
  .page {
    padding: 1.5rem 2rem;
    max-width: 1600px;
    margin: 0 auto;
  }

  /*  Page header    */
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.75rem;
  }
  .page-title {
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--text);
    margin: 0;
    letter-spacing: -.02em;
  }
  .page-subtitle {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin: 0.25rem 0 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .badge-status {
    font-size: 0.65rem;
    font-weight: 700;
    padding: 0.2rem 0.5rem;
    border-radius: 99px;
    letter-spacing: .05em;
  }
  .status-ok   { background: #d1fae5; color: #065f46; }
  .status-warn { background: #fef3c7; color: #92400e; }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  /*  Buttons  */
  .btn-outline-green, .btn-outline-rose {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.42rem 0.95rem;
    border-radius: 9px;
    font-size: 0.84rem;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: background .12s;
    border: 1.5px solid;
  }
  .btn-icon { width: 14px; height: 14px; }
  .btn-outline-green {
    background: #f0fdf4; color: #15803d; border-color: #bbf7d0;
  }
  .btn-outline-green:hover   { background: #dcfce7; }
  .btn-outline-green:disabled { opacity: .5; cursor: not-allowed; }
  .btn-outline-rose {
    background: #fff1f2; color: #be123c; border-color: #fecdd3;
  }
  .btn-outline-rose:hover   { background: #ffe4e6; }
  .btn-outline-rose:disabled { opacity: .5; cursor: not-allowed; }

  .btn-reset {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.38rem 0.85rem;
    border-radius: 8px;
    font-size: 0.78rem;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    border: 1.5px solid var(--border, #e5e7eb);
    background: var(--surface, #fff);
    color: var(--text-muted);
    transition: all .12s;
  }
  .btn-reset svg { width: 12px; height: 12px; }
  .btn-reset:hover { border-color: #f87171; color: #dc2626; background: #fff1f2; }

  /*  Spinner  */
  .spinner {
    width: 13px; height: 13px;
    border: 2px solid rgba(0,0,0,.15);
    border-top-color: currentColor;
    border-radius: 50%;
    display: inline-block;
    animation: spin .7s linear infinite;
  }
  .spinner-lg {
    width: 36px; height: 36px;
    border: 3px solid var(--border, #e5e7eb);
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin .7s linear infinite;
  }

  /*  Loading / empty states  */
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 5rem 0;
    color: var(--text-muted);
    font-size: 0.9rem;
  }
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 5rem 0;
    text-align: center;
  }
  .empty-icon {
    width: 64px; height: 64px;
    border-radius: 50%;
    background: var(--surface, #fff);
    border: 1.5px solid var(--border, #e5e7eb);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
  }
  .empty-icon svg { width: 32px; height: 32px; }
  .empty-title { font-weight: 700; font-size: 1rem; color: var(--text); margin: 0; }
  .empty-hint  { font-size: 0.85rem; color: var(--text-muted); }

  /*  KPI grid  */
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
  .kpi-card {
    background: var(--surface, #fff);
    border: 1.5px solid var(--border, #e5e7eb);
    border-radius: 14px;
    padding: 1rem 1.1rem;
    display: flex;
    align-items: center;
    gap: 0.85rem;
    min-height: 84px;
    transition: box-shadow .18s, transform .15s;
  }
  .kpi-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,.09); transform: translateY(-1px); }
  .kpi-icon {
    width: 42px; height: 42px;
    border-radius: 11px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .kpi-icon svg { width: 18px; height: 18px; }
  .kpi-body { min-width: 0; }
  .kpi-label {
    font-size: 0.60rem; font-weight: 700;
    color: var(--text-muted); text-transform: uppercase;
    letter-spacing: .07em; white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis;
    margin: 0 0 2px;
  }
  .kpi-value {
    font-size: 1.55rem; font-weight: 800; line-height: 1.1; margin: 0;
    color: var(--text);
  }
  .kpi-value small { font-size: 0.8rem; font-weight: 400; color: var(--text-muted); margin-left: 1px; }
  .kpi-sub { font-size: 0.7rem; color: var(--text-muted); margin: 2px 0 0; }

  .kpi-blue    { background: #eff6ff; color: #1d4ed8; }
  .kpi-violet  { background: #f5f3ff; color: #7c3aed; }
  .kpi-emerald { background: #ecfdf5; color: #059669; }
  .kpi-amber   { background: #fffbeb; color: #d97706; }
  .kpi-cyan    { background: #ecfeff; color: #0891b2; }
  .kpi-red     { background: #fff1f2; color: #dc2626; }

  .kpi-blue-txt    { color: #1d4ed8; }
  .kpi-violet-txt  { color: #7c3aed; }
  .kpi-emerald-txt { color: #059669; }
  .kpi-amber-txt   { color: #d97706; }
  .kpi-cyan-txt    { color: #0891b2; }
  .kpi-ok-txt      { color: #16a34a; }
  .kpi-err-txt     { color: #dc2626; }

  /*  History filter panel  */
  .filter-panel {
    background: var(--surface, #fff);
    border: 1.5px solid var(--border, #e5e7eb);
    border-radius: 14px;
    margin-bottom: 1.25rem;
    overflow: hidden;
    box-shadow: 0 1px 6px rgba(0,0,0,.04);
  }
  .filter-panel-toggle {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.9rem 1.25rem;
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    text-align: left;
    transition: background .12s;
  }
  .filter-panel-toggle:hover { background: var(--surface-2, #f9fafb); }
  .filter-panel-title {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--text);
  }
  .fp-icon { width: 14px; height: 14px; color: #3b82f6; }
  .fp-chevron {
    width: 16px; height: 16px;
    color: var(--text-muted);
    transition: transform .2s;
  }
  .fp-chevron-open { transform: rotate(180deg); }
  .filter-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.2rem;
    height: 1.2rem;
    padding: 0 0.3rem;
    border-radius: 99px;
    font-size: 0.65rem;
    font-weight: 700;
    background: #2563eb;
    color: #fff;
  }
  .filter-panel-body {
    padding: 1rem 1.25rem 1.25rem;
    border-top: 1.5px solid var(--border, #e5e7eb);
  }
  .filter-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
  }
  .fp-field { display: flex; flex-direction: column; gap: 0.35rem; }
  .fp-label {
    font-size: 0.67rem; font-weight: 700;
    color: var(--text-muted); text-transform: uppercase;
    letter-spacing: .06em;
  }
  .fp-input {
    padding: 0.48rem 0.85rem;
    border: 1.5px solid var(--border, #e5e7eb);
    border-radius: 9px;
    background: var(--surface, #fff);
    color: var(--text);
    font-size: 0.84rem;
    font-family: inherit;
    outline: none;
    width: 100%;
    height: 38px;
    transition: border-color .12s, box-shadow .12s;
    box-sizing: border-box;
  }
  .fp-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1); }

  .fp-icon-wrap { position: relative; }
  .fp-field-icon {
    position: absolute; left: 0.7rem; top: 50%; transform: translateY(-50%);
    width: 14px; height: 14px; color: #94a3b8; pointer-events: none;
  }
  .fp-input-icon { padding-left: 2.1rem; }

  .fp-select-wrap { position: relative; }
  .fp-select {
    appearance: none;
    padding-right: 2rem;
    background-image: var(--chevron-url);
    background-repeat: no-repeat;
    background-position: right 0.6rem center;
    cursor: pointer;
  }

  .filter-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border, #f1f5f9);
  }
  .filter-count { font-size: 0.78rem; color: var(--text-muted); }
  .filter-count strong { color: var(--text); }

  /* ── Section header ────────────────────────────────────────────────────── */
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1.5px solid var(--border, #e5e7eb);
  }
  .section-title-group { display: flex; align-items: baseline; gap: 0.75rem; }
  .section-label {
    font-size: 0.72rem; font-weight: 800;
    color: var(--text-muted); text-transform: uppercase; letter-spacing: .08em;
  }
  .section-meta { font-size: 0.78rem; color: var(--text-muted); }
  .section-count { font-size: 0.72rem; color: var(--text-muted); }

  /*  Gantt filter bar  */
  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.75rem;
  }
  .filter-group { display: flex; align-items: center; gap: 0.4rem; }
  .ml-auto { margin-left: auto; }
  .filter-lbl {
    font-size: 0.7rem; font-weight: 700;
    color: var(--text-muted); text-transform: uppercase;
    letter-spacing: .06em; white-space: nowrap;
  }
  .fbtn {
    padding: 0.3rem 0.7rem;
    font-size: 0.78rem; font-weight: 600;
    border-radius: 7px;
    border: 1.5px solid var(--border, #e5e7eb);
    background: var(--surface, #fff);
    color: var(--text-muted);
    cursor: pointer;
    transition: all .12s; line-height: 1;
    font-family: inherit;
  }
  .fbtn:hover:not(.fbtn-active) { border-color: #94a3b8; color: var(--text); }
  .fbtn-active {
    background: #1e40af; color: #fff;
    border-color: #1e40af;
    box-shadow: 0 2px 8px rgba(30,64,175,.3);
  }

  .search-wrap { position: relative; display: flex; align-items: center; }
  .search-icon {
    position: absolute; left: 0.6rem;
    width: 12px; height: 12px;
    color: #94a3b8; pointer-events: none;
  }
  .search-input {
    padding: 0.35rem 1.7rem 0.35rem 1.7rem;
    border: 1.5px solid var(--border, #e5e7eb);
    border-radius: 8px;
    background: var(--surface, #fff);
    color: var(--text);
    font-size: 0.82rem; font-family: inherit;
    outline: none; width: 160px; height: 32px;
    transition: border-color .12s, box-shadow .12s;
  }
  .search-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1); }
  .search-clear {
    position: absolute; right: 0.5rem;
    background: none; border: none; cursor: pointer;
    font-size: 10px; color: #94a3b8; line-height: 1;
  }
  .search-clear:hover { color: #ef4444; }

  .zoom-btn {
    width: 28px; height: 28px;
    border-radius: 7px;
    border: 1.5px solid var(--border, #e5e7eb);
    background: var(--surface, #fff);
    cursor: pointer; font-size: 15px;
    display: flex; align-items: center; justify-content: center;
    color: var(--text); transition: all .12s;
  }
  .zoom-btn:hover { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }
  .zoom-val {
    font-size: 0.72rem; font-family: monospace;
    color: var(--text-muted); min-width: 2rem; text-align: center;
  }

  /*  Active filter chips  */
  .chip-row {
    display: flex; flex-wrap: wrap; align-items: center;
    gap: 0.5rem; margin-bottom: 0.75rem;
  }
  .chip {
    display: inline-flex; align-items: center; gap: 0.35rem;
    padding: 0.25rem 0.65rem; border-radius: 99px;
    font-size: 0.72rem; font-weight: 600; border: 1px solid;
  }
  .chip button { background: none; border: none; cursor: pointer; line-height: 1; color: inherit; }
  .chip button:hover { color: #ef4444; }
  .chip-blue   { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
  .chip-violet { background: #f5f3ff; color: #6d28d9; border-color: #ddd6fe; }
  .chip-count  { font-size: 0.72rem; color: var(--text-muted); margin-left: auto; }

  /*  Gantt wrapper   */
  .gantt-wrapper {
    background: var(--surface, #fff);
    border: 1.5px solid var(--border, #e5e7eb);
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0,0,0,.06);
    margin-bottom: 1.25rem;
  }
  .gantt-header {
    display: flex;
    border-bottom: 2px solid #cbd5e1;
    background: #f8fafc;
  }
  .gantt-corner {
    width: 190px; min-width: 190px;
    border-right: 2px solid #cbd5e1;
    display: flex; flex-direction: column;
  }
  .gantt-corner-day {
    flex: 1; display: flex; align-items: center;
    padding: 0 14px; height: 32px;
    font-size: 9.5px; font-weight: 800;
    color: #64748b; text-transform: uppercase; letter-spacing: .08em;
    border-bottom: 1px solid #e2e8f0;
  }
  .gantt-corner-hour {
    height: 24px; display: flex; align-items: center;
    padding: 0 14px;
    font-size: 9px; font-weight: 700;
    color: #94a3b8; text-transform: uppercase; letter-spacing: .06em;
  }
  .gantt-head-scroll {
    flex: 1; overflow: hidden;
    display: flex; flex-direction: column;
  }
  .gantt-day-row { position: relative; height: 32px; border-bottom: 1px solid #e2e8f0; }
  .gantt-day-tick {
    position: absolute; top: 0; height: 100%;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 800; color: #1e293b;
    border-right: 2px solid #cbd5e1; background: #f8fafc;
    white-space: nowrap; overflow: hidden; letter-spacing: -.01em;
  }
  .gantt-hour-row { position: relative; height: 24px; background: #f1f5f9; }
  .gantt-hour-tick {
    position: absolute; top: 0; height: 100%;
    display: flex; align-items: center; justify-content: center;
    font-size: 9px; font-weight: 600; color: #64748b;
    font-family: monospace; white-space: nowrap;
    pointer-events: none; transform: translateX(-50%);
  }
  .gantt-hour-sep {
    position: absolute; top: 0; bottom: 0;
    width: 1px; background: #cbd5e1; opacity: .7; pointer-events: none;
  }
  .gantt-body { display: flex; max-height: 520px; }
  .gantt-labels {
    width: 190px; min-width: 190px;
    overflow: hidden; border-right: 2px solid #e2e8f0;
  }
  .gantt-label-row {
    display: flex; flex-direction: column; justify-content: center;
    padding: 0 14px; border-bottom: 1px solid #f1f5f9; transition: background .1s;
  }
  .gantt-label-highlight { background: #eff6ff !important; }
  .gantt-label-name {
    font-size: 11px; font-weight: 700;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    color: var(--text, #1e293b); line-height: 1.3;
  }
  .gantt-label-meta { font-size: 9.5px; color: var(--text-muted, #94a3b8); margin-top: 2px; }
  .gantt-canvas { flex: 1; overflow: auto; }
  .gantt-canvas-inner { position: relative; }

  .grid-line-day {
    position: absolute; top: 0; bottom: 0;
    width: 1.5px; background: #94a3b8; opacity: .4; pointer-events: none;
  }
  .grid-line-hour {
    position: absolute; top: 0; bottom: 0;
    width: 1px; background: #cbd5e1; opacity: .5; pointer-events: none;
  }

  /* ── Bars ──────────────────────────────────────────────────────────────── */
  .gbar {
    position: absolute;
    border-radius: 5px; cursor: pointer; overflow: hidden;
    box-shadow: 0 2px 6px rgba(0,0,0,.18);
    transition: filter .1s, box-shadow .1s;
    height: 32px; display: flex; flex-direction: column; justify-content: center;
  }
  .gbar:hover { filter: brightness(1.12); box-shadow: 0 4px 14px rgba(0,0,0,.28); z-index: 50 !important; }
  .gbar-dimmed   { opacity: 0.07 !important; pointer-events: none !important; }
  .gbar-selected { outline: 2px solid #fff; outline-offset: 1px; }
  .gbar-accent   { position: absolute; left: 0; top: 0; bottom: 0; width: 3px; border-radius: 4px 0 0 4px; }
  .gbar-text     { padding-left: 0.4rem; padding-right: 0.25rem; overflow: hidden; }
  .gbar-cmd      { font-size: 9px; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3; }
  .gbar-op       { font-size: 8px; color: rgba(255,255,255,.8); font-family: monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .bar-sub       { font-size: 8px; color: rgba(255,255,255,.82); font-family: monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: .02em; }

  /*  Late-order chip */
  .late-chip {
    display: inline-flex; align-items: center;
    background: #fef3c7; color: #92400e; border: 1px solid #fde68a;
    border-radius: 20px; font-size: 9px; font-weight: 700;
    padding: 2px 8px; white-space: nowrap; letter-spacing: .02em;
  }

  /* Export date cell */
  .export-cell  { display: flex; flex-direction: column; gap: 3px; }
  .export-date  { font-family: monospace; font-size: 11px; color: #94a3b8; }
  .export-late  { color: #92400e !important; font-weight: 600; }

  /* Late table row: very subtle amber tint */
  .row-late td  { background: #fffdf0 !important; }

  /*  Detail panel  */
  .detail-panel {
    background: var(--surface, #fff);
    border: 1.5px solid var(--border, #e5e7eb);
    border-radius: 14px; padding: 1rem; margin-bottom: 1rem;
    animation: slideUp .18s ease;
  }
  .detail-header {
    display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;
  }
  .detail-color-bar { width: 5px; height: 36px; border-radius: 3px; flex-shrink: 0; }
  .detail-cmd  { font-size: 1rem; font-weight: 800; font-family: monospace; color: var(--text); margin: 0; }
  .detail-sub  { font-size: 0.82rem; color: var(--text-muted); margin: 0.2rem 0 0; }
  .detail-close {
    margin-left: auto; background: none; border: none; cursor: pointer;
    font-size: 1.1rem; color: var(--text-muted); line-height: 1; transition: color .1s;
  }
  .detail-close:hover { color: var(--text); }
  .detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
    gap: 0.6rem;
  }
  .dp-item {
    background: var(--surface-2, #f9fafb);
    border-radius: 10px; padding: 0.55rem 0.8rem;
    border: 1px solid var(--border, #f1f5f9);
  }
  .dp-item span {
    font-size: 0.65rem; font-weight: 700; color: var(--text-muted);
    text-transform: uppercase; letter-spacing: .06em; display: block;
  }
  .dp-item strong {
    font-size: 0.88rem; color: var(--text);
    display: block; margin-top: 3px; font-weight: 700;
  }

  /*  Operations table  */
  .table-section { margin-top: 1.5rem; }
  .table-wrap {
    background: var(--surface, #fff);
    border: 1.5px solid var(--border, #e5e7eb);
    border-radius: 14px;
    overflow: hidden;
  }
  .table-scroll-x { overflow-x: auto; }
  .ops-table {
    width: 100%; border-collapse: collapse;
    font-size: 11.5px; min-width: 820px;
  }
  .ops-table thead tr {
    background: var(--surface-2, #f9fafb);
    border-bottom: 2px solid var(--border, #e5e7eb);
  }
  .ops-table th {
    padding: 10px 12px; text-align: left;
    font-size: 10px; font-weight: 800; color: #64748b;
    text-transform: uppercase; letter-spacing: .06em; white-space: nowrap;
    background: var(--surface-2, #f9fafb);
  }
  .th-sort { cursor: pointer; user-select: none; }
  .th-sort:hover { color: #3b82f6; }
  .sort-arrow { display: inline-block; margin-left: 3px; opacity: .45; font-size: 10px; }
  .ops-table tbody tr {
    border-bottom: 1px solid var(--border, #f1f5f9);
    transition: background .1s;
  }
  .ops-table tbody tr:last-child { border-bottom: none; }
  .ops-table tbody tr:hover { background: var(--surface-2, #f9fafb); }
  .ops-table td {
    padding: 9px 12px; color: var(--text); vertical-align: middle;
  }
  .td-bold   { font-weight: 700; }
  .td-muted  { color: #94a3b8; }
  .td-cyan   { color: #0891b2; }
  .td-orange { color: #ea580c; }
  .td-indigo { color: #6366f1; font-weight: 700; }
  .mono { font-family: monospace; }
  .cmd-cell { display: flex; align-items: center; gap: 0.4rem; }
  .cmd-dot  { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
  .urgence-badge {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 1.5rem; height: 1.5rem; padding: 0 0.35rem;
    border-radius: 99px; font-size: 0.78rem; font-weight: 700;
  }
  .table-empty {
    padding: 3rem 0; text-align: center;
    color: var(--text-muted); font-size: 0.9rem;
  }

  /*  Toast  */
  .toast {
    position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 50;
    display: flex; align-items: center; gap: 0.6rem;
    padding: 0.8rem 1.1rem; border-radius: 12px;
    font-size: 0.85rem; font-weight: 600; color: #fff;
    box-shadow: 0 8px 24px rgba(0,0,0,.18); max-width: 22rem;
    animation: toastIn .3s cubic-bezier(.34,1.4,.64,1);
  }
  .toast-success { background: #16a34a; color: #fff; }
  .toast-error   { background: #dc2626; color: #fff; }
  .toast-icon    { width: 16px; height: 16px; flex-shrink: 0; }

  /*  Animations  */
  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes toastIn { from { transform: translateY(12px) scale(.95); opacity: 0; } to { transform: none; opacity: 1; } }
  @keyframes slideUp { from { transform: translateY(8px); opacity: 0; } to { transform: none; opacity: 1; } }
  `]
})
export class WorkerPlanningComponent implements OnInit {
  readonly wvm = inject(WorkerPlanningViewModel);
  readonly t   = inject(LanguageService).t;

  historyFiltersOpen = signal(true);

  @ViewChild('ganttScroll') ganttScrollEl!: ElementRef<HTMLDivElement>;
  @ViewChild('headScroll')  headScrollEl!:  ElementRef<HTMLDivElement>;
  @ViewChild('labelScroll') labelScrollEl!: ElementRef<HTMLDivElement>;

  ngOnInit(): void { this.wvm.loadInitial(); }

  onScroll(e: Event): void {
    const sc = e.target as HTMLDivElement;
    if (this.headScrollEl?.nativeElement)
      this.headScrollEl.nativeElement.scrollLeft = sc.scrollLeft;
    if (this.labelScrollEl?.nativeElement)
      this.labelScrollEl.nativeElement.scrollTop = sc.scrollTop;
  }

  sortIcon(field: string): string {
    if (this.wvm.sortField() !== field) return '↕';
    return this.wvm.sortAsc() ? '↑' : '↓';
  }
}
