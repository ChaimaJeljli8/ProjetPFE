import { Injectable, inject, signal, computed } from '@angular/core';
import { CommandeService } from '../../shared/services/commande.service';
import { MachineService  } from '../../shared/services/machine.service';
import { PlanningService } from '../../shared/services/Planning.service';
import { RecetteService  } from '../../shared/services/recette.service';
import { AuthService     } from '../../shared/services/auth.service';
import { LanguageService } from '../../shared/services/language.service';
import { firstValueFrom  } from 'rxjs';
import { ReportService, DeadlineComplianceReport } from '../../shared/services/report.service';
import { AlertService, AlertError } from '../../shared/services/Alert.service';
import { AlertSummaryDto }          from '../../shared/models/alert.model';
import { ActivePlanningService }    from '../../shared/services/active-planning.service';

export interface DelayAlert {
  id:             number;
  commandeId:     number;
  numeroCommande: string;
  dateExport:     Date;
  daysRemaining:  number;
  severity:       'critical' | 'warning';
  message:        string;
  urgence:        boolean;
}


export interface BottleneckAlert {
  id:               number;
  machineId:        number;
  machineName:      string;
  loadPct:          number;
  scheduledMinutes: number;
  capaciteMinutes:  number;
  type:             'overloaded' | 'underused' | 'inactive';
  severity:         'critical' | 'warning';
  message:          string;
}

export interface DashboardStats {
  totalCommandes:          number;
  commandesEnAttente:      number;
  commandesEnCours:        number;
  commandesTerminees:      number;
  commandesCritiques:      number;
  commandesUrgentes:       number;
  tauxAchevement:          number;
  totalMachines:           number;
  machinesFonctionnelles:  number;
  tauxChargeMachines:      number;
  totalPlannings:          number;
  makespanMoyen:           number;
  makespanMoyenMinutes:    number;
  totalRecettes:           number;
  totalOperations:         number;
  avgOpsPerRecette:        number;
  planificationEfficacite: number;
  qualitePlannings:        number;
}

const OVERLOAD_PCT = 85;
const UNDERUSE_PCT = 40;
const PPD          = 1440;

const TYPE_ORDER: Record<string, number> = { overloaded: 0, underused: 1, inactive: 2 };

function readAlertError(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'message' in err) {
    return (err as AlertError).message || fallback;
  }
  return fallback;
}

@Injectable()
export class PlannerDashboardViewModel {
  private cmde           = inject(CommandeService);
  private mach           = inject(MachineService);
  private plan           = inject(PlanningService);
  private rece           = inject(RecetteService);
  private rept           = inject(ReportService);
  private alert          = inject(AlertService);
  private activePlanning = inject(ActivePlanningService);
  readonly auth = inject(AuthService);
  readonly lang = inject(LanguageService);

  readonly t = this.lang.t;

  //  Loading
  readonly loading      = signal(true);
  readonly error        = signal('');
  readonly alertLoading = signal(false);


  readonly alertPanelError      = signal('');

  readonly bottleneckPanelError = signal('');

  // ── UI state
  readonly today    = signal('');
  readonly greeting = signal('');
  readonly userName = signal('');

  // ── KPI stats
  readonly stats = signal<DashboardStats>({
    totalCommandes:          0,
    commandesEnAttente:      0,
    commandesEnCours:        0,
    commandesTerminees:      0,
    commandesCritiques:      0,
    commandesUrgentes:       0,
    tauxAchevement:          0,
    totalMachines:           0,
    machinesFonctionnelles:  0,
    tauxChargeMachines:      0,
    totalPlannings:          0,
    makespanMoyen:           0,
    makespanMoyenMinutes:    0,
    totalRecettes:           0,
    totalOperations:         0,
    avgOpsPerRecette:        0,
    planificationEfficacite: 0,
    qualitePlannings:        0,
  });

  // ── Delay alerts
  readonly delayAlerts    = signal<DelayAlert[]>([]);
  readonly filteredAlerts = signal<DelayAlert[]>([]);
  readonly alertFilter    = signal<'all' | 'critical' | 'warning'>('all');

  // ── Bottleneck alerts
  readonly bottleneckAlerts         = signal<BottleneckAlert[]>([]);
  readonly filteredBottleneckAlerts = signal<BottleneckAlert[]>([]);
  readonly bottleneckFilter         = signal<'all' | 'overloaded' | 'underused' | 'inactive'>('all');
  readonly showBottleneckPanel      = signal(false);

  readonly bottleneckBadgeCount = computed(() => this.bottleneckAlerts().length);

  // ── Chart / filter state
  readonly planningFilter         = signal(0);
  readonly rawData                = signal<Record<string, any>>({});
  readonly availableMachines      = signal<any[]>([]);
  readonly recetteOpsIndex        = signal<any[]>([]);
  readonly selectedRecetteOpsIdx  = signal<string>('');
  readonly selectedRecetteOpsData = computed(() => {
    const idx = parseInt(this.selectedRecetteOpsIdx(), 10);
    return isNaN(idx) ? null : (this.recetteOpsIndex()[idx] ?? null);
  });

  readonly criticalAlertsCount = computed(() =>
    this.delayAlerts().filter(a => a.severity === 'critical').length
  );

  readonly lastPlanningResult = signal<any>(null);

  readonly planningKpi = computed(() => {
    const p = this.lastPlanningResult();
    if (!p) return null;

    const rows: any[] = Array.isArray(p.rows) ? p.rows : [];
    const uniqueCommandeIds = new Set(
      rows.map((r: any) => r.commandeId ?? r.CommandeId).filter((id: any) => id != null)
    );

    const locale = this.t().appLocale ?? 'fr-FR';
    const dateDebut = p.dateDebut
      ? new Intl.DateTimeFormat(locale, {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        }).format(new Date(p.dateDebut))
      : '—';

    return {
      nombreLignes:    rows.length,
      nombreCommandes: uniqueCommandeIds.size,
      dateDebut,
      makespanDays:    p.makespanDays ?? 0,
      warnings:        p.warnings     ?? [],
    };
  });

  // ── Deadline-compliance report
  readonly complianceReport    = signal<DeadlineComplianceReport | null>(null);
  readonly complianceLoading   = signal(false);
  readonly complianceError     = signal('');
  readonly complianceDateFrom  = signal('');
  readonly complianceDateTo    = signal('');
  readonly complianceRowFilter = signal<'all' | 'OnTime' | 'Late' | 'Pending'>('all');

  readonly filteredComplianceRows = computed(() => {
    const report = this.complianceReport();
    if (!report) return [];
    const f = this.complianceRowFilter();
    return f === 'all' ? report.rows : report.rows.filter(r => r.status === f);
  });


  async loadData(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set('');
      this.alertPanelError.set('');
      this.bottleneckPanelError.set('');

      const [cmd, mach, plan, rec] = await Promise.all([
        firstValueFrom(this.cmde.getAll()),
        firstValueFrom(this.mach.getMachines()),
        firstValueFrom(this.plan.getAll()),
        firstValueFrom(this.rece.getAll()),
      ]);

      let lastPlanDetail: any = null;
      if (plan?.length) {
        const latest = [...plan].sort((a: any, b: any) => (b.id ?? 0) - (a.id ?? 0))[0];
        try {
          lastPlanDetail = await firstValueFrom(this.plan.getById(latest.id));
          this.lastPlanningResult.set(lastPlanDetail);
          this.activePlanning.set(lastPlanDetail.id);
        } catch {
        }
      }

      this.rawData.set({ cmd, mach, plan, rec });
      this.availableMachines.set(mach || []);
      this._computeStats(cmd, mach, plan, rec, lastPlanDetail);
      this._buildOpsIndex(cmd, rec);
      this._updateUI();
      this.loading.set(false);
    } catch (err: unknown) {
      this.error.set(readAlertError(err, this.t().dashboardLoadError));
      this.loading.set(false);
      return;
    }

    try {
      const alertSummary = await firstValueFrom(this.alert.getCurrent());
      this._applyAlertSummary(alertSummary);
    } catch (err: unknown) {
      const msg = readAlertError(err, this.t()['alertErrLoadFailed'] ?? this.t().dashboardLoadError);
      this.alertPanelError.set(msg);
      this.bottleneckPanelError.set(msg);
    }
  }


  async refreshAlerts(): Promise<void> {
    this.alertPanelError.set('');
    this.bottleneckPanelError.set('');
    try {
      this.alertLoading.set(true);
      const summary = await firstValueFrom(this.alert.refresh());
      this._applyAlertSummary(summary);
    } catch (err: unknown) {
      const msg = readAlertError(err, this.t()['alertErrRefreshFailed'] ?? this.t().genericError);
      this.alertPanelError.set(msg);
      this.bottleneckPanelError.set(msg);
    } finally {
      this.alertLoading.set(false);
    }
  }

  //  Delay alert actions

  setAlertFilter(f: 'all' | 'critical' | 'warning'): void {
    this.alertFilter.set(f);
    this._applyAlertFilter();
  }

  async dismissAlert(alertId: number): Promise<void> {
    this.alertPanelError.set('');
    try {
      await firstValueFrom(this.alert.dismiss(alertId));
      this.delayAlerts.set(this.delayAlerts().filter(a => a.id !== alertId));
      this._applyAlertFilter();
    } catch (err: unknown) {
      this.alertPanelError.set(
        readAlertError(err, this.t()['alertErrDismissFailed'] ?? this.t().genericError)
      );
    }
  }

  async dismissAllAlerts(): Promise<void> {
    this.alertPanelError.set('');
    try {
      this.alertLoading.set(true);
      await firstValueFrom(this.alert.dismissAllDelay());
      this.delayAlerts.set([]);
      this._applyAlertFilter();
    } catch (err: unknown) {
      this.alertPanelError.set(
        readAlertError(err, this.t()['alertErrDismissAllDelay'] ?? this.t().genericError)
      );
    } finally {
      this.alertLoading.set(false);
    }
  }

  //  Bottleneck alert actions

  toggleBottleneckPanel(): void {
    this.showBottleneckPanel.set(!this.showBottleneckPanel());
  }

  setBottleneckFilter(f: 'all' | 'overloaded' | 'underused' | 'inactive'): void {
    this.bottleneckFilter.set(f);
    this._applyBottleneckFilter();
  }

  async dismissBottleneckAlert(alertId: number): Promise<void> {
    this.bottleneckPanelError.set('');
    try {
      await firstValueFrom(this.alert.dismiss(alertId));
      this.bottleneckAlerts.set(this.bottleneckAlerts().filter(a => a.id !== alertId));
      this._applyBottleneckFilter();
    } catch (err: unknown) {
      this.bottleneckPanelError.set(
        readAlertError(err, this.t()['alertErrDismissFailed'] ?? this.t().genericError)
      );
    }
  }

  async dismissAllBottleneckAlerts(): Promise<void> {
    this.bottleneckPanelError.set('');
    try {
      this.alertLoading.set(true);
      await firstValueFrom(this.alert.dismissAllBottleneck());
      this.bottleneckAlerts.set([]);
      this._applyBottleneckFilter();
    } catch (err: unknown) {
      this.bottleneckPanelError.set(
        readAlertError(err, this.t()['alertErrDismissAllBottleneck'] ?? this.t().genericError)
      );
    } finally {
      this.alertLoading.set(false);
    }
  }



  formatMakespanSimple(days: number): string {
    if (!days || days < 0) return '—';
    if (days < 1)  return `${(days * 24).toFixed(0)}h`;
    if (days < 10) return `${days.toFixed(1)}j`;
    return `${Math.round(days)}j`;
  }

  getTotalDuration(ops: any[]): number {
    if (!Array.isArray(ops)) return 0;
    return ops.reduce((sum: number, op: any) => sum + (op.dureeMinutes ?? 0), 0);
  }

  getMaxOpDuration(ops?: any[]): number {
    if (!ops || !Array.isArray(ops) || ops.length === 0) return 0;
    return ops.reduce((m: number, op: any) => Math.max(m, op.dureeMinutes ?? 0), 0);
  }

  async loadComplianceReport(): Promise<void> {
    this.complianceLoading.set(true);
    this.complianceError.set('');
    try {
      const from = this.complianceDateFrom() || undefined;
      const to   = this.complianceDateTo()   || undefined;
      const data = await firstValueFrom(this.rept.getDeadlineCompliance(from, to));
      this.complianceReport.set(data);
    } catch (err: any) {
      this.complianceError.set(err.message || this.t().complianceLoadError);
    } finally {
      this.complianceLoading.set(false);
    }
  }

  setComplianceRowFilter(f: 'all' | 'OnTime' | 'Late' | 'Pending'): void {
    this.complianceRowFilter.set(f);
  }


  private _updateUI(): void {
    const hour = new Date().getHours();
    const grt  = hour < 12 ? this.t()['goodMorning']
               : hour < 18 ? this.t()['goodAfternoon']
               :              this.t()['goodEvening'];
    this.greeting.set(grt ?? 'Bonjour');
    this.userName.set(this.auth.currentUser?.()?.firstName ?? 'User');
    const locale = this.t()['appLocale'] ?? 'fr-FR';
    this.today.set(
      new Intl.DateTimeFormat(locale, {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      }).format(new Date())
    );
  }

  private _applyAlertSummary(summary: AlertSummaryDto): void {
    const now = new Date();

    const delayAlerts: DelayAlert[] = summary.delayAlerts
      .filter(a => !a.isDismissed)
      .filter(dto => !!dto.dateExport && !!dto.commandeId)
      .map(dto => {
        const exportDate    = new Date(dto.dateExport!);
        const daysRemaining = Math.ceil(
          (exportDate.getTime() - now.getTime()) / 86_400_000
        );

        const severity: 'critical' | 'warning' =
          daysRemaining <= 0 ? 'critical' : 'warning';

        let message: string;
        if (daysRemaining < 0) {
          message = this.t().alertsMsgOverdue?.replace('{days}', String(-daysRemaining))
            ?? dto.message;
        } else if (daysRemaining === 0) {
          message = this.t().alertsMsgDueToday ?? dto.message;
        } else {
          message = this.t().alertsMsgWarning?.replace('{days}', String(daysRemaining))
            ?? dto.message;
        }

        return {
          id:             dto.id,
          commandeId:     dto.commandeId!,
          numeroCommande: dto.numeroCommande ?? `#${dto.commandeId}`,
          dateExport:     exportDate,
          daysRemaining,
          severity,
          message,
          urgence:        dto.urgence ?? false,
        } satisfies DelayAlert;
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining);

    this.delayAlerts.set(delayAlerts);
    this._applyAlertFilter();

    const bottleneckAlerts: BottleneckAlert[] = summary.bottleneckAlerts
      .filter(a => !a.isDismissed)
      .filter(dto => !!dto.machineId)
      .map(dto => {
        const type = (dto.bottleneckType ?? 'inactive') as 'overloaded' | 'underused' | 'inactive';

        let message: string;
        if (type === 'overloaded') {
          message = (this.t().notifMsgOverloaded ?? dto.message)
            .replace('{pct}',       String(dto.loadPct))
            .replace('{threshold}', String(OVERLOAD_PCT));
        } else if (type === 'inactive') {
          message = this.t().notifMsgInactive ?? dto.message;
        } else {
          message = (this.t().notifMsgUnderused ?? dto.message)
            .replace('{pct}',       String(dto.loadPct))
            .replace('{threshold}', String(UNDERUSE_PCT));
        }

        return {
          id:               dto.id,
          machineId:        dto.machineId!,
          machineName:      dto.machineName ?? `Machine #${dto.machineId}`,
          loadPct:          dto.loadPct          ?? 0,
          scheduledMinutes: dto.scheduledMinutes ?? 0,
          capaciteMinutes:  dto.capaciteMinutes  ?? PPD,
          type,
          severity: dto.severity as 'critical' | 'warning',
          message,
        } satisfies BottleneckAlert;
      })
      .sort((a, b) => {
        if (a.severity !== b.severity) return a.severity === 'critical' ? -1 : 1;
        const typeOrder = (TYPE_ORDER[a.type] ?? 9) - (TYPE_ORDER[b.type] ?? 9);
        if (typeOrder !== 0) return typeOrder;
        return b.loadPct - a.loadPct;
      });

    this.bottleneckAlerts.set(bottleneckAlerts);
    this._applyBottleneckFilter();
  }

  private _applyAlertFilter(): void {
    const alerts = this.delayAlerts();
    const f      = this.alertFilter();
    this.filteredAlerts.set(f === 'all' ? alerts : alerts.filter(a => a.severity === f));
  }

  private _applyBottleneckFilter(): void {
    const alerts = this.bottleneckAlerts();
    const f      = this.bottleneckFilter();
    this.filteredBottleneckAlerts.set(
      f === 'all' ? alerts : alerts.filter(a => a.type === f)
    );
  }

  private _buildOpsIndex(cmd: any[], rec: any[]): void {
    const recLookup: Record<number, any> = {};
    rec.forEach((r: any) => { recLookup[r.id] = r; });

    const countMap: Record<number, number> = {};
    cmd.forEach((c: any) => {
      const id = c.recetteId ?? c.recette?.id;
      if (id != null) countMap[id] = (countMap[id] ?? 0) + 1;
    });

    const index = Object.entries(countMap)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 8)
      .map(([idStr]) => {
        const r = recLookup[Number(idStr)];
        if (!r) return null;
        return {
          nom: r.nomRecette,
          ops: (r.operations ?? []).map((o: any) => ({
            nomOperation: o.nomOperation ?? '—',
            dureeMinutes: o.dureeMinutes ?? 0,
          })),
        };
      })
      .filter(Boolean) as any[];

    this.recetteOpsIndex.set(index);
  }

  private _computePerMachineLoad(
    rows: any[]
  ): Record<number, { scheduledMinutes: number; capaciteMinutes: number; loadPct: number }> {

    const raw: Record<number, { scheduled: number; starts: number[]; ends: number[] }> = {};

    for (const r of rows) {
      const mid = r.machineId    ?? r.MachineId;
      const dur = r.dureeMinutes ?? r.DureeMinutes ?? 0;
      const spm = r.startPM      ?? r.StartPM;
      const epm = r.endPM        ?? r.EndPM;

      if (mid == null) continue;
      if (!raw[mid]) raw[mid] = { scheduled: 0, starts: [], ends: [] };

      raw[mid].scheduled += dur;
      if (spm != null && spm > 0) raw[mid].starts.push(spm);
      if (epm != null && epm > 0) raw[mid].ends.push(epm);
    }

    const result: Record<number, { scheduledMinutes: number; capaciteMinutes: number; loadPct: number }> = {};

    for (const [midStr, data] of Object.entries(raw)) {
      const mid       = Number(midStr);
      const scheduled = data.scheduled;

      let capaciteMinutes: number;
      if (data.starts.length > 0 && data.ends.length > 0) {
        const ownSpan = Math.max(...data.ends) - Math.min(...data.starts);
        const ownDays = Math.max(1, Math.ceil(ownSpan / PPD));
        capaciteMinutes = ownDays * PPD;
      } else {
        capaciteMinutes = PPD;
      }

      result[mid] = {
        scheduledMinutes: scheduled,
        capaciteMinutes,
        loadPct: Math.round((scheduled / capaciteMinutes) * 100),
      };
    }

    return result;
  }

  private _computeStats(
    cmd: any[], mach: any[], plan: any[], rec: any[], lastPlanDetail?: any
  ): void {
    const sl = (s: string) => (s ?? '').toLowerCase();

    const validPlans    = plan.filter((p: any) => sl(p.statut) === 'validé');
    const makespanSum   = plan.reduce((s: number, p: any) => s + (p.makespanDays ?? 0), 0);
    const makespanMoyen = plan.length > 0 ? makespanSum / plan.length : 0;

    let tauxChargeMachines = 0;
    if (mach.length > 0) {
      const rows: any[] = lastPlanDetail?.rows ?? [];
      if (rows.length > 0) {
        const perMachineLoad = this._computePerMachineLoad(rows);
        const loadValues = mach.map((m: any) => perMachineLoad[m.id]?.loadPct ?? 0);
        tauxChargeMachines = Math.round(
          loadValues.reduce((s, v) => s + v, 0) / mach.length
        );
      } else {
        const functional = mach.filter(
          (m: any) => sl(m.statut) !== 'en panne' && sl(m.statut) !== 'maintenance'
        );
        tauxChargeMachines = Math.round((functional.length / mach.length) * 100);
      }
    }

    this.stats.set({
      totalCommandes:     cmd.length,
      commandesEnAttente: cmd.filter(c => !c.statut || sl(c.statut) === 'en attente').length,
      commandesEnCours:   cmd.filter(c => sl(c.statut) === 'en cours').length,
      commandesTerminees: cmd.filter(c => sl(c.statut) === 'livré' || sl(c.statut) === 'terminé').length,
      commandesCritiques: cmd.filter(c =>
        sl(c.statut) !== 'livré' && sl(c.statut) !== 'annulé' &&
        c.dateExport && new Date(c.dateExport) <= new Date()
      ).length,
      commandesUrgentes:  cmd.filter(c => c.urgence === 1).length,
      tauxAchevement:     cmd.length
        ? Math.round(cmd.filter(c => sl(c.statut) === 'livré').length / cmd.length * 100) : 0,
      totalMachines:          mach.length,
      machinesFonctionnelles: mach.filter((m: any) => sl(m.statut) !== 'en panne').length,
      tauxChargeMachines,
      totalPlannings:          plan.length,
      makespanMoyen,
      makespanMoyenMinutes:    Math.round(makespanMoyen * 1440),
      planificationEfficacite: plan.length
        ? Math.round(validPlans.length / plan.length * 100) : 0,
      qualitePlannings: plan.length
        ? Math.round(validPlans.length / plan.length * 100) : 0,
      totalRecettes:   rec.length,
      totalOperations: rec.reduce((s: number, r: any) => s + (r.operations?.length ?? 0), 0),
      avgOpsPerRecette: rec.length
        ? Math.round(
            rec.reduce((s: number, r: any) => s + (r.operations?.length ?? 0), 0) / rec.length
          ) : 0,
    });
  }
}
