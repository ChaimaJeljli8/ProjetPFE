using System.ComponentModel.DataAnnotations;

namespace planificationCommandesBackend.Application.Dtos
{
    public class MachineDto
    {
        public int Id { get; set; }
        public string NomMachine { get; set; } = string.Empty;
        public int CapaciteMax { get; set; }
        public string Statut { get; set; } = string.Empty;
        public string? Operations { get; set; }
    }

    public class CreateMachineDto
    {
        [Required(ErrorMessage = "Le nom de la machine est obligatoire.")]
        [StringLength(100)]
        public string NomMachine { get; set; } = string.Empty;

        [Required(ErrorMessage = "La capacité maximale est requise.")]
        [Range(1, 10000, ErrorMessage = "La capacité doit être entre 1 et 10000.")]
        public int CapaciteMax { get; set; }

        [Required(ErrorMessage = "Le statut est requis.")]
        [StringLength(50)]
        public string Statut { get; set; } = "Fonctionnel";

        [StringLength(200)]
        public string? Operations { get; set; }
    }

    public class UpdateMachineDto
    {
        [Required(ErrorMessage = "Le nom de la machine est obligatoire.")]
        [StringLength(100)]
        public string NomMachine { get; set; } = string.Empty;

        [Required(ErrorMessage = "La capacité maximale est requise.")]
        [Range(1, 10000, ErrorMessage = "La capacité doit être entre 1 et 10000.")]
        public int CapaciteMax { get; set; }

        [Required(ErrorMessage = "Le statut est requis.")]
        [StringLength(50)]
        public string Statut { get; set; } = "Fonctionnel";

        [StringLength(200)]
        public string? Operations { get; set; }
    }

    public class MachineStatisticsDto
    {
        public int TotalMachines { get; set; }
        public int Fonctionnels { get; set; }
        public int NonFonctionnels { get; set; }
    }
}