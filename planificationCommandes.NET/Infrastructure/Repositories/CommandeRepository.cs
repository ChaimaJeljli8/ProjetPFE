using Microsoft.EntityFrameworkCore;
using planificationCommandesBackend.Application.Interfaces.Repositories;
using planificationCommandesBackend.Domain.Entities;
using planificationCommandesBackend.Infrastructure.Persistence;

namespace planificationCommandesBackend.Infrastructure.Repositories
{
    // Handles all Commande persistence
    public class CommandeRepository : ICommandeRepository
    {
        private readonly AppDbContext _context;

        public CommandeRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Commande>> GetAllAsync()
        {
            return await _context.Commandes
                .Include(c => c.Recette)
                .OrderByDescending(c => c.DateCreation)
                .ToListAsync();
        }

        public async Task<Commande?> GetByIdAsync(int id)
        {
            return await _context.Commandes
                .Include(c => c.Recette)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Commande?> GetByNumeroAsync(string numeroCommande)
        {
            return await _context.Commandes
                .Include(c => c.Recette)
                .FirstOrDefaultAsync(c => c.NumeroCommande.ToLower() == numeroCommande.ToLower());
        }

        public async Task<IEnumerable<Commande>> SearchAsync(CommandeSearchFilter filter)
        {
            var query = _context.Commandes.Include(c => c.Recette).AsQueryable();

            if (!string.IsNullOrWhiteSpace(filter.Keyword))
                query = query.Where(c => c.NumeroCommande.Contains(filter.Keyword));

            if (filter.Urgence.HasValue)
                query = query.Where(c => c.Urgence == filter.Urgence.Value);

            if (!string.IsNullOrWhiteSpace(filter.Statut))
                query = query.Where(c => c.Statut == filter.Statut);

            if (filter.RecetteId.HasValue)
                query = query.Where(c => c.RecetteId == filter.RecetteId.Value);

            if (filter.DateExportFrom.HasValue)
                query = query.Where(c => c.DateExport >= filter.DateExportFrom.Value);

            if (filter.DateExportTo.HasValue)
                query = query.Where(c => c.DateExport <= filter.DateExportTo.Value);

            return await query
                .OrderBy(c => c.Urgence)
                .ThenBy(c => c.DateExport)
                .ToListAsync();
        }

        public async Task<Commande> AddAsync(Commande commande)
        {
            _context.Commandes.Add(commande);
            await _context.SaveChangesAsync();
            return commande;
        }

        public async Task<IEnumerable<Commande>> AddRangeAsync(IEnumerable<Commande> commandes)
        {
            var list = commandes.ToList();
            _context.Commandes.AddRange(list);
            await _context.SaveChangesAsync();
            return list;
        }

        public async Task UpdateAsync(Commande commande)
        {
            _context.Commandes.Update(commande);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Commande commande)
        {
            _context.Commandes.Remove(commande);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsAsync(string numeroCommande, int? excludeId = null)
        {
            var query = _context.Commandes
                .Where(c => c.NumeroCommande.ToLower() == numeroCommande.Trim().ToLower());

            if (excludeId.HasValue)
                query = query.Where(c => c.Id != excludeId.Value);

            return await query.AnyAsync();
        }

        public async Task<CommandeStatistics> GetStatisticsAsync()
        {
            return new CommandeStatistics
            {
                Total = await _context.Commandes.CountAsync(),
                EnAttente = await _context.Commandes.CountAsync(c => c.Statut == "En attente"),
                EnCours = await _context.Commandes.CountAsync(c => c.Statut == "En cours"),
                Termines = await _context.Commandes.CountAsync(c => c.Statut == "Terminé"),
                Annules = await _context.Commandes.CountAsync(c => c.Statut == "Annulé"),
                HautePriorite = await _context.Commandes.CountAsync(c => c.Urgence == 1)
            };
        }
    }
}