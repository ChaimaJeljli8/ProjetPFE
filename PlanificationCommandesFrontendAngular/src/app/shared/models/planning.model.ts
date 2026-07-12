export interface GanttRow {
  numeroCommande:          string;
  quantite:                number;
  recetteId:               number;
  urgence:                 number;
  nomOperation:            string;
  machineId:               number;
  machineName:             string;
  startPM:                 number;
  endPM:                   number;
  dureeMinutes:            number;
  tempsChargementMinutes:  number;
  tempsDecharementMinutes: number;
  dureeTotale:             number;
  lotSize:                 number;
  quantiteLot:             number;
  lotIdx:                  number;
  nbLots:                  number;
  dateStart:               string;
  dateEnd:                 string;
  dateExport:              string;
}

export interface PlanningDetail {
  id:              number;
  dateGeneration:  string;
  dateDebut:       string;
  statut:          string;
  makespanDays:    number;
  nombreCommandes: number;
  nombreLignes:    number;
  warnings:        string[];
  rows:            GanttRow[];
}

export interface PlanningSummary {
  id:              number;
  dateGeneration:  string;
  dateDebut:       string;
  statut:          string;
  makespanDays:    number;
  nombreCommandes: number;
  nombreLignes:    number;
}
