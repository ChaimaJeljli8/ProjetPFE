using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace planificationCommandesBackend.Domain.Entities
{
   
    [Table("Plannings")]
    public class Planning
    {
        [Key]
        public int Id { get; set; }

       
        public DateTime DateGeneration { get; set; } = DateTime.UtcNow;

        
        [StringLength(10)]
        public string DateDebut { get; set; } = string.Empty;

        [StringLength(50)]
        public string Statut { get; set; } = "feasible";

        public int MakespanPM { get; set; }

 
        public int MakespanDays { get; set; }

        public int NombreCommandes { get; set; }

        public int NombreLignes { get; set; }

        public ICollection<PlanningRow> Rows { get; set; } = new List<PlanningRow>();
    }
}