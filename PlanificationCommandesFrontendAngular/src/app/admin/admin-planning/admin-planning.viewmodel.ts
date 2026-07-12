import { Injectable, inject, signal, computed } from '@angular/core';
import { PlanningService } from '../../shared/services/Planning.service';
import { LanguageService } from '../../shared/services/language.service';
import {
  GanttRow,
  PlanningDetail,
  PlanningSummary,
} from '../../shared/models/planning.model';

export type { GanttRow, PlanningDetail, PlanningSummary };

// ── Constants

export const PPD = 1440;

export const CMD_PALETTE = [
  '#1D4ED8', '#B91C1C', '#15803D', '#7C3AED', '#C2410C', '#0E7490', '#9D174D',
  '#3D9970', '#6D28D9', '#92400E', '#1E40AF', '#991B1B', '#166534', '#5B21B6',
  '#78350F', '#155E75', '#7F1D1D', '#14532D', '#4C1D95', '#713F12', '#0369A1',
  '#BE185D', '#065F46', '#4338CA', '#EA580C', '#10B981', '#F43F5E',
];

export const URGENCE_COLORS: Record<number, string> = {
  1: '#DC2626', 2: '#F97316', 3: '#EAB308', 4: '#22C55E', 5: '#10B981',
};

// ── Sub-types

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

export type SortField =
  | 'machineName' | 'numeroCommande' | 'nomOperation'
  | 'startPM' | 'endPM' | 'dureeMinutes' | 'urgence' | 'lotIdx';

// ── ViewModel

@Injectable()
export class AdminPlanningViewModel {
  private svc  = inject(PlanningService);
  private lang = inject(LanguageService);

  // ── Core state

  active         = signal<PlanningDetail | null>(null);
  history        = signal<PlanningSummary[]>([]);
  toast          = signal<{ msg: string; type: 'success' | 'error' } | null>(null);
  exportingExcel = signal(false);
  exportingPdf   = signal(false);

  // ── Gantt filter

  filterUrgence  = signal(0);
  filterMachine  = signal('');
  filterCommande = signal('');
  selectedBar    = signal<GanttBar | null>(null);

  private _pxPerMin = signal(1.6);
  readonly pxPerMin = this._pxPerMin.asReadonly();

  // ── History filter state

  filterDateFrom = signal('');
  filterDateTo   = signal('');
  filterMakespan = signal<number | null>(null);

  // ── Table sort state

  sortField = signal<SortField>('startPM');
  sortAsc   = signal(true);

  toggleSort(field: SortField): void {
    if (this.sortField() === field) {
      this.sortAsc.update(v => !v);
    } else {
      this.sortField.set(field);
      this.sortAsc.set(true);
    }
  }

  // ── Zoom

  zoomIn()  { this._pxPerMin.update(v => Math.min(v + 0.4, 8)); }
  zoomOut() { this._pxPerMin.update(v => Math.max(v - 0.4, 0.3)); }

  // ── Colour helpers

  private cmdColorMap = computed<Record<string, string>>(() => {
    const rows = this.active()?.rows ?? [];
    const cmds = [...new Set(rows.map(r => r.numeroCommande))];
    return Object.fromEntries(cmds.map((c, i) => [c, CMD_PALETTE[i % CMD_PALETTE.length]]));
  });

  cmdColor(cmd: string): string { return this.cmdColorMap()[cmd] ?? '#94a3b8'; }
  urgColor(u: number):   string { return URGENCE_COLORS[u]       ?? '#94a3b8'; }

  // ── Dimension helpers

  dayWidthPx    = computed(() => PPD * this._pxPerMin());
  totalWidthPx  = computed(() => (this.ticks().filter(t => t.isMajor).length || 1) * this.dayWidthPx());
  totalHeightPx = computed(() => this.visibleMachines().reduce((s, m) => s + m.heightPx, 0));

  // ── Minimum PM (earliest bar start time)

  minPM = computed<number>(() => {
    const rows = this.active()?.rows ?? [];
    if (!rows.length) return 0;
    return Math.min(...rows.map(r => r.startPM));
  });

  // ── Timeline ticks 

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
    const DAYS_EN   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const isFr = this.lang.lang() === 'fr';
    const DAYS = isFr ? DAYS_FR : DAYS_EN;
    const MONTHS = isFr ? MONTHS_FR : MONTHS_EN;

    return Array.from({ length: maxDay + 1 }, (_, d) => {
      const rawXPx = (d * PPD - minPM) * pxMin;

      const cal = new Date(anchor);
      cal.setDate(cal.getDate() + d);
      const label = `${DAYS[cal.getDay()]} ${cal.getDate()} ${MONTHS[cal.getMonth()]} ${cal.getFullYear()}`;

      return {
        xPx:      rawXPx,
        visibleX: Math.max(rawXPx, 0),
        label,
      };
    }).filter(t => t.xPx > -this.dayWidthPx());
  });

  // ── Machine rows ──────────────────────────────────────────────────────────

  machineRows = computed<MachineRow[]>(() => {
    const rows     = this.active()?.rows ?? [];
    const colorMap = this.cmdColorMap();
    const minPM    = this.minPM();
    if (!rows.length) return [];
    const byMachine: Record<string, GanttRow[]> = {};
    rows.forEach(r => { (byMachine[`${r.machineId}|${r.machineName}`] ??= []).push(r); });
    return Object.entries(byMachine)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([key, mRows]) => {
        const [idStr, name] = key.split('|');
        const tracks: number[] = [];
        const barsWithTrack = mRows.slice().sort((a, b) => a.startPM - b.startPM).map(r => {
          const xPx = (r.startPM - minPM) * this._pxPerMin();
          const wPx = Math.max((r.endPM - r.startPM) * this._pxPerMin(), 6);
          let track = tracks.findIndex(end => xPx >= end + 2);
          if (track === -1) { track = tracks.length; tracks.push(0); }
          tracks[track] = xPx + wPx;
          return { row: r, color: colorMap[r.numeroCommande] ?? '#1D4ED8', urgenceColor: URGENCE_COLORS[r.urgence] ?? '#94a3b8', machineIdx: 0, trackIdx: track, xPx, wPx } as GanttBar;
        });
        const nTracks = Math.max(tracks.length, 1);
        return { id: parseInt(idStr), name, bars: barsWithTrack, tracks: nTracks, heightPx: nTracks * 36 + 10 };
      });
  });

  visibleMachines = computed(() => {
    const fm = this.filterMachine().toLowerCase();
    return fm ? this.machineRows().filter(m => m.name.toLowerCase().includes(fm)) : this.machineRows();
  });

  // ── Filtered + sorted rows (table) ───────────────────────────────────────

  filteredRows = computed(() => {
    const rows = this.active()?.rows ?? [];
    const fu   = this.filterUrgence();
    const fm   = this.filterMachine().toLowerCase();
    const fc   = this.filterCommande().toLowerCase();
    const sf   = this.sortField();
    const asc  = this.sortAsc();
    const filtered = rows.filter(r =>
      (!fu || r.urgence === fu) &&
      (!fm || r.machineName.toLowerCase().includes(fm)) &&
      (!fc || r.numeroCommande.toLowerCase().includes(fc))
    );
    filtered.sort((a, b) => {
      let av: string | number = a[sf as keyof GanttRow] as string | number;
      let bv: string | number = b[sf as keyof GanttRow] as string | number;
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      return asc ? (av < bv ? -1 : av > bv ? 1 : 0) : (av > bv ? -1 : av < bv ? 1 : 0);
    });
    return filtered;
  });

  // ── Late delivery detection ────────────────────────────────────────────────

  /**
   * Returns true when the scheduled finish of an operation exceeds its export
   * deadline. Uses the active planning's dateDebut as the time anchor so that
   * endPM (minutes-from-start) can be converted to an absolute datetime.
   *
   * @param endPM      - operation end in minutes from planning start
   * @param dateExport - deadline date string, e.g. "2026-05-22"
   */
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

  // ── Warning translation ───────────────────────────────────────────────────

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
        const isFr = this.lang.lang() === 'fr';
        return isFr
          ? `Commande ${cmd} — livraison prévue le ${dateEnd}, échéance dépassée le ${dateExport} (${daysLate} jour(s))`
          : `Order ${cmd} — scheduled delivery ${dateEnd}, deadline exceeded ${dateExport} (${daysLate} day(s))`;
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

  // ── KPI signals ───────────────────────────────────────────────────────────

  activeMachines = computed(() => new Set((this.active()?.rows ?? []).map(r => r.machineId)).size);

  /**
   * Derives makespan from row data (max endPM − minPM) so it's never 0
   * even when the PlanningDetail.makespanDays field is missing/zero.
   */
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

  totalCommandes = computed(() => new Set((this.active()?.rows ?? []).map(r => r.numeroCommande)).size);
  totalLignes    = computed(() => this.history().reduce((s, h) => s + h.nombreLignes, 0));
  optimalCount   = computed(() => this.history().filter(h => h.statut === 'optimal').length);

  // ── Filtered history ──────────────────────────────────────────────────────

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

  // ── Bar helpers ───────────────────────────────────────────────────────────

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

  // ── Data actions ──────────────────────────────────────────────────────────

  loadInitial(): void {
    this.svc.getAll().subscribe({
      next: list => {
        this.history.set(list);
        if (list.length) {
          this.svc.getById(list[0].id).subscribe({ next: d => this.active.set(d) });
        }
      },
    });
  }

  loadHistory(id: string): void {
    if (!id) return;
    this.svc.getById(+id).subscribe({
      next: d => { this.active.set(d); this.selectedBar.set(null); },
    });
  }

  exportExcel(): void {
    if (!this.active() || this.exportingExcel()) return;
    this.exportingExcel.set(true);
    this.svc.downloadExcel(this.active()!.id).subscribe({
      next:  () => { this.exportingExcel.set(false); this.showToast('Export Excel téléchargé ✓', 'success'); },
      error: () => { this.exportingExcel.set(false); this.showToast("Erreur lors de l'export Excel.", 'error'); },
    });
  }

  exportPdf(): void {
    if (!this.active() || this.exportingPdf()) return;
    this.exportingPdf.set(true);
    this.svc.downloadPdf(this.active()!.id).subscribe({
      next:  () => { this.exportingPdf.set(false); this.showToast('Export PDF téléchargé ✓', 'success'); },
      error: () => { this.exportingPdf.set(false); this.showToast("Erreur lors de l'export PDF.", 'error'); },
    });
  }

  showToast(msg: string, type: 'success' | 'error'): void {
    this.toast.set({ msg, type });
    setTimeout(() => this.toast.set(null), 4000);
  }
}
