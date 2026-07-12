export interface DeadlineComplianceRow {
  id:             number;
  numeroCommande: string;
  dateExport:     string;
  dateLivraison:  string | null;
  statut:         string;
  nomRecette:     string;
  urgence:        number;
  quantite:       number;
  daysVariance:   number | null;
  status:         'OnTime' | 'Late' | 'Pending';
}

export interface DeadlineComplianceReport {
  totalCommandes:      number;
  onTime:              number;
  late:                number;
  pending:             number;
  complianceRate:      number;
  averageDaysVariance: number;
  rows:                DeadlineComplianceRow[];
}
