import {
  Component, OnInit, AfterViewInit, OnDestroy,
  inject, ElementRef, ViewChild, ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { WorkerDashboardViewModel } from './worker-dashboard.viewmodel';

Chart.register(...registerables);

@Component({
  selector: 'app-worker-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [WorkerDashboardViewModel],
  template: `
    <div class="wd-root">

      <div class="wd-hero">
        <div class="wd-hero-left">
          <span class="wd-greeting-badge">
            <span class="wd-greeting-dot"></span>
            {{ vm.shiftLabel }}
          </span>
          <h1 class="wd-hero-name">
            {{ vm.auth.currentUser()?.firstName }}&nbsp;<span class="wd-lastname">{{ vm.auth.currentUser()?.lastName }}</span>
          </h1>
          <p class="wd-hero-date">{{ vm.today }}</p>
        </div>
        <div class="wd-hero-right">
          <div class="wd-clock-ring">
            <svg viewBox="0 0 80 80" class="wd-ring-svg">
              <circle cx="40" cy="40" r="34" class="wd-ring-track"/>
              <circle cx="40" cy="40" r="34" class="wd-ring-fill"
                [style.stroke-dasharray]="vm.shiftArc + ' 213.6'"/>
            </svg>
            <div class="wd-clock-inner">
              <span class="wd-clock-time">{{ vm.clockTime }}</span>
              <span class="wd-clock-sub">{{ vm.shiftPct }}{{ vm.t().workerDashClockDayPct }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="wd-error-banner" *ngIf="vm.error">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <div class="wd-error-body">
          <strong>{{ vm.t().workerDashLoadError }}</strong>
          <span>{{ vm.t().workerDashLoadErrorHint }} ({{ vm.error }})</span>
        </div>
        <button class="wd-retry-btn" (click)="onReload()">{{ vm.t().workerDashRetry }}</button>
      </div>

      <div class="wd-kpi-rail">

        <ng-container *ngIf="vm.loading">
          <div class="wd-kpi wd-kpi-skeleton" *ngFor="let i of [1,2,3,4]">
            <div class="wd-sk-icon"></div>
            <div class="wd-kpi-body">
              <div class="wd-sk-line wd-sk-line--num"></div>
              <div class="wd-sk-line wd-sk-line--lbl"></div>
              <div class="wd-sk-line wd-sk-line--meta"></div>
            </div>
          </div>
        </ng-container>

        <ng-container *ngIf="!vm.loading">
          <div class="wd-kpi">
            <div class="wd-kpi-icon" style="--c:#3b82f6">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="17" rx="2"/>
                <path d="M3 9h18M8 2v4M16 2v4M7 13h3M7 17h5"/>
              </svg>
            </div>
            <div class="wd-kpi-body">
              <span class="wd-kpi-num">{{ vm.stats.totalPlannings }}</span>
              <span class="wd-kpi-lbl">{{ vm.t().workerDashAvailablePlannings }}</span>
              <span class="wd-kpi-meta" style="color:#3b82f6">
                {{ vm.stats.totalPlannings > 0 ? vm.t().workerDashLastPlanning + vm.stats.dernierPlanning : vm.t().workerDashNoPlannings }}
              </span>
            </div>
          </div>

          <div class="wd-kpi">
            <div class="wd-kpi-icon" style="--c:#8b5cf6">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <div class="wd-kpi-body">
              <span class="wd-kpi-num">{{ vm.stats.totalLignes }}</span>
              <span class="wd-kpi-lbl">{{ vm.t().workerDashAssignedTasks }}</span>
              <span class="wd-kpi-meta" style="color:#8b5cf6">{{ vm.stats.totalCommandes }} {{ vm.t().workerDashOrders }}</span>
            </div>
          </div>

          <div class="wd-kpi">
            <div class="wd-kpi-icon" style="--c:#14b8a6">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div class="wd-kpi-body">
              <span class="wd-kpi-num">
                <ng-container *ngIf="vm.stats.makespanJours > 0">{{ vm.stats.makespanJours }}<span class="wd-kpi-unit">j</span></ng-container>
                <ng-container *ngIf="vm.stats.makespanJours === 0 && vm.stats.makespanPM > 0">{{ vm.stats.makespanPM }}<span class="wd-kpi-unit">min</span></ng-container>
                <ng-container *ngIf="vm.stats.makespanJours === 0 && vm.stats.makespanPM === 0">—</ng-container>
              </span>
              <span class="wd-kpi-lbl">{{ vm.t().workerDashProductionDuration }}</span>
              <span class="wd-kpi-meta" style="color:#14b8a6">
                <ng-container *ngIf="vm.stats.makespanJours > 0 && vm.stats.makespanPM > 0">+ {{ vm.stats.makespanPM }} min</ng-container>
                <ng-container *ngIf="vm.stats.makespanJours > 0 && vm.stats.makespanPM === 0">{{ vm.t().workerDashFullDays }}</ng-container>
                <ng-container *ngIf="vm.stats.makespanJours === 0 && vm.stats.makespanPM > 0">{{ vm.t().workerDashLessThanADay }}</ng-container>
              </span>
            </div>
          </div>

          <div class="wd-kpi">
            <div class="wd-kpi-icon" style="--c:#22c55e">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div class="wd-kpi-body">
              <span class="wd-kpi-num wd-kpi-status">{{ vm.stats.statutPlanning }}</span>
              <span class="wd-kpi-lbl">{{ vm.t().workerDashPlanningStatus }}</span>
              <span class="wd-kpi-meta" style="color:#22c55e">{{ vm.t().workerDashActivePlanning }}</span>
            </div>
          </div>
        </ng-container>

      </div>

      <div class="wd-empty" *ngIf="!vm.loading && !vm.error && vm.stats.totalPlannings === 0">
        <div class="wd-empty-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
            <rect x="3" y="4" width="18" height="17" rx="2"/>
            <path d="M3 9h18M8 2v4M16 2v4"/>
          </svg>
        </div>
        <p class="wd-empty-title">{{ vm.t().workerDashNoPlanningAvailable }}</p>
        <p class="wd-empty-sub">{{ vm.t().workerDashNoPlanningHint }}</p>
      </div>

      <div class="wd-charts" *ngIf="!vm.loading && vm.stats.totalPlannings > 0">

        <div class="wd-card wd-card--wide">
          <div class="wd-card-head">
            <div class="wd-card-title">
              <span class="wd-card-icon" style="--c:#14b8a6">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
                </svg>
              </span>
              {{ vm.t().workerDashChartMachineLoad }}
            </div>
            <span class="wd-badge wd-badge--teal">{{ vm.t().workerDashBadgeOps }}</span>
          </div>
          <div class="wd-chart-wrap wd-chart-wrap--tall">
            <canvas #machineOps></canvas>
          </div>
        </div>

        <div class="wd-card">
          <div class="wd-card-head">
            <div class="wd-card-title">
              <span class="wd-card-icon" style="--c:#8b5cf6">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </span>
              {{ vm.t().workerDashChartMakespan }}
            </div>
            <span class="wd-badge wd-badge--purple">{{ vm.t().workerDashBadgeDays }}</span>
          </div>
          <div class="wd-chart-wrap">
            <canvas #makespanChart></canvas>
          </div>
        </div>

        <div class="wd-card">
          <div class="wd-card-head">
            <div class="wd-card-title">
              <span class="wd-card-icon" style="--c:#3b82f6">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </span>
              {{ vm.t().workerDashChartOrders }}
            </div>
            <span class="wd-badge wd-badge--blue">{{ vm.t().workerDashBadgeQty }}</span>
          </div>
          <div class="wd-chart-wrap">
            <canvas #commandesChart></canvas>
          </div>
        </div>

        <div class="wd-card wd-card--wide">
          <div class="wd-card-head">
            <div class="wd-card-title">
              <span class="wd-card-icon" style="--c:#f59e0b">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4M7 13h3M7 17h5"/>
                </svg>
              </span>
              {{ vm.t().workerDashChartHistory }}
            </div>
            <div class="wd-filter-box">
              <select [(ngModel)]="vm.filterMode" (change)="onFilterChange()" class="wd-filter-select">
                <option value="all">{{ vm.t().workerDashFilterAll }}</option>
                <option value="10">{{ vm.t().workerDashFilter10 }}</option>
                <option value="20">{{ vm.t().workerDashFilter20 }}</option>
              </select>
            </div>
          </div>
          <div class="wd-table-wrap">
            <table class="wd-table">
              <thead>
                <tr>
                  <th>{{ vm.t().workerDashColId }}</th><th>{{ vm.t().workerDashColDate }}</th><th>{{ vm.t().workerDashColOrders }}</th>
                  <th>{{ vm.t().workerDashColLines }}</th><th>{{ vm.t().workerDashColStatus }}</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of vm.planningRows; let i = index"
                    [class.wd-row--last]="i === vm.planningRows.length - 1">
                  <td class="wd-id">#{{ p.id }}</td>
                  <td>{{ vm.formatDate(p.dateGeneration ?? p.dateDebut) }}</td>
                  <td><span class="wd-pill wd-pill--blue">{{ p.nombreCommandes }}</span></td>
                  <td><span class="wd-pill wd-pill--purple">{{ p.nombreLignes }}</span></td>
                  <td>
                    <span class="wd-status-dot"
                          [class.wd-status-dot--green]="(p.statut ?? '').toLowerCase() === 'optimal' || (p.statut ?? '').toLowerCase() === 'optimisé'"
                          [class.wd-status-dot--amber]="(p.statut ?? '').toLowerCase() !== 'optimal' && (p.statut ?? '').toLowerCase() !== 'optimisé'">
                      {{ p.statut ? (p.statut.charAt(0).toUpperCase() + p.statut.slice(1).toLowerCase()) : '—' }}
                    </span>
                  </td>
                </tr>
                <tr *ngIf="vm.planningRows.length === 0">
                  <td colspan="6" class="wd-table-empty">{{ vm.t().workerDashTableEmpty }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      --bg:       var(--surface, #f8fafc);
      --card:     var(--bg-card, #ffffff);
      --border:   var(--border-color, #e2e8f0);
      --text:     var(--text-primary, #0f172a);
      --muted:    var(--text-muted, #64748b);
      --radius:   16px;
      --radius-sm:10px;
      font-family: 'DM Sans', 'Segoe UI', system-ui, sans-serif;
      display: contents;
    }

    .wd-root {
      padding: 1.75rem 2rem;
      max-width: 1440px;
      background: var(--bg);
      min-height: 100%;
    }

    /* ── Hero — bright blue, not dark navy ── */
    .wd-hero {
      display: flex; align-items: center; justify-content: space-between;
      background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #0ea5e9 100%);
      border-radius: 20px; padding: 2rem 2.25rem; margin-bottom: 1.5rem;
      position: relative; overflow: hidden;
      box-shadow: 0 8px 32px rgba(37,99,235,0.22);
    }
    .wd-hero::before {
      content: ''; position: absolute; inset: 0; pointer-events: none;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }
    .wd-hero::after {
      content: ''; position: absolute; top: -40px; right: -40px;
      width: 200px; height: 200px; border-radius: 50%;
      background: rgba(255,255,255,0.07); pointer-events: none;
    }
    .wd-hero-left { position: relative; z-index: 1; }

    .wd-greeting-badge {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 0.72rem; font-weight: 600; letter-spacing: 0.08em;
      text-transform: uppercase; color: rgba(255,255,255,0.75); margin-bottom: 0.6rem;
    }
    .wd-greeting-dot {
      width: 7px; height: 7px; border-radius: 50%; background: #86efac;
      box-shadow: 0 0 0 3px rgba(134,239,172,.35); animation: pulse-dot 2s infinite;
    }
    @keyframes pulse-dot {
      0%,100% { box-shadow: 0 0 0 3px rgba(134,239,172,.35); }
      50%     { box-shadow: 0 0 0 6px rgba(134,239,172,.12); }
    }
    .wd-hero-name {
      font-size: 2rem; font-weight: 800; color: #fff;
      margin: 0 0 0.25rem; letter-spacing: -0.04em; line-height: 1.1;
    }
    .wd-lastname { color: #fde68a; }
    .wd-hero-date { font-size: 0.8rem; color: rgba(255,255,255,0.65); margin: 0; font-weight: 500; }

    /* Clock ring */
    .wd-hero-right { position: relative; z-index: 1; }
    .wd-clock-ring { position: relative; width: 88px; height: 88px; }
    .wd-ring-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
    .wd-ring-track { fill: none; stroke: rgba(255,255,255,0.18); stroke-width: 7; }
    .wd-ring-fill  { fill: none; stroke: #fde68a; stroke-width: 7; stroke-linecap: round; stroke-dashoffset: 0; transition: stroke-dasharray 1s ease; }
    .wd-clock-inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; }
    .wd-clock-time { font-size: 1rem; font-weight: 800; color: #fff; letter-spacing: -0.03em; line-height: 1; }
    .wd-clock-sub  { font-size: 0.52rem; color: rgba(255,255,255,0.6); font-weight: 600; text-align: center; }

    /* ── Error banner ── */
    .wd-error-banner {
      display: flex; align-items: center; gap: 0.75rem;
      background: #fef2f2; border: 1.5px solid #fca5a5;
      border-radius: var(--radius-sm); padding: 0.9rem 1.1rem;
      margin-bottom: 1.25rem; color: #991b1b; font-size: 0.82rem;
    }
    .wd-error-banner svg { flex-shrink: 0; color: #dc2626; }
    .wd-error-body { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .wd-error-body strong { font-weight: 700; display: block; }
    .wd-error-body span { color: #b91c1c; font-size: 0.76rem; }
    .wd-retry-btn {
      padding: 0.4rem 0.9rem; border-radius: 8px; background: #dc2626;
      color: #fff; border: none; cursor: pointer; font-size: 0.78rem;
      font-weight: 600; white-space: nowrap; transition: background 0.15s;
    }
    .wd-retry-btn:hover { background: #b91c1c; }

    /* ── KPI rail ── */
    .wd-kpi-rail {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 1rem; margin-bottom: 1.5rem;
    }
    @media (max-width: 900px) { .wd-kpi-rail { grid-template-columns: repeat(2,1fr); } }
    @media (max-width: 520px) { .wd-kpi-rail { grid-template-columns: 1fr; } }

    .wd-kpi {
      background: var(--card); border: 1.5px solid var(--border);
      border-radius: var(--radius); padding: 1.2rem 1.25rem;
      display: flex; gap: 0.9rem; align-items: flex-start;
      transition: box-shadow 0.2s;
    }
    .wd-kpi:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07); }

    /* Skeleton */
    .wd-kpi-skeleton { pointer-events: none; }
    .wd-sk-icon { width: 38px; height: 38px; border-radius: 10px; background: #e2e8f0; flex-shrink: 0; animation: shimmer 1.4s infinite; }
    .wd-sk-line { border-radius: 6px; background: #e2e8f0; animation: shimmer 1.4s infinite; margin-bottom: 6px; }
    .wd-sk-line--num  { height: 22px; width: 55%; }
    .wd-sk-line--lbl  { height: 12px; width: 80%; }
    .wd-sk-line--meta { height: 10px; width: 60%; }
    @keyframes shimmer {
      0%,100% { opacity: 1; }
      50%     { opacity: 0.45; }
    }

    .wd-kpi-icon {
      width: 38px; height: 38px; border-radius: 10px;
      background: color-mix(in srgb, var(--c) 12%, transparent);
      color: var(--c); display: flex; align-items: center;
      justify-content: center; flex-shrink: 0;
    }
    .wd-kpi-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .wd-kpi-num  { font-size: 1.55rem; font-weight: 800; color: var(--text); letter-spacing: -0.04em; line-height: 1; }
    .wd-kpi-unit { font-size: 0.75rem; font-weight: 700; margin-left: 1px; }
    .wd-kpi-lbl  { font-size: 0.72rem; color: var(--muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    .wd-kpi-meta { font-size: 0.72rem; font-weight: 600; margin-top: 2px; }
    .wd-kpi-status { font-size: 1rem !important; }

    /* ── Charts grid ── */
    .wd-charts {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    @media (max-width: 760px) { .wd-charts { grid-template-columns: 1fr; } }

    .wd-card {
      background: var(--card); border: 1.5px solid var(--border);
      border-radius: var(--radius); padding: 1.25rem;
    }
    .wd-card--wide { grid-column: 1 / -1; }

    .wd-card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
    .wd-card-title { font-size: 0.82rem; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 7px; }
    .wd-card-icon  { width: 24px; height: 24px; border-radius: 6px; background: color-mix(in srgb, var(--c) 12%, transparent); color: var(--c); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

    .wd-badge { font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; letter-spacing: 0.04em; text-transform: uppercase; }
    .wd-badge--teal   { background: #ccfbf1; color: #0d9488; }
    .wd-badge--purple { background: #ede9fe; color: #7c3aed; }
    .wd-badge--blue   { background: #dbeafe; color: #2563eb; }

    .wd-chart-wrap { position: relative; height: 200px; }
    .wd-chart-wrap--tall { height: 230px; }

    /* Table (Restored exact original, added max-height & sticky header) */
    .wd-table-wrap { overflow-x: auto; max-height: 500px; }
    .wd-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
    .wd-table th { position: sticky; top: 0; background: var(--card); z-index: 10; text-align: left; font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--muted); padding: 0.5rem 0.75rem; border-bottom: 1.5px solid var(--border); }
    .wd-table td { padding: 0.65rem 0.75rem; color: var(--text); border-bottom: 1px solid var(--border); vertical-align: middle; }
    .wd-row--last td { border-bottom: none; }
    .wd-table tr:hover td { background: color-mix(in srgb, var(--border) 30%, transparent); }
    .wd-id   { font-weight: 700; color: var(--muted); font-family: monospace; font-size: 0.75rem; }
    .wd-mono { font-family: monospace; font-size: 0.75rem; }

    .wd-pill { font-size: 0.68rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; }
    .wd-pill--blue   { background: #dbeafe; color: #2563eb; }
    .wd-pill--purple { background: #ede9fe; color: #7c3aed; }

    .wd-status-dot { display: inline-flex; align-items: center; gap: 5px; font-size: 0.75rem; font-weight: 600; }
    .wd-status-dot::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #94a3b8; flex-shrink: 0; }
    .wd-status-dot--green::before { background: #22c55e; }
    .wd-status-dot--amber::before { background: #f59e0b; }

    /* Empty state */
    .wd-empty {
      background: var(--card); border: 1.5px dashed var(--border);
      border-radius: var(--radius); padding: 3.5rem 2rem;
      text-align: center; display: flex; flex-direction: column;
      align-items: center; gap: 0.5rem; margin-top: 0.5rem;
    }
    .wd-empty-icon { width: 64px; height: 64px; border-radius: 16px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; color: #94a3b8; margin-bottom: 0.5rem; }
    .wd-empty-title { font-size: 1rem; font-weight: 700; color: var(--text); margin: 0; }
    .wd-empty-sub   { font-size: 0.82rem; color: var(--muted); margin: 0; }

    /* ── Select Dropdown styles ── */
    .wd-filter-box { position: relative; display: flex; align-items: center; }
    .wd-filter-select {
      appearance: none;
      background: #f1f5f9 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 0.75rem center;
      background-size: 14px;
      border: 1.5px solid transparent;
      border-radius: 8px;
      padding: 0.45rem 2.25rem 0.45rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text);
      outline: none;
      cursor: pointer;
      transition: all 0.2s;
    }
    .wd-filter-select:focus {
      border-color: #3b82f6;
      background-color: #fff;
      box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
    }
    .wd-table-empty { padding: 3rem !important; text-align: center; color: var(--muted); font-style: italic; }
  `]
})
export class WorkerDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('machineOps')     machineOpsRef!:     ElementRef<HTMLCanvasElement>;
  @ViewChild('makespanChart')  makespanChartRef!:  ElementRef<HTMLCanvasElement>;
  @ViewChild('commandesChart') commandesChartRef!: ElementRef<HTMLCanvasElement>;

  vm  = inject(WorkerDashboardViewModel);
  private cdr = inject(ChangeDetectorRef);

  private viewReady = false;
  private dataReady = false;
  private charts: Chart[] = [];

  async ngOnInit() {
    this.vm.init();
    await this.vm.loadData();
    this.dataReady = true;
    this.cdr.markForCheck();
    if (this.viewReady) setTimeout(() => this.buildCharts());
  }

  ngAfterViewInit() {
    this.viewReady = true;
    if (this.dataReady && !this.vm.loading) setTimeout(() => this.buildCharts());
  }

  ngOnDestroy() {
    this.vm.destroy();
    this.destroyCharts();
  }

  onReload() {
    this.destroyCharts();
    this.dataReady = false;
    this.vm.reload().then(() => {
      this.dataReady = true;
      this.cdr.markForCheck();
      if (this.viewReady) setTimeout(() => this.buildCharts());
    });
  }

  onFilterChange() {
    this.vm.applyFilter();
  }

  /** Destroy every Chart instance we own AND any orphan left on a canvas. */
  private destroyCharts(): void {
    this.charts.forEach(c => c.destroy());
    this.charts = [];

    // Belt-and-suspenders: Chart.js keeps a registry keyed by canvas element.
    // If a prior instance slipped through (e.g. from a double ngAfterViewInit
    // call) we destroy it here so `new Chart(canvas, …)` never throws.
    for (const ref of [this.machineOpsRef, this.makespanChartRef, this.commandesChartRef]) {
      const canvas = ref?.nativeElement;
      if (canvas) {
        const existing = Chart.getChart(canvas);
        if (existing) existing.destroy();
      }
    }
  }

  private buildCharts() {
    const cfg = this.vm.chartConfig;
    if (this.vm.stats.totalPlannings === 0) return;

    // Always wipe any existing instances before rebuilding — this prevents the
    // silent Chart.js error that occurs when the canvas already has a chart on
    // it (visible as `_chartjs` on the dataset array in the console).
    this.destroyCharts();

    this.cdr.detectChanges();

    const FONT = '#64748b';
    const GRID = 'rgba(0,0,0,0.05)';
    const base: any = {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { font: { size: 11, family: 'DM Sans,system-ui' }, color: FONT, boxWidth: 10 } },
        tooltip: { backgroundColor: '#0f172a', titleColor: '#f1f5f9', bodyColor: '#94a3b8', padding: 10, cornerRadius: 8 },
      },
      scales: {
        x: { grid: { color: GRID }, ticks: { color: FONT, font: { size: 11 } } },
        y: { grid: { color: GRID }, ticks: { color: FONT, font: { size: 11 } }, beginAtZero: true },
      },
    };

    if (cfg.machineOpsData && this.machineOpsRef?.nativeElement) {
      const { labels, data, colors } = cfg.machineOpsData;
      this.charts.push(new Chart(this.machineOpsRef.nativeElement, {
        type: 'bar',
        data: {
          labels,
          datasets: [{ label: this.vm.t().workerDashBadgeOps, data, backgroundColor: colors.map(c => c + 'cc'), borderColor: colors, borderWidth: 1.5, borderRadius: 8 }],
        },
        options: {
          ...base, indexAxis: 'y' as const,
          plugins: { ...base.plugins, legend: { display: false },
            tooltip: { ...base.plugins.tooltip, callbacks: { label: (ctx: any) => ` ${ctx.parsed.x} opération${ctx.parsed.x > 1 ? 's' : ''}` } } },
          scales: {
            x: { ...base.scales.x, beginAtZero: true, ticks: { ...base.scales.x.ticks, stepSize: 1 },
              title: { display: true, text: this.vm.t().workerDashAxisOps, color: FONT, font: { size: 11 } } },
            y: { grid: { display: false }, ticks: { color: FONT, font: { size: 11 } }, title: { display: false } },
          },
        } as any,
      }));
    }

    if (cfg.makespanData && this.makespanChartRef?.nativeElement) {
      const { labels, data } = cfg.makespanData;
      this.charts.push(new Chart(this.makespanChartRef.nativeElement, {
        type: 'line',
        data: {
          labels,
          datasets: [{ label: this.vm.t().workerDashDatasetMakespan, data, borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.08)', fill: true, tension: 0.4, pointRadius: 5, pointBackgroundColor: '#8b5cf6', pointBorderColor: '#fff', pointBorderWidth: 2 }],
        },
        options: {
          ...base,
          plugins: { ...base.plugins, tooltip: { ...base.plugins.tooltip, callbacks: { label: (ctx: any) => ` ${ctx.parsed.y}j` } } },
          scales: {
            x: { ...base.scales.x, title: { display: true, text: this.vm.t().workerDashAxisPlanningNum, color: FONT, font: { size: 11 } } },
            y: { ...base.scales.y, beginAtZero: true, ticks: { ...base.scales.y.ticks, stepSize: 1, callback: (v: any) => `${v}j` }, title: { display: true, text: this.vm.t().workerDashAxisMakespanDays, color: FONT, font: { size: 11 } } },
          },
        } as any,
      }));
    }

    if (cfg.commandesData && this.commandesChartRef?.nativeElement) {
      const { labels, data } = cfg.commandesData;

      // Data can span two orders of magnitude (e.g. 3–4 vs 1 000).
      // A linear scale makes the small bars invisible (<0.5% tall).
      // Switch to logarithmic when the ratio exceeds 20× so every bar
      // has a readable height. Clamp values to 1 so log(0) is never hit.
      const nums = (data as number[]).map(v => Math.max(1, v));
      const minVal = Math.min(...nums);
      const maxVal = Math.max(...nums);
      const useLog = maxVal / minVal > 20;

      this.charts.push(new Chart(this.commandesChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: this.vm.t().workerDashDatasetOrders,
            data: useLog ? nums : data,
            backgroundColor: 'rgba(59,130,246,0.7)',
            borderColor: '#3b82f6',
            borderWidth: 1.5,
            borderRadius: 8,
          }],
        },
        options: {
          ...base,
          plugins: {
            ...base.plugins,
            legend: { display: false },
            tooltip: {
              ...base.plugins.tooltip,
              callbacks: {
                label: (ctx: any) => {
                  const v = ctx.raw as number;
                  return ` ${v} commande${v > 1 ? 's' : ''}`;
                },
              },
            },
          },
          scales: {
            x: {
              ...base.scales.x,
              title: { display: true, text: this.vm.t().workerDashAxisPlanningNum, color: FONT, font: { size: 11 } },
            },
            y: {
              type: useLog ? 'logarithmic' : 'linear',
              grid: { color: GRID },
              beginAtZero: !useLog,
              min: useLog ? 1 : 0,
              ticks: {
                color: FONT,
                font: { size: 11 },
                // On log axis only show clean round numbers to avoid clutter
                callback: (value: any) => {
                  if (!useLog) return value;
                  const nice = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
                  return nice.includes(Number(value)) ? value : null;
                },
              },
              title: { display: true, text: this.vm.t().workerDashAxisOrderCount, color: FONT, font: { size: 11 } },
            },
          },
        } as any,
      }));
    }
  }
}
