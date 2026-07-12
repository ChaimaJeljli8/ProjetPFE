import {
  Component, OnInit, AfterViewInit, OnDestroy,
  inject, ElementRef, ViewChild, ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { PlannerDashboardViewModel } from './planner-dashboard.viewmodel';

Chart.register(...registerables);

@Component({
  selector: 'app-planner-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [PlannerDashboardViewModel],
  template: `
    <div class="dashboard planner-dash">

      <div class="welcome-banner planner-banner">
        <div class="banner-gradient"></div>
        <div class="banner-content">
          <div class="banner-left">
            <div class="banner-text">
              <p class="banner-greeting">{{ vm.greeting() }},</p>
              <h2 class="banner-name">{{ vm.userName() }}</h2>
              <p class="banner-role">{{ vm.t().plannerRoleLabel }} — {{ vm.t().plannerDashBannerRole }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="dash-header">
        <div>
          <h1 class="dash-title">{{ vm.t().plannerDashTitle }}</h1>
          <p class="dash-subtitle">{{ vm.t().plannerDashSubtitle }}</p>
        </div>
        <div class="header-right">
          <div class="dash-date">{{ vm.today() }}</div>

          <div class="notif-wrapper" (clickOutside)="vm.showBottleneckPanel.set(false)">
            <button
              class="notif-bell-btn"
              [class.notif-bell-active]="vm.showBottleneckPanel()"
              (click)="vm.toggleBottleneckPanel()"
              aria-label="Notifications de goulots d'etranglement"
              [title]="'Bottleneck alerts: ' + vm.bottleneckBadgeCount()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span class="notif-badge" *ngIf="vm.bottleneckBadgeCount() > 0">
                {{ vm.bottleneckBadgeCount() > 9 ? '9+' : vm.bottleneckBadgeCount() }}
              </span>
            </button>

            <div class="notif-panel" *ngIf="vm.showBottleneckPanel()" role="dialog" aria-label="Notifications de goulots d'etranglement">

              <div class="notif-panel-header">
                <div class="notif-panel-title-row">
                  <div class="notif-panel-icon-wrap">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <rect x="2" y="3" width="20" height="14" rx="2"/>
                      <path d="M8 21h8M12 17v4"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <span class="notif-panel-title">{{ vm.t().notifPanelTitle }}</span>
                  <span class="notif-panel-count" *ngIf="vm.bottleneckBadgeCount() > 0">
                    {{ vm.bottleneckBadgeCount() }}
                  </span>
                </div>
                <button class="notif-panel-close" (click)="vm.showBottleneckPanel.set(false)" [attr.aria-label]="vm.t().notifClose">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <div class="notif-filter-row">
                <button class="notif-pill"
                  [class.notif-pill-active]="vm.bottleneckFilter() === 'all'"
                  (click)="vm.setBottleneckFilter('all')">
                  {{ vm.t().notifFilterAll }}
                  <span class="notif-pill-count">{{ vm.filteredBottleneckAlerts().length }}</span>
                </button>
                <button class="notif-pill notif-pill-critical"
                  [class.notif-pill-active]="vm.bottleneckFilter() === 'overloaded'"
                  (click)="vm.setBottleneckFilter('overloaded')">
                  {{ vm.t().notifFilterOverloaded }}
                  <span class="notif-pill-count">{{ countByType('overloaded') }}</span>
                </button>
                <button class="notif-pill notif-pill-warning"
                  [class.notif-pill-active]="vm.bottleneckFilter() === 'underused'"
                  (click)="vm.setBottleneckFilter('underused')">
                  {{ vm.t().notifFilterUnderused }}
                  <span class="notif-pill-count">{{ countByType('underused') }}</span>
                </button>
                <button class="notif-pill notif-pill-inactive"
                  [class.notif-pill-active]="vm.bottleneckFilter() === 'inactive'"
                  (click)="vm.setBottleneckFilter('inactive')">
                  {{ vm.t().notifFilterInactive }}
                  <span class="notif-pill-count">{{ countByType('inactive') }}</span>
                </button>
              </div>

              <!-- ── Bottleneck panel inline error ─────────────────────────── -->
              <div class="panel-inline-error" *ngIf="vm.bottleneckPanelError()" role="alert">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{{ vm.bottleneckPanelError() }}</span>
                <button class="panel-inline-error-close" (click)="vm.bottleneckPanelError.set('')" aria-label="Fermer">✕</button>
              </div>
              <!-- ── /Bottleneck panel inline error ────────────────────────── -->

              <div class="notif-list">
                <ng-container *ngIf="vm.filteredBottleneckAlerts().length > 0; else emptyBottleneck">
                  <div
                    *ngFor="let alert of vm.filteredBottleneckAlerts()"
                    class="notif-item"
                    [class.notif-item-critical]="alert.severity === 'critical'"
                    [class.notif-item-warning]="alert.severity === 'warning'">

                    <div class="notif-item-icon"
                      [class.icon-critical]="alert.severity === 'critical'"
                      [class.icon-warning]="alert.severity === 'warning'">
                      <svg *ngIf="alert.type === 'overloaded'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                      <svg *ngIf="alert.type === 'underused'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      <svg *ngIf="alert.type === 'inactive'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <rect x="2" y="3" width="20" height="14" rx="2"/>
                        <path d="M8 21h8M12 17v4"/>
                        <line x1="9" y1="9" x2="15" y2="9" stroke-dasharray="2 2"/>
                      </svg>
                    </div>

                    <div class="notif-item-body">
                      <div class="notif-item-top">
                        <span class="notif-item-name">{{ alert.machineName }}</span>
                        <span class="notif-item-tag"
                          [class.tag-overloaded]="alert.type === 'overloaded'"
                          [class.tag-underused]="alert.type === 'underused'"
                          [class.tag-inactive]="alert.type === 'inactive'">
                          {{ alert.type === 'overloaded' ? vm.t().notifTagOverloaded : alert.type === 'underused' ? vm.t().notifTagUnderused : vm.t().notifTagInactive }}
                        </span>
                      </div>
                      <p class="notif-item-msg">{{ alert.message }}</p>
                      <p class="notif-item-detail" *ngIf="alert.type !== 'inactive'">
                        {{ alert.scheduledMinutes }} min / {{ alert.capaciteMinutes }} min cap.
                      </p>
                      <div class="notif-item-bar-row">
                        <div class="notif-item-bar">
                          <div class="notif-item-bar-fill"
                            [style.width.%]="alert.type === 'inactive' ? 100 : alert.loadPct"
                            [class.bar-critical]="alert.severity === 'critical' && alert.type === 'overloaded'"
                            [class.bar-warning]="alert.severity === 'warning' && alert.type === 'underused'"
                            [class.bar-underuse]="alert.type === 'underused'"
                            [class.bar-inactive]="alert.type === 'inactive'">
                          </div>
                          <div class="notif-bar-threshold" *ngIf="alert.type === 'overloaded'"></div>
                        </div>
                        <span class="notif-item-pct"
                          [class.pct-critical]="alert.severity === 'critical'"
                          [class.pct-warning]="alert.severity === 'warning'">
                          {{ alert.loadPct }}%
                        </span>
                      </div>
                    </div>

                    <button class="notif-item-dismiss"
                      (click)="vm.dismissBottleneckAlert(alert.id)"
                      title="{{ vm.t().notifDismissTitle }} {{ alert.machineName }}">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </ng-container>

                <ng-template #emptyBottleneck>
                  <div class="notif-empty">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <p>{{ vm.t().notifEmpty }}</p>
                  </div>
                </ng-template>
              </div>

              <div class="notif-panel-footer">
                <span class="notif-footer-summary">
                  <ng-container *ngIf="vm.bottleneckBadgeCount() > 0; else allClearFooter">
                    {{ countByType('overloaded') }} {{ vm.t().notifFooterOverloaded }} · {{ countByType('underused') }} {{ vm.t().notifFooterUnderused }} · {{ countByType('inactive') }} {{ vm.t().notifFooterInactive }}
                  </ng-container>
                  <ng-template #allClearFooter>{{ vm.t().notifFooterBalanced }}</ng-template>
                </span>
                <button
                  class="notif-dismiss-all-btn"
                  *ngIf="vm.bottleneckBadgeCount() > 0"
                  (click)="vm.dismissAllBottleneckAlerts()">
                  {{ vm.t().notifDismissAll }}
                </button>
              </div>

            </div>
          </div>

          <!-- Two buttons: full reload (charts + data) and alert-only refresh -->
          <button class="refresh-btn" (click)="reload()" [title]="vm.t().dashboardRefresh">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
          </button>
          <button class="refresh-btn" (click)="refreshAlerts()"
            [title]="'Recalculer les alertes'"
            [disabled]="vm.alertLoading()"
            style="margin-left:6px">
            <svg *ngIf="!vm.alertLoading()" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <svg *ngIf="vm.alertLoading()" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="spin">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="dash-error" *ngIf="vm.error()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ vm.error() }}
      </div>

      <div class="kpi-grid" *ngIf="vm.loading()">
        <div class="kpi-card skeleton" *ngFor="let i of [1,2,3,4]"></div>
      </div>

      <div class="kpi-grid" *ngIf="!vm.loading()">

        <div class="kpi-card kpi-accent-blue">
          <div class="kpi-icon kpi-blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="9"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-value">{{ vm.formatMakespanSimple(vm.stats().makespanMoyen) }}</span>
            <span class="kpi-label">{{ vm.t().plannerKpiMakespanMoyen }}</span>
            <div class="kpi-pills">
              <span class="pill pill-blue">{{ vm.stats().makespanMoyenMinutes }} min</span>
              <span class="pill pill-gray">{{ vm.t().plannerKpiDureeMoyenne }}</span>
            </div>
          </div>
        </div>

        <div class="kpi-card kpi-accent-teal">
          <div class="kpi-icon kpi-teal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-value">{{ vm.stats().tauxChargeMachines }}%</span>
            <span class="kpi-label">{{ vm.t().plannerKpiChargeMachine }}</span>
            <div class="kpi-progress-bar">
              <div class="kpi-progress-fill"
                   [style.width.%]="vm.stats().tauxChargeMachines"
                   [class.fill-good]="vm.stats().tauxChargeMachines >= 70"
                   [class.fill-warn]="vm.stats().tauxChargeMachines >= 40 && vm.stats().tauxChargeMachines < 70"
                   [class.fill-bad]="vm.stats().tauxChargeMachines < 40">
              </div>
            </div>
          </div>
        </div>

        <div class="kpi-card kpi-accent-orange">
          <div class="kpi-icon kpi-orange">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-value">{{ vm.stats().commandesEnAttente }}</span>
            <span class="kpi-label">{{ vm.t().plannerKpiEnAttente }}</span>
            <div class="kpi-pills">
              <span class="pill pill-orange">{{ vm.stats().commandesEnAttente }} {{ vm.t().plannerKpiEnAttenteLabel }}</span>
            </div>
          </div>
        </div>

        <div class="kpi-card kpi-accent-purple">
          <div class="kpi-icon kpi-purple">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div class="kpi-content">
            <span class="kpi-value">{{ vm.stats().totalPlannings }}</span>
            <span class="kpi-label">{{ vm.t().plannerKpiTotalPlannings }}</span>
            <div class="kpi-pills">
              <span class="pill pill-purple">{{ vm.formatMakespanSimple(vm.stats().makespanMoyen) }} {{ vm.t().plannerKpiMoyenne }}</span>
            </div>
          </div>
          <div class="kpi-trend">
            <span class="trend-label green">✓ {{ vm.t().plannerKpiActifs }}</span>
          </div>
        </div>

      </div>

      <!-- ── Delay Alerts ───────────────────────────────────────────────────── -->
      <div class="alerts-section" *ngIf="!vm.loading() && (vm.delayAlerts().length > 0 || vm.alertPanelError())">
        <div class="alerts-header">
          <div class="alerts-title-group">
            <div class="alerts-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <h3 class="alerts-title">{{ vm.t().alertsTitle }}</h3>
            <span class="alerts-count-badge" *ngIf="vm.criticalAlertsCount() > 0">
              {{ vm.criticalAlertsCount() }} {{ vm.t().alertsCriticalBadge }}
            </span>
          </div>
          <div class="alerts-actions">
            <div class="alerts-filter-group">
              <button class="notif-pill" [class.notif-pill-active]="vm.alertFilter() === 'all'"      (click)="vm.setAlertFilter('all')">{{ vm.t().notifFilterAll }}</button>
              <button class="notif-pill notif-pill-critical" [class.notif-pill-active]="vm.alertFilter() === 'critical'" (click)="vm.setAlertFilter('critical')">{{ vm.t().alertsSeverityCritical }}</button>
              <button class="notif-pill notif-pill-warning"  [class.notif-pill-active]="vm.alertFilter() === 'warning'"  (click)="vm.setAlertFilter('warning')">{{ vm.t().alertsSeverityWarning }}</button>
            </div>
            <button class="alerts-dismiss-btn" *ngIf="vm.filteredAlerts().length > 0" (click)="vm.dismissAllAlerts()">
              {{ vm.t().alertsDismissAll }}
            </button>
          </div>
        </div>

        <!-- ── Delay panel inline error ──────────────────────────────────────── -->
        <div class="panel-inline-error panel-inline-error--block" *ngIf="vm.alertPanelError()" role="alert">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{{ vm.alertPanelError() }}</span>
          <button class="panel-inline-error-close" (click)="vm.alertPanelError.set('')" aria-label="Fermer">✕</button>
        </div>
        <!-- ── /Delay panel inline error ─────────────────────────────────────── -->

        <div class="alerts-list">
          <div
            *ngFor="let alert of vm.filteredAlerts()"
            class="alert-item"
            [class.alert-critical]="alert.severity === 'critical'"
            [class.alert-warning]="alert.severity === 'warning'">

            <div class="alert-severity-icon">
              <svg *ngIf="alert.severity === 'critical'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <svg *ngIf="alert.severity === 'warning'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>

            <div class="alert-body">
              <div class="alert-top-row">
                <span class="alert-commande-id">{{ alert.numeroCommande }}</span>
                <span class="alert-severity-label"
                  [class.label-critical]="alert.severity === 'critical'"
                  [class.label-warning]="alert.severity === 'warning'">
                  {{ alert.severity === 'critical' ? vm.t().alertsSeverityCritical
                   : alert.severity === 'warning'  ? vm.t().alertsSeverityWarning
                   : vm.t().alertsSeverityInfo }}
                </span>
              </div>
              <p class="alert-message">{{ alert.message }}</p>
              <div class="alert-meta">
                <span class="alert-meta-item">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {{ vm.t().alertsExportLabel }}: <strong>{{ alert.dateExport | date:'dd/MM/yyyy' }}</strong>
                </span>
                <span class="alert-meta-item" [class.meta-overdue]="alert.daysRemaining < 0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {{ alert.daysRemaining < 0
                      ? vm.t().alertsOverdueBy + ' ' + (-alert.daysRemaining) + ' j'
                      : vm.t().alertsDaysLeft + ' ' + alert.daysRemaining + ' j' }}
                </span>
                <span class="alert-meta-item" *ngIf="alert.urgence">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                  {{ vm.t().alertsUrgent }}
                </span>
              </div>
            </div>

            <button class="alert-dismiss" (click)="vm.dismissAlert(alert.id)" [title]="vm.t().alertsDismissOne">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="alerts-empty" *ngIf="vm.filteredAlerts().length === 0 && !vm.alertPanelError()">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <p>{{ vm.t().alertsAllClear }}</p>
        </div>
      </div>

      <!-- ── Charts ─────────────────────────────────────────────────────────── -->
      <div class="charts-section" *ngIf="!vm.loading()">

        <div class="charts-row">
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">{{ vm.t().plannerChartEvolution }}</h3>
              <div class="chart-controls">
                <select
                  [ngModel]="vm.planningFilter()"
                  (ngModelChange)="onPlanningFilterChange($event)"
                  class="chart-filter">
                  <option value="0">{{ vm.t().filterAll }}</option>
                  <option value="5">{{ vm.t().filter5Last }}</option>
                  <option value="10">{{ vm.t().filter10Last }}</option>
                </select>
              </div>
            </div>
            <div class="chart-body"><canvas #planningChart></canvas></div>
          </div>

          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">{{ vm.t().chartCommandesStatut }}</h3>
              <span class="chart-badge">{{ vm.stats().totalCommandes }} {{ vm.t().plannerChartTotalBadge }}</span>
            </div>
            <div class="chart-body"><canvas #statusChart></canvas></div>
          </div>
        </div>

        <div class="charts-row">
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">{{ vm.t().plannerChartChargeMachine }}</h3>
              <span class="chart-badge">{{ vm.stats().totalMachines }} {{ vm.t().plannerChartMachinesBadge }}</span>
            </div>
            <div class="chart-body"><canvas #machineChart></canvas></div>
          </div>

          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">{{ vm.t().plannerChartMakespan }}</h3>
              <span class="chart-badge">{{ vm.stats().makespanMoyenMinutes }} {{ vm.t().plannerChartMakespanBadge }}</span>
            </div>
            <div class="chart-body"><canvas #makespanChart></canvas></div>
          </div>
        </div>

        <div class="charts-row">
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">{{ vm.t().plannerChartTopRecettes }}</h3>
            </div>
            <div class="chart-body"><canvas #recetteChart></canvas></div>
          </div>

          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">{{ vm.t().opsIndexTitle }}</h3>
              <div class="chart-controls">
                <select
                  [ngModel]="vm.selectedRecetteOpsIdx()"
                  (ngModelChange)="vm.selectedRecetteOpsIdx.set($event)"
                  class="chart-filter">
                  <option value="">{{ vm.t().plannerOpsSelectPlaceholder }}</option>
                  <option *ngFor="let r of vm.recetteOpsIndex(); let i = index" [value]="i">
                    {{ r.nom }}
                  </option>
                </select>
              </div>
            </div>

            <div class="ops-cards" *ngIf="vm.selectedRecetteOpsData() as ops">
              <div class="ops-recette-header">
                <span class="ops-recette-name">{{ ops.nom }}</span>
                <span class="ops-recette-count">
                  {{ ops.ops.length }} {{ vm.t().plannerOpsOperationSuffix }}{{ ops.ops.length !== 1 ? 's' : '' }}
                </span>
                <span class="ops-recette-total">
                  {{ vm.t().plannerOpsTotal }} : {{ vm.getTotalDuration(ops.ops) }} min
                </span>
              </div>
              <div class="ops-grid">
                <div class="ops-op-card" *ngFor="let op of ops.ops; let i = index">
                  <div class="ops-op-header">
                    <span class="ops-op-index">{{ i + 1 }}</span>
                    <span class="ops-op-name">{{ op.nomOperation }}</span>
                    <span class="ops-op-duration">{{ op.dureeMinutes }} min</span>
                  </div>
                  <div class="ops-op-bar-track">
                    <div class="ops-op-bar-fill"
                         [style.width.%]="vm.getMaxOpDuration() > 0 ? (op.dureeMinutes / vm.getMaxOpDuration()) * 100 : 0"
                         [style.background]="'linear-gradient(90deg, #0ea5e9, #06b6d4)'">
                    </div>
                  </div>
                  <div class="ops-op-footer">
                    <span class="ops-op-pct">
                      {{ vm.getMaxOpDuration() > 0 ? ((op.dureeMinutes / vm.getMaxOpDuration()) * 100).toFixed(0) : 0 }}%
                      {{ vm.t().plannerOpsPctDureeMax }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="empty-state" *ngIf="!vm.selectedRecetteOpsData()">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" style="margin-bottom:12px">
                <rect x="3" y="3" width="18" height="18" rx="3"/><line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="9" y1="21" x2="9" y2="9"/>
              </svg>
              <p>{{ vm.t().plannerOpsEmptyHint }}</p>
            </div>
          </div>
        </div>

        <!-- ── Deadline-Compliance Report ──────────────────────────────────── -->
        <div class="compliance-section">

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

    </div>
  `,
  styles: [`
    .dashboard {
      padding: 24px;
      background: linear-gradient(135deg, #f5f7fa 0%, #e6ecf7 100%);
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    }

    .dashboard.planner-dash {
      --primary: #0ea5e9;
      --primary-light: #06b6d4;
      --accent-1: #0f766e;
      --accent-2: #7e22ce;
      --accent-3: #ea580c;
    }

    /* ── WELCOME BANNER ──────────────────────────────────────────────────── */
    .welcome-banner {
      position: relative;
      margin-bottom: 32px;
      padding: 28px;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .welcome-banner.planner-banner {
      background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #0f766e 100%);
      color: white;
    }

    .banner-gradient {
      position: absolute;
      top: -50%; right: -50%;
      width: 400px; height: 400px;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      border-radius: 50%;
    }

    .banner-content {
      position: relative; z-index: 2;
      display: flex; justify-content: space-between; align-items: center; gap: 40px;
    }

    .banner-left { display: flex; align-items: center; gap: 20px; flex: 1; }

    .banner-text h2 { margin: 0; font-size: 24px; font-weight: 600; color: white; }
    .banner-greeting { margin: 0; font-size: 14px; opacity: 0.9; text-transform: capitalize; }
    .banner-role { margin: 4px 0 0 0; font-size: 13px; opacity: 0.85; font-weight: 500; }

    /* ── HEADER ──────────────────────────────────────────────────────────── */
    .dash-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 28px;
    }

    .dash-title { margin: 0; font-size: 28px; font-weight: 700; color: #1e293b; }
    .dash-subtitle { margin: 4px 0 0 0; font-size: 14px; color: #64748b; }

    .header-right { display: flex; align-items: center; gap: 12px; }

    .dash-date {
      padding: 8px 14px; background: white; border-radius: 8px;
      font-size: 13px; color: #475569; font-weight: 500;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .refresh-btn {
      width: 40px; height: 40px;
      display: flex; align-items: center; justify-content: center;
      border: none; background: white; border-radius: 8px;
      cursor: pointer; color: #64748b; transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .refresh-btn:hover { background: #f1f5f9; color: #0ea5e9; transform: rotate(180deg); }

    /* ── NOTIFICATION BELL ───────────────────────────────────────────────── */
    .notif-wrapper { position: relative; }

    .notif-bell-btn {
      position: relative;
      width: 40px; height: 40px;
      display: flex; align-items: center; justify-content: center;
      border: none; background: white; border-radius: 8px;
      cursor: pointer; color: #64748b; transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .notif-bell-btn:hover { background: #f1f5f9; color: #0ea5e9; }
    .notif-bell-btn.notif-bell-active {
      background: #eff6ff; color: #0ea5e9;
      box-shadow: 0 0 0 2px rgba(14,165,233,0.25);
    }

    .notif-badge {
      position: absolute; top: -5px; right: -5px;
      min-width: 18px; height: 18px; border-radius: 9px;
      background: #dc2626; color: white;
      font-size: 10px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      padding: 0 4px; border: 2px solid white;
      animation: badge-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes badge-pop {
      from { transform: scale(0); } to { transform: scale(1); }
    }

    /* ── NOTIFICATION PANEL ──────────────────────────────────────────────── */
    .notif-panel {
      position: absolute; top: calc(100% + 10px); right: 0;
      width: 380px; z-index: 1000;
      background: white; border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 12px 40px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.08);
      animation: panel-in 0.2s ease;
      overflow: hidden;
    }

    @keyframes panel-in {
      from { opacity: 0; transform: translateY(-8px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0)   scale(1); }
    }

    .notif-panel-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px 12px;
      border-bottom: 1px solid #f1f5f9;
      background: linear-gradient(135deg, #f8fafc, #f1f5f9);
    }

    .notif-panel-title-row { display: flex; align-items: center; gap: 8px; }

    .notif-panel-icon-wrap {
      width: 28px; height: 28px;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #0ea5e9, #06b6d4);
      color: white; border-radius: 6px; flex-shrink: 0;
    }

    .notif-panel-title { font-size: 14px; font-weight: 700; color: #1e293b; }

    .notif-panel-count {
      padding: 2px 8px; background: #fee2e2; color: #991b1b;
      border-radius: 10px; font-size: 11px; font-weight: 700;
    }

    .notif-panel-close {
      width: 26px; height: 26px;
      display: flex; align-items: center; justify-content: center;
      border: none; background: transparent; border-radius: 6px;
      cursor: pointer; color: #94a3b8; transition: all 0.15s;
    }
    .notif-panel-close:hover { background: #f1f5f9; color: #475569; }

    .notif-filter-row {
      display: flex; gap: 6px; padding: 10px 16px 8px;
      border-bottom: 1px solid #f1f5f9; flex-wrap: wrap;
    }

    .notif-pill {
      display: flex; align-items: center; gap: 4px;
      padding: 4px 10px; border-radius: 20px;
      border: 1px solid #e2e8f0; background: transparent;
      font-size: 12px; color: #64748b; cursor: pointer; transition: all 0.12s;
      font-family: inherit;
    }
    .notif-pill:hover { background: #f8fafc; border-color: #94a3b8; }
    .notif-pill.notif-pill-active { background: #f1f5f9; color: #1e293b; border-color: #94a3b8; font-weight: 600; }
    .notif-pill.notif-pill-critical.notif-pill-active { background: #fee2e2; color: #991b1b; border-color: #fca5a5; }
    .notif-pill.notif-pill-warning.notif-pill-active  { background: #fef3c7; color: #92400e; border-color: #fcd34d; }
    .notif-pill.notif-pill-inactive.notif-pill-active { background: #f1f5f9; color: #374151; border-color: #94a3b8; }

    .notif-pill-count {
      min-width: 16px; height: 16px; border-radius: 8px;
      background: rgba(0,0,0,0.08); color: inherit;
      font-size: 10px; font-weight: 700;
      display: flex; align-items: center; justify-content: center; padding: 0 3px;
    }

    /* ── PANEL INLINE ERROR (bottleneck panel + delay alerts panel) ──────── */
    .panel-inline-error {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 12px; margin: 0 8px 0;
      border-radius: 6px; font-size: 12px; line-height: 1.4;
      color: #b91c1c; background: #fef2f2; border: 1px solid #fecaca;
    }
    /* block variant sits outside the notif-panel (delay-alerts section) */
    .panel-inline-error--block {
      margin: 0 0 12px 0; font-size: 13px; border-radius: 8px;
    }
    .panel-inline-error span { flex: 1; }
    .panel-inline-error-close {
      margin-left: auto; background: none; border: none;
      cursor: pointer; font-size: 11px; color: #b91c1c;
      opacity: 0.7; padding: 0 2px; line-height: 1; flex-shrink: 0;
    }
    .panel-inline-error-close:hover { opacity: 1; }

    .notif-list { max-height: 320px; overflow-y: auto; }
    .notif-list::-webkit-scrollbar { width: 4px; }
    .notif-list::-webkit-scrollbar-track { background: transparent; }
    .notif-list::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }

    .notif-item {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 12px 16px; border-bottom: 1px solid #f8fafc;
      transition: background 0.12s; position: relative;
    }
    .notif-item:last-child { border-bottom: none; }
    .notif-item:hover { background: #f8fafc; }
    .notif-item.notif-item-critical { border-left: 3px solid #dc2626; }
    .notif-item.notif-item-warning  { border-left: 3px solid #f59e0b; }

    .notif-item-icon {
      width: 30px; height: 30px; border-radius: 7px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .notif-item-icon.icon-critical { background: #fee2e2; color: #dc2626; }
    .notif-item-icon.icon-warning  { background: #fef3c7; color: #d97706; }

    .notif-item-body { flex: 1; min-width: 0; }

    .notif-item-top {
      display: flex; align-items: center; gap: 6px;
      margin-bottom: 3px; flex-wrap: wrap;
    }

    .notif-item-name { font-size: 13px; font-weight: 600; color: #1e293b; }

    .notif-item-tag {
      font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;
      text-transform: uppercase; letter-spacing: 0.3px;
    }
    .notif-item-tag.tag-overloaded { background: #fee2e2; color: #991b1b; }
    .notif-item-tag.tag-underused  { background: #fef3c7; color: #92400e; }
    .notif-item-tag.tag-inactive   { background: #f1f5f9; color: #475569; }

    .notif-item-msg { margin: 0 0 6px; font-size: 12px; color: #475569; line-height: 1.4; }
    .notif-item-detail { margin: 0 0 4px; font-size: 11px; color: #94a3b8; }

    .notif-item-bar-row { display: flex; align-items: center; gap: 8px; }

    .notif-item-bar {
      flex: 1; height: 5px; background: #e2e8f0; border-radius: 3px;
      overflow: visible; position: relative;
    }

    .notif-item-bar-fill {
      height: 100%; border-radius: 3px; transition: width 0.4s ease;
    }
    .notif-item-bar-fill.bar-critical { background: linear-gradient(90deg, #ef4444, #dc2626); }
    .notif-item-bar-fill.bar-warning  { background: linear-gradient(90deg, #fbbf24, #f59e0b); }
    .notif-item-bar-fill.bar-underuse { background: linear-gradient(90deg, #94a3b8, #64748b); }
    .notif-item-bar-fill.bar-inactive { background: #e2e8f0; width: 100% !important; background-image: repeating-linear-gradient(90deg, #cbd5e1 0px, #cbd5e1 4px, transparent 4px, transparent 8px); }

    .notif-bar-threshold {
      position: absolute; top: -3px; left: 85%;
      width: 2px; height: 11px; background: #dc2626;
      border-radius: 1px; opacity: 0.6;
    }

    .notif-item-pct { font-size: 12px; font-weight: 700; white-space: nowrap; }
    .notif-item-pct.pct-critical { color: #dc2626; }
    .notif-item-pct.pct-warning  { color: #d97706; }

    .notif-item-dismiss {
      width: 22px; height: 22px;
      display: flex; align-items: center; justify-content: center;
      border: none; background: transparent; border-radius: 5px;
      cursor: pointer; color: #94a3b8; flex-shrink: 0; transition: all 0.12s;
      margin-top: 2px;
    }
    .notif-item-dismiss:hover { background: #f1f5f9; color: #475569; }

    .notif-empty {
      padding: 28px 16px; text-align: center;
      color: #10b981; font-weight: 600; font-size: 13px;
      display: flex; flex-direction: column; align-items: center; gap: 8px;
    }

    .notif-panel-footer {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 16px; border-top: 1px solid #f1f5f9;
      background: #f8fafc;
    }

    .notif-footer-summary { font-size: 12px; color: #64748b; }

    .notif-dismiss-all-btn {
      font-size: 12px; color: #64748b; background: transparent;
      border: 1px solid #e2e8f0; border-radius: 5px;
      cursor: pointer; padding: 4px 10px; transition: all 0.15s; font-family: inherit;
    }
    .notif-dismiss-all-btn:hover { background: #f1f5f9; border-color: #94a3b8; color: #374151; }

    /* ── ERROR ───────────────────────────────────────────────────────────── */
    .dash-error {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 16px; margin-bottom: 20px;
      background: #fee2e2; border-left: 4px solid #dc2626;
      border-radius: 8px; color: #991b1b; font-size: 14px;
    }

    /* ── KPI GRID ────────────────────────────────────────────────────────── */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px; margin-bottom: 36px;
    }

    .kpi-card {
      padding: 20px; background: white; border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      transition: all 0.3s ease; border-left: 4px solid #e2e8f0; position: relative;
    }
    .kpi-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.12); transform: translateY(-2px); }

    .kpi-card.kpi-accent-cyan   { border-left-color: #06b6d4; }
    .kpi-card.kpi-accent-blue   { border-left-color: #0ea5e9; }
    .kpi-card.kpi-accent-teal   { border-left-color: #0f766e; }
    .kpi-card.kpi-accent-orange { border-left-color: #ea580c; }
    .kpi-card.kpi-accent-red    { border-left-color: #dc2626; }
    .kpi-card.kpi-accent-purple { border-left-color: #7e22ce; }
    .kpi-card.kpi-alert { background: linear-gradient(135deg, #fff7ed 0%, #fee2e2 100%); }

    .kpi-icon {
      width: 48px; height: 48px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 10px; margin-bottom: 12px; color: white;
    }
    .kpi-cyan   { background: linear-gradient(135deg, #06b6d4, #0ea5e9); }
    .kpi-blue   { background: linear-gradient(135deg, #0ea5e9, #3b82f6); }
    .kpi-teal   { background: linear-gradient(135deg, #0f766e, #14b8a6); }
    .kpi-orange { background: linear-gradient(135deg, #ea580c, #f97316); }
    .kpi-red    { background: linear-gradient(135deg, #dc2626, #ef4444); }
    .kpi-purple { background: linear-gradient(135deg, #7e22ce, #a855f7); }

    .kpi-content { margin-bottom: 12px; }
    .kpi-value { display: block; font-size: 28px; font-weight: 700; color: #1e293b; margin-bottom: 4px; letter-spacing: -0.5px; }
    .kpi-label { display: block; font-size: 13px; color: #64748b; font-weight: 500; margin-bottom: 10px; }
    .kpi-pills { display: flex; flex-wrap: wrap; gap: 8px; }

    .pill { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
    .pill-cyan   { background: #cffafe; color: #0c4a6e; }
    .pill-blue   { background: #dbeafe; color: #0c2d78; }
    .pill-orange { background: #ffedd5; color: #7c2d12; }
    .pill-red    { background: #fee2e2; color: #7f1d1d; }
    .pill-green  { background: #dcfce7; color: #15803d; }
    .pill-purple { background: #f3e8ff; color: #4c1d95; }
    .pill-gray   { background: #f1f5f9; color: #475569; }

    .kpi-progress-bar { width: 100%; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; margin: 8px 0; }
    .kpi-progress-fill { height: 100%; transition: width 0.4s ease; border-radius: 3px; }
    .fill-good { background: linear-gradient(90deg, #10b981, #34d399); }
    .fill-warn { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
    .fill-bad  { background: linear-gradient(90deg, #ef4444, #f87171); }

    .kpi-trend { display: flex; align-items: center; gap: 4px; font-size: 12px; }
    .trend-label       { color: #64748b; font-weight: 600; }
    .trend-label.green { color: #10b981; }
    .text-red { color: #dc2626 !important; }

    .kpi-card.skeleton {
      background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%);
      background-size: 200% 100%;
      animation: skeleton-loading 2s infinite;
    }
    @keyframes skeleton-loading {
      0%   { background-position:  200% 0; }
      100% { background-position: -200% 0; }
    }

    /* ── DELAY ALERTS ────────────────────────────────────────────────────── */
    .alerts-section { margin-bottom: 32px; animation: fadeIn 0.4s ease; }

    .alerts-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 16px; flex-wrap: wrap; gap: 12px;
    }

    .alerts-title-group { display: flex; align-items: center; gap: 10px; }

    .alerts-icon-wrap {
      width: 36px; height: 36px;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #dc2626, #ef4444);
      color: white; border-radius: 8px; flex-shrink: 0;
    }

    .alerts-title { margin: 0; font-size: 16px; font-weight: 700; color: #1e293b; }

    .alerts-count-badge {
      padding: 3px 10px; background: #fee2e2; color: #991b1b;
      border-radius: 20px; font-size: 12px; font-weight: 700;
    }

    .alerts-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .alerts-filter-group { display: flex; gap: 6px; flex-wrap: wrap; }

    .alerts-dismiss-btn {
      padding: 7px 14px; border: 1px solid #e2e8f0; border-radius: 6px;
      background: white; font-size: 12px; font-weight: 600;
      color: #64748b; cursor: pointer; transition: all 0.2s;
    }
    .alerts-dismiss-btn:hover { background: #f1f5f9; border-color: #94a3b8; color: #374151; }

    .alerts-list { display: flex; flex-direction: column; gap: 10px; }

    .alert-item {
      display: flex; align-items: flex-start; gap: 14px;
      padding: 14px 16px; background: white;
      border-radius: 10px; border-left: 4px solid #e2e8f0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05); transition: all 0.25s ease;
    }
    .alert-item:hover { transform: translateX(2px); box-shadow: 0 4px 16px rgba(0,0,0,0.09); }

    .alert-item.alert-critical { border-left-color: #dc2626; background: linear-gradient(135deg, #fff5f5, #fff 60%); }
    .alert-item.alert-warning  { border-left-color: #f59e0b; background: linear-gradient(135deg, #fffbeb, #fff 60%); }
    .alert-item.alert-info     { border-left-color: #0ea5e9; background: linear-gradient(135deg, #f0f9ff, #fff 60%); }

    .alert-severity-icon {
      width: 36px; height: 36px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 8px; flex-shrink: 0;
    }
    .alert-critical .alert-severity-icon { background: #fee2e2; color: #dc2626; }
    .alert-warning  .alert-severity-icon { background: #fef3c7; color: #d97706; }
    .alert-info     .alert-severity-icon { background: #dbeafe; color: #0369a1; }

    .alert-body { flex: 1; min-width: 0; }

    .alert-top-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap; }

    .alert-commande-id { font-size: 13px; font-weight: 700; color: #1e293b; font-family: monospace; }

    .alert-severity-label {
      font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px;
      text-transform: uppercase; letter-spacing: 0.4px;
    }
    .label-critical { background: #fee2e2; color: #991b1b; }
    .label-warning  { background: #fef3c7; color: #92400e; }
    .label-info     { background: #dbeafe; color: #1e40af; }

    .alert-message { margin: 0 0 8px 0; font-size: 13px; color: #374151; line-height: 1.5; }

    .alert-meta { display: flex; gap: 14px; flex-wrap: wrap; }

    .alert-meta-item {
      display: flex; align-items: center; gap: 4px;
      font-size: 12px; color: #64748b; font-weight: 500;
    }
    .alert-meta-item.meta-overdue { color: #dc2626; font-weight: 700; }
    .alert-meta-item strong { color: #1e293b; }

    .alert-dismiss {
      width: 28px; height: 28px;
      display: flex; align-items: center; justify-content: center;
      border: none; background: transparent; border-radius: 6px;
      cursor: pointer; color: #94a3b8; flex-shrink: 0; transition: all 0.15s;
    }
    .alert-dismiss:hover { background: #f1f5f9; color: #475569; }

    .alerts-empty {
      padding: 32px; text-align: center; color: #10b981;
      font-weight: 600; font-size: 14px; background: #f0fdf4; border-radius: 10px;
      display: flex; flex-direction: column; align-items: center; gap: 10px;
    }

    /* ── CHARTS ──────────────────────────────────────────────────────────── */
    .charts-section { animation: fadeIn 0.4s ease; }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .charts-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px; margin-bottom: 20px;
    }

    .chart-card {
      background: white; border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    }

    .chart-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 16px; flex-wrap: wrap; gap: 8px;
    }

    .chart-title { margin: 0; font-size: 15px; font-weight: 700; color: #1e293b; }

    .chart-badge {
      padding: 4px 10px; background: #f1f5f9; color: #475569;
      border-radius: 12px; font-size: 12px; font-weight: 600;
    }

    .chart-controls { display: flex; gap: 8px; align-items: center; }

    .chart-filter {
      padding: 6px 10px; border: 1px solid #e2e8f0; border-radius: 7px;
      font-size: 12px; color: #374151; background: white; cursor: pointer; outline: none;
    }
    .chart-filter:focus { border-color: #0ea5e9; }

    .chart-body { position: relative; height: 240px; }

    /* ── OPS INDEX ───────────────────────────────────────────────────────── */
    .ops-cards { margin-top: 12px; }

    .ops-recette-header {
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 14px; padding-bottom: 10px;
      border-bottom: 1px solid #f1f5f9; flex-wrap: wrap;
    }

    .ops-recette-name { font-size: 15px; font-weight: 700; color: #1e293b; flex: 1; }
    .ops-recette-count { font-size: 12px; color: #64748b; font-weight: 500; }
    .ops-recette-total { font-size: 12px; color: #0ea5e9; font-weight: 600; }

    .ops-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }

    .ops-op-card {
      background: #f8fafc; border-radius: 10px;
      padding: 12px 14px; border: 1px solid #e2e8f0;
    }

    .ops-op-header {
      display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
    }

    .ops-op-index {
      width: 22px; height: 22px; border-radius: 50%;
      background: #1e293b; color: white;
      font-size: 11px; font-weight: 700;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }

    .ops-op-name { font-size: 13px; font-weight: 600; color: #1e293b; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .ops-op-duration { font-size: 12px; color: #0ea5e9; font-weight: 700; white-space: nowrap; }

    .ops-op-bar-track { width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin-bottom: 6px; }
    .ops-op-bar-fill  { height: 100%; border-radius: 4px; transition: width 0.5s cubic-bezier(0.4,0,0.2,1); min-width: 4px; }

    .ops-op-footer { display: flex; justify-content: flex-end; }
    .ops-op-pct    { font-size: 11px; color: #94a3b8; font-weight: 500; }

    .empty-state { padding: 40px 20px; text-align: center; color: #94a3b8; font-size: 14px; }

    /* ── COMPLIANCE REPORT SECTION ──────────────────────────────────────── */
    .compliance-section {
      margin-top: 32px;
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }

    .compliance-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      gap: 16px; flex-wrap: wrap; margin-bottom: 20px;
    }

    .compliance-title-group { display: flex; align-items: center; gap: 12px; }

    .compliance-icon-wrap {
      width: 40px; height: 40px; border-radius: 10px;
      background: linear-gradient(135deg, #0ea5e9, #0f766e);
      display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0;
    }

    .compliance-title  { margin: 0; font-size: 18px; font-weight: 700; color: #1e293b; }
    .compliance-subtitle { margin: 2px 0 0 0; font-size: 13px; color: #64748b; }

    .compliance-filters { display: flex; align-items: flex-end; gap: 10px; flex-wrap: wrap; }

    .compliance-date-group { display: flex; flex-direction: column; gap: 4px; }
    .compliance-date-label { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: .04em; }

    .compliance-date-input {
      padding: 7px 10px; border: 1px solid #e2e8f0; border-radius: 8px;
      font-size: 13px; color: #1e293b; background: #f8fafc; outline: none; cursor: pointer;
      transition: border-color .15s;
    }
    .compliance-date-input:focus { border-color: #0ea5e9; background: white; }

    .compliance-run-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 16px; background: linear-gradient(135deg, #0ea5e9, #06b6d4);
      color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600;
      cursor: pointer; transition: opacity .15s; white-space: nowrap; font-family: inherit;
    }
    .compliance-run-btn:hover:not(:disabled) { opacity: 0.88; }
    .compliance-run-btn:disabled { opacity: 0.55; cursor: not-allowed; }

    .compliance-error {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 14px; background: #fef2f2; border: 1px solid #fecaca;
      border-radius: 8px; color: #991b1b; font-size: 13px; margin-bottom: 16px;
    }

    /* KPI strip */
    .compliance-kpi-strip {
      display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px;
    }

    .compliance-kpi {
      flex: 1; min-width: 130px; padding: 14px 16px;
      background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;
      display: flex; flex-direction: column; gap: 4px;
    }

    .compliance-kpi-rate    { border-left: 4px solid #0ea5e9; }
    .compliance-kpi-rate.rate-great { border-left-color: #10b981; }
    .compliance-kpi-rate.rate-warn  { border-left-color: #f59e0b; }
    .compliance-kpi-rate.rate-bad   { border-left-color: #ef4444; }
    .compliance-kpi-ontime  { border-left: 4px solid #10b981; }
    .compliance-kpi-late    { border-left: 4px solid #ef4444; }
    .compliance-kpi-pending { border-left: 4px solid #f59e0b; }
    .compliance-kpi-variance{ border-left: 4px solid #8b5cf6; }

    .ckpi-value { font-size: 22px; font-weight: 800; color: #1e293b; line-height: 1; }
    .ckpi-label { font-size: 11px; color: #64748b; font-weight: 500; text-transform: uppercase; letter-spacing: .04em; }

    .ckpi-bar-track { height: 4px; background: #e2e8f0; border-radius: 2px; overflow: hidden; margin-top: 6px; }
    .ckpi-bar-fill  { height: 100%; border-radius: 2px; transition: width .5s ease; }
    .rate-fill { background: linear-gradient(90deg, #10b981, #0ea5e9); }

    .ckpi-icon-wrap {
      width: 28px; height: 28px; border-radius: 7px;
      display: flex; align-items: center; justify-content: center; margin-bottom: 4px;
    }
    .ckpi-green  { background: #d1fae5; color: #065f46; }
    .ckpi-red    { background: #fee2e2; color: #991b1b; }
    .ckpi-orange { background: #fef3c7; color: #92400e; }

    .ckpi-variance-hint { font-size: 10px; color: #94a3b8; }
    .compliance-kpi-variance.var-positive .ckpi-value { color: #dc2626; }
    .compliance-kpi-variance.var-negative .ckpi-value { color: #059669; }

    /* Body: chart + table */
    .compliance-body {
      display: grid; grid-template-columns: 320px 1fr; gap: 16px;
    }

    @media (max-width: 900px) { .compliance-body { grid-template-columns: 1fr; } }

    .compliance-row-filters { display: flex; gap: 6px; flex-wrap: wrap; }

    /* Table */
    .compliance-table-scroll { overflow-x: auto; max-height: 320px; overflow-y: auto; margin-top: 8px; }

    .compliance-table { width: 100%; border-collapse: collapse; font-size: 13px; }

    .compliance-table thead th {
      position: sticky; top: 0;
      padding: 10px 12px; text-align: left;
      background: #f8fafc; font-size: 11px; font-weight: 700; color: #64748b;
      text-transform: uppercase; letter-spacing: .04em;
      border-bottom: 1px solid #e2e8f0; white-space: nowrap;
    }
    .compliance-table tbody tr {
      border-bottom: 1px solid #f1f5f9; transition: background .12s;
    }
    .compliance-table tbody tr:hover { background: #f8fafc; }
    .compliance-table td { padding: 9px 12px; color: #374151; vertical-align: middle; }

    .row-late    { background: #fff5f5; }
    .row-ontime  { background: #f0fdf4; }
    .row-pending { background: #fffbeb; }

    .row-num     { font-weight: 600; color: #1e293b; }
    .row-qty     { font-size: 11px; color: #94a3b8; margin-left: 4px; }
    .row-recette { max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #475569; }
    .row-date    { white-space: nowrap; color: #475569; }
    .row-variance{ white-space: nowrap; font-weight: 600; }
    .var-late    { color: #dc2626; }
    .var-early   { color: #059669; }

    .compliance-badge {
      display: inline-block; padding: 3px 10px; border-radius: 12px;
      font-size: 11px; font-weight: 700; white-space: nowrap;
    }
    .badge-ontime  { background: #d1fae5; color: #065f46; }
    .badge-late    { background: #fee2e2; color: #991b1b; }
    .badge-pending { background: #fef3c7; color: #92400e; }

    .table-empty {
      text-align: center; color: #94a3b8; padding: 24px 12px !important; font-style: italic;
    }

    /* Empty state */
    .compliance-empty {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 40px; gap: 12px; color: #94a3b8; text-align: center;
    }
    .compliance-empty p { font-size: 14px; margin: 0; }

    /* Spinner */
    @keyframes spin { to { transform: rotate(360deg); } }
    .spin { animation: spin .8s linear infinite; transform-origin: center; }

    /* ── RESPONSIVE ──────────────────────────────────────────────────────── */
    @media (max-width: 1200px) { .charts-row { grid-template-columns: 1fr; } }

    @media (max-width: 768px) {
      .dashboard { padding: 16px; }
      .welcome-banner { padding: 20px; }
      .banner-content { flex-direction: column; gap: 16px; }
      .banner-left { width: 100%; }
      .kpi-grid { grid-template-columns: 1fr; gap: 12px; }
      .chart-body { height: 250px; }
      .notif-panel { width: calc(100vw - 32px); right: -60px; }
    }
  `]
})
export class PlannerDashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  // ── Canvas refs ──────────────────────────────────────────────────────────
  @ViewChild('planningChart',   { static: false }) planningChartRef?:   ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChart',     { static: false }) statusChartRef?:     ElementRef<HTMLCanvasElement>;
  @ViewChild('machineChart',    { static: false }) machineChartRef?:    ElementRef<HTMLCanvasElement>;
  @ViewChild('makespanChart',   { static: false }) makespanChartRef?:   ElementRef<HTMLCanvasElement>;
  @ViewChild('recetteChart',    { static: false }) recetteChartRef?:    ElementRef<HTMLCanvasElement>;
  @ViewChild('complianceChart', { static: false }) complianceChartRef?: ElementRef<HTMLCanvasElement>;

  // ── ViewModel (all data & state) ─────────────────────────────────────────
  readonly vm  = inject(PlannerDashboardViewModel);
  private  cdr = inject(ChangeDetectorRef);

  private charts = new Map<string, Chart>();

  // ── Lifecycle ────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.vm.loadData().then(() => {
      this.cdr.markForCheck();
      setTimeout(() => this.renderCharts('all'), 0);
    });
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void { this.destroyAllCharts(); }

  // ── Public handlers ──────────────────────────────────────────────────────

  /** Full reload: re-fetches all data (commandes, machines, plannings) + charts. */
  reload(): void {
    this.vm.loadData().then(() => {
      this.cdr.markForCheck();
      setTimeout(() => this.renderCharts('all'), 0);
    });
  }

  /**
   * Alert-only refresh: calls POST /api/Alerts/refresh to recompute alerts
   * from the latest backend data, then updates the view without re-rendering charts.
   */
  refreshAlerts(): void {
    this.vm.refreshAlerts().then(() => this.cdr.markForCheck());
  }

  onPlanningFilterChange(val: string): void {
    this.vm.planningFilter.set(+val);
    this.renderCharts('planning');
  }

  countByType(type: 'overloaded' | 'underused' | 'inactive'): number {
    return this.vm.bottleneckAlerts().filter(a => a.type === type).length;
  }

  async loadComplianceReport(): Promise<void> {
    await this.vm.loadComplianceReport();
    setTimeout(() => this._renderComplianceChart(), 0);
  }

  // ── Chart Rendering ──────────────────────────────────────────────────────

  renderCharts(key: string): void {
    const { cmd = [], mach = [], plan = [], rec = [] } = this.vm.rawData();
    if (!plan.length && !cmd.length && !mach.length) return;

    const base = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' as const, labels: { padding: 16, font: { size: 12, weight: 500 } } },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.7)', padding: 10,
          titleFont: { size: 13, weight: 600 }, bodyFont: { size: 12 },
        },
      },
    };

    const axis = (title: string) => ({
      title: { display: !!title, text: title, font: { size: 12, weight: 600 as const }, color: '#475569', padding: { bottom: 8 } },
      ticks: { font: { size: 11 }, color: '#64748b' },
      grid: { color: 'rgba(100,116,139,0.10)', drawBorder: false },
      border: { dash: [4, 4] },
    });

    const C = {
      CYAN: '#06b6d4', BLUE: '#0ea5e9', TEAL: '#0f766e', ORANGE: '#ea580c',
      RED: '#dc2626', PURPLE: '#7e22ce', GREEN: '#10b981', PINK: '#ec4899',
      INDIGO: '#4f46e5', LIME: '#84cc16', YELLOW: '#eab308',
    };

    // 1 · Planning Timeline ────────────────────────────────────────────────
    if ((key === 'planning' || key === 'all') && this.planningChartRef?.nativeElement) {
      const sorted  = [...plan].sort((a: any, b: any) => a.id - b.id);
      const pf      = this.vm.planningFilter();
      const slice   = pf === 0 ? sorted : sorted.slice(-pf);
      const canvas  = this.planningChartRef.nativeElement;
      const ctx2d   = canvas.getContext('2d')!;
      const grad    = ctx2d.createLinearGradient(0, 0, 0, 250);
      grad.addColorStop(0, 'rgba(6,182,212,0.4)');
      grad.addColorStop(1, 'rgba(6,182,212,0)');

      const toMin    = (p: any) => Math.round(+(p.makespanDays ?? 0) * 1440);
      const dl       = this.vm.t().planningKpiMakespanDay;
      const hl       = this.vm.t().planningKpiMakespanHour;
      const fmtMin   = (min: number) => {
        if (min <= 0) return `0${dl}`;
        const d = Math.floor(min / 1440), h = Math.floor((min % 1440) / 60);
        if (d === 0) return `${h}${hl}`;
        if (h === 0) return `${d}${dl}`;
        return `${d}${dl} ${h}${hl}`;
      };

      this.destroyChart('planning');
      this.charts.set('planning', new Chart(canvas, {
        type: 'line',
        data: {
          labels: slice.map((_: any, i: number) => `P${i + 1}`),
          datasets: [{
            label: this.vm.t().plannerChartMakespanDataset,
            data: slice.map((p: any) => toMin(p)),
            borderColor: C.CYAN, borderWidth: 3,
            backgroundColor: grad, fill: true, tension: 0.4, pointRadius: 6,
            pointBackgroundColor: '#fff', pointBorderColor: C.CYAN, pointBorderWidth: 2,
          }],
        },
        options: {
          ...base,
          scales: {
            x: { ...axis(this.vm.t().dashboardAxisPlanning), ticks: { font: { size: 10 }, color: '#94a3b8', maxRotation: 45 } },
            y: { beginAtZero: true, ...axis(this.vm.t().plannerChartAxisDuree), ticks: { font: { size: 11 }, color: '#64748b', callback: (v: any) => fmtMin(v as number) } },
          },
          plugins: { ...base.plugins, tooltip: { ...base.plugins.tooltip, callbacks: { label: (ctx: any) => ` ${fmtMin(ctx.parsed.y)}` } } },
        } as any,
      }));
    }

    // 2 · Commandes Status (Donut) ─────────────────────────────────────────
    if ((key === 'status' || key === 'all') && this.statusChartRef?.nativeElement) {
      const norm = (s: string) => (s ?? '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const statuses = [
        { label: this.vm.t().statutEnAttente, count: cmd.filter((c: any) => { const n = norm(c.statut); return !c.statut || n === '' || n === 'attente' || n === 'en attente'; }).length, color: C.ORANGE },
        { label: this.vm.t().statutEnCours,   count: cmd.filter((c: any) => norm(c.statut) === 'en cours').length,  color: C.BLUE  },
        { label: this.vm.t().statutTermine,   count: cmd.filter((c: any) => { const n = norm(c.statut); return n === 'termine' || n === 'livre'; }).length,   color: C.CYAN  },
        { label: this.vm.t().statutAnnule,    count: cmd.filter((c: any) => { const n = norm(c.statut); return n === 'annule' || n === 'annule'; }).length,    color: C.GREEN },
      ];

      this.destroyChart('status');
      this.charts.set('status', new Chart(this.statusChartRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: statuses.map(s => s.label),
          datasets: [{ data: statuses.map(s => s.count), backgroundColor: statuses.map(s => s.color), borderColor: 'white', borderWidth: 3, hoverOffset: 8 }],
        },
        options: {
          ...base,
          plugins: {
            ...base.plugins,
            legend: { position: 'right' as const, labels: { padding: 16, font: { size: 12 }, usePointStyle: true, pointStyleWidth: 10 } },
            tooltip: { ...base.plugins.tooltip, callbacks: { label: (ctx: any) => { const pct = cmd.length ? Math.round(ctx.parsed / cmd.length * 100) : 0; return ` ${ctx.parsed} commande${ctx.parsed !== 1 ? 's' : ''} — ${pct}%`; } } },
          },
        } as any,
      }));
    }

    // 3 · Machine Workload (Donut) ─────────────────────────────────────────
    if ((key === 'machine' || key === 'all') && this.machineChartRef?.nativeElement) {
      const loadPctById: Record<number, number> = {};
      const lastRows: any[] = this.vm.lastPlanningResult()?.rows ?? [];
      if (lastRows.length > 0) {
        const scheduled: Record<number, number> = {};
        const starts: Record<number, number[]> = {};
        const ends: Record<number, number[]> = {};
        for (const r of lastRows) {
          const mid = r.machineId ?? r.MachineId;
          const dur = r.dureeMinutes ?? r.DureeMinutes ?? 0;
          const spm = r.startPM ?? r.StartPM;
          const epm = r.endPM   ?? r.EndPM;
          if (mid == null) continue;
          scheduled[mid] = (scheduled[mid] ?? 0) + dur;
          if (spm != null && spm > 0) { starts[mid] = starts[mid] ?? []; starts[mid].push(spm); }
          if (epm != null && epm > 0) { ends[mid]   = ends[mid]   ?? []; ends[mid].push(epm);   }
        }
        for (const [midStr, sched] of Object.entries(scheduled)) {
          const mid = Number(midStr);
          const s = starts[mid], e = ends[mid];
          const span = (s?.length && e?.length) ? Math.max(...e) - Math.min(...s) : 1440;
          const cap  = Math.max(1, Math.ceil(span / 1440)) * 1440;
          loadPctById[mid] = Math.round((sched / cap) * 100);
        }
      } else {
        mach.forEach((m: any) => {
          const st = (m.statut ?? '').toLowerCase();
          loadPctById[m.id] = (st === 'non fonctionnel' || st === 'en panne' || st === 'maintenance') ? 0 : 60;
        });
      }

      const workload = mach
        .map((m: any) => ({ nom: m.nomMachine ?? `Machine ${m.id}`, charge: loadPctById[m.id] ?? 0 }))
        .filter((w: any) => w.charge > 0)
        .sort((a: any, b: any) => b.charge - a.charge);
      const palBase = [C.CYAN, C.BLUE, C.TEAL, C.PURPLE, C.ORANGE, C.GREEN, C.PINK, C.INDIGO, C.LIME, C.YELLOW,
                       C.RED, '#f97316', '#a21caf', '#0891b2', '#15803d', '#b45309', '#7c3aed', '#be123c', '#0369a1', '#166534'];
      const pal = workload.map((_: any, i: number) => palBase[i % palBase.length]);

      this.destroyChart('machine');
      this.charts.set('machine', new Chart(this.machineChartRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: workload.map((w: any) => w.nom),
          datasets: [{ data: workload.map((w: any) => w.charge), backgroundColor: pal, borderColor: 'white', borderWidth: 2 }],
        },
        options: { ...base, plugins: { ...base.plugins, tooltip: { ...base.plugins.tooltip, callbacks: { label: (ctx: any) => ` ${(ctx.parsed as number).toFixed(1)}% ${this.vm.t().plannerChartCharge}` } } } } as any,
      }));
    }

    // 4 · Makespan Distribution (horizontal bar) ───────────────────────────
    if ((key === 'makespan' || key === 'all') && this.makespanChartRef?.nativeElement) {
      const ranges = [
        this.vm.t().plannerMakespanRange1, this.vm.t().plannerMakespanRange2,
        this.vm.t().plannerMakespanRange3, this.vm.t().plannerMakespanRange4,
        this.vm.t().plannerMakespanRange5,
      ];
      const counts = [
        plan.filter((p: any) => (p.makespanDays ?? 0) < 1).length,
        plan.filter((p: any) => { const d = p.makespanDays ?? 0; return d >= 1  && d < 3;  }).length,
        plan.filter((p: any) => { const d = p.makespanDays ?? 0; return d >= 3  && d < 7;  }).length,
        plan.filter((p: any) => { const d = p.makespanDays ?? 0; return d >= 7  && d < 14; }).length,
        plan.filter((p: any) => (p.makespanDays ?? 0) >= 14).length,
      ];
      const colors   = ['#10b981', '#06b6d4', '#0ea5e9', '#f59e0b', '#ef4444'];
      const maxCount = Math.max(...counts, 1);

      this.destroyChart('makespan');
      this.charts.set('makespan', new Chart(this.makespanChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels: ranges,
          datasets: [{ label: this.vm.t().plannerMakespanDataset, data: counts, backgroundColor: colors, borderRadius: 8, borderSkipped: false }],
        },
        options: {
          ...base,
          indexAxis: 'y' as const,
          plugins: {
            ...base.plugins,
            legend: { display: false },
            tooltip: { ...base.plugins.tooltip, callbacks: { label: (ctx: any) => { const pct = plan.length ? Math.round(ctx.parsed.x / plan.length * 100) : 0; return ` ${ctx.parsed.x} planning${ctx.parsed.x !== 1 ? 's' : ''} (${pct}% ${this.vm.t().plannerMakespanPctDuTotal})`; } } },
          },
          scales: {
            x: { beginAtZero: true, max: maxCount + 1, ...axis(this.vm.t().plannerMakespanAxisX), ticks: { stepSize: 1, font: { size: 11 }, color: '#64748b' } },
            y: { ...axis(''), ticks: { font: { size: 11, weight: 600 as const }, color: '#374151' } },
          },
        } as any,
      }));
    }

    // 5 · Top Recettes (horizontal bar) ────────────────────────────────────
    if ((key === 'recette' || key === 'all') && this.recetteChartRef?.nativeElement) {
      const recLookup: Record<number, string> = {};
      rec.forEach((r: any) => { recLookup[r.id] = r.nomRecette; });
      const recMap: Record<string, number> = {};
      cmd.forEach((c: any) => {
        const name = c.recette?.nomRecette ?? recLookup[c.recetteId] ?? `Recette ${c.recetteId ?? '?'}`;
        recMap[name] = (recMap[name] ?? 0) + 1;
      });
      const top = Object.entries(recMap).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 6);
      const pal = [C.PURPLE, C.INDIGO, C.BLUE, C.CYAN, C.TEAL, C.GREEN];

      this.destroyChart('recette');
      this.charts.set('recette', new Chart(this.recetteChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels: top.map(([k]) => k),
          datasets: [{ label: this.vm.t().plannerRecetteDataset, data: top.map(([, v]) => v), backgroundColor: top.map((_, i) => pal[i % pal.length]), borderRadius: 8 }],
        },
        options: {
          ...base,
          indexAxis: 'y' as const,
          plugins: {
            ...base.plugins,
            legend: { display: false },
            tooltip: { ...base.plugins.tooltip, callbacks: { label: (ctx: any) => { const pct = cmd.length ? Math.round(ctx.parsed.x / cmd.length * 100) : 0; return ` ${ctx.parsed.x} ${this.vm.t().plannerRecetteCommandeSuffix} — ${pct}% ${this.vm.t().chartPctDuTotal}`; } } },
          },
          scales: {
            x: { beginAtZero: true, ...axis(this.vm.t().chartAxisNombreCommandes), ticks: { stepSize: 1, font: { size: 11 }, color: '#64748b' } },
            y: { ...axis(''), ticks: { font: { size: 11 }, color: '#374151' } },
          },
        } as any,
      }));
    }
  }

  // ── Compliance chart (on-demand, after Générer) ──────────────────────────

  private _renderComplianceChart(): void {
    const report = this.vm.complianceReport();
    if (!report || !this.complianceChartRef?.nativeElement) return;

    this.destroyChart('compliance');

    const base = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right' as const, labels: { padding: 16, font: { size: 12 }, usePointStyle: true, pointStyleWidth: 10 } },
        tooltip: { backgroundColor: 'rgba(0,0,0,0.7)', padding: 10 },
      },
    };

    const total = report.totalCommandes || 1;
    const labels = [
      this.vm.t().complianceChartLabelOnTime,
      this.vm.t().complianceChartLabelLate,
      this.vm.t().complianceChartLabelPending,
    ];
    const values  = [report.onTime, report.late, report.pending];
    const colors  = ['#10b981', '#ef4444', '#f59e0b'];

    const centerTotalPlugin = {
      id: 'centerTotal',
      afterDraw(chart: any) {
        const { ctx, chartArea: { left, right, top, bottom } } = chart;
        const cx = (left + right) / 2;
        const cy = (top + bottom) / 2;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
        ctx.fillStyle = '#1e293b';
        ctx.fillText(String(total), cx, cy - 8);
        ctx.font = '11px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('total', cx, cy + 12);
        ctx.restore();
      },
    };

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
                return ` ${ctx.parsed} ${this.vm.t().complianceTooltipSuffix ?? 'commandes'} — ${pct}%`;
              },
            },
          },
        },
      } as any,
    }));
  }

  // ── Chart helpers 

  private destroyChart(key: string): void {
    const c = this.charts.get(key);
    if (c) { c.destroy(); this.charts.delete(key); }
  }

  private destroyAllCharts(): void {
    this.charts.forEach(c => c.destroy());
    this.charts.clear();
  }
}
