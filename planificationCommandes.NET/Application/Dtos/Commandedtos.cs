using System.ComponentModel.DataAnnotations;

namespace planificationCommandesBackend.Application.Dtos
{

    public class CommandeDto
    {
        public int Id { get; set; }
        public string NumeroCommande { get; set; } = string.Empty;
        public DateTime DateExport { get; set; }

        public int Urgence { get; set; }

        public int Quantite { get; set; }
        public int RecetteId { get; set; }
        public string? NomRecette { get; set; }
        public string Statut { get; set; } = string.Empty;
        public DateTime DateCreation { get; set; }
        public DateTime? DateModification { get; set; }
    }

    public class CreateCommandeDto
    {
        [Required(ErrorMessage = "Le numéro de commande est requis")]
        [StringLength(50)]
        public string NumeroCommande { get; set; } = string.Empty;

        [Required(ErrorMessage = "La date d'export est requise")]
        public DateTime DateExport { get; set; }

        [Required(ErrorMessage = "L'urgence est requise")]
        [Range(1, int.MaxValue, ErrorMessage = "L'urgence doit être un entier positif (≥ 1)")]
        public int Urgence { get; set; }

        [Required(ErrorMessage = "La quantité est requise")]
        [Range(1, 1000000)]
        public int Quantite { get; set; }

        [Required(ErrorMessage = "La recette est requise")]
        public int RecetteId { get; set; }

        [StringLength(50)]
        public string Statut { get; set; } = "En attente";
    }

    public class UpdateCommandeDto
    {
        [Required(ErrorMessage = "Le numéro de commande est requis")]
        [StringLength(50)]
        public string NumeroCommande { get; set; } = string.Empty;

        [Required(ErrorMessage = "La date d'export est requise")]
        public DateTime DateExport { get; set; }

        [Required(ErrorMessage = "L'urgence est requise")]
        [Range(1, int.MaxValue, ErrorMessage = "L'urgence doit être un entier positif (≥ 1)")]
        public int Urgence { get; set; }

        [Required(ErrorMessage = "La quantité est requise")]
        [Range(1, 1000000)]
        public int Quantite { get; set; }

        [Required(ErrorMessage = "La recette est requise")]
        public int RecetteId { get; set; }

        [StringLength(50)]
        public string Statut { get; set; } = "En attente";
    }


    public class ImportCommandeDto
    {
        public string NumeroCommande { get; set; } = string.Empty;
        public DateTime DateExport { get; set; }
        public int Urgence { get; set; }
        public int Quantite { get; set; }


        public string NomRecette { get; set; } = string.Empty;
    }

    public class ImportResultDto
    {
        public int TotalRows { get; set; }
        public int Imported { get; set; }
        public int Skipped { get; set; }
        public List<ImportRowErrorDto> Errors { get; set; } = new();
    }

    public class ImportRowErrorDto
    {
        public int Row { get; set; }
        public string NumeroCommande { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
    }
}