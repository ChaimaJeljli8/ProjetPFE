using System.ComponentModel.DataAnnotations;

namespace planificationCommandesBackend.Application.Dtos
{

    public class OperationRecetteDto
    {
        public int Id { get; set; }
        public int Ordre { get; set; }
        public string NomOperation { get; set; } = string.Empty;
        public int DureeMinutes { get; set; }
        public int QuantiteLot { get; set; }
        public int TempsChargementMinutes { get; set; }
        public int TempsDecharementMinutes { get; set; }
    }

    public class CreateOperationRecetteDto
    {
        [Required(ErrorMessage = "L'ordre est requis")]
        [Range(1, 1000)]
        public int Ordre { get; set; }

        [Required(ErrorMessage = "Le nom de l'opération est requis")]
        [StringLength(100)]
        public string NomOperation { get; set; } = string.Empty;

        [Required(ErrorMessage = "La durée est requise")]
        [Range(1, 100000)]
        public int DureeMinutes { get; set; }

        [Required(ErrorMessage = "La quantité du lot est requise")]
        [Range(1, 100000)]
        public int QuantiteLot { get; set; }

        [Range(0, 100000, ErrorMessage = "Le temps de chargement doit être entre 0 et 100000 minutes")]
        public int TempsChargementMinutes { get; set; } = 0;

        [Range(0, 100000, ErrorMessage = "Le temps de déchargement doit être entre 0 et 100000 minutes")]
        public int TempsDecharementMinutes { get; set; } = 0;
    }

    public class RecetteDto
    {
        public int Id { get; set; }
        public string NomRecette { get; set; } = string.Empty;
        public List<OperationRecetteDto> Operations { get; set; } = new();
        public int NombreOperations => Operations.Count;
        public int DureeTotaleMinutes => Operations.Sum(o => o.DureeMinutes);
    }

    public class CreateRecetteDto
    {
        [Required(ErrorMessage = "Le nom de la recette est requis")]
        [StringLength(150)]
        public string NomRecette { get; set; } = string.Empty;

        [Required(ErrorMessage = "Au moins une opération est requise")]
        [MinLength(1, ErrorMessage = "Au moins une opération est requise")]
        public List<CreateOperationRecetteDto> Operations { get; set; } = new();
    }

    public class UpdateRecetteDto
    {
        [Required(ErrorMessage = "Le nom de la recette est requis")]
        [StringLength(150)]
        public string NomRecette { get; set; } = string.Empty;

        [Required(ErrorMessage = "Au moins une opération est requise")]
        [MinLength(1, ErrorMessage = "Au moins une opération est requise")]
        public List<CreateOperationRecetteDto> Operations { get; set; } = new();
    }
}
