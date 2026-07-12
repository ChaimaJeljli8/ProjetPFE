using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace planificationCommandesBackend.Domain.Entities
{
    [Table("Recettes")]
    public class Recette
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Le nom de la recette est requis")]
        [StringLength(150)]
        public string NomRecette { get; set; } = string.Empty;

        public ICollection<OperationRecette> Operations { get; set; } = new List<OperationRecette>();

        public ICollection<Commande> Commandes { get; set; } = new List<Commande>();
    }
}