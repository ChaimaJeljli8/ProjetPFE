using planificationCommandesBackend.Domain.Entities;

namespace planificationCommandesBackend.Application.Interfaces.Repositories
{
    public interface ICommandeRepository
    {
        // Implemented by CommandeRepository in Infrastructure.Repositories.
        Task<IEnumerable<Commande>> GetAllAsync();
        Task<Commande?> GetByIdAsync(int id);
        Task<Commande?> GetByNumeroAsync(string numeroCommande);
        Task<IEnumerable<Commande>> SearchAsync(CommandeSearchFilter filter);
        Task<Commande> AddAsync(Commande commande);
        Task<IEnumerable<Commande>> AddRangeAsync(IEnumerable<Commande> commandes);
        Task UpdateAsync(Commande commande);
        Task DeleteAsync(Commande commande);
        Task<bool> ExistsAsync(string numeroCommande, int? excludeId = null);
        Task<CommandeStatistics> GetStatisticsAsync();
    }

    public class CommandeSearchFilter
    {
        public string? Keyword { get; set; }         
        public int? Urgence { get; set; }
        public string? Statut { get; set; }
        public int? RecetteId { get; set; }
        public DateTime? DateExportFrom { get; set; }
        public DateTime? DateExportTo { get; set; }
    }

    public class CommandeStatistics
    {
        public int Total { get; set; }
        public int EnAttente { get; set; }
        public int EnCours { get; set; }
        public int Termines { get; set; }
        public int Annules { get; set; }
        public int HautePriorite { get; set; }
    }
}