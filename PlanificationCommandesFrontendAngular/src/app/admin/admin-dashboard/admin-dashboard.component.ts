import {
  Component, OnInit, AfterViewInit, OnDestroy,
  inject, ElementRef, ViewChild, ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { AdminDashboardViewModel } from './admin-dashboard.viewmodel';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [AdminDashboardViewModel],
  template: `
    <div class="dashboard">

      <!-- ── Welcome banner  -->
      <div class="welcome-banner">
        <div class="welcome-left">
          <div>
            <p class="welcome-greeting">{{ vm.greeting() }},</p>
            <h2 class="welcome-name">{{ vm.userName() }}</h2>
          </div>
        </div>
        <p class="welcome-hint">{{ vm.t().dashboardWelcomeHint }}</p>
      </div>

      <!-- ── Header  -->
      <div class="dash-header">
        <div>
          <h1 class="dash-title">{{ vm.t().dashboardTitle }}</h1>
          <p class="dash-subtitle">{{ vm.t().dashboardSubtitle }}</p>
        </div>
        <div class="header-right">
          <div class="dash-date">{{ vm.today() }}</div>
          <button class="refresh-btn" (click)="reload()" [title]="vm.t().dashboardRefresh">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- ── Error  -->
      <div class="dash-error" *ngIf="vm.error()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ vm.error() }}
      </div>

      <!-- ── KPI Skeleton  -->
      <div class="kpi-grid" *ngIf="vm.loading()">
        <div class="kpi-card skeleton" *ngFor="let i of [1,2,3,4,5,6]"></div>
      </div>

      <!-- ── KPI Cards  -->
      <div class="kpi-grid" *ngIf="!vm.loading()">

        <!-- 1 · Commandes -->
        <div class="kpi-card">
          <div class="kpi-icon kpi-blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-value">{{ vm.stats().totalCommandes }}</span>
            <span class="kpi-label">{{ vm.t().kpiLabelCommandes }}</span>
            <div class="kpi-pills">
              <span class="pill pill-orange">{{ vm.stats().commandesEnAttente }} {{ vm.t().kpiAttente }}</span>
              <span class="pill pill-green">{{ vm.stats().commandesTerminees }} {{ vm.t().kpiTerminees }}</span>
            </div>
          </div>
          <div class="kpi-trend" [class.trend-bad]="vm.stats().commandesEnRetard > 0">
            <svg *ngIf="vm.stats().commandesEnRetard > 0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span *ngIf="vm.stats().commandesEnRetard > 0" class="trend-label red">{{ vm.stats().commandesEnRetard }} {{ vm.t().kpiEnRetard }}</span>
            <span *ngIf="vm.stats().commandesEnRetard === 0" class="trend-label green">✓ {{ vm.t().kpiAucunRetard }}</span>
          </div>
        </div>

        <!-- 2 · Urgences prioritaires -->
        <div class="kpi-card" [class.kpi-alert]="vm.stats().commandesUrgentes > 0">
          <div class="kpi-icon kpi-red">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-value" [class.text-red]="vm.stats().commandesUrgentes > 0">{{ vm.stats().commandesUrgentes }}</span>
            <span class="kpi-label">{{ vm.t().kpiLabelUrgences }}</span>
            <div class="kpi-pills">
              <span class="pill pill-blue">{{ vm.stats().tauxAchevement }}% {{ vm.t().kpiAchevement }}</span>
            </div>
          </div>
        </div>

        <!-- 3 · Machines -->
        <div class="kpi-card">
          <div class="kpi-icon kpi-teal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
            </svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-value">{{ vm.stats().machinesFonctionnelles }}<span class="kpi-denom">/{{ vm.stats().totalMachines }}</span></span>
            <span class="kpi-label">{{ vm.t().kpiLabelMachines }}</span>
            <div class="kpi-progress-bar">
              <div class="kpi-progress-fill" [style.width.%]="vm.stats().tauxChargeMachines"
                   [class.fill-good]="vm.stats().tauxChargeMachines >= 70"
                   [class.fill-warn]="vm.stats().tauxChargeMachines >= 40 && vm.stats().tauxChargeMachines < 70"
                   [class.fill-bad]="vm.stats().tauxChargeMachines < 40">
              </div>
            </div>
            <span class="kpi-sub" [class.green]="vm.stats().tauxChargeMachines >= 70" [class.red]="vm.stats().tauxChargeMachines < 40">
              {{ vm.stats().tauxChargeMachines }}% {{ vm.t().kpiOperationnelles }}
            </span>
          </div>
        </div>

        <!-- 4 · Plannings -->
        <div class="kpi-card">
          <div class="kpi-icon kpi-purple">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>
            </svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-value">{{ vm.stats().totalPlannings }}</span>
            <span class="kpi-label">{{ vm.t().kpiLabelPlannings }}</span>
            <div class="kpi-pills">
              <span class="pill pill-purple">{{ vm.formatMakespan() }} {{ vm.t().dashboardMakespanAvg }}</span>
            </div>
          </div>
        </div>

        <!-- 5 · Recettes -->
        <div class="kpi-card">
          <div class="kpi-icon kpi-orange">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-value">{{ vm.stats().totalRecettes }}</span>
            <span class="kpi-label">{{ vm.t().kpiLabelRecettes }}</span>
            <div class="kpi-pills">
              <span class="pill pill-blue">{{ vm.stats().totalOperations }} {{ vm.t().kpiOperations }}</span>
              <span class="pill pill-gray">{{ vm.stats().avgOpsPerRecette }} {{ vm.t().kpiOpsParRecette }}</span>
            </div>
          </div>
        </div>

        <!-- 6 · Utilisateurs -->
        <div class="kpi-card">
          <div class="kpi-icon kpi-indigo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-value">{{ vm.stats().totalUtilisateurs }}</span>
            <span class="kpi-label">{{ vm.t().kpiLabelUsers }}</span>
            <div class="kpi-pills">
              <span class="pill pill-indigo">{{ vm.stats().totalAdmins }} {{ vm.t().kpiAdmin }}</span>
              <span class="pill pill-teal">{{ vm.stats().totalPlanners }} {{ vm.t().kpiPlanif }}</span>
              <span class="pill pill-gray">{{ vm.stats().totalWorkers }} {{ vm.t().kpiOperat }}</span>
            </div>
          </div>
        </div>

      </div>

      <!-- ── Charts ─────────────────────────────────────────────────────── -->
      <div class="charts-grid" *ngIf="!vm.loading()">

        <!-- Row 1 -->
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">{{ vm.t().chartCommandesStatut }}</h3>
            <span class="chart-badge">{{ vm.stats().totalCommandes }} {{ vm.t().kpiTotal }}</span>
          </div>
          <div class="chart-body"><canvas #statutChart></canvas></div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">{{ vm.t().chartRepartitionUsers }}</h3>
            <span class="chart-badge">{{ vm.stats().totalUtilisateurs }} {{ vm.t().kpiUtilisateurs }}</span>
          </div>
          <div class="chart-body"><canvas #usersChart></canvas></div>
        </div>

        <!-- Row 2: Planning trend (wide) -->
        <div class="chart-card chart-wide">
          <div class="chart-header">
            <h3 class="chart-title">{{ vm.t().chartEvolutionPlannings }}</h3>
            <div class="chart-controls">
              <button class="ctrl-btn" [class.active]="vm.planningFilter() === 5"  (click)="onPlanningFilter(5)">{{ vm.t().filter5Last }}</button>
              <button class="ctrl-btn" [class.active]="vm.planningFilter() === 10" (click)="onPlanningFilter(10)">{{ vm.t().filter10Last }}</button>
              <button class="ctrl-btn" [class.active]="vm.planningFilter() === 0"  (click)="onPlanningFilter(0)">{{ vm.t().filterAll }}</button>
            </div>
          </div>
          <div class="chart-body chart-body-wide"><canvas #planningChart></canvas></div>
        </div>

        <!-- Row 3: Machines + Urgences -->
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">{{ vm.t().chartEtatMachines }}</h3>
            <div class="chart-controls">
              <button class="ctrl-btn" [class.active]="vm.machineView() === 'all'"         (click)="onMachineView('all')">{{ vm.t().filterAll }}</button>
              <button class="ctrl-btn" [class.active]="vm.machineView() === 'fonctionnel'" (click)="onMachineView('fonctionnel')">{{ vm.t().filterFonctionnel }}</button>
              <button class="ctrl-btn" [class.active]="vm.machineView() === 'non'"         (click)="onMachineView('non')">{{ vm.t().filterNonFonctionnel }}</button>
            </div>
          </div>
          <div class="chart-body"><canvas #machineChart></canvas></div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">{{ vm.t().chartDistributionUrgences }}</h3>
            <span class="chart-badge badge-red" *ngIf="vm.stats().commandesUrgentes > 0">{{ vm.stats().commandesUrgentes }} {{ vm.t().kpiPrioriteMax }}</span>
          </div>
          <div class="chart-body"><canvas #urgenceChart></canvas></div>
        </div>

        <!-- Row 4: Top recettes + ops index -->
        <div class="chart-card chart-wide">
          <div class="chart-header">
            <h3 class="chart-title">{{ vm.t().chartTopRecettes }}</h3>
            <div class="chart-controls">
              <button class="ctrl-btn" [class.active]="vm.topRecCount() === 5"  (click)="onTopRec(5)">{{ vm.t().filterTop5 }}</button>
              <button class="ctrl-btn" [class.active]="vm.topRecCount() === 10" (click)="onTopRec(10)">{{ vm.t().filterTop10 }}</button>
            </div>
          </div>
          <div class="chart-body chart-body-rec"><canvas #recetteChart></canvas></div>

          <div class="ops-index" *ngIf="vm.recetteOpsIndex().length > 0">
            <p class="ops-index-title">{{ vm.t().opsIndexTitle }}</p>
            <div class="ops-index-grid">
              <div class="ops-recette-block" *ngFor="let r of vm.recetteOpsIndex()">
                <div class="ops-recette-header">
                  <span class="ops-recette-name">{{ r.nom }}</span>
                  <span class="ops-count-badge">{{ r.ops.length }} op{{ r.ops.length > 1 ? 's' : '' }}</span>
                </div>
                <ol class="ops-list">
                  <li class="ops-item" *ngFor="let op of r.ops; let i = index">
                    <span class="op-index">{{ i + 1 }}</span>
                    <span class="op-name">{{ op.nomOperation }}</span>
                    <span class="op-meta">{{ op.dureeMinutes }} min</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- ── Deadline-Compliance Report ──────────────────────────────────── -->
      <div class="compliance-section" *ngIf="!vm.loading()">

        <div class="compliance-header">
          <div class="compliance-title-group">
            <div class="compliance-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
                <polyline points="9 16 11 18 15 14"/>
              </svg>
            </div>
            <div>
              <h3 class="compliance-title">{{ vm.t().complianceSectionTitle }}</h3>
              <p class="compliance-subtitle">{{ vm.t().complianceSectionSubtitle }}</p>
            </div>
          </div>

          <div class="compliance-filters">
            <div class="compliance-date-group">
              <label class="compliance-date-label">{{ vm.t().complianceDateFrom }}</label>
              <input type="date" class="compliance-date-input"
                [ngModel]="vm.complianceDateFrom()"
                (ngModelChange)="vm.complianceDateFrom.set($event)">
            </div>
            <div class="compliance-date-group">
              <label class="compliance-date-label">{{ vm.t().complianceDateTo }}</label>
              <input type="date" class="compliance-date-input"
                [ngModel]="vm.complianceDateTo()"
                (ngModelChange)="vm.complianceDateTo.set($event)">
            </div>
            <button class="compliance-run-btn"
              (click)="loadComplianceReport()"
              [disabled]="vm.complianceLoading()">
              <svg *ngIf="!vm.complianceLoading()" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <svg *ngIf="vm.complianceLoading()" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              {{ vm.complianceLoading() ? vm.t().complianceRunningBtn : vm.t().complianceRunBtn }}
            </button>
          </div>
        </div>

        <div class="compliance-error" *ngIf="vm.complianceError()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ vm.complianceError() }}
        </div>

        <ng-container *ngIf="vm.complianceReport() as report">

          <div class="compliance-kpi-strip">

            <div class="compliance-kpi compliance-kpi-rate"
                 [class.rate-great]="report.complianceRate >= 80"
                 [class.rate-warn]="report.complianceRate >= 50 && report.complianceRate < 80"
                 [class.rate-bad]="report.complianceRate < 50">
              <span class="ckpi-value">{{ report.complianceRate | number:'1.0-1' }}%</span>
              <span class="ckpi-label">{{ vm.t().complianceKpiRate }}</span>
              <div class="ckpi-bar-track">
                <div class="ckpi-bar-fill rate-fill" [style.width.%]="report.complianceRate"></div>
              </div>
            </div>

            <div class="compliance-kpi compliance-kpi-ontime">
              <div class="ckpi-icon-wrap ckpi-green">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <span class="ckpi-value">{{ report.onTime }}</span>
              <span class="ckpi-label">{{ vm.t().complianceKpiOnTime }}</span>
            </div>

            <div class="compliance-kpi compliance-kpi-late">
              <div class="ckpi-icon-wrap ckpi-red">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <span class="ckpi-value">{{ report.late }}</span>
              <span class="ckpi-label">{{ vm.t().complianceKpiLate }}</span>
            </div>

            <div class="compliance-kpi compliance-kpi-pending">
              <div class="ckpi-icon-wrap ckpi-orange">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <span class="ckpi-value">{{ report.pending }}</span>
              <span class="ckpi-label">{{ vm.t().complianceKpiPending }}</span>
            </div>

            <div class="compliance-kpi compliance-kpi-variance"
                 [class.var-positive]="report.averageDaysVariance > 0"
                 [class.var-negative]="report.averageDaysVariance < 0">
              <span class="ckpi-value">
                {{ report.averageDaysVariance > 0 ? '+' : '' }}{{ report.averageDaysVariance | number:'1.0-1' }}j
              </span>
              <span class="ckpi-label">{{ vm.t().complianceKpiVariance }}</span>
              <span class="ckpi-variance-hint">
                {{ report.averageDaysVariance <= 0 ? vm.t().complianceVarianceAhead : vm.t().complianceVarianceBehind }}
              </span>
            </div>

          </div>

          <div class="compliance-body">

            <div class="compliance-chart-wrap chart-card">
              <div class="chart-header">
                <h3 class="chart-title">{{ vm.t().complianceChartTitle }}</h3>
                <span class="chart-badge">{{ report.totalCommandes }} {{ vm.t().complianceChartBadge }}</span>
              </div>
              <div class="chart-body"><canvas #complianceChart></canvas></div>
            </div>

            <div class="compliance-table-wrap chart-card">
              <div class="chart-header">
                <h3 class="chart-title">{{ vm.t().complianceTableTitle }}</h3>
                <div class="compliance-row-filters">
                  <button class="notif-pill" [class.notif-pill-active]="vm.complianceRowFilter() === 'all'"
                    (click)="vm.setComplianceRowFilter('all')">
                    {{ vm.t().complianceFilterAll }} <span class="notif-pill-count">{{ report.rows.length }}</span>
                  </button>
                  <button class="notif-pill notif-pill-inactive" [class.notif-pill-active]="vm.complianceRowFilter() === 'OnTime'"
                    (click)="vm.setComplianceRowFilter('OnTime')">
                    {{ vm.t().complianceFilterOnTime }} <span class="notif-pill-count">{{ report.onTime }}</span>
                  </button>
                  <button class="notif-pill notif-pill-critical" [class.notif-pill-active]="vm.complianceRowFilter() === 'Late'"
                    (click)="vm.setComplianceRowFilter('Late')">
                    {{ vm.t().complianceFilterLate }} <span class="notif-pill-count">{{ report.late }}</span>
                  </button>
                  <button class="notif-pill notif-pill-warning" [class.notif-pill-active]="vm.complianceRowFilter() === 'Pending'"
                    (click)="vm.setComplianceRowFilter('Pending')">
                    {{ vm.t().complianceFilterPending }} <span class="notif-pill-count">{{ report.pending }}</span>
                  </button>
                </div>
              </div>

              <div class="compliance-table-scroll">
                <table class="compliance-table">
                  <thead>
                    <tr>
                      <th>{{ vm.t().complianceColCommande }}</th>
                      <th>{{ vm.t().complianceColRecette }}</th>
                      <th>{{ vm.t().complianceColDateExport }}</th>
                      <th>{{ vm.t().complianceColVariance }}</th>
                      <th>{{ vm.t().complianceColStatut }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let row of vm.filteredComplianceRows()"
                        [class.row-late]="row.status === 'Late'"
                        [class.row-ontime]="row.status === 'OnTime'"
                        [class.row-pending]="row.status === 'Pending'">
                      <td>
                        <span class="row-num">{{ row.numeroCommande }}</span>
                        <span class="row-qty">× {{ row.quantite }}</span>
                      </td>
                      <td class="row-recette">{{ row.nomRecette || '—' }}</td>
                      <td class="row-date">{{ row.dateExport | date:'dd/MM/yyyy' }}</td>
                      <td class="row-variance">
                        <ng-container *ngIf="row.daysVariance !== null && row.daysVariance !== undefined; else noVariance">
                          <span [class.var-late]="row.daysVariance > 0" [class.var-early]="row.daysVariance <= 0">
                            {{ row.daysVariance > 0 ? '+' : '' }}{{ row.daysVariance | number:'1.0-1' }}j
                          </span>
                        </ng-container>
                        <ng-template #noVariance>—</ng-template>
                      </td>
                      <td>
                        <span class="compliance-badge"
                          [class.badge-ontime]="row.status === 'OnTime'"
                          [class.badge-late]="row.status === 'Late'"
                          [class.badge-pending]="row.status === 'Pending'">
                          {{ row.status === 'OnTime' ? vm.t().complianceBadgeOnTime : row.status === 'Late' ? vm.t().complianceBadgeLate : vm.t().complianceBadgePending }}
                        </span>
                      </td>
                    </tr>
                    <tr *ngIf="vm.filteredComplianceRows().length === 0">
                      <td colspan="5" class="table-empty">{{ vm.t().complianceRowEmpty }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </ng-container>

        <div class="compliance-empty" *ngIf="!vm.complianceReport() && !vm.complianceLoading() && !vm.complianceError()">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <p [innerHTML]="vm.t().complianceEmptyHint"></p>
        </div>

      </div>
      <!-- ── /Deadline-Compliance Report ─────────────────────────────────── -->

    </div>
  `,
  styles: [`
    :host { display: contents; }

    .dashboard {
      padding: 1.75rem 2rem;
      max-width: 1400px;
      font-family: 'Segoe UI', system-ui, sans-serif;
    }

    /* ── Header ───────────────────────────────────────────────────────── */
    .dash-header {
      display: flex; align-items: flex-end; justify-content: space-between;
      margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem;
    }
    .dash-title { font-size: 1.55rem; font-weight: 800; color: var(--text, #1a202c); margin: 0 0 0.2rem; }
    .dash-subtitle { font-size: 0.83rem; color: var(--text-muted, #64748b); margin: 0; }
    .header-right { display: flex; align-items: center; gap: 0.6rem; }
    .dash-date {
      font-size: 0.82rem; color: var(--text-muted, #64748b);
      background: var(--bg-card, #f1f5f9); padding: 0.35rem 0.75rem;
      border-radius: 8px; font-weight: 500;
    }
    .refresh-btn {
      display: flex; align-items: center; justify-content: center;
      width: 34px; height: 34px; border-radius: 8px; border: 1.5px solid var(--border, #e2e8f0);
      background: var(--bg-card, #fff); color: var(--text-muted, #64748b);
      cursor: pointer; transition: all .2s;
    }
    .refresh-btn:hover { background: var(--border, #e2e8f0); color: var(--text, #1a202c); }

    /* ── KPI Grid ─────────────────────────────────────────────────────── */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1.25rem;
    }
    @media (max-width: 1100px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 680px)  { .kpi-grid { grid-template-columns: 1fr; } }

    .kpi-card {
      background: var(--bg-card, #fff);
      border: 1.5px solid var(--border, #e2e8f0);
      border-radius: 14px;
      padding: 1.1rem 1.2rem;
      display: flex;
      align-items: flex-start;
      gap: 0.9rem;
      transition: box-shadow .2s, transform .2s;
      position: relative;
    }
    .kpi-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,.07); transform: translateY(-1px); }
    .kpi-card.kpi-alert { border-color: #fca5a5; background: #fff8f8; }

    .kpi-card.skeleton {
      height: 100px;
      background: linear-gradient(90deg, var(--bg-card,#f1f5f9) 25%, var(--border,#e2e8f0) 50%, var(--bg-card,#f1f5f9) 75%);
      background-size: 200% 100%; animation: shimmer 1.4s infinite;
      border: none;
    }
    @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

    .kpi-icon { width: 44px; height: 44px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 0.1rem; }
    .kpi-blue   { background:#dbeafe; color:#2563eb; }
    .kpi-green  { background:#dcfce7; color:#16a34a; }
    .kpi-purple { background:#ede9fe; color:#7c3aed; }
    .kpi-orange { background:#ffedd5; color:#ea580c; }
    .kpi-teal   { background:#ccfbf1; color:#0d9488; }
    .kpi-red    { background:#fee2e2; color:#dc2626; }
    .kpi-indigo { background:#e0e7ff; color:#4338ca; }
    .kpi-yellow { background:#fef9c3; color:#b45309; }

    .kpi-content { display: flex; flex-direction: column; gap: 0.25rem; min-width: 0; flex: 1; }
    .kpi-value { font-size: 1.7rem; font-weight: 800; color: var(--text, #1a202c); line-height: 1; }
    .kpi-value.text-red { color: #dc2626; }
    .kpi-denom { font-size: 1rem; font-weight: 500; color: var(--text-muted, #94a3b8); }
    .kpi-label { font-size: 0.76rem; color: var(--text-muted, #64748b); font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px; }
    .kpi-sub   { font-size: 0.72rem; font-weight: 600; }
    .kpi-sub.green  { color: #16a34a; }
    .kpi-sub.red    { color: #dc2626; }

    .kpi-pills { display: flex; flex-wrap: wrap; gap: 0.3rem; margin-top: 0.15rem; }
    .pill { font-size: 0.68rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 20px; white-space: nowrap; }
    .pill-blue   { background:#dbeafe; color:#1d4ed8; }
    .pill-green  { background:#dcfce7; color:#15803d; }
    .pill-orange { background:#ffedd5; color:#c2410c; }
    .pill-red    { background:#fee2e2; color:#b91c1c; }
    .pill-purple { background:#ede9fe; color:#6d28d9; }
    .pill-indigo { background:#e0e7ff; color:#3730a3; }
    .pill-teal   { background:#ccfbf1; color:#0f766e; }
    .pill-gray   { background:#f1f5f9; color:#475569; }

    .kpi-progress-bar { height: 5px; background: var(--border, #e2e8f0); border-radius: 99px; overflow: hidden; margin: 0.25rem 0 0.1rem; }
    .kpi-progress-fill { height: 100%; border-radius: 99px; transition: width .6s ease; }
    .fill-good { background: #22c55e; }
    .fill-warn { background: #f59e0b; }
    .fill-bad  { background: #ef4444; }

    .kpi-trend { position: absolute; top: 0.8rem; right: 0.9rem; display: flex; align-items: center; gap: 0.25rem; }
    .trend-label { font-size: 0.68rem; font-weight: 700; }
    .trend-label.red   { color: #dc2626; }
    .trend-label.green { color: #16a34a; }

    /* ── Charts ───────────────────────────────────────────────────────── */
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }
    @media (max-width: 900px) { .charts-grid { grid-template-columns: 1fr; } .chart-wide { grid-column: span 1; } }

    .chart-card {
      background: var(--bg-card, #fff);
      border: 1.5px solid var(--border, #e2e8f0);
      border-radius: 14px;
      padding: 1.2rem 1.25rem;
    }
    .chart-wide { grid-column: span 2; }

    .chart-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 0.9rem; flex-wrap: wrap; gap: 0.5rem;
    }
    .chart-title { font-size: 0.88rem; font-weight: 700; color: var(--text, #1a202c); margin: 0; }

    .chart-badge {
      font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.55rem;
      border-radius: 20px; background: #f1f5f9; color: #475569;
    }
    .badge-red { background: #fee2e2; color: #b91c1c; }

    .chart-controls { display: flex; gap: 0.3rem; }
    .ctrl-btn {
      font-size: 0.72rem; font-weight: 600; padding: 0.25rem 0.65rem;
      border-radius: 8px; border: 1.5px solid var(--border, #e2e8f0);
      background: var(--bg-card, #fff); color: var(--text-muted, #64748b);
      cursor: pointer; transition: all .15s;
    }
    .ctrl-btn:hover  { background: #f1f5f9; }
    .ctrl-btn.active { background: #1e293b; color: #fff; border-color: #1e293b; }

    .chart-body      { position: relative; height: 210px; }
    .chart-body-wide { height: 230px; }
    .chart-body-rec  { height: 180px; }

    /* ── Error ────────────────────────────────────────────────────────── */
    .dash-error {
      display: flex; align-items: center; gap: 0.5rem;
      color: #dc2626; background: #fee2e2; padding: .75rem 1rem;
      border-radius: 10px; font-size: .83rem; margin-bottom: 1rem;
    }

    /* ── Welcome banner ───────────────────────────────────────────────── */
    .welcome-banner {
      display: flex; align-items: center; justify-content: space-between;
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
      border-radius: 16px; padding: 1.25rem 1.75rem; margin-bottom: 1.25rem;
      flex-wrap: wrap; gap: 0.75rem;
      box-shadow: 0 4px 20px rgba(59,130,246,0.25);
    }
    .welcome-left { display: flex; align-items: center; gap: 0.9rem; }
    .welcome-greeting { font-size: 0.72rem; color: rgba(255,255,255,0.75); margin: 0 0 0.15rem; text-transform: uppercase; letter-spacing: 0.7px; font-weight: 600; }
    .welcome-name { font-size: 1.25rem; font-weight: 800; color: #ffffff; margin: 0; text-shadow: 0 1px 3px rgba(0,0,0,0.15); }
    .welcome-hint { font-size: 0.8rem; color: rgba(255,255,255,0.85); margin: 0; max-width: 340px; text-align: right; font-weight: 500; line-height: 1.45; }

    /* ── Operations index ─────────────────────────────────────────────── */
    .ops-index { margin-top: 1.25rem; border-top: 1.5px solid var(--border, #e2e8f0); padding-top: 1rem; }
    .ops-index-title { font-size: 0.78rem; font-weight: 700; color: var(--text-muted, #64748b); text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 0.75rem; }
    .ops-index-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.75rem; }
    .ops-recette-block { background: var(--bg-card, #f8fafc); border: 1.5px solid var(--border, #e2e8f0); border-radius: 10px; padding: 0.75rem; }
    .ops-recette-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; gap: 0.4rem; }
    .ops-recette-name { font-size: 0.8rem; font-weight: 700; color: var(--text, #1a202c); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .ops-count-badge { font-size: 0.65rem; font-weight: 700; background: #ede9fe; color: #6d28d9; padding: 0.15rem 0.45rem; border-radius: 20px; white-space: nowrap; }
    .ops-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.3rem; }
    .ops-item { display: flex; align-items: center; gap: 0.45rem; }
    .op-index { width: 18px; height: 18px; border-radius: 50%; background: #1e293b; color: #fff; font-size: 0.62rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .op-name { font-size: 0.74rem; color: var(--text, #334155); flex: 1; }
    .op-meta { font-size: 0.68rem; color: var(--text-muted, #94a3b8); font-weight: 600; white-space: nowrap; }

    /* ── Compliance section ───────────────────────────────────────────── */
    .compliance-section {
      margin-top: 1.25rem;
      background: var(--bg-card, #fff);
      border: 1.5px solid var(--border, #e2e8f0);
      border-radius: 16px;
      padding: 1.4rem 1.5rem;
    }

    .compliance-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem;
    }
    .compliance-title-group { display: flex; align-items: flex-start; gap: 0.75rem; }
    .compliance-icon-wrap {
      width: 38px; height: 38px; border-radius: 10px;
      background: #dbeafe; color: #2563eb;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .compliance-title { font-size: 1rem; font-weight: 700; color: var(--text, #1a202c); margin: 0 0 0.2rem; }
    .compliance-subtitle { font-size: 0.78rem; color: var(--text-muted, #64748b); margin: 0; }

    .compliance-filters { display: flex; align-items: flex-end; gap: 0.6rem; flex-wrap: wrap; }
    .compliance-date-group { display: flex; flex-direction: column; gap: 0.25rem; }
    .compliance-date-label { font-size: 0.72rem; font-weight: 600; color: var(--text-muted, #64748b); }
    .compliance-date-input {
      font-size: 0.8rem; padding: 0.38rem 0.6rem;
      border: 1.5px solid var(--border, #e2e8f0); border-radius: 8px;
      background: var(--bg-card, #fff); color: var(--text, #1a202c);
      outline: none; transition: border-color .15s;
    }
    .compliance-date-input:focus { border-color: #3b82f6; }

    .compliance-run-btn {
      display: flex; align-items: center; gap: 0.4rem;
      padding: 0.42rem 1rem; border-radius: 8px; border: none;
      background: #1e293b; color: #fff; font-size: 0.8rem; font-weight: 600;
      cursor: pointer; transition: background .15s;
    }
    .compliance-run-btn:hover:not(:disabled) { background: #334155; }
    .compliance-run-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .spin { animation: spin 0.9s linear infinite; }

    .compliance-error {
      display: flex; align-items: center; gap: 0.4rem;
      color: #dc2626; background: #fee2e2; padding: 0.6rem 0.9rem;
      border-radius: 8px; font-size: 0.78rem; margin-bottom: 1rem;
    }

    /* ── Compliance KPI strip ─────────────────────────────────────────── */
    .compliance-kpi-strip {
      display: flex; flex-wrap: wrap; gap: 0.75rem;
      margin-bottom: 1.25rem;
    }
    .compliance-kpi {
      flex: 1; min-width: 120px;
      background: var(--bg-card, #f8fafc); border: 1.5px solid var(--border, #e2e8f0);
      border-radius: 12px; padding: 0.9rem 1rem;
      display: flex; flex-direction: column; gap: 0.2rem;
    }
    .ckpi-value { font-size: 1.5rem; font-weight: 800; color: var(--text, #1a202c); line-height: 1; }
    .ckpi-label { font-size: 0.7rem; color: var(--text-muted, #64748b); font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px; }
    .ckpi-variance-hint { font-size: 0.68rem; color: var(--text-muted, #94a3b8); font-weight: 500; }
    .ckpi-icon-wrap { width: 26px; height: 26px; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-bottom: 0.2rem; }
    .ckpi-green { background: #dcfce7; color: #16a34a; }
    .ckpi-red   { background: #fee2e2; color: #dc2626; }
    .ckpi-orange{ background: #ffedd5; color: #ea580c; }

    .compliance-kpi-rate .ckpi-value { font-size: 1.8rem; }
    .rate-great { border-color: #86efac; background: #f0fdf4; }
    .rate-warn  { border-color: #fcd34d; background: #fffbeb; }
    .rate-bad   { border-color: #fca5a5; background: #fff8f8; }
    .ckpi-bar-track { height: 4px; background: #e2e8f0; border-radius: 99px; overflow: hidden; margin-top: 0.4rem; }
    .ckpi-bar-fill  { height: 100%; border-radius: 99px; transition: width .6s ease; }
    .rate-fill { background: #3b82f6; }
    .rate-great .rate-fill { background: #22c55e; }
    .rate-warn  .rate-fill { background: #f59e0b; }
    .rate-bad   .rate-fill { background: #ef4444; }

    .var-positive .ckpi-value { color: #dc2626; }
    .var-negative .ckpi-value { color: #16a34a; }

    /* ── Compliance body (chart + table) ──────────────────────────────── */
    .compliance-body { display: grid; grid-template-columns: 1fr 2fr; gap: 1rem; }
    @media (max-width: 900px) { .compliance-body { grid-template-columns: 1fr; } }

    .compliance-chart-wrap .chart-body { height: 200px; }
    .compliance-table-wrap { overflow: hidden; }

    /* Row filters */
    .compliance-row-filters { display: flex; gap: 0.3rem; flex-wrap: wrap; }
    .notif-pill {
      display: flex; align-items: center; gap: 0.3rem;
      font-size: 0.71rem; font-weight: 600; padding: 0.2rem 0.6rem;
      border-radius: 20px; border: 1.5px solid var(--border, #e2e8f0);
      background: var(--bg-card, #fff); color: var(--text-muted, #64748b);
      cursor: pointer; transition: all .15s;
    }
    .notif-pill:hover { background: #f1f5f9; }
    .notif-pill-active { background: #1e293b !important; color: #fff !important; border-color: #1e293b !important; }
    .notif-pill-active .notif-pill-count { background: rgba(255,255,255,0.2) !important; color: #fff !important; }
    .notif-pill-critical.notif-pill-active { background: #dc2626 !important; border-color: #dc2626 !important; }
    .notif-pill-warning.notif-pill-active  { background: #f59e0b !important; border-color: #f59e0b !important; }
    .notif-pill-inactive.notif-pill-active { background: #16a34a !important; border-color: #16a34a !important; }
    .notif-pill-count { font-size: 0.65rem; font-weight: 700; background: #f1f5f9; color: #475569; padding: 0.05rem 0.35rem; border-radius: 10px; }

    /* Table */
    .compliance-table-scroll { overflow-x: auto; max-height: 320px; overflow-y: auto; margin-top: 0.75rem; }
    .compliance-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; }
    .compliance-table th { position: sticky; top: 0; background: var(--bg-card, #f8fafc); font-size: 0.7rem; font-weight: 700; color: var(--text-muted, #64748b); text-transform: uppercase; letter-spacing: 0.4px; padding: 0.5rem 0.75rem; border-bottom: 1.5px solid var(--border, #e2e8f0); text-align: left; white-space: nowrap; }
    .compliance-table td { padding: 0.55rem 0.75rem; border-bottom: 1px solid var(--border, #f1f5f9); color: var(--text, #334155); vertical-align: middle; }
    .compliance-table tr:last-child td { border-bottom: none; }
    .compliance-table tr.row-late    { background: #fff8f8; }
    .compliance-table tr.row-ontime  { background: #f0fdf4; }
    .compliance-table tr.row-pending { background: #fffbeb; }

    .row-num  { font-weight: 700; color: var(--text, #1a202c); }
    .row-qty  { font-size: 0.7rem; color: var(--text-muted, #94a3b8); margin-left: 0.3rem; }
    .row-recette { color: var(--text-muted, #475569); max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .row-date { white-space: nowrap; color: var(--text-muted, #475569); }
    .row-variance { font-weight: 600; white-space: nowrap; }
    .var-late  { color: #dc2626; }
    .var-early { color: #16a34a; }
    .table-empty { text-align: center; color: var(--text-muted, #94a3b8); padding: 1.5rem !important; font-size: 0.8rem; }

    .compliance-badge { font-size: 0.68rem; font-weight: 700; padding: 0.2rem 0.55rem; border-radius: 20px; white-space: nowrap; }
    .badge-ontime  { background: #dcfce7; color: #15803d; }
    .badge-late    { background: #fee2e2; color: #b91c1c; }
    .badge-pending { background: #ffedd5; color: #c2410c; }

    /* Empty state */
    .compliance-empty {
      display: flex; flex-direction: column; align-items: center;
      gap: 0.75rem; padding: 2.5rem 1rem; color: var(--text-muted, #94a3b8);
      font-size: 0.82rem; text-align: center;
    }
    .compliance-empty strong { color: var(--text, #475569); }
  `],
})
export class AdminDashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('statutChart')    statutChartRef!:    ElementRef<HTMLCanvasElement>;
  @ViewChild('usersChart')     usersChartRef!:     ElementRef<HTMLCanvasElement>;
  @ViewChild('machineChart')   machineChartRef!:   ElementRef<HTMLCanvasElement>;
  @ViewChild('planningChart')  planningChartRef!:  ElementRef<HTMLCanvasElement>;
  @ViewChild('recetteChart')   recetteChartRef!:   ElementRef<HTMLCanvasElement>;
  @ViewChild('urgenceChart')   urgenceChartRef!:   ElementRef<HTMLCanvasElement>;
  // static: false — canvas is inside *ngIf so it doesn't exist until report signal is set
  @ViewChild('complianceChart', { static: false }) complianceChartRef?: ElementRef<HTMLCanvasElement>;

  readonly vm  = inject(AdminDashboardViewModel);
  private  cdr = inject(ChangeDetectorRef);

  private charts: Map<string, Chart> = new Map();

  // ── Race-condition guard ───────────────────────────────────────────────
  // ngOnInit (async data load) and ngAfterViewInit (DOM ready) race each other.
  // Charts must only be built once BOTH have completed. Whichever finishes last
  // checks both flags and triggers the build.
  private _viewReady  = false;
  private _dataLoaded = false;

  private readonly C = {
    BLUE:   '#3b82f6', GREEN:  '#22c55e', ORANGE: '#f97316', RED:    '#ef4444',
    PURPLE: '#a855f7', TEAL:   '#14b8a6', YELLOW: '#fbbf24', GRAY:   '#94a3b8',
    INDIGO: '#6366f1', PINK:   '#ec4899',
  };

  // ── Lifecycle ─────────────────────────────────────────────────────────
  async ngOnInit() {
    await this.vm.loadData();
    this._dataLoaded = true;
    // View was already ready before data arrived → build now
    if (this._viewReady) {
      this.cdr.detectChanges();
      this._buildAllCharts();
    }
  }

  ngAfterViewInit() {
    this._viewReady = true;
    // Data already loaded before view was ready → build now
    if (this._dataLoaded) {
      this.cdr.detectChanges();
      this._buildAllCharts();
    }
  }

  ngOnDestroy() { this._destroyAllCharts(); }

  async reload() {
    this._destroyAllCharts();
    this._dataLoaded = false;
    await this.vm.loadData();
    this._dataLoaded = true;
    this.cdr.detectChanges();
    this._buildAllCharts();
  }

  async loadComplianceReport(): Promise<void> {
    await this.vm.loadComplianceReport();
    // markForCheck lets Angular process the *ngIf that stamps #complianceChart,
    // then setTimeout yields one tick so the canvas is in the DOM before we render.
    this.cdr.markForCheck();
    setTimeout(() => this._renderComplianceChart(), 0);
  }

  // ── Chart filter handlers ─────────────────────────────────────────────
  onPlanningFilter(n: number) { this.vm.setPlanningFilter(n); this._rebuildChart('planning'); }
  onMachineView(v: 'all' | 'fonctionnel' | 'non') { this.vm.setMachineView(v); this._rebuildChart('machine'); }
  onTopRec(n: number) { this.vm.setTopRec(n); this._rebuildChart('recette'); }

  // ── Chart rendering ───────────────────────────────────────────────────
  private _buildAllCharts() {
    ['statut', 'users', 'planning', 'machine', 'urgence', 'recette'].forEach(k => this._rebuildChart(k));
  }

  private _rebuildChart(key: string) {
    const existing = this.charts.get(key);
    if (existing) { existing.destroy(); this.charts.delete(key); }

    const { cmd = [], mach = [], plan = [], rec = [], usr = [] } = this.vm.rawData();
    const C = this.C;

    const base: any = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { font: { size: 11, family: "'Segoe UI', system-ui" }, color: '#64748b', boxWidth: 12 } },
        tooltip: { backgroundColor: '#1e293b', titleColor: '#f8fafc', bodyColor: '#cbd5e1', padding: 10, cornerRadius: 8 },
      },
    };

    const axis = (label: string) => ({
      title: { display: true, text: label, color: '#94a3b8', font: { size: 10 } },
      grid:  { color: 'rgba(100,116,139,0.08)' },
      ticks: { color: '#94a3b8', font: { size: 10 } },
    });

    // ── 1. Statut doughnut ───────────────────────────────────────────────
    if (key === 'statut' && this.statutChartRef?.nativeElement) {
      const trS = this.vm.t();
      const statutI18n: Record<string, string> = {
        'En attente': trS.statutEnAttente, 'En cours': trS.statutEnCours,
        'Terminé': trS.statutTermine, 'Terminée': trS.statutTermine,
        'Annulé': trS.statutAnnule, 'Annulée': trS.statutAnnule, 'Inconnu': trS.statutInconnu,
      };
      const colorMap: Record<string, string> = {
        'En attente': C.ORANGE, 'En cours': C.BLUE, 'Terminé': C.GREEN,
        'Terminée': C.GREEN, 'Annulé': C.RED, 'Annulée': C.RED,
      };
      const rawMap: Record<string, number> = {};
      cmd.forEach((c: any) => { const s = c.statut ?? 'Inconnu'; rawMap[s] = (rawMap[s] ?? 0) + 1; });
      const rawKeys = Object.keys(rawMap);
      this.charts.set(key, new Chart(this.statutChartRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: rawKeys.map(k => statutI18n[k] ?? k),
          datasets: [{ data: rawKeys.map(k => rawMap[k]), backgroundColor: rawKeys.map(k => colorMap[k] ?? C.GRAY), borderWidth: 3, borderColor: '#fff', hoverBorderWidth: 0 }],
        },
        options: { ...base, cutout: '65%', plugins: { ...base.plugins, legend: { position: 'right', labels: { ...base.plugins.legend.labels } }, tooltip: { ...base.plugins.tooltip, callbacks: { label: (ctx: any) => { const pct = cmd.length ? Math.round(ctx.parsed / cmd.length * 100) : 0; return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`; } } } } } as any,
      }));
    }

    // ── 2. Users role doughnut ───────────────────────────────────────────
    if (key === 'users' && this.usersChartRef?.nativeElement) {
      const tr = this.vm.t();
      // Only 3 segments: Administrateurs / Responsables de planification / Employés
      const roleLabels = [tr.chartRoleAdmins, tr.chartRolePlanners, tr.chartRoleOperators];
      const roleData   = [
        usr.filter((u: any) => u.role === 'Admin').length,
        usr.filter((u: any) => u.role === 'PlanificationResponsable' || u.role === 'planner').length,
        usr.filter((u: any) => u.role === 'Worker' || u.role === 'operator').length,
      ];
      this.charts.set(key, new Chart(this.usersChartRef.nativeElement, {
        type: 'doughnut',
        data: { labels: roleLabels, datasets: [{ data: roleData, backgroundColor: [C.RED, C.INDIGO, C.TEAL], borderWidth: 3, borderColor: '#fff' }] },
        options: { ...base, cutout: '65%', plugins: { ...base.plugins, legend: { position: 'right', labels: { ...base.plugins.legend.labels } }, tooltip: { ...base.plugins.tooltip, callbacks: { label: (ctx: any) => { const pct = usr.length ? Math.round(ctx.parsed / usr.length * 100) : 0; return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`; } } } } } as any,
      }));
    }

    // ── 3. Planning trend line ───────────────────────────────────────────
    if (key === 'planning' && this.planningChartRef?.nativeElement) {
      const sorted = [...plan].sort((a: any, b: any) => a.id - b.id);
      const n      = this.vm.planningFilter();
      const slice  = n === 0 ? sorted : sorted.slice(-n);
      const rawDays = slice.map((p: any) => +(p.makespanDays ?? 0));
      const maxDays = rawDays.length ? Math.max(...rawDays) : 0;
      const useHours = maxDays > 0 && maxDays < 1;
      const useMin   = !useHours && maxDays === 0;
      const makespanData = rawDays.map(d => useHours ? +(d * 24).toFixed(2) : useMin ? +(d * 24 * 60).toFixed(0) : +d.toFixed(2));
      const tr = this.vm.t();
      const makespanUnit  = useHours ? tr.dashboardAxisMakespanH  : useMin ? tr.dashboardAxisMakespanMin  : tr.dashboardAxisMakespan;
      const makespanLabel = useHours ? tr.dashboardMakespanHours  : useMin ? tr.dashboardMakespanMin      : tr.dashboardMakespanDays;

      this.charts.set(key, new Chart(this.planningChartRef.nativeElement, {
        type: 'line',
        data: {
          labels: slice.map((_: any, i: number) => `P${sorted.length - slice.length + i + 1}`),
          datasets: [
            { label: makespanLabel, data: makespanData, borderColor: C.BLUE, backgroundColor: 'rgba(59,130,246,0.08)', fill: true, tension: 0.4, pointRadius: 5, pointHoverRadius: 7, yAxisID: 'yMake' },
            { label: tr.dashboardCommandesPlanifiees, data: slice.map((p: any) => p.nombreCommandes ?? 0), borderColor: C.TEAL, backgroundColor: 'rgba(20,184,166,0.07)', fill: true, tension: 0.4, pointRadius: 5, pointHoverRadius: 7, yAxisID: 'yCmd' },
          ],
        },
        options: {
          ...base, interaction: { mode: 'index', intersect: false },
          plugins: { ...base.plugins, tooltip: { ...base.plugins.tooltip, callbacks: { label: (ctx: any) => {
            if (ctx.datasetIndex === 0) {
              const val = ctx.parsed.y;
              if (useHours) { const h = Math.floor(val); const m = Math.round((val - h) * 60); return m > 0 ? ` ${makespanLabel}: ${h}h ${m}min` : ` ${makespanLabel}: ${h}h`; }
              if (useMin) return ` ${makespanLabel}: ${Math.round(val)} min`;
              const d = Math.floor(val); const h = Math.round((val - d) * 24);
              return h > 0 ? ` ${makespanLabel}: ${d}j ${h}h` : ` ${makespanLabel}: ${d}j`;
            }
            return ` ${tr.dashboardCommandesPlanifiees}: ${ctx.parsed.y}`;
          } } } },
          scales: { x: { ...axis(tr.dashboardAxisPlanning) }, yMake: { position: 'left', beginAtZero: true, ...axis(makespanUnit) }, yCmd: { position: 'right', beginAtZero: true, ...axis(tr.dashboardAxisCommandes), grid: { drawOnChartArea: false, color: 'transparent' } } },
        } as any,
      }));
    }

    // ── 4. Machine bar ───────────────────────────────────────────────────
    if (key === 'machine' && this.machineChartRef?.nativeElement) {
      const view     = this.vm.machineView();
      const filtered = view === 'fonctionnel' ? mach.filter((m: any) => m.statut === 'Fonctionnel') : view === 'non' ? mach.filter((m: any) => m.statut === 'Non fonctionnel') : mach;
      const fonctOk  = filtered.filter((m: any) => m.statut === 'Fonctionnel').length;
      const fonctKo  = filtered.filter((m: any) => m.statut === 'Non fonctionnel').length;
      const trM = this.vm.t();
      const labels = view === 'fonctionnel' ? [trM.filterFonctionnel] : view === 'non' ? [trM.filterNonFonctionnel] : [trM.filterFonctionnel, trM.filterNonFonctionnel];
      const data   = view === 'fonctionnel' ? [fonctOk] : view === 'non' ? [fonctKo] : [fonctOk, fonctKo];
      const bgColors = view === 'fonctionnel' ? [C.GREEN] : view === 'non' ? [C.RED] : [C.GREEN, C.RED];
      this.charts.set(key, new Chart(this.machineChartRef.nativeElement, {
        type: 'bar',
        data: { labels, datasets: [{ label: trM.chartAxisMachines, data, backgroundColor: bgColors, borderRadius: 10 }] },
        options: { ...base, indexAxis: 'y' as const, plugins: { ...base.plugins, legend: { display: false }, tooltip: { ...base.plugins.tooltip, callbacks: { label: (ctx: any) => { const pct = mach.length ? Math.round(ctx.parsed.x / mach.length * 100) : 0; return ` ${ctx.parsed.x} ${trM.chartAxisMachines} (${pct}% ${trM.chartPctDuParc})`; } } } }, scales: { x: { beginAtZero: true, max: mach.length, ...axis(trM.chartAxisNombreMachines), ticks: { stepSize: 1 } }, y: { ...axis('') } } } as any,
      }));
    }

    // ── 5. Urgence bar ───────────────────────────────────────────────────
    if (key === 'urgence' && this.urgenceChartRef?.nativeElement) {
      const urgMap: Record<number, number> = {};
      cmd.forEach((c: any) => { urgMap[c.urgence] = (urgMap[c.urgence] ?? 0) + 1; });
      const urgKeys = Object.keys(urgMap).map(Number).sort((a, b) => a - b);
      const palette = [C.RED, C.ORANGE, C.YELLOW, C.GREEN, C.TEAL, C.BLUE, C.PURPLE];
      const tr = this.vm.t();
      this.charts.set(key, new Chart(this.urgenceChartRef.nativeElement, {
        type: 'bar',
        data: { labels: urgKeys.map(k => `${tr.chartUrgenceLabel} ${k}`), datasets: [{ label: tr.kpiLabelCommandes, data: urgKeys.map(k => urgMap[k]), backgroundColor: urgKeys.map((_, i) => palette[i % palette.length]), borderRadius: 8 }] },
        options: { ...base, plugins: { ...base.plugins, legend: { display: false }, tooltip: { ...base.plugins.tooltip, callbacks: { label: (ctx: any) => { const pct = cmd.length ? Math.round(ctx.parsed.y / cmd.length * 100) : 0; return ` ${ctx.parsed.y} ${tr.chartTooltipCommandes} (${pct}% ${tr.chartPctDuTotal})`; } } } }, scales: { x: { ...axis(tr.chartAxisUrgence) }, y: { beginAtZero: true, ...axis(tr.kpiLabelCommandes), ticks: { stepSize: 1 } } } } as any,
      }));
    }

    // ── 6. Top recettes bar ──────────────────────────────────────────────
    if (key === 'recette' && this.recetteChartRef?.nativeElement) {
      const recLookup: Record<number, string> = {};
      rec.forEach((r: any) => { recLookup[r.id] = r.nomRecette; });
      const recMap: Record<string, number> = {};
      const tr = this.vm.t();
      cmd.forEach((c: any) => {
        const name = c.recette?.nomRecette ?? recLookup[c.recetteId] ?? (c.recetteId ? `${tr.chartRecettePrefix} ${c.recetteId}` : tr.chartRecetteInconnue);
        recMap[name] = (recMap[name] ?? 0) + 1;
      });
      const top = Object.entries(recMap).sort((a, b) => b[1] - a[1]).slice(0, this.vm.topRecCount());
      this.charts.set(key, new Chart(this.recetteChartRef.nativeElement, {
        type: 'bar',
        data: { labels: top.map(([k]) => k), datasets: [{ label: tr.kpiLabelCommandes, data: top.map(([, v]) => v), backgroundColor: top.map((_, i) => [C.PURPLE,C.INDIGO,C.BLUE,C.TEAL,C.GREEN,C.YELLOW,C.ORANGE,C.RED,C.PINK,C.GRAY][i%10]), borderRadius: 8 }] },
        options: { ...base, indexAxis: 'y' as const, plugins: { ...base.plugins, legend: { display: false }, tooltip: { ...base.plugins.tooltip, callbacks: { label: (ctx: any) => { const pct = cmd.length ? Math.round(ctx.parsed.x / cmd.length * 100) : 0; return ` ${ctx.parsed.x} ${tr.chartTooltipCommandes} — ${pct}% ${tr.chartPctDuTotal}`; } } } }, scales: { x: { beginAtZero: true, ...axis(tr.chartAxisNombreCommandes), ticks: { stepSize: 1 } }, y: { ...axis(tr.chartAxisRecette) } } } as any,
      }));
    }
  }

  // ── Compliance chart (mirrors planner exactly) ────────────────────────
  private _renderComplianceChart(): void {
    const report = this.vm.complianceReport();
    if (!report || !this.complianceChartRef?.nativeElement) return;

    const existing = this.charts.get('compliance');
    if (existing) { existing.destroy(); this.charts.delete('compliance'); }

    const tr = this.vm.t();

    const base = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right' as const, labels: { padding: 16, font: { size: 12 }, usePointStyle: true, pointStyleWidth: 10 } },
        tooltip: { backgroundColor: 'rgba(0,0,0,0.7)', padding: 10 },
      },
    };

    const total  = report.totalCommandes || 1;
    const labels = [tr.complianceChartLabelOnTime, tr.complianceChartLabelLate, tr.complianceChartLabelPending];
    const values = [report.onTime, report.late, report.pending];
    const colors = ['#10b981', '#ef4444', '#f59e0b'];

    // Plugin 1: center total label
    const centerTotalPlugin = {
      id: 'centerTotal',
      afterDraw(chart: any) {
        const { ctx, chartArea: { left, right, top, bottom } } = chart;
        const cx = (left + right) / 2;
        const cy = (top + bottom) / 2;
        ctx.save();
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.font         = 'bold 20px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
        ctx.fillStyle    = '#1e293b';
        ctx.fillText(String(total), cx, cy - 8);
        ctx.font         = '11px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
        ctx.fillStyle    = '#64748b';
        ctx.fillText('total', cx, cy + 12);
        ctx.restore();
      },
    };

    // Plugin 2: inline value labels on each slice with leader lines + overlap resolution
    const dataLabelsPlugin = {
      id: 'complianceDataLabels',
      afterDatasetsDraw(chart: any) {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        if (!meta || !meta.data) return;

        const LINE_H = 14;

        const positions: { lx: number; ly: number; text: string; color: string; align: CanvasTextAlign }[] = [];
        meta.data.forEach((arc: any, i: number) => {
          const val = values[i];
          if (val === 0) { positions.push(null as any); return; }
          const pct      = Math.round((val / total) * 100);
          const text     = `${val} (${pct}%)`;
          const midAngle = arc.startAngle + (arc.endAngle - arc.startAngle) / 2;
          const labelR   = arc.outerRadius + 18;
          const lx       = arc.x + Math.cos(midAngle) * labelR;
          const ly       = arc.y + Math.sin(midAngle) * labelR;
          positions.push({ lx, ly, text, color: colors[i], align: lx > arc.x ? 'left' : 'right' });
        });

        // Resolve vertical overlaps between adjacent labels
        for (let a = 0; a < positions.length; a++) {
          if (!positions[a]) continue;
          for (let b = a + 1; b < positions.length; b++) {
            if (!positions[b]) continue;
            const dy = Math.abs(positions[a].ly - positions[b].ly);
            const dx = Math.abs(positions[a].lx - positions[b].lx);
            if (dx < 80 && dy < LINE_H) {
              const push = (LINE_H - dy) / 2 + 1;
              positions[a].ly -= push;
              positions[b].ly += push;
            }
          }
        }

        positions.forEach(p => {
          if (!p) return;
          ctx.save();
          ctx.font         = 'bold 11px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
          ctx.fillStyle    = p.color;
          ctx.textAlign    = p.align;
          ctx.textBaseline = 'middle';
          ctx.fillText(p.text, p.lx, p.ly);
          ctx.restore();
        });
      },
    };

    this.charts.set('compliance', new Chart(this.complianceChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderColor: 'white',
          borderWidth: 3,
          hoverOffset: 8,
        }],
      },
      plugins: [centerTotalPlugin, dataLabelsPlugin],
      options: {
        ...base,
        cutout: '58%',
        layout: { padding: 30 },
        plugins: {
          ...base.plugins,
          tooltip: {
            ...base.plugins.tooltip,
            callbacks: {
              label: (ctx: any) => {
                const pct = Math.round((ctx.parsed / total) * 100);
                return ` ${ctx.parsed} ${tr.complianceTooltipSuffix ?? 'commandes'} — ${pct}%`;
              },
            },
          },
        },
      } as any,
    }));
  }

  private _destroyAllCharts() {
    this.charts.forEach(c => c.destroy());
    this.charts.clear();
  }
}
