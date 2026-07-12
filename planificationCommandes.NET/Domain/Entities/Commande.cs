using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace planificationCommandesBackend.Domain.Entities
{
    [Table("Commandes")]
    public class Commande
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Le numéro de commande est requis")]
        [StringLength(50)]
        public string NumeroCommande { get; set; } = string.Empty;

        [Required(ErrorMessage = "La date d'export est requise")]
        public DateTime DateExport { get; set; }

        [Required(ErrorMessage = "L'urgence est requise")]
        [Range(1, int.MaxValue, ErrorMessage = "L'urgence doit être un entier positif (≥ 1)")]
        public int Urgence { get; set; }

        [Required(ErrorMessage = "La quantité est requise")]
        [Range(1, 1000000, ErrorMessage = "La quantité doit être entre 1 et 1 000 000")]
        public int Quantite { get; set; }

        [Required(ErrorMessage = "La recette est requise")]
        public int RecetteId { get; set; }

        [ForeignKey(nameof(RecetteId))]
        public Recette? Recette { get; set; }

        [StringLength(50)]
        public string Statut { get; set; } = "En attente";

        public DateTime DateCreation { get; set; } = DateTime.UtcNow;

        public DateTime? DateModification { get; set; }
    }
}