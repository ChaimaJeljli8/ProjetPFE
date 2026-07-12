import { Injectable, inject } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { PlanningService } from '../../shared/services/Planning.service';
import { LanguageService } from '../../shared/services/language.service';

export interface DashboardStats {
  totalPlannings:  number;
  totalLignes:     number;
  totalCommandes:  number;
  makespanJours:   number;
  makespanPM:      number;
  statutPlanning:  string;
  dernierPlanning: string;
}

export interface ChartConfig {
  machineOpsData:   { labels: string[]; data: number[]; colors: string[] } | null;
  makespanData:     { labels: string[]; data: number[] } | null;
  commandesData:    { labels: string[]; data: number[]; maxCmd: number } | null;
}

@Injectable()
export class WorkerDashboardViewModel {
  readonly auth = inject(AuthService);
  readonly t    = inject(LanguageService).t;
  private svc   = inject(PlanningService);

  //  State
  loading    = true;
  error      = '';
  clockTime  = '';
  shiftPct   = 0;
  shiftArc   = 0;
  shiftLabel = '';

  filterMode: 'all' | '10' | '20' = 'all';
  planningRows: any[] = [];

  stats: DashboardStats = {
    totalPlannings:  0,
    totalLignes:     0,
    totalCommandes:  0,
    makespanJours:   0,
    makespanPM:      0,
    statutPlanning:  '—',
    dernierPlanning: '—',
  };

  chartConfig: ChartConfig = {
    machineOpsData:  null,
    makespanData:    null,
    commandesData:   null,
  };

  rawPlannings: any[]     = [];
  lastPlanningDetail: any = null;

  private clockTimer?: ReturnType<typeof setInterval>;

  //  Computed
  get today(): string {
    return new Date().toLocaleDateString(this.t().appLocale, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  //  Lifecycle helpers
  init(): void {
    this.updateClock();
    this.clockTimer = setInterval(() => this.updateClock(), 30_000);
  }

  destroy(): void {
    if (this.clockTimer) clearInterval(this.clockTimer);
  }

  //  Clock
  updateClock(): void {
    const now = new Date();
    const h   = now.getHours();
    const m   = now.getMinutes();
    this.clockTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const minsSinceStart = Math.max(0, (h - 8) * 60 + m);
    this.shiftPct = Math.min(100, Math.round(minsSinceStart / 540 * 100));
    this.shiftArc = (this.shiftPct / 100) * 213.6;
    if      (h < 8)  this.shiftLabel = this.t().workerDashShiftBefore;
    else if (h < 12) this.shiftLabel = this.t().workerDashShiftMorning;
    else if (h < 13) this.shiftLabel = this.t().workerDashShiftLunch;
    else if (h < 17) this.shiftLabel = this.t().workerDashShiftAfternoon;
    else             this.shiftLabel = this.t().workerDashShiftEnd;
  }

  //  Data loading
  async loadData(): Promise<void> {
    try {
      const plannings = await this.svc.getAll().toPromise() ?? [];
      this.rawPlannings         = plannings;
      this.stats.totalPlannings = plannings.length;

      this.applyFilter();

      if (plannings.length > 0) {
        const newest = plannings[0] as any;

        try {
          this.lastPlanningDetail = await this.svc.getById(newest.id).toPromise();
        } catch { /* non-blocking */ }

        const rows: any[] = this.lastPlanningDetail?.rows ?? [];

        const rawStatut           = (newest.statut ?? '') as string;
        this.stats.statutPlanning = rawStatut
          ? rawStatut.charAt(0).toUpperCase() + rawStatut.slice(1).toLowerCase()
          : '—';

        const rawDate              = (newest.dateGeneration ?? newest.dateDebut ?? '') as string;
        this.stats.dernierPlanning = rawDate ? rawDate.slice(0, 10) : '—';

        this.stats.totalLignes    = newest.nombreLignes ?? 0;
        this.stats.totalCommandes = newest.nombreCommandes ?? 0;

        if (rows.length) {
          const PPD      = 1440;
          const minPM    = Math.min(...rows.map((r: any) => r.startPM));
          const maxEndPM = Math.max(...rows.map((r: any) => r.endPM));
          const totalMins = maxEndPM - minPM;
          this.stats.makespanJours = Math.floor(totalMins / PPD);
          this.stats.makespanPM    = totalMins % PPD;
        } else {
          const ms = newest.makespanDays ?? 0;
          this.stats.makespanJours = Math.floor(ms);
          this.stats.makespanPM    = Math.round((ms % 1) * 1440);
        }
      }

      // Fetch details for last 10 plannings in parallel to get accurate nombreCommandes
      await this.buildChartConfig();

      this.loading = false;
    } catch (e: any) {
      this.error   = e?.message ?? 'Erreur réseau';
      this.loading = false;
    }
  }

  async reload(): Promise<void> {
    this.error              = '';
    this.loading            = true;
    this.lastPlanningDetail = null;
    this.filterMode         = 'all';
    this.stats = {
      totalPlannings: 0, totalLignes: 0, totalCommandes: 0,
      makespanJours: 0, makespanPM: 0, statutPlanning: '—', dernierPlanning: '—',
    };
    await this.loadData();
  }

  //  Filter
  applyFilter(): void {
    if (this.filterMode === '10') {
      this.planningRows = this.rawPlannings.slice(0, 10);
    } else if (this.filterMode === '20') {
      this.planningRows = this.rawPlannings.slice(0, 20);
    } else {
      this.planningRows = [...this.rawPlannings];
    }
  }

  //  Chart config
  private async buildChartConfig(): Promise<void> {
    if (this.stats.totalPlannings === 0) return;

    // Machine ops — from newest detail already fetched
    if (this.lastPlanningDetail?.rows) {
      const map: Record<string, number> = {};
      this.lastPlanningDetail.rows.forEach((r: any) => {
        const k = r.machineName ?? `M${r.machineId}`;
        map[k] = (map[k] || 0) + 1;
      });
      const entries = Object.entries(map).sort((a: any, b: any) => b[1] - a[1]).slice(0, 10);
      const cols = ['#14b8a6','#0ea5e9','#8b5cf6','#f59e0b','#22c55e','#ef4444','#3b82f6','#ec4899','#6366f1','#84cc16'];
      this.chartConfig.machineOpsData = {
        labels: entries.map(([k]) => k),
        data:   entries.map(([, v]) => v as number),
        colors: entries.map((_, i) => cols[i % cols.length]),
      };
    }

    // Last 10 plannings sorted by id
    const ps = [...this.rawPlannings].sort((a: any, b: any) => a.id - b.id).slice(-10);
    const labels = ps.map((p: any, i: number) => `#${p.id ?? (i + 1)}`);

    // Makespan from summary
    this.chartConfig.makespanData = {
      labels,
      data: ps.map((p: any) => +(p.makespanDays ?? 0).toFixed(2)),
    };


    const detailResults = await Promise.allSettled(
      ps.map((p: any) =>
        this.lastPlanningDetail?.id === p.id
          ? Promise.resolve(this.lastPlanningDetail)
          : this.svc.getById(p.id).toPromise()
      )
    );

    const commandesData = ps.map((p: any, i: number) => {
      const res = detailResults[i];
      if (res.status === 'fulfilled' && res.value) {
        const detail = res.value as any;
        const rows: any[] = detail.rows ?? [];
        if (rows.length > 0) {
          const uniqueIds = new Set(
            rows.map((r: any) => r.commandeId ?? r.CommandeId).filter((id: any) => id != null)
          );
          if (uniqueIds.size > 0) return uniqueIds.size;
        }

        if ((detail.nombreCommandes ?? 0) > 0) return detail.nombreCommandes;
      }

      return p.nombreCommandes ?? 0;
    });

    console.log('[WorkerDash] commandesData:', commandesData, 'labels:', labels);

    const maxCmd = Math.max(...commandesData, 1);
    this.chartConfig.commandesData = { labels, data: commandesData, maxCmd };
  }

  //  Formatters
  formatDate(iso: string | null | undefined): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso.slice(0, 10);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm} ${hh}:${mi}`;
  }

  formatMakespan(p: any): string {
    const PPD  = 1440;
    const days = p.makespanDays ?? 0;
    const j    = Math.floor(days);
    const mins = Math.round((days % 1) * PPD);
    if (j > 0 && mins > 0) return `${j}j ${mins}min`;
    if (j > 0)             return `${j}j`;
    if (mins >= 60)        return `${Math.floor(mins / 60)}h${mins % 60 > 0 ? String(mins % 60).padStart(2, '0') : ''}`;
    if (mins > 0)          return `${mins}min`;
    return '—';
  }
}
