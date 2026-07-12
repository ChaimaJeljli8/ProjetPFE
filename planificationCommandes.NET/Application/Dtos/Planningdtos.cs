using System.ComponentModel.DataAnnotations;

namespace planificationCommandesBackend.Application.Dtos
{

    public class GanttRowDto
    {
        public string NumeroCommande { get; set; } = string.Empty;
        public int Quantite { get; set; }
        public int RecetteId { get; set; }
        public int Urgence { get; set; }
        public string NomOperation { get; set; } = string.Empty;
        public int MachineId { get; set; }
        public string MachineName { get; set; } = string.Empty;
        public int StartPM { get; set; }
        public int EndPM { get; set; }
        public int DureeMinutes { get; set; }
        public int TempsChargementMinutes { get; set; }
        public int TempsDecharementMinutes { get; set; }
        public int DureeTotale { get; set; }
        public int LotSize { get; set; }
        public int QuantiteLot { get; set; }
        public int LotIdx { get; set; }
        public int NbLots { get; set; }
        public string DateStart { get; set; } = string.Empty;
        public string DateEnd { get; set; } = string.Empty;
        public string DateExport { get; set; } = string.Empty;
    }

    public class PlanningRunResponseDto
    {
        public string Status { get; set; } = string.Empty;
        public int MakespanDays { get; set; }
        public int MakespanPM { get; set; }
        public string StartDate { get; set; } = string.Empty;
        public List<GanttRowDto> Rows { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
    }

    public class PlanningSummaryDto
    {
        public int Id { get; set; }
        public DateTime DateGeneration { get; set; }
        public string DateDebut { get; set; } = string.Empty;
        public string Statut { get; set; } = string.Empty;
        public int MakespanDays { get; set; }
        public int NombreCommandes { get; set; }
        public int NombreLignes { get; set; }
    }

    public class PlanningDetailDto : PlanningSummaryDto
    {
        public List<GanttRowDto> Rows { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
    }


    public class TriggerPlanningDto
    {
        public List<int> CommandeIds { get; set; } = new();

        [Range(1, 3)]
        public int MaxMachinesPerOp { get; set; } = 1;

        public string? StartDatetime { get; set; }
    }
}