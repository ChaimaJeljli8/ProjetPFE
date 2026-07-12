namespace planificationCommandesBackend.Application.Dtos
{
  
    public class AlertDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;      // "Delay" | "Bottleneck"
        public string Severity { get; set; } = string.Empty;  // "critical" | "warning" | "info"
        public string Message { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; }
        public bool IsDismissed { get; set; }

        public int? CommandeId { get; set; }

        public string? NumeroCommande { get; set; }

        public DateTime? DateExport { get; set; }

        public int? DaysRemaining { get; set; }

        public bool? Urgence { get; set; }

        public int? MachineId { get; set; }

        public string? MachineName { get; set; }

        public double? LoadPct { get; set; }
        public int? ScheduledMinutes { get; set; }
        public int? CapaciteMinutes { get; set; }
        public string? BottleneckType { get; set; }
    }


    public class AlertSummaryDto
    {
        public List<AlertDto> DelayAlerts { get; set; } = new();
        public List<AlertDto> BottleneckAlerts { get; set; } = new();
        public DateTime GeneratedAt { get; set; }
        public int TotalActive { get; set; }
    }
}