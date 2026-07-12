using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace planificationCommandesBackend.Domain.Entities
{
    [Table("OperationsRecette")]
    public class OperationRecette
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int RecetteId { get; set; }

        [ForeignKey(nameof(RecetteId))]
        public Recette? Recette { get; set; }

        [Required(ErrorMessage = "L'ordre de l'opération est requis")]
        [Range(1, 1000)]
        public int Ordre { get; set; }

        [Required(ErrorMessage = "Le nom de l'opération est requis")]
        [StringLength(100)]
        public string NomOperation { get; set; } = string.Empty;

 
        [Required(ErrorMessage = "La durée est requise")]
        [Range(1, 100000, ErrorMessage = "La durée doit être entre 1 et 100000 minutes")]
        public int DureeMinutes { get; set; }

        
        [Required(ErrorMessage = "La quantité du lot est requise")]
        [Range(1, 100000, ErrorMessage = "La quantité du lot doit être entre 1 et 100000")]
        public int QuantiteLot { get; set; }

 
        [Range(0, 100000)]
        public int TempsChargementMinutes { get; set; } = 0;


        [Range(0, 100000)]
        public int TempsDecharementMinutes { get; set; } = 0;
    }
}