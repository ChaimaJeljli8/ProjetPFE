import { Injectable, inject, signal, computed } from '@angular/core';
import { CommandeService } from '../../shared/services/commande.service';
import { LanguageService } from '../../shared/services/language.service';
import { RecetteService } from '../../shared/services/recette.service';
import { Commande, CommandeStatistics, CommandeStatut, CreateCommandeDto, ImportResultDto } from '../../shared/models/commande.model';
import { Recette } from '../../shared/models/recette.model';

export type ModalMode = 'none' | 'create' | 'edit' | 'view-recette' | 'import';

@Injectable()
export class CommandeViewModel {
  private commandeService = inject(CommandeService);
  private recetteService  = inject(RecetteService);
  private lang            = inject(LanguageService);


  t = this.lang.t;


  private _commandes      = signal<Commande[]>([]);
  private _recettes       = signal<Recette[]>([]);
  private _isLoading      = signal(true);
  private _errorMessage   = signal('');
  private _modalMode      = signal<ModalMode>('none');
  private _editingId      = signal<number | null>(null);
  private _viewingRecette = signal<Recette | null>(null);
  private _stats          = signal<CommandeStatistics | null>(null);

  form = signal<CreateCommandeDto>({
    numeroCommande: '',
    dateExport: '',
    urgence: 1,
    quantite: 1,
    recetteId: 0,
    statut: 'En attente'
  });

  searchTerm      = signal('');
  filterUrgence   = signal('');
  filterStatut    = signal('');
  filterRecetteId = signal('');

  importFile    = signal<File | null>(null);
  importResult  = signal<ImportResultDto | null>(null);
  importLoading = signal(false);

  toast           = signal<{ msg: string; type: 'success' | 'error' } | null>(null);
  modalError      = signal<string | null>(null);
  confirmDeleteId = signal<number | null>(null);


  isLoading      = this._isLoading.asReadonly();
  errorMessage   = this._errorMessage.asReadonly();
  modalMode      = this._modalMode.asReadonly();
  recettes       = this._recettes.asReadonly();
  stats          = this._stats.asReadonly();
  viewingRecette = this._viewingRecette.asReadonly();


  filteredCommandes = computed(() => {
    const term      = this.searchTerm().toLowerCase();
    const urgence   = this.filterUrgence();
    const statut    = this.filterStatut();
    const recetteId = this.filterRecetteId();

    return this._commandes().filter(c => {
      const matchesSearch  = !term      || c.numeroCommande.toLowerCase().includes(term);
      const matchesUrgence = !urgence   || c.urgence.toString() === urgence;
      const matchesStatut  = !statut    || c.statut === statut;
      const matchesRecette = !recetteId || c.recetteId.toString() === recetteId;
      return matchesSearch && matchesUrgence && matchesStatut && matchesRecette;
    });
  });

  totalCommandes = computed(() => this._commandes().length);
  isEmpty        = computed(() => this._commandes().length === 0);

  countByStatut = (statut: string) =>
    computed(() => this._commandes().filter(c => c.statut === statut).length)();


  countUrgence1 = computed(() => this._commandes().filter(c => c.urgence === 1).length);

  isModalOpen = computed(() => this._modalMode() !== 'none');

  readonly statutOptions: CommandeStatut[] = ['En attente', 'En cours', 'Terminé', 'Annulé'];

  readonly csvRequiredHeaders = ['NumeroCommande', 'DateExport', 'Urgence', 'Quantite', 'NomRecette'];

  loadAll(): void {
    this._isLoading.set(true);
    this._errorMessage.set('');

    this.commandeService.getAll().subscribe({
      next: data => {
        this._commandes.set(data);
        this._isLoading.set(false);
      },
      error: () => {
        this._errorMessage.set('Erreur de connexion au serveur. Vérifiez que le backend est démarré.');
        this._isLoading.set(false);
      }
    });

    this.recetteService.getAll().subscribe({
      next: data => this._recettes.set(data),
      error: () => {}
    });

    this.commandeService.getStatistics().subscribe({
      next: data => this._stats.set(data),
      error: () => {}
    });
  }

  openCreateModal(): void {
    this._editingId.set(null);
    this.form.set({ numeroCommande: '', dateExport: '', urgence: 1, quantite: 1, recetteId: 0, statut: 'En attente' });
    this.modalError.set(null);
    this._modalMode.set('create');
  }

  openEditModal(c: Commande): void {
    this._editingId.set(c.id);
    this.form.set({
      numeroCommande: c.numeroCommande,
      dateExport:     c.dateExport.slice(0, 16),
      urgence:        c.urgence,
      quantite:       c.quantite,
      recetteId:      c.recetteId,
      statut:         c.statut
    });
    this.modalError.set(null);
    this._modalMode.set('edit');
  }

  closeModal(): void {
    this._modalMode.set('none');
    this._editingId.set(null);
    this.modalError.set(null);
    this.importFile.set(null);
    this.importResult.set(null);
  }

  updateForm(field: keyof CreateCommandeDto, value: any): void {
    this.form.update(f => ({ ...f, [field]: value }));
  }

  //  View Recette modal
  openViewRecette(recetteId: number): void {
    const cached = this._recettes().find(r => r.id === recetteId);
    if (cached) {
      this._viewingRecette.set(cached);
      this._modalMode.set('view-recette');
    } else {
      this.recetteService.getById(recetteId).subscribe({
        next: r => {
          this._viewingRecette.set(r);
          this._modalMode.set('view-recette');
        }
      });
    }
  }

  save(): void {
    const f         = this.form();
    const editingId = this._editingId();
    this.modalError.set(null);

    if (!f.numeroCommande?.trim()) {
      this.modalError.set('Le numéro de commande est obligatoire.');
      return;
    }
    if (!f.dateExport) {
      this.modalError.set("La date d'export est obligatoire.");
      return;
    }
    if (f.quantite == null || f.quantite <= 0) {
      this.modalError.set('La quantité doit être supérieure à 0.');
      return;
    }
    if (!f.recetteId || f.recetteId === 0) {
      this.modalError.set('Veuillez sélectionner une recette.');
      return;
    }
    if (!Number.isInteger(f.urgence) || f.urgence < 1) {
      this.modalError.set("L'urgence doit être un entier positif (≥ 1).");
      return;
    }

    const newNumero = f.numeroCommande.trim().toUpperCase();
    const duplicate = this._commandes().find(c =>
      c.numeroCommande.toUpperCase() === newNumero && c.id !== editingId
    );
    if (duplicate) {
      this.modalError.set(`Le numéro de commande "${newNumero}" existe déjà.`);
      return;
    }

    const exportDate = new Date(f.dateExport);
    const now        = new Date();
    if (isNaN(exportDate.getTime()) || exportDate < now) {
      this.modalError.set("La date d'export ne peut pas être dans le passé.");
      return;
    }

    const dto: CreateCommandeDto = {
      ...f,
      numeroCommande: newNumero,
      dateExport:     exportDate.toISOString(),
    };

    const handleError = (err: any) => {
      const msg = err?.error?.message ?? err?.error ?? null;
      this.modalError.set(msg || 'Impossible de contacter le serveur.');
    };

    if (this._modalMode() === 'edit' && editingId !== null) {
      this.commandeService.update(editingId, dto).subscribe({
        next:  () => { this.loadAll(); this.closeModal(); this.showToast(this.lang.t().commandeUpdated, 'success'); },
        error: handleError
      });
    } else {
      this.commandeService.create(dto).subscribe({
        next:  () => { this.loadAll(); this.closeModal(); this.showToast(this.lang.t().commandeCreated, 'success'); },
        error: handleError
      });
    }
  }

  // ── Delete
  requestDelete(id: number): void  { this.confirmDeleteId.set(id); }
  cancelDelete():  void            { this.confirmDeleteId.set(null); }

  confirmDelete(): void {
    const id = this.confirmDeleteId();
    if (id === null) return;
    this.commandeService.delete(id).subscribe({
      next:  () => { this.confirmDeleteId.set(null); this.loadAll(); this.showToast(this.lang.t().commandeDeleted, 'success'); },
      error: () => { this.confirmDeleteId.set(null); this.showToast(this.lang.t().commandeDeleteError, 'error'); }
    });
  }

  // ── Import
  openImportModal(): void {
    this.importFile.set(null);
    this.importResult.set(null);
    this.modalError.set(null);
    this._modalMode.set('import');
  }

  onFileSelected(file: File | null): void {
    this.modalError.set(null);
    if (!file) { this.importFile.set(null); this.importResult.set(null); return; }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.modalError.set('Seuls les fichiers .csv sont acceptés.');
      this.importFile.set(null);
      this.importResult.set(null);
      return;
    }
    if (file.size === 0) {
      this.modalError.set('Le fichier CSV sélectionné est vide.');
      this.importFile.set(null);
      this.importResult.set(null);
      return;
    }

    this.importFile.set(file);
    this.importResult.set(null);
  }

  runImport(): void {
    const file = this.importFile();
    if (!file) { this.modalError.set('Veuillez sélectionner un fichier CSV.'); return; }

    if (file.size === 0) {
      this.modalError.set('Le fichier CSV est vide — veuillez en choisir un autre.');
      return;
    }


    const reader = new FileReader();
    reader.onload = (e) => {
      const text      = (e.target?.result as string) ?? '';
      const firstLine = text.split(/\r?\n/)[0].trim();

      const requiredHeaders = this.csvRequiredHeaders;
      const presentHeaders  = firstLine.split(',').map(h => h.trim());
      const missing         = requiredHeaders.filter(h => !presentHeaders.includes(h));

      if (!firstLine) {
        this.modalError.set("Le fichier CSV est vide ou ne contient pas d'en-tête.");
        return;
      }
      if (missing.length > 0) {
        this.modalError.set(
          `En-têtes CSV manquants ou incorrects : ${missing.join(', ')}. ` +
          `Colonnes attendues : ${requiredHeaders.join(', ')}.`
        );
        return;
      }

      const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
      if (lines.length < 2) {
        this.modalError.set("Le fichier CSV ne contient aucune ligne de données (seulement l'en-tête).");
        return;
      }

      this.importLoading.set(true);
      this.modalError.set(null);

      this.commandeService.importCsv(file).subscribe({
        next: result => {
          this.importResult.set(result);
          this.importLoading.set(false);
          this.loadAll();
          if (result.imported > 0) {
            this.showToast(`${result.imported} ${this.lang.t().importedCount} ✓`, 'success');
          }
        },
        error: (err) => {
          this.importLoading.set(false);
          const msg = typeof err?.error === 'string'
            ? err.error
            : (err?.error?.message ?? "Erreur lors de l'importation.");
          this.modalError.set(msg);
        }
      });
    };
    reader.onerror = () => {
      this.modalError.set('Impossible de lire le fichier.');
    };
    reader.readAsText(file);
  }

  getStatutClass(statut: string): string {
    const map: Record<string, string> = {
      'En attente': 'statut-attente',
      'En cours':   'statut-encours',
      'Terminé':    'statut-termine',
      'Annulé':     'statut-annule',
    };
    return map[statut] ?? '';
  }

  recetteName(id: number): string {
    return this._recettes().find(r => r.id === id)?.nomRecette ?? '—';
  }

  private showToast(msg: string, type: 'success' | 'error'): void {
    this.toast.set({ msg, type });
    setTimeout(() => this.toast.set(null), 3500);
  }
}
