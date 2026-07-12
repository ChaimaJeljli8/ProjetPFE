import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CommandeService } from '../../shared/services/commande.service';
import { MachineService  } from '../../shared/services/machine.service';
import { PlanningService } from '../../shared/services/Planning.service';
import { RecetteService  } from '../../shared/services/recette.service';
import { UserApiService  } from '../../shared/services/user-api.service';
import { AuthService     } from '../../shared/services/auth.service';
import { LanguageService } from '../../shared/services/language.service';
import { ReportService, DeadlineComplianceReport } from '../../shared/services/report.service';


export interface AdminDashboardStats {
  totalCommandes:       number;
  commandesEnAttente:   number;
  commandesTerminees:   number;
  commandesUrgentes:    number;
  commandesEnRetard:    number;
  tauxAchevement:       number;
  totalMachines:        number;
  machinesFonctionnelles: number;
  machinesEnPanne:      number;
  tauxChargeMachines:   number;
  totalPlannings:       number;
  makespanMoyen:        number;
  makespanMoyenMinutes: number;
  makespanMoyenRaw:     number;
  totalRecettes:        number;
  totalOperations:      number;
  avgOpsPerRecette:     number;
  totalUtilisateurs:    number;
  totalAdmins:          number;
  totalPlanners:        number;
  totalWorkers:         number;
}

@Injectable()
export class AdminDashboardViewModel {
  private commandeSvc = inject(CommandeService);
  private machineSvc  = inject(MachineService);
  private planningSvc = inject(PlanningService);
  private recetteSvc  = inject(RecetteService);
  private userSvc     = inject(UserApiService);
  private rept        = inject(ReportService);
  readonly auth       = inject(AuthService);
  readonly lang       = inject(LanguageService);

  readonly t = this.lang.t;

  // ── Loading / error
  readonly loading = signal(true);
  readonly error   = signal('');

  // ── UI state
  readonly today    = signal('');
  readonly greeting = signal('');
  readonly userName = signal('');

  // ── Stats
  readonly stats = signal<AdminDashboardStats>({
    totalCommandes: 0, commandesEnAttente: 0, commandesTerminees: 0,
    commandesUrgentes: 0, commandesEnRetard: 0, tauxAchevement: 0,
    totalMachines: 0, machinesFonctionnelles: 0, machinesEnPanne: 0, tauxChargeMachines: 0,
    totalPlannings: 0, makespanMoyen: 0, makespanMoyenMinutes: 0, makespanMoyenRaw: 0,
    totalRecettes: 0, totalOperations: 0, avgOpsPerRecette: 0,
    totalUtilisateurs: 0, totalAdmins: 0, totalPlanners: 0, totalWorkers: 0,
  });

  // ── Chart / filter state
  readonly planningFilter = signal(10);   // 0 = all
  readonly machineView    = signal<'all' | 'fonctionnel' | 'non'>('all');
  readonly topRecCount    = signal(5);

  readonly rawData = signal<Record<string, any[]>>({});

  readonly recetteOpsIndex = signal<
    Array<{ nom: string; ops: Array<{ nomOperation: string; dureeMinutes: number }> }>
  >([]);

  // ── Deadline-compliance report
  readonly complianceReport   = signal<DeadlineComplianceReport | null>(null);
  readonly complianceLoading  = signal(false);
  readonly complianceError    = signal('');
  readonly complianceDateFrom = signal('');
  readonly complianceDateTo   = signal('');
  readonly complianceRowFilter = signal<'all' | 'OnTime' | 'Late' | 'Pending'>('all');

  readonly filteredComplianceRows = computed(() => {
    const report = this.complianceReport();
    if (!report) return [];
    const f = this.complianceRowFilter();
    return f === 'all' ? report.rows : report.rows.filter(r => r.status === f);
  });

  // ── Public API

  async loadData(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set('');
      this._updateUI();

      const [commandes, machines, plannings, recettes, users] = await Promise.all([
        firstValueFrom(this.commandeSvc.getAll()),
        firstValueFrom(this.machineSvc.getMachines()),
        firstValueFrom(this.planningSvc.getAll()),
        firstValueFrom(this.recetteSvc.getAll()),
        this.userSvc.getAllUsers(),
      ]);

      const cmd  = (commandes ?? []) as any[];
      const mach = (machines  ?? []) as any[];
      const plan = (plannings ?? []) as any[];
      const rec  = (recettes  ?? []) as any[];
      const usr  = (users     ?? []) as any[];

      this.rawData.set({ cmd, mach, plan, rec, usr });
      this._computeStats(cmd, mach, plan, rec, usr);
      this._buildOpsIndex();
    } catch {
      this.error.set(this.t().dashboardLoadError);
    } finally {
      this.loading.set(false);
    }
  }

  setPlanningFilter(n: number): void { this.planningFilter.set(n); }
  setMachineView(v: 'all' | 'fonctionnel' | 'non'): void { this.machineView.set(v); }
  setTopRec(n: number): void {
    this.topRecCount.set(n);
    this._buildOpsIndex();
  }

  setComplianceRowFilter(f: 'all' | 'OnTime' | 'Late' | 'Pending'): void {
    this.complianceRowFilter.set(f);
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

  formatMakespan(): string {
    const s = this.stats();
    const raw = s.makespanMoyenRaw;
    if (!s.totalPlannings || raw === 0) return '—';
    if (raw >= 1) {
      const d = Math.floor(raw);
      const h = Math.round((raw - d) * 24);
      return h > 0 ? `${d}j ${h}h` : `${d}j`;
    }
    const totalMin = Math.round(raw * 24 * 60);
    if (totalMin >= 60) {
      const h = Math.floor(totalMin / 60);
      const m = totalMin % 60;
      return m > 0 ? `${h}h ${m}min` : `${h}h`;
    }
    return `${totalMin}min`;
  }

  private _updateUI(): void {
    const locale = this.t().appLocale ?? 'fr-FR';
    this.today.set(new Date().toLocaleDateString(locale, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    }));
    const h  = new Date().getHours();
    const tr = this.t();
    this.greeting.set(h < 12 ? tr.dashboardGreetingMorning : h < 18 ? tr.dashboardGreetingAfternoon : tr.dashboardGreetingEvening);
    const u = this.auth.currentUser();
    this.userName.set(u ? `${u.firstName} ${u.lastName}` : 'Administrateur');
  }

  private _computeStats(cmd: any[], mach: any[], plan: any[], rec: any[], usr: any[]): void {
    const now = new Date();

    const commandesTerminees = cmd.filter(c => c.statut === 'Terminé' || c.statut === 'Terminée').length;
    const commandesEnRetard  = cmd.filter(c => {
      if (!c.dateExport) return false;
      return new Date(c.dateExport) < now && c.statut !== 'Terminé' && c.statut !== 'Terminée' && c.statut !== 'Annulé';
    }).length;

    const machinesFonctionnelles = mach.filter(m => m.statut === 'Fonctionnel').length;

    const avgMakespanDays = plan.length
      ? plan.reduce((s: number, p: any) => s + (p.makespanDays ?? 0), 0) / plan.length : 0;

    const totalOperations = rec.reduce(
      (s: number, r: any) => s + (r.operations?.length ?? r.nombreOperations ?? 0), 0
    );

    this.stats.set({
      totalCommandes:        cmd.length,
      commandesEnAttente:    cmd.filter(c => c.statut === 'En attente').length,
      commandesTerminees,
      commandesUrgentes:     cmd.filter(c => c.urgence === 1).length,
      commandesEnRetard,
      tauxAchevement:        cmd.length ? Math.round(commandesTerminees / cmd.length * 100) : 0,
      totalMachines:         mach.length,
      machinesFonctionnelles,
      machinesEnPanne:       mach.filter(m => m.statut !== 'Fonctionnel').length,
      tauxChargeMachines:    mach.length ? Math.round(machinesFonctionnelles / mach.length * 100) : 0,
      totalPlannings:        plan.length,
      makespanMoyenRaw:      avgMakespanDays,
      makespanMoyen:         Math.floor(avgMakespanDays),
      makespanMoyenMinutes:  Math.round((avgMakespanDays - Math.floor(avgMakespanDays)) * 24 * 60),
      totalRecettes:         rec.length,
      totalOperations,
      avgOpsPerRecette:      rec.length ? Math.round(totalOperations / rec.length) : 0,
      totalUtilisateurs:     usr.length,
      totalAdmins:           usr.filter((u: any) => u.role === 'Admin').length,
      totalPlanners:         usr.filter((u: any) => u.role === 'PlanificationResponsable' || u.role === 'planner').length,
      totalWorkers:          usr.filter((u: any) => u.role === 'Worker' || u.role === 'operator').length,
    });
  }

  private _buildOpsIndex(): void {
    const { cmd = [], rec = [] } = this.rawData();

    const recLookup: Record<number, any> = {};
    rec.forEach((r: any) => { recLookup[r.id] = r; });

    const countMap: Record<number, number> = {};
    cmd.forEach((c: any) => {
      const id = c.recetteId ?? c.recette?.id;
      if (id != null) countMap[id] = (countMap[id] ?? 0) + 1;
    });

    const index = Object.entries(countMap)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, this.topRecCount())
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
}
