using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace planificationCommandesBackend.Domain.Entities
{


    [Table("PlanningRows")]
    public class PlanningRow
    {
        [Key]
        public int Id { get; set; }

        public int PlanningId { get; set; }

        [ForeignKey(nameof(PlanningId))]
        public Planning? Planning { get; set; }

        [StringLength(50)]
        public string NumeroCommande { get; set; } = string.Empty;
        public int Quantite { get; set; }
        public int RecetteId { get; set; }
        public int Urgence { get; set; }

        [StringLength(100)]
        public string NomOperation { get; set; } = string.Empty;

        public int MachineId { get; set; }

        [StringLength(100)]
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

        [StringLength(10)]
        public string DateStart { get; set; } = string.Empty;

        [StringLength(10)]
        public string DateEnd { get; set; } = string.Empty;

        [StringLength(10)]
        public string DateExport { get; set; } = string.Empty;
    }
}
