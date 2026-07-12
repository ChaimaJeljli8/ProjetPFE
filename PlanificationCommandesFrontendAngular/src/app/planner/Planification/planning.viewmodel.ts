import { Injectable, inject, signal, computed } from '@angular/core';
import { GanttRow, PlanningDetail, PlanningSummary } from '../../shared/models/planning.model';
import { PlanningService } from '../../shared/services/Planning.service';
import { LanguageService } from '../../shared/services/language.service';
import { ActivePlanningService } from '../../shared/services/active-planning.service';


export const PPD = 1440;

export const CMD_PALETTE = [
  '#1D4ED8','#B91C1C','#15803D','#7C3AED','#C2410C','#0E7490','#9D174D',
  '#3D9970','#6D28D9','#92400E','#1E40AF','#991B1B','#166534','#5B21B6',
  '#78350F','#155E75','#7F1D1D','#14532D','#4C1D95','#713F12','#0369A1',
  '#BE185D','#065F46','#4338CA','#EA580C','#10B981','#F43F5E',
];

export const URGENCE_COLORS: Record<number, string> = {
  1: '#DC2626', 2: '#F97316', 3: '#EAB308', 4: '#22C55E', 5: '#10B981'
};

//  Sub-types

export interface GanttBar {
  row:          GanttRow;
  color:        string;
  urgenceColor: string;
  machineIdx:   number;
  trackIdx:     number;
  xPx:          number;
  wPx:          number;
}

export interface MachineRow {
  id:       number;
  name:     string;
  bars:     GanttBar[];
  tracks:   number;
  heightPx: number;
}


export interface TimelineTick {
  xPx:     number;
  label:   string;
  isMajor: boolean;
  isFirst: boolean;
}

@Injectable()
export class PlanningViewModel {
  private svc  = inject(PlanningService);
  private lang = inject(LanguageService);
  private activePlanning = inject(ActivePlanningService);


  active         = signal<PlanningDetail | null>(null);
  history        = signal<PlanningSummary[]>([]);
  running        = signal(false);
  errorMsg       = signal('');
  toast          = signal<{ msg: string; type: 'success' | 'error' } | null>(null);
  exportingExcel = signal(false);
  exportingPdf   = signal(false);


  showRunModal     = signal(false);
  maxMachinesPerOp = signal<1 | 2 | 3>(1);


  startDatetime = signal<string>(this._nowLocal());


  filterUrgence = signal(0);
  filterMachine = signal('');
  filterCommande = signal('');

  filterDateFrom = signal('');
  filterDateTo   = signal('');
  filterMakespan = signal<number | null>(null);
  selectedBar   = signal<GanttBar | null>(null);

  private _pxPerMin = signal(1.6);
  readonly pxPerMin = this._pxPerMin.asReadonly();


  zoomIn()  { this._pxPerMin.update(v => Math.min(v + 0.4, 8)); }
  zoomOut() { this._pxPerMin.update(v => Math.max(v - 0.4, 0.3)); }


  private cmdColorMap = computed<Record<string, string>>(() => {
    const rows = this.active()?.rows ?? [];
    const cmds = [...new Set(rows.map(r => r.numeroCommande))];
    return Object.fromEntries(cmds.map((c, i) => [c, CMD_PALETTE[i % CMD_PALETTE.length]]));
  });

  cmdColor(cmd: string): string { return this.cmdColorMap()[cmd] ?? '#94a3b8'; }
  urgColor(u: number):   string { return URGENCE_COLORS[u]       ?? '#94a3b8'; }


  dayWidthPx   = computed(() => PPD * this._pxPerMin());
  totalWidthPx = computed(() => (this.ticks().filter(t => t.isMajor).length || 1) * this.dayWidthPx());
  totalHeightPx = computed(() => this.visibleMachines().reduce((s, m) => s + m.heightPx, 0));


  minPM = computed<number>(() => {
    const rows = this.active()?.rows ?? [];
    if (!rows.length) return 0;
    return Math.min(...rows.map(r => r.startPM));
  });

  ticks = computed<TimelineTick[]>(() => {
    const rows = this.active()?.rows ?? [];
    if (!rows.length) return [];

    const minPM   = this.minPM();
    const maxPM   = Math.max(...rows.map(r => r.endPM));
    const pxMin   = this._pxPerMin();

    const hourStepMinutes = pxMin >= 1.0 ? 60 : 360;

    const result: TimelineTick[] = [];

    const firstTick = Math.floor(minPM / hourStepMinutes) * hourStepMinutes;
    const lastTick  = maxPM + PPD;

    let isFirst = true;
    for (let absPM = firstTick; absPM <= lastTick; absPM += hourStepMinutes) {
      const xPx      = (absPM - minPM) * pxMin;
      const minOfDay = absPM % PPD;
      const h        = Math.floor(minOfDay / 60);
      const m        = minOfDay % 60;
      const isMajor  = minOfDay === 0;

      const label = `${String(h).padStart(2, '0')}h${m > 0 ? String(m).padStart(2, '0') : ''}`;

      result.push({ xPx, label, isMajor, isFirst });
      isFirst = false;
    }

    return result;
  });

  /** Keep legacy `days` computed for grid-separator lines */
  days = computed(() => {
    const rows = this.active()?.rows ?? [];
    if (!rows.length) return [];
    const minPM  = this.minPM();
    const maxPM  = Math.max(...rows.map(r => r.endPM));
    const pxMin  = this._pxPerMin();
    const maxDay = Math.floor(maxPM / PPD) + 2;

    const dateDebutStr = this.active()?.dateDebut ?? '';
    const anchor = dateDebutStr
      ? new Date(dateDebutStr.length === 10 ? dateDebutStr + 'T00:00:00' : dateDebutStr)
      : new Date();
    const DAYS_FR   = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const MONTHS_FR = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin',
                       'juil', 'août', 'sep', 'oct', 'nov', 'déc'];

    return Array.from({ length: maxDay + 1 }, (_, d) => {
      const rawXPx = (d * PPD - minPM) * pxMin;

      const cal = new Date(anchor);
      cal.setDate(cal.getDate() + d);
      const label = `${DAYS_FR[cal.getDay()]} ${cal.getDate()} ${MONTHS_FR[cal.getMonth()]} ${cal.getFullYear()}`;

      return {
        xPx:      rawXPx,
        visibleX: Math.max(rawXPx, 0),
        label,
      };
    }).filter(t => t.xPx > -this.dayWidthPx());
  });


  machineRows = computed<MachineRow[]>(() => {
    const rows     = this.active()?.rows ?? [];
    const colorMap = this.cmdColorMap();
    const minPM    = this.minPM();
    if (!rows.length) return [];

    const byMachine: Record<string, GanttRow[]> = {};
    rows.forEach(r => {
      const k = `${r.machineId}|${r.machineName}`;
      (byMachine[k] ??= []).push(r);
    });

    return Object.entries(byMachine)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([key, mRows]) => {
        const [idStr, name] = key.split('|');
        const tracks: number[] = [];

        const barsWithTrack = mRows
          .slice().sort((a, b) => a.startPM - b.startPM)
          .map(r => {
            const xPx  = (r.startPM - minPM) * this._pxPerMin();
            const wPx  = Math.max((r.endPM - r.startPM) * this._pxPerMin(), 6);
            let track  = tracks.findIndex(end => xPx >= end + 2);
            if (track === -1) { track = tracks.length; tracks.push(0); }
            tracks[track] = xPx + wPx;
            return {
              row:          r,
              color:        colorMap[r.numeroCommande] ?? '#1D4ED8',
              urgenceColor: URGENCE_COLORS[r.urgence]  ?? '#94a3b8',
              machineIdx:   0,
              trackIdx:     track,
              xPx, wPx,
            } as GanttBar;
          });

        const nTracks = Math.max(tracks.length, 1);
        return {
          id:       parseInt(idStr),
          name,
          bars:     barsWithTrack,
          tracks:   nTracks,
          heightPx: nTracks * 36 + 10,
        };
      });
  });

  visibleMachines = computed(() => {
    const fm = this.filterMachine().toLowerCase();
    return fm
      ? this.machineRows().filter(m => m.name.toLowerCase().includes(fm))
      : this.machineRows();
  });

  filteredRows = computed(() => {
    const rows = this.active()?.rows ?? [];
    const fu   = this.filterUrgence();
    const fm   = this.filterMachine().toLowerCase();
    const fc = this.filterCommande().toLowerCase();  // NEW
    return rows
      .filter(r => (!fu || r.urgence === fu) && (!fm || r.machineName.toLowerCase().includes(fm)) && (!fc || r.numeroCommande.toLowerCase().includes(fc)))
      .sort((a, b) => a.startPM - b.startPM);
  });

  filteredHistory = computed<PlanningSummary[]>(() => {
    const dateFrom = this.filterDateFrom();
    const dateTo   = this.filterDateTo();
    const makespan = this.filterMakespan();
    return this.history().filter(h => {
      if (dateFrom && h.dateGeneration.slice(0, 10) < dateFrom) return false;
      if (dateTo   && h.dateGeneration.slice(0, 10) > dateTo)   return false;
      if (makespan !== null && h.makespanDays !== makespan)      return false;
      return true;
    });
  });

  activeHistoryFilterCount = computed(() => {
    let n = 0;
    if (this.filterDateFrom())          n++;
    if (this.filterDateTo())            n++;
    if (this.filterMakespan() !== null) n++;
    return n;
  });

  resetHistoryFilters(): void {
    this.filterDateFrom.set('');
    this.filterDateTo.set('');
    this.filterMakespan.set(null);
  }


  isLate(endPM: number, dateExport: string): boolean {
    if (!dateExport) return false;
    const dateDebutStr = this.active()?.dateDebut ?? '';
    const anchor = dateDebutStr
      ? new Date(dateDebutStr.length === 10 ? dateDebutStr + 'T00:00:00' : dateDebutStr)
      : new Date();
    const finishDate = new Date(anchor.getTime() + endPM * 60_000);
    const exportDate = new Date(dateExport + 'T23:59:59');
    return finishDate > exportDate;
  }


  activeMachines = computed(() =>
    new Set((this.active()?.rows ?? []).map(r => r.machineId)).size
  );


  makespanFormatted = computed<string>(() => {
    const rows = this.active()?.rows ?? [];
    if (!rows.length) return '—';
    const t = this.lang.t();

    const minPM        = this.minPM();
    const totalMinutes = Math.max(...rows.map(r => r.endPM)) - minPM;
    const days  = Math.floor(totalMinutes / PPD);
    const hours = Math.floor((totalMinutes % PPD) / 60);
    const mins  = totalMinutes % 60;

    if (days > 0 && hours > 0) return `${days}${t.planningKpiMakespanDay} ${hours}${t.planningKpiMakespanHour}`;
    if (days > 0)               return `${days}${t.planningKpiMakespanDay}`;
    if (hours > 0 && mins > 0)  return `${hours}${t.planningKpiMakespanHour} ${mins}min`;
    if (hours > 0)               return `${hours}${t.planningKpiMakespanHour}`;
    return `${mins}min`;
  });

  onTimePct = computed(() => {
    const rows = this.active()?.rows ?? [];
    if (!rows.length) return 100;

    const byCmd: Record<string, { maxEndPM: number; dateExport: string }> = {};
    rows.forEach(r => {
      if (!byCmd[r.numeroCommande]) {
        byCmd[r.numeroCommande] = { maxEndPM: 0, dateExport: r.dateExport };
      }
      byCmd[r.numeroCommande].maxEndPM = Math.max(byCmd[r.numeroCommande].maxEndPM, r.endPM);
    });

    const dateDebutStr = this.active()?.dateDebut ?? '';
    const anchor = dateDebutStr
      ? new Date(dateDebutStr.length === 10 ? dateDebutStr + 'T00:00:00' : dateDebutStr)
      : new Date();

    const entries = Object.values(byCmd);
    const total   = entries.length;

    const ok = entries.filter(e => {
      const finishDate = new Date(anchor.getTime() + e.maxEndPM * 60_000);

      const exportDate = new Date(e.dateExport + 'T23:59:59');

      return finishDate <= exportDate;
    }).length;

    return total ? Math.round(ok / total * 100) : 100;
  });

  translatedWarnings = computed<string[]>(() => {
    const warnings = this.active()?.warnings ?? [];
    const t = this.lang.t();
    return warnings.map(w => {
      if (w.startsWith('SPLIT_WARNING|')) {
        const [, kind, op, actual, available, requested] = w.split('|');
        const key = kind === 'NOT_ENOUGH_MACHINES'
          ? t.planningWarnNotEnoughMachines
          : t.planningWarnInsufficientLots;
        return key
          .replace('{op}', op)
          .replace('{actual}', actual)
          .replace('{available}', available)
          .replace('{requested}', requested);
      }
      if (w.startsWith('LATE_WARNING|')) {
        const [, cmd, dateEnd, dateExport, daysLate] = w.split('|');
        return `Commande ${cmd} — livraison prévue le ${dateEnd}, échéance dépassée le ${dateExport} (${daysLate} jour(s))`;
      }
      return w;
    });
  });

  hasLateOrders = computed(() =>
    (this.active()?.warnings ?? []).some(w => w.startsWith('LATE_WARNING|'))
  );

  splitWarningsOnly = computed<string[]>(() => {
  const raw = this.active()?.warnings ?? [];
  return this.translatedWarnings()
    .filter((_, i) => !raw[i]?.startsWith('LATE_WARNING|'));
});

  lateWarningsOnly = computed<string[]>(() => {
  const raw = this.active()?.warnings ?? [];
  return this.translatedWarnings()
    .filter((_, i) => raw[i]?.startsWith('LATE_WARNING|'));
});

isBarDimmed(bar: GanttBar): boolean {
  const fu = this.filterUrgence();
  const fm = this.filterMachine().toLowerCase();
  const fc = this.filterCommande().toLowerCase();
  return (fu !== 0 && bar.row.urgence !== fu) ||
         (fm !== '' && !bar.row.machineName.toLowerCase().includes(fm)) ||
         (fc !== '' && !bar.row.numeroCommande.toLowerCase().includes(fc));
}

  machineTopPx(mi: number): number {
    const vms = this.visibleMachines();
    let top = 0;
    for (let i = 0; i < mi; i++) top += vms[i].heightPx;
    return top;
  }

  selectBar(bar: GanttBar): void {
    this.selectedBar.set(this.selectedBar() === bar ? null : bar);
  }


  pmToTime(pm: number): string {
    const off = pm % PPD;
    const h   = Math.floor(off / 60);
    const m   = off % 60;
    return `${String(h).padStart(2, '0')}h${String(m).padStart(2, '0')}`;
  }


  loadInitial(): void {
    this.svc.getAll().subscribe({
      next: list => {
        this.history.set(list);
        if (list.length) {
          this.svc.getById(list[0].id).subscribe({
            next: d => {
              this.active.set(d);
              this.activePlanning.set(d.id);
            }
          });
        }
      }
    });
  }

  loadHistory(id: string): void {
    if (!id) return;
    this.svc.getById(+id).subscribe({
      next: d => { this.active.set(d);
                    this.selectedBar.set(null);
                    this.activePlanning.set(d.id);
       }
    });
  }

  run(): void {
    this.startDatetime.set(this._nowLocal());
    this.showRunModal.set(true);
  }

  cancelRunModal(): void {
    this.showRunModal.set(false);
  }

  setMaxMachines(n: 1 | 2 | 3): void {
    this.maxMachinesPerOp.set(n);
  }


  confirmAndRun(): void {
    this.showRunModal.set(false);
    this._doRun();
  }

  private _doRun(): void {
    this.running.set(true);
    this.errorMsg.set('');
    this.selectedBar.set(null);

    const maxM      = this.maxMachinesPerOp();

    const startIso  = this.startDatetime() + ':00';

    this.svc.runPlanning([], maxM, startIso).subscribe({
      next: d => {
        this.active.set(d);
        this.activePlanning.set(d.id);
        this.running.set(false);
        this.showToast(this.lang.t().planningSuccessRun, 'success');
        this.refreshHistory();
      },
      error: (err: unknown) => {
        this.running.set(false);
        this.errorMsg.set(this._mapRunError(err));
        console.error('[ViewModel] run error:', err);
      }
    });
  }

  exportExcel(): void {
    if (!this.active() || this.exportingExcel()) return;
    this.exportingExcel.set(true);
    this.svc.downloadExcel(this.active()!.id).subscribe({
      next:  () => { this.exportingExcel.set(false); this.showToast('Export Excel téléchargé ✓', 'success'); },
      error: (err: unknown) => { this.exportingExcel.set(false); this.showToast(this._mapExportError(err, 'excel'), 'error'); }
    });
  }

  exportPdf(): void {
    if (!this.active() || this.exportingPdf()) return;
    this.exportingPdf.set(true);
    this.svc.downloadPdf(this.active()!.id).subscribe({
      next:  () => { this.exportingPdf.set(false); this.showToast('Export PDF téléchargé ✓', 'success'); },
      error: (err: unknown) => { this.exportingPdf.set(false); this.showToast(this._mapExportError(err, 'pdf'), 'error'); }
    });
  }

  private refreshHistory(): void {
    this.svc.getAll().subscribe({ next: list => this.history.set(list) });
  }


  private _nowLocal(): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
           `T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }

  private _mapRunError(err: unknown): string {
    const t  = this.lang.t();
    const e  = err as { status?: number; error?: { code?: string; message?: string }; message?: string };
    const code    = e?.error?.code   ?? '';
    const status  = e?.status        ?? 0;
    const rawMsg  = e?.error?.message ?? e?.message ?? '';

    if (code === 'NO_COMMANDES')  return t.planningErrNoCommandes;
    if (code === 'NO_MACHINES')   return t.planningErrNoMachines;
    if (code === 'NO_RECETTES')   return t.planningErrNoRecettes;
    if (code === 'TIMEOUT')       return t.planningErrTimeout;
    if (code === 'INFEASIBLE')    return t.planningErrInfeasible;

    const reNotEnough = /opérations?\s+(?:ne peuvent|ne peut)\s+s['']exécuter\s+que\s+sur\s+(\d+)\s+seule?\s+machine[^:]*:\s*"([^"]+)"/i;
    const mNotEnough = reNotEnough.exec(rawMsg);
    if (mNotEnough) {
      const [, actual, opName] = mNotEnough;
      return t.planningErrNotEnoughMachines
        .replace('{op}', opName)
        .replace('{actual}', actual);
    }

    if (status === 0)   return t.planningErrNetwork;
    if (status === 401) return t.planningErrUnauthorized;
    if (status === 403) return t.planningErrForbidden;
    if (status === 404) return t.planningErrNotFound;
    if (status === 422) return t.planningErrUnprocessable;
    if (status === 429) return t.planningErrRateLimit;
    if (status >= 500)  return t.planningErrServer;

    return rawMsg || t.planningErrNetwork;
  }

  private _mapExportError(err: unknown, type: 'excel' | 'pdf'): string {
    const t  = this.lang.t();
    const e  = err as { status?: number };
    if (e?.status === 0) return type === 'excel' ? t.planningErrExcelEmpty : t.planningErrPdfEmpty;
    return type === 'excel' ? t.planningErrExcelServer : t.planningErrPdfServer;
  }

  showToast(msg: string, type: 'success' | 'error'): void {
    this.toast.set({ msg, type });
    setTimeout(() => this.toast.set(null), 4000);
  }
}
