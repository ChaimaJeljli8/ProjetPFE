export interface AlertDto {
  id:          number;
  type:        'Delay' | 'Bottleneck';
  severity:    'critical' | 'warning' | 'info';
  message:     string;
  generatedAt: string;
  isDismissed: boolean;


  commandeId?:     number;
  numeroCommande?: string;
  dateExport?:     string;
  daysRemaining?:  number;
  urgence?:        boolean;

  machineId?:        number;
  machineName?:      string;
  loadPct?:          number;
  scheduledMinutes?: number;
  capaciteMinutes?:  number;
  bottleneckType?:   'overloaded' | 'underused' | 'inactive';
}

export interface AlertSummaryDto {
  delayAlerts:      AlertDto[];
  bottleneckAlerts: AlertDto[];
  generatedAt:      string;
  totalActive:      number;
}
