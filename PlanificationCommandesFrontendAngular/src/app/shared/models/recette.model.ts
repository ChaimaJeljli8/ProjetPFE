export interface OperationRecetteDto {
  id: number;
  ordre: number;
  nomOperation: string;
  dureeMinutes: number;
  quantiteLot: number;
  tempsChargementMinutes: number;
  tempsDecharementMinutes: number;
}

export interface Recette {
  id: number;
  nomRecette: string;
  operations: OperationRecetteDto[];
  nombreOperations: number;
  dureeTotaleMinutes: number;
}

export interface CreateOperationDto {
  ordre: number;
  nomOperation: string;
  dureeMinutes: number;
  quantiteLot: number;
  tempsChargementMinutes: number;
  tempsDecharementMinutes: number;
}

export interface CreateRecetteDto {
  nomRecette: string;
  operations: CreateOperationDto[];
}

export interface UpdateRecetteDto extends CreateRecetteDto {}
