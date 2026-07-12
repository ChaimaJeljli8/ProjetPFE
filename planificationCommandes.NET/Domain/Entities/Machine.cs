using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace planificationCommandesBackend.Domain.Entities
{
    [Table("Machines")]
    public class Machine
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Le nom de la machine est requis")]
        [StringLength(100)]
        public string NomMachine { get; set; } = string.Empty;

        [Required(ErrorMessage = "La capacité maximale est requise")]
        [Range(1, 10000, ErrorMessage = "La capacité doit être entre 1 et 10000")]
        public int CapaciteMax { get; set; }

        [Required(ErrorMessage = "Le statut est requis")]
        [StringLength(50)]
        public string Statut { get; set; } = "Fonctionnel"; // "Fonctionnel", "Non fonctionnel"

        [StringLength(200)]
        public string? Operations { get; set; }
    }
}