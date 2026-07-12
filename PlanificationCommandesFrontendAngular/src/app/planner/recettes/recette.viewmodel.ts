import { Injectable, inject, signal, computed } from '@angular/core';
import { RecetteService } from '../../shared/services/recette.service';
import { OperationsService } from '../../shared/services/operations.service';
import { LanguageService } from '../../shared/services/language.service';
import {
  Recette, CreateRecetteDto, CreateOperationDto, UpdateRecetteDto
} from '../../shared/models/recette.model';

@Injectable()
export class RecetteViewModel {
  private recetteService    = inject(RecetteService);
  private operationsService = inject(OperationsService);
  private lang              = inject(LanguageService);

  private _availableOperations = signal<string[]>([]);
  availableOperations          = this._availableOperations.asReadonly();

  loadOperations(): void {
    this.operationsService.getAll().subscribe({
      next: (ops) => this._availableOperations.set(ops),
      error: () => console.error('Could not load operations list from backend.')
    });
  }

  //  State
  private _recettes     = signal<Recette[]>([]);
  private _isLoading    = signal(true);
  private _errorMessage = signal('');
  private _isModalOpen  = signal(false);
  private _isEditing    = signal(false);
  private _editingId    = signal<number | null>(null);

  searchTerm      = signal('');
  toast           = signal<{ msg: string; type: 'success' | 'error' } | null>(null);
  modalError      = signal<string | null>(null);
  confirmDeleteId = signal<number | null>(null);

  confirmRemoveOpIndex = signal<number>(-1);

  // Form state
  formNom  = signal('');
  formOps  = signal<CreateOperationDto[]>([]);

  isLoading    = this._isLoading.asReadonly();
  errorMessage = this._errorMessage.asReadonly();
  isModalOpen  = this._isModalOpen.asReadonly();
  isEditing    = this._isEditing.asReadonly();


  filteredRecettes = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this._recettes().filter(r =>
      !term || r.nomRecette.toLowerCase().includes(term)
    );
  });

  totalRecettes = computed(() => this._recettes().length);
  isEmpty       = computed(() => this._recettes().length === 0);
  totalOps      = computed(() =>
    this._recettes().reduce((s, r) => s + (r.nombreOperations ?? 0), 0)
  );
  avgDuration = computed(() => {
    const list = this._recettes();
    if (!list.length) return 0;
    return Math.round(list.reduce((s, r) => s + (r.dureeTotaleMinutes ?? 0), 0) / list.length);
  });


  loadAll(): void {
    this._isLoading.set(true);
    this._errorMessage.set('');
    this.recetteService.getAll().subscribe({
      next:  data => { this._recettes.set(data); this._isLoading.set(false); },
      error: ()   => {
        this._errorMessage.set('Erreur de connexion au serveur. Vérifiez que le backend est démarré.');
        this._isLoading.set(false);
      }
    });
  }

  openCreateModal(): void {
    this._isEditing.set(false);
    this._editingId.set(null);
    this.formNom.set('');
    this.formOps.set([this.blankOp(1)]);
    this.modalError.set(null);
    this.confirmRemoveOpIndex.set(-1);
    this._isModalOpen.set(true);
  }

  openEditModal(r: Recette): void {
    this._isEditing.set(true);
    this._editingId.set(r.id);
    this.formNom.set(r.nomRecette);
    this.formOps.set(r.operations.map(o => ({
      ordre:                   o.ordre,
      nomOperation:            o.nomOperation,
      dureeMinutes:            o.dureeMinutes,
      quantiteLot:             o.quantiteLot,
      tempsChargementMinutes:  o.tempsChargementMinutes,
      tempsDecharementMinutes: o.tempsDecharementMinutes
    })));
    this.modalError.set(null);
    this.confirmRemoveOpIndex.set(-1);
    this._isModalOpen.set(true);
  }

  closeModal(): void {
    this._isModalOpen.set(false);
    this._editingId.set(null);
    this.modalError.set(null);
    this.confirmRemoveOpIndex.set(-1);
  }

  //  Operations
  addOp(): void {
    const ops  = this.formOps();
    const next = ops.length ? Math.max(...ops.map(o => o.ordre)) + 1 : 1;
    this.confirmRemoveOpIndex.set(-1);
    this.formOps.update(list => [...list, this.blankOp(next)]);
  }

  removeOp(index: number): void {
    this.confirmRemoveOpIndex.set(-1);
    this.formOps.update(list =>
      list.filter((_, i) => i !== index).map((op, i) => ({ ...op, ordre: i + 1 }))
    );
  }

  requestRemoveOp(index: number): void { this.confirmRemoveOpIndex.set(index); }
  cancelRemoveOp():  void              { this.confirmRemoveOpIndex.set(-1); }
  confirmRemoveOp(): void {
    const i = this.confirmRemoveOpIndex();
    if (i === -1) return;
    this.removeOp(i);
  }

  updateOp(index: number, field: keyof CreateOperationDto, value: any): void {
    this.formOps.update(list =>
      list.map((op, i) => i === index ? { ...op, [field]: value } : op)
    );
  }

  //  Save
  save(): void {
    this.modalError.set(null);
    const ops       = this.formOps();
    const t         = this.lang.t();
    const editingId = this._editingId();

    if (!this.formNom().trim()) {
      this.modalError.set(`${t.fieldNomRecette} — obligatoire.`);
      return;
    }
    if (ops.length === 0) {
      this.modalError.set(`${t.opsSequenceLabel} — obligatoire.`);
      return;
    }

    const newNom    = this.formNom().trim().toLowerCase();
    const duplicate = this._recettes().find(r =>
      r.nomRecette.toLowerCase() === newNom && r.id !== editingId
    );
    if (duplicate) {
      this.modalError.set(`Une recette nommée "${this.formNom().trim()}" existe déjà.`);
      return;
    }

    for (const op of ops) {
      if (!op.nomOperation?.trim()) {
        this.modalError.set(`Opération ${op.ordre} — veuillez sélectionner une opération.`);
        return;
      }

      if (!this._availableOperations().includes(op.nomOperation)) {
        this.modalError.set(
          `Opération ${op.ordre} — "${op.nomOperation}" n'est pas une opération valide. ` +
          `Valeurs acceptées : ${this._availableOperations().join(', ')}.`
        );
        return;
      }
      if (op.dureeMinutes <= 0) {
        this.modalError.set(`${t.fieldDureeMin} op. ${op.ordre} — doit être > 0.`);
        return;
      }
      if (op.quantiteLot <= 0) {
        this.modalError.set(`${t.fieldQteLot} op. ${op.ordre} — doit être > 0.`);
        return;
      }
      if (op.tempsChargementMinutes < 0) {
        this.modalError.set(`Temps de chargement op. ${op.ordre} — doit être ≥ 0.`);
        return;
      }
      if (op.tempsDecharementMinutes < 0) {
        this.modalError.set(`Temps de déchargement op. ${op.ordre} — doit être ≥ 0.`);
        return;
      }
    }

    const createDto: CreateRecetteDto = { nomRecette: this.formNom().trim(), operations: ops };
    const updateDto: UpdateRecetteDto = { nomRecette: this.formNom().trim(), operations: ops };

    const onError = (err: any) =>
      this.modalError.set(err?.error?.message ?? this.lang.t().serverError);

    if (this._isEditing() && editingId !== null) {
      this.recetteService.update(editingId, updateDto).subscribe({
        next:  () => { this.loadAll(); this.closeModal(); this.showToast(this.lang.t().recetteUpdated, 'success'); },
        error: onError
      });
    } else {
      this.recetteService.create(createDto).subscribe({
        next:  () => { this.loadAll(); this.closeModal(); this.showToast(this.lang.t().recetteCreated, 'success'); },
        error: onError
      });
    }
  }

  //  Delete
  requestDelete(id: number): void { this.confirmDeleteId.set(id); }
  cancelDelete():  void           { this.confirmDeleteId.set(null); }

  confirmDelete(): void {
    const id = this.confirmDeleteId();
    if (id === null) return;
    this.recetteService.delete(id).subscribe({
      next:  () => {
        this.confirmDeleteId.set(null);
        this.loadAll();
        this.showToast(this.lang.t().recetteDeleted, 'success');
      },
      error: (err) => {
        this.confirmDeleteId.set(null);
        this.showToast(err?.error?.message ?? this.lang.t().serverError, 'error');
      }
    });
  }

  //  Helpers
  private blankOp(ordre: number): CreateOperationDto {
    return {
      ordre,
      nomOperation: '',
      dureeMinutes: 0,
      quantiteLot: 0,
      tempsChargementMinutes: 0,
      tempsDecharementMinutes: 0
    };
  }

  showToast(msg: string, type: 'success' | 'error'): void {
    this.toast.set({ msg, type });
    setTimeout(() => this.toast.set(null), 3500);
  }
}
