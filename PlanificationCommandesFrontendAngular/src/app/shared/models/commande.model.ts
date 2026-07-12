export type CommandeStatut = 'En attente' | 'En cours' | 'Terminé' | 'Annulé';

export interface Commande {
  id: number;
  numeroCommande: string;
  dateExport: string;
  urgence: number;
  quantite: number;
  recetteId: number;
  nomRecette?: string;
  statut: CommandeStatut;
  dateCreation: string;
  dateModification?: string;
}

export interface CreateCommandeDto {
  numeroCommande: string;
  dateExport: string;
  urgence: number;
  quantite: number;
  recetteId: number;
  statut: CommandeStatut;
}

export interface UpdateCommandeDto extends CreateCommandeDto {}

export interface CommandeSearchFilter {
  keyword?: string;
  urgence?: number;
  statut?: string;
  recetteId?: number;
  dateExportFrom?: string;
  dateExportTo?: string;
}

export interface CommandeStatistics {
  total: number;
  enAttente: number;
  enCours: number;
  termines: number;
  annules: number;
  hautePriorite: number;
}

export interface ImportCommandeDto {
  numeroCommande: string;
  dateExport: string;
  urgence: number;
  quantite: number;
   nomRecette: string;
}

export interface ImportResultDto {
  totalRows: number;
  imported: number;
  skipped: number;
  errors: { row: number; numeroCommande: string; reason: string }[];
}
