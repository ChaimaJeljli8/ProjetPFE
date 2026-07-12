using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace planificationCommandesBackend.Domain.Entities
{

    [Table("Alerts")]
    public class Alert
    {
        [Key]
        public int Id { get; set; }


        [Required, StringLength(20)]
        public string Type { get; set; } = string.Empty;

        [Required, StringLength(20)]
        public string Severity { get; set; } = string.Empty;  // Niveau de gravité WARNING, CRITICAL


        [Required, StringLength(500)]
        public string Message { get; set; } = string.Empty; // Message descriptif de l’alerte

        public int? CommandeId { get; set; }

        [ForeignKey(nameof(CommandeId))]
        public Commande? Commande { get; set; }

        public int? DaysRemaining { get; set; }


        public int? MachineId { get; set; }

        [ForeignKey(nameof(MachineId))]
        public Machine? Machine { get; set; }

        public double? LoadPct { get; set; }      // Charge de la machine en pourcentage

        public int? ScheduledMinutes { get; set; } // Temps planifié sur la machine (en minutes)

        public int? CapaciteMinutes { get; set; } // Capacité totale de la machine (en minutes)


        [StringLength(20)]
        public string? BottleneckType { get; set; }  // Type de goulot d’étranglement détecté

        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow; // Date de génération de l’alerte 


        public bool IsDismissed { get; set; } = false;    // Indique si l’alerte a été ignorée/masquée par l’utilisateur

        public DateTime? DismissedAt { get; set; } // Date à laquelle l’alerte a été masquée
    }
}