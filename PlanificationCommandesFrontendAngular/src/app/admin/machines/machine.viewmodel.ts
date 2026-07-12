import { Injectable, inject, signal, computed } from '@angular/core';
import { MachineService } from '../../shared/services/machine.service';
import { OperationsService } from '../../shared/services/operations.service';
import { LanguageService } from '../../shared/services/language.service';
import { Machine } from '../../shared/models/machine.model';

@Injectable()
export class MachineViewModel {
  private machineService     = inject(MachineService);
  private operationsService  = inject(OperationsService);
  private lang               = inject(LanguageService);


  private _machines       = signal<Machine[]>([]);
  private _isLoading      = signal(true);
  private _errorMessage   = signal('');
  private _isModalOpen    = signal(false);
  private _isEditing      = signal(false);
  private _editingMachine = signal<Machine>(this.getEmptyMachine());

  searchTerm   = signal('');
  filterStatut = signal('');

  toast           = signal<{ msg: string; type: 'success' | 'error' } | null>(null);
  modalError      = signal<string | null>(null);
  confirmDeleteId = signal<number | null>(null);

  isLoading      = this._isLoading.asReadonly();
  errorMessage   = this._errorMessage.asReadonly();
  isModalOpen    = this._isModalOpen.asReadonly();
  isEditing      = this._isEditing.asReadonly();
  editingMachine = this._editingMachine.asReadonly();

  private _availableOperations = signal<string[]>([]);
  availableOperations          = this._availableOperations.asReadonly();

  loadOperations(): void {
    this.operationsService.getAll().subscribe({
      next: (ops) => this._availableOperations.set(ops),
      // Non-fatal: the checkbox grid will simply be empty if this fails.
      error: () => console.error('Could not load operations list from backend.')
    });
  }


  private _checkedOps = signal<Set<string>>(new Set());
  checkedOps = this._checkedOps.asReadonly();

  isOpChecked(op: string): boolean {
    return this._checkedOps().has(op);
  }

  toggleOp(op: string): void {
    this._checkedOps.update(set => {
      const next = new Set(set);
      if (next.has(op)) { next.delete(op); } else { next.add(op); }
      return next;
    });
  }


  filteredMachines = computed(() => {
    const term   = this.searchTerm().toLowerCase();
    const statut = this.filterStatut();
    return this._machines().filter(m => {
      const matchesSearch = m.nomMachine.toLowerCase().includes(term);
      const matchesStatut = !statut || m.statut === statut;
      return matchesSearch && matchesStatut;
    });
  });

  totalMachines = computed(() => this._machines().length);
  isEmpty       = computed(() => this._machines().length === 0);

  countByStatut = (statut: string) =>
    computed(() => this._machines().filter(m => m.statut === statut).length)();

  // ── Static reference data
  readonly machineStatuts = ['Fonctionnel', 'Non fonctionnel'];

  // ── Commands
  loadMachines(): void {
    this._isLoading.set(true);
    this._errorMessage.set('');
    this.machineService.getMachines().subscribe({
      next: (data) => {
        this._machines.set(data);
        this._isLoading.set(false);
      },
      error: () => {
        this._errorMessage.set('Erreur de connexion au serveur. Vérifiez que le backend est démarré.');
        this._isLoading.set(false);
      }
    });
  }

  openCreateModal(): void {
    this._isEditing.set(false);
    this._editingMachine.set(this.getEmptyMachine());
    this._checkedOps.set(new Set());
    this.modalError.set(null);
    this._isModalOpen.set(true);
  }

  openEditModal(machine: Machine): void {
    this._isEditing.set(true);
    this._editingMachine.set({ ...machine });

    const existing = new Set<string>(
      (machine.operations ?? '')
        .split(',')
        .map(s => s.trim())
        .filter(s => this._availableOperations().includes(s))
    );
    this._checkedOps.set(existing);
    this.modalError.set(null);
    this._isModalOpen.set(true);
  }

  closeModal(): void {
    this._isModalOpen.set(false);
    this._editingMachine.set(this.getEmptyMachine());
    this._checkedOps.set(new Set());
    this.modalError.set(null);
  }

  updateEditingField(field: keyof Machine, value: any): void {
    this._editingMachine.update(m => ({ ...m, [field]: value }));
  }

  saveMachine(): void {
    const machine = this._editingMachine();
    this.modalError.set(null);

    // ── Client-side validation
    if (!machine.nomMachine?.trim()) {
      this.modalError.set('Le nom de la machine est obligatoire.');
      return;
    }
    if (machine.capaciteMax <= 0) {
      this.modalError.set('La capacité maximale doit être un nombre positif (> 0).');
      return;
    }
    if (!Number.isInteger(machine.capaciteMax)) {
      this.modalError.set('La capacité maximale doit être un nombre entier (sans décimales).');
      return;
    }

    const selectedOps = [...this._checkedOps()];
    if (selectedOps.length === 0) {
      this.modalError.set('Veuillez sélectionner au moins une opération.');
      return;
    }

    const opsString = this._availableOperations()
      .filter(op => this._checkedOps().has(op))
      .join(', ');

    const machineToSave: Machine = {
      ...machine,
      nomMachine: machine.nomMachine.trim(),
      operations: opsString,
    };

    const trimmedName = machineToSave.nomMachine.toLowerCase();
    const duplicate = this._machines().find(m =>
      m.nomMachine.trim().toLowerCase() === trimmedName && m.id !== machine.id
    );
    if (duplicate) {
      this.modalError.set(`Une machine nommée "${machineToSave.nomMachine}" existe déjà. Veuillez choisir un nom différent.`);
      return;
    }

    const handleError = (err: any) => {
      const body = err?.error;
      const msg  = body?.message ?? body ?? null;
      this.modalError.set(msg ?? 'Impossible de contacter le serveur.');
    };

    if (this._isEditing() && machine.id) {
      this.machineService.updateMachine(machine.id, machineToSave).subscribe({
        next: () => { this.loadMachines(); this.closeModal(); this.showToast(this.lang.t().machineUpdated, 'success'); },
        error: handleError,
      });
    } else {
      this.machineService.createMachine(machineToSave).subscribe({
        next: () => { this.loadMachines(); this.closeModal(); this.showToast(this.lang.t().machineCreated, 'success'); },
        error: handleError,
      });
    }
  }

  // ── Delete flow
  requestDelete(id: number): void { this.confirmDeleteId.set(id); }
  cancelDelete():  void           { this.confirmDeleteId.set(null); }

  confirmDelete(): void {
    const id = this.confirmDeleteId();
    if (id === null) return;
    this.machineService.deleteMachine(id).subscribe({
      next: () => {
        this.confirmDeleteId.set(null);
        this.loadMachines();
        this.showToast(this.lang.t().machineDeleted, 'success');
      },
      error: () => {
        this.confirmDeleteId.set(null);
        this.showToast(this.lang.t().machineDeleteError, 'error');
      },
    });
  }

  getStatutClass(statut: string): string {
    const map: Record<string, string> = {
      'Fonctionnel':     'bg-green-100 text-green-800',
      'Non fonctionnel': 'bg-red-100 text-red-800',
    };
    return map[statut] ?? 'bg-gray-100 text-gray-700';
  }

  getStatutColor = this.getStatutClass;

  private showToast(msg: string, type: 'success' | 'error'): void {
    this.toast.set({ msg, type });
    setTimeout(() => this.toast.set(null), 3500);
  }

  private getEmptyMachine(): Machine {
    return { nomMachine: '', capaciteMax: 0, statut: 'Fonctionnel', operations: '' };
  }
}
